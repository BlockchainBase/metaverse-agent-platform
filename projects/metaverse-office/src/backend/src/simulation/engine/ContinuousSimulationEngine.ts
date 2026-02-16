/**
 * 持续运行模拟引擎
 * 核心控制逻辑
 */

import { Server as SocketIOServer, Socket } from 'socket.io'
import { createServer } from 'http'
import { Agent } from '../agents/Agent.js'
import { ALL_AGENT_PROFILES } from '../agents/profiles.js'
import { StateManager } from './StateManager.js'
import { ContinuousScenarioGenerator } from '../scenarios/ContinuousScenarioGenerator.js'
import { TaskAllocator } from '../tasks/TaskAllocator.js'
import {
  SimulationEvent,
  WebSocketMessage,
  SystemState,
  Task,
  CollaborationContract
} from '../types.js'

export class ContinuousSimulationEngine {
  // 核心组件
  private agents: Map<string, Agent> = new Map()
  private stateManager: StateManager
  private scenarioGen!: ContinuousScenarioGenerator
  private taskAllocator!: TaskAllocator
  private io: SocketIOServer | null = null
  private httpServer: ReturnType<typeof createServer> | null = null
  
  // 运行状态
  private isRunning: boolean = false
  private isPaused: boolean = false
  private currentTick: number = 0
  private tickInterval: NodeJS.Timeout | null = null
  private saveInterval: NodeJS.Timeout | null = null
  
  // 配置
  private config = {
    tickRate: 1000,      // 默认1秒1tick
    saveInterval: 30000, // 30秒持久化
    wsPort: 3002         // WebSocket端口
  }
  
  // 待处理队列
  private pendingTasks: Task[] = []
  private activeCollaborations: Map<string, CollaborationContract> = new Map()

  constructor() {
    this.stateManager = new StateManager('./simulation.db')
  }

  // ==================== 初始化 ====================

  async initialize(): Promise<void> {
    console.log('🚀 初始化11 Agent模拟系统...')

    // 1. 尝试恢复或创建Agent
    const savedStates = this.stateManager.loadAllAgentStates()
    
    if (savedStates.length >= 11) {
      // 恢复状态
      for (const state of savedStates) {
        const agent = Agent.fromJSON(state)
        this.agents.set(agent.id, agent)
      }
      console.log(`✅ 恢复 ${savedStates.length} 个Agent状态`)
    } else {
      // 首次启动，创建11个Agent
      await this.createInitialAgents()
    }

    // 2. 初始化组件
    this.scenarioGen = new ContinuousScenarioGenerator(this.agents)
    this.taskAllocator = new TaskAllocator(this.agents)

    // 3. 启动WebSocket服务
    await this.startWebSocketServer()

    // 4. 加载待处理任务
    this.pendingTasks = this.stateManager.loadTasksByStatus('pending')

    console.log('✅ 模拟系统初始化完成')
    console.log(`   Agent数量: ${this.agents.size}`)
    console.log(`   待处理任务: ${this.pendingTasks.length}`)
  }

  private async createInitialAgents(): Promise<void> {
    console.log('📝 创建初始11个Agent...')
    
    for (const profile of ALL_AGENT_PROFILES) {
      const agent = new Agent(profile)
      this.agents.set(agent.id, agent)
    }

    // 保存初始状态
    this.stateManager.saveAllAgentStates(Array.from(this.agents.values()))
    console.log('✅ 11个Agent已创建')
  }

  private async startWebSocketServer(): Promise<void> {
    this.httpServer = createServer()
    this.io = new SocketIOServer(this.httpServer, {
      cors: { origin: '*' }
    })
    
    this.io.on('connection', (socket: Socket) => {
      console.log('🔌 新的Socket连接:', socket.id)
      
      // 发送当前状态
      socket.emit('message', {
        type: 'system:connected',
        data: this.getSystemSnapshot()
      })

      socket.on('message', (message: any) => {
        this.handleSocketMessage(socket, message)
      })

      socket.on('disconnect', () => {
        console.log('🔌 Socket断开:', socket.id)
      })
    })
    
    this.httpServer.listen(this.config.wsPort, () => {
      console.log(`📡 Socket.IO服务启动: http://localhost:${this.config.wsPort}`)
    })
  }

  // ==================== 核心运行循环 ====================

  start(): void {
    if (this.isRunning) {
      console.log('⚠️ 模拟系统已在运行中')
      return
    }

    this.isRunning = true
    this.isPaused = false

    console.log('\n🚀 ================================')
    console.log('   11 Agent模拟系统启动')
    console.log('================================')
    console.log(`   Agent数量: ${this.agents.size}`)
    console.log(`   运行速度: ${this.config.tickRate}ms/tick`)
    console.log(`   WebSocket: ws://localhost:${this.config.wsPort}`)
    console.log('================================\n')

    // 启动主循环
    this.tickInterval = setInterval(() => {
      if (!this.isPaused) {
        this.runTick()
      }
    }, this.config.tickRate)

    // 启动定期持久化
    this.saveInterval = setInterval(() => {
      this.persistState()
    }, this.config.saveInterval)

    // 广播启动消息
    this.broadcast({
      type: 'system:started',
      timestamp: Date.now(),
      tick: this.currentTick,
      data: { agentCount: this.agents.size }
    })
  }

  stop(saveState: boolean = true): void {
    if (!this.isRunning) {
      console.log('⚠️ 模拟系统未在运行')
      return
    }

    this.isRunning = false
    this.isPaused = false

    // 清除定时器
    if (this.tickInterval) {
      clearInterval(this.tickInterval)
      this.tickInterval = null
    }
    if (this.saveInterval) {
      clearInterval(this.saveInterval)
      this.saveInterval = null
    }

    // 保存最终状态
    if (saveState) {
      this.persistState()
    }

    console.log('\n⏹️ ================================')
    console.log('   模拟系统已停止')
    console.log('================================\n')

    // 广播停止消息
    this.broadcast({
      type: 'system:stopped',
      timestamp: Date.now()
    })
  }

  pause(): void {
    if (!this.isRunning || this.isPaused) return
    
    this.isPaused = true
    console.log('⏸️ 模拟系统已暂停')
    
    this.broadcast({
      type: 'system:paused',
      timestamp: Date.now()
    })
  }

  resume(): void {
    if (!this.isRunning || !this.isPaused) return
    
    this.isPaused = false
    console.log('▶️ 模拟系统已恢复')
    
    this.broadcast({
      type: 'system:resumed',
      timestamp: Date.now()
    })
  }

  // ==================== 核心Tick逻辑 ====================

  private runTick(): void {
    this.currentTick++
    const now = Date.now()

    const events: SimulationEvent[] = []

    // 1. 生成新场景/任务
    const newEvents = this.scenarioGen.generate(this.currentTick)
    events.push(...newEvents)

    // 2. 处理事件
    for (const event of events) {
      this.handleEvent(event)
    }

    // 3. 分配待处理任务
    this.processPendingTasks()

    // 4. 更新所有Agent
    for (const agent of this.agents.values()) {
      const agentEvents = agent.update()
      for (const event of agentEvents) {
        this.handleEvent(event)
      }
    }

    // 5. 更新协作契约
    this.updateCollaborations()

    // 6. 每10tick广播一次状态 (减少网络负载)
    if (this.currentTick % 10 === 0) {
      this.broadcastStateUpdate()
    }

    // 7. 记录系统状态
    if (this.currentTick % 100 === 0) {
      this.logSystemStatus()
    }
  }

  // ==================== 事件处理 ====================

  private handleEvent(event: SimulationEvent): void {
    // 记录事件
    this.stateManager.logEvent(event.type, event.data, this.currentTick)

    switch (event.type) {
      case 'new_task':
        if (event.data?.task) {
          this.pendingTasks.push(event.data.task)
          this.stateManager.saveTask(event.data.task)
        }
        break

      case 'task_completed':
        this.handleTaskCompleted(event)
        break

      case 'collaboration_request':
        this.handleCollaborationRequest(event)
        break

      case 'delegation':
        this.handleDelegation(event)
        break

      case 'human_intervention':
        this.handleHumanIntervention(event)
        break
    }

    // 广播事件
    this.broadcast({
      type: 'event:update' as any,
      timestamp: event.timestamp,
      tick: this.currentTick,
      data: { eventType: event.type, ...event.data }
    })
  }

  private processPendingTasks(): void {
    if (this.pendingTasks.length === 0) return

    // 尝试分配待处理任务
    const stillPending: Task[] = []

    for (const task of this.pendingTasks) {
      const agent = this.taskAllocator.allocate(task)
      if (agent && agent.assignTask(task)) {
        task.status = 'assigned'
        this.stateManager.saveTask(task)
        
        // 广播分配
        this.broadcast({
          type: 'task:assigned',
          timestamp: Date.now(),
          tick: this.currentTick,
          data: {
            taskId: task.id,
            taskTitle: task.title,
            agentId: agent.id,
            agentName: agent.name
          }
        })
      } else {
        stillPending.push(task)
      }
    }

    this.pendingTasks = stillPending
  }

  private handleTaskCompleted(event: SimulationEvent): void {
    // 更新统计
    // 可以触发后续任务
  }

  private handleCollaborationRequest(event: SimulationEvent): void {
    // 创建协作契约并保存到数据库
    const collaborationData = event.data || {}
    const contract: any = {
      id: `collab-${event.id || Date.now()}`,
      project_id: collaborationData.project || collaborationData.projectId || 'project-001',
      type: collaborationData.type || 'parallel_collaboration',
      status: 'active',
      initiator_id: collaborationData.initiatorId || collaborationData.initiator || 'P1',
      created_at: Date.now(),
      updated_at: Date.now(),
      data: JSON.stringify({
        ...collaborationData,
        timestamp: event.timestamp,
        tick: this.currentTick
      })
    }
    
    // 保存到数据库
    try {
      this.stateManager.saveCollaboration(contract)
      console.log(`🤝 创建协作契约: ${contract.id} - ${contract.project_id}`)
      
      // 广播契约创建事件
      this.broadcast({
        type: 'collaboration:started',
        timestamp: Date.now(),
        tick: this.currentTick,
        data: contract
      })
    } catch (err) {
      console.error('❌ 保存协作契约失败:', err)
    }
  }

  private handleDelegation(event: SimulationEvent): void {
    // 处理任务委托
  }

  private handleHumanIntervention(event: SimulationEvent): void {
    // 需要人类介入
    console.log('🚨 需要人类介入:', event.data)
    
    this.broadcast({
      type: 'human:intervention_required',
      timestamp: Date.now(),
      data: event.data
    })
  }

  private updateCollaborations(): void {
    // 更新进行中的协作契约
  }

  // ==================== 状态管理 ====================

  private persistState(): void {
    this.stateManager.saveAllAgentStates(Array.from(this.agents.values()))
    
    // 保存系统状态
    this.stateManager.saveSystemState({
      tick: this.currentTick,
      isRunning: this.isRunning,
      isPaused: this.isPaused
    })

    if (this.currentTick % 100 === 0) {
      console.log(`💾 状态已持久化 (Tick: ${this.currentTick})`)
    }
  }

  private broadcastStateUpdate(): void {
    const state = this.getSystemSnapshot()
    
    this.broadcast({
      type: 'state:update',
      timestamp: Date.now(),
      tick: this.currentTick,
      data: state
    })
  }

  private getSystemSnapshot(): any {
    return {
      tick: this.currentTick,
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      agents: Array.from(this.agents.values()).map(agent => ({
        id: agent.id,
        name: agent.name,
        role: agent.role,
        status: agent.state.status,
        workload: parseFloat(agent.state.workload.toFixed(1)),
        energy: parseFloat(agent.state.energy.toFixed(1)),
        position: agent.position,
        currentTask: agent.currentTask ? {
          id: agent.currentTask.id,
          title: agent.currentTask.title,
          progress: parseFloat(agent.currentTask.progress.toFixed(1))
        } : null
      })),
      stats: {
        activeTasks: Array.from(this.agents.values()).filter(a => a.currentTask).length,
        pendingTasks: this.pendingTasks.length,
        completedTasks: Array.from(this.agents.values()).reduce((sum, a) => sum + a.stats.tasksCompleted, 0),
        activeCollaborations: this.activeCollaborations.size
      }
    }
  }

  private logSystemStatus(): void {
    const stats = this.stateManager.getStats()
    console.log(`📊 Tick ${this.currentTick} | Agents: ${this.agents.size} | Tasks: ${stats.tasks} | Collaborations: ${stats.collaborations}`)
  }

  // ==================== WebSocket通信 ====================

  private broadcast(message: WebSocketMessage): void {
    if (!this.io) return
    this.io.emit('message', message)
  }

  private handleSocketMessage(socket: Socket, message: any): void {
    try {
      // 处理前端发送的控制命令
      switch (message.command) {
        case 'get_state':
          socket.emit('message', {
            type: 'state:full',
            data: this.getSystemSnapshot()
          })
          break
        
        case 'inject_task':
          // 手动注入任务
          if (message.task) {
            this.pendingTasks.push(message.task)
            console.log(`📥 手动注入任务: ${message.task.title}`)
          }
          break
        
        case 'trigger_scenario':
          // 手动触发场景
          if (message.scenarioId) {
            const event = this.scenarioGen.triggerScenario(message.scenarioId)
            if (event) {
              this.handleEvent(event)
            }
          }
          break
      }
    } catch (e) {
      console.error('Socket消息处理错误:', e)
    }
  }

  // ==================== 公共API ====================

  getStatus(): { running: boolean; paused: boolean; tick: number; agentCount: number } {
    return {
      running: this.isRunning,
      paused: this.isPaused,
      tick: this.currentTick,
      agentCount: this.agents.size
    }
  }

  setSpeed(multiplier: number): void {
    this.config.tickRate = Math.max(100, Math.min(10000, 1000 / multiplier))
    
    if (this.isRunning) {
      // 重启定时器以应用新速度
      if (this.tickInterval) {
        clearInterval(this.tickInterval)
        this.tickInterval = setInterval(() => {
          if (!this.isPaused) this.runTick()
        }, this.config.tickRate)
      }
    }
    
    console.log(`⚡ 运行速度已调整为 ${multiplier}x (${this.config.tickRate}ms/tick)`)
  }

  injectEvent(event: Partial<SimulationEvent>): void {
    const fullEvent: SimulationEvent = {
      id: event.id || `manual-${Date.now()}`,
      type: event.type || 'new_task',
      timestamp: Date.now(),
      tick: this.currentTick,
      ...event
    }
    this.handleEvent(fullEvent)
  }

  getStats(): any {
    const dbStats = this.stateManager.getStats()
    return {
      ...dbStats,
      tick: this.currentTick,
      isRunning: this.isRunning,
      agentStats: Array.from(this.agents.values()).map(a => ({
        id: a.id,
        name: a.name,
        tasksCompleted: a.stats.tasksCompleted,
        collaborationsInitiated: a.stats.collaborationsInitiated
      }))
    }
  }
}
