export const defaultGuard = (val: never): never => {
  throw new Error(`case not handled: ${val}`)
}

