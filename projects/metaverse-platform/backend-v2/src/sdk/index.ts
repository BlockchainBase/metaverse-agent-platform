/**
 * Metaverse Platform Agent SDK
 * 
 * 数字人元宇宙平台Agent开发SDK
 * 提供认证、任务管理、会议参与等功能封装
 */

// ==================== Types ====================

export interface SDKConfig {
  baseURL: string
  agentId?: string
  apiKey?: string
  autoReconnect?: boolean
  reconnectAttempts?: number
}

export interface AgentCredentials {
  agentId: string
  apiKey: string
  token?: string
}

export interface Task {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  type: string
  data?: any
  dueDate?: string
  assigneeId?: string
  creatorId?: string
  collaborationMode?: string
  createdAt: string
  updatedAt: string
}

export interface Meeting {
  id: string
  title: string
  description?: string
  status: string
  type: string
  scheduledAt: string
  duration: number
  hostId: string
  roomId?: string
  roomPosition?: { x: number; y: number; z: number }
  participants: MeetingParticipant[]
}

export interface MeetingParticipant {
  id: string
  agentId: string
  role: string
  status: string
  joinedAt?: string
  leftAt?: string
}

export interface MeetingInvitation {
  meetingId: string
  title: string
  scheduledAt: string
}

// ==================== Event Handlers ====================

export interface AgentEventHandlers {
  onTaskAssigned?: (task: Task) => void
  onTaskUpdated?: (task: Task) => void
  onTaskCompleted?: (task: Task) => void
  onTaskDelegated?: (task: Task) => void
  onMeetingInvited?: (invitation: MeetingInvitation) => void
  onMeetingStarted?: (meeting: Meeting) => void
  onMeetingEnded?: (meeting: Meeting) => void
  onParticipantJoined?: (participant: MeetingParticipant) => void
  onParticipantLeft?: (participant: MeetingParticipant) => void
  onStatusUpdate?: (status: { agentId: string; status: string }) => void
  onError?: (error: Error) => void
  onConnect?: () => void
  onDisconnect?: (reason: string) => void
}

// ==================== SDK Class (Stub for now) ====================

export class MetaverseAgentSDK {
  config: SDKConfig
  credentials: AgentCredentials | null = null

  constructor(config: SDKConfig) {
    this.config = {
      autoReconnect: true,
      reconnectAttempts: 5,
      ...config
    }
  }

  async login(credentials: { agentId: string; apiKey: string }): Promise<AgentCredentials> {
    const response = await fetch(`${this.config.baseURL}/api/agents/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    })
    
    const result: any = await response.json()
    if (!result.success) throw new Error(result.error || 'Login failed')

    this.credentials = {
      agentId: credentials.agentId,
      apiKey: credentials.apiKey,
      token: result.data?.token
    }
    return this.credentials
  }

  async updateStatus(status: string, position?: { x: number; y: number; z: number }): Promise<void> {
    const body: any = { status }
    if (position) body.position = position

    await fetch(`${this.config.baseURL}/api/agents/${this.credentials?.agentId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.credentials?.token}`
      },
      body: JSON.stringify(body)
    })
  }

  connect(handlers: AgentEventHandlers = {}): void {
    console.log('WebSocket connection would be established here')
    console.log('This is a stub implementation')
    handlers.onConnect?.()
  }

  disconnect(): void {
    console.log('WebSocket disconnected')
  }

  getAgentId(): string | null {
    return this.credentials?.agentId || null
  }
}

// ==================== Factory Function ====================

export function createAgentSDK(config: SDKConfig): MetaverseAgentSDK {
  return new MetaverseAgentSDK(config)
}

export default MetaverseAgentSDK
