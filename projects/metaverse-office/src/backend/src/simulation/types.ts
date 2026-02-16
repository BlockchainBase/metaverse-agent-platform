/**
 * 模拟系统 - 类型定义
 * 11 Agent 持续运行模拟系统
 */

// ==================== Agent 类型 ====================

export type AgentRole = 
  | 'marketing'   // 市场专员
  | 'solution'    // 方案专家
  | 'developer'   // 研发专家
  | 'devops'      // 交付运维
  | 'project'     // 项目管家
  | 'finance'     // 财务专家
  | 'assistant'   // 院长助理

export interface AgentCapabilities {
  [skill: string]: number  // 0-100
}

export interface AgentPersonality {
  proactivity: number      // 主动性 0-100
  thoroughness: number     // 细致度 0-100
  speed: number           // 工作效率 0-100
  collaboration: number   // 协作意愿 0-100
  riskTolerance: number   // 风险承受度 0-100
}

export interface AgentState {
  status: 'idle' | 'working' | 'meeting' | 'busy' | 'offline'
  workload: number         // 0-100
  energy: number          // 精力值 0-100
  currentTaskId?: string
  currentTasks: string[]
  lastUpdate: number
}

export interface AgentRelationship {
  trust: number           // 信任度 0-100
  collaborationCount: number
  lastInteraction: number
}

export interface AgentProfile {
  id: string
  name: string
  role: AgentRole
  position: [number, number, number]
  
  // 能力值
  capabilities: AgentCapabilities
  
  // 工作特征
  personality: AgentPersonality
  
  // 初始状态
  initialState: AgentState
  
  // 社交关系（初始化后动态建立）
  relationships?: Map<string, AgentRelationship>
}

// ==================== 任务类型 ====================

export type TaskType = 
  | 'customer_inquiry'      // 客户咨询
  | 'requirement_analysis'  // 需求分析
  | 'solution_design'       // 方案设计
  | 'technical_review'      // 技术评审
  | 'development'           // 开发任务
  | 'testing'               // 测试任务
  | 'deployment'            // 部署任务
  | 'maintenance'           // 运维任务
  | 'budget_review'         // 预算审批
  | 'project_coordination'  // 项目协调
  | 'emergency_fix'         // 紧急修复
  // V3新增任务类型 - 让所有Agent都有任务
  | 'market_research'       // 市场调研（市场专员）
  | 'content_creation'      // 内容创作（市场/助理）
  | 'data_analysis'         // 数据分析（财务/开发）
  | 'documentation'         // 文档编写（方案/助理）
  | 'training'              // 培训指导（高级工程师）
  | 'quality_audit'         // 质量审计（项目经理）
  | 'vendor_evaluation'     // 供应商评估（财务/项目）
  | 'security_audit'        // 安全审计（运维/方案）
  | 'user_support'          // 用户支持（助理/运维）
  | 'process_improvement'   // 流程优化（项目经理）

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TaskStatus = 'pending' | 'assigned' | 'in_progress' | 'review' | 'completed' | 'cancelled'

export interface Task {
  id: string
  title: string
  description: string
  type: TaskType
  priority: TaskPriority
  status: TaskStatus
  
  // 任务属性
  estimatedDuration: number      // 预计耗时(ticks)
  actualDuration?: number        // 实际耗时
  progress: number               // 0-100
  
  // 执行信息
  creatorId?: string             // 创建者
  assigneeId?: string            // 执行者
  reviewerId?: string            // 审核者
  
  // 时间戳
  createdAt: number
  assignedAt?: number
  startedAt?: number
  completedAt?: number
  
  // 任务依赖
  dependencies?: string[]
  subtasks?: string[]
  
  // 任务成果
  deliverables?: Deliverable[]
  
  // 运行时状态
  hasRequestedCollaboration?: boolean
}

export interface Deliverable {
  id: string
  name: string
  type: 'document' | 'code' | 'design' | 'report' | 'data'
  content?: string
  status: 'pending' | 'submitted' | 'approved' | 'rejected'
  submittedAt?: number
  reviewedAt?: number
}

// ==================== 协作类型 ====================

export type CollaborationType = 
  | 'task_delegation'   // 任务委托
  | 'joint_work'        // 联合工作
  | 'peer_review'       // 同行评审
  | 'consultation'      // 咨询求助
  | 'escalation'        // 问题升级

export type NegotiationStance = 
  | 'support'    // 支持
  | 'challenge'  // 质疑
  | 'amend'      // 修正
  | 'question'   // 询问
  | 'accept'     // 接受
  | 'reject'     // 拒绝

export interface NegotiationRound {
  round: number
  agentId: string
  agentName: string
  stance: NegotiationStance
  content: string
  confidence: number
  timestamp: number
}

export interface CollaborationContract {
  id: string
  type: CollaborationType
  
  // 参与方
  initiatorId: string
  participantId: string
  
  // 关联任务
  taskId: string
  taskTitle: string
  
  // 协商过程
  negotiation: NegotiationRound[]
  
  // 状态
  status: 'negotiating' | 'agreed' | 'rejected' | 'executing' | 'completed'
  
  // 时间戳
  createdAt: number
  agreedAt?: number
  completedAt?: number
  
  // 结果
  result?: {
    agreement: string
    confidence: number
  }
}

// ==================== 场景事件类型 ====================

export type SimulationEventType =
  | 'new_task'              // 新任务
  | 'task_assigned'         // 任务分配
  | 'task_progress'         // 任务进度
  | 'task_completed'        // 任务完成
  | 'collaboration_request' // 协作请求
  | 'negotiation_round'     // 协商回合
  | 'contract_agreed'       // 契约达成
  | 'contract_completed'    // 契约完成
  | 'human_intervention'    // 人类介入
  | 'delegation'            // 任务委托
  | 'agent_status_change'   // Agent状态变化
  | 'stress_test'           // 压力测试
  | 'system_startup'        // 系统启动
  | 'system_shutdown'       // 系统关闭

export interface SimulationEvent {
  id: string
  type: SimulationEventType
  timestamp: number
  tick: number
  
  // 事件相关
  agentId?: string
  targetAgentId?: string
  taskId?: string
  contractId?: string
  
  // 事件数据
  data?: any
}

// ==================== 系统状态类型 ====================

export interface SystemState {
  isRunning: boolean
  isPaused: boolean
  tick: number
  startTime: number
  lastTickTime: number
  
  // Agent统计
  agentStates: AgentStateSnapshot[]
  
  // 任务统计
  activeTasks: number
  completedTasks: number
  pendingTasks: number
  
  // 协作统计
  activeCollaborations: number
  completedCollaborations: number
  
  // 性能指标
  avgTaskCompletionTime: number
  avgCollaborationTime: number
  systemLoad: number
}

export interface AgentStateSnapshot {
  id: string
  name: string
  role: AgentRole
  status: string
  workload: number
  energy: number
  position: [number, number, number]
  currentTask?: {
    id: string
    title: string
    progress: number
  }
}

// ==================== 控制指令类型 ====================

export type ControlCommand =
  | 'start'
  | 'stop'
  | 'pause'
  | 'resume'
  | 'status'
  | 'speed'
  | 'inject'
  | 'export'

export interface ControlMessage {
  command: ControlCommand
  params?: any
}

// ==================== WebSocket 消息类型 ====================

export type WebSocketMessageType =
  | 'system:started'
  | 'system:stopped'
  | 'system:paused'
  | 'system:resumed'
  | 'state:update'
  | 'agent:status_change'
  | 'task:created'
  | 'task:assigned'
  | 'task:progress'
  | 'task:completed'
  | 'delegation:created'
  | 'collaboration:started'
  | 'collaboration:negotiation'
  | 'collaboration:completed'
  | 'human:intervention_required'

export interface WebSocketMessage {
  type: WebSocketMessageType
  timestamp: number
  tick?: number
  data?: any
}

// ==================== 场景配置类型 ====================

export interface ScenarioConfig {
  id: string
  name: string
  description: string
  
  // 触发条件
  trigger: {
    type: 'time' | 'probability' | 'event'
    value: number
    cooldown?: number
  }
  
  // 执行动作
  action: {
    type: string
    params: any
  }
  
  // 状态
  enabled: boolean
  lastTriggered?: number
  triggerCount: number
}
