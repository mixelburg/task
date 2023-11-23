import {Prisma, Task, TaskEnvironment, TaskService, TaskType} from "@tasks/client";
import PrismaTaskWhereInput = Prisma.PrismaTaskWhereInput;

export type NotificationFilter = PrismaTaskWhereInput

export const filters: NotificationFilter[] = [
  {
    service: TaskService.VSPHERE,
    type: TaskType.VSPHERE.POWER_OFF,
    environment: TaskEnvironment.PRODUCTION,
    retry: {
      gte: 3
    }
  },
]
