import { Task, TaskState } from '@tasks/client'
import { FC } from 'react'
import { Stack } from '@mui/material'
import ElapsedCounter from "./ElapsedCounter";
import { deltaToComponents } from "../../utils/time";

export const RunTimeCell: FC<{ row: Task, start: Date | null }> = ({ row, start }) => {
  const isRunning = ![TaskState.DONE, TaskState.ERROR].includes(row.state as any)

  if (!start) return <></>
  return <Stack direction='row' spacing={0.5}>
    {
      isRunning
        ? <ElapsedCounter start={start} updateInterval={5000} short />
        : row.finishedAt
          ? deltaToComponents(+(row.finishedAt || new Date()) - +start, true)
          : ''
    }
  </Stack>
}
