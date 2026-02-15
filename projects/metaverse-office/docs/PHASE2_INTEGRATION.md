# Phase 2: OpenClaw Gateway 集成

## 🎯 功能概述

Phase 2 实现了元宇宙办公室与 OpenClaw Gateway 的数据集成，包括：

1. **后端服务** - Express + WebSocket 服务器
2. **OpenClaw 适配器** - 连接 OpenClaw Gateway 获取真实数据
3. **实时数据同步** - WebSocket 推送，每30秒更新
4. **API接口** - RESTful API 供前端调用

---

## 📁 文件结构

```
metaverse-office/
├── src/
│   ├── backend/                    # 后端服务
│   │   ├── src/
│   │   │   └── server.ts           # 服务器入口
│   │   ├── routes/
│   │   │   └── api.ts              # API路由
│   │   ├── services/
│   │   │   └── dataService.ts      # 数据服务层
│   │   ├── adapters/
│   │   │   └── openclaw.ts         # OpenClaw适配器
│   │   ├── models/
│   │   │   └── types.ts            # 数据模型
│   │   ├── config/
│   │   │   └── openclaw.json       # 配置文件
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── frontend/                   # 前端更新
│       ├── src/
│       │   ├── services/
│       │   │   └── metaverseData.ts # 数据连接服务
│       │   ├── models/
│       │   │   └── types.ts         # 前端模型
│       │   └── components/
│       │       └── Dashboards.tsx   # 更新后的看板组件
```

---

## 🚀 快速开始

### 1. 安装后端依赖

```bash
cd metaverse-office/src/backend
npm install
```

### 2. 启动后端服务

```bash
npm run dev
```

服务将启动在 `http://localhost:3001`

### 3. 启动前端开发服务器

```bash
cd ../frontend
npm run dev
```

### 4. 启用实时数据模式

编辑 `src/frontend/src/App.tsx`，修改 Dashboards 组件：

```tsx
<Dashboards useRealData={true} />
```

---

## 📡 API 接口

### REST API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | 健康检查 |
| GET | `/api/state` | 获取完整状态 |
| GET | `/api/agents` | 获取Agent状态 |
| GET | `/api/projects` | 获取项目列表 |
| GET | `/api/schedule` | 获取今日日程 |
| GET | `/api/statistics` | 获取统计数据 |
| POST | `/api/agents/:id/message` | 发送消息给Agent |

### WebSocket 事件

| 事件 | 方向 | 说明 |
|------|------|------|
| `connect` | 双向 | 连接建立 |
| `realtime_data` | 服务端→客户端 | 实时数据推送 |
| `request_state` | 客户端→服务端 | 请求完整状态 |
| `send_message` | 客户端→服务端 | 发送消息 |
| `message_sent` | 服务端→客户端 | 消息发送结果 |

---

## ⚙️ 配置说明

### OpenClaw 配置

编辑 `src/backend/config/openclaw.json`：

```json
{
  "gateway": {
    "url": "http://localhost:18789",
    "token": "your-gateway-token"
  },
  "agents": [
    {
      "id": "teaching-secretary",
      "name": "AI教学秘书",
      "type": "teaching",
      "role": "operations"
    }
  ],
  "syncInterval": 30000
}
```

### 环境变量

前端 `.env` 文件：

```bash
VITE_API_URL=http://localhost:3001
VITE_WS_URL=http://localhost:3001
```

---

## 🔌 数据流

```
OpenClaw Gateway
       ↓
Backend Adapter ( adapters/openclaw.ts )
       ↓
Data Service ( services/dataService.ts )
       ↓
WebSocket / REST API
       ↓
Frontend Data Service ( services/metaverseData.ts )
       ↓
Dashboards Component
       ↓
3D Scene
```

---

## 📊 数据模型

### AgentState
```typescript
{
  id: string
  name: string
  role: string
  status: 'working' | 'idle' | 'meeting' | 'busy' | 'offline'
  position: { x, y, z }
  currentTask: string
  taskProgress: number
  efficiency: number
}
```

### Project
```typescript
{
  id: string
  name: string
  description: string
  progress: number
  status: 'not_started' | 'in_progress' | 'completed' | 'delayed'
  assignee: string
  deadline: string
}
```

### SystemMetrics
```typescript
{
  cpuUsage: number
  memoryUsage: number
  diskUsage: number
  networkStatus: number
  responseTime: number
}
```

---

## 🔄 实时更新机制

1. **WebSocket 连接** - 前端启动时建立持久连接
2. **定时推送** - 后端每30秒广播一次完整数据
3. **手动刷新** - 调用 `metaverseDataService.requestState()`
4. **数据缓存** - 后端30秒缓存，减少重复计算

---

## 🛠️ 开发模式

### 模拟数据模式

默认情况下，后端返回模拟数据，方便开发测试。

### 真实数据模式

1. 配置 OpenClaw Gateway URL
2. 实现适配器中的真实API调用
3. 启用真实数据源

---

## 📈 性能优化

- **数据缓存** - 后端30秒缓存
- **增量更新** - 只传输变化的数据
- **纹理复用** - 前端CanvasTexture缓存
- **按需加载** - 组件级别数据订阅

---

## 🔮 下一步计划

### Phase 3: 功能增强
- [ ] Agent状态实时同步到3D角色
- [ ] 飞书日历集成显示会议
- [ ] 邮件提醒通知系统
- [ ] 任务进度自动更新

### Phase 4: 高级功能
- [ ] 第一人称漫游模式
- [ ] VR/AR支持
- [ ] 语音指令控制
- [ ] AI对话集成
