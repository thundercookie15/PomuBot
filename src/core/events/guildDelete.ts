import {Guild} from 'discord.js'
import {log} from '../../helpers'
import {deleteGuildData, deleteGuildSettings} from '../db/functions'

export function guildDelete(guild: Guild) {
  log(`${guild.name} (${guild.id}) left. Data and settings cleared.)`)

  deleteGuildData(guild.id)
  deleteGuildSettings(guild.id)
}
