import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'jotai'
import 'react-toastify/dist/ReactToastify.css'

import { LicenseInfo } from '@mui/x-license-pro'

LicenseInfo.setLicenseKey(import.meta.env.VITE_MUI_X_KEY)

ReactDOM.createRoot(document.getElementById('root')!).render(
  // <React.StrictMode>
  <Provider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>,
  // </React.StrictMode>
)
