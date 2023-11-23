import { Typography } from '@mui/material'
import React from 'react'
import { taskEnvironmentToLabel } from "./types";
import { TaskEnvironment } from "@tasks/prisma/client";


export const EnvironmentCell = (props: any) => {
  const label = taskEnvironmentToLabel[props.value as TaskEnvironment]
  return <Typography>{label}</Typography>
}
