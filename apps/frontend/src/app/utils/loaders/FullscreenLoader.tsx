import { FC, PropsWithChildren } from 'react'
import { Stack } from '@mui/material'
import CenterCircleLoader from '@/app/utils/loaders/CenterCircleLoader'

interface IProps {
  loading: boolean
}

const FullscreenLoader: FC<PropsWithChildren<IProps>> = ({ loading, children }) => {
  return (
    <>
      {loading ? (
        <Stack width='100vw' height='100vh' alignItems='center' justifyContent='center'>
          <CenterCircleLoader />
        </Stack>
      ) : (
        children
      )}
    </>
  )
}

export default FullscreenLoader
