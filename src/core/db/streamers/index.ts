/** @file Exports main streamer list and streamer-related utility functions */
import {CommandInteraction} from 'discord.js'
import {ciEquals} from '../../../helpers'
import {createEmbed, reply} from '../../../helpers/discord'
import {YouTubeChannelId} from '../../../modules/holodex/frames'
import {ValidatedOptions} from '../functions'
import {hololive} from './hololive'
import {indies} from './indies'
import {nijisanji_en} from './nijisanjiEN'
import {nijisanji_id} from './nijisanjiID'
import {nijisanji_jp} from './nijisanjiJP'
import {nijisanji_kr} from './nijisanjiKR'
import {IdolComp} from './IdolComp'
import {vshojo} from './vshojo'
import {phase_connect} from './phaseconnect'
import {prism_project} from "./prismproject";
import {official_channels} from "./officialChannels";
import {vreverie} from "./vreverie";
import {eien} from "./eien";

export const streamers = StreamerArray([...eien, ...nijisanji_en, ...nijisanji_id, ...nijisanji_kr, ...nijisanji_jp, ...hololive, ...IdolComp, ...indies, ...official_channels, ...phase_connect, ...prism_project, ...vshojo, ...vreverie] as const)
export const streamerGroups = ['EIEN', 'Hololive', 'Nijisanji', "Nijisanji EN", 'Nijisanji ID', 'Nijisanji KR', 'Nijisanji JP', 'Indies', 'Idol', 'Official Channels', 'VShojo', 'Phase Connect', 'Prism Project', 'VReverie'] as const
export const streamersMap: Map<YouTubeChannelId, Streamer> = new Map(
  streamers.map((s) => [s.ytId, s]),
)

// TODO make this pretty
function getStreamerArrayByGroup(group: string) {
  switch (group) {
    case 'EIEN':
      return eien
    case 'Hololive':
      return hololive
    case 'Nijisanji':
      return [nijisanji_en, nijisanji_id, nijisanji_jp, nijisanji_kr].flat()
    case 'Nijisanji EN':
      return nijisanji_en
    case 'Nijisanji ID':
      return nijisanji_id
    case 'Nijisanji KR':
      return nijisanji_kr
    case 'Nijisanji JP':
      return nijisanji_jp
    case 'Independent':
      return indies
    case 'Idol':
      return IdolComp
    case 'Official Channels':
      return official_channels
    case 'VShojo':
      return vshojo
    case 'Phase Connect':
      return phase_connect
    case 'Prism Project':
      return prism_project
    case 'VReverie':
      return vreverie
  }
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
  return streamers.find((x) => x.name === streamer)?.twitter ?? ''
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
