import { Prisma } from '@tasks/prisma/client'
import { z } from 'zod'
import { JsonObject } from '../schema/util'

export type SubtaskOnProgress = (progress: number, message?: string, meta?: Prisma.JsonObject) => Promise<void>

export type ExtendedSubtaskResult<T> = { data: T; meta?: Prisma.JsonObject }
export type SubtaskResult<T> = T | ExtendedSubtaskResult<T>
export type SubtaskCallback<T> = (onProgress: SubtaskOnProgress) => Promise<SubtaskResult<T>>

export const isExtendedResult = <T>(result: SubtaskResult<T>): result is ExtendedSubtaskResult<T> => {
  return (result as ExtendedSubtaskResult<T>)?.data !== undefined
}

export type SubtaskOptions = {
  data?: Prisma.JsonObject
  progress?: boolean
}

// create
export const createSubtaskDtoSchema = z.object({
  name: z.string(),
  data: JsonObject.optional(),
  progress: z.number().optional(),
})
export type CreateSubtaskDto = z.infer<typeof createSubtaskDtoSchema>

// finish
export const finishSubtaskSDtoSchema = z.object({
  progress: z.boolean(),
  meta: z.any().optional(),
})
export type FinishSubtaskDto = z.infer<typeof finishSubtaskSDtoSchema>

// update
export const updateSubtaskDtoSchema = z.object({
  progress: z.number().optional(),
  message: z.string().optional(),
  data: JsonObject.optional(),
})
export type UpdateSubtaskDto = z.infer<typeof updateSubtaskDtoSchema>
