import {Command, createEmbedMessage, reply} from "../../helpers/discord";
import {SlashCommandBuilder} from "@discordjs/builders";

export const server: Command = {
  config: {
    permLevel: 9,
  },
  help: {
    category: 'General',
    description: 'Manage servers the bot is in.'
  },
  slash: new SlashCommandBuilder()
    .setName('server')
    .setDescription('Manage servers the bot is in.')
    .addSubcommand((subcommand) =>
    subcommand
        .setName('list')
        .setDescription('List all the servers the bot is in.')
    )
    .addSubcommand((subcommand) =>
    subcommand
        .setName('leave')
        .setDescription('Leave a server.')
      .addStringOption((option) =>
        option.setName('guildid').setDescription('The ID of the server to leave.').setRequired(true)
      )
    ),
  callback: (intr): void => {
    const verb = intr.options.getSubcommand(true) as 'list' | 'leave'
    if (verb === 'list') {
      const servers = intr.client.guilds.cache.map(g => (`${g.name} (${g.id})`))
      reply(
        intr,
        createEmbedMessage(`I am in ${servers.length} servers:\n${servers.join('\n')}`)
      )
    }
    if (verb === 'leave') {
      const servers = intr.client.guilds.cache.map(g => g.id)
      const guild = servers.find(g => g === intr.options.getString('guildid')!)
      if (guild) {
        intr.client.guilds.cache.get(guild)?.leave()
        reply(
          intr,
          createEmbedMessage(`Left server ${guild} successfully.`)
        )
      }
    }
  }
}