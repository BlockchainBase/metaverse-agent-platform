import { io } from '../index'

export const emitAgentStatus = (agentId: string, status: string, data?: any) => {
  io.to(`agent:${agentId}`).emit('agent:status:update', { agentId, status, ...data })
  io.to('agents').emit('agent:status:update', { agentId, status, ...data })
}

export const emitAgentsListUpdate = (data: any) => {
  io.to('agents').emit('agents:list:update', data)
}

export const emitTaskUpdate = (taskId: string, status: string, data?: any) => {
  io.to(`task:${taskId}`).emit('task:update', { taskId, status, ...data })
  io.to('tasks').emit('task:update', { taskId, status, ...data })
}

export const emitTaskCreated = (task: any) => {
  io.to('tasks').emit('task:created', task)
  if (task.assigneeId) {
    io.to(`agent:${task.assigneeId}`).emit('task:assigned', task)
  }
}

export const emitTaskCompleted = (task: any) => {
  io.to(`task:${task.id}`).emit('task:completed', task)
  io.to('tasks').emit('task:completed', task)
  if (task.creatorId) {
    io.to(`agent:${task.creatorId}`).emit('task:completed', task)
  }
}

export const emitProcessInstanceUpdate = (instanceId: string, status: string, data?: any) => {
  io.to(`process:${instanceId}`).emit('process:update', { instanceId, status, ...data })
  io.to('processes').emit('process:update', { instanceId, status, ...data })
}

export const emitSystemNotification = (type: string, message: string, data?: any) => {
  io.emit('system:notification', { type, message, timestamp: new Date().toISOString(), ...data })
}
