// Express服务器入口
import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import apiRoutes from './routes/api'
import DataService from './services/dataService'

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

const PORT = process.env.PORT || 3001
const dataService = new DataService()

// 中间件
app.use(cors())
app.use(express.json())

// API路由
app.use('/api', apiRoutes)

// WebSocket连接处理
io.on('connection', (socket) => {
  console.log('客户端已连接:', socket.id)

  // 发送初始数据
  sendRealtimeData(socket)

  // 定时推送实时数据（每5秒）
  const interval = setInterval(() => {
    sendRealtimeData(socket)
  }, 5000)

  // 处理断开连接
  socket.on('disconnect', () => {
    console.log('客户端已断开:', socket.id)
    clearInterval(interval)
  })

  // 处理客户端请求
  socket.on('request_update', async () => {
    await sendRealtimeData(socket)
  })
})

// 发送实时数据
async function sendRealtimeData(socket: any) {
  try {
    const data = await dataService.getRealtimeData()
    socket.emit('realtime_update', data)
  } catch (error) {
    console.error('发送实时数据失败:', error)
  }
}

// 启动服务器
httpServer.listen(PORT, () => {
  console.log(`🚀 元宇宙办公室后端服务已启动`)
  console.log(`📡 HTTP API: http://localhost:${PORT}/api`)
  console.log(`🔌 WebSocket: ws://localhost:${PORT}`)
  console.log(`💚 健康检查: http://localhost:${PORT}/api/health`)
})

export { app, io }
