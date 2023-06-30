import {readdirSync} from 'fs'
import {
  ContextMenuCommandBuilder,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from '@discordjs/builders'
import {log} from '../logging'
import {ChatInputCommandInteraction} from 'discord.js'
import {Map as ImmutableMap} from 'immutable'
import path from 'path'
import {isNotNil} from '../language'

export function loadCommand(cmdFile: string): Command {
  return loadModule('commands', cmdFile)
}

export function loadEvent(evtFile: string): BotEvent {
  return loadModule('events', evtFile)
}

export function loadAllCommands(): ImmutableMap<CommandName, Command> {
  return loadAll('commands')
}

export function loadAllEvents(): ImmutableMap<EventName, BotEvent> {
  return loadAll('events')
}

export type BotEvent = (data?: unknown) => void

export interface Command {
  config: {
    permLevel: number
  }
  help: {
    category: string
    description: string
    // usage: string
  }
  slash:
    | SlashCommandBuilder
    | SlashCommandSubcommandsOnlyBuilder
    | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>
    | ContextMenuCommandBuilder
  callback: (intr: ChatInputCommandInteraction) => void | Promise<void>
}

//// PRIVATE //////////////////////////////////////////////////////////////////

type Module = Command & BotEvent

type EventName = string

type CommandName = string

function loadModule(dir: string, moduleFile: string): Module {
  const exportName = path.basename(moduleFile, '.js')
  const modulePath = `../../core/${dir}/${moduleFile}`
  const moduleObj = require(modulePath)[exportName] as Module

  log(`Loaded ${dir}/${moduleFile}`)

  return moduleObj
}

function loadAll(type: string): ImmutableMap<string, Module> {
  const files = readdirSync(resolveRelativePath(`../../core/${type}`))
  const modules_ = files
    .filter(isNotSourceMapFile)
    .map((f: string) => [path.basename(f, '.js'), loadModule(type, f)])
    .filter(isNotNil)
  const modules = filterUndefinedModules(ImmutableMap(modules_ as [string, Module][]))

  log(`Loaded ${modules.size} ${type}.`)

  return modules as ImmutableMap<string, Module>
}

function isNotSourceMapFile(file: string) {
  return !file.endsWith('.map')
}

function resolveRelativePath(target: string) {
  return path.resolve(__dirname, target)
}

function filterUndefinedModules(m: ImmutableMap<string, Module>): ImmutableMap<string, Module> {
  return m.filter((module) => module !== undefined)
}
