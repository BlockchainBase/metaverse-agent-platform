# 🌐 数字员工的元宇宙办公室 v3.0

> Digital Employee Metaverse Office (DEMO) - Agent协作协议版
> 
> 成都高新信息技术研究院 | AI Agent协作协议平台

---

## 🎯 项目愿景

构建一个**AI Agent协作协议平台**，让AI Agents像专家团队一样自主协作，人类只需在关键时做价值判断。

**核心理念**：
- 🏢 **虚拟办公空间** - 3D四合院场景，四房布局（市场/方案/交付/管理）
- 👤 **数字员工** - 7位AI Agent，各有专业能力档案
- 🤝 **协作协议** - Agent基于证据协商，达成共识
- 🧠 **推理可视化** - 决策过程全程可追溯
- 👔 **人类决策中心** - 人类从"管理者"变为"价值设定者"

---

## 🎮 应用场景

### 1. 研究院指挥中心
```
3D场景：研究院大楼
├── 一层：接待大厅 + 展示厅
├── 二层：教学管理中心（AI教学秘书）
├── 三层：科研项目管理（AI项目管家）
├── 四层：实验室监控（AI设备助手）
└── 五层：产业孵化中心（AI企业顾问）
```

### 2. 实时监控大屏
- 所有AI Agent工作状态3D展示
- 项目进度3D管道视图
- 实验室设备3D状态监控

### 3. 虚拟会议空间
- 3D会议室
- Agent汇报工作
- 数据可视化展示

---

## 🏗️ 技术架构

### 前端技术栈
```
框架: React 18 + TypeScript
3D引擎: Three.js + React Three Fiber (@react-three/fiber)
UI组件: @react-three/drei (3D UI) + Tailwind CSS (2D UI)
状态管理: Zustand
实时通信: Socket.io-client
HTTP客户端: Axios
```

### 后端技术栈
```
运行时: Node.js 20
框架: Express.js / Fastify
实时通信: Socket.io
数据库: PostgreSQL (数据) + Redis (缓存)
文件存储: 阿里云OSS / 本地
```

### 与OpenClaw集成
```
OpenClaw Gateway ──► DEMO Backend ──► 3D Frontend
      │                     │              │
      ▼                     ▼              ▼
  AI Agents          状态聚合API      3D可视化
```

---

## 📁 项目结构

```
metaverse-office/
├── 📁 docs/                    # 文档
│   ├── PRD.md                  # 产品需求文档
│   ├── DESIGN.md               # 设计文档
│   ├── ARCHITECTURE.md         # 架构文档
│   └── API.md                  # API文档
│
├── 📁 src/                     # 源代码
│   ├── 📁 frontend/            # 前端应用
│   │   ├── 📁 components/      # React组件
│   │   ├── 📁 scenes/          # 3D场景
│   │   ├── 📁 agents/          # AI Agent 3D模型
│   │   ├── 📁 hooks/           # 自定义Hooks
│   │   ├── 📁 stores/          # 状态管理
│   │   ├── 📁 utils/           # 工具函数
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   ├── 📁 backend/             # 后端服务
│   │   ├── 📁 routes/          # API路由
│   │   ├── 📁 services/        # 业务逻辑
│   │   ├── 📁 models/          # 数据模型
│   │   ├── 📁 adapters/        # Agent适配器
│   │   └── server.ts
│   │
│   └── 📁 shared/              # 共享代码
│       └── types.ts            # TypeScript类型定义
│
├── 📁 assets/                  # 静态资源
│   ├── 📁 models/              # 3D模型文件
│   ├── 📁 textures/            # 贴图
│   └── 📁 sounds/              # 音效
│
├── 📁 scripts/                 # 脚本工具
│   ├── deploy.sh               # 部署脚本
│   └── setup.sh                # 初始化脚本
│
├── 📁 config/                  # 配置文件
│   ├── nginx.conf              # Nginx配置
│   └── docker-compose.yml      # Docker配置
│
├── README.md                   # 项目说明
├── package.json                # 依赖管理
└── tsconfig.json               # TypeScript配置
```

---

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

### 安装依赖

```bash
# 克隆项目
git clone <repository-url>
cd metaverse-office

# 安装前端依赖
cd src/frontend
npm install

# 安装后端依赖
cd ../backend
npm install
```

### 启动开发服务器

```bash
# 启动后端（端口3001）
cd src/backend
npm run dev

# 启动前端（端口3000）
cd src/frontend
npm run dev

# 访问应用
open http://localhost:3000
```

### 构建生产版本

```bash
cd src/frontend
npm run build

cd ../backend
npm run build
```

---

## 🎨 核心功能

### v3.0 已实现 ✅ (Agent协作协议版)

#### 基础功能
- [x] **中式四合院3D场景** - 四房布局（南/东/西/北）
- [x] **房间标识牌** - 市场部/方案部/交付部/管理中心
- [x] **7位AI Agent** - 市场/方案/研发/交付/管家/财务/助理
- [x] **四房定位** - Agent按角色分布在不同房间
- [x] **点击交互** - 查看Agent能力档案

#### v3.0 协作协议功能
- [x] **📜 协作契约可视化** - 契约卡片、状态颜色、Agent连线
- [x] **💬 协商对话气泡** - 立场颜色标识、最近3轮协商
- [x] **📤 任务委托飞行动画** - 贝塞尔曲线路径、粒子拖尾
- [x] **▶️ 推理链回放** - 时间轴、步骤详情、证据展示
- [x] **👔 决策中心** - 决策大屏、待办卡片、决策面板

#### 后端服务
- [x] **能力档案系统** - Agent专业能力、协作特征
- [x] **能力匹配算法** - 基于能力值、负载自动匹配
- [x] **协作契约服务** - 协商、共识、执行追踪
- [x] **人类介入机制** - 伦理判断、价值权衡

### 开发中 🚧
- [ ] 连接真实OpenClaw Gateway数据
- [ ] 数据库存储（当前内存存储）
- [ ] 飞书消息推送集成

### 计划中 📋
- [ ] VR/AR支持
- [ ] 语音指令控制
- [ ] 移动端适配

---

## 📊 开发路线图

### Phase 1: 四房布局 ✅ (已完成 - 2026.02.15)
- [x] 四房布局配置（南/东/西/北）
- [x] 房间标识牌组件
- [x] Agent位置分配逻辑

### Phase 2: 后端服务 ✅ (已完成 - 2026.02.15)
- [x] v3.0类型定义（能力档案、协作契约）
- [x] 数据库迁移脚本
- [x] 能力匹配算法
- [x] 协作契约服务
- [x] v3.0 API端点

### Phase 3: 协作可视化 ✅ (已完成 - 2026.02.15)
- [x] 协作契约可视化组件
- [x] 协商对话气泡组件
- [x] 任务委托飞行动画组件

### Phase 4: 推理与决策 ✅ (已完成 - 2026.02.15)
- [x] 推理链回放播放器
- [x] 决策中心（北房）
- [x] 决策面板UI

### Phase 5: 集成部署 ✅ (已完成 - 2026.02.15)
- [x] 所有组件集成到App.tsx
- [x] UI控制按钮
- [x] Mock数据
- [x] 部署文档

### Phase 6: 生产化 🚧 (进行中)
- [ ] 数据库持久化
- [ ] OpenClaw Gateway数据接入
- [ ] 飞书消息推送
- [ ] 性能优化
- [ ] 监控告警

### Phase 7: 扩展 🔮 (未来)
- [ ] VR/AR支持
- [ ] 语音指令控制
- [ ] 移动端适配
- [ ] 更多Agent类型

---

## 🔧 配置说明

### OpenClaw集成配置

编辑 `src/backend/config/openclaw.json`:
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
      "position": { "x": 0, "y": 0, "z": 0 }
    },
    {
      "id": "project-manager",
      "name": "AI项目管家", 
      "type": "project",
      "position": { "x": 10, "y": 0, "z": 0 }
    }
  ]
}
```

### 部署配置

编辑 `config/.env.production`:
```bash
# 服务器配置
SERVER_HOST=8.215.54.214
SERVER_PORT=3000

# OpenClaw配置
OPENCLAW_GATEWAY=http://localhost:18789

# 数据库配置
DATABASE_URL=postgresql://user:pass@localhost:5432/demo
REDIS_URL=redis://localhost:6379
```

---

## 📚 文档索引

| 文档 | 路径 | 说明 |
|------|------|------|
| 产品需求 | `docs/PRD.md` | 功能需求详细说明 |
| 设计文档 | `docs/DESIGN.md` | UI/UX设计规范 |
| 架构文档 | `docs/ARCHITECTURE.md` | 技术架构详解 |
| API文档 | `docs/API.md` | 接口规范 |
| 部署指南 | `docs/DEPLOY.md` | 生产部署步骤 |

---

## 🤝 贡献指南

欢迎提交Issue和PR！

### 提交规范
- 使用英文提交信息
- 遵循Conventional Commits规范
- 确保代码通过lint检查

### 开发流程
1. Fork项目
2. 创建功能分支
3. 提交更改
4. 创建Pull Request

---

## 📄 许可证

MIT License - 成都高新信息技术研究院

---

## 👥 团队

- **项目负责人**: 赵其刚
- **技术架构**: AI秘书 🦞
- **所属机构**: 成都高新信息技术研究院
- **关联项目**: OpenClaw AI秘书系统

---

## 📞 联系方式

- 邮箱: qgzhao@mail.swjtu.edu.cn
- 研究院: 成都高新信息技术研究院

---

**🚀 让AI员工在元宇宙中工作！**
