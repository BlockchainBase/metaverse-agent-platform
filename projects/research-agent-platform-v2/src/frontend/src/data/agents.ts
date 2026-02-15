// 研究院AI Agent协作平台 - 业务角色配置
// 7个OpenClaw数字员工（运维职能合并到交付），部门作为任务中心

export type AgentRole = 
  | 'market'      // 市场专员
  | 'solution'    // 方案架构师
  | 'project'     // 项目管家
  | 'developer'   // 开发工程师
  | 'delivery'    // 交付专家（含运维职能）
  | 'finance'     // 财务助手
  | 'director'    // 院长助理

export type AgentStatus = 'working' | 'idle' | 'meeting' | 'busy' | 'offline'

export interface AgentStatusInfo {
  label: string
  icon: string
  color: string
  bgColor: string
}

export const STATUS_CONFIG: Record<AgentStatus, AgentStatusInfo> = {
  working: { label: '工作中', icon: '💻', color: '#4CAF50', bgColor: '#E8F5E9' },
  idle: { label: '待机中', icon: '☕', color: '#2196F3', bgColor: '#E3F2FD' },
  meeting: { label: '会议中', icon: '🗣️', color: '#FF9800', bgColor: '#FFF3E0' },
  busy: { label: '忙碌', icon: '🔥', color: '#F44336', bgColor: '#FFEBEE' },
  offline: { label: '离线', icon: '🌙', color: '#9E9E9E', bgColor: '#F5F5F5' }
}

// 部门任务接口 - 部门作为任务中心
export interface DepartmentTask {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'blocked'
  priority: 'high' | 'medium' | 'low'
  assignee: AgentRole
  dueDate: string
  progress: number
}

// 部门配置 - 部门作为任务中心
export interface DepartmentInfo {
  id: string
  name: string
  stage: string
  description: string
  color: string
  // 部门当前任务列表
  tasks: DepartmentTask[]
  // 部门目标/KPI
  objectives: string[]
  // 部门统计
  stats: {
    totalTasks: number
    completedTasks: number
    inProgressTasks: number
    blockedTasks: number
  }
}

// OpenClaw设备信息
export interface OpenClawDevice {
  deviceId: string
  deviceName: string
  hostName: string
  lastSeen: string
  status: 'online' | 'offline'
}

export interface AgentInfo {
  id: AgentRole
  name: string
  title: string
  department: string
  color: string
  icon: string
  emoji: string
  description: string
  // 角色能力清单 - 角色作为能力中心
  capabilities: string[]
  skills: string[]
  // 当前执行的具体任务
  currentTask: string
  status: AgentStatus
  // OpenClaw关联信息
  openclawDevice?: OpenClawDevice
  ownerName: string
  ownerEmail: string
  // 协作统计
  stats: {
    tasksCompleted: number
    tasksPending: number
    collaborationScore: number
    responseTime: number
  }
  // 工作流位置（元宇宙3D坐标）
  position: [number, number, number]
}

// 部门任务数据 - 部门作为任务中心
export const DEPARTMENTS_DATA: Record<string, DepartmentInfo> = {
  market: {
    id: 'market',
    name: '市场部',
    stage: '阶段1：市场对接',
    description: '负责客户线索管理、商机跟进、市场拓展',
    color: '#3B82F6',
    tasks: [
      {
        id: 'm1',
        title: '跟进XX教育局智慧校园项目',
        description: '完成初步需求沟通，输出商机评估报告',
        status: 'in_progress',
        priority: 'high',
        assignee: 'market',
        dueDate: '2026-02-20',
        progress: 60
      },
      {
        id: 'm2',
        title: '收集行业竞品信息',
        description: '调研3家主要竞品的功能特点和定价策略',
        status: 'pending',
        priority: 'medium',
        assignee: 'market',
        dueDate: '2026-02-25',
        progress: 0
      },
      {
        id: 'm3',
        title: '客户满意度回访',
        description: '对已交付项目进行回访，收集客户反馈',
        status: 'pending',
        priority: 'low',
        assignee: 'market',
        dueDate: '2026-02-28',
        progress: 0
      }
    ],
    objectives: [
      '本月完成5个新客户线索跟进',
      '商机转化率达到35%',
      '客户满意度保持90%以上'
    ],
    stats: {
      totalTasks: 12,
      completedTasks: 7,
      inProgressTasks: 3,
      blockedTasks: 2
    }
  },
  solution: {
    id: 'solution',
    name: '方案部',
    stage: '阶段2&3：方案制定+研发Demo',
    description: '负责需求分析、方案设计、原型制作、技术开发、Demo构建',
    color: '#F59E0B',
    tasks: [
      {
        id: 's1',
        title: '智慧校园系统架构设计',
        description: '完成技术架构设计和原型Demo制作',
        status: 'in_progress',
        priority: 'high',
        assignee: 'solution',
        dueDate: '2026-02-18',
        progress: 80
      },
      {
        id: 's2',
        title: '技术可行性评估',
        description: '评估AI大模型集成的技术可行性',
        status: 'in_progress',
        priority: 'high',
        assignee: 'solution',
        dueDate: '2026-02-22',
        progress: 40
      },
      {
        id: 's3',
        title: '用户管理模块开发',
        description: '完成用户登录、权限管理功能开发',
        status: 'in_progress',
        priority: 'high',
        assignee: 'developer',
        dueDate: '2026-02-18',
        progress: 75
      },
      {
        id: 's4',
        title: '数据看板接口开发',
        description: '开发Dashboard数据API接口',
        status: 'in_progress',
        priority: 'high',
        assignee: 'developer',
        dueDate: '2026-02-20',
        progress: 50
      },
      {
        id: 's5',
        title: '更新技术方案模板',
        description: '根据最新项目经验更新方案模板库',
        status: 'pending',
        priority: 'low',
        assignee: 'solution',
        dueDate: '2026-02-28',
        progress: 0
      }
    ],
    objectives: [
      '本周完成智慧校园方案评审',
      '方案评审通过率保持85%以上',
      '原型制作周期控制在5个工作日内',
      '代码评审覆盖率100%',
      'Bug修复响应时间<4小时'
    ],
    stats: {
      totalTasks: 15,
      completedTasks: 8,
      inProgressTasks: 5,
      blockedTasks: 2
    }
  },
  management: {
    id: 'management',
    name: '综管部',
    stage: '综合职能：财务+人事+项目管理',
    description: '负责财务管理、人事管理、项目统筹、资源协调',
    color: '#10B981',
    tasks: [
      {
        id: 'mgt1',
        title: '智慧校园项目资源协调',
        description: '协调开发、测试资源，确保项目进度',
        status: 'in_progress',
        priority: 'high',
        assignee: 'project',
        dueDate: '2026-02-15',
        progress: 90
      },
      {
        id: 'mgt2',
        title: '制定Q2项目计划',
        description: '制定第二季度项目排期和里程碑',
        status: 'in_progress',
        priority: 'high',
        assignee: 'project',
        dueDate: '2026-02-25',
        progress: 30
      },
      {
        id: 'mgt3',
        title: '月度财务结算',
        description: '完成2月份项目成本核算和收款跟踪',
        status: 'in_progress',
        priority: 'high',
        assignee: 'finance',
        dueDate: '2026-02-28',
        progress: 70
      },
      {
        id: 'mgt4',
        title: '人员招聘需求评估',
        description: '评估技术团队人员缺口，制定招聘计划',
        status: 'pending',
        priority: 'medium',
        assignee: 'director',
        dueDate: '2026-02-20',
        progress: 0
      },
      {
        id: 'mgt5',
        title: '项目风险评估',
        description: '识别并制定智慧校园项目风险应对策略',
        status: 'pending',
        priority: 'medium',
        assignee: 'project',
        dueDate: '2026-02-20',
        progress: 0
      }
    ],
    objectives: [
      '所有项目按时交付率达到90%',
      '项目风险识别率100%',
      '资源利用率保持在85%以上',
      '财务报表准确率100%',
      '收款节点跟踪无遗漏'
    ],
    stats: {
      totalTasks: 35,
      completedTasks: 25,
      inProgressTasks: 7,
      blockedTasks: 3
    }
  },
  delivery: {
    id: 'delivery',
    name: '交付部',
    stage: '阶段4：实施交付',
    description: '负责部署上线、客户培训、运维支持',
    color: '#06B6D4',
    tasks: [
      {
        id: 'dl1',
        title: '智慧校园项目部署准备',
        description: '准备生产环境部署脚本和配置',
        status: 'in_progress',
        priority: 'high',
        assignee: 'delivery',
        dueDate: '2026-02-22',
        progress: 40
      },
      {
        id: 'dl2',
        title: '客户培训材料准备',
        description: '制作用户操作手册和培训PPT',
        status: 'pending',
        priority: 'medium',
        assignee: 'delivery',
        dueDate: '2026-02-25',
        progress: 0
      },
      {
        id: 'dl3',
        title: '系统监控告警优化',
        description: '优化系统监控告警规则，减少误报',
        status: 'pending',
        priority: 'low',
        assignee: 'delivery',
        dueDate: '2026-02-28',
        progress: 0
      }
    ],
    objectives: [
      '部署成功率保持100%',
      '客户培训满意度>95%',
      '系统可用性99.9%以上'
    ],
    stats: {
      totalTasks: 12,
      completedTasks: 8,
      inProgressTasks: 3,
      blockedTasks: 1
    }
  },
  finance: {
    id: 'finance',
    name: '财务部',
    stage: '全流程：财务管理',
    description: '负责预算管理、成本核算、收款跟踪',
    color: '#F97316',
    tasks: [
      {
        id: 'f1',
        title: 'Q1项目成本核算',
        description: '核算第一季度各项目成本支出',
        status: 'in_progress',
        priority: 'high',
        assignee: 'finance',
        dueDate: '2026-02-20',
        progress: 70
      },
      {
        id: 'f2',
        title: '收款节点跟踪',
        description: '跟进智慧校园项目第二笔款项',
        status: 'in_progress',
        priority: 'high',
        assignee: 'finance',
        dueDate: '2026-02-15',
        progress: 85
      }
    ],
    objectives: [
      '成本控制率>95%',
      '收款及时率100%',
      '财务报表准确率100%'
    ],
    stats: {
      totalTasks: 18,
      completedTasks: 14,
      inProgressTasks: 3,
      blockedTasks: 1
    }
  },
  director: {
    id: 'director',
    name: '院务办公室',
    stage: '全流程：院务管理',
    description: '负责全局监控、决策支持、异常预警',
    color: '#EF4444',
    tasks: [
      {
        id: 'dr1',
        title: '月度项目报告生成',
        description: '生成2月份项目执行报告',
        status: 'in_progress',
        priority: 'high',
        assignee: 'director',
        dueDate: '2026-02-15',
        progress: 60
      },
      {
        id: 'dr2',
        title: '战略项目评估',
        description: '评估新签项目的战略价值',
        status: 'pending',
        priority: 'medium',
        assignee: 'director',
        dueDate: '2026-02-25',
        progress: 0
      }
    ],
    objectives: [
      '项目成功率>90%',
      '异常响应时间<1小时',
      '决策支持满意度>95%'
    ],
    stats: {
      totalTasks: 15,
      completedTasks: 12,
      inProgressTasks: 2,
      blockedTasks: 1
    }
  }
}

// 7个Agent详细配置（devops已合并到delivery）
export const AGENTS_DATA: Record<AgentRole, AgentInfo> = {
  market: {
    id: 'market',
    name: 'AI市场专员',
    title: '市场专员',
    department: '市场部',
    color: '#3B82F6',
    icon: '🤝',
    emoji: '🤝',
    description: '负责客户线索管理、初步沟通、商机跟进，是市场拓展的第一接触点。',
    capabilities: [
      '客户线索收集与分级',
      '初步需求沟通',
      '商机评估与跟进',
      '客户关系维护',
      '市场情报收集'
    ],
    skills: ['客户沟通', '需求挖掘', '商机评估', '关系维护', '市场分析', '谈判技巧'],
    currentTask: '跟进XX教育局智慧校园项目',
    status: 'working',
    ownerName: '市场经理',
    ownerEmail: 'market@research.com',
    stats: {
      tasksCompleted: 12,
      tasksPending: 3,
      collaborationScore: 85,
      responseTime: 15
    },
    position: [-15, 0, 10]
  },
  solution: {
    id: 'solution',
    name: 'AI方案架构师',
    title: '方案架构师',
    department: '方案部',
    color: '#F59E0B',
    icon: '📐',
    emoji: '📐',
    description: '负责需求分析、方案设计、原型制作、技术开发、Demo构建，将客户需求转化为完整的技术方案和实现。',
    capabilities: [
      '客户需求调研',
      '技术方案设计',
      '原型Demo制作',
      '方案汇报演示',
      '技术可行性评估',
      '技术任务拆解',
      '代码开发实现',
      'Code Review',
      '系统调试优化'
    ],
    skills: ['需求分析', '方案设计', '原型制作', '技术架构', 'PPT演示', '风险评估', '前端开发', '后端开发', '数据库', '版本控制', '代码审查'],
    currentTask: '设计智慧校园系统架构并开发核心模块',
    status: 'working',
    ownerName: '技术总工',
    ownerEmail: 'cto@research.com',
    stats: {
      tasksCompleted: 15,
      tasksPending: 4,
      collaborationScore: 92,
      responseTime: 30
    },
    position: [-5, 0, 5]
  },
  project: {
    id: 'project',
    name: 'AI项目管家',
    title: '项目管家',
    department: '综管部',
    color: '#8B5CF6',
    icon: '📋',
    emoji: '📋',
    description: '负责项目统筹、进度跟踪、资源协调，隶属综管部统筹项目管理职能。',
    capabilities: [
      '项目计划制定',
      '进度跟踪监控',
      '资源协调分配',
      '风险预警处理',
      '跨部门协作'
    ],
    skills: ['项目规划', '进度管理', '资源协调', '风险管控', '团队协作', '汇报沟通'],
    currentTask: '协调智慧校园项目资源',
    status: 'meeting',
    ownerName: '项目经理',
    ownerEmail: 'pm@research.com',
    stats: {
      tasksCompleted: 25,
      tasksPending: 5,
      collaborationScore: 95,
      responseTime: 10
    },
    position: [0, 0, -8]
  },
  developer: {
    id: 'developer',
    name: 'AI开发工程师',
    title: '开发工程师',
    department: '方案部',
    color: '#10B981',
    icon: '💻',
    emoji: '💻',
    description: '负责代码开发、Demo构建、技术实现，与方案架构师协同完成产品功能开发。',
    capabilities: [
      '技术任务拆解',
      '代码开发实现',
      'Code Review',
      'Demo环境搭建',
      'Bug修复优化'
    ],
    skills: ['前端开发', '后端开发', '数据库', '版本控制', '代码审查', '系统调试'],
    currentTask: '开发用户管理模块',
    status: 'busy',
    ownerName: '技术负责人',
    ownerEmail: 'dev@research.com',
    stats: {
      tasksCompleted: 45,
      tasksPending: 8,
      collaborationScore: 88,
      responseTime: 20
    },
    position: [8, 0, 2]
  },
  delivery: {
    id: 'delivery',
    name: 'AI交付专家',
    title: '交付专家',
    department: '交付部',
    color: '#06B6D4',
    icon: '🚀',
    emoji: '🚀',
    description: '负责部署上线、客户培训、运维支持，确保项目顺利交付和稳定运行。（已合并运维职能）',
    capabilities: [
      '生产环境部署',
      '客户培训',
      '交付文档编写',
      '运维交接',
      '售后支持',
      '系统监控告警',
      '性能优化',
      '故障排查'
    ],
    skills: ['系统部署', '客户培训', '文档编写', '运维支持', '问题排查', '沟通协调', '性能优化', '安全防护'],
    currentTask: '准备智慧校园项目部署 + 优化系统监控',
    status: 'idle',
    ownerName: '实施经理',
    ownerEmail: 'delivery@research.com',
    stats: {
      tasksCompleted: 28,
      tasksPending: 4,
      collaborationScore: 90,
      responseTime: 18
    },
    position: [15, 0, -5]
  },
  finance: {
    id: 'finance',
    name: 'AI财务助手',
    title: '财务助手',
    department: '综管部',
    color: '#F97316',
    icon: '💰',
    emoji: '💰',
    description: '负责预算管理、成本核算、收款跟踪，隶属综管部统筹财务职能。',
    capabilities: [
      '项目预算编制',
      '成本核算分析',
      '收款节点跟踪',
      '财务报表生成',
      '利润分析'
    ],
    skills: ['预算管理', '成本核算', '财务分析', '收款管理', '报表制作', '风险控制'],
    currentTask: '核算Q1项目成本',
    status: 'working',
    ownerName: '财务经理',
    ownerEmail: 'finance@research.com',
    stats: {
      tasksCompleted: 18,
      tasksPending: 4,
      collaborationScore: 82,
      responseTime: 45
    },
    position: [-2, 0, -8]
  },
  director: {
    id: 'director',
    name: 'AI院长助理',
    title: '院长助理',
    department: '院务办公室',
    color: '#EF4444',
    icon: '👑',
    emoji: '👑',
    description: '负责全局监控、决策支持、异常预警，协助院长管理研究院。',
    capabilities: [
      '全局数据监控',
      '异常预警处理',
      '决策支持分析',
      '重要事项提醒',
      '跨部门协调'
    ],
    skills: ['全局视野', '数据分析', '决策支持', '预警管理', '综合协调', '汇报能力'],
    currentTask: '生成月度项目报告',
    status: 'working',
    ownerName: '刚哥',
    ownerEmail: 'director@research.com',
    stats: {
      tasksCompleted: 35,
      tasksPending: 2,
      collaborationScore: 98,
      responseTime: 5
    },
    position: [0, 5, -15]
  }
}

// 角色渲染配置
export const ROLE_CONFIG: Record<AgentRole, { name: string; color: string; icon: string; emoji: string; height: number; scale: number }> = {
  market: { name: 'AI市场专员', color: '#3B82F6', icon: '🤝', emoji: '🤝', height: 1.45, scale: 0.95 },
  solution: { name: 'AI方案架构师', color: '#F59E0B', icon: '📐', emoji: '📐', height: 1.5, scale: 1.0 },
  project: { name: 'AI项目管家', color: '#8B5CF6', icon: '📋', emoji: '📋', height: 1.55, scale: 1.05 },
  developer: { name: 'AI开发工程师', color: '#10B981', icon: '💻', emoji: '💻', height: 1.45, scale: 0.95 },
  delivery: { name: 'AI交付专家', color: '#06B6D4', icon: '🚀', emoji: '🚀', height: 1.45, scale: 0.95 },
  finance: { name: 'AI财务助手', color: '#F97316', icon: '💰', emoji: '💰', height: 1.4, scale: 0.9 },
  director: { name: 'AI院长助理', color: '#EF4444', icon: '👑', emoji: '👑', height: 1.6, scale: 1.1 }
}

// 阶段配置
export const STAGE_CONFIG = {
  stage1: { name: '市场对接', color: '#3B82F6', position: [-15, 0, 10] as [number, number, number] },
  stage2: { name: '方案制定', color: '#F59E0B', position: [-5, 0, 5] as [number, number, number] },
  stage3: { name: '研发Demo', color: '#EF4444', position: [5, 0, 0] as [number, number, number] },
  stage4: { name: '实施交付', color: '#10B981', position: [15, 0, -5] as [number, number, number] }
}
