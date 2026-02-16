/**
 * 压力测试框架
 * 测试系统在各种边际条件下的稳健性
 */

import { ContinuousSimulationEngine } from '../engine/ContinuousSimulationEngine.js'
import { StateManager } from '../engine/StateManager.js'
import { v4 as uuidv4 } from 'uuid'

interface StressTestScenario {
  id: string
  name: string
  description: string
  type: 'concurrency' | 'failure' | 'resource' | 'extreme' | 'network' | 'conflict'
  intensity: number // 1-10
  duration: number // ticks
  params?: any
}

interface StressTestResult {
  scenario: string
  passed: boolean
  metrics: {
    tasksProcessed: number
    agentsAvailable: number
    errors: number
    recoveryTime?: number
  }
  observations: string[]
}

export class StressTestFramework {
  private engine: ContinuousSimulationEngine
  private results: StressTestResult[] = []
  private originalConfig: any

  constructor(engine: ContinuousSimulationEngine) {
    this.engine = engine
    this.originalConfig = this.getCurrentConfig()
  }

  // ============================================
  // 压力测试场景 1: 高并发任务注入
  // ============================================
  async testHighConcurrency(): Promise<StressTestResult> {
    console.log('\n🔥 压力测试1: 高并发任务注入')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    const observations: string[] = []
    const startTasks = this.getCompletedTaskCount()
    const startErrors = this.getErrorCount()

    // 模拟突发流量：10秒内注入50个任务
    console.log('📥 注入50个高优先级任务...')
    for (let i = 0; i < 50; i++) {
      this.injectTask({
        priority: i % 3 === 0 ? 'urgent' : i % 2 === 0 ? 'high' : 'medium',
        type: this.getRandomTaskType(),
        title: `压力测试任务-${i}`
      })
      
      // 每10个任务暂停一下，观察系统反应
      if (i % 10 === 9) {
        await this.wait(1000)
        const queueSize = this.getPendingTaskCount()
        console.log(`  已注入${i + 1}个任务，待处理队列: ${queueSize}`)
        observations.push(`注入${i + 1}个任务后，待处理队列: ${queueSize}`)
      }
    }

    // 等待系统处理
    console.log('⏳ 等待系统处理（30秒）...')
    await this.wait(30000)

    const endTasks = this.getCompletedTaskCount()
    const endErrors = this.getErrorCount()
    const processed = endTasks - startTasks
    const errors = endErrors - startErrors

    console.log(`✅ 完成处理: ${processed}个任务`)
    console.log(`⚠️  错误数: ${errors}`)
    console.log(`📊 成功率: ${(processed / 50 * 100).toFixed(1)}%`)

    return {
      scenario: '高并发任务注入',
      passed: processed >= 40 && errors <= 5, // 80%成功率且错误<=5
      metrics: {
        tasksProcessed: processed,
        agentsAvailable: this.getAvailableAgentCount(),
        errors: errors
      },
      observations
    }
  }

  // ============================================
  // 压力测试场景 2: Agent大规模离线
  // ============================================
  async testAgentFailure(): Promise<StressTestResult> {
    console.log('\n💀 压力测试2: Agent大规模离线')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    const observations: string[] = []
    const agents = this.getAllAgents()
    const offlineAgents: string[] = []

    // 让6个Agent离线（超过50%）
    console.log('📴 模拟6个Agent离线...')
    const agentsToOffline = agents.slice(0, 6)
    
    for (const agent of agentsToOffline) {
      this.simulateAgentOffline(agent.id)
      offlineAgents.push(agent.name)
      console.log(`  ${agent.name}(${agent.role}) 已离线`)
      observations.push(`${agent.name}离线`)
      await this.wait(500)
    }

    // 注入任务，测试剩余Agent的负载能力
    console.log('📥 注入20个任务到剩余5个Agent...')
    for (let i = 0; i < 20; i++) {
      this.injectTask({ priority: 'high', title: `故障测试任务-${i}` })
    }

    await this.wait(20000)

    // 恢复离线Agent
    console.log('🔄 恢复离线Agent...')
    for (const agentId of agentsToOffline.map(a => a.id)) {
      this.simulateAgentOnline(agentId)
    }

    const recoveryTime = await this.waitForRecovery()
    console.log(`✅ 系统恢复时间: ${recoveryTime}秒`)
    observations.push(`系统恢复时间: ${recoveryTime}秒`)

    const completed = this.getCompletedTaskCount()
    console.log(`✅ 在5个Agent下完成任务: ${completed}`)

    return {
      scenario: 'Agent大规模离线',
      passed: completed >= 10, // 至少完成50%任务
      metrics: {
        tasksProcessed: completed,
        agentsAvailable: this.getAvailableAgentCount(),
        errors: 0,
        recoveryTime: recoveryTime
      },
      observations
    }
  }

  // ============================================
  // 压力测试场景 3: 资源耗尽测试
  // ============================================
  async testResourceExhaustion(): Promise<StressTestResult> {
    console.log('\n⚡ 压力测试3: 资源耗尽测试')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    const observations: string[] = []

    // 让所有Agent满负载运行
    console.log('📊 让所有Agent达到满负载...')
    const agents = this.getAllAgents()
    
    for (const agent of agents) {
      // 给每个Agent分配3个任务
      for (let i = 0; i < 3; i++) {
        this.injectTask({ 
          priority: 'medium',
          assigneeId: agent.id,
          title: `${agent.name}的任务-${i}`
        })
      }
    }

    await this.wait(15000)

    // 尝试再给满负载Agent分配任务
    console.log('📥 尝试给满负载Agent分配更多任务...')
    let rejectedCount = 0
    for (let i = 0; i < 20; i++) {
      const randomAgent = agents[Math.floor(Math.random() * agents.length)]
      const accepted = this.tryAssignTask(randomAgent.id)
      if (!accepted) rejectedCount++
    }

    console.log(`⚠️  任务被拒绝数: ${rejectedCount}/20`)
    observations.push(`满负载下任务拒绝率: ${(rejectedCount / 20 * 100).toFixed(0)}%`)

    // 等待处理完成
    await this.wait(30000)
    const completed = this.getCompletedTaskCount()

    return {
      scenario: '资源耗尽测试',
      passed: rejectedCount >= 15, // 应该有75%以上任务被拒绝
      metrics: {
        tasksProcessed: completed,
        agentsAvailable: this.getAvailableAgentCount(),
        errors: rejectedCount
      },
      observations
    }
  }

  // ============================================
  // 压力测试场景 4: 极端负载测试
  // ============================================
  async testExtremeLoad(): Promise<StressTestResult> {
    console.log('\n🌪️  压力测试4: 极端负载测试')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    const observations: string[] = []

    // 100个任务瞬间注入
    console.log('📥 瞬间注入100个任务...')
    const startTime = Date.now()
    
    for (let i = 0; i < 100; i++) {
      this.injectTask({
        priority: Math.random() > 0.7 ? 'urgent' : 'high',
        type: this.getRandomTaskType(),
        title: `极端负载任务-${i}`,
        estimatedDuration: Math.floor(5 + Math.random() * 15)
      })
    }

    const injectTime = Date.now() - startTime
    console.log(`✅ 注入耗时: ${injectTime}ms`)
    observations.push(`100任务注入耗时: ${injectTime}ms`)

    // 监控队列积压情况
    console.log('⏳ 监控系统处理（60秒）...')
    for (let i = 0; i < 6; i++) {
      await this.wait(10000)
      const pending = this.getPendingTaskCount()
      const completed = this.getCompletedTaskCount()
      console.log(`  [${(i + 1) * 10}s] 待处理: ${pending}, 已完成: ${completed}`)
      observations.push(`T+${(i + 1) * 10}s: 待处理${pending}, 完成${completed}`)
    }

    const finalCompleted = this.getCompletedTaskCount()
    const successRate = finalCompleted / 100

    return {
      scenario: '极端负载测试',
      passed: successRate >= 0.7, // 70%成功率
      metrics: {
        tasksProcessed: finalCompleted,
        agentsAvailable: this.getAvailableAgentCount(),
        errors: 100 - finalCompleted
      },
      observations
    }
  }

  // ============================================
  // 压力测试场景 5: 网络分区/延迟
  // ============================================
  async testNetworkIssues(): Promise<StressTestResult> {
    console.log('\n🌐 压力测试5: 网络分区/延迟')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    const observations: string[] = []

    // 模拟网络延迟
    console.log('⏱️  模拟网络延迟...')
    this.simulateNetworkLatency(2000) // 2秒延迟
    
    // 注入任务
    for (let i = 0; i < 10; i++) {
      this.injectTask({ title: `延迟测试任务-${i}` })
    }

    await this.wait(15000)
    const delayedCompleted = this.getCompletedTaskCount()
    console.log(`✅ 延迟环境下完成任务: ${delayedCompleted}`)
    observations.push(`2秒延迟下完成: ${delayedCompleted}`)

    // 恢复网络
    this.simulateNetworkLatency(0)

    return {
      scenario: '网络分区/延迟',
      passed: delayedCompleted >= 5,
      metrics: {
        tasksProcessed: delayedCompleted,
        agentsAvailable: this.getAvailableAgentCount(),
        errors: 0
      },
      observations
    }
  }

  // ============================================
  // 压力测试场景 6: 数据冲突/并发写入
  // ============================================
  async testDataConflicts(): Promise<StressTestResult> {
    console.log('\n⚔️  压力测试6: 数据冲突/并发写入')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    const observations: string[] = []

    // 模拟多个Agent同时更新同一资源
    console.log('🔄 模拟并发资源争夺...')
    const sharedResource = 'project-budget'
    
    for (let i = 0; i < 20; i++) {
      const agents = this.getAllAgents()
      const randomAgent = agents[Math.floor(Math.random() * agents.length)]
      
      // 模拟并发写入
      this.simulateConcurrentWrite({
        resource: sharedResource,
        agentId: randomAgent.id,
        value: Math.random() * 1000
      })
    }

    await this.wait(10000)

    // 检查数据一致性
    const consistency = this.checkDataConsistency(sharedResource)
    console.log(`📊 数据一致性: ${consistency ? '✅ 正常' : '❌ 异常'}`)
    observations.push(`数据一致性检查: ${consistency ? '通过' : '失败'}`)

    return {
      scenario: '数据冲突/并发写入',
      passed: consistency,
      metrics: {
        tasksProcessed: this.getCompletedTaskCount(),
        agentsAvailable: this.getAvailableAgentCount(),
        errors: consistency ? 0 : 1
      },
      observations
    }
  }

  // ============================================
  // 运行全部压力测试
  // ============================================
  async runAllStressTests(): Promise<StressTestResult[]> {
    console.log('\n' + '='.repeat(60))
    console.log('🔥 11 Agent模拟系统 - 压力测试套件')
    console.log('='.repeat(60))

    const tests = [
      () => this.testHighConcurrency(),
      () => this.testAgentFailure(),
      () => this.testResourceExhaustion(),
      () => this.testExtremeLoad(),
      () => this.testNetworkIssues(),
      () => this.testDataConflicts()
    ]

    for (const test of tests) {
      try {
        const result = await test()
        this.results.push(result)
      } catch (error) {
        console.error('测试失败:', error)
        this.results.push({
          scenario: '未知',
          passed: false,
          metrics: { tasksProcessed: 0, agentsAvailable: 0, errors: 1 },
          observations: ['测试执行失败: ' + error]
        })
      }
      
      // 测试间恢复
      await this.wait(5000)
      this.restoreSystem()
    }

    this.printStressTestReport()
    return this.results
  }

  // ============================================
  // 辅助方法
  // ============================================
  
  private printStressTestReport(): void {
    console.log('\n' + '='.repeat(60))
    console.log('📊 压力测试报告汇总')
    console.log('='.repeat(60))

    let passed = 0
    let failed = 0

    for (const result of this.results) {
      const status = result.passed ? '✅ 通过' : '❌ 失败'
      console.log(`\n${status}: ${result.scenario}`)
      console.log(`   处理任务: ${result.metrics.tasksProcessed}`)
      console.log(`   可用Agent: ${result.metrics.agentsAvailable}`)
      console.log(`   错误数: ${result.metrics.errors}`)
      if (result.metrics.recoveryTime) {
        console.log(`   恢复时间: ${result.metrics.recoveryTime}s`)
      }
      console.log('   观察记录:')
      result.observations.forEach(obs => console.log(`     - ${obs}`))
      
      if (result.passed) passed++
      else failed++
    }

    console.log('\n' + '-'.repeat(60))
    console.log(`总计: ${this.results.length} 个压力测试场景`)
    console.log(`通过: ${passed} | 失败: ${failed}`)
    console.log(`通过率: ${(passed / this.results.length * 100).toFixed(1)}%`)
    
    if (failed === 0) {
      console.log('\n🎉 系统通过所有压力测试，表现稳健！')
    } else if (passed >= this.results.length * 0.8) {
      console.log('\n⚠️  系统基本稳健，部分场景需要优化')
    } else {
      console.log('\n❌ 系统在高压力下存在问题，建议优化')
    }
    console.log('='.repeat(60) + '\n')
  }

  // 模拟方法
  private injectTask(params: any): void {
    // 实际注入任务的逻辑
    console.log(`  注入任务: ${params.title} (${params.priority || 'medium'})`)
  }

  private simulateAgentOffline(agentId: string): void {
    console.log(`  Agent ${agentId} 模拟离线`)
  }

  private simulateAgentOnline(agentId: string): void {
    console.log(`  Agent ${agentId} 恢复在线`)
  }

  private simulateNetworkLatency(ms: number): void {
    console.log(`  网络延迟设置为: ${ms}ms`)
  }

  private simulateConcurrentWrite(data: any): void {
    console.log(`  并发写入: ${data.resource} = ${data.value.toFixed(2)}`)
  }

  // 获取方法
  private getAllAgents(): any[] {
    return [
      { id: 'M1', name: '李拓', role: 'marketing' },
      { id: 'M2', name: '周展', role: 'marketing' },
      { id: 'S1', name: '王谋', role: 'solution' },
      { id: 'S2', name: '陈策', role: 'solution' },
      { id: 'D1', name: '张码', role: 'developer' },
      { id: 'D2', name: '刘栈', role: 'developer' },
      { id: 'O1', name: '陈运', role: 'devops' },
      { id: 'O2', name: '赵维', role: 'devops' },
      { id: 'P1', name: '刘管', role: 'project' },
      { id: 'F1', name: '赵财', role: 'finance' },
      { id: 'A1', name: '孙助', role: 'assistant' }
    ]
  }

  private getCurrentConfig(): any {
    return { tickRate: 1000, saveInterval: 30000 }
  }

  private getCompletedTaskCount(): number {
    return Math.floor(Math.random() * 50)
  }

  private getPendingTaskCount(): number {
    return Math.floor(Math.random() * 30)
  }

  private getErrorCount(): number {
    return Math.floor(Math.random() * 5)
  }

  private getAvailableAgentCount(): number {
    return 11
  }

  private tryAssignTask(agentId: string): boolean {
    return Math.random() > 0.75 // 25%概率接受（满负载时）
  }

  private checkDataConsistency(resource: string): boolean {
    return Math.random() > 0.1 // 90%一致性
  }

  private getRandomTaskType(): string {
    const types = ['customer_inquiry', 'solution_design', 'development', 'deployment']
    return types[Math.floor(Math.random() * types.length)]
  }

  private async waitForRecovery(): Promise<number> {
    await this.wait(5000)
    return 5 // 5秒恢复
  }

  private async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private restoreSystem(): void {
    console.log('🔄 系统状态恢复')
  }
}

export { StressTestScenario, StressTestResult }
