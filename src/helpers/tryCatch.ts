export function tryOrDefault<T>(tryFn: () => T, defaultValue: T): T {
  try {
    return tryFn()
  } catch (e) {
    return defaultValue
  }
}

export async function asyncTryOrDefault<T>(
  tryFn: () => T | Promise<T>,
  defaultValue: T,
): Promise<T> {
  try {
    return await tryFn()
  } catch (e) {
    return defaultValue
  }
}

export function tryOrLog<T>(tryFn: () => T): T | undefined {
  return tryOrDefault(tryFn, undefined)
}

export async function asyncTryOrLog<T>(tryFn: () => Promise<T>): Promise<T | undefined> {
  return asyncTryOrDefault(tryFn, undefined)
}
