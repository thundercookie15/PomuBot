/** @file Exports main streamer list and streamer-related utility functions */
import {CommandInteraction} from 'discord.js'
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
export const streamerGroups = ['Hololive', 'Nijisanji', "Nijisanji EN", 'Nijisanji ID', 'Nijisanji KR', 'Nijisanji JP', 'Indies', 'Idol', 'VShojo', 'Phase Connect', 'Prism Project'] as const
export const streamersMap: Map<YouTubeChannelId, Streamer> = new Map(
  streamers.map((s) => [s.ytId, s]),
)

// TODO make this pretty
function getStreamerArrayByGroup(group: string) {
  if (group === 'Hololive') return hololive
  if (group === 'Nijisanji') return [nijisanji, nijisanji_id, nijisanji_jp, nijisanji_kr].flat()
  if (group === 'Nijisanji EN') return nijisanji
  if (group === 'Nijisanji ID') return nijisanji_id
  if (group === 'Nijisanji KR') return nijisanji_kr
  if (group === 'Nijisanji JP') return nijisanji_jp
  if (group === 'Independent') return indies
  if (group === 'Idol') return IdolComp
  if (group === 'VShojo') return vshojo
  if (group === 'Phase Connect') return phase_connect
  if (group === 'Prism Project') return prism_project
}

export const streamersYtIdSet: Set<YouTubeChannelId> = new Set(streamers.map((s) => s.ytId))

export const names = streamers.map((x) => x.name)
export const twitters = streamers.map((x) => x.twitter)
export type StreamerName = typeof names[number] | 'all'
export type StreamerTwitter = typeof twitters[number]

function isIN<T>(values: readonly T[], x: any): x is T {
  return values.includes(x)
}

export function getStreamerList(group: string): string {
  const streamerThing = getStreamerArrayByGroup(group)
  return streamerThing!.map((x) => x.name).join(', ')
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
      title: 'Supported Streamer Groups',
      description: streamerGroups.join('\n'),
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
