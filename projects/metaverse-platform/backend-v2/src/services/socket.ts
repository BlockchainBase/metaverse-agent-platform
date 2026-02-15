import type { Server, Socket } from 'socket.io'
import { 
  join3DSceneRoom, 
  leave3DSceneRoom, 
  broadcastAgentStatusTo3D,
  broadcastTaskFlowTo3D 
} from '../controllers/metaverse3DController.js'

export const setupSocketHandlers = (io: Server): void => {
  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id)

    // 加入房间
    socket.on('join', (room: string) => {
      socket.join(room)
      console.log(`Socket ${socket.id} joined room: ${room}`)
      socket.emit('joined', { room, socketId: socket.id })
    })

    // 离开房间
    socket.on('leave', (room: string) => {
      socket.leave(room)
      console.log(`Socket ${socket.id} left room: ${room}`)
      socket.emit('left', { room, socketId: socket.id })
    })

    // ==================== Phase 4: 3D场景房间管理 ====================
    
    // 加入3D场景房间
    socket.on('3d:scene:join', (data: { organizationId: string; sceneType?: string }) => {
      join3DSceneRoom(socket, data)
      
      // 发送初始场景数据
      socket.emit('3d:scene:connected', {
        organizationId: data.organizationId,
        sceneType: data.sceneType || 'office',
        timestamp: new Date().toISOString()
      })
    })

    // 离开3D场景房间
    socket.on('3d:scene:leave', (data: { organizationId: string }) => {
      leave3DSceneRoom(socket, data)
    })

    // Agent位置更新（3D场景专用）
    socket.on('3d:agent:position', (data: { 
      agentId: string; 
      organizationId: string;
      position: { x: number; y: number; z: number };
      rotation?: { x: number; y: number; z: number }
    }) => {
      // 广播到同组织的其他客户端
      socket.to(`3d:scene:${data.organizationId}`).emit('3d:agent:position:update', {
        agentId: data.agentId,
        position: data.position,
        rotation: data.rotation,
        timestamp: new Date().toISOString()
      })
    })

    // 任务流订阅
    socket.on('3d:task:subscribe', (data: { 
      organizationId: string;
      processInstanceId?: string 
    }) => {
      socket.join(`3d:tasks:${data.organizationId}`)
      if (data.processInstanceId) {
        socket.join(`3d:process:${data.processInstanceId}`)
      }
      socket.emit('3d:task:subscribed', {
        organizationId: data.organizationId,
        processInstanceId: data.processInstanceId
      })
    })

    // 协作网络订阅
    socket.on('3d:network:subscribe', (data: { organizationId: string }) => {
      socket.join(`3d:network:${data.organizationId}`)
      socket.emit('3d:network:subscribed', {
        organizationId: data.organizationId
      })
    })

    // Agent状态更新
    socket.on('agent:status', (data: { agentId: string; status: string; position?: { x: number; y: number; z: number } }) => {
      socket.to(`agent:${data.agentId}`).emit('agent:status:update', data)
      socket.to('agents').emit('agent:status:update', data)
    })

    // Agent位置更新（3D场景）
    socket.on('agent:position', (data: { agentId: string; position: { x: number; y: number; z: number } }) => {
      socket.to('agents').emit('agent:position:update', data)
    })

    // 任务更新
    socket.on('task:update', (data: { taskId: string; status: string }) => {
      socket.to(`task:${data.taskId}`).emit('task:update', data)
      socket.to('tasks').emit('task:update', data)
    })

    // 任务状态变更
    socket.on('task:status', (data: { taskId: string; status: string; agentId?: string }) => {
      socket.to(`task:${data.taskId}`).emit('task:status:changed', data)
      socket.to('tasks').emit('task:status:changed', data)
      
      // 通知相关Agent
      if (data.agentId) {
        socket.to(`agent:${data.agentId}`).emit('task:status:changed', data)
      }
    })

    // 会议相关事件
    socket.on('meeting:join', (data: { meetingId: string; agentId: string }) => {
      socket.join(`meeting:${data.meetingId}`)
      socket.to(`meeting:${data.meetingId}`).emit('meeting:participant:joined', {
        meetingId: data.meetingId,
        agentId: data.agentId,
        socketId: socket.id
      })
    })

    socket.on('meeting:leave', (data: { meetingId: string; agentId: string }) => {
      socket.leave(`meeting:${data.meetingId}`)
      socket.to(`meeting:${data.meetingId}`).emit('meeting:participant:left', {
        meetingId: data.meetingId,
        agentId: data.agentId
      })
    })

    socket.on('meeting:speak', (data: { meetingId: string; agentId: string; duration: number }) => {
      socket.to(`meeting:${data.meetingId}`).emit('meeting:participant:speak', {
        meetingId: data.meetingId,
        agentId: data.agentId,
        duration: data.duration
      })
    })

    // 3D场景中的交互
    socket.on('3d:interaction', (data: {
      type: 'proximity' | 'click' | 'hover'
      sourceId: string
      targetId?: string
      position?: { x: number; y: number; z: number }
    }) => {
      // 广播3D交互事件
      socket.to('3d:scene').emit('3d:interaction', {
        ...data,
        timestamp: new Date().toISOString()
      })
    })

    // 断开连接
    socket.on('disconnect', (reason) => {
      console.log('Client disconnected:', socket.id, 'Reason:', reason)
    })
  })
}

// 导出便捷函数用于服务器端发送事件
export const emitAgentStatus = (io: Server, agentId: string, status: string, data?: any) => {
  io.to(`agent:${agentId}`).emit('agent:status:update', { agentId, status, ...data })
  io.to('agents').emit('agent:status:update', { agentId, status, ...data })
}

export const emitAgentsListUpdate = (io: Server, data: any) => {
  io.to('agents').emit('agents:list:update', data)
}

export const emitTaskUpdate = (io: Server, taskId: string, status: string, data?: any) => {
  io.to(`task:${taskId}`).emit('task:update', { taskId, status, ...data })
  io.to('tasks').emit('task:update', { taskId, status, ...data })
}

export const emitTaskCreated = (io: Server, task: any) => {
  io.to('tasks').emit('task:created', task)
  if (task.assigneeId) {
    io.to(`agent:${task.assigneeId}`).emit('task:assigned', task)
  }
}

export const emitTaskCompleted = (io: Server, task: any) => {
  io.to(`task:${task.id}`).emit('task:completed', task)
  io.to('tasks').emit('task:completed', task)
  if (task.creatorId) {
    io.to(`agent:${task.creatorId}`).emit('task:completed', task)
  }
}

export const emitProcessInstanceUpdate = (io: Server, instanceId: string, status: string, data?: any) => {
  io.to(`process:${instanceId}`).emit('process:update', { instanceId, status, ...data })
  io.to('processes').emit('process:update', { instanceId, status, ...data })
}

export const emitMeetingUpdate = (io: Server, meetingId: string, event: string, data?: any) => {
  io.to(`meeting:${meetingId}`).emit(`meeting:${event}`, { meetingId, ...data })
}

export const emitSystemNotification = (io: Server, type: string, message: string, data?: any) => {
  io.emit('system:notification', { 
    type, 
    message, 
    timestamp: new Date().toISOString(), 
    ...data 
  })
}

// ==================== Phase 4: 3D场景专用事件发射器 ====================

// 发射Agent状态更新到3D场景
export const emitAgentStatusTo3D = (io: Server, organizationId: string, agentData: any) => {
  io.to(`3d:scene:${organizationId}`).emit('3d:agent:status', {
    ...agentData,
    timestamp: new Date().toISOString()
  })
}

// 发射任务流更新
export const emitTaskFlowTo3D = (io: Server, organizationId: string, taskData: any) => {
  io.to(`3d:tasks:${organizationId}`).emit('3d:task:flow:update', {
    ...taskData,
    timestamp: new Date().toISOString()
  })
}

// 发射协作网络更新
export const emitCollaborationNetworkTo3D = (io: Server, organizationId: string, networkData: any) => {
  io.to(`3d:network:${organizationId}`).emit('3d:network:update', {
    ...networkData,
    timestamp: new Date().toISOString()
  })
}

// 发射任务管道动画事件
export const emitTaskPipelineEvent = (io: Server, organizationId: string, event: {
  type: 'task_created' | 'task_assigned' | 'task_started' | 'task_completed' | 'task_transferred'
  taskId: string
  from?: string
  to?: string
  data?: any
}) => {
  io.to(`3d:scene:${organizationId}`).emit('3d:pipeline:event', {
    ...event,
    timestamp: new Date().toISOString()
  })
}

// 发射会议室状态更新
export const emitMeetingRoomUpdate = (io: Server, organizationId: string, meetingData: any) => {
  io.to(`3d:scene:${organizationId}`).emit('3d:meeting:update', {
    ...meetingData,
    timestamp: new Date().toISOString()
  })
}
