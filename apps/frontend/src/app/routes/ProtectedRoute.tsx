import { FC, memo } from 'react'
import { Outlet } from 'react-router-dom'
import FullscreenLoader from '@/app/utils/loaders/FullscreenLoader'
import useAuth from '@/app/hooks/useAuth'

const ProtectedRoute: FC = () => {
  const { loading: isAuthLoading } = useAuth('authorized')


  return <>
    <FullscreenLoader loading={isAuthLoading}>
      <Outlet />
    </FullscreenLoader>
  </>
}

export default memo(ProtectedRoute)
