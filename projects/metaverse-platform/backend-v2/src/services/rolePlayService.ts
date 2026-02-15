import { PrismaClient, RolePlayTemplate } from '@prisma/client'
import { llmService, LLMMessage } from './llmService.js'

// 发言风格配置
export interface SpeakingStyle {
  formality: 'casual' | 'neutral' | 'formal' | 'very_formal'
  verbosity: 'concise' | 'moderate' | 'detailed' | 'verbose'
  tone: 'friendly' | 'professional' | 'authoritative' | 'collaborative' | 'critical'
  directness: 'indirect' | 'neutral' | 'direct' | 'blunt'
}

// 性格特征
export interface Personality {
  traits: string[] // ['analytical', 'creative', 'cautious', 'decisive']
  communication: string[] // ['listener', 'speaker', 'consensus_builder']
  decisionStyle: 'data_driven' | 'intuitive' | 'collaborative' | 'authoritative'
  conflictApproach: 'avoidant' | 'accommodating' | 'compromising' | 'collaborative' | 'competing'
}

// 专业领域
export interface Expertise {
  domains: Array<{
    name: string
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
    yearsOfExperience?: number
  }>
  specializations: string[]
  certifications?: string[]
}

// Agent角色配置
export interface AgentRoleConfig {
  personality: Personality
  expertise: Expertise
  speakingStyle: SpeakingStyle
  behaviorRules?: string[]
  customPrompt?: string
}

// 会议发言上下文
export interface MeetingContext {
  meetingId: string
  title: string
  type: string
  agenda: Array<{
    id: string
    title: string
    status: string
    ownerId?: string
  }>
  participants: Array<{
    agentId: string
    name: string
    role: string
  }>
  currentTopic?: string
  previousMessages: Array<{
    agentId: string
    agentName: string
    content: string
    timestamp: Date
  }>
}

// 发言生成结果
export interface GeneratedSpeech {
  content: string
  suggestedDuration: number // 建议发言时长(秒)
  confidence: number // 置信度 0-1
  intent: string // 发言意图: opinion, question, suggestion, clarification, agreement, disagreement
}

// 角色能力评估
export interface RoleCapabilityAssessment {
  overallScore: number
  dimensions: {
    communication: number
    expertise: number
    collaboration: number
    leadership: number
    decisionMaking: number
  }
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
}

/**
 * 角色扮演服务 - LLM驱动的Agent角色模拟
 */
export class RolePlayService {
  private prisma: PrismaClient
  
  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }
  
  // ============================================
  // 角色模板管理
  // ============================================
  
  /**
   * 创建角色模板
   */
  async createTemplate(data: {
    name: string
    description?: string
    category: 'meeting' | 'task' | 'general'
    personality: Personality
    expertise: Expertise
    speakingStyle: SpeakingStyle
    behaviorRules?: string[]
    systemPrompt: string
    isDefault?: boolean
    isPublic?: boolean
    createdBy?: string
  }): Promise<RolePlayTemplate> {
    return this.prisma.rolePlayTemplate.create({
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        personality: JSON.stringify(data.personality),
        expertise: JSON.stringify(data.expertise),
        speakingStyle: JSON.stringify(data.speakingStyle),
        behaviorRules: data.behaviorRules ? JSON.stringify(data.behaviorRules) : null,
        systemPrompt: data.systemPrompt,
        isDefault: data.isDefault ?? false,
        isPublic: data.isPublic ?? false,
        createdBy: data.createdBy
      }
    })
  }
  
  /**
   * 获取角色模板列表
   */
  async listTemplates(options: {
    category?: string
    isPublic?: boolean
    search?: string
  } = {}): Promise<RolePlayTemplate[]> {
    const where: any = {}
    
    if (options.category) {
      where.category = options.category
    }
    
    if (options.isPublic !== undefined) {
      where.isPublic = options.isPublic
    }
    
    if (options.search) {
      where.OR = [
        { name: { contains: options.search } },
        { description: { contains: options.search } }
      ]
    }
    
    return this.prisma.rolePlayTemplate.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })
  }
  
  /**
   * 获取角色模板详情
   */
  async getTemplate(id: string): Promise<RolePlayTemplate> {
    const template = await this.prisma.rolePlayTemplate.findUnique({
      where: { id }
    })
    
    if (!template) {
      throw new Error('Role play template not found')
    }
    
    return template
  }
  
  /**
   * 应用模板到Agent
   */
  async applyTemplateToAgent(agentId: string, templateId: string): Promise<void> {
    const template = await this.getTemplate(templateId)
    
    await this.prisma.agent.update({
      where: { id: agentId },
      data: {
        roleTemplateId: templateId,
        rolePlayConfig: JSON.stringify({
          personality: JSON.parse(template.personality),
          expertise: JSON.parse(template.expertise),
          speakingStyle: JSON.parse(template.speakingStyle),
          behaviorRules: template.behaviorRules ? JSON.parse(template.behaviorRules) : []
        })
      }
    })
  }
  
  // ============================================
  // Agent角色配置
  // ============================================
  
  /**
   * 更新Agent角色配置
   */
  async updateAgentRoleConfig(agentId: string, config: AgentRoleConfig): Promise<void> {
    await this.prisma.agent.update({
      where: { id: agentId },
      data: {
        rolePlayConfig: JSON.stringify(config)
      }
    })
  }
  
  /**
   * 获取Agent角色配置
   */
  async getAgentRoleConfig(agentId: string): Promise<AgentRoleConfig | null> {
    const agent = await this.prisma.agent.findUnique({
      where: { id: agentId }
    })
    
    if (!agent || !agent.rolePlayConfig) {
      return null
    }
    
    return JSON.parse(agent.rolePlayConfig)
  }
  
  // ============================================
  // 发言生成
  // ============================================
  
  /**
   * 生成会议发言
   */
  async generateSpeech(
    agentId: string,
    context: MeetingContext,
    options: {
      topic?: string
      intent?: string
      maxLength?: number
    } = {}
  ): Promise<GeneratedSpeech> {
    // 获取Agent角色配置
    const roleConfig = await this.getAgentRoleConfig(agentId)
    
    if (!roleConfig) {
      throw new Error('Agent role config not found')
    }
    
    // 构建系统提示
    const systemPrompt = this.buildSystemPrompt(roleConfig, 'meeting')
    
    // 构建上下文提示
    const contextPrompt = this.buildMeetingContextPrompt(context, options.topic)
    
    // 构建用户提示
    const userPrompt = this.buildSpeechPrompt(roleConfig, context, options)
    
    // 调用LLM生成
    const completion = await llmService.completeStructured<{
      content: string
      suggestedDuration: number
      confidence: number
      intent: string
    }>(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `${contextPrompt}\n\n${userPrompt}` }
      ],
      {
        type: 'object',
        properties: {
          content: { type: 'string' },
          suggestedDuration: { type: 'number' },
          confidence: { type: 'number' },
          intent: { type: 'string', enum: ['opinion', 'question', 'suggestion', 'clarification', 'agreement', 'disagreement'] }
        },
        required: ['content', 'suggestedDuration', 'confidence', 'intent']
      }
    )
    
    return {
      content: completion.content.content,
      suggestedDuration: completion.content.suggestedDuration,
      confidence: completion.content.confidence,
      intent: completion.content.intent
    }
  }
  
  /**
   * 构建系统提示
   */
  private buildSystemPrompt(config: AgentRoleConfig, mode: 'meeting' | 'task' | 'general'): string {
    const { personality, expertise, speakingStyle } = config
    
    const styleDescriptions: Record<string, string> = {
      casual: '使用轻松、非正式的语言',
      neutral: '使用中立的语言',
      formal: '使用正式的商务语言',
      very_formal: '使用非常正式和专业的语言',
      concise: '表达简洁，直击要点',
      moderate: '表达适度，平衡详细和简洁',
      detailed: '提供详细的解释和背景',
      verbose: '全面而详细的阐述',
      friendly: '保持友好和亲和的态度',
      professional: '保持专业的态度',
      authoritative: '展现权威和自信',
      collaborative: '体现合作和开放的态度',
      critical: '保持批判性思维',
      indirect: '委婉地表达观点',
      direct: '直接地表达观点',
      blunt: '非常直率地表达观点'
    }
    
    const parts: string[] = [
      `你是一个具有特定角色的AI Agent。`,
      ``,
      `【性格特征】`,
      `- 核心特质: ${personality.traits.join(', ')}`,
      `- 沟通风格: ${personality.communication.join(', ')}`,
      `- 决策方式: ${personality.decisionStyle}`,
      `- 冲突处理: ${personality.conflictApproach}`,
      ``,
      `【专业领域】`,
      ...expertise.domains.map(d => `- ${d.name}: ${d.level}${d.yearsOfExperience ? ` (${d.yearsOfExperience}年经验)` : ''}`),
      ...(expertise.specializations.length > 0 ? [`- 专长: ${expertise.specializations.join(', ')}`] : []),
      ``,
      `【发言风格】`,
      `- ${styleDescriptions[speakingStyle.formality] || speakingStyle.formality}`,
      `- ${styleDescriptions[speakingStyle.verbosity] || speakingStyle.verbosity}`,
      `- ${styleDescriptions[speakingStyle.tone] || speakingStyle.tone}`,
      `- ${styleDescriptions[speakingStyle.directness] || speakingStyle.directness}`
    ]
    
    if (config.behaviorRules && config.behaviorRules.length > 0) {
      parts.push('', '【行为规则】')
      config.behaviorRules.forEach((rule, i) => {
        parts.push(`${i + 1}. ${rule}`)
      })
    }
    
    if (config.customPrompt) {
      parts.push('', '【补充说明】', config.customPrompt)
    }
    
    return parts.join('\n')
  }
  
  /**
   * 构建会议上下文提示
   */
  private buildMeetingContextPrompt(context: MeetingContext, currentTopic?: string): string {
    const parts: string[] = [
      `【会议信息】`,
      `- 标题: ${context.title}`,
      `- 类型: ${context.type}`,
      `- 当前议题: ${currentTopic || context.currentTopic || '无特定议题'}`,
      ``,
      `【议程】`,
      ...context.agenda.map((item, i) => `${i + 1}. ${item.title} (${item.status})${item.ownerId ? ` [负责人]` : ''}`),
      ``,
      `【参与者】`,
      ...context.participants.map(p => `- ${p.name} (${p.role})`),
    ]
    
    if (context.previousMessages.length > 0) {
      parts.push(
        '',
        '【最近讨论】',
        ...context.previousMessages.slice(-5).map(m => 
          `${m.agentName}: ${m.content.substring(0, 100)}${m.content.length > 100 ? '...' : ''}`
        )
      )
    }
    
    return parts.join('\n')
  }
  
  /**
   * 构建发言提示
   */
  private buildSpeechPrompt(
    config: AgentRoleConfig,
    context: MeetingContext,
    options: { topic?: string; intent?: string; maxLength?: number }
  ): string {
    const parts: string[] = [
      `请基于以上会议信息生成你的发言。`,
      ``
    ]
    
    if (options.topic) {
      parts.push(`话题: ${options.topic}`)
    }
    
    if (options.intent) {
      const intentMap: Record<string, string> = {
        opinion: '表达观点',
        question: '提出问题',
        suggestion: '提供建议',
        clarification: '澄清疑问',
        agreement: '表示赞同',
        disagreement: '表示异议'
      }
      parts.push(`发言意图: ${intentMap[options.intent] || options.intent}`)
    }
    
    parts.push(
      ``,
      `要求:`,
      `1. 符合你的角色设定和专业领域`,
      `2. 保持设定的发言风格`,
      `3. 内容要与会议主题相关`,
      `4. 考虑之前的讨论内容，避免重复`,
      options.maxLength ? `5. 控制在${options.maxLength}字以内` : '5. 简洁明了'
    )
    
    return parts.join('\n')
  }
  
  // ============================================
  // 角色能力评估
  // ============================================
  
  /**
   * 评估Agent角色能力
   */
  async assessAgentCapability(agentId: string): Promise<RoleCapabilityAssessment> {
    // 获取Agent历史数据
    const [completedTasks, collaborations, meetings] = await Promise.all([
      this.prisma.task.findMany({
        where: {
          assigneeId: agentId,
          status: 'completed'
        },
        orderBy: { completedAt: 'desc' },
        take: 50
      }),
      this.prisma.taskCollaborator.findMany({
        where: { agentId },
        include: { task: true }
      }),
      this.prisma.meetingParticipant.findMany({
        where: { agentId },
        include: { meeting: true }
      })
    ])
    
    // 获取角色配置
    const roleConfig = await this.getAgentRoleConfig(agentId)
    
    // 构建评估提示
    const prompt = this.buildAssessmentPrompt(agentId, completedTasks, collaborations, meetings, roleConfig)
    
    // 调用LLM评估
    const completion = await llmService.completeStructured<{
      dimensions: {
        communication: number
        expertise: number
        collaboration: number
        leadership: number
        decisionMaking: number
      }
      strengths: string[]
      weaknesses: string[]
      recommendations: string[]
    }>(
      [
        { role: 'system', content: '你是一个专业的AI Agent能力评估专家。基于Agent的历史表现数据，对其能力进行多维度评估。' },
        { role: 'user', content: prompt }
      ],
      {
        type: 'object',
        properties: {
          dimensions: {
            type: 'object',
            properties: {
              communication: { type: 'number', minimum: 0, maximum: 100 },
              expertise: { type: 'number', minimum: 0, maximum: 100 },
              collaboration: { type: 'number', minimum: 0, maximum: 100 },
              leadership: { type: 'number', minimum: 0, maximum: 100 },
              decisionMaking: { type: 'number', minimum: 0, maximum: 100 }
            }
          },
          strengths: { type: 'array', items: { type: 'string' } },
          weaknesses: { type: 'array', items: { type: 'string' } },
          recommendations: { type: 'array', items: { type: 'string' } }
        }
      }
    )
    
    const dims = completion.content.dimensions
    const overallScore = Math.round(
      (dims.communication + dims.expertise + dims.collaboration + dims.leadership + dims.decisionMaking) / 5
    )
    
    return {
      overallScore,
      dimensions: dims,
      strengths: completion.content.strengths,
      weaknesses: completion.content.weaknesses,
      recommendations: completion.content.recommendations
    }
  }
  
  /**
   * 构建评估提示
   */
  private buildAssessmentPrompt(
    agentId: string,
    tasks: any[],
    collaborations: any[],
    meetings: any[],
    roleConfig: AgentRoleConfig | null
  ): string {
    const parts: string[] = [
      `请评估以下Agent的能力表现：`,
      ``,
      `【Agent ID】${agentId}`,
      ``
    ]
    
    if (roleConfig) {
      parts.push(
        `【角色配置】`,
        `- 性格特质: ${roleConfig.personality.traits.join(', ')}`,
        `- 专业领域: ${roleConfig.expertise.domains.map(d => d.name).join(', ')}`,
        `- 沟通风格: ${roleConfig.speakingStyle.tone}`,
        ``
      )
    }
    
    // 任务统计
    const taskStats = {
      total: tasks.length,
      onTime: tasks.filter(t => t.dueDate && t.completedAt && new Date(t.completedAt) <= new Date(t.dueDate)).length,
      highPriority: tasks.filter(t => t.priority === 'high' || t.priority === 'urgent').length,
      collaborative: tasks.filter(t => t.collaborationMode === 'collaborative').length
    }
    
    parts.push(
      `【任务表现】`,
      `- 完成任务数: ${taskStats.total}`,
      `- 按时完成: ${taskStats.onTime}/${taskStats.total} (${taskStats.total > 0 ? Math.round(taskStats.onTime/taskStats.total*100) : 0}%)`,
      `- 高优先级任务: ${taskStats.highPriority}`,
      `- 协作任务: ${taskStats.collaborative}`,
      ``
    )
    
    // 协作统计
    const collabStats = {
      total: collaborations.length,
      asLeader: collaborations.filter(c => c.role === 'leader').length,
      avgDuration: collaborations.length > 0
        ? collaborations.reduce((sum, c) => {
            if (c.leftAt) {
              return sum + (new Date(c.leftAt).getTime() - new Date(c.joinedAt).getTime())
            }
            return sum
          }, 0) / collaborations.length / (1000 * 60 * 60) // 小时
        : 0
    }
    
    parts.push(
      `【协作表现】`,
      `- 协作任务数: ${collabStats.total}`,
      `- 担任领导角色: ${collabStats.asLeader}`,
      `- 平均参与时长: ${Math.round(collabStats.avgDuration * 10) / 10}小时`,
      ``
    )
    
    // 会议统计
    const meetingStats = {
      total: meetings.length,
      joined: meetings.filter(m => m.status === 'joined').length,
      totalSpeakDuration: meetings.reduce((sum, m) => sum + m.speakDuration, 0),
      totalSpeakCount: meetings.reduce((sum, m) => sum + m.speakCount, 0)
    }
    
    parts.push(
      `【会议参与】`,
      `- 参与会议数: ${meetingStats.total}`,
      `- 成功加入: ${meetingStats.joined}`,
      `- 总发言时长: ${Math.round(meetingStats.totalSpeakDuration / 60)}分钟`,
      `- 总发言次数: ${meetingStats.totalSpeakCount}`,
      ``,
      `请基于以上数据，对Agent的以下维度进行评分(0-100)并提供分析：`,
      `1. Communication (沟通能力)`,
      `2. Expertise (专业能力)`,
      `3. Collaboration (协作能力)`,
      `4. Leadership (领导力)`,
      `5. Decision Making (决策能力)`,
      ``,
      `同时提供：`,
      `- 优势特点 (strengths)`,
      `- 待改进项 (weaknesses)`,
      `- 发展建议 (recommendations)`
    )
    
    return parts.join('\n')
  }
  
  /**
   * 快速创建预设角色
   */
  async createPresetRoles(): Promise<void> {
    const presets = [
      {
        name: '技术专家',
        description: '专注于技术实现和架构设计的专家角色',
        category: 'meeting' as const,
        personality: {
          traits: ['analytical', 'detail-oriented', 'systematic'],
          communication: ['precise', 'technical'],
          decisionStyle: 'data_driven' as const,
          conflictApproach: 'collaborative' as const
        },
        expertise: {
          domains: [
            { name: 'Software Engineering', level: 'expert' as const, yearsOfExperience: 10 },
            { name: 'System Architecture', level: 'expert' as const, yearsOfExperience: 8 }
          ],
          specializations: ['Backend Development', 'Cloud Infrastructure', 'Performance Optimization']
        },
        speakingStyle: {
          formality: 'formal' as const,
          verbosity: 'detailed' as const,
          tone: 'professional' as const,
          directness: 'direct' as const
        },
        behaviorRules: [
          '提供具体的技术实现建议',
          '关注系统的可扩展性和性能',
          '用数据和事实支持观点',
          '考虑技术债务和长期维护成本'
        ],
        systemPrompt: '你是一个经验丰富的技术专家。在讨论中，你会从技术可行性和最佳实践的角度提供建议。你的分析应该全面、深入，考虑各种技术约束。'
      },
      {
        name: '产品经理',
        description: '关注用户需求和产品价值的产品经理角色',
        category: 'meeting' as const,
        personality: {
          traits: ['user-focused', 'strategic', 'empathetic'],
          communication: ['articulate', 'persuasive'],
          decisionStyle: 'intuitive' as const,
          conflictApproach: 'collaborative' as const
        },
        expertise: {
          domains: [
            { name: 'Product Management', level: 'expert' as const, yearsOfExperience: 8 },
            { name: 'User Experience', level: 'advanced' as const, yearsOfExperience: 5 }
          ],
          specializations: ['Product Strategy', 'User Research', 'Market Analysis']
        },
        speakingStyle: {
          formality: 'neutral' as const,
          verbosity: 'moderate' as const,
          tone: 'collaborative' as const,
          directness: 'neutral' as const
        },
        behaviorRules: [
          '始终关注用户需求和体验',
          '平衡业务目标和技术可行性',
          '用用户故事和数据支持观点',
          '推动团队达成共识'
        ],
        systemPrompt: '你是一个以用户为中心的产品经理。在讨论中，你会从用户需求、产品价值和市场竞争力的角度提出建议。你善于协调不同利益相关者，推动团队达成产品共识。'
      },
      {
        name: '敏捷教练',
        description: '促进团队协作和流程优化的敏捷教练角色',
        category: 'meeting' as const,
        personality: {
          traits: ['facilitator', 'empathetic', 'adaptive'],
          communication: ['listener', 'encouraging'],
          decisionStyle: 'collaborative' as const,
          conflictApproach: 'collaborative' as const
        },
        expertise: {
          domains: [
            { name: 'Agile Methodologies', level: 'expert' as const, yearsOfExperience: 10 },
            { name: 'Team Facilitation', level: 'expert' as const, yearsOfExperience: 8 }
          ],
          specializations: ['Scrum', 'Kanban', 'Team Coaching', 'Process Improvement']
        },
        speakingStyle: {
          formality: 'casual' as const,
          verbosity: 'moderate' as const,
          tone: 'friendly' as const,
          directness: 'indirect' as const
        },
        behaviorRules: [
          '促进开放和包容的讨论氛围',
          '帮助团队识别和解决障碍',
          '鼓励所有成员参与和发言',
          '关注团队健康和持续改进'
        ],
        systemPrompt: '你是一个敏捷教练和团队促进者。你的角色是帮助团队更好地协作，识别流程中的改进机会，创造开放包容的讨论氛围。你善于倾听，善于提问，帮助团队自己找到解决方案。'
      },
      {
        name: '决策者',
        description: '快速做出明确决策的领导角色',
        category: 'meeting' as const,
        personality: {
          traits: ['decisive', 'confident', 'strategic'],
          communication: ['direct', 'authoritative'],
          decisionStyle: 'authoritative' as const,
          conflictApproach: 'competing' as const
        },
        expertise: {
          domains: [
            { name: 'Strategic Planning', level: 'expert' as const, yearsOfExperience: 12 },
            { name: 'Business Operations', level: 'expert' as const, yearsOfExperience: 10 }
          ],
          specializations: ['Strategic Decision Making', 'Risk Management', 'Business Strategy']
        },
        speakingStyle: {
          formality: 'formal' as const,
          verbosity: 'concise' as const,
          tone: 'authoritative' as const,
          directness: 'direct' as const
        },
        behaviorRules: [
          '快速做出明确决策',
          '承担决策责任',
          '在关键时刻提供方向',
          '平衡风险和收益'
        ],
        systemPrompt: '你是一个果断的决策者。在讨论中，当需要做出决定时，你会迅速权衡利弊并给出明确的方向。你善于在不确定的情况下做出判断，并愿意承担决策的责任。'
      }
    ]
    
    for (const preset of presets) {
      const existing = await this.prisma.rolePlayTemplate.findFirst({
        where: { name: preset.name }
      })
      
      if (!existing) {
        await this.createTemplate(preset)
      }
    }
  }
}