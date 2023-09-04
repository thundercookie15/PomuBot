import {ciEquals, doNothing, isJp, match} from '../../helpers'
import {DexFrame} from '../holodex/frames'
import {Streamer, StreamerName, streamers, streamersMap} from '../../core/db/streamers'
import {emoji} from '../../helpers/discord'
import {Snowflake} from 'discord.js'
import {isBlacklistedOrUnwanted, isHoloID, isStreamer, isTl} from './commentBooleans'
import {GuildSettings, WatchFeatureSettings} from '../../core/db/models'
import {Blacklist, ChatComment, Entries} from './chatRelayer'
import {AddChatItemAction, Masterchat, MasterchatError, runsToString} from 'masterchat'
import {tl} from "../deepl";

export default (input: ChatWorkerInput): void => {
  allEntries = input.allEntries
  let wentLive = false
  input.port.on('message', (msg: any) => {
    // TODO: refine any
    if (msg._tag === 'EntryUpdate') {
      allEntries = msg.entries
    }
    if (msg._tag === 'FrameUpdate') {
      // TODO: don't mutate input
      if (msg.status === 'live') {
        wentLive = true
        chat.stop()
        input.port.postMessage({_tag: 'EndTask', frame: input.frame, wentLive})
      }
      input.frame.status = msg.status
    }
  })
  if (input.frame.status === 'live') return
  const chat = new Masterchat(input.frame.id, input.frame.channel.id, {mode: 'live'})

  // @ts-ignore
  chat.on('chats', async (chats) => {
    const cmtTasks = await processComments(input.frame, toChatComments(chats))
    cmtTasks.forEach((task) => input.port.postMessage(task))
  })

  // @ts-ignore
  chat.on('error', (err) =>
    input.port.postMessage({
      _tag: 'EndTask',
      frame: input.frame,
      errorCode: err instanceof MasterchatError ? err.code : undefined,
    }),
  )

  chat.on('end', () => {
    input.port.postMessage({
      _tag: 'EndTask',
      frame: input.frame,
      wentLive,
    })
  })

  chat.listen({ignoreFirstResponse: true})
}

interface ChatWorkerInput {
  port: any // figure out why MessagePort type is broken
  frame: DexFrame
  allEntries: Entries
}

interface LogCommentTask {
  _tag: 'LogCommentTask'
  cmt: ChatComment
  frame: DexFrame
  streamer?: Streamer
}

interface SendMessageTask {
  _tag: 'SendMessageTask'
  cid: Snowflake
  content: string
  tlRelay: boolean
  vId: string
  g: GuildSettings
  save?: Omit<SaveMessageTask, '_tag' | 'type'>
}

interface SaveMessageTask {
  _tag: 'SaveMessageTask'
  comment: ChatComment
  frame: DexFrame
  type: 'guild' | 'bot'
  msgId?: Snowflake
  chId?: Snowflake
}

interface EndTask {
  _tag: 'EndTask'
  frame: DexFrame
  errorCode?: string
  wentLive?: boolean
}

export type Task = SendMessageTask | SaveMessageTask | LogCommentTask | EndTask

///////////////////////////////////////////////////////////////////////////////

let allEntries: Entries = []

export function toChatComments(chats: AddChatItemAction[]): ChatComment[] {
  // @ts-ignore
  return chats.map((chat) => ({
    id: chat.authorChannelId,
    name: chat.authorName,
    body: runsToString(chat.message!, {spaces: true}),
    time: chat.timestamp.getTime(),
    isMod: chat.isModerator,
    isOwner: chat.isOwner,
  }))
}

export async function processComments(
  frame: DexFrame,
  cmts: ChatComment[],
  entrs?: Entries,
): Promise<Task[]> {
  const tasks = await Promise.all(
    cmts.flatMap(async (cmt) => {
      const isTl_ = cmt.isTl || isTl(cmt.body)
      const isStreamer_ = cmt.isV || isStreamer(cmt.id)
      const streamer = streamersMap.get(frame.channel.id)
      const author = streamersMap.get(cmt.id)
      const isCameo = isStreamer_ && !cmt.isOwner

      const entries = (entrs ?? allEntries).filter(
        ([{}, {}, f, e]) =>
          [(f === 'cameos' ? author : streamer)?.name, 'all'].includes(e.streamer) ||
          f === 'gossip',
      )
      const mustDeepL = (isStreamer_ && !isHoloID(streamer)) && entries.length > 0

      const deepLTl = mustDeepL ? await tl(cmt.body, 'EN') : undefined
      const mustShowTl = mustDeepL && deepLTl !== cmt.body
      const maybeGossip = isStreamer_ || isTl_

      const mustSave = isTl_ || isStreamer_ || cmt.isMod

      const saveTask: SaveMessageTask = {
        _tag: 'SaveMessageTask',
        comment: cmt,
        frame,
        type: 'bot',
      }

      let mustSave_ = mustSave
      const sendTasks = entries
        .map(([g, bl, f, e]) => {
          const getTask = match(f, {
            cameos: isCameo ? relayCameo : doNothing,
            gossip: maybeGossip ? relayGossip : doNothing,
            relay: relayMessage,
          })

          ///////////////////////////////////////////////////////////////////////////////
          // fix for blacklisting gossip tls
          const stalked = streamers.find((s) => s.name === e.streamer)
          const isGoss = stalked && isGossip(cmt, stalked, frame)
          if (isGoss) {
            mustSave_ = true
          }
          ///////////////////////////////////////////////////////////////////////////////


          return getTask({
            e,
            bl,
            cmt,
            frame,
            g,
            discordCh: e.discordCh,
            deepLTl: mustShowTl ? deepLTl : undefined,
            to: streamer?.name ?? 'Discord',
          })
        })
        .filter((x) => x !== undefined) as Task[]

      return [...sendTasks, ...(mustSave_ ? [saveTask] : [])]
    }),
  )

  return tasks.flat()
}

function relayCameo({
                      discordCh,
                      to,
                      cmt,
                      deepLTl,
                      frame,
                      g,
                      bl
                    }: RelayData, isGossip?: boolean,): SendMessageTask | undefined {
  const cleaned = cmt.body.replaceAll('`', "'")
  const stalked = streamers.find((s) => s.ytId === cmt.id)
  const groups = stalked?.groups as string[] | undefined
  const camEmj = getAgencyEmote(groups)
  const emj = isGossip ? emoji.peek : camEmj
  const mustTl = deepLTl && g.deepl
  const line1 = `${emj} **${cmt.name}** in [**${to}**'s chat](<https://youtu.be/${frame.id}>): \`${cleaned}\``
  const line2 = mustTl ? `\n${emoji.deepl}**DeepL:** \`${deepLTl}\`` : ''
  const mustPost = !isBlacklistedOrUnwanted(cmt, g, bl)
  return mustPost ? {
    _tag: 'SendMessageTask',
    cid: discordCh,
    content: line1 + line2,
    tlRelay: false,
    vId: frame.id,
    g: g,
    save: {
      comment: cmt,
      frame,
    }
  } : undefined
}

function relayGossip(data: RelayData): SendMessageTask | undefined {
  const stalked = streamers.find((s) => s.name === data.e.streamer)
  return stalked && isGossip(data.cmt, stalked, data.frame) ? relayCameo(data, true) : undefined
}

function relayMessage({discordCh, bl, deepLTl, cmt, g, frame}: RelayData): Task | undefined {
  const isATl = cmt.isTl || isTl(cmt.body, g)
  const prechat = frame.status === 'upcoming'
  const commons =
    cmt.isOwner ||
    (isATl && !isBlacklistedOrUnwanted(cmt, g, bl)) ||
    isStreamer(cmt.id) ||
    (cmt.isMod && g.modMessages && !isBlacklistedOrUnwanted(cmt, g, bl));

  const mustPost = prechat ? (commons && g.prechat) : commons;

  const {premoji, url, author, text, tl} = extracted(cmt, isATl, deepLTl, g, frame);

  return mustPost
    ? {
      _tag: 'SendMessageTask',
      vId: frame.id,
      g,
      tlRelay: true,
      cid: discordCh,
      content: `${prechat ? emoji.prechat + ' ' : ''}${premoji} ${author} \`${text}\`${tl}${url}`,
      save: {
        comment: cmt,
        frame,
      },
    }
    : undefined
}

function isOnlyStreamerRelayedMultipleTimes(g: GuildSettings, streamer: string): boolean {
  const relays = g.relay
  return relays.filter((r) => r.streamer === streamer).length > 1 && relays.every((r) => r.streamer === streamer)
}

function extracted(cmt: ChatComment, isATl: boolean, deepLTl: string | undefined, g: GuildSettings, frame: DexFrame) {
  const vauthor = streamersMap.get(cmt.id)
  const groups = vauthor?.groups as string[] | undefined
  const vemoji = getAgencyEmote(groups)
  const premoji = isATl ? ':speech_balloon:' : isStreamer(cmt.id) ? vemoji : ':tools:'

  let url = '';

  if (!cmt.isOwner && g.relay.length > 1 && !isOnlyStreamerRelayedMultipleTimes(g, streamersMap.get(frame.channel.id)!.name) && g.showChat) {
    url = `\n**Chat:** [${frame.channel.name}](https://youtu.be/${frame.id})`;
  }

  const author = isATl ? `||${cmt.name}:||` : `**${cmt.name}:**`
  const text = cmt.body.replaceAll('`', "''")
  const tl = deepLTl && g.deepl ? `\n${emoji.deepl}**DeepL:** \`${deepLTl}\`` : ''
  return {premoji, url, author, text, tl};
}

function isGossip(cmt: ChatComment, stalked: Streamer, frame: DexFrame): boolean {
  const isOwnChannel = frame.channel.id === stalked.ytId
  const isCollab = [stalked.twitter, stalked.ytId, stalked.name, stalked.chName].some((str) =>
    frame.description.includes(str),
  )
  const mentionsWatched =
    cmt.body
      .replace(/[,()]|'s/g, '')
      .replaceAll('-', ' ')
      .split(' ')
      .some((w) => stalked.aliases.some((a) => ciEquals(a, w))) ||
    stalked.aliases.some((a) => isJp(a) && cmt.body.includes(a))

  return !isOwnChannel && !isCollab && mentionsWatched && cmt.id !== stalked.ytId
}

function getAgencyEmote(groups: string[] | undefined): string {
  return groups?.includes('Nijisanji EN') ? emoji.nijien :
    groups?.includes('Nijisanji') ? emoji.niji :
      groups?.includes('Hololive') ? emoji.holo :
        groups?.includes('Idol') ? emoji.idol :
          groups?.includes('VShojo') ? emoji.vshojo :
            groups?.includes('Phase Connect') ? emoji.phaseconnect :
              groups?.includes('PRISM Project') ? emoji.prism : emoji.Speaker
}

interface RelayData {
  discordCh: Snowflake
  deepLTl?: string
  bl: Blacklist
  cmt: ChatComment
  g: GuildSettings
  frame: DexFrame
  to: StreamerName
  e: WatchFeatureSettings
}
