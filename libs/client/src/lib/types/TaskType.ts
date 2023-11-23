import { TaskService } from './TaskService'

export type TaskType = {
  [key in TaskService]: {
    [key: Readonly<string>]: Readonly<string>
  }
}

export const TaskType = {
  GLOBAL: {
    E2E: 'E2E',
  },
  VSPHERE: {
    CLONE: 'CLONE',
    CREATE: 'CREATE',
    DELETE: 'DELETE',
    POWER_OFF: 'POWER_OFF',
    POWER_ON: 'POWER_ON',
    REBOOT: 'REBOOT',
    RECONFIGURE: 'RECONFIGURE',
    REVERT: 'REVERT',
    SHUTDOWN: 'SHUTDOWN',
    SNAPSHOT: 'SNAPSHOT',
    SUSPEND: 'SUSPEND',
    UPDATE: 'UPDATE',
  },
  OPNSENSE: {
    BACKUP: 'BACKUP',
    RESTORE: 'RESTORE',
    CONFIGURE: 'CONFIGURE',
  },
} as const satisfies TaskType

export type TaskTypeOptions = {
  [key in TaskService]: (keyof (typeof TaskType)[key])[]
}

export const taskTypeOptions = Object.keys(TaskType).reduce((acc, key) => {
  ;(acc as any)[key] = Object.values(TaskType[key as keyof TaskType])
  return acc
}, {} as TaskTypeOptions)

export type TaskTypeGeneric<T extends TaskService> = keyof (typeof TaskType)[T]

export type TaskTypeVariant = TaskTypeGeneric<TaskService>
