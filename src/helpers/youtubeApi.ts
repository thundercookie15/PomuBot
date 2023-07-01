import {google} from "googleapis";
import {log} from "./logging";

const youtube = google.youtube({version: "v3", auth: 'YOUTUBE_API_KEY'});

export async function getUsernameFromId(id: string) {
  // @ts-ignore
  const {data} = await youtube.channels.list({
    // @ts-ignore
    part: "snippet",
    id,
  }).catch((err) => { log(err); })
  if (data.items === undefined) return undefined;
  return data.items[0].snippet.title!;
}