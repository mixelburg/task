import { Stack, Typography } from '@mui/material'
import React from 'react'
import { TaskState } from '@tasks/client'
import { taskStateToLabelWithIcon } from "./types";
import { getTaskColor } from "../../utils/styles";


export const StateCellRenderer = (props: any) => {
  const option = taskStateToLabelWithIcon[props.value as TaskState]
  const color = getTaskColor(props.value)
  return option
    ? <Stack direction='row' spacing={0.5} color={color}>
      <Typography>{option.label}</Typography>
      {option.icon ? <option.icon color='inherit' /> : <></>}
    </Stack>
    : <></>
}
