// 前端数据服务 - 连接后端API
import { io, Socket } from 'socket.io-client'

interface AgentState {
  id: string
  name: string
  role: string
  status: 'working' | 'idle' | 'meeting' | 'busy' | 'offline'
  position: { x: number; y: number; z: number }
  currentTask: string
  taskProgress: number
  efficiency: number
  lastUpdate: string
}

interface Project {
  id: string
  name: string
  progress: number
  status: string
  assignee: string
  deadline: string
}

interface RealtimeData {
  timestamp: string
  agentStates: AgentState[]
  activeProjects: Project[]
  todaySchedule: any[]
  systemMetrics: any
  notifications: any[]
}

class MetaverseDataService {
  private socket: Socket | null = null
  private apiBase: string
  private listeners: Map<string, Function[]> = new Map()

  constructor(apiUrl: string = 'http://localhost:3001') {
    this.apiBase = apiUrl
  }

  // 连接到WebSocket
  connect() {
    if (this.socket) return

    this.socket = io(this.apiBase)

    this.socket.on('connect', () => {
      console.log('✅ 已连接到元宇宙办公室后端')
    })

    this.socket.on('disconnect', () => {
      console.log('❌ 与后端断开连接')
    })

    this.socket.on('realtime_update', (data: RealtimeData) => {
      this.emit('data_update', data)
    })

    this.socket.on('error', (error: any) => {
      console.error('WebSocket错误:', error)
    })
  }

  // 断开连接
  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  // 获取初始状态
  async getInitialState(): Promise<any> {
    try {
      const response = await fetch(`${this.apiBase}/api/state`)
      const result = await response.json()
      return result.success ? result.data : null
    } catch (error) {
      console.error('获取初始状态失败:', error)
      return null
    }
  }

  // 获取项目列表
  async getProjects(): Promise<Project[]> {
    try {
      const response = await fetch(`${this.apiBase}/api/projects`)
      const result = await response.json()
      return result.success ? result.data : []
    } catch (error) {
      console.error('获取项目列表失败:', error)
      return []
    }
  }

  // 获取Agent状态
  async getAgentStates(): Promise<AgentState[]> {
    try {
      const response = await fetch(`${this.apiBase}/api/agents`)
      const result = await response.json()
      return result.success ? result.data : []
    } catch (error) {
      console.error('获取Agent状态失败:', error)
      return []
    }
  }

  // 获取今日日程
  async getTodaySchedule(): Promise<any[]> {
    try {
      const response = await fetch(`${this.apiBase}/api/schedule`)
      const result = await response.json()
      return result.success ? result.data : []
    } catch (error) {
      console.error('获取日程失败:', error)
      return []
    }
  }

  // 获取统计数据
  async getStatistics(): Promise<any> {
    try {
      const response = await fetch(`${this.apiBase}/api/statistics`)
      const result = await response.json()
      return result.success ? result.data : {}
    } catch (error) {
      console.error('获取统计数据失败:', error)
      return {}
    }
  }

  // 发送消息给Agent
  async sendMessage(agentId: string, message: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBase}/api/agents/${agentId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      })
      const result = await response.json()
      return result.success
    } catch (error) {
      console.error('发送消息失败:', error)
      return false
    }
  }

  // 请求立即更新
  requestUpdate() {
    if (this.socket) {
      this.socket.emit('request_update')
    }
  }

  // 订阅数据更新
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }

  // 取消订阅
  off(event: string, callback: Function) {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  // 触发事件
  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.forEach(callback => callback(data))
    }
  }

  // 检查连接状态
  isConnected(): boolean {
    return this.socket?.connected || false
  }
}

// 单例导出
export const metaverseDataService = new MetaverseDataService()
export default MetaverseDataService
export type { AgentState, Project, RealtimeData }
