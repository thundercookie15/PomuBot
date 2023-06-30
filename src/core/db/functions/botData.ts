import {DocumentType} from '@typegoose/typegoose'
import Enmap from 'enmap'
import {UpdateQuery} from 'mongoose'
import {setKey, filter} from '../../../helpers/immutableES6MapFunctions'
import {VideoId} from '../../../modules/holodex/frames'
import {BotData, BotDataDb} from '../models'
import {RelayedComment} from '../models/RelayedComment'

const _id = '000000000022'

export const botDataEnmap = new Enmap({name: 'botData'})

export function addNotifiedLive(videoId: VideoId): void {
  const currentList = botDataEnmap.ensure('notifiedYtLives', []) as VideoId[]
  botDataEnmap.set('notifiedYtLives', [...currentList, videoId] as VideoId[])
}

export function getNotifiedLives(): VideoId[] {
  return botDataEnmap.ensure('notifiedYtLives', []) as VideoId[]
}

export function addNotifiedPrechats(videoId: VideoId): void {
  const currentList = botDataEnmap.ensure('notifiedPreChats', []) as VideoId
  botDataEnmap.set('notifiedPreChats', [...currentList, videoId] as VideoId[])
}

export function getNotifiedPrechats(): VideoId[] {
  return botDataEnmap.ensure('notifiedPreChats', []) as VideoId[]
}

export function addNotifiedCommunityPost(url: string): void {
  const currentList = botDataEnmap.ensure('notifiedCommunityPosts', [])
  botDataEnmap.set('notifiedCommunityPosts', [...currentList, url])
}

export function getNotifiedCommunityPosts(): string[] {
  return botDataEnmap.ensure('notifiedCommunityPosts', []) as string[]
}

export async function getBotData(): Promise<BotData> {
  const query = [{_id}, {}, {upsert: true, new: true}] as const
  return BotDataDb.findOneAndUpdate(...query)
}

export async function getRelayHistory(videoId?: VideoId): Promise<RelayedComment[] | undefined> {
  const botData = await getBotData()
  const hists = botData.relayHistory
  return hists.get(videoId ?? '')
}

export async function addToBotRelayHistory(videoId: VideoId, cmt: RelayedComment): Promise<void> {
  const history = (await getBotData()).relayHistory
  const cmts = history.get(videoId) ?? []
  const newHistory = setKey(videoId, [...cmts, cmt])(history)
  updateBotData({relayHistory: newHistory})
}

export async function clearOldBotData() {
  console.log('clearing old bot data...')
  const history = (await getBotData()).relayHistory
  console.log(`history len is ${history.size}`)
  const newHistory = filter(history, (v, k) => v[0].absoluteTime > Date.now() - 86400000)
  console.log(`new his len ${newHistory.size}`)
  updateBotData({relayHistory: newHistory})
  console.log('done clearing')
}

///////////////////////////////////////////////////////////////////////////////

async function updateBotData(update: NewData): Promise<void> {
  const query = [{_id}, update, {upsert: true, new: true}] as const
  await BotDataDb.findOneAndUpdate(...query)
}

type NewData = UpdateQuery<DocumentType<BotData>>
