import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// 获取加载屏幕元素
const loadingBar = document.getElementById('loading-bar-inner')
const loadingScreen = document.getElementById('loading-screen')
const loadingText = document.querySelector('.loading-text')

// 显示错误信息到加载屏幕
function showError(message: string) {
  if (loadingText) {
    loadingText.textContent = '❌ 加载失败: ' + message
    loadingText.setAttribute('style', 'color: #ff6b6b;')
  }
  if (loadingBar) {
    loadingBar.setAttribute('style', 'background: #ff6b6b; width: 100%;')
  }
}

// 隐藏加载屏幕
function hideLoading() {
  if (loadingScreen) {
    loadingScreen.classList.add('hidden')
  }
}

// 更新加载进度
let progress = 0
const interval = setInterval(() => {
  progress += Math.random() * 10
  if (progress >= 90) progress = 90 // 等待渲染完成才到100%
  if (loadingBar) {
    loadingBar.style.width = `${progress}%`
  }
}, 200)

// 全局错误处理
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error)
  showError(event.error?.message || 'JavaScript错误')
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
  showError(event.reason?.message || 'Promise错误')
})

try {
  const root = document.getElementById('root')
  if (!root) {
    throw new Error('找不到root元素')
  }

  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )

  // React挂载成功，完成加载动画
  clearInterval(interval)
  if (loadingBar) loadingBar.style.width = '100%'
  if (loadingText) loadingText.textContent = '✅ 加载完成'
  setTimeout(hideLoading, 500)

} catch (error) {
  clearInterval(interval)
  console.error('React render error:', error)
  showError(error instanceof Error ? error.message : '渲染失败')
}
