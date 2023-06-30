import {AttachmentBuilder, ChatInputCommandInteraction} from 'discord.js'
import {Command, createEmbedMessage, reply, send} from '../../helpers/discord'
import {getStartTime, VideoId} from '../../modules/holodex/frames'
import {getRelayHistory, filterAndStringifyHistory} from '../db/functions'
import {RelayedComment} from '../db/models/RelayedComment'
import {SlashCommandBuilder} from '@discordjs/builders'

const description = 'Posts the archived relay log for a given video ID.'

export const log: Command = {
  config: {
    permLevel: 0,
  },
  help: {
    category: 'Relay',
    description,
  },
  slash: new SlashCommandBuilder()
    .setName('log')
    .setDescription(description)
    .addStringOption((option) => option.setName('videoid').setDescription('Video ID').setRequired(true)),
  callback: async (intr: ChatInputCommandInteraction) => {
    const videoId = intr.options.getString('videoid')!
    const history = await getRelayHistory(videoId)
    const processMsg = !history ? notifyLogNotFound : sendLog

    processMsg(intr, videoId!, history!)
  },
}

function notifyLogNotFound(intr: ChatInputCommandInteraction, videoId: VideoId): void {
  reply(intr, createEmbedMessage(`Log not found for ${videoId}`))
}

async function sendLog(
  intr: ChatInputCommandInteraction,
  videoId: VideoId,
  history: RelayedComment[],
): Promise<void> {
  const start = await getStartTime(videoId)
  const tlLog = filterAndStringifyHistory(intr, history, start)
  intr.editReply( {
    content: `Here is the TL log for <https://youtu.be/${videoId}>`,
    files: [{attachment: Buffer.from(tlLog), name: `${videoId}.txt`}],
  })
}
