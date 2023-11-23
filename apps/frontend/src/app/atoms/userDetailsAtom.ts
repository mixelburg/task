import { atomWithDefault } from 'jotai/utils'
import { UserDetails } from '@tasks/types'

export const userDetailsAtom = atomWithDefault<UserDetails | undefined>(() => undefined)

