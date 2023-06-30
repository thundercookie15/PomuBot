import { commands } from '../lunaBotClient'
import { config } from '../../config'
import { log, doNothing } from '../../helpers'
import { Message } from 'discord.js'
import { getPermLevel } from '../db/functions'
import { isNil, head, compose } from 'ramda'
import { oneLine } from 'common-tags'
import {
  isDm, createEmbed, emoji, Command, reply, mentionsMe, isBot
} from '../../helpers/discord'

export async function messageCreate (msg: Message): Promise<void> {
  const mustSendPrefix = mentionsMe (msg) && !isBot (msg)

  const mustIgnore = lacksBotPrefix (msg)
                  || isDm (msg)
                  || isBot (msg)
                  || isInvalidCommand (msg)
                  || await isAuthorTooLowLevel (msg)

  const processMessage = mustSendPrefix ? sendPrefix
                       : mustIgnore     ? doNothing
                                        : runRequestedCommand
  processMessage (msg)
}

//// PRIVATE //////////////////////////////////////////////////////////////////

function lacksBotPrefix (msg: Message): boolean {
  return !msg.content.startsWith (config.prefix)
}

function isInvalidCommand (msg: Message): boolean {
  return compose (isNil, findCommand, head, getCommandWords) (msg)
}

function getCommandWords (msg: Message) {
  return msg.content.slice (config.prefix.length).trim ().split (/ +/g)
}

function findCommand (cmd?: string): Command | undefined {
  return isNil (cmd)
    ? undefined
    : commands.get (cmd) || commands.find (x => x.config.aliases.includes (cmd))
}

async function isAuthorTooLowLevel (msg: Message): Promise<boolean> {
  await ensureAuthorIsCached (msg)
  const authorLevel = await getAuthorPermLevel (msg)
  const command     = compose (findCommand, head, getCommandWords) (msg)

  return authorLevel < command!.config.permLevel
}

async function ensureAuthorIsCached (msg: Message): Promise<void> {
  msg.member || await msg.guild!.members.fetch (msg.author)
}

async function getAuthorPermLevel (msg: Message): Promise<number> {
  const authorPerm = await getPermLevel (msg)
  return authorPerm.level
}

function sendPrefix (msg: Message): void {
  const prefix = config.prefix
  reply (msg, createEmbed ({
    title: `Hello there! ${emoji.respond}`,
    description:  `My prefix is \`${prefix}\`. Try running \`${prefix}help\`!`
  }))
}

function runRequestedCommand (msg: Message): void {
  const [requestedCmd, ...args] = getCommandWords (msg)
  const command                 = findCommand (requestedCmd)

  log (oneLine`
    ${msg.author.username} (${msg.author.id}) ran ${requestedCmd}
    in server ${msg.guild!.name} (${msg.guild!.id})
  `)
  command!.callback (msg, args)
}
