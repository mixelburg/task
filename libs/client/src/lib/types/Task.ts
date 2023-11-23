import { Prisma, PrismaTask, Subtask, TaskEnvironment } from '@tasks/prisma/client'
import { TaskService, taskServiceSchema } from './TaskService'
import { TaskTypeGeneric, taskTypeOptions } from './TaskType'
import { TaskSubtypeGeneric, taskSubtypeOptions } from './TaskSubtype'
import PrismaTaskWhereInput = Prisma.PrismaTaskWhereInput
import PrismaTaskSelect = Prisma.PrismaTaskSelect
import { z } from 'zod'
import { JsonObject, MongoId, PrismaNumber } from '../schema/util'

export type TaskDefinitionGenericWithoutService<
  S extends TaskService,
  T extends TaskTypeGeneric<S>,
> = TaskSubtypeGeneric<S, T> extends undefined
  ?
  | {
  type: T
}
  | {
  type: T
  subtype: undefined
}
  : {
    type: T
    subtype: TaskSubtypeGeneric<S, T>
  }

export type TaskDefinitionGenericWithService<S extends TaskService, T extends TaskTypeGeneric<S>> = {
  service: S
} & TaskDefinitionGenericWithoutService<S, T>

export type TaskDefinitionGeneric<TS extends TaskService> = {
  [S in TaskService]: {
    [T in TaskTypeGeneric<S>]: TaskDefinitionGenericWithService<S, T>
  }
}[TS][TaskTypeGeneric<TS>]

export type TaskDefinition = { [S in TaskService]: TaskDefinitionGeneric<S> }[TaskService]

export type ServiceTaskDefinition<S extends TaskService> = {
  [T in TaskTypeGeneric<S>]: TaskDefinitionGenericWithoutService<S, T>
}[TaskTypeGeneric<S>] & { service?: S }

export const taskEnvironmentSchema = z.union([
  z.literal(TaskEnvironment.DEVELOPMENT),
  z.literal(TaskEnvironment.STAGING),
  z.literal(TaskEnvironment.PRODUCTION),
  z.literal(TaskEnvironment.LOCAL),
  z.literal(TaskEnvironment.TEST),
])

// Final schema combining TaskService, taskType, and TaskSubtype
const taskDefinitionSchema = z.object({
  service: taskServiceSchema,
  type: z.string(),
  subtype: z.string().optional(),
}).refine(data => {
  const options = taskTypeOptions[data.service] as string[]
  return options.includes(data.type)
}, {
  message: 'Invalid task type',
  path: ['type'],
}).refine(data => {
  const options = (taskSubtypeOptions as any)[data.service]?.[data.type] || [] as string[]
  if (options.length > 0) {
    return options.includes(data.subtype)
  }
  return true
}, {
  message: 'Invalid task subtype',
  path: ['subtype'],
})

export type Task = PrismaTask & TaskDefinition
export type ServiceTask<S extends TaskService> = PrismaTask & ServiceTaskDefinition<S> & { service: S }

export const findTaskDtoSchema = z.object({
  skip: z.number().optional(),
  take: z.number().optional(),
  where: z.object({}).optional(),
  orderBy: z.union([
    z.object({}),
    z.array(z.object({})),
  ]).optional(),
  select: z.object({}).optional(),
})
export type FindTaskDto<T extends PrismaTaskSelect | undefined = undefined> = {
  skip?: number
  take?: number
  where: PrismaTaskWhereInput
  orderBy?: Prisma.PrismaTaskOrderByWithRelationInput | Prisma.PrismaTaskOrderByWithRelationInput[],
  select?: T
}

export type FindTaskRaw<T extends Prisma.PrismaTaskDefaultArgs> = {
  skip?: number
  take?: number
  filter: any
  sort: any
  projection?: T
}

export type TaskProjectionResult<T extends Prisma.PrismaTaskDefaultArgs> =
  Prisma.PrismaTaskGetPayload<T>
  & TaskDefinition
  & { id: string }

export const fullTaskSelector = Prisma.validator<Prisma.PrismaTaskDefaultArgs>()({
  select: {
    id: true,
    meta: true,
    type: true,
    message: true,
    progress: true,
    state: true,
    createdAt: true,
    initiatedAt: true,
    startedAt: true,
    finishedAt: true,
    error: true,
    userId: true,
    retry: true,

    actions: {
      select: {
        id: true,
        taskId: true,
        name: true,
        createdAt: true,
        finishedAt: true,
        data: true,
        progress: true,
        state: true,
        message: true,
      },
      // order by createdAt desc but show IN_PROGRESS first
      orderBy: [{ createdAt: 'desc' }],
    },

    children: {
      select: {
        id: true,
        state: true,
        progress: true,

        service: true,
        type: true,
        subtype: true,
      },
      orderBy: [{ createdAt: 'desc' }],
    },
  },
})

export type TaskChild = TaskDefinition & Pick<Task, 'id' | 'state' | 'progress'>

export type FullTask = Task & {
  actions: Subtask[]
  children: TaskChild[]
}

export type FindRawTaskResponse<T extends Prisma.PrismaTaskDefaultArgs> = Prisma.PrismaTaskGetPayload<T> &
  TaskDefinition

export type ClientServiceConfig = TaskService | undefined
export type ClientTaskResult<S extends ClientServiceConfig> = S extends TaskService ? TaskDefinitionGeneric<S> : Task

type CreateTaskDtoBase = {
  userId?: string
  parentId?: string
  message?: string
  meta?: Prisma.JsonObject
  payload?: Prisma.JsonObject
}

// create
export type CreateTaskDtoGeneric<T extends keyof Task> = Pick<PrismaTask, T> & TaskDefinition & CreateTaskDtoBase

export type CreateTaskDto = CreateTaskDtoGeneric<'environment'>
export const createTaskDtoSchema =
  z.object({
    environment: taskEnvironmentSchema,
    userId: MongoId.optional(),
    message: z.string().optional(),
    parentId: MongoId.optional(),
    meta: JsonObject.optional(),
  }).and(taskDefinitionSchema)

type ClientCreateTaskDtoBase = CreateTaskDtoBase & {
  environment?: TaskEnvironment
}

export type ClientCreateTaskDto = ClientCreateTaskDtoBase & TaskDefinition

export const updateTaskDtoSchema = z.object({
  message: z.string(),
  progress: PrismaNumber.optional(),
})
export type UpdateTaskDto = z.infer<typeof updateTaskDtoSchema>

// finish
export const finishTaskDtoSchema = z.object({
  result: JsonObject.optional(),
})
export type FinishTaskDto = z.infer<typeof finishTaskDtoSchema>


// fail
export const failTaskErrorSchema = z.object({
  message: z.string(),
  stack: z.string(),
})
export type TaskFailError = z.infer<typeof failTaskErrorSchema>


