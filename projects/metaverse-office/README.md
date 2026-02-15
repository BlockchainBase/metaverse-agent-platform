# 🌐 数字员工的元宇宙办公室

> Digital Employee Metaverse Office (DEMO)
> 
> 成都高新信息技术研究院 | AI驱动的3D虚拟办公空间

---

## 🎯 项目愿景

构建一个**3D元宇宙办公环境**，让AI数字员工（AI Agents）以可视化方式工作和协作。

**核心理念**：
- 🏢 **虚拟办公空间** - 3D还原真实研究院环境
- 👤 **数字员工** - 每个AI Agent有3D形象和工位
- 📊 **实时可视化** - 工作状态、任务进度一目了然
- 🤝 **协作互动** - Agent之间可以"看见"彼此协作

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

### 已实现 ✅
- [x] 项目初始化
- [x] 基础3D场景搭建
- [x] 技术架构设计
- [x] **中式四合院3D场景** - 青砖墙、瓦片屋顶、石板地面、木门
- [x] **7个AI管理角色** - 卡通形象，带走动动画和状态切换
- [x] **点击交互系统** - 弹出角色详情窗口
- [x] **实时状态更新** - 工作中/待机/会议/忙碌状态动态变化
- [x] **4个数据看板** - 项目总览、员工效能、系统状态、实时数据
- [x] **💬 AI角色对话系统** - 自动显示对话气泡，角色间互动
- [x] **🎭 交互反馈动画** - 挥手、点头、跳跃、旋转四种动画
- [x] **🪴 办公场景装饰** - 会议桌、电脑、绿植、文件柜、白板

### 开发中 🚧
- [ ] 连接真实OpenClaw Gateway数据
- [ ] 虚拟会议室功能
- [ ] 项目3D管道视图
- [ ] 设备3D监控面板

### 计划中 📋
- [ ] VR/AR支持
- [ ] 语音指令控制
- [ ] 移动端适配

---

## 📊 开发路线图

### Phase 1: MVP ✅ (已完成 - 2026.02.12)
- [x] 基础3D场景（中式四合院）
- [x] 7个AI Agent 3D形象（卡通风格）
- [x] 角色走动动画与状态系统
- [x] 点击交互与详情弹窗
- [x] 数据看板可视化
- [x] **新增**: AI角色对话气泡系统
- [x] **新增**: 交互反馈动画（挥手/点头/跳跃/旋转）
- [x] **新增**: 办公场景装饰（会议桌/电脑/绿植/文件柜/白板）

### Phase 2: 系统集成 ✅ (已完成 - 2026.02.12)
- [x] 后端服务搭建（Express + WebSocket）
- [x] OpenClaw Gateway 适配器框架
- [x] RESTful API + WebSocket 双通道
- [x] 实时数据同步（30秒推送）
- [x] 前端数据连接服务
- [ ] 连接真实OpenClaw Gateway数据
- [ ] 飞书日历集成显示真实会议
- [ ] 邮件提醒通知系统

### Phase 3: 高级功能 📋 (计划中)
- [ ] 虚拟会议室功能
- [ ] 项目3D管道视图
- [ ] 设备3D监控面板
- [ ] 数据大屏模式（适合会议室展示）

### Phase 4: 扩展 🔮 (未来)
- [ ] VR/AR支持
- [ ] 语音指令控制
- [ ] 移动端适配
- [ ] 更多Agent类型
- [ ] 企业级功能

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
