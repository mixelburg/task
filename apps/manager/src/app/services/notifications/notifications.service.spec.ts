import {beforeAll, describe, it, expect} from "vitest";
import { Test, TestingModule } from '@nestjs/testing';
import {NotificationsService, shouldNotify} from './notifications.service';
import {ConfigModule} from "@nestjs/config";
import {TaskService, TaskType} from "@tasks/client";
import {testFailedTask} from "@tasks/config";

describe('NotificationsService', () => {
  let service: NotificationsService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
      ],
      providers: [NotificationsService],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  it('filters should work', () => {
    expect(shouldNotify(testFailedTask, [{
      service: testFailedTask.service,
      type: testFailedTask.type
    }])).toBe(true)

    expect(shouldNotify(testFailedTask, [{
      service: TaskService.GLOBAL,
    }])).toBe(false)

    expect(shouldNotify(testFailedTask, [{
      service: {
        in: [
          testFailedTask.service,
          TaskService.GLOBAL
        ],
      },
      type: testFailedTask.type
    }])).toBe(true)

    expect(shouldNotify(testFailedTask, [{
      retry: {
        gte: testFailedTask.retry + 1
      }
    }])).toBe(false)

    expect(shouldNotify(testFailedTask, [{
      retry: {
        gte: testFailedTask.retry + 1
      }
    },{
      retry: {
        gte: testFailedTask.retry
      }
    }])).toBe(true)

  })

});
