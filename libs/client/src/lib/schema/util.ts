import { z } from 'zod'

export const objectIdRegex = /^[0-9a-fA-F]{24}$/


// Validation schema for IntFieldUpdateOperationsInput
const IntFieldUpdateOperationsInput = z.object({
  increment: z.number().optional(),
  decrement: z.number().optional(),
  set: z.number().optional(),
  multiply: z.number().optional(),
  divide: z.number().optional(),
})
  .refine(data => {
    const keys = Object.keys(data)
    const operationCount = keys.filter(key => (data as any)[key] !== undefined).length
    return operationCount === 1
  }, {
    message: 'Only one update operation should be specified',
  })

export const PrismaNumber = z.union([
  z.number(),
  IntFieldUpdateOperationsInput,
])

export const MongoId = z.string().regex(objectIdRegex)

export const JsonObject = z.any()
