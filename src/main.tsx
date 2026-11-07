import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import App from './App'
import './theme.css'
import {loadWorkspace} from './persistence'
loadWorkspace().then(()=>createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>))
