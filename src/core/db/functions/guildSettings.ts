/** @file Functions accessing or interfacing with Guild settings */

import {CommandInteraction, Guild, GuildMember, Message, Snowflake} from 'discord.js'
import {isGuild, hasRole, getGuildId} from '../../../helpers/discord'
import {GuildSettings, BlacklistItem} from '../models'
import {config, PermLevel} from '../../../config'
import {asyncFind} from '../../../helpers'
import {UpdateQuery} from 'mongoose'
import {DocumentType} from '@typegoose/typegoose'
import {client} from '../../lunaBotClient'
import {YouTubeChannelId} from '../../../modules/holodex/frames'
import {RelayedComment} from '../models/RelayedComment'
import Enmap from 'enmap'

export const guildSettingsEnmap: Enmap<Snowflake, GuildSettings> = new Enmap({
  name: 'guildSettings',
})

/**
 * Returns guild settings from the DB or creates them if they don't exist.
 * Returns default settings for DMs. (guildId 0)
 */
export function getSettings(
  x: CommandInteraction | Guild | GuildMember | Snowflake,
): GuildSettings {
  const id = typeof x === 'string' ? x : getGuildId(x)
  return getGuildSettings(id ?? '0')
}

export function getAllSettings(): GuildSettings[] {
  return client.guilds.cache.map(getGuildSettings)
}

export function addBlacklisted(g: Guild | Snowflake, item: BlacklistItem): void {
  updateSettings(g, {blacklist: [...getSettings(g).blacklist, item]})
}

export function removeBlacklisted(g: Guild | Snowflake, ytId?: YouTubeChannelId): boolean {
  const {blacklist} = getSettings(g)
  const isValid = blacklist.some((entry) => entry.ytId === ytId)
  const newBlacklist = blacklist.filter((entry) => entry.ytId !== ytId)

  if (isValid) updateSettings(g, {blacklist: newBlacklist})
  return isValid
}

export function getTranslateLanguage(g: Guild | Snowflake): string {
  return getSettings(g).language
}

export function setTranslateLanguage(g: Guild | Snowflake, s: string): void {
  updateSettings(g, {language: s})
}

function findLanguageKeys() {

}

export function isBlacklisted(ytId: YouTubeChannelId | undefined, gid: Snowflake): boolean {
  return getSettings(gid).blacklist.some((entry) => entry.ytId === ytId)
}

export function updateSettings(
  x: CommandInteraction | Guild | GuildMember | Snowflake,
  update: NewSettings,
): void {
  const isObject = x instanceof CommandInteraction || x instanceof Guild || x instanceof GuildMember
  const _id = isObject ? getGuildId(x as any) ?? '0' : (x as any)
  const current = getSettings(_id)
  const newData = {...current, ...update}

  guildSettingsEnmap.set(_id, newData)
}

export function isAdmin(x: CommandInteraction | GuildMember): boolean {
  return hasPerms(x, 'admins')
}

export function isBlacklister(x: CommandInteraction | GuildMember): boolean {
  return hasPerms(x, 'blacklisters')
}

export function relayPreChat(g: Guild | Snowflake): boolean {
  return getSettings(g).prechat;
}

export async function getPermLevel(x: GuildMember): Promise<PermLevel> {
  const perms = getPermLevels()
  const userPerm = await asyncFind(perms, (level) => level.check(x))
  return userPerm!
}

export function filterAndStringifyHistory(
  guild: CommandInteraction | Guild | GuildMember | Snowflake,
  history: RelayedComment[],
  start?: string,
): string {
  const g = getSettings(guild)
  const blacklist = g.blacklist.map((entry) => entry.ytId)
  const unwanted = g.customBannedPatterns
  return history
    .filter((cmt) => isNotBanned(cmt, unwanted, blacklist))
    .map((cmt) => {
      const startTime = new Date(Date.parse(start ?? '')).valueOf()
      const loggedTime = new Date(+cmt.absoluteTime).valueOf()
      const timestamp = start ? new Date(loggedTime - startTime).toISOString().substr(11, 8) : '[?]'
      return `${timestamp} (${cmt.author}) ${cmt.body}`
    })
    .join('\n')
}

export function deleteGuildSettings(g: Snowflake): void {
  if (guildSettingsEnmap.has(g)) guildSettingsEnmap.delete(g)
}

export type PrivilegedRole = 'admins' | 'blacklisters'

export type NewSettings = UpdateQuery<DocumentType<GuildSettings>>

//// PRIVATE //////////////////////////////////////////////////////////////////

function getGuildSettings(g: Guild | Snowflake): GuildSettings {
  const _id = isGuild(g) ? g.id : g
  const defaults: GuildSettings = {
    _id,
    admins: [],
    blacklist: [],
    blacklisters: [],
    cameos: [],
    community: [],
    customWantedPatterns: [],
    customBannedPatterns: [],
    deepl: true,
    showChat: true,
    language: '',
    logChannel: undefined,
    gossip: [],
    modMessages: true,
    relay: [],
    prechat: true,
    threads: false,
    twitcasting: [],
    youtube: [],
  }
  return guildSettingsEnmap.ensure(_id, defaults)
}

/** Returns perm levels in descending order (Bot Owner -> User) */
function getPermLevels(): PermLevel[] {
  return [...config.permLevels].sort((a, b) => b.level - a.level)
}

function hasPerms(x: CommandInteraction | GuildMember, roleType: PrivilegedRole): boolean {
  const settings = getSettings(x)
  const roles = settings[roleType]

  return <boolean>roles!.some((role) => hasRole(x, role))
}

function isNotBanned(
  cmt: RelayedComment,
  unwanted: string[],
  blacklist: YouTubeChannelId[],
): boolean {
  return (
    blacklist.every((ytId) => ytId !== cmt.ytId) &&
    unwanted.every((p) => !cmt.body.toLowerCase().includes(p.toLowerCase()))
  )
}
