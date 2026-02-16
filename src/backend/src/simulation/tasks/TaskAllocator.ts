/**
 * 任务分配器 V3 - 全面负载均衡版
 * 解决6人零任务问题：强制轮询 + 新人保护 + 负载上限
 */

import { Agent } from '../agents/Agent.js'
import { Task, TaskType } from '../types.js'

interface MatchScore {
  agent: Agent
  score: number
  breakdown: {
    capabilityScore: number
    workloadPenalty: number
    energyScore: number
    availabilityScore: number
    relationshipScore: number
    rotationBonus: number
  }
}

interface AllocationStats {
  totalAllocations: number
  loadBalanceScore: number
  avgWorkload: number
  maxWorkload: number
  minWorkload: number
  zeroTaskAgents: number
}

// 任务类型到所需能力的映射 - 扩展更多匹配
const skillRequirements: Record<TaskType, string[]> = {
  customer_inquiry: ['customer_acquisition', 'communication', 'requirement_analysis'],
  requirement_analysis: ['requirement_analysis', 'communication', 'product_design'],
  solution_design: ['product_design', 'architecture', 'innovation', 'technical_review'],
  technical_review: ['architecture', 'code_quality', 'security', 'testing'],
  development: ['frontend', 'backend', 'fullstack', 'testing', 'debugging'],
  testing: ['testing', 'debugging', 'quality_assurance'],
  deployment: ['deployment', 'automation', 'maintenance', 'monitoring'],
  maintenance: ['maintenance', 'monitoring', 'troubleshooting', 'debugging'],
  budget_review: ['budgeting', 'cost_control', 'financial_analysis', 'risk_assessment'],
  project_coordination: ['coordination', 'scheduling', 'communication', 'conflict_resolution'],
  emergency_fix: ['troubleshooting', 'debugging', 'deployment', 'security'],
  // V3新增任务类型的技能需求
  market_research: ['customer_acquisition', 'communication', 'product_design', 'innovation'],
  content_creation: ['communication', 'documentation', 'innovation'],
  data_analysis: ['data_analysis', 'financial_analysis', 'debugging'],
  documentation: ['documentation', 'communication', 'architecture'],
  training: ['communication', 'coordination', 'technical_review'],
  quality_audit: ['quality_assurance', 'coordination', 'testing'],
  vendor_evaluation: ['budgeting', 'cost_control', 'communication'],
  security_audit: ['security', 'architecture', 'monitoring'],
  user_support: ['communication', 'troubleshooting', 'customer_acquisition'],
  process_improvement: ['coordination', 'scheduling', 'innovation']
}

export class TaskAllocator {
  private agents: Map<string, Agent>
  private stats: AllocationStats = {
    totalAllocations: 0,
    loadBalanceScore: 0,
    avgWorkload: 0,
    maxWorkload: 0,
    minWorkload: 0,
    zeroTaskAgents: 0
  }
  
  // 记录最近分配历史（用于轮询）
  private recentAssignments: string[] = []
  private readonly MAX_HISTORY = 5
  
  // 强制轮询计数器
  private assignmentCounts: Map<string, number> = new Map()

  constructor(agents: Map<string, Agent>) {
    this.agents = agents
  }

  // 分配任务 - V3全面负载均衡
  allocate(task: Task): Agent | null {
    const candidates = this.findCandidates(task)
    
    if (candidates.length === 0) {
      console.log(`⚠️ 无可用Agent执行任务: ${task.title}`)
      return null
    }

    // 按分数排序
    candidates.sort((a, b) => b.score - a.score)
    
    // V3策略：强制轮询选择
    // 优先选择已完成任务数最少的Agent（解决零任务问题）
    const winner = this.selectWithRotation(candidates, task)
    
    // 更新分配历史
    this.recordAssignment(winner.agent.id)
    this.stats.totalAllocations++
    
    console.log(`✅ 任务分配: ${task.title} -> ${winner.agent.name} (匹配度: ${winner.score.toFixed(1)}, 当前负载: ${winner.agent.state.workload.toFixed(1)}%, 历史任务: ${winner.agent.stats.tasksCompleted})`)
    
    return winner.agent
  }

  // 轮询选择策略 - 核心改进
  private selectWithRotation(candidates: MatchScore[], task: Task): MatchScore {
    // 获取所有候选人的历史任务数
    const candidatesWithHistory = candidates.map(c => ({
      ...c,
      completedTasks: c.agent.stats.tasksCompleted,
      currentTasks: c.agent.state.currentTasks.length
    }))
    
    // 找出任务数最少的值
    const minCompleted = Math.min(...candidatesWithHistory.map(c => c.completedTasks))
    
    // 筛选出任务数最少的Agent（零任务优先）
    const zeroOrLowTaskAgents = candidatesWithHistory.filter(c => 
      c.completedTasks === minCompleted || c.completedTasks <= 2
    )
    
    if (zeroOrLowTaskAgents.length > 0) {
      // 在零/低任务Agent中选择匹配度最高的
      zeroOrLowTaskAgents.sort((a, b) => b.score - a.score)
      
      // 如果分数差距不大（<20分），优先选任务少的
      const best = zeroOrLowTaskAgents[0]
      const alternatives = zeroOrLowTaskAgents.slice(1).filter(a => a.score > best.score - 20)
      
      if (alternatives.length > 0) {
        // 选择当前负载最低的
        return alternatives.reduce((min, current) => 
          current.agent.state.workload < min.agent.state.workload ? current : min
        , best)
      }
      
      return best
    }
    
    // 如果没有零/低任务Agent，使用负载均衡策略
    const topCandidates = candidates.slice(0, 3)
    return topCandidates.reduce((best, current) => {
      // 分数差距不大时，选负载低的
      if (current.score > best.score - 15) {
        return current.agent.state.workload < best.agent.state.workload ? current : best
      }
      return best
    }, topCandidates[0])
  }

  // 记录分配历史
  private recordAssignment(agentId: string): void {
    this.recentAssignments.push(agentId)
    if (this.recentAssignments.length > this.MAX_HISTORY) {
      this.recentAssignments.shift()
    }
    
    const count = this.assignmentCounts.get(agentId) || 0
    this.assignmentCounts.set(agentId, count + 1)
  }

  // 查找候选Agent - 扩展匹配范围
  private findCandidates(task: Task): MatchScore[] {
    const candidates: MatchScore[] = []
    const requiredSkills = skillRequirements[task.type] || []

    // 计算统计数据
    const workloads = Array.from(this.agents.values()).map(a => a.state.workload)
    const avgWorkload = workloads.reduce((a, b) => a + b, 0) / workloads.length
    const maxWorkload = Math.max(...workloads)
    
    // 获取零任务Agent数量
    const zeroTaskCount = Array.from(this.agents.values()).filter(a => a.stats.tasksCompleted === 0).length

    for (const agent of this.agents.values()) {
      // 基础检查
      if (!this.canAcceptTask(agent, task, avgWorkload, maxWorkload, zeroTaskCount > 0)) {
        continue
      }

      const score = this.calculateMatchScore(agent, task, requiredSkills, avgWorkload, zeroTaskCount > 0)
      candidates.push(score)
    }

    return candidates
  }

  // 检查Agent是否可接受任务
  private canAcceptTask(agent: Agent, task: Task, avgWorkload: number, maxWorkload: number, hasZeroTaskAgents: boolean): boolean {
    // 离线检查
    if (agent.state.status === 'offline') return false
    
    // 如果存在零任务Agent，已有任务的Agent优先级降低
    if (hasZeroTaskAgents && agent.stats.tasksCompleted > 2) {
      // 只有当能力特别强时才考虑
      if (task.priority !== 'urgent') return false
    }
    
    // 当前有任务的Agent检查
    if (agent.currentTask !== null) {
      if (task.priority !== 'urgent') return false
      if (agent.state.workload > 40) return false
    }
    
    // 动态负载阈值
    const baseThreshold = task.priority === 'urgent' ? 90 : 
                          task.priority === 'high' ? 70 : 50
    
    // 零任务Agent放宽限制
    if (agent.stats.tasksCompleted === 0) {
      return agent.state.workload < 85 && agent.state.energy > 10
    }
    
    if (agent.state.workload > baseThreshold) return false
    
    // 任务数量上限
    const taskLimit = task.priority === 'urgent' ? 4 : 2
    if (agent.state.currentTasks.length >= taskLimit) return false
    
    // 精力检查
    if (agent.state.energy < 10) return false
    
    return true
  }

  // 计算匹配分数 - V3增强版
  private calculateMatchScore(agent: Agent, task: Task, requiredSkills: string[], avgWorkload: number, hasZeroTaskAgents: boolean): MatchScore {
    // 1. 能力匹配度 (30%)
    let capabilityScore = 0
    if (requiredSkills.length > 0) {
      const skillScores = requiredSkills.map(skill => agent.getSkillLevel(skill))
      capabilityScore = skillScores.reduce((a, b) => a + b, 0) / skillScores.length
    } else {
      capabilityScore = 50
    }

    // 2. 负载惩罚 (25%)
    const workloadRatio = agent.state.workload / 100
    const workloadPenalty = Math.pow(workloadRatio, 1.5) * 100
    const avgRatio = avgWorkload > 0 ? agent.state.workload / avgWorkload : 1
    const extraPenalty = avgRatio > 1.5 ? (avgRatio - 1.5) * 20 : 0

    // 3. 精力状态 (15%)
    const energyScore = agent.state.energy

    // 4. 可用性 (10%)
    const availabilityScore = agent.state.status === 'idle' ? 100 : 60

    // 5. 关系分 (5%)
    let relationshipScore = 50
    if (task.creatorId) {
      const rel = agent.relationships.get(task.creatorId)
      relationshipScore = rel?.trust || 50
    }

    // 6. 轮询奖励 (15%) - V3核心：鼓励分配任务给任务少的Agent
    let rotationBonus = 0
    const completedTasks = agent.stats.tasksCompleted
    
    if (completedTasks === 0) {
      rotationBonus = 30 // 零任务Agent大幅加分
    } else if (completedTasks <= 2) {
      rotationBonus = 20 // 低任务Agent加分
    } else if (completedTasks <= 5) {
      rotationBonus = 10
    } else {
      rotationBonus = Math.max(0, 10 - (completedTasks - 5) * 2) // 高任务Agent逐渐减分
    }

    // 计算总分
    let totalScore = 
      capabilityScore * 0.30 +
      (100 - workloadPenalty - extraPenalty) * 0.25 +
      energyScore * 0.15 +
      availabilityScore * 0.10 +
      relationshipScore * 0.05 +
      rotationBonus * 0.15

    // 确保分数不为负
    totalScore = Math.max(0, totalScore)

    // 优先级加分
    if (task.priority === 'urgent') {
      totalScore += 10
    } else if (task.priority === 'high') {
      totalScore += 5
    }

    // 最近分配过的Agent减分（防连续分配）
    if (this.recentAssignments.includes(agent.id)) {
      totalScore -= 15
    }

    return {
      agent,
      score: totalScore,
      breakdown: {
        capabilityScore,
        workloadPenalty: workloadPenalty + extraPenalty,
        energyScore,
        availabilityScore,
        relationshipScore,
        rotationBonus
      }
    }
  }

  // 获取统计信息
  getLoadBalanceStats(): AllocationStats {
    const agentList = Array.from(this.agents.values())
    const workloads = agentList.map(a => a.state.workload)
    const avg = workloads.reduce((a, b) => a + b, 0) / workloads.length
    const max = Math.max(...workloads)
    const min = Math.min(...workloads)
    
    const variance = workloads.reduce((sum, w) => sum + Math.pow(w - avg, 2), 0) / workloads.length
    const stdDev = Math.sqrt(variance)
    const balanceScore = Math.max(0, 100 - (stdDev / (avg || 1)) * 100)
    
    const zeroTaskCount = agentList.filter(a => a.stats.tasksCompleted === 0).length

    return {
      totalAllocations: this.stats.totalAllocations,
      loadBalanceScore: Math.round(balanceScore),
      avgWorkload: Math.round(avg * 10) / 10,
      maxWorkload: Math.round(max * 10) / 10,
      minWorkload: Math.round(min * 10) / 10,
      zeroTaskAgents: zeroTaskCount
    }
  }

  // 批量分配
  allocateBatch(tasks: Task[]): Map<string, Agent> {
    const allocations = new Map<string, Agent>()
    
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
    const sortedTasks = [...tasks].sort((a, b) => 
      (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4)
    )

    for (const task of sortedTasks) {
      const agent = this.allocate(task)
      if (agent) {
        allocations.set(task.id, agent)
      }
    }

    return allocations
  }

  // 检查是否需要重新平衡
  checkLoadBalance(): { needRebalance: boolean; zeroTaskAgents: string[]; overloadedAgents: string[] } {
    const agentList = Array.from(this.agents.values())
    const avg = agentList.reduce((sum, a) => sum + a.state.workload, 0) / agentList.length
    
    const zeroTask = agentList.filter(a => a.stats.tasksCompleted === 0).map(a => a.name)
    const overloaded = agentList.filter(a => a.state.workload > avg + 30).map(a => a.name)
    
    return {
      needRebalance: zeroTask.length > 0 || (overloaded.length > 0 && zeroTask.length > 0),
      zeroTaskAgents: zeroTask,
      overloadedAgents: overloaded
    }
  }
}
