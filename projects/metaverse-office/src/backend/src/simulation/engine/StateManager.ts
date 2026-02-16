/**
 * 状态管理器 - 持久化存储
 * 使用 SQLite 存储所有状态
 */

import Database from 'better-sqlite3'
import { Agent } from '../agents/Agent.js'
import { Task, CollaborationContract, SystemState } from '../types.js'

export class StateManager {
  private db: Database.Database
  private dbPath: string

  constructor(dbPath: string = './simulation.db') {
    this.dbPath = dbPath
    this.db = new Database(dbPath)
    this.initTables()
  }

  // 初始化数据库表
  private initTables(): void {
    // Agent状态表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS agent_states (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `)

    // 任务表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        status TEXT NOT NULL,
        assignee_id TEXT,
        created_at INTEGER NOT NULL,
        completed_at INTEGER
      )
    `)

    // 协作契约表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS collaborations (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        completed_at INTEGER
      )
    `)

    // 系统状态表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS system_state (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `)

    // 事件日志表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS event_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        data TEXT NOT NULL,
        tick INTEGER NOT NULL,
        timestamp INTEGER NOT NULL
      )
    `)

    console.log('✅ 数据库表初始化完成')
  }

  // ==================== Agent 状态管理 ====================

  saveAgentState(agent: Agent): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO agent_states (id, data, updated_at)
      VALUES (?, ?, ?)
    `)
    stmt.run(
      agent.id,
      JSON.stringify(agent.toJSON()),
      Date.now()
    )
  }

  saveAllAgentStates(agents: Agent[]): void {
    const insert = this.db.prepare(`
      INSERT OR REPLACE INTO agent_states (id, data, updated_at)
      VALUES (?, ?, ?)
    `)
    
    const transaction = this.db.transaction((agentsList: Agent[]) => {
      for (const agent of agentsList) {
        insert.run(agent.id, JSON.stringify(agent.toJSON()), Date.now())
      }
    })
    
    transaction(agents)
  }

  loadAllAgentStates(): any[] {
    const stmt = this.db.prepare('SELECT data FROM agent_states')
    const rows = stmt.all() as { data: string }[]
    return rows.map(row => JSON.parse(row.data))
  }

  // ==================== 任务管理 ====================

  saveTask(task: Task): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO tasks 
      (id, data, status, assignee_id, created_at, completed_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    stmt.run(
      task.id,
      JSON.stringify(task),
      task.status,
      task.assigneeId || null,
      task.createdAt,
      task.completedAt || null
    )
  }

  loadTasksByStatus(status: string): Task[] {
    const stmt = this.db.prepare('SELECT data FROM tasks WHERE status = ?')
    const rows = stmt.all(status) as { data: string }[]
    return rows.map(row => JSON.parse(row.data))
  }

  loadAllTasks(): Task[] {
    const stmt = this.db.prepare('SELECT data FROM tasks')
    const rows = stmt.all() as { data: string }[]
    return rows.map(row => JSON.parse(row.data))
  }

  getTaskStats(): { total: number; completed: number; pending: number; active: number } {
    const total = this.db.prepare('SELECT COUNT(*) as count FROM tasks').get() as { count: number }
    const completed = this.db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status = 'completed'").get() as { count: number }
    const pending = this.db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status = 'pending'").get() as { count: number }
    const active = this.db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status IN ('assigned', 'in_progress', 'review')").get() as { count: number }
    
    return {
      total: total.count,
      completed: completed.count,
      pending: pending.count,
      active: active.count
    }
  }

  // ==================== 协作契约管理 ====================

  saveCollaboration(contract: CollaborationContract): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO collaborations
      (id, data, status, created_at, completed_at)
      VALUES (?, ?, ?, ?, ?)
    `)
    stmt.run(
      contract.id,
      JSON.stringify(contract),
      contract.status,
      contract.createdAt,
      contract.completedAt || null
    )
  }

  loadCollaborationsByStatus(status: string): CollaborationContract[] {
    const stmt = this.db.prepare('SELECT data FROM collaborations WHERE status = ?')
    const rows = stmt.all(status) as { data: string }[]
    return rows.map(row => JSON.parse(row.data))
  }

  // ==================== 系统状态管理 ====================

  saveSystemState(state: Partial<SystemState>): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO system_state (key, value, updated_at)
      VALUES (?, ?, ?)
    `)
    
    for (const [key, value] of Object.entries(state)) {
      stmt.run(key, JSON.stringify(value), Date.now())
    }
  }

  loadSystemState(): Partial<SystemState> {
    const stmt = this.db.prepare('SELECT key, value FROM system_state')
    const rows = stmt.all() as { key: string; value: string }[]
    
    const state: any = {}
    for (const row of rows) {
      state[row.key] = JSON.parse(row.value)
    }
    return state
  }

  // ==================== 事件日志 ====================

  logEvent(type: string, data: any, tick: number): void {
    const stmt = this.db.prepare(`
      INSERT INTO event_log (type, data, tick, timestamp)
      VALUES (?, ?, ?, ?)
    `)
    stmt.run(type, JSON.stringify(data), tick, Date.now())
  }

  getRecentEvents(limit: number = 100): any[] {
    const stmt = this.db.prepare(`
      SELECT * FROM event_log
      ORDER BY timestamp DESC
      LIMIT ?
    `)
    return stmt.all(limit) as any[]
  }

  // ==================== 工具方法 ====================

  clearAll(): void {
    this.db.exec('DELETE FROM agent_states')
    this.db.exec('DELETE FROM tasks')
    this.db.exec('DELETE FROM collaborations')
    this.db.exec('DELETE FROM system_state')
    this.db.exec('DELETE FROM event_log')
    console.log('🗑️ 数据库已清空')
  }

  close(): void {
    this.db.close()
  }

  // 获取数据库统计
  getStats(): { agents: number; tasks: number; collaborations: number; events: number } {
    return {
      agents: (this.db.prepare('SELECT COUNT(*) as count FROM agent_states').get() as { count: number }).count,
      tasks: (this.db.prepare('SELECT COUNT(*) as count FROM tasks').get() as { count: number }).count,
      collaborations: (this.db.prepare('SELECT COUNT(*) as count FROM collaborations').get() as { count: number }).count,
      events: (this.db.prepare('SELECT COUNT(*) as count FROM event_log').get() as { count: number }).count
    }
  }
}
