import {Inject, Injectable} from '@nestjs/common'
import {
  CreateTaskDto,
  FindTaskDto,
  FullTask,
  fullTaskSelector,
  PaginationResponse,
  Prisma,
  PrismaClient,
  Subtask,
  SubtaskState,
  Task,
  TaskFailError,
  TaskState,
  UpdateTaskDto,
} from '@tasks/client'
import { CreateSubtaskDto, UpdateSubtaskDto } from '@tasks/client'
import {NotificationsService} from "./services/notifications/notifications.service";

const retryDeadlock = async <T>(
  callback: () => Promise<T>,
  maxRetries = 5,
): Promise<T> => {
  let retries = 0
  while (true) {
    try {
      return await callback()
    } catch (e: any) {
      if (e?.code === 'P2034' && retries < maxRetries) {
        retries++
        continue
      }
      throw e
    }
  }
}

const __prisma = new PrismaClient()


export const _prisma = __prisma.$extends({
  // override findUnique to return full task
  model: {
    prismaTask: {
      findUnique: async (args: Parameters<typeof __prisma.prismaTask.findUnique>[0]) =>
        (await __prisma.prismaTask.findUnique(args)) as Task,
      create: async (args: Parameters<typeof __prisma.prismaTask.create>[0]) => (await __prisma.prismaTask.create(args)) as Task,
      update: async (args: Parameters<typeof __prisma.prismaTask.update>[0]) => (await __prisma.prismaTask.update(args)) as Task,
      delete: async (args: Parameters<typeof __prisma.prismaTask.delete>[0]) => (await __prisma.prismaTask.delete(args)) as Task,
      findMany: async (args: Parameters<typeof __prisma.prismaTask.findMany>[0]) => (await __prisma.prismaTask.findMany(args)) as Task[],
    },
  },
})

_prisma.prismaTask.findMany({
  where: {
    retry: {
      gte: 5
    }
  }
})


class SubtaskService {

  async create(
    taskId: string,
    data: CreateSubtaskDto,
  ): Promise<Subtask> {
    return _prisma.subtask.create({
      data: {
        taskId,
        ...data,
      },
    })
  }

  async update(id: string, data: UpdateSubtaskDto): Promise<Subtask> {
    return _prisma.subtask.update({
      where: { id },
      data,
    })
  }

  async finish(
    id: string,
    progress: boolean,
    meta?: Prisma.JsonObject,
  ): Promise<Subtask> {
    return _prisma.subtask.update({
      where: { id },
      data: {
        finishedAt: new Date(),
        state: SubtaskState.DONE,
        data: meta || undefined,
        progress: progress ? 100 : undefined,
      },
    })
  }

  async fail(id: string): Promise<Subtask> {
    return _prisma.subtask.update({
      where: { id },
      data: {
        state: SubtaskState.ERROR,
      },
    })
  }
}

@Injectable()
export class AppService {
  constructor(
    @Inject(NotificationsService) private readonly notifications: NotificationsService
  ) {
  }


  public readonly subtask = new SubtaskService()
  public readonly prisma = _prisma

  async find(options: FindTaskDto): Promise<PaginationResponse<Task>> {
    return {
      data: await _prisma.prismaTask.findMany({
        skip: options.skip,
        take: options.take,
        where: options.where,
        orderBy: options.orderBy,
        select: options.select,
      }),
      total: await _prisma.prismaTask.count({
        where: options.where,
      }),
    }
  }

  async get(id: string): Promise<Task> {
    return await _prisma.prismaTask.findUnique({
      where: {
        id,
      },
    })
  }

  async getFull(id: string): Promise<FullTask> {
    return (await _prisma.prismaTask.findUnique({
      where: { id },
      ...fullTaskSelector,
    } as any)) as FullTask
  }

  async create(data: CreateTaskDto): Promise<Task> {
    return _prisma.prismaTask.create({
      data: data as any,
    })
  }

  async delete(id: string): Promise<Task> {
    return _prisma.prismaTask.delete({
      where: { id },
    })
  }

  async initTask(taskId: string) {
    return _prisma.prismaTask.updateMany({
      where: {
        id: taskId,
        state: TaskState.PENDING,
        OR: [
          {
            startedAt: {
              isSet: false,
            },
          },
          {
            // check if startedAt is null
            startedAt: null,
          },
        ],
      },
      data: {
        state: TaskState.IN_PROGRESS,
        startedAt: new Date(),
      },
    })
  }

  async update(id: string, data: UpdateTaskDto): Promise<Task> {
    const payload: Prisma.PrismaTaskUpdateInput = { ...data }

    if (typeof payload?.progress === 'number') {
      payload.progress = Math.floor(payload.progress)
    }
    if (
      (payload?.progress as Prisma.IntFieldUpdateOperationsInput)?.increment
    ) {
      ;(payload?.progress as Prisma.IntFieldUpdateOperationsInput).increment =
        Math.floor(
          (payload?.progress as Prisma.IntFieldUpdateOperationsInput).increment || 0,
        )
    }

    await this.initTask(id)

    return _prisma.prismaTask.update({
      where: { id },
      data: payload,
    })
  }


  async finish(id: string, result?: Prisma.JsonObject): Promise<Task> {
    let newMeta = undefined
    if (result) {
      const taskMeta = (
        (await _prisma.prismaTask.findUnique({
          where: { id },
        })) as Task
      ).meta
      newMeta = {
        ...(taskMeta as any),
        result,
      }
    }

    const [, task] = await Promise.all([
      _prisma.subtask.updateMany({
        where: {
          taskId: id,
          state: SubtaskState.IN_PROGRESS,
        },
        data: {
          finishedAt: new Date(),
          state: SubtaskState.DONE,
        },
      }),
      _prisma.prismaTask.update({
        where: { id },
        data: {
          progress: 100,
          state: TaskState.DONE,
          finishedAt: new Date(),
          meta: newMeta,
        },
      }),
    ])
    return task
  }

  async fail(id: string, error: TaskFailError): Promise<Task> {
    const [_, task] = await retryDeadlock(
      async () =>
        await Promise.all([
          _prisma.subtask.updateMany({
            where: {
              taskId: id,
              state: SubtaskState.IN_PROGRESS,
            },
            data: {
              state: SubtaskState.STOPPED,
            },
          }),
          _prisma.prismaTask.update({
            where: { id },
            data: {
              stoppedAt: new Date(),
              state: TaskState.ERROR,
              error: {
                message: error.message,
                stack: error.stack,
              } as Prisma.JsonObject,
            },
          }),
        ]),
    )
    this.notifications.handleError(task).catch(console.error)
    return task
  }
}
