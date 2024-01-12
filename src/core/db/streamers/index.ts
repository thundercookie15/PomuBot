/** @file Exports main streamer list and streamer-related utility functions */
import {CommandInteraction} from 'discord.js'
import {ciEquals} from '../../../helpers'
import {createEmbed, reply} from '../../../helpers/discord'
import {YouTubeChannelId} from '../../../modules/holodex/frames'
import {ValidatedOptions} from '../functions'
import {hololive_jp} from './hololiveJP'
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
import {pixellink} from "./pixellink";
import {hololive_en} from "./hololiveEN";
import {hololive_id} from "./hololiveID";
import {holostars} from "./holostars";

export const streamers = StreamerArray([...eien, ...nijisanji_en, ...nijisanji_id, ...nijisanji_kr, ...nijisanji_jp, ...hololive_en, ...hololive_id, ...hololive_jp, ...holostars, ...IdolComp, ...indies, ...official_channels, ...phase_connect, ...prism_project, ...vshojo, ...vreverie, ...pixellink] as const)
export const streamersMap: Map<YouTubeChannelId, Streamer> = new Map(
  streamers.map((s) => [s.ytId, s]),
)

// TODO make this pretty
function getStreamerArrayByGroup(group: string) {
  return streamerGroupChoices.find((x) => x.value === group)?.streamerGroup
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
      description: streamerGroupChoices.map(group => group.name).join('\n')
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

export const streamerGroupChoices =  [
  {
    name: 'EIEN',
    value: 'EIEN',
    streamerGroup: eien
  },
  {
    name: 'Hololive',
    value: 'Hololive',
    streamerGroup: [hololive_id, hololive_jp, hololive_en, holostars].flat()
  },
  {
    name: 'Hololive JP',
    value: 'Hololive JP',
    streamerGroup: hololive_jp
  },
  {
    name: 'Hololive ID',
    value: 'Hololive ID',
    streamerGroup: hololive_id
  },
  {
    name: 'Hololive EN',
    value: 'Hololive EN',
    streamerGroup: hololive_en
  },
  {
    name: 'Holostars',
    value: 'Holostars',
    streamerGroup: holostars
  },
  {
    name: 'Nijisanji',
    value: 'Nijisanji',
    streamerGroup: [nijisanji_en, nijisanji_id, nijisanji_jp, nijisanji_kr].flat()
  },
  {
    name: 'Nijisanji JP',
    value: 'Nijisanji JP',
    streamerGroup: nijisanji_jp
  },
  {
    name: 'Nijisanji ID',
    value: 'Nijisanji ID',
    streamerGroup: nijisanji_id
  },
  {
    name: 'Nijisanji EN',
    value: 'Nijisanji EN',
    streamerGroup: nijisanji_en
  },
  {
    name: 'Nijisanji KR',
    value: 'Nijisanji KR',
    streamerGroup: nijisanji_kr
  },
  {
    name: 'Indies',
    value: 'Independent',
    streamerGroup: indies
  },
  {
    name: 'Idol',
    value: 'Idol',
    streamerGroup: IdolComp
  },
  {
    name: 'Official Channels',
    value: 'Official Channels',
    streamerGroup: official_channels
  },
  {
    name: 'Prism',
    value: 'Prism Project',
    streamerGroup: prism_project
  },
  {
    name: 'Phase Connect',
    value: 'Phase Connect',
    streamerGroup: phase_connect
  },
  {
    name: 'VShojo',
    value: 'VShojo',
    streamerGroup: vshojo
  },
  {
    name: 'VReverie',
    value: 'VReverie',
    streamerGroup: vreverie
  },
  {
    name: 'PixelLink',
    value: 'PixelLink',
    streamerGroup: pixellink
  }
]


// type stringOrRegex = string | RegExp
