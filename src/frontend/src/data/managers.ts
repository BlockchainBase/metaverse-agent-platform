// 数字员工角色配置 - 研究院孵化企业版本
export type ManagerRole = 'marketing' | 'solution' | 'developer' | 'devops' | 'project' | 'finance' | 'assistant'
export type ManagerStatus = 'working' | 'idle' | 'meeting' | 'busy' | 'offline'

export interface ManagerStatusInfo {
  label: string
  icon: string
  color: string
  bgColor: string
}

export const STATUS_CONFIG: Record<ManagerStatus, ManagerStatusInfo> = {
  working: { label: '工作中', icon: '💻', color: '#4CAF50', bgColor: '#E8F5E9' },
  idle: { label: '待机中', icon: '☕', color: '#2196F3', bgColor: '#E3F2FD' },
  meeting: { label: '会议中', icon: '🗣️', color: '#FF9800', bgColor: '#FFF3E0' },
  busy: { label: '忙碌', icon: '🔥', color: '#F44336', bgColor: '#FFEBEE' },
  offline: { label: '离线', icon: '🌙', color: '#9E9E9E', bgColor: '#F5F5F5' }
}

export interface ManagerInfo {
  id: ManagerRole
  name: string
  title: string
  department: string
  color: string
  icon: string
  description: string
  responsibilities: string[]
  skills: string[]
  currentTask: string
  status: ManagerStatus
  stats: {
    efficiency: number
    collaboration: number
    innovation: number
    reliability: number
  }
}

// 部门配置
export const DEPARTMENTS = {
  marketing: { name: '市场部', color: '#E91E63', icon: '🎯' },
  solution: { name: '方案部', color: '#9C27B0', icon: '💡' },
  delivery: { name: '交付部', color: '#2196F3', icon: '🚀' },
  management: { name: '综管部', color: '#4CAF50', icon: '📋' },
  executive: { name: '管理层', color: '#F44336', icon: '👔' }
}

// 7个AI数字员工详细配置
export const MANAGERS_DATA: Record<ManagerRole, ManagerInfo> = {
  // ① AI市场专员 - 市场部
  marketing: {
    id: 'marketing',
    name: 'AI市场专员',
    title: '市场专员',
    department: '市场部',
    color: '#E91E63',
    icon: '🎯',
    description: '负责市场调研、客户开发和需求挖掘，是项目获客的第一触点，连接研究院与外部客户。',
    responsibilities: [
      '市场调研与需求分析',
      '潜在客户开发与跟进',
      '客户需求初步沟通',
      '市场活动组织执行',
      '竞争对手情报收集'
    ],
    skills: ['客户需求洞察', '商务沟通谈判', '市场数据分析', '演讲与展示', 'CRM系统操作', '竞品情报分析'],
    currentTask: '调研教育行业AI应用需求',
    status: 'working' as ManagerStatus,
    stats: {
      efficiency: 88,
      collaboration: 90,
      innovation: 85,
      reliability: 92
    }
  },

  // ② AI方案专家 - 方案部
  solution: {
    id: 'solution',
    name: 'AI方案专家',
    title: '方案专家',
    department: '方案部',
    color: '#9C27B0',
    icon: '💡',
    description: '负责产品规划与解决方案设计，将客户需求转化为可落地的技术方案和产品原型。',
    responsibilities: [
      '客户需求深度分析',
      '解决方案架构设计',
      '产品功能规划',
      '技术可行性评估',
      '方案文档编写'
    ],
    skills: ['需求分析建模', '产品原型设计', '系统架构规划', '技术选型决策', '方案文档编写', '用户体验设计'],
    currentTask: '设计智慧校园整体解决方案',
    status: 'busy' as ManagerStatus,
    stats: {
      efficiency: 92,
      collaboration: 94,
      innovation: 96,
      reliability: 90
    }
  },

  // ③ AI研发专家 - 交付部
  developer: {
    id: 'developer',
    name: 'AI研发专家',
    title: '研发专家',
    department: '交付部',
    color: '#2196F3',
    icon: '💻',
    description: '负责核心技术开发与架构实现，是全栈技术负责人，确保产品高质量交付。',
    responsibilities: [
      '系统架构设计与实现',
      '核心功能代码开发',
      '代码审查与质量把控',
      '技术难题攻关',
      '开发文档编写'
    ],
    skills: ['全栈技术开发', '系统架构设计', '代码质量把控', '技术难题攻关', '敏捷开发实践', '技术文档编写'],
    currentTask: '开发AI助手核心引擎',
    status: 'working' as ManagerStatus,
    stats: {
      efficiency: 95,
      collaboration: 88,
      innovation: 94,
      reliability: 93
    }
  },

  // ④ AI交付与运维专家 - 交付部
  devops: {
    id: 'devops',
    name: 'AI交付与运维专家',
    title: '交付运维专家',
    department: '交付部',
    color: '#00BCD4',
    icon: '🚀',
    description: '负责产品部署上线、系统运维和监控，确保系统稳定运行和持续交付。',
    responsibilities: [
      '自动化部署流水线',
      '系统监控与告警',
      '性能优化与调优',
      '故障排查与恢复',
      '运维文档维护'
    ],
    skills: ['CI/CD流水线', '容器化部署', '系统监控告警', '性能优化调优', '故障快速恢复', '云原生技术'],
    currentTask: '搭建Kubernetes集群',
    status: 'idle' as ManagerStatus,
    stats: {
      efficiency: 93,
      collaboration: 87,
      innovation: 88,
      reliability: 97
    }
  },

  // ⑤ AI项目管家 - 跨部门
  project: {
    id: 'project',
    name: 'AI项目管家',
    title: '项目管家',
    department: '管理层',
    color: '#FF9800',
    icon: '📊',
    description: '负责项目全生命周期管理，协调各部门资源，确保项目按时高质量交付。',
    responsibilities: [
      '项目计划制定与跟踪',
      '跨部门资源协调',
      '项目风险管理',
      '进度监控与汇报',
      '项目交付验收'
    ],
    skills: ['项目全周期管理', '资源协调配置', '风险识别管控', '进度跟踪汇报', '敏捷项目管理', '团队沟通协作'],
    currentTask: '协调Q1重点项目交付',
    status: 'meeting' as ManagerStatus,
    stats: {
      efficiency: 94,
      collaboration: 98,
      innovation: 85,
      reliability: 95
    }
  },

  // ⑥ AI财务专家 - 综管部
  finance: {
    id: 'finance',
    name: 'AI财务专家',
    title: '财务专家',
    department: '综管部',
    color: '#4CAF50',
    icon: '💰',
    description: '负责项目预算管理、成本控制和财务结算，确保项目经济效益最大化。',
    responsibilities: [
      '项目预算编制审核',
      '成本跟踪与控制',
      '财务报表分析',
      '项目结算与审计',
      '投资决策支持'
    ],
    skills: ['财务预算管理', '成本精细化控制', '财务报表分析', '项目投资评估', '合规审计管理', '税务筹划优化'],
    currentTask: '编制Q2项目预算',
    status: 'busy' as ManagerStatus,
    stats: {
      efficiency: 96,
      collaboration: 86,
      innovation: 80,
      reliability: 99
    }
  },

  // ⑦ AI院长助理 - 管理层
  assistant: {
    id: 'assistant',
    name: 'AI院长助理',
    title: '院长助理',
    department: '管理层',
    color: '#F44336',
    icon: '👔',
    description: '负责对接院长、传达战略意图，协助院长进行决策支持和对外沟通。',
    responsibilities: [
      '战略意图传达落实',
      '重要事项汇报整理',
      '高层会议组织协调',
      '对外合作对接沟通',
      '决策支持分析'
    ],
    skills: ['高层沟通协调', '战略理解执行', '信息汇总分析', '公文写作汇报', '对外关系维护', '决策支持分析'],
    currentTask: '准备院长月度汇报材料',
    status: 'working' as ManagerStatus,
    stats: {
      efficiency: 91,
      collaboration: 95,
      innovation: 87,
      reliability: 96
    }
  }
}

// 角色渲染配置（用于3D场景）
export const ROLE_CONFIG = {
  marketing: { name: 'AI市场专员', color: '#E91E63', icon: '🎯', height: 1.45, scale: 0.95, department: '市场部' },
  solution: { name: 'AI方案专家', color: '#9C27B0', icon: '💡', height: 1.5, scale: 1.0, department: '方案部' },
  developer: { name: 'AI研发专家', color: '#2196F3', icon: '💻', height: 1.5, scale: 1.0, department: '交付部' },
  devops: { name: 'AI交付与运维专家', color: '#00BCD4', icon: '🚀', height: 1.45, scale: 0.95, department: '交付部' },
  project: { name: 'AI项目管家', color: '#FF9800', icon: '📊', height: 1.55, scale: 1.05, department: '管理层' },
  finance: { name: 'AI财务专家', color: '#4CAF50', icon: '💰', height: 1.45, scale: 0.95, department: '综管部' },
  assistant: { name: 'AI院长助理', color: '#F44336', icon: '👔', height: 1.55, scale: 1.05, department: '管理层' }
}

// 任务类型配置
export const TASK_TYPES = {
  marketing: { name: '市场类任务', department: '市场部', icon: '🎯', color: '#E91E63' },
  solution: { name: '方案与产品类任务', department: '方案部', icon: '💡', color: '#9C27B0' },
  delivery: { name: '交付与运维类任务', department: '交付部', icon: '🚀', color: '#2196F3' },
  management: { name: '财务与管理类任务', department: '综管部', icon: '📋', color: '#4CAF50' }
}

// ============================================
// v3.0 新增：四合院四房布局位置配置
// ============================================

// 房间定义
export const ROOMS = {
  south: {  // 南房 - 市场部
    name: '市场部',
    position: [0, 0, 12] as [number, number, number],
    color: '#E91E63',
    description: '客户入口，需求初判'
  },
  east: {   // 东厢房 - 方案部
    name: '方案部',
    position: [10, 0, 0] as [number, number, number],
    color: '#9C27B0',
    description: '方案设计，架构规划'
  },
  west: {   // 西厢房 - 交付部
    name: '交付部',
    position: [-10, 0, 0] as [number, number, number],
    color: '#2196F3',
    description: '技术实现，部署运维'
  },
  north: {  // 北房 - 管理中心
    name: '管理中心',
    position: [0, 0, -10] as [number, number, number],
    color: '#F44336',
    description: '项目协调，决策中心'
  }
}

// v3.0 角色位置配置（四房布局）
// 支持多实例：数组表示该角色可以有多个Agent实例，分布在不同位置
export const ROLE_POSITIONS_V3: Record<ManagerRole, [number, number, number] | [number, number, number][]> = {
  // 南房（前）- 市场部：市场专员（可多个实例）
  marketing: [
    [0, 0, 12],    // 中央
    [3, 0, 12],    // 偏右
    [-3, 0, 12]    // 偏左
  ],
  
  // 东厢房（右）- 方案部：方案专家 + 研发专家（前端）
  solution: [
    [10, 0, -3],   // 方案专家位置1
    [10, 0, 3]     // 方案专家位置2
  ],
  
  // 研发专家 - 分布在东房和西房
  developer: [
    [12, 0, -3],   // 东房研发位置1
    [12, 0, 3],    // 东房研发位置2
    [-12, 0, -3],  // 西房研发位置1
    [-12, 0, 3]    // 西房研发位置2
  ],
  
  // 西厢房（左）- 交付部：交付运维
  devops: [
    [-10, 0, -3],  // 交付运维位置1
    [-10, 0, 3]    // 交付运维位置2
  ],
  
  // 北房（后）- 管理中心
  assistant: [-4, 0, -10],   // 左：院长助理
  project: [0, 0, -10],      // 中：项目管家
  finance: [4, 0, -10]       // 右：财务专家
}

// 获取Agent位置的工具函数
export function getAgentPositionV3(
  role: ManagerRole,
  agentIndex: number = 0,
  assignment?: 'east' | 'west'  // 研发Agent的东西房分配
): [number, number, number] {
  const positions = ROLE_POSITIONS_V3[role]
  
  // 如果是数组的数组（多位置），根据assignment筛选位置
  if (Array.isArray(positions[0])) {
    const posArray = positions as [number, number, number][]
    
    // 特殊处理研发Agent的东西房分配
    if (role === 'developer' && assignment) {
      // 东房: x > 0, 西房: x < 0
      const filteredPositions = posArray.filter(pos => 
        assignment === 'east' ? pos[0] > 0 : pos[0] < 0
      )
      if (filteredPositions.length > 0) {
        return filteredPositions[agentIndex % filteredPositions.length]
      }
    }
    
    return posArray[agentIndex % posArray.length]
  }
  
  // 单位置直接返回
  return positions as [number, number, number]
}

// 获取角色所属房间
export function getAgentRoom(role: ManagerRole, assignment?: 'east' | 'west'): keyof typeof ROOMS {
  switch (role) {
    case 'marketing':
      return 'south'
    case 'solution':
      return 'east'
    case 'developer':
      return assignment === 'east' ? 'east' : 'west'
    case 'devops':
      return 'west'
    case 'project':
    case 'finance':
    case 'assistant':
      return 'north'
    default:
      return 'north'
  }
}
