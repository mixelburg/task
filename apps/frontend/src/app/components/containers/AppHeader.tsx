import * as React from 'react'
import { FC } from 'react'
import { IconButton, Stack, Tooltip, Typography } from '@mui/material'
import LogoutIcon from '@mui/icons-material/Logout'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import useApi from "../../hooks/useApi";
import api from "../../services/api";
import AppLink from "../AppLink";

const AppHeader: FC = () => {
  const navigate = useNavigate()
  const [logout] = useApi(api.auth.logout)
  const onLogout = async () => {
    toast.success('Goodbye my friend')
    await logout()
    navigate('/login')
  }


  return (
    <Stack
      id='app-header'
      direction='row'
      justifyContent='space-between'
      alignItems='center'
      px={1}
      bgcolor={(theme) => theme.palette.background.navbar}
    >
      <Stack direction='row' spacing={2} alignItems='center'>
        <AppLink to='/'>
          <Typography variant='h6' whiteSpace='nowrap'>
            Tasks
          </Typography>
        </AppLink>
      </Stack>
      <Stack direction='row' spacing={2} alignItems='center'>
        <Tooltip title='logout'>
          <IconButton onClick={onLogout}>
            <LogoutIcon />
          </IconButton>
        </Tooltip>
      </Stack>
    </Stack>
  )
}

export default AppHeader
