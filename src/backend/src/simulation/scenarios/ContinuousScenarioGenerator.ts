/**
 * 持续场景生成器
 * 自动产生模拟事件和任务
 */

import { v4 as uuidv4 } from 'uuid'
import seedrandom from 'seedrandom'
import type { PRNG } from 'seedrandom'
import { Agent } from '../agents/Agent.js'
import {
  Task,
  TaskType,
  TaskPriority,
  SimulationEvent,
  ScenarioConfig
} from '../types.js'

export class ContinuousScenarioGenerator {
  private agents: Map<string, Agent>
  private rng: PRNG
  private currentTick: number = 0
  
  // 场景配置
  private scenarios: Map<string, ScenarioConfig> = new Map()
  
  // 任务模板
  private taskTemplates: Record<TaskType, string[]> = {
    customer_inquiry: [
      '智慧校园系统咨询',
      'AI教学平台需求',
      '数据中台建设咨询',
      '信息化改造方案',
      '在线教育平台搭建'
    ],
    requirement_analysis: [
      '用户需求调研',
      '业务流程梳理',
      '功能需求分析',
      '非功能性需求定义',
      '需求优先级排序'
    ],
    solution_design: [
      '系统架构设计',
      '技术方案选型',
      '数据库设计',
      'API接口设计',
      '安全方案设计'
    ],
    technical_review: [
      '架构评审',
      '代码评审',
      '安全评审',
      '性能评审',
      '可维护性评审'
    ],
    development: [
      '前端页面开发',
      '后端接口开发',
      '数据库迁移',
      '第三方集成',
      '功能模块实现'
    ],
    testing: [
      '单元测试编写',
      '集成测试执行',
      '性能测试',
      '安全测试',
      '用户验收测试'
    ],
    deployment: [
      '测试环境部署',
      '生产环境发布',
      '数据库更新',
      '配置迁移',
      '回滚方案准备'
    ],
    maintenance: [
      '系统监控检查',
      '日志分析',
      '性能优化',
      '安全补丁更新',
      '备份验证'
    ],
    budget_review: [
      '项目预算评估',
      '成本效益分析',
      '资源调配方案',
      '风险成本评估',
      '投资回报分析'
    ],
    project_coordination: [
      '项目进度同步',
      '跨团队协调',
      '资源冲突解决',
      '里程碑检查',
      '风险预警处理'
    ],
    emergency_fix: [
      '生产环境故障',
      '安全漏洞修复',
      '数据异常处理',
      '服务降级恢复',
      '紧急补丁发布'
    ],
    // V3新增任务类型模板
    market_research: [
      '竞品分析报告',
      '行业趋势调研',
      '用户画像研究',
      '市场规模测算',
      '商业模式分析'
    ],
    content_creation: [
      '产品宣传文案',
      '技术博客撰写',
      '培训材料制作',
      '演示文稿设计',
      '视频脚本编写'
    ],
    data_analysis: [
      '业务数据报表',
      '用户行为分析',
      '系统性能分析',
      '财务数据建模',
      '预测算法优化'
    ],
    documentation: [
      'API文档编写',
      '操作手册更新',
      '架构文档维护',
      '会议纪要整理',
      '知识库建设'
    ],
    training: [
      '新人入职培训',
      '技术分享会',
      '代码规范宣讲',
      '工具使用指导',
      '最佳实践分享'
    ],
    quality_audit: [
      '代码质量检查',
      '流程合规审计',
      '交付物审核',
      '标准执行检查',
      '改进建议输出'
    ],
    vendor_evaluation: [
      '供应商资质审核',
      '外包商评估',
      '技术方案比选',
      '报价分析对比',
      '合同条款审查'
    ],
    security_audit: [
      '权限配置检查',
      '安全策略评估',
      '漏洞扫描分析',
      '合规性审查',
      '应急预案更新'
    ],
    user_support: [
      '客户问题解答',
      '使用指导服务',
      '故障排查协助',
      '需求收集整理',
      '满意度回访'
    ],
    process_improvement: [
      '工作流程优化',
      '效率提升方案',
      '协作机制改进',
      '工具链升级',
      '管理制度完善'
    ]
  }

  constructor(agents: Map<string, Agent>, seed: string = 'metaverse-simulation') {
    this.agents = agents
    this.rng = seedrandom(seed)
    this.initScenarios()
  }

  // 初始化场景配置 V2 - 负载均衡优化
  private initScenarios(): void {
    // 客户咨询场景 (市场部触发) - 降低频率
    this.scenarios.set('customer_inquiry', {
      id: 'customer_inquiry',
      name: '客户咨询',
      description: '新客户咨询需求',
      trigger: { type: 'probability', value: 0.008, cooldown: 400 },
      action: { type: 'generate_task', params: { type: 'customer_inquiry' } },
      enabled: true,
      triggerCount: 0
    })

    // 方案设计场景 - 降低频率
    this.scenarios.set('solution_design', {
      id: 'solution_design',
      name: '方案设计',
      description: '需要设计方案',
      trigger: { type: 'probability', value: 0.005, cooldown: 500 },
      action: { type: 'generate_task', params: { type: 'solution_design' } },
      enabled: true,
      triggerCount: 0
    })

    // 开发任务场景 - 降低频率
    this.scenarios.set('development', {
      id: 'development',
      name: '开发任务',
      description: '新的开发需求',
      trigger: { type: 'probability', value: 0.006, cooldown: 450 },
      action: { type: 'generate_task', params: { type: 'development' } },
      enabled: true,
      triggerCount: 0
    })

    // 部署任务场景 - 降低频率
    this.scenarios.set('deployment', {
      id: 'deployment',
      name: '部署任务',
      description: '需要部署服务',
      trigger: { type: 'probability', value: 0.004, cooldown: 600 },
      action: { type: 'generate_task', params: { type: 'deployment' } },
      enabled: true,
      triggerCount: 0
    })

    // 紧急修复场景 (低频但重要)
    this.scenarios.set('emergency_fix', {
      id: 'emergency_fix',
      name: '紧急修复',
      description: '生产环境问题',
      trigger: { type: 'probability', value: 0.005, cooldown: 1000 },
      action: { type: 'generate_task', params: { type: 'emergency_fix', priority: 'urgent' } },
      enabled: true,
      triggerCount: 0
    })

    // 协作场景 - 大幅提高触发频率
    this.scenarios.set('collaboration', {
      id: 'collaboration',
      name: '跨部门协作',
      description: '需要跨部门协作',
      trigger: { type: 'probability', value: 0.08, cooldown: 100 },  // 从0.02提高到0.08，冷却从350降到100
      action: { type: 'initiate_collaboration', params: {} },
      enabled: true,
      triggerCount: 0
    })

    // ============================================
    // V3新增场景 - 让所有Agent都有任务
    // ============================================

    // 市场调研场景（李拓等市场专员）
    this.scenarios.set('market_research', {
      id: 'market_research',
      name: '市场调研',
      description: '竞品分析和行业调研',
      trigger: { type: 'probability', value: 0.007, cooldown: 350 },
      action: { type: 'generate_task', params: { type: 'market_research', priority: 'medium' } },
      enabled: true,
      triggerCount: 0
    })

    // 内容创作场景（助理、市场）
    this.scenarios.set('content_creation', {
      id: 'content_creation',
      name: '内容创作',
      description: '文档和材料编写',
      trigger: { type: 'probability', value: 0.006, cooldown: 400 },
      action: { type: 'generate_task', params: { type: 'content_creation', priority: 'low' } },
      enabled: true,
      triggerCount: 0
    })

    // 数据分析场景（财务、开发）
    this.scenarios.set('data_analysis', {
      id: 'data_analysis',
      name: '数据分析',
      description: '业务和系统数据分析',
      trigger: { type: 'probability', value: 0.008, cooldown: 380 },
      action: { type: 'generate_task', params: { type: 'data_analysis', priority: 'medium' } },
      enabled: true,
      triggerCount: 0
    })

    // 文档编写场景（方案、助理）
    this.scenarios.set('documentation', {
      id: 'documentation',
      name: '文档维护',
      description: '技术文档和知识库',
      trigger: { type: 'probability', value: 0.009, cooldown: 320 },
      action: { type: 'generate_task', params: { type: 'documentation', priority: 'low' } },
      enabled: true,
      triggerCount: 0
    })

    // 培训指导场景（高级工程师）
    this.scenarios.set('training', {
      id: 'training',
      name: '培训指导',
      description: '技术分享和新人培训',
      trigger: { type: 'probability', value: 0.005, cooldown: 500 },
      action: { type: 'generate_task', params: { type: 'training', priority: 'medium' } },
      enabled: true,
      triggerCount: 0
    })

    // 质量审计场景（项目经理）
    this.scenarios.set('quality_audit', {
      id: 'quality_audit',
      name: '质量审计',
      description: '流程和质量检查',
      trigger: { type: 'probability', value: 0.006, cooldown: 450 },
      action: { type: 'generate_task', params: { type: 'quality_audit', priority: 'medium' } },
      enabled: true,
      triggerCount: 0
    })

    // 供应商评估场景（财务、项目）
    this.scenarios.set('vendor_evaluation', {
      id: 'vendor_evaluation',
      name: '供应商评估',
      description: '外包商和供应商审核',
      trigger: { type: 'probability', value: 0.004, cooldown: 600 },
      action: { type: 'generate_task', params: { type: 'vendor_evaluation', priority: 'low' } },
      enabled: true,
      triggerCount: 0
    })

    // 安全审计场景（运维、方案）
    this.scenarios.set('security_audit', {
      id: 'security_audit',
      name: '安全审计',
      description: '安全和合规检查',
      trigger: { type: 'probability', value: 0.005, cooldown: 550 },
      action: { type: 'generate_task', params: { type: 'security_audit', priority: 'high' } },
      enabled: true,
      triggerCount: 0
    })

    // 用户支持场景（助理、运维）
    this.scenarios.set('user_support', {
      id: 'user_support',
      name: '用户支持',
      description: '客户服务和问题解答',
      trigger: { type: 'probability', value: 0.01, cooldown: 280 },
      action: { type: 'generate_task', params: { type: 'user_support', priority: 'medium' } },
      enabled: true,
      triggerCount: 0
    })

    // 流程优化场景（项目经理）
    this.scenarios.set('process_improvement', {
      id: 'process_improvement',
      name: '流程优化',
      description: '工作流程和效率改进',
      trigger: { type: 'probability', value: 0.004, cooldown: 700 },
      action: { type: 'generate_task', params: { type: 'process_improvement', priority: 'low' } },
      enabled: true,
      triggerCount: 0
    })

    // 预算审批场景
    this.scenarios.set('budget_review', {
      id: 'budget_review',
      name: '预算审批',
      description: '需要财务审批',
      trigger: { type: 'probability', value: 0.01, cooldown: 600 },
      action: { type: 'generate_task', params: { type: 'budget_review' } },
      enabled: true,
      triggerCount: 0
    })

    // ============================================
    // V3 新增场景 - 协同机制与思想碰撞
    // ============================================

    // 思想碰撞会议 - 跨部门头脑风暴 - 提高频率
    this.scenarios.set('brainstorm_meeting', {
      id: 'brainstorm_meeting',
      name: '思想碰撞会议',
      description: '跨部门产品创新研讨',
      trigger: { type: 'probability', value: 0.05, cooldown: 150 },  // 从0.003提高到0.05，冷却从800降到150
      action: { type: 'brainstorm', params: { topic: 'AI教学产品创新', participants: ['M1', 'M2', 'S1', 'S2', 'D1', 'D2'] } },
      enabled: true,
      triggerCount: 0
    })

    // 紧急攻坚会议 - 提高频率
    this.scenarios.set('emergency_brainstorm', {
      id: 'emergency_brainstorm',
      name: '紧急攻坚会议',
      description: '生产环境问题紧急处理',
      trigger: { type: 'probability', value: 0.04, cooldown: 200 },  // 从0.002提高到0.04，冷却从1200降到200
      action: { type: 'emergency_brainstorm', params: { topic: '生产环境故障处理', participants: ['O1', 'O2', 'D1', 'D2', 'P1'] } },
      enabled: true,
      triggerCount: 0
    })

    // 任务委托链 - 多级任务传递 - 提高频率
    this.scenarios.set('delegation_chain', {
      id: 'delegation_chain',
      name: '任务委托链',
      description: '项目需求三级传递',
      trigger: { type: 'probability', value: 0.06, cooldown: 120 },  // 从0.004提高到0.06，冷却从700降到120
      action: { type: 'delegation_chain', params: { chain: [{ from: 'P1', to: 'S1', task: '项目需求分析' }, { from: 'S1', to: 'D1', task: '技术实现方案' }, { from: 'D1', to: 'O1', task: '部署实施' }] } },
      enabled: true,
      triggerCount: 0
    })

    // 多Agent并行协作 - 大幅提高频率
    this.scenarios.set('parallel_collaboration', {
      id: 'parallel_collaboration',
      name: '多Agent并行协作',
      description: '智慧校园系统多部门协作',
      trigger: { type: 'probability', value: 0.05, cooldown: 150 },  // 从0.003提高到0.05，冷却从900降到150
      action: { type: 'parallel_collaboration', params: { project: '智慧校园系统交付', collaborators: ['M1', 'S1', 'D1', 'O1', 'F1'], coordinator: 'P1' } },
      enabled: true,
      triggerCount: 0
    })

    // 协商与决策 - 技术选型投票 - 提高频率
    this.scenarios.set('negotiation_decision', {
      id: 'negotiation_decision',
      name: '协商与决策',
      description: '技术架构选型讨论',
      trigger: { type: 'probability', value: 0.04, cooldown: 180 },  // 从0.002提高到0.04，冷却从1000降到180
      action: { type: 'negotiation', params: { topic: '技术架构选型', options: ['微服务', '单体应用', 'Serverless'], participants: ['S1', 'S2', 'D1', 'D2'] } },
      enabled: true,
      triggerCount: 0
    })

    // 人类介入请求 - 高风险决策
    this.scenarios.set('human_intervention', {
      id: 'human_intervention',
      name: '人类介入请求',
      description: '预算超支风险上报',
      trigger: { type: 'probability', value: 0.001, cooldown: 1500 },
      action: { type: 'human_intervention', params: { type: 'value_judgment', context: '项目预算超支风险评估', urgency: 'high', requestingAgents: ['F1', 'P1'] } },
      enabled: true,
      triggerCount: 0
    })

    // Agent状态变化 - 模拟离线/恢复
    this.scenarios.set('agent_status_change', {
      id: 'agent_status_change',
      name: 'Agent状态变化',
      description: '模拟Agent离线重连',
      trigger: { type: 'probability', value: 0.001, cooldown: 2000 },
      action: { type: 'agent_status_change', params: {} },
      enabled: true,
      triggerCount: 0
    })

    // ============================================
    // 压力测试场景 - 边际条件
    // ============================================

    // 压力测试1: 突发高并发
    this.scenarios.set('stress_burst', {
      id: 'stress_burst',
      name: '突发流量压力测试',
      description: '瞬间注入大量任务测试系统承载能力',
      trigger: { type: 'probability', value: 0.0005, cooldown: 3000 },
      action: { type: 'stress_burst', params: { taskCount: 20, intensity: 'high' } },
      enabled: true,
      triggerCount: 0
    })

    // 压力测试2: Agent集体离线
    this.scenarios.set('stress_agent_outage', {
      id: 'stress_agent_outage',
      name: 'Agent集体离线',
      description: '模拟50%以上Agent同时离线',
      trigger: { type: 'probability', value: 0.0003, cooldown: 5000 },
      action: { type: 'stress_agent_outage', params: { offlineRatio: 0.6, duration: 100 } },
      enabled: true,
      triggerCount: 0
    })

    // 压力测试3: 资源竞争
    this.scenarios.set('stress_resource_contention', {
      id: 'stress_resource_contention',
      name: '资源竞争测试',
      description: '多个Agent争夺同一资源',
      trigger: { type: 'probability', value: 0.0008, cooldown: 2500 },
      action: { type: 'stress_resource_contention', params: { resource: 'shared_db', contenders: 5 } },
      enabled: true,
      triggerCount: 0
    })

    // 压力测试4: 极端优先级反转
    this.scenarios.set('stress_priority_inversion', {
      id: 'stress_priority_inversion',
      name: '优先级反转测试',
      description: '低优先级任务阻塞高优先级任务',
      trigger: { type: 'probability', value: 0.0006, cooldown: 3500 },
      action: { type: 'stress_priority_inversion', params: {} },
      enabled: true,
      triggerCount: 0
    })

    // 压力测试5: 级联故障
    this.scenarios.set('stress_cascading_failure', {
      id: 'stress_cascading_failure',
      name: '级联故障测试',
      description: '一个Agent故障导致连锁反应',
      trigger: { type: 'probability', value: 0.0004, cooldown: 6000 },
      action: { type: 'stress_cascading_failure', params: { spreadRate: 0.3 } },
      enabled: true,
      triggerCount: 0
    })

    // 压力测试6: 数据不一致
    this.scenarios.set('stress_data_inconsistency', {
      id: 'stress_data_inconsistency',
      name: '数据不一致测试',
      description: '并发写入导致数据冲突',
      trigger: { type: 'probability', value: 0.0007, cooldown: 2800 },
      action: { type: 'stress_data_inconsistency', params: { conflictRate: 0.2 } },
      enabled: true,
      triggerCount: 0
    })

    // 压力测试7: 死锁场景
    this.scenarios.set('stress_deadlock', {
      id: 'stress_deadlock',
      name: '死锁测试',
      description: '循环等待导致死锁',
      trigger: { type: 'probability', value: 0.0002, cooldown: 8000 },
      action: { type: 'stress_deadlock', params: { ringSize: 4 } },
      enabled: true,
      triggerCount: 0
    })

    // 压力测试8: 内存泄漏模拟
    this.scenarios.set('stress_memory_leak', {
      id: 'stress_memory_leak',
      name: '内存压力测试',
      description: '模拟内存资源耗尽',
      trigger: { type: 'probability', value: 0.0003, cooldown: 4000 },
      action: { type: 'stress_memory_leak', params: { growthRate: 0.1 } },
      enabled: true,
      triggerCount: 0
    })
  }

  // 生成事件 (每tick调用)
  generate(currentTick: number): SimulationEvent[] {
    this.currentTick = currentTick
    const events: SimulationEvent[] = []

    // 检查所有场景
    for (const [id, scenario] of this.scenarios) {
      if (!scenario.enabled) continue

      // 检查冷却时间
      if (scenario.lastTriggered && 
          currentTick - scenario.lastTriggered < (scenario.trigger.cooldown || 0)) {
        continue
      }

      // 检查触发概率
      if (scenario.trigger.type === 'probability') {
        if (this.rng() < scenario.trigger.value) {
          const event = this.executeScenario(scenario)
          if (event) {
            events.push(event)
            scenario.lastTriggered = currentTick
            scenario.triggerCount++
          }
        }
      }
    }

    // 随机产生Agent间互动
    if (this.rng() < 0.02) {
      events.push(...this.generateAgentInteraction())
    }

    return events
  }

  // 执行场景
  private executeScenario(scenario: ScenarioConfig): SimulationEvent | null {
    switch (scenario.action.type) {
      case 'generate_task':
        return this.generateTaskEvent(scenario.action.params)
      case 'initiate_collaboration':
        return this.generateCollaborationEvent()
      case 'brainstorm':
        return this.generateBrainstormEvent(scenario.action.params)
      case 'emergency_brainstorm':
        return this.generateEmergencyBrainstormEvent(scenario.action.params)
      case 'delegation_chain':
        return this.generateDelegationChainEvent(scenario.action.params)
      case 'parallel_collaboration':
        return this.generateParallelCollaborationEvent(scenario.action.params)
      case 'negotiation':
        return this.generateNegotiationEvent(scenario.action.params)
      case 'human_intervention':
        return this.generateHumanInterventionEvent(scenario.action.params)
      case 'agent_status_change':
        return this.generateAgentStatusChangeEvent()
      // 压力测试场景
      case 'stress_burst':
        return this.generateStressBurstEvent(scenario.action.params)
      case 'stress_agent_outage':
        return this.generateStressAgentOutageEvent(scenario.action.params)
      case 'stress_resource_contention':
        return this.generateStressResourceContentionEvent(scenario.action.params)
      case 'stress_priority_inversion':
        return this.generateStressPriorityInversionEvent(scenario.action.params)
      case 'stress_cascading_failure':
        return this.generateStressCascadingFailureEvent(scenario.action.params)
      case 'stress_data_inconsistency':
        return this.generateStressDataInconsistencyEvent(scenario.action.params)
      case 'stress_deadlock':
        return this.generateStressDeadlockEvent(scenario.action.params)
      case 'stress_memory_leak':
        return this.generateStressMemoryLeakEvent(scenario.action.params)
      default:
        return null
    }
  }

  // 生成任务事件
  private generateTaskEvent(params: any): SimulationEvent {
    const taskType = params.type as TaskType
    const templates = this.taskTemplates[taskType]
    const title = templates[Math.floor(this.rng() * templates.length)]
    
    const priority: TaskPriority = params.priority || 
      (this.rng() < 0.1 ? 'urgent' : this.rng() < 0.3 ? 'high' : this.rng() < 0.6 ? 'medium' : 'low')

    const task: Task = {
      id: uuidv4(),
      title,
      description: `${title} - 自动生成任务`,
      type: taskType,
      priority,
      status: 'pending',
      estimatedDuration: Math.floor(8 + this.rng() * 12), // 8-20 ticks (更快完成)
      progress: 0,
      createdAt: Date.now()
    }

    return {
      id: uuidv4(),
      type: 'new_task',
      timestamp: Date.now(),
      tick: this.currentTick,
      data: { task }
    }
  }

  // 生成协作事件
  private generateCollaborationEvent(): SimulationEvent {
    const agentList = Array.from(this.agents.values())
    const initiator = agentList[Math.floor(this.rng() * agentList.length)]
    
    // 找一个不同的Agent
    let participant = agentList[Math.floor(this.rng() * agentList.length)]
    while (participant.id === initiator.id) {
      participant = agentList[Math.floor(this.rng() * agentList.length)]
    }

    return {
      id: uuidv4(),
      type: 'collaboration_request',
      timestamp: Date.now(),
      tick: this.currentTick,
      agentId: initiator.id,
      targetAgentId: participant.id,
      data: {
        reason: '需要协作完成任务',
        initiatorName: initiator.name,
        participantName: participant.name
      }
    }
  }

  // 生成Agent间互动
  private generateAgentInteraction(): SimulationEvent[] {
    const events: SimulationEvent[] = []
    const agentList = Array.from(this.agents.values())
    
    // 随机选择两个Agent进行交流
    const agent1 = agentList[Math.floor(this.rng() * agentList.length)]
    let agent2 = agentList[Math.floor(this.rng() * agentList.length)]
    while (agent2.id === agent1.id) {
      agent2 = agentList[Math.floor(this.rng() * agentList.length)]
    }

    // 更新关系
    const trustDelta = this.rng() * 4 - 2 // -2 到 +2
    agent1.updateRelationship(agent2.id, trustDelta)
    agent2.updateRelationship(agent1.id, trustDelta)

    return events
  }

  // 手动触发场景 (用于OpenClaw指令)
  triggerScenario(scenarioId: string): SimulationEvent | null {
    const scenario = this.scenarios.get(scenarioId)
    if (!scenario) return null

    scenario.lastTriggered = this.currentTick
    scenario.triggerCount++
    return this.executeScenario(scenario)
  }

  // 获取场景统计
  getScenarioStats(): Array<{ id: string; name: string; triggerCount: number; enabled: boolean }> {
    return Array.from(this.scenarios.values()).map(s => ({
      id: s.id,
      name: s.name,
      triggerCount: s.triggerCount,
      enabled: s.enabled
    }))
  }

  // 启用/禁用场景
  setScenarioEnabled(id: string, enabled: boolean): boolean {
    const scenario = this.scenarios.get(id)
    if (scenario) {
      scenario.enabled = enabled
      return true
    }
    return false
  }

  // ============================================
  // V3 新增事件生成方法
  // ============================================

  // 生成思想碰撞会议事件
  private generateBrainstormEvent(params: any): SimulationEvent {
    const agentList = Array.from(this.agents.values())
    const initiator = agentList.find(a => a.id === 'S1') || agentList[0]
    const participants = params.participants || ['M1', 'M2', 'S1', 'S2', 'D1', 'D2']
    
    console.log(`🧠 思想碰撞会议: ${params.topic} (发起人: ${initiator.name})`)
    
    return {
      id: uuidv4(),
      type: 'collaboration_request',
      timestamp: Date.now(),
      tick: this.currentTick,
      agentId: initiator.id,
      data: {
        type: 'brainstorm',
        topic: params.topic,
        participants: participants,
        expectedDuration: params.expectedDuration || 50,
        meetingType: '跨部门研讨'
      }
    }
  }

  // 生成紧急攻坚会议事件
  private generateEmergencyBrainstormEvent(params: any): SimulationEvent {
    const agentList = Array.from(this.agents.values())
    const initiator = agentList.find(a => a.id === 'O1') || agentList[0]
    
    console.log(`🚨 紧急攻坚会议: ${params.topic} (发起人: ${initiator.name})`)
    
    return {
      id: uuidv4(),
      type: 'collaboration_request',
      timestamp: Date.now(),
      tick: this.currentTick,
      agentId: initiator.id,
      data: {
        type: 'emergency_brainstorm',
        topic: params.topic,
        priority: 'urgent',
        participants: params.participants || ['O1', 'O2', 'D1', 'D2', 'P1'],
        meetingType: '紧急问题处理'
      }
    }
  }

  // 生成任务委托链事件
  private generateDelegationChainEvent(params: any): SimulationEvent {
    const chain = params.chain || [{ from: 'P1', to: 'S1', task: '项目需求分析' }]
    const firstStep = chain[0]
    const initiator = Array.from(this.agents.values()).find(a => a.id === firstStep.from)
    
    console.log(`📋 任务委托链启动: ${firstStep.task} (${chain.length}级传递)`)
    
    return {
      id: uuidv4(),
      type: 'delegation',
      timestamp: Date.now(),
      tick: this.currentTick,
      agentId: firstStep.from,
      targetAgentId: firstStep.to,
      data: {
        taskTitle: firstStep.task,
        chain: chain,
        chainPosition: 1,
        totalSteps: chain.length,
        delegationType: '多级任务传递'
      }
    }
  }

  // 生成多Agent并行协作事件
  private generateParallelCollaborationEvent(params: any): SimulationEvent {
    const coordinator = Array.from(this.agents.values()).find(a => a.id === params.coordinator)
    
    console.log(`🤝 多Agent并行协作: ${params.project} (协调人: ${coordinator?.name || '刘管'})`)
    
    return {
      id: uuidv4(),
      type: 'collaboration_request',
      timestamp: Date.now(),
      tick: this.currentTick,
      agentId: params.coordinator || 'P1',
      data: {
        type: 'parallel_collaboration',
        project: params.project,
        collaborators: params.collaborators || ['M1', 'S1', 'D1', 'O1', 'F1'],
        coordinator: params.coordinator || 'P1',
        collaborationType: '大型项目协作'
      }
    }
  }

  // 生成协商与决策事件
  private generateNegotiationEvent(params: any): SimulationEvent {
    const participants = params.participants || ['S1', 'S2', 'D1', 'D2']
    const initiator = Array.from(this.agents.values()).find(a => a.id === participants[0])
    
    // 随机选择一个选项作为提议
    const options = params.options || ['微服务', '单体应用', 'Serverless']
    const proposal = options[Math.floor(this.rng() * options.length)]
    
    console.log(`⚖️ 协商决策: ${params.topic} (提议: ${proposal})`)
    
    return {
      id: uuidv4(),
      type: 'negotiation_round',
      timestamp: Date.now(),
      tick: this.currentTick,
      agentId: participants[0],
      data: {
        round: 1,
        topic: params.topic,
        stance: 'propose',
        proposal: proposal,
        options: options,
        participants: participants,
        negotiationType: '技术选型决策'
      }
    }
  }

  // 生成人类介入请求事件
  private generateHumanInterventionEvent(params: any): SimulationEvent {
    const requester = Array.from(this.agents.values()).find(a => a.id === 'A1') || Array.from(this.agents.values())[0]
    
    console.log(`👤 人类介入请求: ${params.context} (请求人: ${requester.name})`)
    
    return {
      id: uuidv4(),
      type: 'human_intervention',
      timestamp: Date.now(),
      tick: this.currentTick,
      agentId: requester.id,
      data: {
        type: params.type || 'value_judgment',
        context: params.context,
        urgency: params.urgency || 'high',
        requestingAgents: params.requestingAgents || ['F1', 'P1'],
        options: [
          { id: 'option1', description: '方案A - 保守策略', risk: '收益较低但稳定' },
          { id: 'option2', description: '方案B - 激进策略', risk: '高收益高风险' },
          { id: 'option3', description: '方案C - 平衡策略', risk: '中等收益中等风险' }
        ],
        interventionType: '高风险决策'
      }
    }
  }

  // 生成Agent状态变化事件
  private generateAgentStatusChangeEvent(): SimulationEvent {
    const agentList = Array.from(this.agents.values())
    const agent = agentList[Math.floor(this.rng() * agentList.length)]
    const isOffline = this.rng() < 0.5
    
    console.log(`🔄 Agent状态变化: ${agent.name} ${isOffline ? '离线' : '恢复'}`)
    
    return {
      id: uuidv4(),
      type: 'agent_status_change',
      timestamp: Date.now(),
      tick: this.currentTick,
      agentId: agent.id,
      data: {
        agentName: agent.name,
        oldStatus: isOffline ? 'working' : 'offline',
        newStatus: isOffline ? 'offline' : 'idle',
        reason: isOffline ? '模拟网络中断' : '网络恢复',
        statusChangeType: '连接状态变化'
      }
    }
  }

  // ============================================
  // 压力测试事件生成方法
  // ============================================

  // 压力测试1: 突发高并发
  private generateStressBurstEvent(params: any): SimulationEvent {
    const taskCount = params.taskCount || 20
    console.log(`🔥 压力测试: 突发流量注入 ${taskCount} 个任务`)
    
    return {
      id: uuidv4(),
      type: 'stress_test',
      timestamp: Date.now(),
      tick: this.currentTick,
      data: {
        testType: 'burst',
        taskCount: taskCount,
        intensity: params.intensity || 'high',
        description: `瞬间注入${taskCount}个任务测试系统承载能力`,
        expectedImpact: '队列积压，响应延迟增加'
      }
    }
  }

  // 压力测试2: Agent集体离线
  private generateStressAgentOutageEvent(params: any): SimulationEvent {
    const offlineRatio = params.offlineRatio || 0.6
    const agentList = Array.from(this.agents.values())
    const offlineCount = Math.floor(agentList.length * offlineRatio)
    const offlineAgents = agentList.slice(0, offlineCount).map(a => a.name)
    
    console.log(`💀 压力测试: ${offlineCount}个Agent集体离线 (${(offlineRatio * 100).toFixed(0)}%)`)
    console.log(`   离线Agent: ${offlineAgents.join(', ')}`)
    
    return {
      id: uuidv4(),
      type: 'stress_test',
      timestamp: Date.now(),
      tick: this.currentTick,
      data: {
        testType: 'agent_outage',
        offlineRatio: offlineRatio,
        offlineCount: offlineCount,
        offlineAgents: offlineAgents,
        duration: params.duration || 100,
        description: `模拟${offlineCount}个Agent同时离线`,
        expectedImpact: '剩余Agent负载激增，任务积压'
      }
    }
  }

  // 压力测试3: 资源竞争
  private generateStressResourceContentionEvent(params: any): SimulationEvent {
    const resource = params.resource || 'shared_database'
    const contenders = params.contenders || 5
    const agentList = Array.from(this.agents.values())
    const competingAgents = agentList.slice(0, contenders).map(a => a.name)
    
    console.log(`⚔️  压力测试: ${contenders}个Agent争夺资源 [${resource}]`)
    console.log(`   竞争者: ${competingAgents.join(', ')}`)
    
    return {
      id: uuidv4(),
      type: 'stress_test',
      timestamp: Date.now(),
      tick: this.currentTick,
      data: {
        testType: 'resource_contention',
        resource: resource,
        contenderCount: contenders,
        competingAgents: competingAgents,
        description: `多个Agent并发访问共享资源`,
        expectedImpact: '锁竞争，性能下降，可能死锁'
      }
    }
  }

  // 压力测试4: 优先级反转
  private generateStressPriorityInversionEvent(params: any): SimulationEvent {
    console.log(`⚠️  压力测试: 优先级反转场景`)
    
    return {
      id: uuidv4(),
      type: 'stress_test',
      timestamp: Date.now(),
      tick: this.currentTick,
      data: {
        testType: 'priority_inversion',
        description: '低优先级任务持有资源阻塞高优先级任务',
        scenario: '低优先级任务占用核心资源，高优先级任务被迫等待',
        expectedImpact: '高优先级任务响应延迟，系统吞吐量下降'
      }
    }
  }

  // 压力测试5: 级联故障
  private generateStressCascadingFailureEvent(params: any): SimulationEvent {
    const spreadRate = params.spreadRate || 0.3
    const agentList = Array.from(this.agents.values())
    const patientZero = agentList[Math.floor(this.rng() * agentList.length)]
    
    console.log(`🌊 压力测试: 级联故障 (起点: ${patientZero.name})`)
    console.log(`   传播率: ${(spreadRate * 100).toFixed(0)}%`)
    
    return {
      id: uuidv4(),
      type: 'stress_test',
      timestamp: Date.now(),
      tick: this.currentTick,
      data: {
        testType: 'cascading_failure',
        originAgent: patientZero.name,
        spreadRate: spreadRate,
        description: `一个Agent故障引发连锁反应`,
        expectedImpact: '故障扩散，系统可用性下降'
      }
    }
  }

  // 压力测试6: 数据不一致
  private generateStressDataInconsistencyEvent(params: any): SimulationEvent {
    const conflictRate = params.conflictRate || 0.2
    const agentList = Array.from(this.agents.values())
    const writers = Math.floor(agentList.length * conflictRate)
    
    console.log(`🔄 压力测试: 数据不一致 (${writers}个并发写入者)`)
    
    return {
      id: uuidv4(),
      type: 'stress_test',
      timestamp: Date.now(),
      tick: this.currentTick,
      data: {
        testType: 'data_inconsistency',
        writerCount: writers,
        conflictRate: conflictRate,
        description: '并发写入导致数据冲突',
        expectedImpact: '数据不一致，需要冲突解决'
      }
    }
  }

  // 压力测试7: 死锁
  private generateStressDeadlockEvent(params: any): SimulationEvent {
    const ringSize = params.ringSize || 4
    const agentList = Array.from(this.agents.values())
    const deadlockAgents = agentList.slice(0, ringSize).map(a => a.name)
    
    console.log(`🔒 压力测试: 死锁场景 (${ringSize}个Agent循环等待)`)
    console.log(`   涉及Agent: ${deadlockAgents.join(' → ')} → ${deadlockAgents[0]}`)
    
    return {
      id: uuidv4(),
      type: 'stress_test',
      timestamp: Date.now(),
      tick: this.currentTick,
      data: {
        testType: 'deadlock',
        ringSize: ringSize,
        agents: deadlockAgents,
        description: '循环等待资源导致死锁',
        expectedImpact: '涉及Agent全部阻塞，需要死锁检测和解除'
      }
    }
  }

  // 压力测试8: 内存泄漏
  private generateStressMemoryLeakEvent(params: any): SimulationEvent {
    const growthRate = params.growthRate || 0.1
    
    console.log(`💾 压力测试: 内存压力 (增长率: ${(growthRate * 100).toFixed(0)}%/tick)`)
    
    return {
      id: uuidv4(),
      type: 'stress_test',
      timestamp: Date.now(),
      tick: this.currentTick,
      data: {
        testType: 'memory_leak',
        growthRate: growthRate,
        description: '模拟内存资源持续消耗',
        expectedImpact: '内存不足，触发GC频繁，最终OOM'
      }
    }
  }
}
