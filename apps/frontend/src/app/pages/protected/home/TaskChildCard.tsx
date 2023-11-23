import React, { FC } from 'react'
import { Button, List, ListItem, ListItemIcon, ListItemText, Paper, Stack, Typography } from '@mui/material'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import CoffeeIcon from '@mui/icons-material/Coffee'
import { TaskChild } from '@tasks/client'
import { getTaskColor } from "../../../utils/styles";
import ProgressWithLabel from "../../../utils/loaders/ProgressWithLabel";

interface IProps {
  data: TaskChild
  onClick: (id: string) => void
  maxWidth?: number
}

export const TaskChildCard: FC<IProps> = (props) => {
  const { maxWidth = 400 } = props
  return <>
    <Stack component={Paper} elevation={4} maxWidth={maxWidth}>
      <List dense={true}>
        <ListItem>
          <ListItemIcon>
            <ArrowForwardIosIcon />
          </ListItemIcon>
          <ListItemText>
            service: {props.data.service}
          </ListItemText>
        </ListItem>

        <ListItem>
          <ListItemIcon>
            <ArrowForwardIosIcon />
          </ListItemIcon>
          <ListItemText>
            type: {props.data.type}
          </ListItemText>
        </ListItem>

        <ListItem>
          <ListItemIcon>
            <ArrowForwardIosIcon />
          </ListItemIcon>
          <Stack direction='row' spacing={0.5}>
            <Typography>
              state:
            </Typography>
            <Typography color={getTaskColor(props.data.state)}>
              {props.data.state}
            </Typography>
          </Stack>
        </ListItem>

        <ListItem sx={{maxWidth: 300}}>
          <ListItemIcon>
            <CoffeeIcon />
          </ListItemIcon>
          <ProgressWithLabel value={props.data.progress} />
        </ListItem>
      </List>
      <Button onClick={() => props.onClick(props.data.id)}>
        open
      </Button>
    </Stack>
  </>
}
export default TaskChildCard
