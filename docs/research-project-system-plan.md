# 研究院项目管理系统规划文档

> 基于元宇宙办公室的升级版业务系统
> 
> **目标**：支撑研究院项目式工作流程，从市场对接到项目交付的全生命周期管理

---

## 一、业务分析

### 1.1 核心业务流程

研究院的项目式工作流程可分为**四个核心阶段**：

```
┌─────────────────────────────────────────────────────────────────┐
│                    研究院项目全生命周期                          │
└─────────────────────────────────────────────────────────────────┘
         │              │              │              │
         ▼              ▼              ▼              ▼
   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
   │  阶段一  │   │  阶段二  │   │  阶段三  │   │  阶段四  │
   │ 市场对接 │──▶│ 方案制定 │──▶│ 研发Demo │──▶│ 实施交付 │
   └──────────┘   └──────────┘   └──────────┘   └──────────┘
        │              │              │              │
   客户线索      需求分析       原型开发       部署上线
   初步沟通      方案设计       迭代优化       培训交接
   意向确认      商务谈判       Demo演示       运维支持
```

### 1.2 各阶段详细业务活动

#### 阶段一：前期市场用户对接
**目标**：获取项目线索，建立客户关系

| 业务活动 | 关键动作 | 产出物 | 参与角色 |
|---------|---------|--------|---------|
| 客户线索收集 | 展会/网络/转介绍获取潜在客户 | 线索池 | 市场经理 |
| 初步沟通 | 电话/拜访了解客户基本情况 | 沟通记录 | 市场经理+销售 |
| 需求初探 | 了解客户痛点、预算、时间 | 需求简报 | 市场经理 |
| 意向评估 | 判断项目可行性和匹配度 | 意向评级 | 院长/副院长 |
| 正式立项 | 进入项目跟进流程 | 项目档案 | 项目管家 |

#### 阶段二：解决方案制定与客户沟通
**目标**：输出满足客户需求的解决方案，达成商务共识

| 业务活动 | 关键动作 | 产出物 | 参与角色 |
|---------|---------|--------|---------|
| 深度调研 | 现场考察、用户访谈、竞品分析 | 调研报告 | 产品经理+技术 |
| 需求分析 | 功能梳理、技术可行性评估 | 需求规格书 | 产品经理 |
| 方案设计 | 技术架构、实施计划、资源配置 | 解决方案 | 总工+产品经理 |
| 方案汇报 | PPT演示、原型展示、答疑 | 汇报材料 | 副院长+产品经理 |
| 商务谈判 | 报价、合同条款、交付周期 | 合同草案 | 副院长+财务 |
| 合同签订 | 法务审核、正式签约 | 正式合同 | 院长 |

#### 阶段三：软件研发与Demo制作
**目标**：完成产品开发，通过客户验收

| 业务活动 | 关键动作 | 产出物 | 参与角色 |
|---------|---------|--------|---------|
| 项目启动 | 团队组建、计划制定、环境搭建 | 项目计划 | 项目管家 |
| 原型设计 | UI/UX设计、交互流程 | 设计稿+原型 | 产品经理+设计 |
| 技术设计 | 架构设计、数据库设计、接口定义 | 技术文档 | 总工+开发 |
| 迭代开发 | Sprint开发、代码审查、单元测试 | 可运行版本 | 开发团队 |
| Demo制作 | 演示环境、演示脚本、数据准备 | Demo系统 | 产品经理 |
| 客户演示 | 现场/远程演示、收集反馈 | 反馈记录 | 产品经理+技术 |
| 迭代优化 | 根据反馈调整、Bug修复 | 优化版本 | 开发团队 |
| 内部测试 | 功能测试、性能测试、安全测试 | 测试报告 | QA团队 |
| 客户验收 | UAT测试、验收签字 | 验收报告 | 客户+项目管家 |

#### 阶段四：项目实施与交付
**目标**：成功部署上线，客户顺利使用

| 业务活动 | 关键动作 | 产出物 | 参与角色 |
|---------|---------|--------|---------|
| 部署准备 | 服务器准备、域名配置、SSL证书 | 部署清单 | 运维+开发 |
| 系统部署 | 代码上线、数据库迁移、配置调整 | 生产环境 | 运维团队 |
| 数据迁移 | 历史数据导入、数据清洗 | 迁移报告 | 开发+客户 |
| 用户培训 | 操作手册、培训会议、答疑 | 培训材料 | 产品经理 |
| 试运行 | 试运行监控、问题收集修复 | 试运行报告 | 项目管家 |
| 正式上线 | 切换生产、监控告警 | 上线公告 | 运维团队 |
| 项目交接 | 文档移交、运维交接 | 交接清单 | 项目管家+运维 |
| 售后支持 | 技术支持、迭代升级 | 服务记录 | 运营经理 |

### 1.3 业务流程痛点分析

**当前问题**：
1. **信息孤岛** - 客户信息、项目进度、文档分散在不同地方
2. **协作困难** - 跨部门协作靠微信群、邮件，容易遗漏
3. **进度不透明** - 项目进度黑盒化，管理层难以掌控
4. **知识沉淀难** - 项目经验、技术方案无法复用
5. **客户体验差** - 客户无法实时了解项目进展

**系统解决方向**：
- ✅ 统一项目数据中心
- ✅ 可视化项目进度
- ✅ 自动化流程提醒
- ✅ 知识库沉淀
- ✅ 客户门户（可选）

---

## 二、系统功能架构设计

### 2.1 整体架构图

```
┌─────────────────────────────────────────────────────────────────────┐
│                         研究院项目管理系统                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   客户门户   │  │   管理后台   │  │  元宇宙大屏  │              │
│  │  (可选V2)    │  │   (Web端)    │  │   (3D展示)   │              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
│         │                 │                 │                       │
│         └─────────────────┼─────────────────┘                       │
│                           │                                         │
│  ┌────────────────────────┴────────────────────────┐               │
│  │              API Gateway / GraphQL              │               │
│  └────────────────────────┬────────────────────────┘               │
│                           │                                         │
│  ┌────────────────────────┴────────────────────────┐               │
│  │                 核心业务服务层                   │               │
│  │  ┌──────────┬──────────┬──────────┬──────────┐ │               │
│  │  │ 客户管理 │ 项目管理 │ 任务管理 │ 资源管理 │ │               │
│  │  └──────────┴──────────┴──────────┴──────────┘ │               │
│  │  ┌──────────┬──────────┬──────────┬──────────┐ │               │
│  │  │ 文档管理 │ 协作沟通 │ 审批流程 │ 报表统计 │ │               │
│  │  └──────────┴──────────┴──────────┴──────────┘ │               │
│  └─────────────────────────────────────────────────┘               │
│                           │                                         │
│  ┌────────────────────────┴────────────────────────┐               │
│  │                  数据存储层                      │               │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐        │               │
│  │  │PostgreSQL│ │  Redis   │ │  OSS存储 │        │               │
│  │  │(主数据库)│ │  (缓存)  │ │(文件存储)│        │               │
│  │  └──────────┘ └──────────┘ └──────────┘        │               │
│  └─────────────────────────────────────────────────┘               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 核心功能模块

#### 模块一：客户管理（CRM）
**解决**：客户信息分散、跟进不及时

| 功能 | 说明 | 优先级 |
|-----|------|-------|
| 客户档案 | 基本信息、联系人、行业、规模 | P0 |
| 线索管理 | 线索来源、跟进状态、转化率 | P0 |
| 沟通记录 | 每次沟通的时间、方式、内容 | P0 |
| 商机管理 | 意向项目、预计金额、成交概率 | P0 |
| 客户分级 | ABC分级、标签体系 | P1 |

#### 模块二：项目管理
**解决**：项目进度不透明、跨部门协作难

| 功能 | 说明 | 优先级 |
|-----|------|-------|
| 项目看板 | 四阶段流程可视化、甘特图 | P0 |
| 里程碑管理 | 关键节点、交付物、验收标准 | P0 |
| 项目模板 | 标准项目流程模板、快速创建 | P0 |
| 进度追踪 | 实际vs计划、延期预警 | P0 |
| 项目文档 | 方案、合同、验收单集中管理 | P0 |
| 工时统计 | 成员投入时间、成本核算 | P1 |

#### 模块三：任务管理
**解决**：任务分配混乱、责任不清

| 功能 | 说明 | 优先级 |
|-----|------|-------|
| 任务创建 | 标题、描述、负责人、截止日期 | P0 |
| 任务看板 | 待办/进行中/已完成、拖拽流转 | P0 |
| 子任务 | 任务拆解、依赖关系 | P0 |
| 任务提醒 | 截止提醒、逾期告警 | P0 |
| 任务评论 | @成员、附件上传 | P1 |

#### 模块四：资源管理
**解决**：人员忙闲不均、资源冲突

| 功能 | 说明 | 优先级 |
|-----|------|-------|
| 人员管理 | 团队信息、技能标签、角色 | P0 |
| 资源日历 | 人员忙闲视图、冲突检测 | P0 |
| 资源分配 | 项目成员分配、工作量评估 | P0 |
| 设备管理 | 服务器、开发机、测试机 | P1 |

#### 模块五：文档管理
**解决**：文档分散、版本混乱

| 功能 | 说明 | 优先级 |
|-----|------|-------|
| 文档库 | 项目文档、技术文档、模板 | P0 |
| 版本管理 | 历史版本、对比、回滚 | P0 |
| 权限控制 | 项目级、文档级权限 | P0 |
| 全文搜索 | 文档内容快速检索 | P1 |

#### 模块六：协作沟通
**解决**：信息碎片化、追溯困难

| 功能 | 说明 | 优先级 |
|-----|------|-------|
| 项目动态 | 任务更新、文档上传、进度变更 | P0 |
| 站内信 | 消息通知、@提醒 | P0 |
| 评论系统 | 任务/文档/里程碑评论 | P0 |
| 飞书集成 | 消息同步、审批推送 | P1 |

#### 模块七：审批流程
**解决**：审批流程不规范、效率低

| 功能 | 说明 | 优先级 |
|-----|------|-------|
| 审批模板 | 立项审批、合同审批、变更审批 | P1 |
| 流程配置 | 审批人、条件分支、会签 | P1 |
| 审批记录 | 审批历史、意见、时间轴 | P1 |

#### 模块八：报表统计
**解决**：数据靠手工统计、决策滞后

| 功能 | 说明 | 优先级 |
|-----|------|-------|
| 项目报表 | 项目数量、状态分布、延期率 | P0 |
| 客户报表 | 客户增长、转化率、复购率 | P0 |
| 人员报表 | 工作量、绩效、技能分布 | P1 |
| 财务报表 | 收入、成本、利润（简化版）| P1 |
| 数据大屏 | 元宇宙3D可视化（特色） | P0 |

---

## 三、数据模型设计

### 3.1 核心实体关系图

```
                    ┌─────────────┐
                    │    客户     │
                    │   Customer  │
                    └──────┬──────┘
                           │ 1:N
                           ▼
              ┌────────────────────────┐
              │         项目           │
              │       Project          │
              └──────┬──────────┬──────┘
                     │ 1:N      │ 1:N
                     ▼          ▼
              ┌──────────┐ ┌──────────┐
              │   任务   │ │  里程碑  │
              │   Task   │ │Milestone │
              └────┬─────┘ └──────────┘
                   │ N:M
                   ▼
            ┌──────────┐
            │   成员   │
            │  Member  │
            └────┬─────┘
                 │ 1:N
                 ▼
            ┌──────────┐
            │   文档   │
            │ Document │
            └──────────┘
```

### 3.2 关键数据表设计

#### 客户表 (customers)
```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,           -- 客户名称
  industry VARCHAR(50),                  -- 行业
  scale VARCHAR(20),                     -- 规模（大型/中型/小型）
  region VARCHAR(50),                    -- 地区
  address TEXT,                          -- 地址
  website VARCHAR(200),                  -- 官网
  level VARCHAR(10) DEFAULT 'B',         -- 等级 A/B/C
  status VARCHAR(20) DEFAULT 'active',   -- 状态 active/potential/lost
  tags TEXT[],                           -- 标签数组
  owner_id UUID REFERENCES users(id),    -- 负责人
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 联系人表 (contacts)
```sql
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id),
  name VARCHAR(50) NOT NULL,             -- 姓名
  position VARCHAR(50),                  -- 职位
  phone VARCHAR(20),                     -- 电话
  email VARCHAR(100),                    -- 邮箱
  wechat VARCHAR(50),                    -- 微信
  is_primary BOOLEAN DEFAULT false,      -- 是否主要联系人
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 项目表 (projects)
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(20) UNIQUE NOT NULL,      -- 项目编号 PJ2024001
  name VARCHAR(200) NOT NULL,            -- 项目名称
  customer_id UUID REFERENCES customers(id),
  
  -- 项目阶段 (阶段1/2/3/4)
  current_stage INTEGER DEFAULT 1,
  stage_status VARCHAR(20) DEFAULT 'in_progress', -- not_started/in_progress/completed
  
  -- 基本信息
  type VARCHAR(50),                      -- 项目类型
  budget DECIMAL(12,2),                  -- 预算金额
  contract_amount DECIMAL(12,2),         -- 合同金额
  
  -- 时间规划
  start_date DATE,                       -- 计划开始
  end_date DATE,                         -- 计划结束
  actual_start DATE,                     -- 实际开始
  actual_end DATE,                       -- 实际结束
  
  -- 负责人
  manager_id UUID REFERENCES users(id),  -- 项目经理
  sales_id UUID REFERENCES users(id),    -- 销售负责人
  
  -- 状态
  status VARCHAR(20) DEFAULT 'draft',    -- draft/ongoing/paused/completed/cancelled
  priority VARCHAR(10) DEFAULT 'medium', -- high/medium/low
  
  -- 描述
  description TEXT,
  requirements TEXT,                     -- 需求描述
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 任务表 (tasks)
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id),
  
  title VARCHAR(200) NOT NULL,           -- 任务标题
  description TEXT,                      -- 任务描述
  
  -- 负责人
  assignee_id UUID REFERENCES users(id), -- 执行人
  creator_id UUID REFERENCES users(id),  -- 创建人
  
  -- 时间
  start_date DATE,
  due_date DATE,                         -- 截止日期
  completed_at TIMESTAMP,                -- 完成时间
  
  -- 状态
  status VARCHAR(20) DEFAULT 'todo',     -- todo/in_progress/review/done
  priority VARCHAR(10) DEFAULT 'medium', -- high/medium/low
  
  -- 关联
  parent_id UUID REFERENCES tasks(id),   -- 父任务（子任务）
  milestone_id UUID REFERENCES milestones(id),
  
  -- 预估/实际工时
  estimated_hours INTEGER,               -- 预估工时
  actual_hours INTEGER,                  -- 实际工时
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 里程碑表 (milestones)
```sql
CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id),
  
  name VARCHAR(100) NOT NULL,            -- 里程碑名称
  stage INTEGER NOT NULL,                -- 所属阶段 1/2/3/4
  
  due_date DATE,                         -- 计划日期
  completed_at TIMESTAMP,                -- 完成时间
  
  deliverables TEXT,                     -- 交付物清单
  status VARCHAR(20) DEFAULT 'pending',  -- pending/completed
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 项目成员表 (project_members)
```sql
CREATE TABLE project_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id),
  user_id UUID REFERENCES users(id),
  
  role VARCHAR(50),                      -- 角色：项目经理/开发/测试/产品
  join_date DATE,                        -- 加入时间
  leave_date DATE,                       -- 离开时间
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 文档表 (documents)
```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id),
  
  name VARCHAR(200) NOT NULL,            -- 文档名称
  type VARCHAR(50),                      -- 类型：方案/合同/验收/其他
  
  file_url VARCHAR(500),                 -- 文件URL
  file_size INTEGER,                     -- 文件大小
  mime_type VARCHAR(100),                -- 文件类型
  
  version INTEGER DEFAULT 1,             -- 版本号
  previous_version_id UUID REFERENCES documents(id),
  
  uploader_id UUID REFERENCES users(id),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 沟通记录表 (communications)
```sql
CREATE TABLE communications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id),
  customer_id UUID REFERENCES customers(id),
  
  type VARCHAR(20),                      -- 电话/邮件/会议/拜访/微信
  title VARCHAR(200),                    -- 主题
  content TEXT,                          -- 内容
  
  contact_id UUID REFERENCES contacts(id), -- 沟通对象
  contact_person VARCHAR(50),            -- 联系人（外部）
  
  participants UUID[],                   -- 内部参与人
  
  communication_date DATE,               -- 沟通日期
  next_follow_up DATE,                   -- 下次跟进
  
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3.3 元宇宙数据映射

将业务数据映射到3D元宇宙展示：

```
业务实体          3D展示形式
─────────────────────────────────────
项目              3D项目卡片/管道
项目阶段          进度条/门
任务              小图标/粒子
成员              AI数字员工
里程碑            旗帜/标记
告警/延期         红色闪烁效果
进行中任务        动画效果
```

---

## 四、基于现有系统的升级方案

### 4.1 现有基础盘点

**已具备的组件**：
- ✅ React + TypeScript + Three.js 前端
- ✅ Express + WebSocket 后端
- ✅ 7个AI数字员工角色
- ✅ 四合院3D场景
- ✅ 点击交互系统
- ✅ 数据看板UI

### 4.2 升级路线图

#### Phase 1: 核心功能开发（4周）
**目标**：完成业务系统的Web管理后台

**技术栈**：
- 前端：React + Ant Design / shadcn/ui + TanStack Query
- 后端：Node.js + Express + Prisma
- 数据库：PostgreSQL

**功能范围**：
1. 客户管理模块
2. 项目管理模块（四阶段流程）
3. 任务管理模块
4. 基础权限管理

#### Phase 2: 元宇宙集成（2周）
**目标**：让元宇宙大屏展示真实业务数据

**改造内容**：
1. 后端API对接真实数据库
2. 3D场景项目展示（项目卡片替代数字员工）
3. 项目管道可视化（四阶段流程3D化）
4. 实时数据同步（WebSocket推送）

#### Phase 3: 高级功能（3周）
**目标**：完善系统，提升易用性

**功能范围**：
1. 文档管理 + 飞书集成
2. 报表统计
3. 移动端适配
4. 审批流程

### 4.3 元宇宙场景重新设计

**从「数字员工办公室」到「项目作战室」**：

```
          元宇宙项目作战室
    ┌─────────────────────────────┐
    │      【项目管道全景】        │
    │                             │
    │   阶段1      阶段2      阶段3      阶段4
    │  ┌────┐    ┌────┐    ┌────┐    ┌────┐
    │  │项目│───▶│项目│───▶│项目│───▶│项目│
    │  │管道│    │管道│    │管道│    │管道│
    │  └────┘    └────┘    └────┘    └────┘
    │                             │
    │   [悬浮数据面板]             │
    │   - 本阶段项目数            │
    │   - 延期告警                │
    │   - 本周交付                │
    │                             │
    └─────────────────────────────┘
```

**3D场景改造**：
1. **四象限区域** - 每个阶段一个区域，用不同颜色/风格区分
2. **项目管道** - 项目以卡片形式在管道中流动
3. **AI助手** - 保留2-3个数字员工作为系统助手
4. **数据面板** - 悬浮面板展示实时统计数据

---

## 五、技术实现规划

### 5.1 技术选型

| 层级 | 技术方案 | 理由 |
|-----|---------|------|
| 前端框架 | React 18 + TypeScript | 团队熟悉，生态丰富 |
| UI组件库 | Ant Design 5.x | 企业级组件，功能完善 |
| 状态管理 | Zustand + TanStack Query | 简单高效，支持服务端状态 |
| 后端框架 | Node.js + Express | 现有基础，迁移成本低 |
| ORM | Prisma | 类型安全，开发效率高 |
| 数据库 | PostgreSQL 15 | 功能强大，支持JSON |
| 缓存 | Redis | 会话、缓存、消息队列 |
| 文件存储 | 阿里云OSS | 国内稳定，成本低 |
| 3D引擎 | Three.js + React Three Fiber | 现有基础 |
| 实时通信 | Socket.io | 已有基础 |

### 5.2 项目结构

```
research-project-system/
├── 📁 apps/
│   ├── 📁 web/                    # 管理后台 (React)
│   │   ├── src/
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   ├── 📁 metaverse/              # 元宇宙大屏 (Three.js)
│   │   ├── src/
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   └── 📁 server/                 # 后端服务 (Express)
│       ├── src/
│       ├── prisma/
│       ├── package.json
│       └── tsconfig.json
│
├── 📁 packages/
│   ├── 📁 shared/                 # 共享类型/工具
│   └── 📁 ui/                     # 共享UI组件
│
├── 📁 docs/
├── package.json                   # 根配置 (monorepo)
└── turbo.json                     # Turbo配置
```

### 5.3 数据库初始化

```bash
# 使用Prisma管理数据库
npx prisma init

# 定义模型后生成迁移
npx prisma migrate dev --name init

# 生成客户端
npx prisma generate

# 种子数据
npx prisma db seed
```

### 5.4 API设计

```typescript
// RESTful API 规范

// 客户管理
GET    /api/customers              # 客户列表
POST   /api/customers              # 创建客户
GET    /api/customers/:id          # 客户详情
PUT    /api/customers/:id          # 更新客户
DELETE /api/customers/:id          # 删除客户

// 项目管理
GET    /api/projects               # 项目列表(支持筛选)
POST   /api/projects               # 创建项目
GET    /api/projects/:id           # 项目详情
PUT    /api/projects/:id           # 更新项目
PUT    /api/projects/:id/stage     # 更新项目阶段
DELETE /api/projects/:id           # 删除项目

// 任务管理
GET    /api/projects/:id/tasks     # 项目任务列表
POST   /api/tasks                  # 创建任务
PUT    /api/tasks/:id              # 更新任务
PUT    /api/tasks/:id/status       # 更新任务状态

// 统计报表
GET    /api/dashboard/stats        # 仪表盘数据
GET    /api/reports/projects       # 项目报表
GET    /api/reports/customers      # 客户报表

// 元宇宙数据
GET    /api/metaverse/projects     # 3D项目数据
WS     /ws/metaverse               # 实时数据推送
```

---

## 六、分阶段开发计划

### 6.1 V1 MVP版本（6周）

**目标**：核心业务流程可跑通，内部可用

| 周次 | 任务 | 产出 |
|-----|------|------|
| Week 1 | 数据库设计 + 后端框架搭建 | API文档 + 基础接口 |
| Week 2 | 客户管理模块 | 客户CRUD完整功能 |
| Week 3 | 项目管理模块（四阶段） | 项目全流程管理 |
| Week 4 | 任务管理模块 | 任务看板 + 甘特图 |
| Week 5 | 元宇宙集成 | 3D项目展示 |
| Week 6 | 测试优化 | 可用版本 |

### 6.2 V2 增强版（4周）

**目标**：完善功能，飞书集成

- 文档管理 + 版本控制
- 飞书消息推送
- 报表统计
- 审批流程
- 移动端适配

### 6.3 V3 高级版（4周）

**目标**：智能化、客户门户

- AI智能助手（项目建议、风险预警）
- 客户门户（可选）
- 数据大屏增强
- 高级报表

---

## 七、风险与建议

### 7.1 技术风险

| 风险 | 等级 | 应对措施 |
|-----|-----|---------|
| 开发周期过长 | 中 | 严格MVP范围，先解决核心痛点 |
| 数据迁移困难 | 低 | 提供Excel导入模板 |
| 性能问题 | 低 | 合理使用索引、缓存 |

### 7.2 业务风险

| 风险 | 等级 | 应对措施 |
|-----|-----|---------|
| 用户接受度 | 中 | 小范围试点，收集反馈迭代 |
| 流程不匹配 | 中 | 流程可配置，保持灵活性 |

### 7.3 建议

1. **先小范围试点**：选1-2个正在进行的项目录入系统验证流程
2. **保持简单**：V1不做太复杂的配置，先用起来
3. **数据安全**：客户敏感信息注意权限控制
4. **备份策略**：数据库定期备份

---

## 八、下一步行动

### 刚哥需要决策：

1. **确认V1功能范围** - 是否有必须加或可以减的功能？
2. **历史数据** - 是否需要导入现有项目数据？
3. **集成需求** - 是否需要与飞书/钉钉打通？
4. **部署方式** - 阿里云服务器还是本地部署？

### 我可以立即开始：

1. 搭建项目框架（Monorepo + Prisma + React）
2. 设计数据库Schema
3. 开发客户管理模块

---

**规划完毕！刚哥请审阅，确认后我立即开始开发。** 🫡
