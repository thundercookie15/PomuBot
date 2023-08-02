import {Guild} from 'discord.js'
import {log} from '../../helpers'
import {deleteGuildData, deleteGuildSettings} from '../db/functions'
import {client} from "../lunaBotClient";

export function guildDelete(guild: Guild) {
  log(`${guild.name} (${guild.id}) left. Data and settings cleared.)`)
  const ch = client.channels.cache.get('1101510606261075978')
  ch?.isTextBased() && ch.send(`**${guild.name}** (${guild.id}) left. Data and settings cleared.`)

  deleteGuildData(guild.id)
  deleteGuildSettings(guild.id)
}
