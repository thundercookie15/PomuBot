import {CommandInteraction} from 'discord.js'
import {Command, reply} from '../../helpers/discord'
import {oneLine} from 'common-tags'
import {SlashCommandBuilder} from '@discordjs/builders'

export const threads: Command = {
  config: {
    permLevel: 2,
  },
  help: {
    category: 'Relay',
    description: oneLine`
      Toggles the posting of translations in threads.
      Requires Public Threads permissions.
    `,
  },
  slash: new SlashCommandBuilder().setName('thread').setDescription('Dead feature'),
  callback: (intr: CommandInteraction): void => {
    reply(
      intr,
      undefined,
      'Pretty sure this feature has been dead for a while. Instead please set relay inside a thread manually.',
    )
    // toggleSetting ({
    // msg, setting: 'threads',
    // enable: `
    // :hash: I will now relay translations in a thread.
    // This requires "Public Threads" permissions.
    // If given "Manage Messages" permissions, I will pin each thread for 24h.
    // `,
    // disable: ':hash: I will no longer relay translations in a thread.'
    // })
  },
}
