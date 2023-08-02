import {SlashCommandBuilder, SlashCommandStringOption} from '@discordjs/builders'

// import { streamers } from '../../core/db/streamers'

interface RoleListCommand {
  name: string
  description: string
  roleListName: string
}

export const roleListCommand = (opts: RoleListCommand) =>
  new SlashCommandBuilder()
    .setName(opts.name)
    .setDescription(opts.description)
    .addSubcommand((subcommand) =>
      subcommand
        .setName('add')
        .setDescription(`Add a role to ${opts.roleListName}.`)
        .addRoleOption((option) =>
          option.setName('role').setDescription('The role').setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('remove')
        .setDescription(`Remove a role to ${opts.roleListName}`)
        .addRoleOption((option) =>
          option.setName('role').setDescription('The role').setRequired(true),
        ),
    )

export const channelOption = (option: SlashCommandStringOption) =>
  option
    .setName('channel')
    .setDescription('YouTube channel name')
    // .addChoices(streamers.map((s) => [s.name, s.name]))
    .setRequired(true)

interface NotificationCommand {
  name: string
  subject: string
}

export const notificationCommand = (opts: NotificationCommand) =>
  new SlashCommandBuilder()
    .setName(opts.name)
    .setDescription(
      `Starts or stops sending notifications for ${opts.subject} in the current Discord channel.`,
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('add')
        .setDescription(`Add a channel from which to notify ${opts.subject}`)
        .addStringOption(channelOption)
        .addRoleOption((option) =>
          option.setName('role').setDescription('role to notify'),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('remove')
        .setDescription(`Remove a channel from which to notify ${opts.subject}`)
        .addStringOption(channelOption),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('clear')
        .setDescription(`Clear all channels from which to notify ${opts.subject}`)
        .addChannelOption((option) =>
          option.setName('textchannel').setDescription('The channel to clear in.'),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('viewcurrent')
        .setDescription(`View currently subscribed`),
    )
