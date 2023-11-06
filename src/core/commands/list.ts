import {SlashCommandBuilder} from '@discordjs/builders'
import {ChatInputCommandInteraction, CommandInteraction} from 'discord.js'
import {Command, createEmbed, reply} from '../../helpers/discord'
import {getStreamerList, streamerGroups} from '../db/streamers/'

const description = 'Lists supported VTuber Agencies and indies and their VTubers.'

export const list: Command = {
  config: {
    permLevel: 0,
  },
  help: {
    category: 'General',
    description: 'Lists supported YT channels.',
  },
  slash: new SlashCommandBuilder().setName('list').setDescription(description)
    .addStringOption((option) => option.setName('group').setDescription('VTuber Agency').addChoices(
      {
        "name": 'EIEN',
        "value": 'EIEN',
      },
      {
        "name": 'Hololive',
        "value": 'Hololive',
      },
      {
        "name": 'Nijisanji',
        "value": 'Nijisanji',
      },
      {
        "name": 'Nijisanji JP',
        "value": 'Nijisanji JP',
      },
      {
        "name": 'Nijisanji ID',
        "value": 'Nijisanji ID',
      },
      {
        "name": 'Nijisanji EN',
        "value": 'Nijisanji EN',
      },
      {
        "name": 'Nijisanji KR',
        "value": 'Nijisanji KR',
      },
      {
        "name": 'Indies',
        "value": 'Independent',
      },
      {
        "name": 'Idol',
        "value": 'Idol',
      },
      {
        "name": 'Official Channels',
        "value": 'Official Channels',
      },
      {
        "name": 'Prism',
        "value": 'Prism Project',
      },
      {
        "name": 'Phase Connect',
        "value": 'Phase Connect',
      },
      {
        "name": 'VShojo',
        "value": 'VShojo',
      },
      {
        "name": 'VReverie',
        "value": 'VReverie',
      }
    ).setRequired(false)),
  callback: (intr: ChatInputCommandInteraction): void => {
    const group = intr.options.getString('group')
    if (group === null) {
      reply(
        intr,
        createEmbed({
          title: 'Supported Agencies and Indies',
          description: streamerGroups.join('\n'),
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
