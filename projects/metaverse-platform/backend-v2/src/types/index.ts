// ==================== Agent Types ====================
export interface AgentCreateInput {
  name: string
  avatar?: string
  type?: string
  config?: Record<string, any>
  capabilities?: string[]
  organizationId: string
  roleId?: string
  supervisorId?: string
  position?: { x: number; y: number; z: number }
}

export interface AgentUpdateInput {
  name?: string
  avatar?: string
  status?: string
  type?: string
  config?: Record<string, any>
  capabilities?: string[]
  roleId?: string
  supervisorId?: string
  position?: { x: number; y: number; z: number }
}

export interface AgentStatus {
  agentId: string
  status: 'online' | 'offline' | 'busy' | 'away'
  currentTask?: string
  location?: { x: number; y: number; z: number }
  timestamp: string
}

// ==================== Task Types ====================
export type TaskStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'delegated'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type CollaborationMode = 'single' | 'collaborative' | 'delegated'

export const TaskStatusTransitions: Record<TaskStatus, TaskStatus[]> = {
  pending: ['assigned', 'cancelled'],
  assigned: ['in_progress', 'cancelled', 'delegated'],
  in_progress: ['completed', 'cancelled', 'delegated'],
  completed: [],
  cancelled: [],
  delegated: ['assigned', 'in_progress', 'cancelled']
}

export interface TaskCreateInput {
  title: string
  description?: string
  priority?: TaskPriority
  type?: string
  data?: Record<string, any>
  dueDate?: Date
  claimDeadline?: Date
  processInstanceId?: string
  assigneeId?: string
  creatorId?: string
  collaborationMode?: CollaborationMode
  dependencies?: string[] // 前置任务ID列表
}

export interface TaskUpdateInput {
  title?: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  data?: Record<string, any>
  dueDate?: Date
  assigneeId?: string
  collaborationMode?: CollaborationMode
}

export interface TaskCollaborator {
  id: string
  taskId: string
  agentId: string
  agentName?: string
  role: 'member' | 'leader' | 'reviewer'
  status: 'active' | 'left'
  joinedAt: Date
}

export interface TaskDependency {
  id: string
  taskId: string
  dependsOnTaskId: string
  dependencyType: 'blocks' | 'requires' | 'relates'
}

export interface TaskDelegationInput {
  taskId: string
  delegateToId: string
  reason?: string
}

export interface TaskTransferInput {
  taskId: string
  transferToId: string
  reason?: string
}

export interface TaskClaimInput {
  taskId: string
  agentId: string
}

// ==================== Meeting Types ====================
export type MeetingStatus = 'scheduled' | 'ongoing' | 'completed' | 'cancelled'
export type MeetingType = 'discussion' | 'decision' | 'review' | 'sync'

export interface MeetingCreateInput {
  title: string
  description?: string
  type?: MeetingType
  scheduledAt: Date
  duration?: number
  organizationId: string
  hostId: string
  participantIds?: string[]
  roomId?: string
  roomPosition?: { x: number; y: number; z: number }
}

export interface MeetingUpdateInput {
  title?: string
  description?: string
  type?: MeetingType
  scheduledAt?: Date
  duration?: number
  status?: MeetingStatus
  roomId?: string
  roomPosition?: { x: number; y: number; z: number }
}

export interface MeetingAgendaItem {
  id: string
  title: string
  description?: string
  duration: number
  order: number
  status: 'pending' | 'discussing' | 'completed' | 'skipped'
  ownerId?: string
  notes?: string
}

export interface MeetingAgendaCreateInput {
  title: string
  description?: string
  duration?: number
  order?: number
  ownerId?: string
}

export interface MeetingParticipant {
  id: string
  meetingId: string
  agentId: string
  agentName?: string
  avatar?: string
  role: 'host' | 'participant' | 'observer'
  status: 'invited' | 'joined' | 'left' | 'declined'
  joinedAt?: Date
  leftAt?: Date
  speakCount: number
  speakDuration: number
}

export interface MeetingResolution {
  id: string
  title: string
  content: string
  type: 'decision' | 'action_item' | 'note'
  meetingId: string
  agendaItemId?: string
  assigneeId?: string
  assigneeName?: string
  generatedTaskId?: string
  createdAt: Date
}

export interface MeetingResolutionCreateInput {
  title: string
  content: string
  type?: 'decision' | 'action_item' | 'note'
  agendaItemId?: string
  assigneeId?: string
}

// ==================== 3D Visualization Types ====================
export interface Agent3DStatus {
  id: string
  name: string
  avatar?: string
  status: string
  type: string
  position: { x: number; y: number; z: number }
  currentTask?: {
    id: string
    title: string
    status: string
  }
  lastSeenAt: Date
}

export interface TaskFlowNode {
  id: string
  type: 'task' | 'agent' | 'milestone'
  data: any
  position?: { x: number; y: number }
}

export interface TaskFlowEdge {
  id: string
  source: string
  target: string
  type: 'dependency' | 'assignment' | 'delegation'
  data?: any
}

export interface CollaborationNetworkNode {
  id: string
  type: 'agent' | 'task'
  label: string
  data: any
  position?: { x: number; y: number; z?: number }
}

export interface CollaborationNetworkEdge {
  id: string
  source: string
  target: string
  type: 'reports_to' | 'collaborates_with' | 'delegates_to' | 'assigned_to'
  weight: number
}

export interface Organization3DData {
  agents: Agent3DStatus[]
  meetings: {
    id: string
    title: string
    status: string
    roomPosition?: { x: number; y: number; z: number }
    participants: string[]
  }[]
  collaborationEdges: CollaborationNetworkEdge[]
}

// ==================== Process Types ====================
export interface ProcessTemplateCreateInput {
  name: string
  description?: string
  definition: Record<string, any>
  businessId: string
}

export interface ProcessTemplateUpdateInput {
  name?: string
  description?: string
  definition?: Record<string, any>
  status?: string
}

export interface ProcessInstanceCreateInput {
  templateId: string
  data?: Record<string, any>
}

// ==================== API Response Types ====================
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  meta?: {
    page?: number
    limit?: number
    total?: number
    hasMore?: boolean
  }
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  meta: {
    page: number
    limit: number
    total: number
    hasMore: boolean
  }
}

// ==================== WebSocket Event Types ====================
export interface WSEvent<T = any> {
  type: string
  timestamp: string
  data: T
}

export type TaskEventType = 
  | 'task:created'
  | 'task:updated'
  | 'task:assigned'
  | 'task:claimed'
  | 'task:delegated'
  | 'task:transferred'
  | 'task:completed'
  | 'task:collaborator:joined'
  | 'task:collaborator:left'

export type MeetingEventType =
  | 'meeting:created'
  | 'meeting:updated'
  | 'meeting:started'
  | 'meeting:ended'
  | 'meeting:participant:joined'
  | 'meeting:participant:left'
  | 'meeting:agenda:updated'
  | 'meeting:resolution:created'

export type AgentEventType =
  | 'agent:status:update'
  | 'agent:position:update'
  | 'agent:activity'
