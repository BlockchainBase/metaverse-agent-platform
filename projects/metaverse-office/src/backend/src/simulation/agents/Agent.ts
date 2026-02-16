/**
 * Agent 类 - 数字员工实体
 */

import { v4 as uuidv4 } from 'uuid'
import {
  AgentProfile,
  AgentState,
  AgentRelationship,
  AgentCapabilities,
  Task,
  TaskType,
  SimulationEvent,
  CollaborationContract
} from '../types.js'

export class Agent {
  // 基础信息
  id: string
  name: string
  role: string
  position: [number, number, number]
  
  // 能力值
  capabilities: AgentCapabilities
  
  // 工作特征
  personality: {
    proactivity: number
    thoroughness: number
    speed: number
    collaboration: number
    riskTolerance: number
  }
  
  // 动态状态
  state: AgentState
  
  // 社交关系
  relationships: Map<string, AgentRelationship>
  
  // 当前任务
  currentTask: Task | null = null
  taskHistory: Task[] = []
  
  // 协作历史
  collaborationHistory: CollaborationContract[] = []
  
  // 统计
  stats = {
    tasksCompleted: 0,
    tasksDelegated: 0,
    collaborationsInitiated: 0,
    collaborationsParticipated: 0,
    totalWorkTicks: 0
  }

  constructor(profile: AgentProfile) {
    this.id = profile.id
    this.name = profile.name
    this.role = profile.role
    this.position = [...profile.position] as [number, number, number]
    this.capabilities = { ...profile.capabilities }
    this.personality = { ...profile.personality }
    this.state = { ...profile.initialState }
    this.relationships = new Map()
  }

  // ==================== 状态更新 V2 - 优化版 ====================

  update(): SimulationEvent[] {
    const events: SimulationEvent[] = []
    const now = Date.now()
    
    // 精力恢复 (idle时恢复更快)
    if (this.state.status === 'idle') {
      this.state.energy = Math.min(100, this.state.energy + 0.5)
    } else {
      this.state.energy = Math.max(0, this.state.energy - 0.2)
    }
    
    // 工作量衰减 - 仅在idle且没有任务时
    if (this.state.status === 'idle' && this.state.currentTasks.length === 0) {
      this.state.workload = Math.max(0, this.state.workload - 0.5)
    }
    
    // 任务执行
    if (this.currentTask && this.state.status === 'working') {
      const taskEvents = this.workOnTask()
      events.push(...taskEvents)
    }
    
    // 主动寻找机会 (基于主动性)
    if (this.state.status === 'idle' && Math.random() * 100 < this.personality.proactivity) {
      // 可能主动承担任务或发起协作
      events.push(...this.considerProactiveAction())
    }
    
    this.state.lastUpdate = now
    this.stats.totalWorkTicks++
    
    return events
  }

  // ==================== 任务管理 V2 - 优化版 ====================

  // 检查是否可以接受新任务（允许工作中的Agent接收低优先级任务）
  canAcceptTask(taskPriority?: string): boolean {
    // 离线状态不接受
    if (this.state.status === 'offline') return false
    
    // 精力不足不接受
    if (this.state.energy < 15) return false
    
    // 负载检查
    const maxWorkload = taskPriority === 'urgent' ? 85 : taskPriority === 'high' ? 60 : 40
    if (this.state.workload > maxWorkload) return false
    
    // 如果正在工作，只允许接收紧急任务
    if (this.state.status === 'working' && taskPriority !== 'urgent') return false
    
    // 如果已经有3个以上的任务，不再接收
    if (this.state.currentTasks.length >= 3) return false
    
    return true
  }

  assignTask(task: Task): boolean {
    if (!this.canAcceptTask(task.priority)) {
      return false
    }
    
    // 保存到当前任务列表
    this.state.currentTasks.push(task.id)
    
    // 如果没有正在执行的任务，立即开始
    if (!this.currentTask) {
      this.currentTask = task
      this.state.status = 'working'
    }
    
    // 增加负载
    this.state.workload = Math.min(100, this.state.workload + task.estimatedDuration / 10)
    
    task.assigneeId = this.id
    task.assignedAt = Date.now()
    if (!task.startedAt) {
      task.startedAt = Date.now()
    }
    task.status = 'in_progress'
    
    return true
  }

  private workOnTask(): SimulationEvent[] {
    const events: SimulationEvent[] = []
    if (!this.currentTask) return events
    
    const task = this.currentTask
    
    // 计算进度增量 (基于效率) - 加快进度以更快完成任务
    const efficiency = this.calculateEfficiency()
    const speedMultiplier = this.state.currentTasks.length > 1 ? 0.7 : 1.0 // 多任务减速
    const progressIncrement = efficiency * (this.personality.speed / 100) * 5 * speedMultiplier
    task.progress += progressIncrement
    
    // 检查是否需要协作
    if (task.progress > 50 && task.progress < 60 && !task.hasRequestedCollaboration) {
      task.hasRequestedCollaboration = true
      events.push({
        id: uuidv4(),
        type: 'collaboration_request',
        timestamp: Date.now(),
        tick: 0,
        agentId: this.id,
        taskId: task.id,
        data: { reason: '需要协助完成' }
      })
    }
    
    // 任务完成
    if (task.progress >= 100) {
      events.push(...this.completeTask())
    }
    
    return events
  }

  private completeTask(): SimulationEvent[] {
    const events: SimulationEvent[] = []
    if (!this.currentTask) return events
    
    const task = this.currentTask
    task.status = 'completed'
    task.completedAt = Date.now()
    task.actualDuration = Date.now() - (task.startedAt || Date.now())
    
    // 更新统计
    this.stats.tasksCompleted++
    
    // 从当前任务列表中移除
    const taskIndex = this.state.currentTasks.indexOf(task.id)
    if (taskIndex > -1) {
      this.state.currentTasks.splice(taskIndex, 1)
    }
    
    // 减少负载
    this.state.workload = Math.max(0, this.state.workload - task.estimatedDuration / 10)
    
    const durationSec = (task.actualDuration || 0) / 1000
    console.log(`✅ ${this.name} 完成任务: ${task.title} (耗时: ${durationSec.toFixed(1)}秒, 总计完成: ${this.stats.tasksCompleted})`)
    
    events.push({
      id: uuidv4(),
      type: 'task_completed',
      timestamp: Date.now(),
      tick: 0,
      agentId: this.id,
      taskId: task.id,
      data: {
        taskTitle: task.title,
        duration: task.actualDuration
      }
    })
    
    // 保存到历史
    this.taskHistory.push(task)
    
    // 如果还有其他任务，继续执行下一个
    // 实际情况下这里应该从任务队列中取出下一个任务
    // 简化处理：设置为idle，等待新的分配
    this.currentTask = null
    if (this.state.currentTasks.length === 0) {
      this.state.status = 'idle'
    }
    
    return events
  }

  // ==================== 协作能力 ====================

  initiateCollaboration(targetAgentId: string, task: Task): CollaborationContract {
    this.stats.collaborationsInitiated++
    
    return {
      id: uuidv4(),
      type: 'task_delegation',
      initiatorId: this.id,
      participantId: targetAgentId,
      taskId: task.id,
      taskTitle: task.title,
      negotiation: [],
      status: 'negotiating',
      createdAt: Date.now()
    }
  }

  respondToCollaboration(contract: CollaborationContract): { stance: string; content: string; confidence: number } {
    this.stats.collaborationsParticipated++
    
    // 基于信任度和当前状态决定回应
    const relationship = this.relationships.get(contract.initiatorId)
    const trust = relationship?.trust || 50
    const hasCapacity = this.state.workload < 70
    
    if (trust > 60 && hasCapacity) {
      return {
        stance: 'support',
        content: `我愿意协助完成${contract.taskTitle}`,
        confidence: 0.8
      }
    } else if (hasCapacity) {
      return {
        stance: 'amend',
        content: `我可以协助，但需要更多资源`,
        confidence: 0.6
      }
    } else {
      return {
        stance: 'reject',
        content: `当前工作负载已满，无法承担`,
        confidence: 0.9
      }
    }
  }

  // ==================== 主动行为 ====================

  private considerProactiveAction(): SimulationEvent[] {
    const events: SimulationEvent[] = []
    
    // 检查是否可以接手新任务
    if (this.state.workload < 50 && this.personality.proactivity > 70) {
      // 高主动性Agent可能主动请求任务
      // 这个逻辑由引擎统一处理
    }
    
    return events
  }

  // ==================== 辅助方法 ====================

  private calculateEfficiency(): number {
    // 效率 = 能力匹配度 * 精力 * 细致度
    const baseEfficiency = 1.0
    const energyFactor = this.state.energy / 100
    const thoroughnessFactor = this.personality.thoroughness / 100
    
    return baseEfficiency * energyFactor * thoroughnessFactor
  }

  hasSkill(skill: string, minLevel: number = 50): boolean {
    return (this.capabilities[skill] || 0) >= minLevel
  }

  getSkillLevel(skill: string): number {
    return this.capabilities[skill] || 0
  }

  updateRelationship(agentId: string, delta: number): void {
    const existing = this.relationships.get(agentId)
    if (existing) {
      existing.trust = Math.max(0, Math.min(100, existing.trust + delta))
      existing.collaborationCount++
      existing.lastInteraction = Date.now()
    } else {
      this.relationships.set(agentId, {
        trust: Math.max(0, Math.min(100, 50 + delta)),
        collaborationCount: 1,
        lastInteraction: Date.now()
      })
    }
  }

  // ==================== 序列化 ====================

  toJSON(): any {
    return {
      id: this.id,
      name: this.name,
      role: this.role,
      position: this.position,
      capabilities: this.capabilities,
      personality: this.personality,
      state: this.state,
      stats: this.stats,
      currentTaskId: this.currentTask?.id || null
    }
  }

  static fromJSON(data: any): Agent {
    // 从JSON恢复Agent
    const profile = {
      id: data.id,
      name: data.name,
      role: data.role,
      position: data.position,
      capabilities: data.capabilities,
      personality: data.personality,
      initialState: data.state
    }
    
    const agent = new Agent(profile)
    agent.stats = data.stats
    return agent
  }
}
