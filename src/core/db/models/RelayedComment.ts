import {prop} from '@typegoose/typegoose'
import {Snowflake} from 'discord.js'
import {VideoId} from '../../../modules/holodex/frames'

export class RelayedComment {
  @prop({type: () => String, required: false})
  public msgId?: Snowflake

  @prop({type: () => String, required: false})
  public discordCh?: Snowflake

  @prop({required: true})
  public body: string

  @prop({required: true})
  public ytId: string

  @prop({required: true})
  public author: string

  @prop({required: true})
  public timestamp: string

  @prop({type: () => String, required: true})
  public stream: VideoId

  @prop({required: true})
  public absoluteTime: number
}
