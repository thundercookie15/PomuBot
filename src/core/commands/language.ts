import {Command, createEmbed, reply} from "../../helpers/discord";
import {oneLine} from "common-tags";
import {APIApplicationCommandOptionChoice, ChatInputCommandInteraction} from "discord.js";
import {SlashCommandBuilder} from "@discordjs/builders";
import {getSettings, setTranslateLanguage, updateSettings} from "../db/functions";
import {languages} from "../../helpers/languages";

const subject = 'set bot translations language'

export const language: Command = {
  config: {
    permLevel: 3
  },
  help: {
    category: 'Relay',
    description: oneLine`
        Sets the language to relay translations for.
        This will also change the language DeepL will automatically translate to.`,
  },
  slash: new SlashCommandBuilder()
    .setName('language')
    .setDescription(subject)
    .addSubcommand((subcommand) =>
      subcommand.setName('set')
        .setDescription('Sets the language for translation')
        .addStringOption((option) =>
          option.setName('language').setDescription('language').setRequired(true)
            .addChoices({
              name: 'English',
              value: 'EN-US'
            },
              {
                name: 'Japanese',
                value: 'JA'
              })
        )
    ).addSubcommand((subcommand) =>
      subcommand.setName('current')
        .setDescription('current translation language')
    ),
  callback: (intr: ChatInputCommandInteraction): void => {
    const language = intr.options.getString('language')!
    const g = getSettings(intr)
    const verb = intr.options.getSubcommand(true) as 'set' | 'current'

    if (verb === 'current') {
      const currentLanguage = g.language
      reply(
        intr,
        createEmbed({
            title: "Current set language",
            description: currentLanguage
          }
        )
      )
    }
    if (verb === 'set') {
      setTranslateLanguage(intr.guild!, language)
      reply(
        intr,
        createEmbed({
          title: 'Updated translation language',
          description: `Set language to ${language}`
        })
      )
    }
  }
}
