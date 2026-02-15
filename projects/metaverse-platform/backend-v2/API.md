# Phase 2 API 文档

## 任务协作增强

### 委派模式 API

```
POST /api/tasks/collaboration/:taskId/delegate
```

请求体:
```json
{
  "delegateToId": "agent_456",
  "reason": "需要专业支持",
  "delegatedById": "agent_123"
}
```

### 任务认领 API

```
GET  /api/tasks/collaboration/available       # 获取可认领任务
POST /api/tasks/collaboration/:taskId/claim   # 认领任务
POST /api/tasks/collaboration/:taskId/unclaim # 放弃任务
```

认领请求:
```json
{
  "agentId": "agent_123"
}
```

### 任务转派 API

```
POST /api/tasks/collaboration/:taskId/transfer
```

请求体:
```json
{
  "transferToId": "agent_789",
  "reason": "工作负载调整",
  "transferredById": "agent_123"
}
```

### 协同模式 API

```
POST   /api/tasks/collaboration/:taskId/collaborators              # 添加协作者
DELETE /api/tasks/collaboration/:taskId/collaborators/:id          # 移除协作者
PATCH  /api/tasks/collaboration/:taskId/collaborators/:id/role     # 更新角色
```

添加协作者:
```json
{
  "agentId": "agent_456",
  "role": "member"  // member | leader | reviewer
}
```

### 任务依赖 API

```
GET    /api/tasks/collaboration/:taskId/dependencies         # 获取依赖
POST   /api/tasks/collaboration/:taskId/dependencies         # 添加依赖
DELETE /api/tasks/collaboration/:taskId/dependencies/:id     # 移除依赖
GET    /api/tasks/collaboration/:taskId/chain                # 获取任务链
```

添加依赖:
```json
{
  "dependsOnTaskId": "task_001",
  "dependencyType": "blocks"  // blocks | requires | relates
}
```

---

## 会议系统

### 会议管理

```
GET    /api/meetings                           # 列表
POST   /api/meetings                           # 创建
GET    /api/meetings/:id                       # 详情
PUT    /api/meetings/:id                       # 更新
DELETE /api/meetings/:id                       # 删除
```

创建会议:
```json
{
  "title": "项目评审会议",
  "description": "Phase 2 进度评审",
  "type": "review",
  "scheduledAt": "2026-02-20T10:00:00Z",
  "duration": 60,
  "organizationId": "org_123",
  "hostId": "agent_001",
  "participantIds": ["agent_002", "agent_003"],
  "roomId": "room_1",
  "roomPosition": {"x": 100, "y": 0, "z": 50}
}
```

### 会议状态

```
POST /api/meetings/:id/start   # 开始会议
POST /api/meetings/:id/end     # 结束会议
```

### 参与者管理

```
POST /api/meetings/:id/join      # 加入会议
POST /api/meetings/:id/leave     # 离开会议
POST /api/meetings/:id/invite    # 邀请参与者
```

邀请:
```json
{
  "agentIds": ["agent_004", "agent_005"]
}
```

### 议程管理

```
POST   /api/meetings/:id/agenda              # 添加议程
PUT    /api/meetings/:id/agenda/:itemId      # 更新议程
DELETE /api/meetings/:id/agenda/:itemId      # 删除议程
POST   /api/meetings/:id/agenda/reorder      # 重新排序
```

添加议程:
```json
{
  "title": "进度汇报",
  "description": "各模块进展",
  "duration": 15,
  "ownerId": "agent_001"
}
```

### 决议与任务生成

```
POST /api/meetings/:id/resolutions                         # 创建决议
POST /api/meetings/:id/resolutions/:id/generate-task       # 生成任务
```

创建决议:
```json
{
  "title": "增加测试覆盖率",
  "content": "单元测试覆盖率需达到80%",
  "type": "action_item",
  "assigneeId": "agent_002"
}
```

---

## 3D可视化数据接口

### Agent状态

```
GET  /api/visualization/agents/status             # 获取实时状态
PUT  /api/visualization/agents/:id/position       # 更新位置
```

更新位置:
```json
{
  "x": 100,
  "y": 0,
  "z": 50
}
```

### 任务流数据

```
GET /api/visualization/tasks/flow      # 任务流程图数据
GET /api/visualization/tasks/timeline  # 任务时间线
```

### 协作网络

```
GET /api/visualization/collaboration/network        # 协作关系网络
```

### 组织3D数据

```
GET /api/visualization/organizations/:id/3d-data    # 完整3D场景数据
```

### 活动流

```
GET  /api/visualization/activities         # 获取活动流
POST /api/visualization/activities         # 记录活动
GET  /api/visualization/activities/heatmap # 活动热力图
```

记录活动:
```json
{
  "agentId": "agent_001",
  "type": "task_completed",
  "data": {"taskId": "task_123"}
}
```

---

## WebSocket 事件

### 连接

```javascript
const socket = io('ws://localhost:3000')
socket.emit('join', 'agent:agent_123')
socket.emit('join', 'task:task_456')
socket.emit('join', 'meeting:meeting_789')
```

### 事件类型

| 事件 | 说明 | 数据 |
|------|------|------|
| `task:assigned` | 任务分配 | Task |
| `task:claimed` | 任务认领 | Task |
| `task:delegated` | 任务委派 | Task |
| `task:transferred` | 任务转派 | Task |
| `task:completed` | 任务完成 | Task |
| `task:collaborator:joined` | 协作者加入 | {taskId, agentId} |
| `task:collaborator:left` | 协作者离开 | {taskId, agentId} |
| `meeting:invited` | 会议邀请 | MeetingInvitation |
| `meeting:started` | 会议开始 | Meeting |
| `meeting:ended` | 会议结束 | Meeting |
| `meeting:participant:joined` | 参与者加入 | Participant |
| `meeting:participant:left` | 参与者离开 | Participant |
| `meeting:resolution:created` | 决议创建 | Resolution |
| `agent:status:update` | 状态更新 | {agentId, status} |

---

## Agent SDK 快速参考

```typescript
import { MetaverseAgentSDK } from '@metaverse/agent-sdk'

const sdk = new MetaverseAgentSDK({ baseURL: 'http://localhost:3000' })

// 认证
await sdk.login({ agentId: 'xxx', apiKey: 'xxx' })

// 任务
const tasks = await sdk.getAvailableTasks()
const task = await sdk.claimTask('task_123')
await sdk.completeTask('task_123', { result: 'done' })

// 会议
await sdk.joinMeeting('meeting_456')
await sdk.leaveMeeting('meeting_456')

// 3D位置
await sdk.updatePosition({ x: 100, y: 0, z: 50 })

// WebSocket事件
sdk.connect({
  onTaskAssigned: (task) => console.log('New task:', task),
  onMeetingInvited: (inv) => console.log('Meeting:', inv)
})
```
