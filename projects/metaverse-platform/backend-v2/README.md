# 数字人元宇宙平台后端 v2.0 (Phase 2)

基于 Phase 1 扩展的协作功能后端，包含任务协作增强、会议系统、3D可视化数据接口和Agent SDK。

## 功能特性

### Phase 2 新增功能

#### 1. 任务协作增强
- ✅ **委派模式** - 上级→下级任务委派
- ✅ **协同模式** - 同级Agent联合任务
- ✅ **任务认领** - Agent主动认领任务
- ✅ **任务转派** - 任务转交给其他Agent
- ✅ **任务依赖** - 前置任务依赖关系

#### 2. 会议系统
- ✅ **会议CRUD** - 创建、管理会议
- ✅ **议程管理** - 会议议程增删改查
- ✅ **Agent参与** - 加入/离开会议
- ✅ **决议生成** - 会议决议和任务生成

#### 3. 3D可视化数据接口
- ✅ **Agent实时状态** - 位置和状态查询
- ✅ **任务流数据** - 任务流程可视化
- ✅ **协作网络** - Agent关系网络数据

#### 4. Agent SDK
- ✅ **认证封装** - 登入/登出
- ✅ **任务封装** - 接收/完成/委派
- ✅ **会议封装** - 参与/离开会议

## API 文档

### 基础信息

- 基础URL: `http://localhost:3000/api`
- WebSocket: `ws://localhost:3000`

### 认证

API使用Bearer Token认证：

```
Authorization: Bearer <token>
X-Agent-ID: <agent-id>
```

---

## API 端点

### 1. Agent API

```
GET    /api/agents                    # 获取Agent列表
GET    /api/agents/:id                # 获取Agent详情
POST   /api/agents                    # 创建Agent
PUT    /api/agents/:id                # 更新Agent
DELETE /api/agents/:id                # 删除Agent
PATCH  /api/agents/:id/status         # 更新Agent状态
```

### 2. 任务 API

#### 基础任务操作
```
GET    /api/tasks                     # 获取任务列表
GET    /api/tasks/:id                 # 获取任务详情
POST   /api/tasks                     # 创建任务
PUT    /api/tasks/:id                 # 更新任务
DELETE /api/tasks/:id                 # 删除任务
PATCH  /api/tasks/:id/status          # 更新任务状态
PATCH  /api/tasks/:id/assign          # 分配任务
```

#### 任务协作
```
POST   /api/tasks/collaboration/:taskId/delegate         # 委派任务
POST   /api/tasks/collaboration/:taskId/transfer         # 转派任务
POST   /api/tasks/collaboration/:taskId/claim            # 认领任务
POST   /api/tasks/collaboration/:taskId/unclaim          # 放弃任务
GET    /api/tasks/collaboration/available                # 获取可认领任务

POST   /api/tasks/collaboration/:taskId/collaborators                    # 添加协作者
DELETE /api/tasks/collaboration/:taskId/collaborators/:collaboratorId    # 移除协作者
PATCH  /api/tasks/collaboration/:taskId/collaborators/:collaboratorId/role # 更新协作者角色

POST   /api/tasks/collaboration/:taskId/dependencies       # 添加依赖
DELETE /api/tasks/collaboration/:taskId/dependencies/:id   # 移除依赖
GET    /api/tasks/collaboration/:taskId/dependencies       # 获取依赖列表
GET    /api/tasks/collaboration/:taskId/chain              # 获取任务链
```

### 3. 会议 API

```
GET    /api/meetings                     # 获取会议列表
POST   /api/meetings                     # 创建会议
GET    /api/meetings/:id                 # 获取会议详情
PUT    /api/meetings/:id                 # 更新会议
DELETE /api/meetings/:id                 # 删除会议

POST   /api/meetings/:id/start           # 开始会议
POST   /api/meetings/:id/end             # 结束会议

POST   /api/meetings/:id/join            # 加入会议
POST   /api/meetings/:id/leave           # 离开会议
POST   /api/meetings/:id/invite          # 邀请参与者

POST   /api/meetings/:id/agenda          # 添加议程项
PUT    /api/meetings/:id/agenda/:itemId  # 更新议程项
DELETE /api/meetings/:id/agenda/:itemId  # 删除议程项
POST   /api/meetings/:id/agenda/reorder  # 重新排序议程

POST   /api/meetings/:id/resolutions     # 创建决议
POST   /api/meetings/:id/resolutions/:id/generate-task  # 从决议生成任务

GET    /api/meetings/:id/stats           # 获取会议统计
```

### 4. 3D可视化 API

```
GET    /api/visualization/agents/status                    # 获取Agent实时状态
PUT    /api/visualization/agents/:id/position              # 更新Agent位置

GET    /api/visualization/tasks/flow                       # 获取任务流数据
GET    /api/visualization/tasks/timeline                   # 获取任务时间线

GET    /api/visualization/collaboration/network            # 获取协作网络

GET    /api/visualization/organizations/:id/3d-data        # 获取组织3D数据

GET    /api/visualization/activities                       # 获取活动流
POST   /api/visualization/activities                       # 记录活动
GET    /api/visualization/activities/heatmap               # 获取活动热力图
```

---

## WebSocket 事件

### 连接方式

```javascript
const socket = io('ws://localhost:3000')

// 加入房间
socket.emit('join', 'agent:agent_123')
socket.emit('join', 'task:task_456')
socket.emit('join', 'meeting:meeting_789')
```

### 事件列表

#### Agent 事件
- `agent:status:update` - Agent状态更新
- `agent:position:update` - Agent位置更新
- `agents:list:update` - Agent列表更新

#### 任务 事件
- `task:created` - 任务创建
- `task:updated` - 任务更新
- `task:assigned` - 任务分配
- `task:claimed` - 任务认领
- `task:delegated` - 任务委派
- `task:transferred` - 任务转派
- `task:completed` - 任务完成
- `task:collaborator:joined` - 协作者加入
- `task:collaborator:left` - 协作者离开
- `task:dependency:completed` - 依赖任务完成

#### 会议 事件
- `meeting:created` - 会议创建
- `meeting:updated` - 会议更新
- `meeting:started` - 会议开始
- `meeting:ended` - 会议结束
- `meeting:invited` - 被邀请参加会议
- `meeting:participant:joined` - 参与者加入
- `meeting:participant:left` - 参与者离开
- `meeting:agenda:updated` - 议程更新
- `meeting:resolution:created` - 决议创建
- `meeting:task:generated` - 从决议生成任务

#### 系统 事件
- `system:notification` - 系统通知

---

## Agent SDK 使用

### 安装

```bash
npm install @metaverse/agent-sdk
```

### 快速开始

```typescript
import { connectAndLogin } from '@metaverse/agent-sdk'

const sdk = await connectAndLogin(
  { baseURL: 'http://localhost:3000' },
  { agentId: 'agent_123', apiKey: 'your_api_key' },
  {
    onTaskAssigned: (task) => console.log('New task:', task.title),
    onMeetingInvited: (inv) => console.log('Meeting invite:', inv.title)
  }
)

// 认领并完成任务
const task = await sdk.claimTask('task_456')
await sdk.completeTask(task.id, { result: 'success' })

// 加入会议
await sdk.joinMeeting('meeting_789')
```

---

## 数据模型

### Task 扩展字段

```typescript
{
  collaborationMode: 'single' | 'collaborative' | 'delegated',
  delegatedById?: string,
  delegatedAt?: Date,
  delegationReason?: string,
  claimDeadline?: Date,
  transferHistory: Array<{
    type: 'delegation' | 'transfer' | 'claim',
    from?: string,
    to?: string,
    reason?: string,
    timestamp: string
  }>
}
```

### Meeting 模型

```typescript
{
  id: string,
  title: string,
  description?: string,
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled',
  type: 'discussion' | 'decision' | 'review' | 'sync',
  scheduledAt: Date,
  duration: number,
  roomId?: string,
  roomPosition?: { x, y, z },
  participants: MeetingParticipant[],
  agendaItems: MeetingAgendaItem[],
  resolutions: MeetingResolution[]
}
```

---

## 开发

```bash
# 安装依赖
npm install

# 生成Prisma客户端
npm run db:generate

# 运行数据库迁移
npm run db:migrate

# 开发模式
npm run dev

# 构建
npm run build

# 生产模式
npm start
```

---

## 更新日志

### v2.0.0 (Phase 2)
- 新增任务协作功能（委派、协同、认领、转派）
- 新增任务依赖关系
- 新增会议系统（创建、参与、议程、决议）
- 新增3D可视化数据接口
- 新增Agent SDK

### v1.0.0 (Phase 1)
- 基础Agent管理
- 基础任务管理
- 流程模板和实例
- WebSocket支持
