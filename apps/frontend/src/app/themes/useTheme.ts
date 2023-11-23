import { deepmerge } from '@mui/utils'
import { createTheme } from '@mui/material/styles'
import { atom, useAtomValue } from 'jotai'
import darkTheme from './dark'
import lightTheme from './light'
import baseTheme from './base'
export type ThemeType = 'dark' | 'light'
export const themeAtom = atom<ThemeType>('dark') // default to dark theme

// A custom useTheme for this app
const useTheme = () => {
  const themeType = useAtomValue(themeAtom)
  switch (themeType) {
    case 'dark':
      return createTheme(deepmerge(darkTheme, baseTheme))
    case 'light':
      return createTheme(deepmerge(lightTheme, baseTheme))
    default:
      return createTheme(deepmerge(darkTheme, baseTheme))
  }
}

export default useTheme
