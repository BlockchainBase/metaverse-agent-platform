# 数字人元宇宙平台 v3.0 部署文档

**版本**: v3.0 (Agent协作协议版)  
**日期**: 2026-02-15  
**状态**: 待部署

---

## 1. 部署前准备

### 1.1 环境要求

| 组件 | 版本要求 | 说明 |
|------|---------|------|
| Node.js | >= 18.0 | 后端运行环境 |
| PostgreSQL | >= 14.0 | 数据库 |
| Redis | >= 6.0 | 缓存 |
| OpenClaw Gateway | 最新版 | Agent接入 |

### 1.2 配置文件

创建 `.env` 文件：

```bash
# 数据库配置
DATABASE_URL=postgresql://user:password@localhost:5432/metaverse_v3

# Redis配置
REDIS_URL=redis://localhost:6379

# OpenClaw Gateway
OPENCLAW_GATEWAY_URL=http://localhost:18789
OPENCLAW_TOKEN=your-gateway-token

# 服务器配置
PORT=3001
NODE_ENV=production

# 飞书集成 (可选)
FEISHU_APP_ID=your-app-id
FEISHU_APP_SECRET=your-app-secret
```

---

## 2. 数据库部署

### 2.1 创建数据库

```bash
# 创建数据库
createdb metaverse_v3

# 执行迁移脚本
cd src/backend
npx ts-node src/database/v3-migration.ts
```

### 2.2 验证表结构

```sql
-- 检查表是否创建成功
\dt

-- 应该看到以下表：
-- agent_capabilities
-- collaboration_contracts
-- human_intervention_requests
-- task_requirements
-- audit_logs
```

---

## 3. 后端部署

### 3.1 安装依赖

```bash
cd src/backend
npm install
```

### 3.2 编译TypeScript

```bash
npm run build
```

### 3.3 启动服务

```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

### 3.4 验证API

```bash
# 健康检查
curl http://localhost:3001/api/health

# 预期返回：
# {"status":"ok","version":"3.0","timestamp":"..."}
```

---

## 4. 前端部署

### 4.1 安装依赖

```bash
cd src/frontend
npm install
```

### 4.2 配置API地址

编辑 `src/services/metaverseData.ts`：

```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api'
```

### 4.3 构建

```bash
npm run build
```

### 4.4 部署

构建产物在 `dist/` 目录，可部署到：
- Nginx
- Apache
- CDN
- Vercel/Netlify

---

## 5. 功能验证清单

### 5.1 基础功能

- [ ] 四合院场景正常加载
- [ ] 四房标识牌显示
- [ ] 7位Agent正确分布到各房间
- [ ] Agent动画正常（走动、状态灯）
- [ ] 点击Agent显示详情面板

### 5.2 v3.0 新功能

- [ ] 协作契约可视化（工具栏"契约"按钮）
- [ ] 协商对话气泡（工具栏"协商"按钮）
- [ ] 任务委托飞行动画（工具栏"委托"按钮）
- [ ] 推理链回放（工具栏"推理"按钮）
- [ ] 决策中心（工具栏"决策"按钮）

### 5.3 后端API

- [ ] 能力档案API (`/v3/agents/:id/capabilities`)
- [ ] 任务匹配API (`/v3/tasks/match`)
- [ ] 协作契约API (`/v3/contracts`)
- [ ] 人类介入API (`/v3/interventions/pending`)

### 5.4 OpenClaw集成

- [ ] Agent状态同步
- [ ] 任务状态更新
- [ ] 事件推送

---

## 6. 性能优化

### 6.1 已实施的优化

- Agent模型LOD（远距离简化）
- 契约可视化实例化渲染
- WebSocket增量更新
- 推理链分页加载

### 6.2 监控指标

| 指标 | 目标值 |
|------|--------|
| 首屏加载时间 | < 5秒 |
| 3D帧率 | > 30fps |
| API响应时间 | < 200ms |
| WebSocket延迟 | < 100ms |

---

## 7. 回滚方案

如需回滚到v2.0：

```bash
# 1. 切换到v2.0分支
git checkout v2.0

# 2. 恢复数据库（如有必要）
# 备份v3.0数据
cp metaverse_v3 metaverse_v3_backup
# 恢复v2.0数据
# ...

# 3. 重新部署
cd src/backend && npm install && npm start
cd src/frontend && npm install && npm run build
```

---

## 8. 上线后检查

### 8.1 实时监控

```bash
# 查看日志
tail -f logs/metaverse.log

# 监控API响应
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3001/api/health
```

### 8.2 用户反馈收集

- 刚哥使用体验
- Agent协作效率
- 决策响应时间
- 系统稳定性

---

## 9. 已知问题与解决

| 问题 | 状态 | 解决方案 |
|------|------|---------|
| 数据库连接池不足 | 待观察 | 调整max_connections |
| 3D场景内存占用高 | 待优化 | 启用纹理压缩 |
| WebSocket重连频繁 | 待优化 | 调整心跳间隔 |

---

## 10. 联系方式

- **开发**: AI秘书 🦞
- **部署日期**: 2026-02-15
- **文档版本**: v3.0-deploy

**部署完成！** 🚀
