/**
 * LUNA'S TRANSLATIONS DISCORD BOT
 */
Error.stackTraceLimit = Infinity
import * as dotenv from 'dotenv'

dotenv.config({path: __dirname + '/../.env'})
import {config} from './config'
import {client} from './core/'
import mongoose from 'mongoose'

const MONGODB_URL = 'mongodb://127.0.0.1/'

mongoose.connect(MONGODB_URL, {
  dbName: process.env.DATABASE_NAME,
})

process.on('uncaughtException', function (err) {
  console.log('Uncaught exception: ' + err)
  client.guilds.cache.find((g) => g.id === '')
  const ch = client.channels.cache.get('1098360039955234927')
  ch?.isTextBased() && ch.send('UNCAUGHT EXCEPTION')

  console.log(err.stack)
})

client.login(config.token)
