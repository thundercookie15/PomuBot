/** @file Generic Discord.js helper functions applicable to any bot. */
import {config} from '../../config'
import {
  Guild,
  GuildMember,
  Message,
  Snowflake,
  TextBasedChannel,
  TextChannel,
  PermissionResolvable,
  NewsChannel,
  DMChannel,
  ThreadChannel,
  CommandInteraction,
  GuildMemberRoleManager,
} from 'discord.js'
import {client} from '../../core'

export function findTextChannel(
  id: Snowflake | undefined,
): TextChannel | ThreadChannel | undefined {
  const ch = client.channels.cache.get(id ?? '')
  const valid = [TextChannel, ThreadChannel].some((type) => ch instanceof type)
  return valid ? <TextChannel | ThreadChannel>ch : undefined
}

export function isGuild(scrutinee: any): scrutinee is Guild {
  return scrutinee instanceof Guild
}

export function isMessage(scrutinee: any): scrutinee is Message {
  return scrutinee instanceof Message
}

export function isMember(scrutinee: any): scrutinee is GuildMember {
  return scrutinee instanceof GuildMember
}

export function isDm(msg: Message): boolean {
  return msg.guild === undefined
}

export function hasRole(x: CommandInteraction | GuildMember, role: Snowflake): boolean {
  const user = x instanceof CommandInteraction ? x.member : x
  return <boolean>Array.isArray(user!.roles)
    ? (user!.roles as string[]).includes(role)
    : (user?.roles as GuildMemberRoleManager).cache.has(role)
}

export function isBotDev(scrutinee: CommandInteraction | GuildMember): boolean {
  return getUserId(scrutinee) === config.devId
}

export function isGuildOwner(scrutinee: CommandInteraction | GuildMember): boolean {
  return getUserId(scrutinee) === scrutinee.guild?.ownerId
}

export function isBotOwner(scrutinee: CommandInteraction | GuildMember): boolean {
  return getUserId(scrutinee) === config.ownerId
}

export function getUserId(subject: CommandInteraction | GuildMember): Snowflake {
  return subject instanceof CommandInteraction ? subject.user.id : subject.id
}

export function hasKickPerms(subject: CommandInteraction | GuildMember): boolean {
  const author = subject instanceof CommandInteraction ? subject.member as GuildMember : subject

  return <boolean>(author?.permissions).has('KickMembers')
}

export function getGuildId(
  subject: CommandInteraction | Guild | GuildMember,
): Snowflake | undefined {
  return subject instanceof CommandInteraction
    ? subject.guildId ?? undefined
    : isGuild(subject)
      ? subject.id
      : subject.guild!.id
}

export function mentionsMe(msg: Message): boolean {
  const mentionRegex = new RegExp(`^<@!?${client.user!.id}>`)
  return Boolean(msg.content.match(mentionRegex))
}

export function isBot(msg: Message): boolean {
  return Boolean(msg.author?.bot)
}

export function validateRole(g: Guild, role: string | undefined): Snowflake | undefined {
  return g.roles.cache.get(role?.replace(/[<@&>]/g, '') as any)?.id
}

export function canBot(perm: PermissionResolvable, channel?: TextBasedChannel | ThreadChannel | null): boolean {
  const unsupported = [DMChannel]
  const isSupported = unsupported.every((type) => !(channel instanceof type))
  const validated = <TextChannel | ThreadChannel | NewsChannel | undefined>channel
  return (
    isSupported && !!validated?.guild?.members.me && validated.permissionsFor(validated.guild.members.me!).has(perm)
  )
}

export function snowflakeToUnix(snowflake: Snowflake): number {
  return new Date(Number(snowflake) / 4194304 + 1420070400000).getTime()
}