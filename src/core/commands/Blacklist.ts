import {Command, createEmbed, createEmbedMessage, reply} from '../../helpers/discord'
import {oneLine} from 'common-tags'
import {getFlatGuildRelayHistory, addBlacklisted, getSettings} from '../db/functions'
import {CommandInteraction, ContextMenuCommandInteraction} from 'discord.js'
import {isBlacklisted} from '../../modules/livechat/commentBooleans'
import {RelayedComment} from '../db/models/RelayedComment'
import {ContextMenuCommandBuilder} from '@discordjs/builders'

export const Blacklist: Command = {
  config: {
    permLevel: 1,
  },
  help: {
    category: 'Relay',
    description: oneLine`Blacklists author`,
  },
  slash: new ContextMenuCommandBuilder()
    .setName('Blacklist')
    .setType(3)
    .setDefaultMemberPermissions(8192), // message
  callback: async (intr_: CommandInteraction): Promise<void> => {
    // shitty hack because i suck
    const intr = intr_ as ContextMenuCommandInteraction
    const reason = 'Requested by context menu interaction'
    blacklistTl(intr, reason)
  },
}

//////////////////////////////////////////////////////////////////////////////

async function blacklistTl(intr: ContextMenuCommandInteraction, reason: string): Promise<void> {
  const settings = getSettings(intr.guild!)
  const refId = intr.targetId
  const history = await getFlatGuildRelayHistory(intr.guild!)
  const culprit = history.find((cmt) => cmt.msgId === refId)
  const duplicate = culprit && isBlacklisted(culprit.ytId, settings)
  const callback = duplicate
    ? notifyDuplicate
    : culprit
      ? addBlacklistedAndConfirm
      : notifyTranslatorNotFound

  callback(intr, culprit!, reason)
}

function notifyDuplicate(intr: ContextMenuCommandInteraction): void {
  reply(intr, createEmbedMessage(':warning: Already blacklisted'))
}

function addBlacklistedAndConfirm(
  intr: ContextMenuCommandInteraction,
  {ytId, author}: RelayedComment,
  reason: string,
): void {
  addBlacklisted(intr.guild!, {ytId: ytId, name: author, reason})
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
          value: author,
          inline: true,
        },
        {
          name: ':bookmark_tabs: Reason',
          value: reason,
          inline: true,
        },
      ],
    }),
  )
}

function notifyTranslatorNotFound(intr: ContextMenuCommandInteraction): void {
  reply(intr, createEmbedMessage(':warning: Translator data not found.'))
}
