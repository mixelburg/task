import { z } from 'zod'

export const TaskService = {
  GLOBAL: 'GLOBAL',
  VSPHERE: 'VSPHERE',
  OPNSENSE: 'OPNSENSE',
} as const

export const taskServiceOptions = Object.values(TaskService)

export type TaskService = (typeof taskServiceOptions)[number]

export const taskServiceSchema = z.nativeEnum(TaskService)
