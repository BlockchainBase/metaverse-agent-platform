import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// 模拟加载进度
const loadingBar = document.getElementById('loading-bar-inner')
const loadingScreen = document.getElementById('loading-screen')

let progress = 0
const interval = setInterval(() => {
  progress += Math.random() * 15
  if (progress >= 100) {
    progress = 100
    clearInterval(interval)
    setTimeout(() => {
      loadingScreen?.classList.add('hidden')
    }, 500)
  }
  if (loadingBar) {
    loadingBar.style.width = `${progress}%`
  }
}, 200)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
