import { Test } from '@nestjs/testing'

import { AppService, _prisma } from './app.service'
import { SubtaskState, TaskFailError, TaskService, TaskState, TaskType } from "@tasks/client";

import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { TaskEnvironment } from "@tasks/prisma/client";
import { NotificationsService } from "./services/notifications/notifications.service";

let service: AppService
beforeAll(async () => {
  const app = await Test.createTestingModule({
    providers: [AppService, NotificationsService],
  }).compile()

  service = app.get<AppService>(AppService)
})

const createDummyTask = async () =>
  await service.create({
    environment: TaskEnvironment.TEST,
    service: TaskService.VSPHERE,
    type: TaskType.VSPHERE.CREATE,
  })

const createDummySubtask = async () => {
  const task = await createDummyTask()
  const subtask = await service.subtask.create(task.id, {
    name: 'test',
    data: {
      foo: 'bar',
    },
  })
  return { task, subtask }
}

afterAll(async () => {
  // delete all tasks
  await _prisma.prismaTask.deleteMany({
    where: {
      environment: 'TEST',
    },
  })
  await _prisma.$disconnect()
})

describe('basic operations', () => {
  it('should create task', async () => {
    const t = await createDummyTask()

    expect(t).toBeDefined()
  })

  describe('get', () => {
    it('should get task', async () => {
      const t = await createDummyTask()
      const t2 = await service.get(t.id)

      expect(t).toEqual(t2)
    })

    it('should get full task', async () => {
      const t = await createDummyTask()
      const t2 = await service.getFull(t.id)

      expect(t2.actions).toBeDefined()
      expect(t2.actions).toHaveLength(0)
    })

    it('should find all tasks', async () => {
      await createDummyTask()
      const tasks = await service.find({
        take: 10,
        skip: 0,
        where: {},
      })
      expect(tasks.data).toBeDefined()
    })
  })

  it('should delete task', async () => {
    const t = await createDummyTask()
    const t2 = await service.delete(t.id)

    expect(t).toEqual(t2)
    // check if task is deleted
    const t3 = await service.get(t.id)
    expect(t3).toBeNull()
  })

  it('should init task', async () => {
    const t = await createDummyTask()
    expect(t.state).toEqual(TaskState.PENDING)
    await service.initTask(t.id)
    const t2 = await service.get(t.id)
    expect(t2.state).toEqual(TaskState.IN_PROGRESS)
  })

  describe('update', () => {
    it('should update task', async () => {
      const t = await createDummyTask()
      expect(t.message).toEqual('')
      const t2 = await service.update(t.id, {
        message: 'test',
      })
      expect(t2.state).toEqual(TaskState.IN_PROGRESS)
      expect(t2.message).toEqual('test')
    })

    it('should inclement progress', async () => {
      const t = await createDummyTask()
      expect(t.progress).toEqual(0)
      const t2 = await service.update(t.id, {
        message: 'inc-10',
        progress: {
          increment: 10,
        },
      })
      expect(t2.progress).toEqual(10)
      const t3 = await service.update(t.id, {
        message: 'inc-20',
        progress: {
          increment: 10,
        },
      })
      expect(t3.progress).toEqual(20)
    })
  })

  describe('subtasks', () => {
    it('should create subtask', async () => {
      const { task, subtask } = await createDummySubtask()

      expect(subtask.taskId).toEqual(task.id)
      expect(subtask.name).toEqual('test')
      expect(subtask.data).toEqual({ foo: 'bar' })
    })

    it('should update subtask', async () => {
      const { task, subtask } = await createDummySubtask()
      const t3 = await service.subtask.update(subtask.id, {
        message: 'test2',
      })
      expect(t3.message).toEqual('test2')
    })

    it('should finish subtask', async () => {
      const { task, subtask } = await createDummySubtask()
      const t3 = await service.subtask.finish(subtask.id, false)
      expect(t3.state).toEqual(TaskState.DONE)
      expect(t3.finishedAt).toBeDefined()
    })

    it('should fail subtask', async () => {
      const { task, subtask } = await createDummySubtask()
      const t3 = await service.subtask.fail(subtask.id)
      expect(t3.state).toEqual(TaskState.ERROR)
      expect(t3.finishedAt).toBeDefined()
    })
  })
})

describe('complex operations', () => {
  it('should finish task', async () => {
    const { task, subtask } = await createDummySubtask()
    const result = {
      foo: 'bar',
    }
    await service.finish(task.id, result)

    const fullTask = await service.getFull(task.id)
    expect(fullTask.state).toEqual(TaskState.DONE)

    // all subtasks should be finished
    expect(fullTask.actions).toHaveLength(1)
    expect(fullTask.actions[0].state).toEqual(SubtaskState.DONE)
  })

  it('should fail task', async () => {
    const { task, subtask } = await createDummySubtask()
    const error: TaskFailError = {
      message: 'message',
      stack: 'stack',
    }
    await service.fail(task.id, error)

    const fullTask = await service.getFull(task.id)
    expect(fullTask.state).toEqual(TaskState.ERROR)
    expect(fullTask.error).toEqual(error)

    // all subtasks should be finished
    expect(fullTask.actions).toHaveLength(1)
    expect(fullTask.actions[0].state).toEqual(SubtaskState.STOPPED)
  })
})

