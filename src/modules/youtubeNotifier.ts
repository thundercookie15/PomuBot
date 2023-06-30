import {addNotifiedLive, addNotifiedPrechats, getNotifiedLives, getNotifiedPrechats} from '../core/db/functions'
import {Streamer, streamers} from '../core/db/streamers'
import {log} from '../helpers'
import {emoji} from '../helpers/discord'
import {notifyDiscord, NotifyOptions} from './notify'
import {frameEmitter} from './holodex/frameEmitter'
import {DexFrame, isPublic} from './holodex/frames'
import {isMainThread} from 'worker_threads'
import {stripIndent} from 'common-tags'
import {lessThanOneHourStartDifference} from "./livechat/chatProcesses";

if (isMainThread) frameEmitter.on('frame', notifyFrame)

async function notifyFrame(frame: DexFrame): Promise<void> {
  const streamer = streamers.find((s) => s.ytId === frame.channel.id)
  const isRecorded = getNotifiedLives().includes(frame.id)
  const isRecordedPreChat = getNotifiedPrechats().includes(frame.id)
  const isNew = streamer && !isRecorded && isPublic(frame)
  const isNewPrechat = streamer && !isRecordedPreChat && isPublic(frame)
  const mustNotify = isNew && frame.status === 'live'
  const mustNotifyPreChat = isNewPrechat && frame.status === 'upcoming' && lessThanOneHourStartDifference(frame.start_scheduled, Date.now())

  // TODO comment when pushing to live version
  // if (isNew || isNewPrechat) log(`${frame.status} | ${frame.id} | ${streamer!.name}`)

  if (mustNotifyPreChat) {
    notifyDiscord(getPreRelayNotifyProps(frame))

    addNotifiedPrechats(frame.id)
  }

  if (mustNotify) {
    notifyDiscord({
      feature: 'youtube',
      streamer: streamer as Streamer,
      embedBody: `I am live on YouTube!\nhttps://youtu.be/${frame.id}`,
      emoji: emoji.yt,
      avatarUrl: frame.channel.photo,
      nonEmbedText: `https://youtu.be/${frame.id}`,
    })

    notifyDiscord(getRelayNotifyProps(frame))

    addNotifiedLive(frame.id)
  }
}

export function getPreRelayNotifyProps(frame: DexFrame): NotifyOptions {
  return {
    feature: 'relay',
    streamer: streamers.find((s) => s.ytId === frame.channel.id)!,
    embedBody: stripIndent`
      I will now relay prechat messages.
      ${frame.title}
      https://youtu.be/${frame.id}
    `,
    prechat: true,
    emoji: emoji.niji,
    videoId: frame.id,
    avatarUrl: frame.channel.photo,
    credits: false,
  }
}

export function getRelayNotifyProps(frame: DexFrame): NotifyOptions {
  return {
    feature: 'relay',
    streamer: streamers.find((s) => s.ytId === frame.channel.id)!,
    embedBody: stripIndent`
      I will now relay translations from live translators.
      ${frame.title}
      https://youtu.be/${frame.id}
    `,
    emoji: emoji.niji,
    videoId: frame.id,
    avatarUrl: frame.channel.photo,
    credits: true,
  }
}
