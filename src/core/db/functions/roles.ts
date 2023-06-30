import {createEmbedMessage, reply} from '../../../helpers/discord'
import {getSettings, updateSettings} from './'
import {CommandInteraction, Snowflake} from 'discord.js'
import {GuildSettings, RoleSetting} from '../models'
import {match} from '../../../helpers'

export function modifyRoleList(opts: RoleModifyOptions): void {
  const g = getSettings(opts.intr)
  const isNew = !g[opts.type].includes(opts.role)
  const modify = match(opts.verb, {
    add: isNew ? addRole : notifyNotNew,
    remove: !isNew ? removeRole : notifyNotFound,
  })

  modify({...opts, g})
}

///////////////////////////////////////////////////////////////////////////////

const validVerbs = ['add', 'remove'] as const
type ValidVerb = typeof validVerbs[number]

interface RoleModifyOptions {
  type: RoleSetting
  intr: CommandInteraction
  verb: string
  role: Snowflake
}

interface ValidatedOptions extends RoleModifyOptions {
  verb: ValidVerb
  role: Snowflake
  g: GuildSettings
}

function addRole(opts: ValidatedOptions): void {
  const newRoles = [...opts.g[opts.type], opts.role]
  updateSettings(opts.intr, {[opts.type]: newRoles})
  reply(
    opts.intr,
    createEmbedMessage(`
    :white_check_mark: <@&${opts.role}> was added to the ${opts.type} list.
    ${getRoleList(newRoles)}
  `),
  )
}

async function removeRole(opts: ValidatedOptions): Promise<void> {
  const newRoles = opts.g[opts.type].filter((id) => id !== opts.role)
  updateSettings(opts.intr, {[opts.type]: newRoles})
  reply(
    opts.intr,
    createEmbedMessage(`
    :white_check_mark: <@&${opts.role}> was removed from the ${opts.type} list.
    ${getRoleList(newRoles)}
  `),
  )
}

function notifyNotNew(opts: ValidatedOptions): void {
  reply(
    opts.intr,
    createEmbedMessage(`
    :warning: <@&${opts.role}> already in the ${opts.type} list.
    ${getRoleList(opts.g[opts.type])}
  `),
  )
}

function notifyNotFound(opts: ValidatedOptions): void {
  reply(
    opts.intr,
    createEmbedMessage(`
    :warning: <@&${opts.role}> not found in the current ${opts.type} list.
    ${getRoleList(opts.g[opts.type])}
  `),
  )
}

function getRoleList(roles: Snowflake[]) {
  return `**Current**: ${roles.map((id) => '<@&' + id + '>').join(' ')}`
}
