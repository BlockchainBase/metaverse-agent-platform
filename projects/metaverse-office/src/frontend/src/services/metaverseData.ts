// Phase 4: 前端3D数据服务 - 连接真实后端API
import { io, Socket } from 'socket.io-client'

// Manager角色类型 (v3.0 - 7角色)
export type ManagerRole = 'marketing' | 'solution' | 'developer' | 'devops' | 'project' | 'finance' | 'assistant'

// Agent状态类型
export interface AgentState {
  id: string
  name: string
  role: ManagerRole | string
  status: 'working' | 'idle' | 'meeting' | 'busy' | 'offline'
  position: { x: number; y: number; z: number }
  rotation?: { x: number; y: number; z: number }
  avatar?: string
  currentTask?: {
    id: string
    title: string
    status: string
    priority: string
  }
  currentTasks?: Array<{
    id: string
    title: string
    status: string
    priority: string
    dueDate?: string
  }>
  activeCollaborations?: Array<{
    taskId: string
    taskTitle: string
    role: string
  }>
  recentActivities?: Array<{
    type: string
    timestamp: string
    data: any
  }>
  metrics?: {
    completedTasks: number
    inProgressTasks: number
    collaborationCount: number
    workloadPercentage: number
    availabilityScore: number
    lastActiveMinutes: number | null
  }
  efficiency?: number
  lastUpdate: string
}

// 项目/任务信息
export interface TaskFlowNode {
  id: string
  type: 'task' | 'agent'
  data: any
  position?: { x: number; y: number; z: number }
}

export interface TaskFlowEdge {
  id: string
  source: string
  target: string
  type: string
  animated?: boolean
  weight?: number
  data?: any
}

export interface TaskFlowData {
  nodes: TaskFlowNode[]
  edges: TaskFlowEdge[]
  stats: {
    total: number
    completed: number
    inProgress: number
    pending: number
    delayed: number
  }
}

// 协作网络
export interface CollaborationNetwork {
  nodes: Array<{
    id: string
    type: string
    label: string
    data: any
    position?: { x: number; y: number; z: number }
  }>
  edges: Array<{
    id: string
    source: string
    target: string
    weight: number
    collaborationCount: number
    types: string[]
    animated?: boolean
  }>
  stats: {
    totalAgents: number
    totalConnections: number
    avgConnections: number
    isolatedAgents: number
    clusters: number
  }
}

// 3D场景配置
export interface Scene3DConfig {
  name: string
  type: string
  environment: {
    skybox: string
    lighting: string
    weather: string
  }
  rooms: Array<{
    id: string
    name: string
    type: string
    bounds: { x: number; z: number; width: number; depth: number }
    features: string[]
  }>
  spawnPoints: Array<{
    id: string
    position: { x: number; y: number; z: number }
    rotation: number
  }>
  decorations: Array<{
    type: string
    position: { x: number; y: number; z: number }
  }>
  agentPositions: Array<{
    agentId: string
    name: string
    position: { x: number; y: number; z: number }
    role?: string
  }>
}

// 管理中枢数据
export interface ManagementHubData {
  businessPlanning: {
    totalBusinesses: number
    businesses: Array<{
      id: string
      name: string
      status: string
      processTemplateCount: number
      processTemplates: any[]
    }>
  }
  processDesign: {
    stats: Record<string, number>
  }
  approvalStation: {
    pendingCount: number
    pendingApprovals: Array<{
      id: string
      title: string
      requester: any
      assignee: any
      createdAt: string
      priority: string
    }>
  }
  systemMetrics: {
    taskStats: Record<string, number>
    todayTasks: number
    completedToday: number
    efficiency: number
  }
}

// WebSocket事件类型
export type MetaverseEventType = 
  | 'agent:status:update'
  | 'agents:list:update'
  | 'task:flow:update'
  | 'task:assigned'
  | 'task:completed'
  | 'network:collaboration:update'
  | 'meeting:update'
  | 'pipeline:event'
  | 'connection:status'
  | 'error'

class MetaverseDataService {
  private socket: Socket | null = null
  private apiBase: string
  private organizationId: string | null = null
  private listeners: Map<MetaverseEventType, Function[]> = new Map()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private isConnecting = false

  constructor(apiUrl?: string) {
    // 优先级: 传入的URL > 环境变量 > 默认localhost
    // 注意: 空字符串''表示使用相对路径（通过Nginx代理）
    const envBase = import.meta.env.VITE_API_BASE
    if (apiUrl !== undefined) {
      this.apiBase = apiUrl
    } else if (envBase !== undefined && envBase !== '') {
      this.apiBase = envBase
    } else {
      this.apiBase = '' // 使用相对路径，通过Nginx代理访问API
    }
  }

  // ==================== 连接管理 ====================

  connect(organizationId?: string): void {
    if (this.socket?.connected || this.isConnecting) return
    
    this.isConnecting = true
    if (organizationId) {
      this.organizationId = organizationId
    }

    // Socket.io连接: 如果apiBase为空，使用当前页面host（自动通过Nginx代理）
    // 优先尝试WebSocket直连(3002端口)，失败时回退到polling通过Nginx代理
    const socketUrl = this.apiBase || undefined // undefined让Socket.io使用当前页面host
    
    this.socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      path: '/socket.io/' // 确保通过Nginx代理路径正确
    })

    this.setupSocketListeners()
  }

  disconnect(): void {
    if (this.socket) {
      // 离开3D场景房间
      if (this.organizationId) {
        this.socket.emit('3d:scene:leave', { organizationId: this.organizationId })
      }
      this.socket.disconnect()
      this.socket = null
      this.isConnecting = false
    }
  }

  private setupSocketListeners(): void {
    if (!this.socket) return

    this.socket.on('connect', () => {
      console.log('✅ 已连接到元宇宙3D后端')
      this.reconnectAttempts = 0
      this.emit('connection:status', { connected: true, socketId: this.socket?.id })

      // 自动加入3D场景房间
      if (this.organizationId) {
        this.join3DScene(this.organizationId)
      }
    })

    this.socket.on('disconnect', (reason) => {
      console.log('❌ 与后端断开连接:', reason)
      this.emit('connection:status', { connected: false, reason })
    })

    this.socket.on('connect_error', (error) => {
      console.error('连接错误:', error)
      this.reconnectAttempts++
      this.emit('error', { type: 'connection', error: error.message })
    })

    // Phase 4: 3D场景事件
    // Phase 4: 3D场景事件 - 兼容模拟引擎事件格式
    // 模拟引擎发送 'message' 通用事件，包含 type 字段
    this.socket.on('message', (message) => {
      console.log('📨 收到WebSocket消息:', message.type, message)
      
      switch (message.type) {
        case 'state:update':
          // 状态更新 - 映射到 agent:status:update
          if (message.data?.agents) {
            message.data.agents.forEach((agent: any) => {
              this.emit('agent:status:update', {
                agentId: agent.id,
                ...agent,
                timestamp: message.timestamp
              })
            })
          }
          break
        case 'event:update':
          // 事件更新
          this.emit('pipeline:event', message)
          break
        case 'task:assigned':
          // 任务分配更新
          this.emit('task:flow:update', message)
          break
        case 'collaboration:started':
          // 协作网络更新
          this.emit('network:collaboration:update', message)
          break
        case 'human:intervention_required':
          // 需要人类介入
          console.log('🚨 收到人类介入请求:', message.data)
          break
      }
    })

    // 保留原有事件监听（向后兼容）
    this.socket.on('3d:agent:status', (data) => {
      this.emit('agent:status:update', data)
    })

    this.socket.on('3d:agent:position:update', (data) => {
      this.emit('agent:status:update', data)
    })

    this.socket.on('3d:task:flow:update', (data) => {
      this.emit('task:flow:update', data)
    })

    this.socket.on('3d:network:update', (data) => {
      this.emit('network:collaboration:update', data)
    })

    // 房间事件
    this.socket.on('room:joined', (data) => {
      console.log('Joined room:', data.room)
    })

    this.socket.on('3d:scene:connected', (data) => {
      console.log('Connected to 3D scene:', data)
    })
  }

  // ==================== 3D场景房间管理 ====================

  join3DScene(organizationId: string, sceneType: string = 'office'): void {
    this.organizationId = organizationId
    if (this.socket?.connected) {
      this.socket.emit('3d:scene:join', { organizationId, sceneType })
    }
  }

  leave3DScene(): void {
    if (this.socket?.connected && this.organizationId) {
      this.socket.emit('3d:scene:leave', { organizationId: this.organizationId })
    }
  }

  subscribeTaskFlow(processInstanceId?: string): void {
    if (this.socket?.connected && this.organizationId) {
      this.socket.emit('3d:task:subscribe', { 
        organizationId: this.organizationId,
        processInstanceId 
      })
    }
  }

  subscribeCollaborationNetwork(): void {
    if (this.socket?.connected && this.organizationId) {
      this.socket.emit('3d:network:subscribe', { 
        organizationId: this.organizationId 
      })
    }
  }

  // 发送Agent位置更新
  updateAgentPosition(agentId: string, position: { x: number; y: number; z: number }, rotation?: { x: number; y: number; z: number }): void {
    if (this.socket?.connected && this.organizationId) {
      this.socket.emit('3d:agent:position', {
        agentId,
        organizationId: this.organizationId,
        position,
        rotation
      })
    }
  }

  // ==================== HTTP API 方法 ====================

  // 批量获取Agent状态
  async getAgentStatusBatch(agentIds?: string[]): Promise<AgentState[]> {
    try {
      const body: any = { includeTasks: true, includeMetrics: true }
      if (agentIds) body.agentIds = agentIds
      if (this.organizationId) body.organizationId = this.organizationId

      const response = await fetch(`${this.apiBase}/api/metaverse/3d/agents/status/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      
      const result = await response.json()
      return result.success ? result.data.agents : []
    } catch (error) {
      console.error('获取Agent状态失败:', error)
      return []
    }
  }

  // 获取任务流数据
  async getTaskFlow(processInstanceId?: string): Promise<TaskFlowData | null> {
    try {
      let url = `${this.apiBase}/api/metaverse/3d/tasks/flow/stream`
      const params: string[] = []
      if (processInstanceId) params.push(`processInstanceId=${processInstanceId}`)
      if (this.organizationId) params.push(`organizationId=${this.organizationId}`)
      if (params.length > 0) url += '?' + params.join('&')

      const response = await fetch(url)
      const result = await response.json()
      return result.success ? result.data : null
    } catch (error) {
      console.error('获取任务流失败:', error)
      return null
    }
  }

  // 获取协作网络
  async getCollaborationNetwork(timeRange: number = 30, orgId?: string): Promise<CollaborationNetwork | null> {
    try {
      const organizationId = orgId || this.organizationId
      if (!organizationId) return null
      
      const response = await fetch(
        `${this.apiBase}/api/metaverse/3d/collaboration/network/v2?organizationId=${organizationId}&timeRange=${timeRange}`
      )
      const result = await response.json()
      return result.success ? result.data : null
    } catch (error) {
      console.error('获取协作网络失败:', error)
      return null
    }
  }

  // 获取3D场景配置
  async getSceneConfig(sceneType: string = 'office'): Promise<Scene3DConfig | null> {
    try {
      let url = `${this.apiBase}/api/metaverse/3d/scene/config?sceneType=${sceneType}`
      if (this.organizationId) url += `&organizationId=${this.organizationId}`

      const response = await fetch(url)
      const result = await response.json()
      return result.success ? result.data : null
    } catch (error) {
      console.error('获取场景配置失败:', error)
      return null
    }
  }

  // 获取管理中枢数据
  async getManagementHubData(orgId?: string): Promise<ManagementHubData | null> {
    try {
      const organizationId = orgId || this.organizationId
      if (!organizationId) return null
      
      const response = await fetch(
        `${this.apiBase}/api/metaverse/3d/management-hub?organizationId=${organizationId}`
      )
      const result = await response.json()
      return result.success ? result.data : null
    } catch (error) {
      console.error('获取管理中枢数据失败:', error)
      return null
    }
  }

  // 兼容旧API - 获取单个Agent
  async getAgent(agentId: string): Promise<AgentState | null> {
    try {
      const response = await fetch(`${this.apiBase}/api/agents/${agentId}`)
      const result = await response.json()
      return result.success ? this.transformAgent(result.data) : null
    } catch (error) {
      console.error('获取Agent失败:', error)
      return null
    }
  }

  // 兼容旧API - 获取所有Agent
  async getAgents(): Promise<AgentState[]> {
    try {
      let url = `${this.apiBase}/api/agents`
      if (this.organizationId) url += `?organizationId=${this.organizationId}`

      const response = await fetch(url)
      const result = await response.json()
      return result.success ? result.data.map(this.transformAgent) : []
    } catch (error) {
      console.error('获取Agent列表失败:', error)
      return []
    }
  }

  // 转换后端Agent格式到前端格式
  private transformAgent(agent: any): AgentState {
    const roleMap: Record<string, ManagerRole> = {
      '院长': 'assistant',
      '副院长': 'project',
      '技术总监': 'developer',
      '产品总监': 'solution',
      '市场总监': 'marketing',
      '财务总监': 'finance',
      '运营总监': 'devops'
    }

    return {
      id: agent.id,
      name: agent.name,
      role: roleMap[agent.role?.name] || agent.role?.name || 'unknown',
      status: agent.status || 'offline',
      position: agent.position ? JSON.parse(agent.position) : { x: 0, y: 0, z: 0 },
      avatar: agent.avatar,
      currentTask: agent.assignedTasks?.[0],
      currentTasks: agent.assignedTasks,
      metrics: agent.workload !== undefined ? {
        completedTasks: 0,
        inProgressTasks: agent.assignedTasks?.length || 0,
        collaborationCount: 0,
        workloadPercentage: (agent.workload / (agent.maxWorkload || 10)) * 100,
        availabilityScore: agent.availabilityScore || 1.0,
        lastActiveMinutes: agent.lastSeenAt 
          ? Math.floor((Date.now() - new Date(agent.lastSeenAt).getTime()) / 60000)
          : null
      } : undefined,
      efficiency: agent.performanceStats?.completedTasks 
        ? Math.round((agent.performanceStats.completedTasks / 10) * 100)
        : 85,
      lastUpdate: agent.updatedAt || new Date().toISOString()
    }
  }

  // ==================== 事件订阅 ====================

  on(event: MetaverseEventType, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }

  off(event: MetaverseEventType, callback: Function): void {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  private emit(event: MetaverseEventType, data: any): void {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('事件回调错误:', error)
        }
      })
    }
  }

  // ==================== 状态查询 ====================

  isConnected(): boolean {
    return this.socket?.connected || false
  }

  getSocketId(): string | null {
    return this.socket?.id || null
  }

  // ==================== 向后兼容的API (Phase 1-3) ====================

  // 兼容旧的事件订阅
  onEvent(event: string, callback: Function): void {
    // 映射旧事件名到新事件名
    const eventMap: Record<string, MetaverseEventType> = {
      'data_update': 'agent:status:update',
      'connected': 'connection:status',
      'disconnected': 'connection:status'
    }
    const newEvent = eventMap[event] || event as MetaverseEventType
    this.on(newEvent, callback)
  }

  // 兼容旧的数据获取
  async getInitialState(): Promise<any> {
    const [agents, projects] = await Promise.all([
      this.getAgentStatusBatch(),
      this.getProjects()
    ])
    
    return {
      agents,
      projects,
      metrics: {
        cpuUsage: 45,
        memoryUsage: 60,
        activeConnections: this.isConnected() ? 1 : 0
      },
      systemStatus: {
        gateway: this.isConnected() ? 'online' : 'offline',
        feishu: 'online',
        email: 'online',
        lastSync: new Date().toISOString()
      }
    }
  }

  // 兼容旧的项目API
  async getProjects(): Promise<any[]> {
    try {
      const response = await fetch(`${this.apiBase}/api/tasks`)
      const result = await response.json()
      return result.success ? result.data : []
    } catch (error) {
      console.error('获取项目列表失败:', error)
      return []
    }
  }
}

// 单例导出
export const metaverseDataService = new MetaverseDataService()
export default MetaverseDataService

// ============================================
// v3.0 新增类型导出（从后端 types.ts 同步）
// ============================================

// 证据
export interface Evidence {
  id: string
  type: 'document' | 'data' | 'expertOpinion' | 'historicalCase'
  source: string
  content: string
  relevance: number
  verified: boolean
}

// 协商回合
export interface NegotiationRound {
  round: number
  agentId: string
  stance: 'support' | 'challenge' | 'amend' | 'question' | 'accept' | 'reject'
  content: string
  evidence?: Evidence[]
  confidence?: number
  timestamp: string
}

// 不同意见
export interface Dissent {
  agentId: string
  opinion: string
  reason: string
  recordedAt: string
}

// 共识结果
export interface Consensus {
  reached: boolean
  finalAgreement: string
  participatingAgents: string[]
  confidence: number
  dissents?: Dissent[]
  consensusAt: string
}

// 执行追踪
export interface ContractExecution {
  status: 'pending' | 'inProgress' | 'completed' | 'failed' | 'cancelled'
  assignedAgentId?: string
  deliverables: Array<{
    id: string
    name: string
    status: 'pending' | 'submitted' | 'approved' | 'rejected'
    submittedAt?: string
    content?: string
  }>
  verificationResult?: {
    verified: boolean
    verifiedBy?: string
    notes?: string
  }
  completedAt?: string
}

// 审计追踪
export interface AuditTrail {
  createdAt: string
  consensusReachedAt?: string
  executionStartedAt?: string
  completedAt?: string
  decisionRationale: string
  keyEvidence: Evidence[]
}

// 人类介入
export interface HumanIntervention {
  required: boolean
  type?: 'valueJudgment' | 'ethicalDilemma' | 'highStake' | 'consensusFailed'
  requestId?: string
  resolvedAt?: string
  decision?: {
    chosenOption: string
    rationale: string
    decidedBy: string
    decidedAt: string
  }
}

// 协作契约
export interface CollaborationContract {
  contractId: string
  projectId: string
  type: 'taskDelegation' | 'jointWork' | 'peerReview' | 'consultation' | 'arbitration'
  context: {
    description: string
    expectedOutcome: string
    deadline: string
  }
  proposal: {
    agentId: string
    content: string
    evidence: Evidence[]
    confidence: number
    timestamp: string
  }
  negotiation: NegotiationRound[]
  consensus?: Consensus
  execution?: ContractExecution
  auditTrail: AuditTrail
  humanIntervention?: HumanIntervention
}

// 人类介入请求
export interface HumanInterventionRequest {
  requestId: string
  contractId: string
  type: 'valueJudgment' | 'ethicalDilemma' | 'highStake' | 'consensusFailed' | 'insufficientEvidence'
  context: {
    projectId: string
    agentsInvolved: string[]
    negotiationSummary: string
    roundsCompleted: number
    whyAutoFailed: string
  }
  options: Array<{
    id: string
    description: string
    supportingAgents: string[]
    opposingAgents: string[]
    predictedOutcome: any
    risks: string[]
    evidence: Evidence[]
  }>
  agentAnalysis: {
    recommendation: string
    confidence: number
    keyUncertainties: string[]
    whyHumanNeeded: string
  }
  decisionInterface: {
    question: string
    decisionType: 'choose' | 'judge' | 'advice'
    requiredInfo: string[]
  }
  urgency: 'immediate' | 'today' | 'thisWeek' | 'nextWeek'
  status: 'pending' | 'resolved' | 'overridden'
  humanDecision?: {
    chosenOptionId: string
    rationale: string
    decidedAt: string
  }
  requestedAt: string
}
