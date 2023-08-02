import {Guild} from 'discord.js'
import {log} from '../../helpers'
import {client} from "../lunaBotClient";

export function guildCreate(guild: Guild) {
  log(`${guild.name} (${guild.id}) added the bot. (Owner: ${guild.ownerId})`)
  const ch = client.channels.cache.get('1101510606261075978')
  ch?.isTextBased() && ch.send(`**${guild.name}** (${guild.id}) added the bot. (Owner: ${guild.ownerId})`)
}
