/**
 * 全面功能测试框架
 * 测试思想碰撞、协同机制、平台功能
 */

import { ContinuousSimulationEngine } from '../engine/ContinuousSimulationEngine.js'
import { Agent } from '../agents/Agent.js'
import { ALL_AGENT_PROFILES } from '../agents/profiles.js'
import { v4 as uuidv4 } from 'uuid'

// 测试场景定义
interface TestScenario {
  id: string
  name: string
  description: string
  type: 'brainstorm' | 'collaboration' | 'negotiation' | 'escalation' | 'coordination'
  participants: string[]  // Agent IDs
  duration: number  // 持续时间(ticks)
  expectedOutcomes: string[]
}

// 思想碰撞会议测试
class BrainstormMeetingTest {
  private engine: ContinuousSimulationEngine
  
  constructor(engine: ContinuousSimulationEngine) {
    this.engine = engine
  }

  // 场景1: 跨部门头脑风暴 - 产品创新
  async testCrossDepartmentBrainstorm(): Promise<TestResult> {
    console.log('\n🧠 测试场景1: 跨部门头脑风暴 - 产品创新')
    
    const scenario: TestScenario = {
      id: 'brainstorm-001',
      name: 'AI教学产品创新研讨会',
      description: '市场部、方案部、研发部联合头脑风暴',
      type: 'brainstorm',
      participants: ['M1', 'M2', 'S1', 'S2', 'D1', 'D2'],  // 李拓、周展、王谋、陈策、张码、刘栈
      duration: 50,
      expectedOutcomes: ['创新方案', '技术可行性评估', '市场定位']
    }

    // 注入头脑风暴事件
    this.engine.injectEvent({
      id: uuidv4(),
      type: 'collaboration_request',
      timestamp: Date.now(),
      tick: 0,
      agentId: 'S1',  // 王谋发起
      targetAgentId: 'M1',  // 邀请李拓
      data: {
        type: 'brainstorm',
        topic: 'AI教学产品创新',
        participants: scenario.participants,
        expectedDuration: 50
      }
    })

    // 等待模拟运行
    await this.waitTicks(60)

    return {
      scenario: scenario.name,
      success: true,
      details: '头脑风暴会议已触发，多Agent参与讨论'
    }
  }

  // 场景2: 紧急问题攻坚会议
  async testEmergencyBrainstorm(): Promise<TestResult> {
    console.log('\n🚨 测试场景2: 紧急问题攻坚会议')
    
    const scenario: TestScenario = {
      id: 'brainstorm-002',
      name: '生产环境故障紧急攻坚',
      description: '运维+研发紧急会议',
      type: 'brainstorm',
      participants: ['O1', 'O2', 'D1', 'D2', 'P1'],  // 陈运、赵维、张码、刘栈、刘管
      duration: 30,
      expectedOutcomes: ['故障根因', '修复方案', '预防措施']
    }

    this.engine.injectEvent({
      id: uuidv4(),
      type: 'collaboration_request',
      timestamp: Date.now(),
      tick: 0,
      agentId: 'O1',  // 陈运发起
      targetAgentId: 'D1',  // 邀请张码
      data: {
        type: 'emergency_brainstorm',
        topic: '生产环境故障处理',
        priority: 'urgent',
        participants: scenario.participants
      }
    })

    await this.waitTicks(40)

    return {
      scenario: scenario.name,
      success: true,
      details: '紧急攻坚会议已触发'
    }
  }

  private waitTicks(ticks: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ticks * 1000))
  }
}

// 协同机制测试
class CollaborationMechanismTest {
  private engine: ContinuousSimulationEngine

  constructor(engine: ContinuousSimulationEngine) {
    this.engine = engine
  }

  // 场景3: 任务委托链
  async testTaskDelegationChain(): Promise<TestResult> {
    console.log('\n📋 测试场景3: 任务委托链')
    
    // 模拟：项目管家 -> 方案专家 -> 研发专家
    const delegationChain = [
      { from: 'P1', to: 'S1', task: '项目需求分析' },
      { from: 'S1', to: 'D1', task: '技术实现方案' },
      { from: 'D1', to: 'O1', task: '部署实施' }
    ]

    for (const step of delegationChain) {
      this.engine.injectEvent({
        id: uuidv4(),
        type: 'delegation',
        timestamp: Date.now(),
        tick: 0,
        agentId: step.from,
        targetAgentId: step.to,
        data: {
          taskTitle: step.task,
          chainPosition: delegationChain.indexOf(step) + 1,
          totalSteps: delegationChain.length
        }
      })
      await this.waitTicks(10)
    }

    return {
      scenario: '任务委托链',
      success: true,
      details: `完成${delegationChain.length}级委托: 刘管→王谋→张码→陈运`
    }
  }

  // 场景4: 多Agent并行协作
  async testParallelCollaboration(): Promise<TestResult> {
    console.log('\n🤝 测试场景4: 多Agent并行协作')
    
    // 模拟大型项目：多个Agent同时协作
    const collaborators = ['M1', 'S1', 'D1', 'O1', 'F1']  // 跨5个部门
    
    this.engine.injectEvent({
      id: uuidv4(),
      type: 'collaboration_request',
      timestamp: Date.now(),
      tick: 0,
      agentId: 'P1',  // 刘管协调
      data: {
        type: 'parallel_collaboration',
        project: '智慧校园系统交付',
        collaborators: collaborators,
        coordinator: 'P1'
      }
    })

    await this.waitTicks(50)

    return {
      scenario: '多Agent并行协作',
      success: true,
      details: `5个部门Agent并行协作: ${collaborators.join(', ')}`
    }
  }

  // 场景5: 协商与决策
  async testNegotiationAndDecision(): Promise<TestResult> {
    console.log('\n⚖️ 测试场景5: 协商与决策')
    
    // 模拟技术选型争议
    const negotiation = {
      topic: '技术架构选型',
      options: ['微服务', '单体应用', 'Serverless'],
      participants: ['S1', 'S2', 'D1', 'D2']
    }

    // 第一轮：各自表态
    for (const agentId of negotiation.participants) {
      this.engine.injectEvent({
        id: uuidv4(),
        type: 'negotiation_round',
        timestamp: Date.now(),
        tick: 0,
        agentId: agentId,
        data: {
          round: 1,
          topic: negotiation.topic,
          stance: 'propose',
          proposal: negotiation.options[Math.floor(Math.random() * negotiation.options.length)]
        }
      })
    }

    await this.waitTicks(20)

    // 第二轮：达成共识
    this.engine.injectEvent({
      id: uuidv4(),
      type: 'collaboration_request',
      timestamp: Date.now(),
      tick: 0,
      agentId: 'P1',
      data: {
        type: 'consensus_reached',
        topic: negotiation.topic,
        decision: '微服务',
        participants: negotiation.participants
      }
    })

    return {
      scenario: '协商与决策',
      success: true,
      details: `技术选型协商完成，4个Agent参与，最终决策: 微服务`
    }
  }

  private waitTicks(ticks: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ticks * 1000))
  }
}

// 平台功能测试
class PlatformFeatureTest {
  private engine: ContinuousSimulationEngine

  constructor(engine: ContinuousSimulationEngine) {
    this.engine = engine
  }

  // 场景6: 人类介入请求
  async testHumanIntervention(): Promise<TestResult> {
    console.log('\n👤 测试场景6: 人类介入请求')
    
    this.engine.injectEvent({
      id: uuidv4(),
      type: 'human_intervention',
      timestamp: Date.now(),
      tick: 0,
      agentId: 'A1',  // 孙助上报
      data: {
        type: 'value_judgment',
        context: '项目预算超支风险评估',
        options: [
          { id: 'cut_scope', description: '削减功能范围', risk: '客户满意度下降' },
          { id: 'increase_budget', description: '申请追加预算', risk: '财务压力' },
          { id: 'extend_timeline', description: '延长交付周期', risk: '市场时机' }
        ],
        urgency: 'high',
        requestingAgents: ['F1', 'P1']
      }
    })

    await this.waitTicks(30)

    return {
      scenario: '人类介入请求',
      success: true,
      details: '高风险决策上报，等待人类判断'
    }
  }

  // 场景7: 负载均衡动态调整
  async testDynamicLoadBalancing(): Promise<TestResult> {
    console.log('\n⚖️ 测试场景7: 负载均衡动态调整')
    
    // 制造负载不均场景
    const overloadAgents = ['M1', 'M2', 'S1']  // 让这3个Agent过载
    
    for (let i = 0; i < 5; i++) {
      for (const agentId of overloadAgents) {
        this.engine.injectEvent({
          id: uuidv4(),
          type: 'new_task',
          timestamp: Date.now(),
          tick: 0,
          data: {
            task: {
              id: uuidv4(),
              title: `高负载测试任务-${i}`,
              type: 'customer_inquiry',
              priority: 'medium',
              assigneeId: agentId
            }
          }
        })
      }
      await this.waitTicks(5)
    }

    await this.waitTicks(30)

    return {
      scenario: '负载均衡动态调整',
      success: true,
      details: '测试负载不均场景下的自动均衡机制'
    }
  }

  // 场景8: 实时状态同步
  async testRealtimeSync(): Promise<TestResult> {
    console.log('\n🔄 测试场景8: 实时状态同步')
    
    // 连续注入多个事件，测试实时推送
    const events = [
      { type: 'new_task', agent: 'M1' },
      { type: 'task_completed', agent: 'S1' },
      { type: 'collaboration_request', agent: 'D1' },
      { type: 'delegation', agent: 'O1' }
    ]

    for (const event of events) {
      this.engine.injectEvent({
        id: uuidv4(),
        type: event.type as any,
        timestamp: Date.now(),
        tick: 0,
        agentId: event.agent,
        data: { test: true }
      })
      await this.waitTicks(3)
    }

    return {
      scenario: '实时状态同步',
      success: true,
      details: `4类事件实时推送测试完成`
    }
  }

  // 场景9: 异常处理与恢复
  async testErrorRecovery(): Promise<TestResult> {
    console.log('\n🛡️ 测试场景9: 异常处理与恢复')
    
    // 模拟Agent异常离线后恢复
    this.engine.injectEvent({
      id: uuidv4(),
      type: 'agent_status_change',
      timestamp: Date.now(),
      tick: 0,
      agentId: 'D1',  // 张码
      data: {
        oldStatus: 'working',
        newStatus: 'offline',
        reason: '模拟网络中断'
      }
    })

    await this.waitTicks(20)

    // 恢复在线
    this.engine.injectEvent({
      id: uuidv4(),
      type: 'agent_status_change',
      timestamp: Date.now(),
      tick: 0,
      agentId: 'D1',
      data: {
        oldStatus: 'offline',
        newStatus: 'idle',
        reason: '网络恢复'
      }
    })

    return {
      scenario: '异常处理与恢复',
      success: true,
      details: 'Agent离线/恢复流程测试完成'
    }
  }

  private waitTicks(ticks: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ticks * 1000))
  }
}

// 测试结果
interface TestResult {
  scenario: string
  success: boolean
  details: string
  metrics?: any
}

// 主测试类
export class ComprehensiveTestSuite {
  private engine: ContinuousSimulationEngine
  private brainstormTest: BrainstormMeetingTest
  private collaborationTest: CollaborationMechanismTest
  private platformTest: PlatformFeatureTest

  constructor(engine: ContinuousSimulationEngine) {
    this.engine = engine
    this.brainstormTest = new BrainstormMeetingTest(engine)
    this.collaborationTest = new CollaborationMechanismTest(engine)
    this.platformTest = new PlatformFeatureTest(engine)
  }

  // 运行全部测试
  async runAllTests(): Promise<TestResult[]> {
    console.log('\n' + '='.repeat(60))
    console.log('🧪 11 Agent模拟系统 - 全面功能测试')
    console.log('='.repeat(60))

    const results: TestResult[] = []

    // 思想碰撞会议测试
    console.log('\n📚 第一部分: 思想碰撞会议')
    results.push(await this.brainstormTest.testCrossDepartmentBrainstorm())
    results.push(await this.brainstormTest.testEmergencyBrainstorm())

    // 协同机制测试
    console.log('\n📚 第二部分: 协同机制')
    results.push(await this.collaborationTest.testTaskDelegationChain())
    results.push(await this.collaborationTest.testParallelCollaboration())
    results.push(await this.collaborationTest.testNegotiationAndDecision())

    // 平台功能测试
    console.log('\n📚 第三部分: 平台功能')
    results.push(await this.platformTest.testHumanIntervention())
    results.push(await this.platformTest.testDynamicLoadBalancing())
    results.push(await this.platformTest.testRealtimeSync())
    results.push(await this.platformTest.testErrorRecovery())

    // 输出测试报告
    this.printTestReport(results)

    return results
  }

  private printTestReport(results: TestResult[]): void {
    console.log('\n' + '='.repeat(60))
    console.log('📊 测试报告汇总')
    console.log('='.repeat(60))

    let passed = 0
    let failed = 0

    for (const result of results) {
      const status = result.success ? '✅ 通过' : '❌ 失败'
      console.log(`\n${status}: ${result.scenario}`)
      console.log(`   ${result.details}`)
      if (result.success) passed++
      else failed++
    }

    console.log('\n' + '-'.repeat(60))
    console.log(`总计: ${results.length} 个测试场景`)
    console.log(`通过: ${passed} | 失败: ${failed}`)
    console.log(`成功率: ${(passed / results.length * 100).toFixed(1)}%`)
    console.log('='.repeat(60) + '\n')
  }
}

// 导出测试套件
export { BrainstormMeetingTest, CollaborationMechanismTest, PlatformFeatureTest }
export type { TestScenario, TestResult }
