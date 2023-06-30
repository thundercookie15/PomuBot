import fetch, {RequestInit} from 'node-fetch'
import {debug} from './logging'

export async function getJson(endpoint: string, options?: RequestInit): Promise<any> {
  const resp = await fetch(endpoint, options)
  if (resp.status === 200) return resp.json()
  debug(await resp.text())
  throw new Error('fetch error code non 200')
}

export async function getText(endpoint: string, options?: RequestInit): Promise<string> {
  const resp = await fetch(endpoint, options)
  return resp.text()
}

export function Params(params: UrlParams) {
  return new URLSearchParams(params)
}

///////////////////////////////////////////////////////////////////////////////

type UrlParams = string | Record<string, string> | URLSearchParams | undefined
