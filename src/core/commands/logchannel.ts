import {SlashCommandBuilder} from '@discordjs/builders'
import {ChatInputCommandInteraction, Snowflake} from 'discord.js'
import {Command, createEmbedMessage, reply} from '../../helpers/discord'
import {updateSettings} from '../db/functions'

const description = 'Redirect TL logs to specified channel, or clear the setting.'

export const logchannel: Command = {
  config: {
    permLevel: 2,
  },
  help: {
    category: 'Relay',
    description,
  },
  slash: new SlashCommandBuilder()
    .setName('logchannel')
    .setDescription(description)
    .addChannelOption((option) => option.setName('channel').setDescription('discord channel'))
    .setDefaultMemberPermissions(2),
  callback: async (intr: ChatInputCommandInteraction): Promise<void> => {
    const channel = intr.options.getChannel('channel')
    // const channelMention = intr.options.getChannel('channel')
    const channelId = channel?.id
    const processMsg =
      channel == null
        ? clearSetting
        : !intr.guild?.channels?.cache.find((c) => c.id == channelId)
          ? respondInvalid
          : setLogChannel
    processMsg(intr, channelId!)
  },
}

function clearSetting(intr: ChatInputCommandInteraction): void {
  updateSettings(intr, {logChannel: undefined})
  reply(intr, createEmbedMessage('Logs will be posted in the relay channel.'))
}

function respondInvalid(intr: ChatInputCommandInteraction): void {
  reply(intr, createEmbedMessage(`Invalid channel supplied.`))
}

function setLogChannel(intr: ChatInputCommandInteraction, channelId: Snowflake): void {
  updateSettings(intr, {logChannel: channelId})
  reply(intr, createEmbedMessage(`Logs will be posted in <#${channelId}>.`))
}
