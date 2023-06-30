import chalk from 'chalk'
import {match} from './'
import fs from 'fs'
import {config} from '../config'

/** Logs formatted message to console and log file. */
export function log(data: any) {
  return logger('log', data)
}

/** Logs formatted warning to console and log file. */
export function warn(data: any) {
  return logger('warn', data)
}

/** Logs formatted debug information to console and log file. */
export function debug(data: any) {
  return logger('debug', data)
}

////////////////////////////////////////////////////////////////////////////////

function logger<T>(category: string, data: T): T {
  const logFile = fs.createWriteStream('debug3.log', {flags: 'a'})
  const colorString = match(category, {
    log: chalk.bgBlack,
    warn: chalk.black.bgYellowBright,
    error: chalk.black.bgRedBright,
    debug: chalk.black.bgGreenBright,
  })

  const timeYYYYMMDD = new Date().toISOString().substr(0, 10)
  const timeHHMM = new Date().toISOString().substr(11, 5)
  const label = colorString(` ${category.toUpperCase()} `)

  console.log(`${timeHHMM} ${label} ${data}`)
  logFile.write(`${category} | ${timeYYYYMMDD} ${timeHHMM} | ${data}\n`)
  logFile.close()

  return data
}
