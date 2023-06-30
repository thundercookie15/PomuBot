import {SlashCommandBuilder} from '@discordjs/builders'
import {CommandInteraction} from 'discord.js'
import {Command, createEmbed, reply} from '../../helpers/discord'
import {getStreamerList} from '../db/streamers/'

const description = 'Lists supported YT channels'

export const list: Command = {
  config: {
    permLevel: 0,
  },
  help: {
    category: 'General',
    description: 'Lists supported YT channels.',
  },
  slash: new SlashCommandBuilder().setName('list').setDescription(description),
  callback: (intr: CommandInteraction): void => {
    reply(
      intr,
      createEmbed({
        title: 'Supported channels',
        description: getStreamerList(),
      }),
    )
  },
}
