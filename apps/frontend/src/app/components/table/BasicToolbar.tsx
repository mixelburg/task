import { GridToolbarColumnsButton, GridToolbarDensitySelector, GridToolbarFilterButton } from '@mui/x-data-grid-pro'
import React, { FC } from 'react'
import { Button, Stack } from '@mui/material'
import ReplayIcon from '@mui/icons-material/Replay'


interface IProps {
  reload: Function
}

const BasicToolbar: FC<IProps> = ({ reload }) => (
  <Stack direction='row' px={1} pt={1} spacing={1} justifyContent='space-between'>
    <Stack direction='row' spacing={1}>
      <GridToolbarFilterButton />
      <GridToolbarColumnsButton />
      <GridToolbarDensitySelector />
    </Stack>
    <Button color='secondary' onClick={async () => {
      await reload()
    }}>
      RELOAD
      <ReplayIcon color='secondary' fontSize='small' />
    </Button>
  </Stack>
)

export default BasicToolbar
