import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

const savedTheme = localStorage.getItem('theme') || 'light'
if (savedTheme === 'dark') document.documentElement.classList.add('dark')

const savedAccent = localStorage.getItem('accentColor') || '#4A90E2'
document.documentElement.style.setProperty('--accent', savedAccent)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)