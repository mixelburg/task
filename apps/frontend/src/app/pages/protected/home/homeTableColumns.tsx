import ReplayIcon from '@mui/icons-material/Replay'
import { getGridStringOperators, GridColDef, ValueOptions } from '@mui/x-data-grid-pro'
import {
  Task,
  TaskService,
  taskServiceOptions, TaskState,
  TaskSubtypeOptions,
  taskSubtypeOptions,
  taskTypeOptions,
} from '@tasks/client'
import { Stack, Typography } from '@mui/material'
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun'
import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices'
import LandscapeIcon from '@mui/icons-material/Landscape'
import TagIcon from '@mui/icons-material/Tag'
import React from 'react'
import StartIcon from '@mui/icons-material/Start'
import SportsScoreIcon from '@mui/icons-material/SportsScore'
import TextWithCopy from "../../../components/TextWithCopy";
import { formatDate } from "../../../utils/time";
import { RunTimeCell } from "../../../components/table/RuntimeCell";
import {
  TaskEnvironmentSelectOptions,
  TaskServiceSelectOptions,
  TaskStateSelectOptions
} from "../../../components/table/types";
import { StateCellRenderer } from "../../../components/table/StateCell";
import CircularProgressWithLabel from "../../../utils/loaders/CircularProgressWithLabel";

export const tableColumns: GridColDef[] = [
  {
    field: 'id',
    headerName: 'ID',
    width: 280,
    maxWidth: 280,
    filterOperators: getGridStringOperators().filter((op) => ['isAnyOf', 'equals'].includes(op.value)),
    renderHeader: () => <TagIcon />,
    renderCell: ({ value }) => <TextWithCopy text={value} />,
  },
  {
    field: 'createdAt',
    type: 'dateTime',
    headerName: 'Created At',
    width: 180,
    renderHeader: () => <Stack direction='row' spacing={1}>
      <Typography>Created At</Typography>
      <StartIcon />
    </Stack>,
    renderCell: ({value}) => <Typography>{formatDate(value)}</Typography>
  },
  {
    field: 'finishedAt',
    type: 'dateTime',
    headerName: 'Finished At',
    width: 180,
    renderHeader: () => <Stack direction='row' spacing={1}>
      <Typography>Finished At</Typography>
      <SportsScoreIcon />
    </Stack>,
    renderCell: ({value}) => <Typography>{formatDate(value)}</Typography>
  },
  {
    field: 'runtime',
    headerName: 'Runtime',
    type: 'dateTime',
    width: 130,
    renderCell: ({ row }: { row: Task}) =>
      row.state !== TaskState.PENDING
        ? <RunTimeCell row={row} start={row.startedAt} />
        : <Typography>Not Started</Typography>,

  },
  {
    field: 'uptime',
    headerName: 'Uptime',
    type: 'dateTime',
    width: 130,
    renderCell: ({ row }) => <RunTimeCell row={row} start={row.createdAt} />,
  },
  {
    field: 'state',
    headerName: 'State',
    width: 130,
    type: 'singleSelect',
    valueOptions: TaskStateSelectOptions,
    renderCell: StateCellRenderer,
  },
  {
    field: 'progress',
    headerName: 'Progress',
    width: 50,
    type: 'number',
    headerAlign: 'center',
    align: 'center',
    renderCell: ({ row }) => <CircularProgressWithLabel value={row.progress} />,
    renderHeader: () => <DirectionsRunIcon />,
  },
  {
    field: 'retry',
    headerName: 'Retry',
    width: 50,
    type: 'number',
    headerAlign: 'center',
    align: 'center',
    renderHeader: () => <ReplayIcon />,
  },
  {
    field: 'environment',
    headerName: 'Environment',
    width: 110,
    type: 'singleSelect',
    valueOptions: TaskEnvironmentSelectOptions,
    renderHeader: () => <LandscapeIcon />,
  },
  {
    field: 'service',
    headerName: 'Service',
    width: 110,
    type: 'singleSelect',
    valueOptions: TaskServiceSelectOptions,
    renderHeader: () => <MiscellaneousServicesIcon />,
  },
  {
    field: 'type',
    headerName: 'Type',
    width: 275,
    type: 'singleSelect',
    valueOptions: ({ row }) => {
      if (row) return taskTypeOptions[row?.service as TaskService] || []

      const res: ValueOptions[] = []
      for (const service of taskServiceOptions) {
        for (const option of taskTypeOptions[service]) {
          // if option already exists in res, skip
          if (res.find((opt) => opt === option)) continue
          res.push(option)
        }
      }
      return res
    },
  },
  {
    field: 'subtype',
    headerName: 'Subtype',
    width: 250,
    type: 'singleSelect',
    valueOptions: ({ row }) => {
      if (row) return (taskSubtypeOptions as any)?.[row.service]?.[row.type] || []

      const res: ValueOptions[] = []
      for (const service in taskSubtypeOptions) {
        for (const type in taskSubtypeOptions[service as keyof TaskSubtypeOptions]) {
          for (const option of (taskSubtypeOptions as any)[service][type]) {
            if (res.find((opt) => opt === option)) continue
            res.push(option)
          }
        }
      }
      return res
    },
  },
]
