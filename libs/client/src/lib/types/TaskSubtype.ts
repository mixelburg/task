import { TaskType } from './TaskType'
import { TaskService } from './TaskService'

export type TaskSubtype = {
  [ser in keyof typeof TaskType]?: {
    [tas in keyof (typeof TaskType)[ser]]?: {
      [key: Readonly<string>]: Readonly<string>
    }
  }
}

export const TaskSubtype = {
  [TaskService.OPNSENSE]: {
    [TaskType.OPNSENSE.CONFIGURE]: {
      VLAN: 'VLAN',
      VPN: 'VPN',
      DHCP: 'DHCP',
    }
  } as const,
} satisfies TaskSubtype

export type TaskSubtypeOptions = {
  [ser in keyof typeof TaskSubtype]: {
    [tas in keyof (typeof TaskSubtype)[ser]]: (keyof (typeof TaskSubtype)[ser][tas])[]
  }
}

export const taskSubtypeOptions: TaskSubtypeOptions = {} as any

for (const _key in TaskSubtype) {
  const innerOptions: any = {}
  const key = _key as keyof TaskSubtypeOptions
  for (const _innerKey in TaskSubtype[key as keyof TaskSubtypeOptions]) {
    const innerKey = _innerKey as keyof TaskSubtypeOptions[typeof key]
    innerOptions[innerKey] = Object.values(TaskSubtype[key][innerKey])
  }
  taskSubtypeOptions[key as keyof TaskSubtypeOptions] = innerOptions
}

type ValueOf<T> = T[keyof T]

export type TaskSubtypeGeneric<S extends TaskService, T> = S extends keyof typeof TaskSubtype
  ? T extends keyof (typeof TaskSubtype)[S]
    ? ValueOf<(typeof TaskSubtype)[S][T]>
    : undefined
  : undefined
