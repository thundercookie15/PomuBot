import {RateLimitData} from 'discord.js'
import {warn} from '../../helpers'

export function rateLimit(data: RateLimitData) {
  warn(`RATE LIMITED! ${JSON.stringify(data)}`)
}
