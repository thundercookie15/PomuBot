import {Command, createEmbed, createEmbedMessage, reply} from "../../helpers/discord";
import {SlashCommandBuilder} from "@discordjs/builders";
import {isNil} from "ramda";
import {addBlacklisted, getSettings} from "../db/functions";
import {isBlacklisted} from "../../modules/livechat/commentBooleans";
import {ContextMenuCommandInteraction} from "discord.js";
import {getUsernameFromId} from "../../helpers/youtubeApi";

const description = 'Blacklists the specified channel ID.'

export const blacklistchannel: Command = {
  config: {
    permLevel: 1,
  },
  help: {
    category: 'Relay',
    description
  },
  slash: new SlashCommandBuilder()
    .setName('blacklistchannel')
    .setDescription(description)
    .addStringOption((option) => option.setName('ytchannelid').setDescription('YT Channel ID').setRequired(true))
    .setDefaultMemberPermissions(8192),
  callback: (intr) => {
    const ytChannel = intr.options.getString('ytchannelid')
    const processMsg = isNil(ytChannel) ? notifyTranslatorNotFound : blacklistItem
    processMsg(intr, ytChannel!)
  }
}

async function blacklistItem(intr: any, ytId: string): Promise<void> {
  const ytChannel = ytId
  const ytName: string | undefined = await getUsernameFromId(ytId)
  // const processMsg = isNil(ytChannel) ? blacklistItem(intr, ytChannel!) : reply(intr, createEmbedMessage(':warning: No YouTube id found.'))
  const duplicate = isBlacklisted(ytChannel!, getSettings(intr.guild!))
  const callback = duplicate
    ? notifyDuplicate
    : isNil(ytName)
      ? notifyTranslatorNotFound
      : addBlacklistedAndConfirm
  callback(intr, ytChannel!, ytName!)
}

function addBlacklistedAndConfirm(intr: ContextMenuCommandInteraction, ytId: string, ytName: string): void {
  addBlacklisted(intr.guild!, {ytId, name: ytName, reason: 'Manual blacklist by admin.'})
  reply(
    intr,
    createEmbed({
      fields: [
        {
          name: ':no_entry: Blacklister',
          value: intr.user.toString(),
          inline: true,
        },
        {
          name: ':clown: Blacklisted channel',
          value: ytId,
          inline: true,
        },
        {
          name: ':bookmark_tabs: Reason',
          value: 'Manual blacklist by admin.',
          inline: true,
        },
      ],
    }),
  )
}

function notifyDuplicate(intr: ContextMenuCommandInteraction): void {
  reply(intr, createEmbedMessage(':warning: Already blacklisted'))
}

function notifyTranslatorNotFound(intr: ContextMenuCommandInteraction): void {
  reply(intr, createEmbedMessage(':warning: Youtube Channel Data not found.'))
}

