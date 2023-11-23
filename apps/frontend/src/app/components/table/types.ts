import { TaskEnvironment, TaskService, TaskState } from '@tasks/client'
import { ValueOptions } from '@mui/x-data-grid-pro'
import AutorenewIcon from '@mui/icons-material/Autorenew'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import CheckIcon from '@mui/icons-material/Check'
import HourglassTopIcon from '@mui/icons-material/HourglassTop'

export const mapToOptions = (map: Record<string, string>): ValueOptions[] =>
  Object.entries(map).map(([value, label]: any) => ({
    value,
    label,
  }))

export const taskServiceToLabel: Record<TaskService, string> = {
  OPNSENSE: 'OPNsense',
  VSPHERE: 'vSphere',
  GLOBAL: 'Global',
}
export const TaskServiceSelectOptions = mapToOptions(taskServiceToLabel)

export const taskEnvironmentToLabel: Record<TaskEnvironment, string> = {
  LOCAL: 'Local',
  TEST: 'Test',
  DEVELOPMENT: 'Dev',
  PRODUCTION: 'Prod',
  STAGING: 'Stag',
}
export const TaskEnvironmentSelectOptions = mapToOptions(taskEnvironmentToLabel)

export const taskStateToLabel: Record<TaskState, string> = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
  ERROR: 'Error',
}

export const taskStateToLabelWithIcon: Record<TaskState, { label: string; icon: any }> = {
  IN_PROGRESS: { label: 'In Progress', icon: AutorenewIcon },
  ERROR: { label: 'Failed', icon: ErrorOutlineIcon },
  DONE: { label: 'Done', icon: CheckIcon },
  PENDING: { label: 'Pending', icon: HourglassTopIcon },
}
export const TaskStateSelectOptions = mapToOptions(taskStateToLabel)
