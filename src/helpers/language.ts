/** @file General helpers wrapping around ECMAScript itself */
import {equals, head, isEmpty, isNil, tail} from 'ramda'

/**
 * Match expression. Supply it a dictionary for patterns, or Map if you
 * need keys of other types than string.
 * Must return a function for lazy evaluation; you may call it
 * later or immediately, e.g. `match (scrutinee, patterns) ()`
 */
export function match(
  scrutinee: unknown,
  patterns: Map<any, Fn> | Record<string | symbol, Fn>,
): Fn {
  return patterns instanceof Map
    ? patterns.get(scrutinee ?? 'default') ?? doNothing
    : typeof scrutinee === 'string'
      ? patterns[scrutinee] ?? 'default' ?? doNothing
      : throwIt(new TypeError('Invalid scrutinee type. Try using a Map.'))
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Imperfect throw expression awaiting the TC39 proposal to advance. */
export function throwIt(err: Error | string): never {
  throw typeof err === 'string' ? new Error(err) : err
}

export async function asyncFind<T>(
  haystack: T[],
  predicate: (scrutinee: T) => Promise<boolean> | boolean,
): Promise<T | undefined> {
  const checkHead = () => predicate(head(haystack)!)
  return isEmpty(haystack)
    ? undefined
    : (await checkHead())
      ? head(haystack)
      : asyncFind(tail(haystack), predicate)
}

export function doNothing(): void {
}

export function toTitleCase(str: string): string {
  return str.toLowerCase().replace(/\b(\w)/g, (c) => c.toUpperCase())
}

export function ciEquals(a: string, b: string) {
  return a.localeCompare(b, undefined, {sensitivity: 'accent'}) === 0
}

export function removeDupes<T>(array: T[]): T[] {
  return [...new Set(array)]
}

export function removeDupeObjects<T extends object>(array: T[]): T[] {
  return array.filter((x, i) => i === array.findIndex((y) => equals(x, y)))
}

export function isNotNil(scrutinee: unknown): boolean {
  return !isNil(scrutinee)
}

export type Fn = (...args: unknown[]) => unknown

export function isEven(n: number): boolean {
  return n % 2 === 0
}

export function isJp(s: string): boolean {
  return /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/.test(s)
}
