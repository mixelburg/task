import { Prisma, Subtask, TaskEnvironment } from '@tasks/prisma/client'
import axios, { AxiosInstance } from 'axios'
import {
  ClientCreateTaskDto,
  ClientServiceConfig,
  FindTaskDto,
  FindTaskRaw,
  FullTask,
  PaginationResponse,
  Task,
  TaskFailError,
  TaskProjectionResult,
  UpdateTaskDto,
} from './types'
import { TaskClientConnectionError, TaskValidationError } from './errors'
import { transformResponse } from './util'
import PrismaTaskSelect = Prisma.PrismaTaskSelect
import {
  CreateSubtaskDto,
  isExtendedResult,
  SubtaskCallback,
  SubtaskOnProgress,
  SubtaskOptions,
  UpdateSubtaskDto,
} from './types/SubTask'

class RawPrismaSubtaskClient {
  constructor(private readonly axios: AxiosInstance) {
  }

  async updateMany(
    data: Prisma.SubtaskUpdateManyArgs,
  ): Promise<Prisma.BatchPayload> {
    return (
      await this.axios.post<Prisma.BatchPayload>(
        `subtask/prisma/updateMany`,
        data,
      )
    ).data
  }
}

class SubtaskClient {
  public readonly prisma: RawPrismaSubtaskClient

  constructor(
    private readonly baseUrl: string,
    private readonly axios: AxiosInstance,
    private readonly taskClient: TaskApiClient,
  ) {
    this.prisma = new RawPrismaSubtaskClient(this.axios)
  }

  async finish(
    id: string,
    progress: boolean,
    meta?: Prisma.JsonObject,
  ): Promise<Subtask> {
    return (await this.axios.post<Subtask>(`subtask/${id}/finish`, {
      progress,
      meta,
    })).data
  }

  async fail(id: string): Promise<Subtask> {
    return (await this.axios.post<Subtask>(`subtask/${id}/fail`)).data
  }

  async create(taskId: string, data: CreateSubtaskDto): Promise<Subtask> {
    return (await this.axios.post<Subtask>(`${taskId}/subtask`, data)).data
  }

  async update(id: string, data: UpdateSubtaskDto): Promise<Subtask> {
    return (await this.axios.patch<Subtask>(`subtask/${id}`, data)).data
  }

  async run<T>(
    taskId: string | undefined | null,
    name: string,
    callback: SubtaskCallback<T>,
    options: SubtaskOptions = {},
  ): Promise<T> {

    if (!taskId) {
      const mockOnProgress: SubtaskOnProgress = async (progress, message) => {
      }
      const res = await callback(mockOnProgress)
      return isExtendedResult(res) ? res.data : res
    }

    const [_, subtask] = await Promise.all([
      this.taskClient.init(taskId),
      await this.create(taskId, {
        name,
        data: options.data || undefined,
        progress: options.progress ? 0 : undefined,
      }),
    ])

    const onProgress: SubtaskOnProgress = async (progress, message, data) => {
      await this.update(subtask.id, {
        progress: parseInt(progress as any),
        message,
        data,
      })
    }

    try {
      const res = await callback(onProgress)
      await this.finish(
        subtask.id,
        !!options.progress,
        (res as any)?.meta || undefined,
      )

      if (isExtendedResult(res)) {
        return res.data
      }
      return res
    } catch (e) {
      await this.fail(subtask.id)
      throw e
    }
  }
}

class RawPrismaTaskClient {
  constructor(
    private readonly axios: AxiosInstance,
    public readonly environment: TaskEnvironment | undefined,
  ) {
  }

  async updateMany(
    data: Prisma.PrismaTaskUpdateManyArgs,
  ): Promise<Prisma.BatchPayload> {
    return (
      await this.axios.post<Prisma.BatchPayload>(`prisma/updateMany`, data)
    ).data
  }

  async update(
    data: Prisma.PrismaTaskUpdateArgs,
  ): Promise<Task> {
    return (
      await this.axios.post<Task>(`prisma/update`, data)
    ).data
  }

  async findRaw<T extends Prisma.PrismaTaskDefaultArgs>(options: FindTaskRaw<T>):
    Promise<PaginationResponse<
      T extends undefined ? Task : TaskProjectionResult<T>>
    > {
    if (!options.filter) options.filter = {}

    if (options.filter.environment === undefined && this.environment !== null) {
      options.filter.environment = this.environment
    }
    return (await this.axios.post('prisma/findRaw', options)).data
  }
}


export class TaskApiClient {
  public readonly environment: TaskEnvironment | undefined
  public readonly subtask: SubtaskClient
  public readonly prisma: RawPrismaTaskClient
  private readonly axios: AxiosInstance

  constructor(
    environment: string | null,
    private readonly baseUrl: string,
  ) {
    if (environment !== null) {
      const taskEnvUpper = environment?.toUpperCase()

      // check if task env is valid
      if (
        !Object.values(TaskEnvironment).includes(taskEnvUpper as TaskEnvironment)
      ) {
        throw new Error(`
      Invalid task environment: ${taskEnvUpper}, must be one of ${Object.values(
          TaskEnvironment,
        ).join(', ')}
      check the constructor call of TaskApiClient
      `)
      }
      this.environment = taskEnvUpper as TaskEnvironment
    } else {
      this.environment = environment as any
    }

    this.axios = axios.create({
      baseURL: this.baseUrl,
      transformResponse,
    })

    this.axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.code === 'ECONNREFUSED') {
          return Promise.reject(
            new TaskClientConnectionError(
              `Connection to Task API failed, is it running at ${this.baseUrl}?`,
            ),
          )
        }
        if (error.response && error.response.status === 400) {
          return Promise.reject(
            new TaskValidationError(error.response.data.message, error?.request?.data),
          )
        }
        return Promise.reject(error)
      },
    )

    this.subtask = new SubtaskClient(this.baseUrl, this.axios, this)
    this.prisma = new RawPrismaTaskClient(this.axios, this.environment,)
  }

  async find<T extends PrismaTaskSelect | undefined>(options: FindTaskDto<T>):
    Promise<PaginationResponse<
      T extends undefined ? Task : TaskProjectionResult<{ select: T }>
    >> {
    if (!options.where) options.where = {}

    if (options.where.environment === undefined && this.environment !== null) {
      options.where.environment = this.environment
    }
    return (await this.axios.post('find', options))
      .data
  }

  async get(id: string): Promise<Task> {
    return (await this.axios.get<Task>(`${id}`)).data
  }

  async getFull(id: string): Promise<FullTask> {
    return (await this.axios.get<FullTask>(`${id}/full`)).data
  }

  async create(data: ClientCreateTaskDto): Promise<Task> {
    return (
      await this.axios.post<Task>('create', {
        ...data,
        environment: data.environment || this.environment,
      })
    ).data
  }

  async delete(id: string): Promise<Task> {
    return (await this.axios.delete<Task>(`${id}`)).data
  }

  async init(id: string): Promise<undefined> {
    await this.axios.post<Task>(`${id}/init`)
  }

  async update(id: string, data: UpdateTaskDto): Promise<Task> {
    return (await this.axios.patch<Task>(`${id}`, data)).data
  }

  async finish(id: string, result?: Prisma.JsonObject): Promise<Task> {
    return (await this.axios.post<Task>(`${id}/finish`, { result })).data
  }

  async fail(id: string, error?: any): Promise<Task> {
    const payload: TaskFailError = {
      message: error?.message || 'Error',
      stack: error?.stack || 'No Stack',
    }
    return (await this.axios.post<Task>(`${id}/fail`, payload)).data
  }
}

