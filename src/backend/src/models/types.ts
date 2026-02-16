// 数据模型定义

// AI角色状态
export interface AgentState {
  id: string
  name: string
  role: string
  status: 'working' | 'idle' | 'meeting' | 'busy' | 'offline'
  position: {
    x: number
    y: number
    z: number
  }
  currentTask: string
  taskProgress: number
  efficiency: number
  lastUpdate: string
}

// 项目信息
export interface Project {
  id: string
  name: string
  description: string
  progress: number
  status: 'not_started' | 'in_progress' | 'completed' | 'delayed'
  assignee: string
  startDate: string
  deadline: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
}

// 日程事件
export interface ScheduleEvent {
  id: string
  title: string
  startTime: string
  endTime: string
  participants: string[]
  location: string
  type: 'meeting' | 'deadline' | 'reminder' | 'task'
  status: 'upcoming' | 'ongoing' | 'completed'
}

// 系统指标
export interface SystemMetrics {
  cpuUsage: number
  memoryUsage: number
  diskUsage: number
  networkStatus: number
  activeConnections: number
  responseTime: number
}

// 消息通知
export interface Notification {
  id: string
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  timestamp: string
  read: boolean
  source: string
}

// 实时数据
export interface RealtimeData {
  timestamp: string
  agentStates: AgentState[]
  activeProjects: Project[]
  todaySchedule: ScheduleEvent[]
  systemMetrics: SystemMetrics
  notifications: Notification[]
}

// 元宇宙场景状态
export interface MetaverseState {
  agents: AgentState[]
  projects: Project[]
  schedule: ScheduleEvent[]
  metrics: SystemMetrics
  systemStatus: {
    gateway: 'online' | 'offline'
    feishu: 'online' | 'offline'
    email: 'online' | 'offline'
    lastSync: string
  }
}

// ============================================
// v3.0 新增：Agent协作协议类型定义
// ============================================

// Agent能力档案
export interface AgentCapability {
  agentId: string
  name: string
  role: string
  
  // 专业能力
  expertise: Array<{
    domain: string           // 专业领域，如"AI医疗", "微服务架构"
    level: number            // 能力值 0-1
    evidence: string[]       // 证明能力的项目/成果
    lastValidated: string    // ISO日期
  }>
  
  // 协作特征
  collaborationProfile: {
    responseTime: number     // 平均响应时间（分钟）
    qualityScore: number     // 历史交付质量 0-1
    completionRate: number   // 任务完成率
    preferredTaskSize: 'small' | 'medium' | 'large'
    communicationStyle: 'direct' | 'analytical' | 'diplomatic'
  }
  
  // 置信度阈值
  confidenceThreshold: {
    autoExecute: number      // >此值自动执行
    negotiate: number        // 此值到autoExecute之间需要协商
    escalateToHuman: number  // <此值上报人类
  }
  
  // 当前状态
  currentState: {
    workload: number         // 当前负载 0-1
    activeContracts: string[] // 活跃的协作契约ID
    availability: 'available' | 'busy' | 'offline'
  }
}

// 证据
export interface Evidence {
  id: string
  type: 'document' | 'data' | 'expertOpinion' | 'historicalCase'
  source: string
  content: string
  relevance: number    // 相关性评分 0-1
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
  
  // 上下文
  context: {
    description: string
    expectedOutcome: string
    deadline: string
  }
  
  // 发起提议
  proposal: {
    agentId: string
    content: string
    evidence: Evidence[]
    confidence: number
    timestamp: string
  }
  
  // 协商过程
  negotiation: NegotiationRound[]
  
  // 共识结果
  consensus?: Consensus
  
  // 执行追踪
  execution?: ContractExecution
  
  // 审计追踪
  auditTrail: AuditTrail
  
  // 人类介入
  humanIntervention?: HumanIntervention
}

// 任务需求
export interface TaskRequirements {
  taskId: string
  projectId: string
  type: 'design' | 'develop' | 'deploy' | 'analyze' | 'coordinate'
  description: string
  
  // 能力需求
  requiredCapabilities: Array<{
    domain: string
    minLevel: number
    weight: number
  }>
  
  // 协作需求
  collaborationProfile: {
    teamSize: number
    communicationIntensity: 'async' | 'daily' | 'realtime'
    expectedDuration: number  // 预计工时
    deadline: string
  }
  
  // 约束条件
  constraints?: {
    maxWorkload?: number
    excludeAgents?: string[]
  }
}

// 任务分配
export interface TaskAssignment {
  taskId: string
  agentId: string
  assignedAt: string
  status: 'pending' | 'accepted' | 'rejected' | 'completed'
}

// 匹配结果
export interface MatchResult {
  primary: {
    agentId: string
    agentName: string
    totalScore: number
    reasoning: string
  }
  alternatives: Array<{
    agentId: string
    agentName: string
    totalScore: number
    reasoning: string
  }>
  allMatches?: Array<{
    agentId: string
    agentName: string
    totalScore: number
    reasoning: string
    breakdown?: {
      capabilityScore: number
      collaborationScore: number
      workloadPenalty: number
      currentWorkload: number
    }
  }>
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
  
  urgency: 'immediate' | 'today' | 'thisWeek' | 'nextWeek'
  
  status: 'pending' | 'resolved' | 'overridden'
  humanDecision?: {
    chosenOptionId: string
    rationale: string
    decidedAt: string
  }
  
  requestedAt: string
}
