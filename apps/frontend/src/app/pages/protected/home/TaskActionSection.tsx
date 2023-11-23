import React, { FC, memo } from 'react'
import {
  Box,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import TimerIcon from '@mui/icons-material/Timer'
import CoffeeIcon from '@mui/icons-material/Coffee'
import { Subtask, SubtaskState } from '@tasks/client'
import { getSubtaskColor } from "../../../utils/styles";
import { deltaToComponents, formatDate } from "../../../utils/time";
import ElapsedCounter from "../../../components/table/ElapsedCounter";
import ProgressWithLabel from "../../../utils/loaders/ProgressWithLabel";
import JsonPrettyWrapper from "../../../components/JsonPrettyWrapper";
interface IProps {
  action: Subtask
}

const TaskActionSection: FC<IProps> = ({ action }) => {
  const isRunning = action.state === SubtaskState.IN_PROGRESS

  return <Stack key={action.name} component={Paper} elevation={4} direction='row' spacing={1.5}>
    <Stack bgcolor={getSubtaskColor(action.state)} width={10}
           sx={{ borderTopLeftRadius: 10, borderBottomLeftRadius: 10 }}>

    </Stack>
    <Stack py={1} spacing={0.5}>
      <Typography variant='h5'>{action.name}</Typography>
      {
        action.message && <Typography variant='body1'>{action.message}</Typography>
      }
      <List>
        <ListItem>
          <Stack direction='row' spacing={0.5}>
            <Typography>
              state:
            </Typography>
            <Typography color={getSubtaskColor(action.state)}>
              {action.state}
            </Typography>
          </Stack>
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <AccessTimeIcon />
          </ListItemIcon>
          <Typography variant='body1'>start: {formatDate(action.createdAt)}</Typography>
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <AccessTimeIcon />
          </ListItemIcon>
          <Stack direction='row' alignItems='center' spacing={1}>
            <Typography variant='body1'>finish: </Typography>
            {
              isRunning && !action.finishedAt
                ? <Box width={200}>
                  <LinearProgress />
                </Box>
                : <Typography variant='body1'>{formatDate(action.finishedAt)}</Typography>
            }
          </Stack>
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <TimerIcon />
          </ListItemIcon>
          <ListItemText>
            elapsed: {isRunning ? <ElapsedCounter
            start={action.createdAt} /> : action.finishedAt ? deltaToComponents(+(action?.finishedAt || 0) - +action.createdAt, false) : <></>}
          </ListItemText>
        </ListItem>

        {
          action.progress !== null && <ListItem>
            <ListItemIcon>
              <CoffeeIcon />
            </ListItemIcon>
            <ProgressWithLabel value={action.progress} />
          </ListItem>
        }
      </List>
      {
        action.data && <>
          <Stack maxWidth='100%'>
            <JsonPrettyWrapper data={action.data}></JsonPrettyWrapper>
          </Stack>
        </>
      }
    </Stack>

  </Stack>
}

export default memo(TaskActionSection, (prevProps, nextProps) => {
  return JSON.stringify(prevProps) === JSON.stringify(nextProps)
})
