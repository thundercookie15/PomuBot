import {Guild} from 'discord.js'
import {log} from '../../helpers'
import {client} from "../lunaBotClient";

export function guildCreate(guild: Guild) {
  log(`${guild.name} (${guild.id}) added the bot. (Owner: ${guild.ownerId})`)
  const ch = client.channels.cache.get('INTERNAL_LOG_CHANNEL_ID')
  ch?.isTextBased() && ch.send(`**${guild.name}** (${guild.id}) added the bot. (Owner: ${guild.ownerId})`)
}
