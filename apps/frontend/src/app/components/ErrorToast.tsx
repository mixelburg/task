import { FC, useState } from 'react'
import { Button, Stack, Typography } from '@mui/material'
import { AxiosError } from 'axios'
import copy from 'copy-to-clipboard'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import CheckIcon from '@mui/icons-material/Check'

interface IProps {
  error: AxiosError
  reload?: boolean
}

const ErrorToast: FC<IProps> = ({ error, reload, ...props }) => {
  const close: any = (props as any).closeToast
  const [copied, setCopied] = useState<boolean>(false)

  const turnToString = (error: AxiosError) => {
    const payload = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      hash: window.location.hash,
      error,
    }

    try {
      return JSON.stringify(payload, null, 2)
    } catch (e) {
      return JSON.stringify({
        ...payload,
        error: {
          message: error.message,
        },
      })
    }
  }

  const onClick = () => {
    if (copied) return

    copy(turnToString(error))
    setCopied(true)

    setTimeout(() => {
      close()

      if (reload) {
        // remove hash from url
        window.history.replaceState({}, document.title, window.location.pathname + window.location.search)

        // reload page
        window.location.reload()
      }
    }, 1000)
  }

  const copyText = reload ? 'copy to clipboard and reload' : 'copy to clipboard'

  const message = (error.response?.data as any)?.message || error.message || 'ERROR'

  return (
    <Stack spacing={0.5}>
      <Typography variant='h6' color='error'>
        {message}
      </Typography>

      <Typography variant='body1' color='textSecondary'>
        please copy error and report it to our team to close this toast
      </Typography>

      <Stack height={40} alignItems='center' width='100%' />

      <Stack
        sx={{
          position: 'absolute',
          bottom: 0,

          alignItems: 'center',
          width: '100%',
          height: 50,

          // horizontal center
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        {copied ? (
          <Stack direction='row' spacing={1} justifyContent='center' alignItems='center' height='100%' width='100%'>
            <Typography variant='body1' color='success'>
              copied{' '}
            </Typography>
            <CheckIcon fontSize='small' color='success' />
          </Stack>
        ) : (
          <Stack direction='row' spacing={1} component={Button} onClick={onClick} height='100%' width='100%'>
            <Typography variant='body1'>{copyText}</Typography>
            <ContentCopyIcon fontSize='small' />
          </Stack>
        )}
      </Stack>
    </Stack>
  )
}

export default ErrorToast
