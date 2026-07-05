import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeStore } from './utils/kb'
import { LangStore } from './i18n/LangStore'

// Apply stored theme before paint to avoid a light/dark flash
ThemeStore.init();
// Sync html[lang] before paint so screen readers see the right language.
LangStore.set(LangStore.get());

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
