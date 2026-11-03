import '@fontsource/poppins/400.css'
import '@fontsource/poppins/600.css'
import '@fontsource/poppins/800.css'
// Typefaces offered by the accessibility menu
import '@fontsource/atkinson-hyperlegible/400.css'
import '@fontsource/atkinson-hyperlegible/700.css'
import '@fontsource/lexend/400.css'
import '@fontsource/lexend/600.css'
import '@fontsource/lexend/800.css'
import './index.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { App } from './App'
import { A11yMenu } from './components/a11y/A11yMenu'
import { A11yProvider } from './components/a11y/A11yProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <A11yProvider>
        <App />
        <A11yMenu />
      </A11yProvider>
    </BrowserRouter>
  </StrictMode>,
)
