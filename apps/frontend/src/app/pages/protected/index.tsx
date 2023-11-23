import { FC, memo, Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import AppHeader from '../../components/containers/AppHeader'
import { AppPage } from '../../components/containers/AppPage'
import CenterCircleLoader from '../../utils/loaders/CenterCircleLoader'

const Index: FC = () => {
  return (
    <>
      <AppHeader />
      <Suspense
        fallback={
          <AppPage>
            <CenterCircleLoader />
          </AppPage>
        }
      >
        <Outlet />
      </Suspense>
    </>
  )
}

export default memo(Index)
