import { PrismaClient, WorkflowTrigger, WorkflowExecution, NLCommandLog } from '@prisma/client'
import { llmService } from './llmService.js'

// 解析的意图
export interface ParsedIntent {
  intent: string
  confidence: number
  entities: Record<string, any>
  action: string
  parameters: Record<string, any>
}

// 工作流动作类型
export type WorkflowActionType = 
  | 'create_task'
  | 'update_agent'
  | 'send_notification'
  | 'create_meeting'
  | 'update_task'
  | 'assign_task'
  | 'trigger_workflow'
  | 'query_knowledge'

// 工作流触发器配置
export interface TriggerConfig {
  type: 'nl_command' | 'schedule' | 'event' | 'webhook'
  condition: {
    keywords?: string[]
    intent?: string
    entities?: Record<string, string>
    cron?: string // 定时触发
    eventType?: string
    webhookUrl?: string
  }
}

// 工作流动作配置
export interface ActionConfig {
  type: WorkflowActionType
  parameters: Record<string, any>
  retryPolicy?: {
    maxRetries: number
    retryDelay: number
  }
}

// 命令执行结果
export interface CommandExecutionResult {
  success: boolean
  intent: string
  action: string
  data?: any
  error?: string
  executedAt: Date
}

/**
 * 自然语言指令服务 - Agent自治管理
 */
export class NLCommandService {
  private prisma: PrismaClient
  
  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }
  
  // ============================================
  // 自然语言解析
  // ============================================
  
  /**
   * 解析自然语言指令
   */
  async parseCommand(command: string, context?: {
    agentId?: string
    organizationId?: string
  }): Promise<ParsedIntent> {
    // 记录命令
    const log = await this.prisma.nLCommandLog.create({
      data: {
        rawCommand: command,
        parsedIntent: '',
        agentId: context?.agentId
      }
    })
    
    // 使用LLM解析意图
    const prompt = this.buildParsingPrompt(command, context)
    
    const completion = await llmService.completeStructured<{
      intent: string
      confidence: number
      entities: Record<string, any>
      action: string
      parameters: Record<string, any>
    }>(
      [
        { role: 'system', content: '你是一个自然语言指令解析专家。将用户的指令解析为结构化的意图和参数。' },
        { role: 'user', content: prompt }
      ],
      {
        type: 'object',
        properties: {
          intent: { type: 'string' },
          confidence: { type: 'number', minimum: 0, maximum: 1 },
          entities: { type: 'object' },
          action: { type: 'string' },
          parameters: { type: 'object' }
        },
        required: ['intent', 'confidence', 'action', 'parameters']
      }
    )
    
    const parsed = completion.content
    
    // 更新日志
    await this.prisma.nLCommandLog.update({
      where: { id: log.id },
      data: {
        parsedIntent: parsed.intent,
        parsedParams: JSON.stringify({
          action: parsed.action,
          parameters: parsed.parameters,
          entities: parsed.entities,
          confidence: parsed.confidence
        }),
        processedAt: new Date()
      }
    })
    
    return parsed
  }
  
  /**
   * 构建解析提示
   */
  private buildParsingPrompt(command: string, context?: { agentId?: string; organizationId?: string }): string {
    const parts: string[] = [
      `解析以下自然语言指令：`,
      ``,
      `指令: "${command}"`,
      ``
    ]
    
    if (context?.agentId) {
      parts.push(`执行Agent ID: ${context.agentId}`)
    }
    
    if (context?.organizationId) {
      parts.push(`组织ID: ${context.organizationId}`)
    }
    
    parts.push(
      ``,
      `请解析出：`,
      `1. intent: 用户的主要意图`,
      `2. confidence: 解析置信度(0-1)`,
      `3. entities: 提取的实体(如agent名称、任务标题、时间等)`,
      `4. action: 对应的系统动作类型`,
      `5. parameters: 动作所需的参数`,
      ``,
      `支持的动作类型：`,
      `- create_task: 创建任务 (参数: title, description, assignee?, priority?, dueDate?)`,
      `- update_task: 更新任务 (参数: taskId, status?, assignee?, priority?)`,
      `- assign_task: 分配任务 (参数: taskId, agentId)`,
      `- create_meeting: 创建会议 (参数: title, participants, scheduledAt, duration?)`,
      `- update_agent: 更新Agent配置 (参数: agentId, status?, skills?)`,
      `- send_notification: 发送通知 (参数: target, message, type?)`,
      `- query_knowledge: 查询知识库 (参数: query, knowledgeBaseId?)`,
      `- trigger_workflow: 触发工作流 (参数: workflowId, parameters?)`,
      ``,
      `请以JSON格式输出。`
    )
    
    return parts.join('\n')
  }
  
  /**
   * 执行解析后的命令
   */
  async executeCommand(parsed: ParsedIntent, context?: {
    agentId?: string
    organizationId?: string
  }): Promise<CommandExecutionResult> {
    const result: CommandExecutionResult = {
      success: false,
      intent: parsed.intent,
      action: parsed.action,
      executedAt: new Date()
    }
    
    try {
      switch (parsed.action) {
        case 'create_task':
          result.data = await this.executeCreateTask(parsed.parameters, context)
          break
          
        case 'update_task':
          result.data = await this.executeUpdateTask(parsed.parameters)
          break
          
        case 'assign_task':
          result.data = await this.executeAssignTask(parsed.parameters)
          break
          
        case 'create_meeting':
          result.data = await this.executeCreateMeeting(parsed.parameters, context)
          break
          
        case 'update_agent':
          result.data = await this.executeUpdateAgent(parsed.parameters)
          break
          
        case 'send_notification':
          result.data = await this.executeSendNotification(parsed.parameters, context)
          break
          
        case 'query_knowledge':
          result.data = await this.executeQueryKnowledge(parsed.parameters, context)
          break
          
        default:
          result.error = `Unknown action: ${parsed.action}`
          return result
      }
      
      result.success = true
      
    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Execution failed'
    }
    
    // 更新执行状态
    await this.prisma.nLCommandLog.updateMany({
      where: {
        rawCommand: parsed.intent, // 简化查询
        executed: false
      },
      data: {
        executed: true,
        success: result.success,
        result: result.success ? JSON.stringify(result.data) : null,
        error: result.error
      }
    })
    
    return result
  }
  
  /**
   * 执行创建任务
   */
  private async executeCreateTask(params: any, context?: { organizationId?: string; creatorId?: string }) {
    const task = await this.prisma.task.create({
      data: {
        title: params.title,
        description: params.description,
        status: 'pending',
        priority: params.priority || 'medium',
        dueDate: params.dueDate ? new Date(params.dueDate) : null,
        creatorId: context?.creatorId,
        collaborationMode: params.collaborationMode || 'single',
        requiredSkills: params.requiredSkills ? JSON.stringify(params.requiredSkills) : null
      }
    })
    
    // 如果指定了执行者，进行分配
    if (params.assignee) {
      await this.prisma.task.update({
        where: { id: task.id },
        data: {
          assigneeId: params.assignee,
          status: 'assigned'
        }
      })
    }
    
    return task
  }
  
  /**
   * 执行更新任务
   */
  private async executeUpdateTask(params: any) {
    const updateData: any = {}
    
    if (params.status) updateData.status = params.status
    if (params.priority) updateData.priority = params.priority
    if (params.assignee) updateData.assigneeId = params.assignee
    
    return this.prisma.task.update({
      where: { id: params.taskId },
      data: updateData
    })
  }
  
  /**
   * 执行分配任务
   */
  private async executeAssignTask(params: any) {
    return this.prisma.task.update({
      where: { id: params.taskId },
      data: {
        assigneeId: params.agentId,
        status: 'assigned'
      }
    })
  }
  
  /**
   * 执行创建会议
   */
  private async executeCreateMeeting(params: any, context?: { organizationId?: string }) {
    return this.prisma.meeting.create({
      data: {
        title: params.title,
        description: params.description,
        scheduledAt: new Date(params.scheduledAt),
        duration: params.duration || 60,
        organizationId: context?.organizationId || '',
        hostId: params.hostId || '',
        status: 'scheduled'
      }
    })
  }
  
  /**
   * 执行更新Agent
   */
  private async executeUpdateAgent(params: any) {
    const updateData: any = {}
    
    if (params.status) updateData.status = params.status
    if (params.skills) updateData.skillProfile = JSON.stringify({ skills: params.skills })
    if (params.availabilityScore !== undefined) updateData.availabilityScore = params.availabilityScore
    
    return this.prisma.agent.update({
      where: { id: params.agentId },
      data: updateData
    })
  }
  
  /**
   * 执行发送通知
   */
  private async executeSendNotification(params: any, context?: { organizationId?: string }) {
    // 这里可以实现通知逻辑
    // 简化实现：返回通知信息
    return {
      target: params.target,
      message: params.message,
      type: params.type || 'info',
      sentAt: new Date(),
      organizationId: context?.organizationId
    }
  }
  
  /**
   * 执行知识库查询
   */
  private async executeQueryKnowledge(params: any, context?: { organizationId?: string }) {
    // 这里需要调用知识库服务
    // 简化实现
    return {
      query: params.query,
      knowledgeBaseId: params.knowledgeBaseId,
      results: [],
      message: 'Knowledge base query executed'
    }
  }
  
  /**
   * 获取命令历史
   */
  async getCommandHistory(agentId?: string, limit: number = 50): Promise<NLCommandLog[]> {
    return this.prisma.nLCommandLog.findMany({
      where: agentId ? { agentId } : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit
    })
  }
}

/**
 * 工作流服务 - Agent自治管理工作流
 */
export class WorkflowService {
  private prisma: PrismaClient
  private nlCommandService: NLCommandService
  
  constructor(prisma: PrismaClient, nlCommandService: NLCommandService) {
    this.prisma = prisma
    this.nlCommandService = nlCommandService
  }
  
  // ============================================
  // 工作流触发器管理
  // ============================================
  
  /**
   * 创建工作流触发器
   */
  async createTrigger(data: {
    name: string
    description?: string
    triggerType: 'nl_command' | 'schedule' | 'event' | 'webhook'
    condition: TriggerConfig['condition']
    actionType: WorkflowActionType
    actionConfig: ActionConfig['parameters']
    createdBy: string
  }): Promise<WorkflowTrigger> {
    return this.prisma.workflowTrigger.create({
      data: {
        name: data.name,
        description: data.description,
        triggerType: data.triggerType,
        condition: JSON.stringify(data.condition),
        actionType: data.actionType,
        actionConfig: JSON.stringify(data.actionConfig),
        createdBy: data.createdBy,
        isActive: true
      }
    })
  }
  
  /**
   * 获取触发器列表
   */
  async listTriggers(isActive?: boolean): Promise<WorkflowTrigger[]> {
    return this.prisma.workflowTrigger.findMany({
      where: isActive !== undefined ? { isActive } : undefined,
      orderBy: { createdAt: 'desc' }
    })
  }
  
  /**
   * 更新触发器状态
   */
  async updateTriggerStatus(triggerId: string, isActive: boolean): Promise<WorkflowTrigger> {
    return this.prisma.workflowTrigger.update({
      where: { id: triggerId },
      data: { isActive }
    })
  }
  
  /**
   * 删除触发器
   */
  async deleteTrigger(triggerId: string): Promise<void> {
    await this.prisma.workflowTrigger.delete({
      where: { id: triggerId }
    })
  }
  
  // ============================================
  // 工作流执行
  // ============================================
  
  /**
   * 执行工作流
   */
  async executeWorkflow(
    triggerId: string,
    input?: Record<string, any>
  ): Promise<WorkflowExecution> {
    const trigger = await this.prisma.workflowTrigger.findUnique({
      where: { id: triggerId }
    })
    
    if (!trigger) {
      throw new Error('Workflow trigger not found')
    }
    
    if (!trigger.isActive) {
      throw new Error('Workflow trigger is not active')
    }
    
    // 创建执行记录
    const execution = await this.prisma.workflowExecution.create({
      data: {
        triggerId,
        status: 'running',
        input: input ? JSON.stringify(input) : null
      }
    })
    
    try {
      // 执行动作
      const actionConfig = JSON.parse(trigger.actionConfig)
      const result = await this.executeAction(
        trigger.actionType as WorkflowActionType,
        { ...actionConfig, ...input }
      )
      
      // 更新执行状态
      await this.prisma.workflowExecution.update({
        where: { id: execution.id },
        data: {
          status: 'completed',
          output: JSON.stringify(result),
          completedAt: new Date()
        }
      })
      
      return {
        ...execution,
        status: 'completed',
        output: JSON.stringify(result),
        completedAt: new Date()
      }
      
    } catch (error) {
      // 记录失败
      await this.prisma.workflowExecution.update({
        where: { id: execution.id },
        data: {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Execution failed',
          completedAt: new Date()
        }
      })
      
      throw error
    }
  }
  
  /**
   * 执行单个动作
   */
  private async executeAction(
    actionType: WorkflowActionType,
    parameters: Record<string, any>
  ): Promise<any> {
    switch (actionType) {
      case 'create_task':
        return this.prisma.task.create({
          data: {
            title: parameters.title,
            description: parameters.description,
            priority: parameters.priority || 'medium',
            status: 'pending',
            creatorId: parameters.creatorId
          }
        })
        
      case 'update_agent':
        return this.prisma.agent.update({
          where: { id: parameters.agentId },
          data: {
            status: parameters.status,
            workload: parameters.workload
          }
        })
        
      case 'send_notification':
        // 通知实现
        return { type: 'notification', ...parameters, sentAt: new Date() }
        
      case 'create_meeting':
        return this.prisma.meeting.create({
          data: {
            title: parameters.title,
            scheduledAt: new Date(parameters.scheduledAt),
            duration: parameters.duration || 60,
            organizationId: parameters.organizationId,
            hostId: parameters.hostId,
            status: 'scheduled'
          }
        })
        
      case 'trigger_workflow':
        // 触发其他工作流
        return this.executeWorkflow(parameters.workflowId, parameters.parameters)
        
      default:
        throw new Error(`Unsupported action type: ${actionType}`)
    }
  }
  
  /**
   * 根据自然语言触发工作流
   */
  async triggerFromNL(command: string, context?: {
    agentId?: string
    organizationId?: string
  }): Promise<{
    triggered: boolean
    triggerId?: string
    executionId?: string
    result?: any
  }> {
    // 解析命令
    const parsed = await this.nlCommandService.parseCommand(command, context)
    
    // 查找匹配的触发器
    const triggers = await this.prisma.workflowTrigger.findMany({
      where: {
        isActive: true,
        triggerType: 'nl_command'
      }
    })
    
    for (const trigger of triggers) {
      const condition = JSON.parse(trigger.condition)
      
      // 检查意图匹配
      if (condition.intent && condition.intent === parsed.intent) {
        // 执行工作流
        const execution = await this.executeWorkflow(trigger.id, {
          ...parsed.parameters,
          ...context
        })
        
        return {
          triggered: true,
          triggerId: trigger.id,
          executionId: execution.id,
          result: execution.output ? JSON.parse(execution.output) : null
        }
      }
      
      // 检查关键词匹配
      if (condition.keywords) {
        const hasKeyword = condition.keywords.some((kw: string) =>
          command.toLowerCase().includes(kw.toLowerCase())
        )
        
        if (hasKeyword) {
          const execution = await this.executeWorkflow(trigger.id, {
            parsedCommand: parsed,
            ...context
          })
          
          return {
            triggered: true,
            triggerId: trigger.id,
            executionId: execution.id,
            result: execution.output ? JSON.parse(execution.output) : null
          }
        }
      }
    }
    
    // 没有匹配的触发器，直接执行命令
    const result = await this.nlCommandService.executeCommand(parsed, context)
    
    return {
      triggered: false,
      result
    }
  }
  
  /**
   * 获取执行历史
   */
  async getExecutionHistory(triggerId?: string, limit: number = 50): Promise<WorkflowExecution[]> {
    return this.prisma.workflowExecution.findMany({
      where: triggerId ? { triggerId } : undefined,
      orderBy: { startedAt: 'desc' },
      take: limit
    })
  }
}

/**
 * Agent版本管理服务
 */
export class AgentVersionService {
  private prisma: PrismaClient
  
  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }
  
  /**
   * 创建Agent版本快照
   */
  async createVersion(agentId: string, data: {
    name: string
    description?: string
    createdBy: string
  }): Promise<any> {
    const agent = await this.prisma.agent.findUnique({
      where: { id: agentId }
    })
    
    if (!agent) {
      throw new Error('Agent not found')
    }
    
    // 获取当前最新版本号
    const latestVersion = await this.prisma.agentVersion.findFirst({
      where: { agentId },
      orderBy: { version: 'desc' }
    })
    
    const newVersion = (latestVersion?.version || 0) + 1
    
    // 创建版本快照
    const version = await this.prisma.agentVersion.create({
      data: {
        agentId,
        version: newVersion,
        name: data.name,
        description: data.description,
        createdBy: data.createdBy,
        config: JSON.stringify({
          name: agent.name,
          config: agent.config,
          capabilities: agent.capabilities,
          rolePlayConfig: agent.rolePlayConfig,
          skillProfile: agent.skillProfile,
          maxWorkload: agent.maxWorkload
        }),
        isActive: false
      }
    })
    
    return version
  }
  
  /**
   * 获取Agent版本列表
   */
  async listVersions(agentId: string): Promise<any[]> {
    return this.prisma.agentVersion.findMany({
      where: { agentId },
      orderBy: { version: 'desc' }
    })
  }
  
  /**
   * 回滚到指定版本
   */
  async rollbackToVersion(agentId: string, versionId: string): Promise<any> {
    const version = await this.prisma.agentVersion.findFirst({
      where: { id: versionId, agentId }
    })
    
    if (!version) {
      throw new Error('Version not found')
    }
    
    const config = JSON.parse(version.config)
    
    // 回滚配置
    const updated = await this.prisma.agent.update({
      where: { id: agentId },
      data: {
        name: config.name,
        config: config.config,
        capabilities: config.capabilities,
        rolePlayConfig: config.rolePlayConfig,
        skillProfile: config.skillProfile,
        maxWorkload: config.maxWorkload
      }
    })
    
    // 更新版本状态
    await this.prisma.agentVersion.updateMany({
      where: { agentId },
      data: { isActive: false }
    })
    
    await this.prisma.agentVersion.update({
      where: { id: versionId },
      data: { isActive: true }
    })
    
    return updated
  }
  
  /**
   * 比较版本差异
   */
  async compareVersions(versionId1: string, versionId2: string): Promise<any> {
    const [v1, v2] = await Promise.all([
      this.prisma.agentVersion.findUnique({ where: { id: versionId1 } }),
      this.prisma.agentVersion.findUnique({ where: { id: versionId2 } })
    ])
    
    if (!v1 || !v2) {
      throw new Error('Version not found')
    }
    
    const config1 = JSON.parse(v1.config)
    const config2 = JSON.parse(v2.config)
    
    return {
      version1: { id: v1.id, version: v1.version, name: v1.name },
      version2: { id: v2.id, version: v2.version, name: v2.name },
      differences: this.computeConfigDiff(config1, config2)
    }
  }
  
  /**
   * 计算配置差异
   */
  private computeConfigDiff(config1: any, config2: any): any {
    const diff: any = {}
    const keys = new Set([...Object.keys(config1), ...Object.keys(config2)])
    
    for (const key of keys) {
      if (JSON.stringify(config1[key]) !== JSON.stringify(config2[key])) {
        diff[key] = {
          before: config1[key],
          after: config2[key]
        }
      }
    }
    
    return diff
  }
}