import {Command} from '../../helpers/discord'
import {ChatInputCommandInteraction} from 'discord.js'
import {modifyRoleList} from '../db/functions/roles'
import {roleListCommand} from '../../helpers/discord/slash'

const description =
  'Add or remove a role to blacklisters. (Bot admins + ppl with kick perms are alr blacklisters.)'

export const blacklisters: Command = {
  config: {
    permLevel: 2,
  },
  help: {
    category: 'General',
    description,
  },
  slash: roleListCommand({
    name: 'blacklisters',
    description,
    roleListName: 'the bot blacklister list',
  }),
  callback: (intr: ChatInputCommandInteraction): void => {
    modifyRoleList({
      type: 'blacklisters',
      intr,
      verb: intr.options.getSubcommand(true),
      role: intr.options.getRole('role')!.id,
    })
  },
}
