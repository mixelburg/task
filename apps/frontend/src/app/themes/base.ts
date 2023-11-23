import { ThemeOptions } from '@mui/material'
import { grey } from '@mui/material/colors'

const baseTheme: ThemeOptions = {
  components: {
    MuiCssBaseline: {
      styleOverrides: (theme) => `
      ::-webkit-scrollbar {
        width: 6px;
      }
      ::-webkit-scrollbar-track {
       background: ${grey[800]};
       border-radius: 6px;
      }
      ::-webkit-scrollbar-thumb {
        background: ${theme.palette.primary.dark};
       border-radius: 6px;
      }
      .Toastify__toast-container--top-right {
        top: 50px;
        right: 10px;
      }
      `,
    },
  },
  typography: {
    button: {
      textTransform: 'none',
    },
  },
}

export default baseTheme
