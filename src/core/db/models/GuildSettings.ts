/**
 * @file MongoDB model for guild settings. Using MongoDB over a simple
 * Enmap as settings also need to be accessed from the web dashboard.
 */
import {getModelForClass, prop} from '@typegoose/typegoose'
import {Snowflake} from 'discord.js'
import {StreamerName} from '../streamers/'

export class WatchFeatureSettings {
  @prop({required: true})
  public streamer: StreamerName

  @prop({type: () => String, required: true})
  public discordCh: Snowflake

  @prop({type: () => String})
  public roleToNotify?: Snowflake
}

export class BlacklistItem {
  @prop({required: true})
  public ytId: string

  @prop({required: true})
  public name: string

  @prop()
  public reason?: string
}

export class GuildSettings {
  @prop({type: () => String})
  public _id: Snowflake

  @prop({type: () => [String], default: []})
  public admins: Snowflake[]

  @prop({type: () => BlacklistItem, default: []})
  public blacklist: BlacklistItem[]

  @prop({type: () => [String], default: []})
  public blacklisters: Snowflake[]

  @prop({type: () => WatchFeatureSettings, default: []})
  public cameos: WatchFeatureSettings[]

  @prop({type: () => WatchFeatureSettings, default: []})
  public community: WatchFeatureSettings[]

  @prop({type: () => [String], default: []})
  public customWantedPatterns: string[]

  @prop({type: () => [String], default: []})
  public customBannedPatterns: string[]

  @prop({default: true})
  public deepl: boolean

  @prop({default: 'English'})
  public language: string

  @prop({type: () => String})
  public logChannel?: Snowflake

  @prop({type: () => WatchFeatureSettings, default: []})
  public gossip: WatchFeatureSettings[]

  @prop({default: true})
  public modMessages: boolean

  @prop({default: true})
  public prechat: boolean

  @prop({type: () => WatchFeatureSettings, default: []})
  public relay: WatchFeatureSettings[]

  @prop({default: false})
  public threads: boolean

  @prop({type: () => WatchFeatureSettings, default: []})
  public twitcasting: WatchFeatureSettings[]

  @prop({type: () => WatchFeatureSettings})
  youtube: WatchFeatureSettings[]
}

export const GuildSettingsDb = getModelForClass(GuildSettings)

export type RoleSetting = 'admins' | 'blacklisters'

export type WatchFeature = 'community' | 'gossip' | 'cameos' | 'relay' | 'twitcasting' | 'youtube'

export type SettingToggle = 'deepl' | 'modMessages' | 'threads' | 'prechat'
