import React, { FC, memo, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import Index from '@/app/pages/protected'
import FullscreenLoader from '@/app/utils/loaders/FullscreenLoader'
import ProtectedRoute from '@/app/routes/ProtectedRoute'
import Unauthorized from '@/app/pages/unauthorized'

const LzyHome = React.lazy(() => import('@/app/pages/protected/home/Home'))
const LzyWorkloads = React.lazy(() => import('@/app/pages/protected/Workloads/Workloads'))
const LzySolutions = React.lazy(() => import('@/app/pages/protected/Solutions/Solutions'))
const LzyLogin = React.lazy(() => import('@/app/pages/unauthorized/Login'))

const AppRouter: FC = () => {
  return (
    <Suspense fallback={<FullscreenLoader loading={true} />}>
      <Routes>
        <Route path='/' element={<ProtectedRoute />}>
          <Route path='/' element={<Index />}>
            <Route path='/' element={<LzyHome />} />
            <Route path='/monitor' element={<LzyWorkloads />} />
            <Route path='/solutions' element={<LzySolutions />} />
          </Route>
        </Route>
        <Route path='/' element={<Unauthorized />}>
          <Route path='/login' element={<LzyLogin />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default memo(AppRouter)
