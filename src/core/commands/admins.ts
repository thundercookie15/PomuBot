import {Command} from '../../helpers/discord'
import {ChatInputCommandInteraction} from 'discord.js'
import {modifyRoleList} from '../db/functions/roles'
import {roleListCommand} from '../../helpers/discord/slash'

const description =
  'Add or remove a role to the bot admin list. (ppl w/ kick perms are alr bot admin.)'

export const admins: Command = {
  config: {
    permLevel: 2,
  },
  help: {
    category: 'General',
    description,
  },
  slash: roleListCommand({
    name: 'admins',
    description,
    roleListName: 'the bot admin list',
  }),
  callback: (intr: ChatInputCommandInteraction): void => {
    modifyRoleList({
      type: 'admins',
      intr,
      verb: intr.options.getSubcommand(true),
      role: intr.options.getRole('role')!.id,
    })
  },
}
