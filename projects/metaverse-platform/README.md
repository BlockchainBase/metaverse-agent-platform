# 数字人元宇宙平台 (Metaverse Platform)

Phase 1 开发 - 后端服务

## 技术栈

- **运行时**: Node.js 20+
- **语言**: TypeScript 5.x
- **框架**: Express.js 4.x
- **实时通信**: Socket.io 4.x
- **数据库**: PostgreSQL + Prisma ORM
- **认证**: JWT + mTLS
- **测试**: Jest + Supertest
- **文档**: Swagger/OpenAPI

## 项目结构

```
metaverse-platform/
├── src/
│   ├── __tests__/          # 测试文件
│   │   ├── unit/           # 单元测试
│   │   └── integration/    # 集成测试
│   ├── config/             # 配置文件
│   │   ├── index.ts        # 环境配置
│   │   └── prisma.ts       # Prisma 客户端
│   ├── controllers/        # 控制器
│   ├── middleware/         # 中间件
│   ├── routes/             # 路由定义
│   ├── services/           # 业务逻辑
│   ├── types/              # TypeScript 类型
│   ├── utils/              # 工具函数
│   ├── websocket/          # WebSocket 处理
│   └── index.ts            # 应用入口
├── prisma/
│   └── schema.prisma       # 数据库 Schema
├── certs/                  # 证书目录
├── .env.example            # 环境变量示例
├── package.json
├── tsconfig.json
└── jest.config.js
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，配置数据库连接等信息
```

### 3. 数据库设置

```bash
# 生成 Prisma 客户端
npm run prisma:generate

# 执行数据库迁移
npm run prisma:migrate

# （可选）打开 Prisma Studio
npm run prisma:studio
```

### 4. 生成证书（用于 mTLS）

```bash
mkdir -p certs
cd certs

# 生成 CA 私钥
openssl genrsa -out ca.key 4096

# 生成 CA 证书
openssl req -new -x509 -days 365 -key ca.key -out ca.crt -subj "/C=CN/O=Metaverse/CN=Metaverse CA"

# 生成服务器私钥和证书
openssl genrsa -out server.key 2048
openssl req -new -key server.key -out server.csr -subj "/C=CN/O=Metaverse/CN=localhost"
openssl x509 -req -days 365 -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out server.crt

# 生成客户端证书（示例）
openssl genrsa -out client.key 2048
openssl req -new -key client.key -out client.csr -subj "/C=CN/O=Metaverse/CN=test_agent"
openssl x509 -req -days 365 -in client.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out client.crt
```

### 5. 启动服务

```bash
# 开发模式（带热重载）
npm run dev

# 生产模式
npm run build
npm start
```

### 6. 运行测试

```bash
# 运行所有测试
npm test

# 带覆盖率报告
npm run test:coverage

# 监视模式
npm run test:watch
```

## API 文档

启动服务后，访问 Swagger UI:

```
http://localhost:3000/api-docs
```

## API 端点

### 认证相关

| 方法 | 端点 | 描述 |
|------|------|------|
| POST | `/api/v1/agents/login` | Agent 登录 |
| POST | `/api/v1/agents/refresh` | 刷新令牌 |
| POST | `/api/v1/agents/logout` | 登出 |

### Agent 管理

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/api/v1/agents` | 获取 Agent 列表 |
| POST | `/api/v1/agents` | 创建 Agent |
| GET | `/api/v1/agents/me` | 获取当前 Agent |
| PUT | `/api/v1/agents/me/status` | 更新状态 |
| GET | `/api/v1/agents/:id` | 获取指定 Agent |
| PUT | `/api/v1/agents/:id` | 更新 Agent |
| DELETE | `/api/v1/agents/:id` | 删除 Agent |

### 任务调度

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/api/v1/tasks` | 获取任务列表 |
| POST | `/api/v1/tasks` | 创建任务 |
| GET | `/api/v1/tasks/my` | 获取我的任务 |
| GET | `/api/v1/tasks/:id` | 获取任务详情 |
| PUT | `/api/v1/tasks/:id` | 更新任务 |
| DELETE | `/api/v1/tasks/:id` | 删除任务 |
| POST | `/api/v1/tasks/:id/claim` | 领取任务 |
| POST | `/api/v1/tasks/:id/complete` | 完成任务 |
| POST | `/api/v1/tasks/:id/fail` | 标记失败 |
| GET | `/api/v1/tasks/stats` | 任务统计 |

### 系统与心跳

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/api/v1/system/health` | 健康检查 |
| GET | `/api/v1/system/status` | 系统状态 |
| POST | `/api/v1/system/heartbeat` | 发送心跳 |
| GET | `/api/v1/system/heartbeats` | 心跳历史 |
| GET | `/api/v1/system/agents/online` | 在线 Agents |

### WebSocket 事件

```javascript
const socket = io('ws://localhost:3000', {
  auth: { token: 'your-jwt-token' }
});

// 连接成功
socket.on('connected', (data) => {
  console.log('Connected:', data);
});

// 发送心跳
socket.emit('heartbeat', {
  status: 'ONLINE',
  cpuUsage: 45.2,
  memoryUsage: 67.8,
  position: { x: 10, y: 20, z: 30 }
});

// 监听事件
socket.on('task:assigned', (task) => {
  console.log('New task assigned:', task);
});

socket.on('agent:online', (data) => {
  console.log('Agent online:', data);
});

socket.on('agent:offline', (data) => {
  console.log('Agent offline:', data);
});
```

## Phase 1 功能实现

### ✅ 已完成

1. **后端框架** (Express + TypeScript)
   - 项目结构搭建
   - 中间件配置（安全、日志、错误处理）
   - API 路由设计

2. **数据库 Schema** (PostgreSQL + Prisma)
   - Agent 表
   - Task 表
   - Heartbeat 表
   - Session 管理

3. **认证模块** (mTLS + JWT)
   - JWT 令牌生成与验证
   - 登录/登出/刷新
   - mTLS 证书支持框架

4. **WebSocket 实时通信** (Socket.io)
   - 实时连接管理
   - 心跳接收
   - 任务事件广播

5. **任务调度 API**
   - CRUD 操作
   - 自动分配
   - 重试机制
   - 状态管理

6. **心跳与状态同步**
   - 心跳记录
   - 超时检测
   - 状态更新
   - 系统健康监控

### 📋 数据库 Schema

```prisma
// 核心实体
model Agent {
  id, agentId, name, status
  certFingerprint, passwordHash
  sessions, tasks, heartbeats
}

model Task {
  id, taskId, name, type, status
  priority, agentId, scheduledAt
  payload, result, error
  maxRetries, retryCount
}

model Heartbeat {
  id, agentId, status, timestamp
  cpuUsage, memoryUsage, networkLatency
  positionX, positionY, positionZ
}

model AgentSession {
  id, agentId, token, refreshToken
  ipAddress, userAgent, expiresAt
}
```

## 环境变量

| 变量 | 描述 | 默认值 |
|------|------|--------|
| `NODE_ENV` | 运行环境 | `development` |
| `PORT` | 服务端口 | `3000` |
| `DATABASE_URL` | PostgreSQL 连接字符串 | - |
| `JWT_SECRET` | JWT 密钥 | - |
| `JWT_EXPIRES_IN` | JWT 过期时间 | `7d` |
| `MTLS_ENABLED` | 是否启用 mTLS | `false` |
| `HEARTBEAT_INTERVAL_MS` | 心跳检查间隔 | `30000` |
| `HEARTBEAT_TIMEOUT_MS` | 心跳超时时间 | `90000` |

## 部署

### Docker 部署

```bash
# 构建镜像
docker build -t metaverse-platform .

# 运行容器
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="your-secret" \
  metaverse-platform
```

### 生产环境检查清单

- [ ] 更改默认 JWT 密钥
- [ ] 配置生产数据库
- [ ] 启用 mTLS
- [ ] 配置 SSL/TLS
- [ ] 设置日志收集
- [ ] 配置监控告警
- [ ] 设置 CI/CD 流程

## 许可证

MIT License