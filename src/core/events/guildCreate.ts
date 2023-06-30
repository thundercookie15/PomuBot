import {Guild} from 'discord.js'
import {log} from '../../helpers'

export function guildCreate(guild: Guild) {
  log(`${guild.name} (${guild.id}) added the bot. (Owner: ${guild.ownerId})`)
}
