// import { MasterchatError } from 'masterchat'
import {
  deleteRelayHistory,
  filterAndStringifyHistory,
  getAllRelayHistories,
  getSettings,
} from '../../core/db/functions'
import {RelayedComment} from '../../core/db/models/RelayedComment'
import {debug, isNotNil, log} from '../../helpers'
import {findTextChannel, send} from '../../helpers/discord'
import {DexFrame, getFrameList, getStartTime, VideoId} from '../holodex/frames'
import {deleteChatProcess} from './chatProcesses'
import {findFrameThread, /* setupRelay */} from './chatRelayer'

export async function retryIfStillUpThenPostLog(
  frame: DexFrame,
  errorCode?: string,
): Promise<void> {
  const allFrames = await getFrameList()
  const isStillOn = <boolean>allFrames?.some((frame_) => frame_.id === frame.id)
  const isMembersOnly = errorCode === 'membersOnly'
  const isDisabled = errorCode === 'disabled'

  deleteChatProcess(frame.id)
  if (retries[frame.id]?.[1] === 'upcoming' && frame.status === 'live') delete retries[frame.id]
  retries[frame.id] = [(retries[frame.id]?.[0] ?? 0) + 1, frame.status]
  setTimeout(() => delete retries[frame.id], 600000)
  if (isStillOn && retries[frame.id]?.[0] <= 15 && !isMembersOnly && !isDisabled && errorCode) {
    debug(`masterchat exited on ${frame.id}, trying to reconnect in 5s`)
    //setTimeout(() => setupRelay(frame), 2000)
  } else {
    if (errorCode) log(`${frame.status} ${frame.id} closed with mc error code: ${errorCode}`)
    else log(`${frame.status} ${frame.id} closed with unrecognized error.`)
    delete retries[frame.id]
    sendAndForgetHistory(frame.id)
  }
}

////////////////////////////////////////////////////////////////////////////////

const retries: Record<VideoId, [number, string]> = {}

export async function sendAndForgetHistory(videoId: VideoId): Promise<void> {
  const relevantHistories = (await getAllRelayHistories())
    .map((history) => history.get(videoId))
    .filter(isNotNil)

  relevantHistories.forEach(async (history: RelayedComment[], gid) => {
    const g = getSettings(gid)
    const setCh = findTextChannel(g.logChannel)
    const ch = findTextChannel(history[0].discordCh!)
    const thread = await findFrameThread(videoId, g, ch)
    const start = await getStartTime(videoId)
    const tlLog = filterAndStringifyHistory(gid, history, start)

    deleteRelayHistory(videoId, gid)
    send(setCh ?? thread ?? ch, {
      content: `Here is this stream's TL log. <https://youtu.be/${videoId}>`,
      files: [{attachment: Buffer.from(tlLog), name: `${videoId}.txt`}],
    })
  })
}
