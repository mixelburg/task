export const APP_VERSION: string = '0.1.0'


import {Task, TaskEnvironment, TaskService, TaskState, TaskType} from "@tasks/client";

export const testFailedTask: Task = {
  id: '6538d7ab08e0bcd98f5ce9c2',
  parentId: null,
  meta: {

  },
  createdAt: new Date(),
  initiatedAt: new Date(),
  startedAt: new Date(),
  finishedAt: new Date(),
  stoppedAt: new Date(),
  environment: TaskEnvironment.TEST,
  state: TaskState.ERROR,
  service: TaskService.OPNSENSE,
  type: TaskType.OPNSENSE.BACKUP,
  subtype: null,
  message: '',
  progress: 0,
  error: {
    message: 'message error',
    stack: "TypeError: Cannot read properties of undefined (reading 'events')\\n    at fixCards (/app/dist/apps/packer/main.js:2340:45)\\n    at AppService.buildDflSessionXmlData_1 (/app/dist/apps/packer/main.js:404:46)\\n    at buildDflSessionXmlData_1.next (<anonymous>)\\n    at resume (/app/node_modules/tslib/tslib.js:281:48)\\n    at fulfill (/app/node_modules/tslib/tslib.js:283:35)\\n    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)",
  },
  retry: 3,
  userId: null,
  payload: null,
}
