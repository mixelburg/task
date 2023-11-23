import { createContext, FC, useEffect, useState } from 'react'
import { Stack, StackProps } from '@mui/material'
import { useSelectorSize } from "../../hooks/useSelectorSize";

type AppPageProps = StackProps & {
  includeHeader?: boolean
}

export const appPageContext = createContext('appPage')

export const AppPage: FC<AppPageProps> = (props) => {
  const [appPageHeight, setAppPageHeight] = useState('')
  const { includeHeader, ...rest } = props
  const include = includeHeader === undefined ? true : includeHeader

  const headerSize = useSelectorSize('#app-header')

  useEffect(() => {
    setAppPageHeight(`100vh - ${include ? `${headerSize.height}px` : `0px`}`)
  }, [include, headerSize.height])

  return (
    <Stack {...rest} height={`calc(${appPageHeight})`} width='100vw' area-label='app-page' overflow='hidden'>
      <appPageContext.Provider value={appPageHeight}>{props.children}</appPageContext.Provider>
    </Stack>
  )
}
