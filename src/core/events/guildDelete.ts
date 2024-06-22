import {Guild} from 'discord.js'
import {log} from '../../helpers'
import {deleteGuildData, deleteGuildSettings, isWhitelistedServer} from '../db/functions'
import {client} from "../lunaBotClient";

export function guildDelete(guild: Guild) {
  log(`${guild.name} (${guild.id}) left. Data and settings cleared.)`)
  const ch = client.channels.cache.get('INTERNAL_LOG_CHANNEL_ID')
  ch?.isTextBased() && ch.send(`**${guild.name}** (${guild.id}) left. Data and settings cleared.`)

  deleteGuildData(guild.id)
  deleteGuildSettings(guild.id)
}
