import merge from 'ts-deepmerge'
import {client} from '../../core/'
import {
  Message,
  AttachmentBuilder,
  EmbedBuilder,
  EmbedData,
  MessageCreateOptions,
  MessagePayload,
  TextBasedChannel,
  EmojiIdentifierResolvable,
  MessageReaction,
  ButtonBuilder,
  ActionRowBuilder,
  CommandInteraction,
  ThreadChannel,
  ContextMenuCommandInteraction,
} from 'discord.js'
import {warn} from '../logging'
import {canBot} from './general'

const {isArray} = Array

export async function reply(
  msg: Message | CommandInteraction | ContextMenuCommandInteraction,
  embed?: EmbedBuilder | EmbedBuilder[],
  text?: string,
  file?: AttachmentBuilder,
): Promise<Message | Message[] | undefined | void> {
  if (!canBot('SendMessages', msg.channel)) return
  const replyFn = msg instanceof Message ? msg.reply.bind(msg) : msg.editReply.bind(msg)
  const contextMenuIntrPayload = {
    ...(embed ? {embeds: isArray(embed) ? embed : [embed]} : {}),
    ...(text ? {content: text} : {}),
    ...(file ? {files: [file]} : {}),
  }
  const payload = {...contextMenuIntrPayload, failIfNotExists: false}

  if (msg instanceof ContextMenuCommandInteraction) {
    return replyFn(contextMenuIntrPayload).catch((err: any) => {
      warn(err)
      warn('trying to reply normally')
      msg.reply(contextMenuIntrPayload).catch(warn)
    })
  } else {
    return replyFn(payload).catch((err: any) => {
      warn(err)
      warn('trying to reply normally')
      msg.reply(contextMenuIntrPayload).catch(warn)
    })
  }
}

export async function send(
  channel: TextBasedChannel | ThreadChannel | undefined,
  content: string | MessageCreateOptions | MessagePayload,
): Promise<Message | undefined> {
  if (canBot('SendMessages', channel)) {
    return channel!.send(content)
      .then((msg) => {
        return msg
      })
      .catch((e) => warn(`${channel!.id} ${e}`))
  }
}

export function createEmbedMessage(body: string, fancy: boolean = false): EmbedBuilder {
  return createEmbed({
    author: fancy ? getEmbedSelfAuthor() : undefined,
    thumbnail: fancy ? getEmbedSelfThumbnail() : undefined,
    description: body,
  })
}

export function createEmbed(
  options: Partial<EmbedData>,
  fancy: boolean = false,
): EmbedBuilder {
  const base: Partial<EmbedData> = {
    author: fancy ? getEmbedSelfAuthor() : undefined,
    color: 9323671,
    thumbnail: fancy ? getEmbedSelfThumbnail() : undefined,
  }
  return new EmbedBuilder(merge(base, options))
}

export function createTxtEmbed(title: string, content: string): AttachmentBuilder {
  return new AttachmentBuilder(Buffer.from(content, 'utf-8')).setName(title)
}

export async function react(
  msg: Message | undefined,
  emj: EmojiIdentifierResolvable,
): Promise<MessageReaction | undefined> {
  if (canBot('AddReactions', msg?.channel)) {
    return msg?.react(emj)
  }
}

export function ButtonRow(buttons: { label: string, customId: string, style: number }[]): ActionRowBuilder {
  return new ActionRowBuilder({
    components: buttons.map((opts) => new ButtonBuilder(opts)),
  })
}

//// PRIVATE //////////////////////////////////////////////////////////////////

function getEmbedSelfAuthor(): { name: string, iconURL: string } {
  return {
    name: client.user!.username,
    iconURL: client.user!.displayAvatarURL(),
  }
}

function getEmbedSelfThumbnail(): { url: string } {
  return {url: client.user!.displayAvatarURL()}
}
