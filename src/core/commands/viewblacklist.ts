import {Command, createEmbed, createTxtEmbed, reply} from '../../helpers/discord'
import {getSettings} from '../db/functions'
import {CommandInteraction} from 'discord.js'
import {SlashCommandBuilder} from '@discordjs/builders'

const description = 'Shows blacklist'

export const viewblacklist: Command = {
  config: {
    permLevel: 1,
  },
  help: {
    category: 'Relay',
    description,
  },
  slash: new SlashCommandBuilder().setName('viewblacklist').setDescription(description),
  callback: async (intr: CommandInteraction): Promise<void> => {
    showBlacklist(intr)
  },
}

//////////////////////////////////////////////////////////////////////////////

function showBlacklist(intr: CommandInteraction): void {
  const g = getSettings(intr)
  const header = 'Channel ID               | Name (Reason)\n'
  const entries = g.blacklist.map((e) => `${e.ytId} | ${e.name} (${e.reason})`).join('\n')
  const list = header + entries

  reply(intr, undefined, '', createTxtEmbed('blacklist.txt', list))
}
