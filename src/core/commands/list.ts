import {SlashCommandBuilder} from '@discordjs/builders'
import {ChatInputCommandInteraction} from 'discord.js'
import {Command, createEmbed, reply} from '../../helpers/discord'
import {getStreamerList, streamerGroupChoices} from '../db/streamers/'

const description = 'Lists supported VTuber Agencies and indies and their VTubers.'

export const list: Command = {
  config: {
    permLevel: 0,
  },
  help: {
    category: 'General',
    description: 'Lists supported YT channels.',
  },
  slash: new SlashCommandBuilder().setName('list').setDescription(description).setDefaultMemberPermissions(2)
    .addStringOption((option) => option.setName('group').setDescription('VTuber Agency').setChoices(
      ...streamerGroupChoices.map((group) => ({name: group.name, value: group.value}))
    ).setRequired(false)),
  callback: (intr: ChatInputCommandInteraction): void => {
    const group = intr.options.getString('group')
    if (group === null) {
      reply(
        intr,
        createEmbed({
          title: 'Supported Agencies and Indies',
          description: streamerGroupChoices.map(group => group.name).join('\n'),
        }),
      )
      return
    }
    reply(
      intr,
      createEmbed({
        title: `${group} VTubers`,
        description: getStreamerList(group!),
      }))
  },
}
