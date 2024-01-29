import {DexFrame, isPublic, VideoId, YouTubeChannelId} from '../holodex/frames'
import {findTextChannel, send} from '../../helpers/discord'
import {Snowflake, TextChannel, ThreadChannel} from 'discord.js'
import {
  addToBotRelayHistory,
  addToGuildRelayHistory,
  getAllSettings,
  getGuildData,
  getSubbedGuilds,
} from '../../core/db/functions'
import {GuildSettings, WatchFeature, WatchFeatureSettings} from '../../core/db/models'
import {retryIfStillUpThenPostLog, sendAndForgetHistory} from './closeHandler'
import {logCommentData} from './logging'
import {frameEmitter} from '../holodex/frameEmitter'
import {isMainThread} from 'worker_threads'
import {processComments, Task, toChatComments} from './chatRelayerWorker'
import {io} from 'socket.io-client'
import {debug, log} from '../../helpers'

import {Masterchat, MasterchatError} from 'masterchat'
import {lessThanOneHourStartDifference} from "./chatProcesses";
// const Piscina = require('piscina')

// const piscina = new Piscina({
// filename: resolve(__dirname, 'chatRelayerWorker.js'),
// useAtomics: false,
// idleTimeout: 99999999,
// })

if (isMainThread)
  frameEmitter.on('frame', (frame: DexFrame) => {
    if (isPublic(frame)) {
      if (getSubbedGuilds(frame.channel.id, 'relay').length === 0) return
      if (frame.status === 'live' || frame.status === "upcoming" && isPublic(frame)) {
        setupRelayMasterchat(frame, true)
        // setupLive(frame, true)
      } else {
        //setupRelay(frame)
        log(`${frame.id} is upcoming, not relaying`)
      }
    }
  })

const masterchats: Record<VideoId, any> = {} // Figure out why MessagePort type broken

// export async function setupRelay(frame: DexFrame): Promise<void> {
// const { port1, port2 } = new MessageChannel()

// masterchats[frame.id] = port2

// piscina.run({ port: port1, frame, allEntries }, { transferList: [port1] })

// port2.on('message', runTask)
// }

// TODO: ensure no race condition getting live frames on startup
const framesAwaitingSub: Record<VideoId, DexFrame> = {}
const activeSubs: Set<VideoId> = new Set()
const activeRelays: Set<VideoId> = new Set()

const tldex = io('wss://holodex.net', {
  path: '/api/socket.io/',
  transports: ['websocket'],
})

tldex.on('connect_error', (err) => debug(err))

// resubscribe on server restart
tldex.on('connect', () => {
  activeSubs.forEach((sub) => {
    tldex.emit('subscribe', {video_id: sub, lang: 'en'})
  })
})

tldex.on('subscribeSuccess', (msg) => {
  delete framesAwaitingSub[msg.id]
  activeSubs.add(msg.id)
  if (masterchats[msg.id]) {
    masterchats[msg.id].postMessage({
      _tag: 'FrameUpdate',
      status: 'live',
    })
    return
  }
})

tldex.on('subscribeError', (msg) => {
  retries[msg.id] = (retries[msg.id] ?? 0) + 1
  if (retries[msg.id] < 5) {
    setTimeout(() => setupLive(framesAwaitingSub[msg.id], false), 30000)
  } else {
    delete retries[msg.id]
  }
})

tldex.onAny((evtName, ...args) => {
  // if (!evtName.includes ('/en') && evtName !== 'subscribeSuccess') {
  // debug(evtName + ': ' + JSON.stringify(args))
  // }
})

const retries: Record<VideoId, number> = {}

function setupLive(frame: DexFrame, postLog: boolean) {
  if (frame == null) return
  if (postLog && lessThanOneHourStartDifference(frame.start_scheduled, Date.now())) debug(`setting up ${frame.status} ${frame.id} ${frame.title}`)
  framesAwaitingSub[frame.id] = frame
  tldex.emit('subscribe', {video_id: frame.id, lang: 'en'})
  ;(tldex as any).removeAllListeners?.(`${frame.id}/en`)
  if (activeRelays.has(frame.id)) activeRelays.delete(frame.id)
  tldex.on(`${frame.id}/en`, async (msg) => {
    if (frame.status !== "live") return
    if (msg.name) {
      const cmt: ChatComment = {
        id: msg.channel_id ?? 'MChad-' + msg.name,
        name: msg.name,
        body: msg.message.replace(/:http\S+( |$)/g, ':'),
        time: msg.timestamp,
        isMod: msg.is_moderator,
        isOwner: msg.channel_id === frame.channel.id,
        isTl: msg.is_tl || msg.source === 'MChad',
        isV: msg.is_vtuber,
      }
      const tasks = await processComments(frame, [cmt], allEntries)
      tasks.forEach(runTask)
    } else if (msg.type === 'end') {
      activeSubs.delete(frame.id)
      sendAndForgetHistory(frame.id)
    }
  })
}

function setupRelayMasterchat(frame: DexFrame, postLog: boolean) {
  if (frame == null) return;
  if (postLog && lessThanOneHourStartDifference(frame.start_scheduled, Date.now()) && !activeRelays.has(frame.id)) debug(`setting up relay`)
  framesAwaitingSub[frame.id] = frame
  tldex.emit('subscribe', {video_id: frame.id, lang: 'en'})
  ;(tldex as any).removeAllListeners?.(`${frame.id}/en`)
  const chat = new Masterchat(frame.id, frame.channel.id, {mode: "live"})
  // @ts-ignore
  chat.on("chats", async (chats) => {
    if (activeRelays.has(frame.id)) {
      const cmtTasks = await processComments(frame, toChatComments(chats), allEntries)
      cmtTasks.forEach(runTask)
    } else chat.stop()
  })

  // @ts-ignore
  chat.on("error", (err) => {
    if (err instanceof MasterchatError) {
      if (err.code === "membersOnly") log(`${frame.id} is a members only stream. Cannot relay chat messages. Channel: ${frame.channel.name}`)
      else if (err.code === "disabled") log(`Stream chat disabled for video ID ${frame.id} by ${frame.channel.name}`)
      else console.log(`Error detected; ${err.code} Code ${err.stack}`)
    }
  })

  chat.on("end", () => {
    console.log("Ending prechat-relay")
  })

  if (lessThanOneHourStartDifference(frame.start_scheduled, Date.now())) {
    if (frame.status === "live") {
      chat.stop()
      activeRelays.delete(frame.id)
      log(`Stream has started, using TLDex relays for ${frame.id}`)
      setupLive(frame, true)
      return;
    }
    if (!activeRelays.has(frame.id)) {
      log(`Stream ${frame.id} by ${frame.channel.name} is starting in less than 24 hours, setting up relay.`)
      activeRelays.add(frame.id)
      chat.listen({ignoreFirstResponse: true})
    }
  }
}

export interface ChatComment {
  id: string
  name: string
  body: string
  time: number
  isMod: boolean
  isOwner: boolean
  isTl?: boolean
  isV?: boolean
}

export type Entry = [GuildSettings, Blacklist, WatchFeature, WatchFeatureSettings]
export type Entries = Entry[]
export type Blacklist = Set<YouTubeChannelId>

///////////////////////////////////////////////////////////////////////////////

const features: WatchFeature[] = ['relay', 'cameos', 'gossip']
let allEntries: [GuildSettings, Blacklist, WatchFeature, WatchFeatureSettings][] = []

async function updateEntries() {
  const guilds = getAllSettings()
  allEntries = guilds.flatMap((g) =>
    features.flatMap((f) =>
      g[f].map((e) => {
        const bl = new Set(g.blacklist.map((i) => i.ytId))
        return [g, bl, f, e] as Entry
      }),
    ),
  )

  Object.values(masterchats).forEach((port) =>
    port.postMessage({
      _tag: 'EntryUpdate',
      entries: allEntries,
    }),
  )
}

setInterval(updateEntries, 10000)

updateEntries()

async function runTask(task: Task): Promise<void> {
  if (task._tag === 'EndTask') {
    delete masterchats[task.frame.id]
    if (!task.wentLive) retryIfStillUpThenPostLog(task.frame, task.errorCode)
  }
  if (task._tag === 'LogCommentTask') logCommentData(task.cmt, task.frame, task.streamer)
  if (task._tag === 'SaveMessageTask') saveComment(task.comment, task.frame, task.type, task.msgId, task.chId)
  if (task._tag === 'SendMessageTask') {
    const ch = findTextChannel(task.cid)
    const thread = task.tlRelay ? await findFrameThread(task.vId, task.g) : null

    log(`[SENDING MESSAGE] ${task.vId} | ${task.content}`);
    send(thread ?? ch, task.content).then((msg) => {
      if (task.save && msg) {
        saveComment(task.save.comment, task.save.frame, 'guild', msg.id, msg.channelId, task.g._id)
      }
    })
  }
}

export async function findFrameThread(
  videoId: VideoId,
  g: GuildSettings,
  channel?: TextChannel | ThreadChannel,
): Promise<ThreadChannel | undefined> {
  const gdata = await getGuildData(g._id)
  const notice = gdata.relayNotices.get(videoId)
  const validch = channel as TextChannel
  if (g.threads) return validch?.threads?.cache.find((thr) => thr.id === notice)
}

function saveComment(
  cmt: ChatComment,
  frame: DexFrame,
  type: 'guild' | 'bot',
  msgId?: Snowflake,
  chId?: Snowflake,
  gid?: Snowflake,
): void {
  const addFn = type === 'guild' ? addToGuildRelayHistory : addToBotRelayHistory
  const startTime = new Date(Date.parse(frame.start_actual ?? '')).valueOf()
  const loggedTime = new Date(+cmt.time).valueOf()
  const timestamp = !frame.start_actual
    ? 'prechat'
    : new Date(loggedTime - startTime).toISOString().substr(11, 8)
  addFn(
    frame.id,
    {
      msgId: msgId,
      discordCh: chId,
      body: cmt.body,
      ytId: cmt.id,
      author: cmt.name,
      timestamp,
      stream: frame.id,
      absoluteTime: cmt.time,
    },
    gid!,
  )
}