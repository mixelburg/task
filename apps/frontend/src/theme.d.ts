// noinspection ES6UnusedImports
import { TypeBackground } from '@mui/material'

declare module '@mui/material/styles/createPalette' {
  export interface TypeBackground {
    default: string
    paper: string
    navbar: string
  }
}
