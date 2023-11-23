import { SubtaskState, TaskState } from '@tasks/client'

export const noBorderGrid = {
  border: 'none',
  '&.MuiDataGrid-root': {
    '& .MuiDataGrid-cell': {
      border: 'none',
    },
  },
}


export const getTaskColor = (state: TaskState) => state === TaskState.PENDING ? 'warning.main' : state === TaskState.ERROR ? 'error.main' : state === TaskState.DONE ? 'success.main' : 'primary.main'

export const getSubtaskColor = (state: SubtaskState) => state === SubtaskState.ERROR
  ? 'error.main'
  : state === SubtaskState.DONE
    ? 'success.main'
    : state === SubtaskState.STOPPED
      ? 'warning.main'
      : 'primary.main'
