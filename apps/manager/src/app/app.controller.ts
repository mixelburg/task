import { Body, Controller, Delete, Get, Patch, Post, UsePipes } from '@nestjs/common'

import { AppService } from './app.service'
import {
  CreateTaskDto,
  createTaskDtoSchema,
  failTaskErrorSchema,
  FindTaskDto,
  findTaskDtoSchema,
  FindTaskRaw,
  finishTaskDtoSchema,
  FullTask,
  PaginationResponse,
  Prisma,
  Subtask,
  Task,
  TaskFailError,
  UpdateTaskDto,
  updateTaskDtoSchema, FinishTaskDto,
  CreateSubtaskDto,
  createSubtaskDtoSchema,
  FinishSubtaskDto,
  finishSubtaskSDtoSchema, UpdateSubtaskDto, updateSubtaskDtoSchema,
} from '@tasks/client'
import { MongoId } from './decorators/mongo-id.decorator'
import { ZodValidationPipe } from './pipes/zod.pipe'

const combineObjects = (a: any, b: any) => {
  return Object.assign({}, a, b)
}

const projectionToPrismaProjection = <T>(val: T): {
  [P in keyof T]: number
} => {
  const res: any = {}
  for (const key in val) {
    if (key) res[key] = 1
  }
  return res
}


const convertDates = (val: any) => {
  for (const key in val) {
    if (val[key]?.['$date'] !== undefined) {
      val[key] = new Date(val[key]['$date'])
    }
  }
}


@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {
  }

  @Get('health')
  async health() {
    return {
      status: 'ok',
    }
  }

  @Get(':id')
  async get(@MongoId() id: string): Promise<Task> {
    return await this.appService.get(id)
  }

  @Get(':id/full')
  async getFull(@MongoId() id: string): Promise<FullTask> {
    return await this.appService.getFull(id)
  }

  @Post('create')
  @UsePipes(new ZodValidationPipe(createTaskDtoSchema))
  async create(@Body() data: CreateTaskDto): Promise<Task> {
    return await this.appService.create(data)
  }

  @Post('find')
  @UsePipes(new ZodValidationPipe(findTaskDtoSchema))
  async find(@Body() data: FindTaskDto): Promise<PaginationResponse<Task>> {
    return await this.appService.find(data)
  }

  @Post('prisma/updateMany')
  async prismaUpdateMany(
    @Body() data: Prisma.PrismaTaskUpdateManyArgs,
  ): Promise<Prisma.BatchPayload> {
    return await this.appService.prisma.prismaTask.updateMany(data)
  }

  @Post('prisma/update')
  async prismaUpdate(@Body() data: Prisma.PrismaTaskUpdateArgs): Promise<Task> {
    return await this.appService.prisma.prismaTask.update(data)
  }

  @Post('prisma/findRaw')
  async prismaFind(@Body() data: FindTaskRaw<Prisma.PrismaTaskDefaultArgs>): Promise<PaginationResponse<Task>> {
    const projection = {
      service: true,
      type: true,
      subtype: true,
    } as const

    if (data.filter?.id) {
      data.filter._id = {
        $oid: data.filter.id,
      }
      delete data.filter.id
    }

    const res = (await this.appService.prisma.prismaTask.findRaw({
      filter: data.filter,
      options: {
        skip: data.skip,
        limit: data.take,
        sort: data.sort,
        projection: data?.projection?.select
          ? projectionToPrismaProjection(combineObjects(projection, data?.projection?.select || {}))
          : undefined,
      },
    })) as any

    // do an executeRaw to get the count in mongo
    const count = await this.appService.prisma.$runCommandRaw({
      count: 'Task',
      query: data.filter,
    })

    for (const val of res) {
      val.id = val._id?.$oid
      val.userId = val.userId?.$oid
      val.parentId = val.parentId?.$oid
      convertDates(val)

      delete val._id
    }

    const populated = await Promise.all(res.map(async (val: any) => {
      if (data.projection?.select?.parent && val.parentId) {
        val.parent = await this.appService.prisma.prismaTask.findUnique({
          where: {
            id: val.parentId,
          },
          select: data.projection?.select?.parent == true ? undefined : data.projection?.select?.parent.select,
        })
      }
      if (data.projection?.select?.children) {
        val.children = await this.appService.prisma.prismaTask.findMany({
          where: {
            parentId: val.id,
          },
          select: data.projection?.select?.children == true ? undefined : data.projection?.select?.children.select,
        })
      }
      return val
    }))

    return {
      data: populated,
      total: count.n as number,
    }
  }

  @Post('subtask/prisma/updateMany')
  async prismaSubtaskUpdateMany(
    @Body() data: Prisma.SubtaskUpdateManyArgs,
  ): Promise<Prisma.BatchPayload> {
    return await this.appService.prisma.subtask.updateMany(data)
  }

  @Delete(':id')
  async delete(@MongoId() id: string): Promise<Task> {
    return await this.appService.delete(id)
  }

  @Post(':id/init')
  async init(@MongoId() id: string): Promise<undefined> {
    await this.appService.initTask(id)
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(updateTaskDtoSchema))
  async update(
    @MongoId() id: string,
    @Body() data: UpdateTaskDto,
  ): Promise<Task> {
    return await this.appService.update(id, data)
  }

  @Post('subtask/:id/finish')
  @UsePipes(new ZodValidationPipe(finishSubtaskSDtoSchema))
  async finishSubtask(
    @MongoId() id: string,
    @Body() body: FinishSubtaskDto,
  ): Promise<Subtask> {
    return await this.appService.subtask.finish(id, body.progress, body.meta)
  }

  @Post('subtask/:id/fail')
  async failSubtask(@MongoId() id: string): Promise<Subtask> {
    return await this.appService.subtask.fail(id)
  }

  @Post(':id/subtask')
  @UsePipes(new ZodValidationPipe(createSubtaskDtoSchema))
  async createSubtask(
    @MongoId() taskId: string,
    @Body() data: CreateSubtaskDto,
  ): Promise<Subtask> {
    return await this.appService.subtask.create(taskId, data)
  }

  @Patch('subtask/:id')
  @UsePipes(new ZodValidationPipe(updateSubtaskDtoSchema))
  async updateSubtask(
    @MongoId() id: string,
    @Body() data: UpdateSubtaskDto,
  ): Promise<Subtask> {
    return await this.appService.subtask.update(id, data)
  }

  @Post(':id/finish')
  @UsePipes(new ZodValidationPipe(finishTaskDtoSchema))
  async finish(
    @MongoId() id: string,
    @Body() body?: FinishTaskDto,
  ): Promise<Task> {
    return await this.appService.finish(id, body?.result)
  }

  @Post(':id/fail')
  @UsePipes(new ZodValidationPipe(failTaskErrorSchema))
  async fail(
    @MongoId() id: string,
    @Body() error: TaskFailError,
  ): Promise<Task> {
    return await this.appService.fail(id, error)
  }
}
