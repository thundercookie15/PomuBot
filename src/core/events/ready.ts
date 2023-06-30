import {client} from '../'
// import { config } from '../../config'
import {log} from '../../helpers'
import {isMainThread} from 'worker_threads'
import {ActivityType} from 'discord.js'
import {clearOldBotData, clearOldData} from "../db/functions";

export async function ready() {
  log(`${client.user!.tag} serving ${client.guilds.cache.size} servers.`)
  client.user!.setActivity(`DAILY MAINTENANCES (DEBUGGING)`, {type: ActivityType.Playing})
  if (isMainThread) {
    console.log('community notifier...')
    import('../../modules/community/communityNotifier')
    console.log('youtube notifier..')
    import('../../modules/youtubeNotifier')
    console.log('twitcasting notifier..')
    import('../../modules/twitcastingNotifier')
    console.log('chatrelayer')
    import('../../modules/livechat/chatRelayer')

    setInterval(clearOldData, 24 * 60 * 60 * 100)
    setInterval(clearOldBotData, 24 * 60 * 60 * 100)
    clearOldData()
    clearOldBotData()
  }
}
