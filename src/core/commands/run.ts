import {Command} from '../../helpers/discord'
import {ChatInputCommandInteraction} from 'discord.js'
import {inspect} from 'util'
import {config} from '../../config'
import {client} from '../lunaBotClient' // for eval scope
import {getSettings, updateSettings, getGuildData, updateGuildData} from '../db/functions'
import {tryOrDefault} from '../../helpers/tryCatch'
import {reply} from '../../helpers/discord'
import {SlashCommandBuilder} from '@discordjs/builders'

export const run: Command = {
  config: {
    permLevel: 10,
  },
  help: {
    category: 'System',
    description: 'Evaluates arbitrary JS.',
  },
  slash: new SlashCommandBuilder()
    .setName('run')
    .setDescription('run')
    .addStringOption((option) => option.setName('code').setDescription('code').setRequired(true)),
  callback: async (intr: ChatInputCommandInteraction): Promise<void> => {
    const output = await processCode(intr, intr.options.getString('code')!)
    reply(intr, undefined, '```js\n' + output + '\n```')
  },
}

///////////////////////////////////////////////////////////////////////////////

async function processCode(intr: ChatInputCommandInteraction, code: string): Promise<string> {
  // keep imports in eval scope via _
  const _ = {client, intr, getSettings, updateSettings, getGuildData, updateGuildData}
  const evaled = await tryOrDefault(() => eval(code), '')
  const string = toString(evaled)
  const cleaned = string
    .replace(/`/g, '`' + String.fromCharCode(8203))
    .replace(/@/g, '@' + String.fromCharCode(8203))
    .replaceAll(config.token ?? '[censored]', '[censored]')
    .replaceAll(config.deeplKey ?? '[censored]', '[censored]')
  return cleaned
}

function toString(x: any): string {
  return typeof x === 'string' ? x : inspect(x, {depth: 1})
}
