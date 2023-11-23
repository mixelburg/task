import {Box, CssBaseline, ThemeProvider} from '@mui/material'
import {ToastContainer} from 'react-toastify'
import React, {memo} from 'react'
import useTheme from "./app/themes/useTheme";
import AppRouter from "./app/routes/router";

const originalToLocaleDateString = Date.prototype.toLocaleDateString

Date.prototype.toLocaleDateString = function () {
  return originalToLocaleDateString.call(
    this,
    [
      'en-GB',
    ],
    {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }
  )
}

const App = () => {
  document.title = 'Tasks Monitor'
  const theme = useTheme()

  return (
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline/>
        <Box height="100vh" width="100vw" overflow="hidden">
          <AppRouter/>
        </Box>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          draggable
          pauseOnHover
          theme="dark"
        />
      </ThemeProvider>
    </>
  )
}
export default memo(App)
