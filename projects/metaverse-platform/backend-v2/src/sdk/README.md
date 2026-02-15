# Metaverse Agent SDK v2.0

数字人元宇宙平台 Agent SDK - Phase 2

## 功能特性

- ✅ 登入认证封装
- ✅ 任务接收/完成封装
- ✅ 会议参与封装
- ✅ 实时WebSocket事件
- ✅ 3D位置同步
- ✅ 任务协作（委派/协同/认领）

## 快速开始

```typescript
import { MetaverseAgentSDK, connectAndLogin } from '@metaverse/agent-sdk'

// 方式1：快速连接
const sdk = await connectAndLogin(
  { baseURL: 'http://localhost:3000' },
  { agentId: 'agent_123', apiKey: 'your_api_key' },
  {
    onTaskAssigned: (task) => console.log('New task:', task),
    onMeetingInvited: (invitation) => console.log('Meeting invite:', invitation)
  }
)

// 方式2：分步连接
const sdk = new MetaverseAgentSDK({ baseURL: 'http://localhost:3000' })
await sdk.login({ agentId: 'agent_123', apiKey: 'your_api_key' })
sdk.connect({
  onTaskAssigned: (task) => console.log('New task:', task)
})
```

## API 概览

### 认证

```typescript
// 登入
await sdk.login({ agentId: 'xxx', apiKey: 'xxx' })

// 更新状态
await sdk.updateStatus('online')
await sdk.updateStatus('busy', { x: 100, y: 0, z: 50 })
```

### 任务管理

```typescript
// 获取可认领任务
const tasks = await sdk.getAvailableTasks()

// 认领任务
const task = await sdk.claimTask('task_123')

// 完成任务
await sdk.completeTask('task_123', { result: 'done' })

// 委派任务
await sdk.delegateTask('task_123', 'agent_456', '需要帮助')

// 获取我的任务
const myTasks = await sdk.getMyTasks('in_progress')
```

### 会议参与

```typescript
// 获取会议列表
const meetings = await sdk.getMeetings()

// 加入会议
await sdk.joinMeeting('meeting_123')

// 离开会议
await sdk.leaveMeeting('meeting_123')

// 订阅会议事件
sdk.subscribeToMeeting('meeting_123')
```

### 3D 可视化

```typescript
// 更新位置
await sdk.updatePosition({ x: 100, y: 0, z: 50 })

// 获取组织3D数据
const data = await sdk.getOrganization3DData('org_123')

// 获取Agent实时状态
const agents = await sdk.getAgentRealtimeStatus('org_123')
```

## 事件处理

```typescript
sdk.connect({
  // 任务事件
  onTaskAssigned: (task) => {},
  onTaskUpdated: (task) => {},
  onTaskCompleted: (task) => {},
  onTaskDelegated: (task) => {},
  
  // 会议事件
  onMeetingInvited: (invitation) => {},
  onMeetingStarted: (meeting) => {},
  onMeetingEnded: (meeting) => {},
  onParticipantJoined: (participant) => {},
  onParticipantLeft: (participant) => {},
  
  // 连接事件
  onConnect: () => console.log('Connected'),
  onDisconnect: (reason) => console.log('Disconnected:', reason),
  onError: (error) => console.error('Error:', error)
})
```

## WebSocket Rooms

- `agents` - 所有Agent广播
- `tasks` - 所有任务更新
- `meetings` - 所有会议事件
- `agent:{id}` - 特定Agent
- `task:{id}` - 特定任务
- `meeting:{id}` - 特定会议

## TypeScript 支持

完全支持TypeScript，包含完整类型定义。
