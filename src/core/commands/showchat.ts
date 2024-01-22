import {Command} from "../../helpers/discord";
import {SlashCommandBuilder} from "@discordjs/builders";
import {CommandInteraction} from "discord.js";
import {toggleSetting} from "../db/functions";

const description = 'Toggles the relay to include in which chat a message is sent server-wide.'
export const showchat: Command = {
  config: {
    permLevel: 2,
  },
  help: {
    category: 'Relay',
    description
  },
  slash: new SlashCommandBuilder()
    .setName('showchat')
    .setDescription(description)
    .setDefaultMemberPermissions(2),
  callback: (intr: CommandInteraction): void => {
    toggleSetting({
      intr,
      setting: 'showChat',
      enable: `:speech_balloon: I will now include the chat a message is relayed from.`,
      disable: `
        :speech_balloon: I will no longer include the chat a message is relayed from.`,
    })
  }
}