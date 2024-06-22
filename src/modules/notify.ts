import {client} from '../core/'
import {TextChannel} from 'discord.js'
import {GuildSettings, WatchFeature} from '../core/db/models'
import {Streamer} from '../core/db/streamers'
import {addRelayNotice, getRelayNotices, getSubbedGuilds} from '../core/db/functions'
import {VideoId} from './holodex/frames'
import {canBot, createEmbed, send} from '../helpers/discord'
import {tryOrLog} from '../helpers/tryCatch'

export function notifyDiscord(opts: NotifyOptions): void {
  const {streamer, subbedGuilds, feature} = opts
  const guilds = subbedGuilds ?? getSubbedGuilds(streamer?.name, feature)
  guilds.forEach((g) => notifyOneGuild(g, opts))
}

export async function notifyOneGuild(g: GuildSettings, opts: NotifyOptions): Promise<void[]> {
  const {streamer, feature, embedBody, emoji} = opts
  if (opts.prechat && !g.prechat) return Promise.all([])

  const entries = g[feature].filter((ent) => ent.streamer == streamer!.name)
  const guildObj = client.guilds.cache.find((guild) => guild.id === g._id)
  const notices = await getRelayNotices(g._id)
  const announce = notices.get(opts.videoId ?? '')

  return !announce
    ? Promise.all(
      entries.map(({discordCh, roleToNotify}) => {
        if (opts.prechat && !g.prechat) return
        const ch = <TextChannel>guildObj?.channels.cache.find((ch) => ch.id === discordCh)
        const msgPromise = send(ch, {
          content: roleToNotify ? emoji + ' <@&' + roleToNotify + '>' : undefined,
          embeds: [
            createEmbed({
              author: {name: streamer!.name, iconURL: opts.avatarUrl},
              thumbnail: {url: opts.avatarUrl},
              description: embedBody,
              ...(opts.credits
                ? {footer: {text: 'Relay from live frames currently powered by Holodex!'}}
                : {}),
            }),
          ],
        }).then((msg) => {
          if (msg && feature === 'relay') {
            const ch = msg.channel as TextChannel
            const mustThread = canBot('CreatePublicThreads', ch) && g.threads
            if (!opts.prechat) addRelayNotice(g._id, opts.videoId!, msg.id)
            if (mustThread)
              return tryOrLog(() =>
                ch.threads?.create({
                  name: `Log ${streamer.name} ${opts.videoId}`,
                  startMessage: msg,
                  autoArchiveDuration: 1440,
                }),
              )?.then((thread) => {
                if (thread && canBot('ManageMessages', ch)) {
                  tryOrLog(() => msg.pin())
                  setTimeout(() => tryOrLog(() => msg?.unpin()), 86400000)
                }
              })
          }
        })
        if (opts.nonEmbedText) send(ch, opts.nonEmbedText)
        return msgPromise
      }),
    )
    : []
}

export interface NotifyOptions {
  subbedGuilds?: GuildSettings[]
  feature: WatchFeature,
  prechat?: boolean
  streamer: Streamer
  embedBody: string
  emoji: string
  avatarUrl: string
  videoId?: VideoId
  nonEmbedText?: string
  credits?: boolean
}
