import {Streamer} from '../../core/db/streamers'
import {log} from '../../helpers'
import {DexFrame} from '../holodex/frames'
import {ChatComment} from './chatRelayer'
import {isStreamer, isTl} from './commentBooleans'

export function logCommentData(cmt: ChatComment, frame: DexFrame, streamer?: Streamer): void {
  const templates = {
    owner: `Owner: ${cmt.name} | ${frame.id}`,
    mod: `Mod: ${cmt.name} | ${streamer!.name} | ${frame.id}`,
    tl: `TL: ${cmt.name} | ${streamer!.name} | ${frame.id}`,
    cameo: `Cameo: ${cmt.name} | ${frame.channel.name} (${frame.id})`,
  }

  if (cmt.isOwner) return log(templates.owner)
  if (isStreamer(cmt.id)) return log(templates.cameo)
  if (isTl(cmt.body)) return log(templates.tl)
  if (cmt.isMod) return log(templates.mod)
}
