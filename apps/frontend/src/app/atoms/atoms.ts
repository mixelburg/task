import { HealthCheckResponse } from '@tasks/types'
import { atom, PrimitiveAtom } from 'jotai'

export const backendHealthAtom = atom<HealthCheckResponse | undefined>(undefined) as PrimitiveAtom<HealthCheckResponse | undefined>
