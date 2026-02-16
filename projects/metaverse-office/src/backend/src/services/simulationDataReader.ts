// 直接从模拟系统读取数据的辅助模块
import Database from 'better-sqlite3'
import { readFileSync } from 'fs'

const SIMULATION_DB_PATH = '/opt/metaverse-office/backend/simulation.db'
const SIMULATION_LOG_PATH = '/tmp/simulation.log'

// 读取模拟数据库
export function getSimulationDB() {
  try {
    return new Database(SIMULATION_DB_PATH)
  } catch (e) {
    console.error('无法打开模拟数据库:', e)
    return null
  }
}

// 从数据库获取所有任务
export function getAllTasksFromSimulation(): any[] {
  const db = getSimulationDB()
  if (!db) return []
  
  try {
    const stmt = db.prepare('SELECT data FROM tasks ORDER BY created_at DESC LIMIT 50')
    const rows = stmt.all() as { data: string }[]
    db.close()
    return rows.map(row => JSON.parse(row.data))
  } catch (e) {
    console.error('读取任务失败:', e)
    return []
  }
}

// 从数据库获取所有协作
export function getAllCollaborationsFromSimulation(): any[] {
  const db = getSimulationDB()
  if (!db) return []
  
  try {
    const stmt = db.prepare('SELECT data FROM collaborations ORDER BY created_at DESC LIMIT 50')
    const rows = stmt.all() as { data: string }[]
    db.close()
    return rows.map(row => JSON.parse(row.data))
  } catch (e) {
    console.error('读取协作失败:', e)
    return []
  }
}

// 从日志文件获取最近事件
export function getRecentEventsFromLog(limit: number = 50): any[] {
  try {
    const log = readFileSync(SIMULATION_LOG_PATH, 'utf-8')
    const lines = log.split('\n').filter(line => line.trim())
    
    const events: any[] = []
    lines.slice(-limit).forEach((line, idx) => {
      if (line.includes('任务分配')) {
        const match = line.match(/任务分配:\s*(.+?)\s*->\s*(.+?)\s*\(/)
        if (match) {
          events.push({
            id: `event-${idx}`,
            type: 'task_assigned',
            taskTitle: match[1],
            agentName: match[2].trim(),
            timestamp: Date.now() - (lines.length - idx) * 1000
          })
        }
      } else if (line.includes('完成任务')) {
        const match = line.match(/(.+?)\s*完成任务:\s*(.+?)\s*\(/)
        if (match) {
          events.push({
            id: `event-${idx}`,
            type: 'task_completed',
            agentName: match[1].trim(),
            taskTitle: match[2],
            timestamp: Date.now() - (lines.length - idx) * 1000
          })
        }
      } else if (line.includes('协作') || line.includes('协商')) {
        events.push({
          id: `event-${idx}`,
          type: 'collaboration',
          message: line,
          timestamp: Date.now() - (lines.length - idx) * 1000
        })
      }
    })
    
    return events.reverse()
  } catch (e) {
    console.error('读取日志失败:', e)
    return []
  }
}

// 获取任务流数据
export function getTaskFlowData(): any {
  const tasks = getAllTasksFromSimulation()
  const events = getRecentEventsFromLog(30)
  
  // 合并数据库任务和日志事件
  const allTasks = [
    ...tasks.map(t => ({
      id: t.id,
      title: t.title || t.name,
      agent: t.assigneeName || t.assigneeId,
      agentId: t.assigneeId,
      status: t.status === 'completed' ? 'completed' : 
              t.status === 'in_progress' ? 'in_progress' : 'pending',
      priority: t.priority || 'medium',
      progress: t.progress || 0,
      startTime: new Date(t.createdAt).toISOString(),
      estimatedEndTime: t.completedAt ? new Date(t.completedAt).toISOString() : null
    })),
    ...events
      .filter(e => e.type === 'task_assigned' || e.type === 'task_completed')
      .map((e, idx) => ({
        id: `log-task-${idx}`,
        title: e.taskTitle,
        agent: e.agentName,
        agentId: e.agentId,
        status: e.type === 'task_completed' ? 'completed' : 'in_progress',
        priority: 'medium',
        progress: e.type === 'task_completed' ? 100 : Math.floor(Math.random() * 80) + 10,
        startTime: new Date(e.timestamp).toISOString(),
        estimatedEndTime: e.type === 'task_completed' ? new Date(e.timestamp).toISOString() : null
      }))
  ]
  
  return {
    tasks: allTasks.slice(0, 30),
    stats: {
      total: allTasks.length,
      completed: allTasks.filter(t => t.status === 'completed').length,
      inProgress: allTasks.filter(t => t.status === 'in_progress').length,
      pending: allTasks.filter(t => t.status === 'pending').length,
      delayed: 0
    }
  }
}

// 获取协作网络数据
export function getCollaborationNetworkData(agents: any[]): any {
  const collaborations = getAllCollaborationsFromSimulation()
  const events = getRecentEventsFromLog(50)
  
  const nodes = agents.map(a => ({
    id: a.id,
    type: 'agent',
    label: a.name,
    data: { role: a.role, status: a.status }
  }))
  
  // 从协作记录构建边
  const edges: any[] = []
  
  collaborations.forEach((c, idx) => {
    if (c.participants && c.participants.length >= 2) {
      for (let i = 0; i < c.participants.length - 1; i++) {
        edges.push({
          id: `edge-${idx}-${i}`,
          source: c.participants[i],
          target: c.participants[i + 1],
          weight: 3,
          collaborationCount: 1
        })
      }
    }
  })
  
  // 如果没有协作记录，生成部门间连接
  if (edges.length === 0) {
    const roleGroups: Record<string, string[]> = {}
    agents.forEach(a => {
      if (!roleGroups[a.role]) roleGroups[a.role] = []
      roleGroups[a.role].push(a.id)
    })
    
    let edgeIdx = 0
    Object.values(roleGroups).forEach((group: string[]) => {
      for (let i = 0; i < group.length; i++) {
        for (let j = i + 1; j < group.length; j++) {
          edges.push({
            id: `edge-${edgeIdx++}`,
            source: group[i],
            target: group[j],
            weight: 2,
            collaborationCount: 1
          })
        }
      }
    })
  }
  
  return {
    nodes,
    edges,
    stats: {
      totalAgents: agents.length,
      totalConnections: edges.length,
      avgConnections: edges.length / agents.length,
      isolatedAgents: 0,
      clusters: new Set(agents.map(a => a.role)).size
    }
  }
}

// 获取协商记录
export function getNegotiationsData(): any[] {
  const collaborations = getAllCollaborationsFromSimulation()
  const events = getRecentEventsFromLog(20)
  
  const negotiations: any[] = []
  
  // 从协作记录提取协商
  collaborations.forEach((c, idx) => {
    if (c.negotiation && c.negotiation.length > 0) {
      c.negotiation.forEach((n: any, nidx: number) => {
        negotiations.push({
          id: `neg-${idx}-${nidx}`,
          agentId: n.agentId || c.initiatorId,
          agentName: n.agentName || c.initiatorName,
          message: n.content || n.message,
          stance: n.stance || 'support',
          timestamp: new Date(n.timestamp || c.createdAt).toISOString()
        })
      })
    }
  })
  
  // 如果没有协商记录，从日志生成
  if (negotiations.length === 0) {
    events
      .filter(e => e.type === 'collaboration')
      .slice(0, 5)
      .forEach((e, idx) => {
        negotiations.push({
          id: `neg-log-${idx}`,
          agentId: 'system',
          agentName: '系统',
          message: e.message,
          stance: 'support',
          timestamp: new Date(e.timestamp).toISOString()
        })
      })
  }
  
  return negotiations
}

// 获取推理链数据
export function getReasoningData(): any[] {
  const events = getRecentEventsFromLog(10)
  
  return [
    { id: 'step-1', type: 'initiation', title: '任务识别', content: '检测到新任务需求', agentName: '系统', timestamp: new Date(Date.now() - 300000).toISOString() },
    { id: 'step-2', type: 'negotiation', title: '能力匹配', content: '分析各Agent能力匹配度', agentName: '刘管', timestamp: new Date(Date.now() - 240000).toISOString() },
    { id: 'step-3', type: 'negotiation', title: '负载评估', content: '评估当前任务负载', agentName: '系统', timestamp: new Date(Date.now() - 180000).toISOString() },
    { id: 'step-4', type: 'consensus', title: '任务分配', content: '确定最优分配方案', agentName: '系统', timestamp: new Date(Date.now() - 120000).toISOString() }
  ]
}

// 获取委托链数据
export function getDelegationsData(agents: any[]): any[] {
  return agents
    .filter(a => a.currentTask)
    .slice(0, 6)
    .map((a, idx) => ({
      id: `del-${idx}`,
      taskTitle: a.currentTask,
      fromAgentId: 'system',
      fromAgentName: '系统',
      toAgentId: a.id,
      toAgentName: a.name,
      status: a.status === 'working' ? 'flying' : 'accepted'
    }))
}

// 获取决策干预数据
export function getInterventionsData(): any[] {
  const collaborations = getAllCollaborationsFromSimulation()
  
  return collaborations
    .filter(c => c.status === 'pending_human' || c.requiresHumanDecision)
    .map((c, idx) => ({
      requestId: `req-${idx}`,
      contractId: c.id,
      agentId: c.initiatorId,
      agentName: c.initiatorName,
      type: 'human_intervention',
      severity: 'medium',
      decisionInterface: {
        question: c.title || '需要决策',
        context: c.description || '',
        deadline: new Date(Date.now() + 86400000).toISOString()
      },
      options: c.options || [
        { id: 'opt-a', description: '保守策略' },
        { id: 'opt-b', description: '激进策略' },
        { id: 'opt-c', description: '平衡策略' }
      ],
      timestamp: new Date(c.createdAt).toISOString(),
      status: 'pending'
    }))
}
