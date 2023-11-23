import React, { FC, KeyboardEvent, useState } from 'react'
import { Button, CircularProgress, Stack, TextField, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import useApi, { fromAtom } from '@/app/hooks/useApi'
import api from '@/app/services/api'
import { toast } from 'react-toastify'
import { useAtom } from 'jotai'
import useMuiForm from 'usemuiform'
import { ILoginData } from '@tasks/types'

const Login: FC = () => {
  const [from, setFrom] = useAtom(fromAtom)
  const { state, register, forceValidate, clear } = useMuiForm<ILoginData>()
  const [loading, setLoading] = useState(false)
  const [isCapsLock, setIsCapsLock] = useState(false)
  const [isNonEnglish, setIsNonEnglish] = useState(false)
  const [login] = useApi(api.auth.login, [401])
  const navigate = useNavigate()
  const handleSubmit = async () => {
    if (forceValidate()) {
      try {
        setLoading(true)
        await login(state)

        toast.success('Welcome back!', { toastId: 'welcome-back' })
        if (from) {
          navigate(from, { replace: true })
          setFrom('')
        } else {
          navigate('/', { replace: true })
        }
        clear()
      } catch (e: any) {
        toast.error(e?.response?.data?.message ? e.response.data.message : `Invalid credentials`, { toastId: 'login-error' })
      } finally {
        setLoading(false)
      }
    }
  }

  const onKeyDown = (e: KeyboardEvent) => {
    setIsCapsLock(e.getModifierState('CapsLock'))
    setIsNonEnglish(!e.key.match(/\d|\w|[.$@*\\/+\-^!()[\]~%&=?><{}"',:;_]/g))
  }

  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    handleSubmit()
  }

  return <>
    <Stack spacing={3} alignItems='center' px={1}>
      <Typography variant='h3'>
        Task Monitor
      </Typography>
      <Stack spacing={1} component='form' sx={{ maxWidth: 300 }} onSubmit={onFormSubmit}>
        <TextField
          label='email'
          type='email'
          variant='outlined'
          {...register('email', '')}
        />
        <TextField
          label='password'
          type='password'
          variant='outlined'
          onKeyDown={onKeyDown}
          {...register('password', '')}
        />
        <Stack>
          {
            isCapsLock && <Typography variant='caption' color='error'>Caps lock is on</Typography>
          }
          {
            isNonEnglish && <Typography variant='caption' color='error'>Non-English keyboard is on</Typography>
          }
        </Stack>
        <Button type='submit' variant='contained' onClick={handleSubmit}>
          {
            loading ? <CircularProgress size={20} /> : 'Login'
          }
        </Button>
      </Stack>
    </Stack>
  </>
}

export default Login
