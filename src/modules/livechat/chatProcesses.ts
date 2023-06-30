import {Masterchat} from 'masterchat'
import {VideoId} from '../holodex/frames'

/** Returns a singleton of the chat process for a given video ID */
export function getChatProcess(videoId: VideoId, channelId: string): ChatProcess {
  return (chatProcesses[videoId] ??= new Masterchat(videoId, channelId, {mode: 'live'}))
}

export function chatProcessExists(videoId: VideoId): boolean {
  return chatProcesses[videoId] != undefined
}

export function deleteChatProcess(videoId: VideoId): void {
  delete chatProcesses[videoId]
}

export function lessThanOneHourStartDifference(scheduled: string, now: number) {
  return new Date(new Date(scheduled).valueOf() - now.valueOf()).valueOf() < 3600000 * 24
}

///////////////////////////////////////////////////////////////////////////////

type ChatProcess = Masterchat

const chatProcesses: Record<VideoId, ChatProcess> = {}
