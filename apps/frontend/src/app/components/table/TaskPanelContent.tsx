import React, {FC, memo, useEffect, useState} from 'react'
import {
  Box,
  Button,
  Grid,
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
import {PrimitiveAtom, useAtom} from 'jotai'
import CoffeeIcon from '@mui/icons-material/Coffee'
import ReplayIcon from '@mui/icons-material/Replay'
import TagIcon from '@mui/icons-material/Tag'
import MessageIcon from '@mui/icons-material/Message'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft'
import {FullTask, Prisma, SubtaskState, Task, TaskState} from '@tasks/client'
import {atomWithHash} from "jotai-location";
import { useLoadingFunction } from "../../hooks/useLoadingFunction";
import api from "../../services/api";
import { getTaskColor } from "../../utils/styles";
import ProgressWithLabel from "../../utils/loaders/ProgressWithLabel";
import { deltaToComponents, formatDate } from "../../utils/time";
import ElapsedCounter from "./ElapsedCounter";
import JsonPrettyWrapper from "../JsonPrettyWrapper";
import TaskChildCard from "../../pages/protected/home/TaskChildCard";
import TaskActionSection from "../../pages/protected/home/TaskActionSection";
import useApiOnLoad from "../../hooks/useApiOnLoad";

export const currentIdsAtom = atomWithHash<{
  [key: string]: string | null
}>('currentId', {})

const TaskPanelContent: FC<{
  taskAtom: PrimitiveAtom<Task>
}> = ({taskAtom}) => {
  const [task, setTask] = useAtom(taskAtom)
  const [currentIds, setCurrentIds] = useAtom(currentIdsAtom)
  const currentId = currentIds[task?.id]
  const setCurrentId = (id: string | null) => setCurrentIds(ps => ({
    ...ps,
    [task?.id]: id
  }))

  useEffect(() => {
    if (task) {
      setCurrentIds(ps => ({
        ...ps,
        [task.id]: task.id
      }))
    }
  }, [task?.id])

  const [state, setState] = useState<FullTask | undefined>(undefined)
  const {reload, isLoading} = useApiOnLoad(
    async () => (currentId ? await api.manager.getFull(currentId) : undefined),
    setState,
    [currentId],
  )
  const isRunning = state?.state !== TaskState.ERROR && state?.state !== TaskState.DONE

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(async () => await reload(false), 5000)
      return () => clearInterval(interval)
    }
  }, [currentId, isRunning])

  useEffect(() => {
    if (state?.id === task?.id) {
      const {actions, children, ...other} = state
      setTask((ps) => ({
        ...ps,
        ...other,
      }))
    }
  }, [task?.id, state])


  const {
    fn: restartErroredTask,
    isLoading: restartLoading
  } = useLoadingFunction(async () => {
    if (currentId) {
      await api.manager.prisma.update({
        where: {
          id: currentId,
        },
        data: {
          // decrement retry by 1
          retry: {
            decrement: 1,
          },
        },
      })
      await reload()
    }
  })

  const error = state?.error as Prisma.JsonObject | undefined

  return (
    <>
      {!isLoading && state ? (
        <>
          <Stack direction="column" p={2} component={Paper} mb={2} width="100%" height="100%" spacing={1}>
            <Stack direction="row">
              {state.parentId && (
                <Button
                  onClick={() => setCurrentId(state?.parentId)}
                        variant="contained"
                  color="primary">
                  <KeyboardArrowUpIcon/>
                  PARENT
                </Button>
              )}
              {task.id && state.id !== task?.id && (
                <Button onClick={() => setCurrentId(task.id)} variant="contained" color="primary">
                  <KeyboardArrowLeftIcon/>
                  CURRENT
                </Button>
              )}
              {state.state === TaskState.ERROR && (
                <>
                  <Button
                    onClick={restartErroredTask}
                    color="warning"
                    variant="contained"
                    disabled={restartLoading}
                    sx={{
                      height: 40,
                    }}
                  >
                    {
                      restartLoading ? (
                        <Box sx={{width: 67}}>
                          <LinearProgress/>
                        </Box>
                      ) : (
                        <>RESTART</>
                      )
                    }
                  </Button>
                </>
              )}
            </Stack>
            <Grid container>
              <Grid item xs={6} sx={{mb: 3}}>
                <Stack direction="column" spacing={2}>
                  {/*info*/}
                  <Stack>
                    <Typography variant="h4">Info</Typography>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <TagIcon/>
                        </ListItemIcon>
                        <Typography color="warning.main">{state.id}</Typography>
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <ArrowForwardIosIcon/>
                        </ListItemIcon>
                        <ListItemText>type: {state.type}</ListItemText>
                      </ListItem>

                      <ListItem>
                        <ListItemIcon>
                          <ArrowForwardIosIcon/>
                        </ListItemIcon>
                        <Stack direction="row" spacing={0.5}>
                          <Typography>state:</Typography>
                          <Typography color={getTaskColor(state.state)}>{state.state}</Typography>
                        </Stack>
                      </ListItem>

                      <ListItem>
                        <ListItemIcon>
                          <MessageIcon/>
                        </ListItemIcon>
                        <ListItemText>{state.message}</ListItemText>
                      </ListItem>

                      <ListItem>
                        <ListItemIcon>
                          <CoffeeIcon/>
                        </ListItemIcon>
                        <Box sx={{width: 200}}>
                          <ProgressWithLabel value={state.progress}/>
                        </Box>
                      </ListItem>

                      <ListItem>
                        <ListItemIcon>
                          <AccessTimeIcon/>
                        </ListItemIcon>
                        <ListItemText>created: {formatDate(state.createdAt)}</ListItemText>
                      </ListItem>

                      <ListItem>
                        <ListItemIcon>
                          <AccessTimeIcon/>
                        </ListItemIcon>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography variant="body1">started: </Typography>
                          {isRunning && !state.startedAt ? (
                            <Box width={80}>
                              <LinearProgress/>
                            </Box>
                          ) : (
                            <Typography variant="body1">{formatDate(state.startedAt)}</Typography>
                          )}
                        </Stack>
                      </ListItem>

                      <ListItem>
                        <ListItemIcon>
                          <AccessTimeIcon/>
                        </ListItemIcon>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography variant="body1">finish: </Typography>
                          {isRunning && !state.finishedAt ? (
                            <Box width={80}>
                              <LinearProgress/>
                            </Box>
                          ) : (
                            <Typography variant="body1">{formatDate(state.finishedAt)}</Typography>
                          )}
                        </Stack>
                      </ListItem>

                      <ListItem>
                        <ListItemIcon>
                          <TimerIcon/>
                        </ListItemIcon>
                        <ListItemText>
                          elapsed:{' '}
                          {isRunning ? (
                            <ElapsedCounter start={state.createdAt} updateInterval={5000}/>
                          ) : state.finishedAt ? (
                            deltaToComponents(+(state?.finishedAt || 0) - +state.createdAt, false)
                          ) : (
                            <></>
                          )}
                        </ListItemText>
                      </ListItem>

                      {state.retry ? (
                        <>
                          <ListItem>
                            <ListItemIcon>
                              <ReplayIcon/>
                            </ListItemIcon>
                            <ListItemText>count: {state.retry}</ListItemText>
                          </ListItem>
                        </>
                      ) : (
                        <></>
                      )}

                      <Stack maxWidth={500}>
                        <JsonPrettyWrapper data={state.meta}></JsonPrettyWrapper>
                      </Stack>

                      {error && (
                        <>
                          <Stack maxWidth={500} spacing={1}>
                            <JsonPrettyWrapper data={state.error}></JsonPrettyWrapper>
                            {error.message && (
                              <>
                                <Paper sx={{p: 1}} elevation={4}>
                                  <Typography color="error.main" sx={{whiteSpace: 'pre-line'}}>
                                    {error.message as string}
                                  </Typography>
                                </Paper>
                              </>
                            )}
                            {error.stack && (
                              <>
                                <Paper sx={{p: 1}} elevation={4}>
                                  <Typography color="warning.main" sx={{whiteSpace: 'pre-line'}}>
                                    {error.stack as string}
                                  </Typography>
                                </Paper>
                              </>
                            )}
                          </Stack>
                        </>
                      )}
                    </List>
                  </Stack>

                  {/*children*/}
                  {state.children.length > 0 && (
                    <Stack spacing={1} maxHeight={400} sx={{overflowY: 'auto'}}>
                      <Typography variant="h4">Children</Typography>
                      {state.children.map((c) => (
                        <TaskChildCard
                          key={c.id}
                          data={c}
                          onClick={() => setCurrentId(c.id)}
                          maxWidth={500}
                        />
                      ))}
                    </Stack>
                  )}
                </Stack>
              </Grid>

              {/*actions*/}
              <Grid item xs>
                <Stack spacing={1}>
                  <Typography variant="h4">Actions</Typography>
                  <Stack spacing={1} p={1} maxHeight={700} overflow="auto">
                    {state.actions
                      .filter((a) => a.state === SubtaskState.IN_PROGRESS)
                      .map((a) => (
                        <TaskActionSection key={a.name} action={a}/>
                      ))}
                    {state.actions
                      .filter((a) => a.state !== SubtaskState.IN_PROGRESS)
                      .map((a) => (
                        <TaskActionSection key={a.name} action={a}/>
                      ))}
                  </Stack>
                </Stack>
              </Grid>
            </Grid>
          </Stack>
        </>
      ) : (
        <>
          <LinearProgress/>
        </>
      )}
    </>
  )
}

export default memo(TaskPanelContent)
