import {Command} from "../../helpers/discord";
import {CommandInteraction} from "discord.js";
import {toggleSetting} from "../db/functions";
import {SlashCommandBuilder} from "@discordjs/builders";

const description = 'Toggles the relaying of prechat stream messages.'

export const prechat: Command = {
  config: {
    permLevel: 2,
  },
  help: {
    category: 'Relay',
    description,
  },
  slash: new SlashCommandBuilder()
    .setName('prechat')
    .setDescription(description)
    .setDefaultMemberPermissions(2),
  callback: (intr): void => {
    toggleSetting({
      intr,
      setting: `prechat`,
      enable: 'I will now relay prechat messages.',
      disable: `
        I will no longer relay prechat messages.
        Live relays will still be enabled.
      `
    })
  }
}