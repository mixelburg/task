import React, { FC } from 'react'
import { Outlet } from 'react-router-dom'
import { Stack } from '@mui/material'
import useAuth from '@/app/hooks/useAuth'
import FullscreenLoader from '@/app/utils/loaders/FullscreenLoader'
import { AppPage } from '@/app/components/containers/AppPage'

const Index: FC = () => {
  const { loading } = useAuth('unauthorized')
  return <>
    <FullscreenLoader loading={loading}>
      <AppPage includeHeader={false}>
        <Stack
          height='100%'
          maxWidth={500}
          justifyContent='center'
          alignItems='center'
          bgcolor={theme => theme.palette.background.navbar}
        >
          <Outlet />
        </Stack>
      </AppPage>
    </FullscreenLoader>
  </>
}

export default Index
