import { PrismaClient, Agent, Task, TaskMatchHistory } from '@prisma/client'
import { llmService } from './llmService.js'

// 技能标签
export interface SkillTag {
  name: string
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  verified: boolean
  verifiedAt?: Date
}

// Agent能力画像
export interface AgentCapabilityProfile {
  agentId: string
  skills: SkillTag[]
  performance: {
    completedTasks: number
    onTimeRate: number
    avgQuality: number
    avgResponseTime: number
  }
  preferences: {
    taskTypes: string[]
    workingHours?: { start: string; end: string }
    maxConcurrentTasks: number
  }
  currentLoad: {
    activeTasks: number
    pendingTasks: number
    utilizationRate: number
  }
  collaborationScore: number
}

// 任务需求
export interface TaskRequirement {
  requiredSkills: Array<{
    skill: string
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
    weight: number // 0-1
  }>
  estimatedHours: number
  priority: 'low' | 'medium' | 'high' | 'urgent'
  deadline?: Date
  collaborationNeeded: boolean
}

// 匹配结果
export interface MatchResult {
  agentId: string
  agentName: string
  scores: {
    skillMatch: number
    availability: number
    workload: number
    history: number
    overall: number
  }
  details: {
    matchedSkills: Array<{ skill: string; agentLevel: string; requiredLevel: string; match: number }>
    currentWorkload: number
    maxWorkload: number
    recentPerformance: number
    reasons: string[]
  }
  recommendation: 'highly_recommended' | 'recommended' | 'acceptable' | 'not_recommended'
}

// 匹配选项
export interface MatchOptions {
  topK?: number
  minOverallScore?: number
  considerWorkload?: boolean
  considerHistory?: boolean
  strategy?: 'best_fit' | 'load_balanced' | 'skill_diverse' | 'round_robin'
}

// 负载均衡配置
export interface LoadBalanceConfig {
  maxUtilization: number // 最大利用率 0-1
  overloadThreshold: number // 过载阈值
  redistributionEnabled: boolean
}

/**
 * 任务匹配服务 - 智能任务-Agent匹配算法
 */
export class TaskMatchingService {
  private prisma: PrismaClient
  private loadBalanceConfig: LoadBalanceConfig
  
  constructor(prisma: PrismaClient) {
    this.prisma = prisma
    this.loadBalanceConfig = {
      maxUtilization: 0.8,
      overloadThreshold: 0.9,
      redistributionEnabled: true
    }
  }
  
  // ============================================
  // Agent能力画像管理
  // ============================================
  
  /**
   * 构建Agent能力画像
   */
  async buildCapabilityProfile(agentId: string): Promise<AgentCapabilityProfile> {
    const agent = await this.prisma.agent.findUnique({
      where: { id: agentId },
      include: {
        assignedTasks: {
          where: { status: { in: ['in_progress', 'assigned'] } }
        },
        collaborations: {
          include: { task: true }
        }
      }
    })
    
    if (!agent) {
      throw new Error('Agent not found')
    }
    
    // 解析技能
    const skillProfile = agent.skillProfile ? JSON.parse(agent.skillProfile) : { skills: [] }
    
    // 获取历史绩效
    const performanceStats = await this.calculatePerformanceStats(agentId)
    
    // 计算协作分数
    const collaborationScore = await this.calculateCollaborationScore(agentId)
    
    return {
      agentId,
      skills: skillProfile.skills || [],
      performance: performanceStats,
      preferences: {
        taskTypes: [], // 可从历史任务推断
        maxConcurrentTasks: agent.maxWorkload
      },
      currentLoad: {
        activeTasks: agent.assignedTasks.filter(t => t.status === 'in_progress').length,
        pendingTasks: agent.assignedTasks.filter(t => t.status === 'assigned').length,
        utilizationRate: agent.workload / agent.maxWorkload
      },
      collaborationScore
    }
  }
  
  /**
   * 更新Agent技能画像
   */
  async updateAgentSkills(agentId: string, skills: SkillTag[]): Promise<void> {
    const agent = await this.prisma.agent.findUnique({
      where: { id: agentId }
    })
    
    if (!agent) {
      throw new Error('Agent not found')
    }
    
    const currentProfile = agent.skillProfile ? JSON.parse(agent.skillProfile) : { skills: [] }
    currentProfile.skills = skills
    
    await this.prisma.agent.update({
      where: { id: agentId },
      data: {
        skillProfile: JSON.stringify(currentProfile)
      }
    })
  }
  
  /**
   * 计算Agent绩效统计
   */
  private async calculatePerformanceStats(agentId: string) {
    const completedTasks = await this.prisma.task.findMany({
      where: {
        assigneeId: agentId,
        status: 'completed',
        completedAt: { not: null }
      },
      orderBy: { completedAt: 'desc' },
      take: 50
    })
    
    if (completedTasks.length === 0) {
      return {
        completedTasks: 0,
        onTimeRate: 0,
        avgQuality: 0,
        avgResponseTime: 0
      }
    }
    
    const onTimeCount = completedTasks.filter(t => {
      if (!t.dueDate || !t.completedAt) return false
      return new Date(t.completedAt) <= new Date(t.dueDate)
    }).length
    
    // 从匹配历史获取质量评分
    const matchHistory = await this.prisma.taskMatchHistory.findMany({
      where: {
        agentId,
        wasAssigned: true,
        qualityRating: { not: null }
      },
      take: 20
    })
    
    const avgQuality = matchHistory.length > 0
      ? matchHistory.reduce((sum, h) => sum + (h.qualityRating || 0), 0) / matchHistory.length
      : 3 // 默认中等质量
    
    // 计算平均响应时间 (任务分配到开始的时间)
    const responseTimes = completedTasks
      .filter(t => t.startedAt)
      .map(t => {
        const created = new Date(t.createdAt).getTime()
        const started = new Date(t.startedAt!).getTime()
        return (started - created) / (1000 * 60 * 60) // 小时
      })
    
    const avgResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0
    
    return {
      completedTasks: completedTasks.length,
      onTimeRate: onTimeCount / completedTasks.length,
      avgQuality,
      avgResponseTime
    }
  }
  
  /**
   * 计算协作分数
   */
  private async calculateCollaborationScore(agentId: string): Promise<number> {
    const collaborations = await this.prisma.taskCollaborator.findMany({
      where: { agentId }
    })
    
    if (collaborations.length === 0) return 50 // 默认中等分数
    
    const asLeader = collaborations.filter(c => c.role === 'leader').length
    const activeParticipation = collaborations.filter(c => c.status === 'active').length
    
    // 基础分数 + 领导经验加成 + 活跃度加成
    let score = 50
    score += (asLeader / collaborations.length) * 20
    score += (activeParticipation / collaborations.length) * 30
    
    return Math.min(100, Math.max(0, score))
  }
  
  // ============================================
  // 任务匹配算法
  // ============================================
  
  /**
   * 查找最佳任务执行者
   */
  async findBestAgents(
    task: Task,
    options: MatchOptions = {},
    organizationId?: string
  ): Promise<MatchResult[]> {
    const {
      topK = 5,
      minOverallScore = 0.3,
      considerWorkload = true,
      considerHistory = true,
      strategy = 'best_fit'
    } = options
    
    // 获取任务需求
    const requirements = this.extractTaskRequirements(task)
    
    // 获取组织内所有可用Agent
    // 如果提供了organizationId则使用，否则需要查询获取
    let orgId = organizationId
    if (!orgId) {
      // 通过creator获取organizationId
      const creator = await this.prisma.agent.findUnique({
        where: { id: task.creatorId || '' },
        select: { organizationId: true }
      })
      orgId = creator?.organizationId || ''
    }
    
    const agents = await this.getAvailableAgents(orgId)
    
    // 计算每个Agent的匹配分数
    const matches: MatchResult[] = []
    
    for (const agent of agents) {
      const profile = await this.buildCapabilityProfile(agent.id)
      const result = this.calculateMatchScore(agent, profile, requirements, {
        considerWorkload,
        considerHistory
      })
      
      if (result.scores.overall >= minOverallScore) {
        matches.push(result)
      }
    }
    
    // 应用策略排序
    const sortedMatches = this.applyStrategy(matches, strategy)
    
    // 记录匹配历史
    await this.recordMatchHistory(task.id, sortedMatches.slice(0, topK))
    
    return sortedMatches.slice(0, topK)
  }
  
  /**
   * 提取任务需求
   */
  private extractTaskRequirements(task: Task): TaskRequirement {
    const requiredSkills = task.requiredSkills
      ? JSON.parse(task.requiredSkills)
      : []
    
    return {
      requiredSkills,
      estimatedHours: task.estimatedHours || 4,
      priority: task.priority as any,
      deadline: task.dueDate || undefined,
      collaborationNeeded: task.collaborationMode === 'collaborative'
    }
  }
  
  /**
   * 获取可用Agent
   */
  private async getAvailableAgents(organizationId: string): Promise<Agent[]> {
    return this.prisma.agent.findMany({
      where: {
        organizationId,
        status: { not: 'offline' },
        availabilityScore: { gt: 0 }
      }
    })
  }
  
  /**
   * 计算匹配分数
   */
  private calculateMatchScore(
    agent: Agent,
    profile: AgentCapabilityProfile,
    requirements: TaskRequirement,
    options: { considerWorkload: boolean; considerHistory: boolean }
  ): MatchResult {
    // 技能匹配分数
    const skillMatch = this.calculateSkillMatch(profile.skills, requirements.requiredSkills)
    
    // 可用性分数
    const availability = agent.availabilityScore || 0
    
    // 负载分数 (负载越低分数越高)
    const workload = options.considerWorkload
      ? this.calculateWorkloadScore(profile.currentLoad)
      : 1
    
    // 历史表现分数
    const history = options.considerHistory
      ? this.calculateHistoryScore(profile.performance)
      : 0.5
    
    // 计算加权总分
    const weights = {
      skillMatch: 0.4,
      availability: 0.2,
      workload: 0.2,
      history: 0.2
    }
    
    const overall = 
      skillMatch.score * weights.skillMatch +
      availability * weights.availability +
      workload * weights.workload +
      history * weights.history
    
    // 确定推荐等级
    let recommendation: MatchResult['recommendation']
    if (overall >= 0.85) recommendation = 'highly_recommended'
    else if (overall >= 0.7) recommendation = 'recommended'
    else if (overall >= 0.5) recommendation = 'acceptable'
    else recommendation = 'not_recommended'
    
    return {
      agentId: agent.id,
      agentName: agent.name,
      scores: {
        skillMatch: skillMatch.score,
        availability,
        workload,
        history,
        overall
      },
      details: {
        matchedSkills: skillMatch.details,
        currentWorkload: profile.currentLoad.activeTasks + profile.currentLoad.pendingTasks,
        maxWorkload: profile.preferences.maxConcurrentTasks,
        recentPerformance: profile.performance.avgQuality,
        reasons: this.generateMatchReasons(skillMatch, availability, workload, history)
      },
      recommendation
    }
  }
  
  /**
   * 计算技能匹配分数
   */
  private calculateSkillMatch(
    agentSkills: SkillTag[],
    requiredSkills: TaskRequirement['requiredSkills']
  ): { score: number; details: MatchResult['details']['matchedSkills'] } {
    if (requiredSkills.length === 0) {
      return { score: 1, details: [] }
    }
    
    const levelMap: Record<string, number> = {
      beginner: 1,
      intermediate: 2,
      advanced: 3,
      expert: 4
    }
    
    let totalWeight = 0
    let weightedScore = 0
    const details: MatchResult['details']['matchedSkills'] = []
    
    for (const req of requiredSkills) {
      totalWeight += req.weight
      
      const agentSkill = agentSkills.find(s => 
        s.name.toLowerCase() === req.skill.toLowerCase()
      )
      
      if (agentSkill) {
        const agentLevel = levelMap[agentSkill.level] || 0
        const requiredLevel = levelMap[req.level] || 1
        
        // 技能等级匹配度
        const levelMatch = agentLevel >= requiredLevel ? 1 : agentLevel / requiredLevel
        
        // 验证加成
        const verifiedBonus = agentSkill.verified ? 0.1 : 0
        
        const match = Math.min(1, levelMatch + verifiedBonus)
        weightedScore += match * req.weight
        
        details.push({
          skill: req.skill,
          agentLevel: agentSkill.level,
          requiredLevel: req.level,
          match
        })
      } else {
        // 无此技能
        details.push({
          skill: req.skill,
          agentLevel: 'none',
          requiredLevel: req.level,
          match: 0
        })
      }
    }
    
    const score = totalWeight > 0 ? weightedScore / totalWeight : 0
    return { score, details }
  }
  
  /**
   * 计算负载分数
   */
  private calculateWorkloadScore(load: AgentCapabilityProfile['currentLoad']): number {
    const utilization = load.utilizationRate
    
    if (utilization >= this.loadBalanceConfig.overloadThreshold) {
      return 0 // 过载
    }
    
    if (utilization >= this.loadBalanceConfig.maxUtilization) {
      return 0.3 // 接近满载
    }
    
    // 负载越低分数越高
    return 1 - utilization
  }
  
  /**
   * 计算历史表现分数
   */
  private calculateHistoryScore(performance: AgentCapabilityProfile['performance']): number {
    if (performance.completedTasks === 0) {
      return 0.5 // 中性分数
    }
    
    // 综合按时率、质量、响应速度
    const onTimeScore = performance.onTimeRate
    const qualityScore = performance.avgQuality / 5 // 假设质量评分1-5
    const responseScore = Math.max(0, 1 - performance.avgResponseTime / 48) // 48小时内响应为满分
    
    return (onTimeScore * 0.4 + qualityScore * 0.4 + responseScore * 0.2)
  }
  
  /**
   * 生成匹配理由
   */
  private generateMatchReasons(
    skillMatch: { score: number; details: any[] },
    availability: number,
    workload: number,
    history: number
  ): string[] {
    const reasons: string[] = []
    
    if (skillMatch.score >= 0.8) {
      reasons.push('技能匹配度极高')
    } else if (skillMatch.score >= 0.6) {
      reasons.push('具备所需核心技能')
    }
    
    if (availability >= 0.8) {
      reasons.push('当前可用性高')
    }
    
    if (workload >= 0.8) {
      reasons.push('当前负载较低')
    } else if (workload < 0.5) {
      reasons.push('当前负载较高')
    }
    
    if (history >= 0.8) {
      reasons.push('历史表现优秀')
    } else if (history >= 0.6) {
      reasons.push('历史表现良好')
    }
    
    return reasons
  }
  
  /**
   * 应用匹配策略
   */
  private applyStrategy(matches: MatchResult[], strategy: string): MatchResult[] {
    switch (strategy) {
      case 'best_fit':
        // 按综合分数排序
        return matches.sort((a, b) => b.scores.overall - a.scores.overall)
        
      case 'load_balanced':
        // 考虑负载均衡，优先选择负载较低的
        return matches.sort((a, b) => {
          const scoreDiff = b.scores.overall - a.scores.overall
          if (Math.abs(scoreDiff) > 0.1) return scoreDiff
          return b.scores.workload - a.scores.workload
        })
        
      case 'skill_diverse':
        // 技能多样性策略 - 目前简化实现
        return matches.sort((a, b) => b.scores.skillMatch - a.scores.skillMatch)
        
      case 'round_robin':
        // 轮询策略 - 按最近分配时间排序
        return matches.sort((a, b) => {
          // 简化实现，实际应该查询最近分配时间
          return a.scores.overall - b.scores.overall
        })
        
      default:
        return matches.sort((a, b) => b.scores.overall - a.scores.overall)
    }
  }
  
  /**
   * 记录匹配历史
   */
  private async recordMatchHistory(taskId: string, matches: MatchResult[]): Promise<void> {
    await Promise.all(
      matches.map(match =>
        this.prisma.taskMatchHistory.create({
          data: {
            taskId,
            agentId: match.agentId,
            skillMatchScore: match.scores.skillMatch,
            availabilityScore: match.scores.availability,
            workloadScore: match.scores.workload,
            historyScore: match.scores.history,
            overallScore: match.scores.overall,
            wasAssigned: false
          }
        })
      )
    )
  }
  
  // ============================================
  // 负载均衡
  // ============================================
  
  /**
   * 执行负载均衡
   */
  async performLoadBalancing(organizationId: string): Promise<{
    redistributed: number
    details: Array<{ taskId: string; fromAgentId: string; toAgentId: string; reason: string }>
  }> {
    const details: Array<{ taskId: string; fromAgentId: string; toAgentId: string; reason: string }> = []
    
    if (!this.loadBalanceConfig.redistributionEnabled) {
      return { redistributed: 0, details }
    }
    
    // 获取过载的Agent
    const overloadedAgents = await this.prisma.agent.findMany({
      where: {
        organizationId,
        workload: {
          gte: Math.floor(this.loadBalanceConfig.overloadThreshold * 10)
        }
      },
      include: {
        assignedTasks: {
          where: {
            status: { in: ['assigned', 'in_progress'] }
          }
        }
      }
    })
    
    for (const agent of overloadedAgents) {
      const utilization = agent.workload / agent.maxWorkload
      
      if (utilization > this.loadBalanceConfig.overloadThreshold) {
        // 找到可以转移的任务
        const transferableTasks = agent.assignedTasks.filter(t => 
          t.status === 'assigned' && t.priority !== 'urgent'
        )
        
        for (const task of transferableTasks.slice(0, 2)) { // 每次最多转移2个任务
          // 寻找更好的执行者
          const matches = await this.findBestAgents(task, {
            topK: 3,
            considerWorkload: true,
            strategy: 'load_balanced'
          })
          
          // 排除当前Agent，选择负载较低的
          const betterMatch = matches.find(m => 
            m.agentId !== agent.id && m.scores.workload > 0.5
          )
          
          if (betterMatch) {
            // 执行转派
            await this.prisma.task.update({
              where: { id: task.id },
              data: {
                assigneeId: betterMatch.agentId,
                transferHistory: JSON.stringify([
                  ...(task.transferHistory ? JSON.parse(task.transferHistory) : []),
                  {
                    from: agent.id,
                    to: betterMatch.agentId,
                    reason: '负载均衡自动调整',
                    timestamp: new Date().toISOString()
                  }
                ])
              }
            })
            
            // 更新Agent负载
            await this.prisma.agent.update({
              where: { id: agent.id },
              data: { workload: { decrement: 1 } }
            })
            
            await this.prisma.agent.update({
              where: { id: betterMatch.agentId },
              data: { workload: { increment: 1 } }
            })
            
            details.push({
              taskId: task.id,
              fromAgentId: agent.id,
              toAgentId: betterMatch.agentId,
              reason: '负载均衡'
            })
          }
        }
      }
    }
    
    return {
      redistributed: details.length,
      details
    }
  }
  
  /**
   * 获取组织负载分布
   */
  async getLoadDistribution(organizationId: string): Promise<{
    agents: Array<{
      agentId: string
      agentName: string
      workload: number
      maxWorkload: number
      utilizationRate: number
      status: 'optimal' | 'normal' | 'high' | 'overloaded'
    }>
    summary: {
      totalAgents: number
      overloadedCount: number
      avgUtilization: number
    }
  }> {
    const agents = await this.prisma.agent.findMany({
      where: { organizationId }
    })
    
    const distribution = agents.map(agent => {
      const utilization = agent.workload / agent.maxWorkload
      let status: 'optimal' | 'normal' | 'high' | 'overloaded'
      
      if (utilization < 0.5) status = 'optimal'
      else if (utilization < 0.7) status = 'normal'
      else if (utilization < 0.9) status = 'high'
      else status = 'overloaded'
      
      return {
        agentId: agent.id,
        agentName: agent.name,
        workload: agent.workload,
        maxWorkload: agent.maxWorkload,
        utilizationRate: utilization,
        status
      }
    })
    
    const overloadedCount = distribution.filter(a => a.status === 'overloaded').length
    const avgUtilization = distribution.reduce((sum, a) => sum + a.utilizationRate, 0) / distribution.length
    
    return {
      agents: distribution,
      summary: {
        totalAgents: agents.length,
        overloadedCount,
        avgUtilization
      }
    }
  }
  
  // ============================================
  // 智能推荐
  // ============================================
  
  /**
   * 推荐相似任务
   */
  async recommendSimilarTasks(agentId: string, limit: number = 5): Promise<Task[]> {
    const profile = await this.buildCapabilityProfile(agentId)
    
    // 获取Agent技能标签
    const skillNames = profile.skills.map(s => s.name)
    
    // 查找匹配这些技能的任务
    const pendingTasks = await this.prisma.task.findMany({
      where: {
        status: 'pending',
        assigneeId: null
      },
      take: 50,
      orderBy: { createdAt: 'desc' }
    })
    
    // 过滤并排序
    const scoredTasks = pendingTasks.map(task => {
      const requirements = this.extractTaskRequirements(task)
      const skillMatch = this.calculateSkillMatch(profile.skills, requirements.requiredSkills)
      return { task, score: skillMatch.score }
    })
    
    return scoredTasks
      .filter(st => st.score > 0.3)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(st => st.task)
  }
}