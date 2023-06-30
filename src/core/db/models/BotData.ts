/** @file Persistent data not specific to any server */
import {getModelForClass, prop} from '@typegoose/typegoose'
import {PropType} from '@typegoose/typegoose/lib/internal/constants'
import {VideoId} from '../../../modules/holodex/frames'
import {RelayedComment} from './RelayedComment'

export class BotData {
  @prop({type: () => [String], default: []})
  public notifiedYtLives: VideoId[]

  @prop({type: String, default: () => new Map()}, PropType.MAP)
  lastCommunityPosts: Map<YouTubeChannelId, CommunityPostURL>

  @prop({type: () => [RelayedComment], default: () => new Map()}, PropType.MAP)
  relayHistory: Map<VideoId, RelayedComment[]>
}

export const BotDataDb = getModelForClass(BotData)

export type YouTubeChannelId = string

///////////////////////////////////////////////////////////////////////////////

type CommunityPostURL = string
