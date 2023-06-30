import {GuildSettings} from '../../core/db/models'
import {Streamer, streamers, streamersYtIdSet} from '../../core/db/streamers'
import {YouTubeChannelId} from '../holodex/frames'
import {Blacklist, ChatComment} from './chatRelayer'

const tlPatterns: RegExp[] = [
  /[\S]+ tl[:)\]\】\］]/i, // stuff like 'rough tl)'
  /([(\[/\［\【]|^)(tl|eng?)[\]):\】\］]/i, // (eng?/tl]:
  /^[\[(](eng?|tl)/i, // TLs who forget closing bracket
]

const holoID: Set<YouTubeChannelId> = new Set(
  streamers.filter((s) => s.groups.some((g) => g.includes('Indonesia'))).map((s) => s.ytId),
)

export function isTl(cmt: string, g?: GuildSettings): boolean {
  return tlPatterns.some((pattern) => pattern.test(cmt)) || (g !== undefined && isWanted(cmt, g))
}

export function isWanted(cmt: string, g: GuildSettings): boolean {
  return g.customWantedPatterns.some((pattern) =>
    cmt.toLowerCase().startsWith(pattern.toLowerCase()),
  )
}

export function isBlacklistedOrUnwanted(
  cmt: ChatComment,
  g: GuildSettings,
  bl: Blacklist,
): boolean {
  return bl.has(cmt.id) || isUnwanted(cmt.body, g)
}

export function isUnwanted(cmt: string, g: GuildSettings): boolean {
  return g.customBannedPatterns.some((pattern) => cmt.toLowerCase().includes(pattern.toLowerCase()))
}

export function isBlacklisted(ytId: string, g: GuildSettings): boolean {
  return g.blacklist.map((x) => x.ytId).includes(ytId)
}

export function isHoloID(streamer?: Streamer): boolean {
  return !!streamer && holoID.has(streamer.ytId)
}

export function isStreamer(ytId: string): boolean {
  return streamersYtIdSet.has(ytId)
}
