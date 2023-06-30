import {toggleSetting} from '../db/functions'
import {CommandInteraction} from 'discord.js'
import {Command, emoji} from '../../helpers/discord'
import {oneLine} from 'common-tags'
import {SlashCommandBuilder} from '@discordjs/builders'

const description =
  "Toggles automatic DeepL translation for Hololive members' chat messages. (Also affects /cameos)"

export const deepl: Command = {
  config: {
    permLevel: 2,
  },
  help: {
    category: 'Relay',
    description,
  },
  slash: new SlashCommandBuilder().setName('deepl').setDescription(description),
  callback: (intr: CommandInteraction): void => {
    toggleSetting({
      intr,
      setting: 'deepl',
      enable: `
        ${emoji.deepl} I will now translate Vtubers' messages with DeepL.
      `,
      disable: oneLine`
        ${emoji.deepl} I will no longer translate Vtubers' messages
        with DeepL.
      `,
    })
  },
}
