import {warn} from '../../helpers'

export function error(error: Error) {
  warn('Discord.js error:\n' + JSON.stringify(error))
}
