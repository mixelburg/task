import { FC } from 'react'
import { CircularProgress } from '@mui/material'
import CenterStack from '@/app/components/containers/CenterStack'

const CenterCircleLoader: FC = () => {
  return (
    <CenterStack>
      <CircularProgress />
    </CenterStack>
  )
}

export default CenterCircleLoader
