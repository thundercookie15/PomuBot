/** @file Exports main streamer list and streamer-related utility functions */
import {CommandInteraction, Message} from 'discord.js'
import {ciEquals} from '../../../helpers'
import {createEmbed, reply} from '../../../helpers/discord'
import {YouTubeChannelId} from '../../../modules/holodex/frames'
import {ValidatedOptions} from '../functions'
import {hololive} from './hololive'
import {indies} from './indies'
import {nijisanji} from './nijisanji'
import {nijisanji_id} from './nijisanji id'
import {nijisanji_jp} from './nijisanji jp'
import {nijisanji_kr} from './nijisanji kr'
import {IdolComp} from './IdolComp'
import {vshojo} from './vshojo'
import {phase_connect} from './phaseconnect'
import {prism_project} from "./prismproject";

export const streamers = StreamerArray([...nijisanji, ...nijisanji_id, ...nijisanji_kr, ...nijisanji_jp, ...hololive, ...IdolComp, ...indies, ...phase_connect, ...prism_project, ...vshojo] as const)

export const streamersMap: Map<YouTubeChannelId, Streamer> = new Map(
  streamers.map((s) => [s.ytId, s]),
)

export const streamersYtIdSet: Set<YouTubeChannelId> = new Set(streamers.map((s) => s.ytId))

export const names = streamers.map((x) => x.name)
export const twitters = streamers.map((x) => x.twitter)
export type StreamerName = typeof names[number] | 'all'
export type StreamerTwitter = typeof twitters[number]

export function getStreamerList(): string {
  return streamers.map((streamer) => streamer.name).join(', ')
}

export function findStreamerName(name: string): StreamerName | undefined {
  const bySubname = streamers.find((s) => s.name.split(' ').some((word) => ciEquals(word, name)))
  const byFullName = streamers.find((s) => s.name === name)
  const byAlias = streamers.find((s) =>
    s.aliases?.some((a) => (typeof a === 'string' ? ciEquals(a, name) : name.match(a))),
  )
  const streamer = bySubname ?? byFullName ?? byAlias

  return name === 'all' ? 'all' : streamer?.name
}

export function getTwitterUsername(streamer: StreamerName): StreamerTwitter {
  return streamers.find((x) => x.name === streamer)?.twitter ?? 'discord'
}

export function replyStreamerList(x: CommandInteraction | ValidatedOptions): void {
  const msg = x instanceof CommandInteraction ? x : x.intr
  reply(
    msg,
    createEmbed({
      title: 'Supported channels',
      description: getStreamerList(),
    }),
  )
}

export function isSupported(ytId: string): boolean {
  return streamers.some((streamer) => streamer.ytId === ytId)
}

export type Streamer = Readonly<{
  aliases: readonly string[]
  groups: readonly string[]
  name: string
  picture: string
  twitter: string
  ytId: string
  chName: string
}>

//////////////////////////////////////////////////////////////////////////////

/**
 * This constrained identity function validates array without typing it
 * so that we may use 'as const' on the array
 **/
function StreamerArray<T extends readonly Streamer[]>(arr: T) {
  return arr
}

// type stringOrRegex = string | RegExp
