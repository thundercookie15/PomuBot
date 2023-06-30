import {oneLine} from 'common-tags'
import {TextChannel} from 'discord.js'
import {client} from '../../core'
import {getAllSettings} from '../../core/db/functions'
import {GuildSettings, WatchFeatureSettings} from '../../core/db/models'
import {StreamerName, streamers} from '../../core/db/streamers'
import {createEmbed, send} from '../../helpers/discord'
import {communityEmitter} from './communityEmitter'
import {CommunityPost} from './getLatestPost'
import {isMainThread} from 'worker_threads'

if (isMainThread) communityEmitter.on('post', notifyPost)

function notifyPost(post: CommunityPost): void {
  const allSettings = getAllSettings()
  const streamer = streamers.find((s) => s.ytId == post.ytId)
  const guilds = allSettings.filter((g) => follows(streamer!.name, g))
  const subs = guilds.flatMap((g) => getSubs(g, streamer!.name).map((s) => [g, s] as const))

  subs.forEach(([g, {streamer, discordCh, roleToNotify}]) => {
    const guild = client.guilds.cache.find((gg) => gg.id === g._id)
    const ch = <TextChannel>guild?.channels.cache.find((ch) => ch.id == discordCh)
    send(ch, {
      content: oneLine`
        :loudspeaker: ${roleToNotify ? '<@&' + roleToNotify + '>' : ''}
        ${streamer} just published a community post!\n
        ${post.url}
      `,
      embeds: [
        createEmbed({
          url: post.url,
          author: {name: post.author, iconURL: post.avatar, url: post.url},
          description: post.content,
          thumbnail: {url: post.avatar},
        }),
      ],
    })
  })
}

function follows(streamer: StreamerName, settings: GuildSettings): boolean {
  return settings.community.map((el) => el.streamer).includes(streamer)
}

function getSubs(g: GuildSettings, s: StreamerName): WatchFeatureSettings[] {
  return g.community.filter((e) => e.streamer === s)
}
