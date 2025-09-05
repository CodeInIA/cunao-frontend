import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './suppress-warnings'
import './index.css'
import './swRegister'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

