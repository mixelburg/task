import {
  PrismaClient,
  Subtask,
  Task,
  TaskApiClient, TaskEnvironment,
  TaskService,
  taskServiceOptions,
  TaskState,
  TaskSubtypeGeneric,
  taskSubtypeOptions, TaskType,
  TaskTypeGeneric,
  taskTypeOptions
} from "@tasks/client";
import { afterAll, describe, expect, it } from 'vitest'

const client = new TaskApiClient('TEST', 'http://127.0.0.1:3000/')
const prisma = new PrismaClient()

afterAll(async () => {
  await prisma.$disconnect()
})

const _createDummyTask = async () =>
  await client.create({
    service: TaskService.VSPHERE,
    type: TaskType.VSPHERE.CREATE
  })

const withDummyTask = async (cb: (task: Task) => Promise<void>) => {
  const task = await _createDummyTask()
  try {
    await cb(task)
  } catch (e) {
    throw e
  }
}

const withDummySubtask = async (cb: (task: Task, subtask: Subtask) => Promise<void>) => {
  const task = await _createDummyTask()
  const subtask = await client.subtask.create(task.id, {
    name: 'test',
    data: {
      foo: 'bar',
    },
  })
  try {
    await cb(task, subtask)
  } catch (e) {
    throw e
  }
}

it('should create task', async () => {
  await withDummyTask(async (task) => {
    expect(task).toBeDefined()
  })
})

describe('get', () => {
  it('should get task', async () => {
    await withDummyTask(async (task) => {
      const t = await client.get(task.id)
      expect(t).toEqual(task)
    })
  })

  it('should get full task', async () => {
    await withDummyTask(async (task) => {
      const t2 = await client.getFull(task.id)

      expect(t2.actions).toBeDefined()
      expect(t2.actions).toHaveLength(0)
    })
  })

  it('should find all tasks', async () => {
    await withDummyTask(async () => {
      const tasks = await client.find({
        take: 10,
        skip: 0,
        where: {},
      })
      expect(tasks.data).toBeDefined()
    })
  })
})

it('should delete task', async () => {
  await withDummyTask(async (task) => {
    const t2 = await client.delete(task.id)

    expect(task).toEqual(t2)
    const t3 = await client.get(task.id)
    expect(t3).toBeNull()
  })
})

it('should init task', async () => {
  await withDummyTask(async (t) => {
    expect(t.state).toEqual(TaskState.PENDING)
    await client.init(t.id)
    const t2 = await client.get(t.id)
    expect(t2.state).toEqual(TaskState.IN_PROGRESS)
  })
})

describe('update', () => {
  it('should update task', async () => {
    await withDummyTask(async (t) => {
      const t2 = await client.update(t.id, {
        message: 'test',
      })
      expect(t2.state).toEqual(TaskState.IN_PROGRESS)
      expect(t2.message).toEqual('test')
    })
  })

  it('should inclement progress', async () => {
    await withDummyTask(async (t) => {
      expect(t.progress).toEqual(0)
      const t2 = await client.update(t.id, {
        message: 'inc-10',
        progress: {
          increment: 10,
        },
      })
      expect(t2.progress).toEqual(10)
      const t3 = await client.update(t.id, {
        message: 'inc-20',
        progress: {
          increment: 10,
        },
      })
      expect(t3.progress).toEqual(20)
    })
  })
})

describe('subtasks', () => {
  it('should create subtask', async () => {
    await withDummySubtask(async (task, subtask) => {
      expect(subtask.taskId).toEqual(task.id)
      expect(subtask.name).toEqual('test')
      expect(subtask.data).toEqual({ foo: 'bar' })
    })
  })

  it('should update subtask', async () => {
    await withDummySubtask(async (task, subtask) => {
      const t3 = await client.subtask.update(subtask.id, {
        message: 'test2',
      })
      expect(t3.message).toEqual('test2')
    })
  })

  it('should finish subtask', async () => {
    await withDummySubtask(async (task, subtask) => {
      const t3 = await client.subtask.finish(subtask.id, false)
      expect(t3.state).toEqual(TaskState.DONE)
      expect(t3.finishedAt).toBeDefined()
    })
  })

  it('should fail subtask', async () => {
    await withDummySubtask(async (task, subtask) => {
      const t3 = await client.subtask.fail(subtask.id)
      expect(t3.state).toEqual(TaskState.ERROR)
      expect(t3.finishedAt).toBeDefined()
    })
  })
})

describe('ancestors', () => {
  it('should get ancestors', async () => {
    await withDummyTask(async (task) => {
      const taskChild = await client.create({
        service: TaskService.VSPHERE,
        type: TaskType.VSPHERE.CREATE,
        parentId: task.id,
      })

      const fullTask = await client.getFull(task.id)
      expect(fullTask.children).toHaveLength(1)
      expect(fullTask.children[0].id).toEqual(taskChild.id)
    })
  })
})

describe('variations', () => {
  for (const service of taskServiceOptions) {
    for (const taskType of taskTypeOptions[service]) {
      it(`should create ${service} ${taskType}`, async () => {
        if ((taskSubtypeOptions as any)?.[service]?.[taskType]) {
          for (const taskSubType of (taskSubtypeOptions as any)[service][taskType]) {
            const t = await client.create({
              service,
              type: taskType as TaskTypeGeneric<typeof service>,
              subtype: taskSubType as TaskSubtypeGeneric<typeof service, typeof taskType>,
            } as any)
            expect(t).toBeDefined()

          }
        } else {
          const t = await client.create({
            service,
            type: taskType as TaskTypeGeneric<typeof service>,
          } as any)
          expect(t).toBeDefined()

        }
      })
    }
  }
})

describe('raw', () => {
  it('should find raw', async () => {
    await withDummyTask(async (task) => {
      const child = await client.create({
        parentId: task.id,
        service: TaskService.VSPHERE,
        type: TaskType.VSPHERE.CREATE,
      })
      await client.prisma.findRaw({
        filter: {
          id: child.id,
        },
        sort: undefined,
        projection: {
          select: {
            id: true,
            finishedAt: true,
            parent: {
              select: {
                id: true,
                meta: true,
              },
            },
          },
        },
      })

      await client.prisma.findRaw({
        filter: {
          id: task.id,
        },
        sort: undefined,
        projection: {
          select: {
            id: true,
            createdAt: true,
            environment: true,
            children: {
              select: {
                id: true,
                meta: true,
              },
            },
          },
        },
      })
    })
  })
})
