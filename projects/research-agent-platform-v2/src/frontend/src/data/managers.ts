// 角色详细数据配置
export type ManagerRole = 'president' | 'vp' | 'cto' | 'product' | 'marketing' | 'finance' | 'operations'
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

export const MANAGERS_DATA: Record<ManagerRole, ManagerInfo> = {
  president: {
    id: 'president',
    name: 'AI院长',
    title: '研究院院长',
    department: '院务办公室',
    color: '#DC143C',
    icon: '👔',
    description: '负责研究院整体战略规划与重大决策，统筹各职能部门协调运作，推动研究院数字化转型与创新发展。',
    responsibilities: [
      '制定研究院发展战略',
      '重大科研项目决策',
      '对外合作与资源整合',
      '人才培养与团队建设',
      '年度预算审批'
    ],
    skills: ['战略规划与执行', '高层决策分析', '团队领导力', '资源整合协调', '风险识别管控', '组织变革管理'],
    currentTask: '审批Q2季度研发计划',
    status: 'working' as ManagerStatus,
    stats: {
      efficiency: 95,
      collaboration: 90,
      innovation: 88,
      reliability: 98
    }
  },
  vp: {
    id: 'vp',
    name: 'AI副院长',
    title: '研究院副院长',
    department: '院务办公室',
    color: '#FF8C00',
    icon: '🎖️',
    description: '协助院长管理日常事务，负责各研究部门协调与监督，推动重点项目的执行落地。',
    responsibilities: [
      '日常运营管理',
      '部门协调与沟通',
      '项目进度监督',
      '绩效考核管理',
      '会议组织与决策执行'
    ],
    skills: ['跨部门协调沟通', '高效任务执行', '项目全周期管理', '团队激励建设', '业务流程优化', '冲突解决调解'],
    currentTask: '组织跨部门项目协调会',
    status: 'meeting' as ManagerStatus,
    stats: {
      efficiency: 92,
      collaboration: 96,
      innovation: 85,
      reliability: 94
    }
  },
  cto: {
    id: 'cto',
    name: 'AI总工',
    title: '首席技术官',
    department: '技术研发部',
    color: '#4169E1',
    icon: '🔬',
    description: '负责研究院技术架构设计与核心技术攻关，领导技术团队进行前沿技术研究与创新。',
    responsibilities: [
      '技术架构设计',
      '核心技术攻关',
      '技术标准制定',
      '研发团队管理',
      '技术成果转化'
    ],
    skills: ['系统架构设计', 'AI算法研发', '技术趋势前瞻', '研发团队管理', '技术创新孵化', '代码质量把控', '技术选型决策'],
    currentTask: '设计新一代AI平台架构',
    status: 'busy' as ManagerStatus,
    stats: {
      efficiency: 94,
      collaboration: 87,
      innovation: 98,
      reliability: 92
    }
  },
  product: {
    id: 'product',
    name: 'AI产品经理',
    title: '产品总监',
    department: '产品部',
    color: '#9932CC',
    icon: '📱',
    description: '负责研究院产品规划与需求分析，推动产品从概念到落地的全生命周期管理。',
    responsibilities: [
      '产品战略规划',
      '用户需求分析',
      '产品原型设计',
      '跨部门协调推进',
      '市场竞争分析'
    ],
    skills: ['用户需求洞察', '产品体验设计', '需求分析梳理', '竞品市场研究', '数据驱动决策', '原型交互设计', '产品生命周期管理'],
    currentTask: '调研AI教育产品市场需求',
    status: 'working' as ManagerStatus,
    stats: {
      efficiency: 90,
      collaboration: 93,
      innovation: 92,
      reliability: 89
    }
  },
  marketing: {
    id: 'marketing',
    name: 'AI市场经理',
    title: '市场总监',
    department: '市场部',
    color: '#FF1493',
    icon: '📢',
    description: '负责研究院品牌建设与市场推广，拓展合作渠道，提升研究院行业影响力。',
    responsibilities: [
      '品牌策略制定',
      '市场推广执行',
      '媒体关系维护',
      '活动策划组织',
      '合作渠道拓展'
    ],
    skills: ['品牌战略规划', '营销活动策划', '媒体公关传播', '渠道合作拓展', '创意内容创作', '社交媒体运营', '市场数据分析'],
    currentTask: '筹备年度科技成果发布会',
    status: 'meeting' as ManagerStatus,
    stats: {
      efficiency: 91,
      collaboration: 94,
      innovation: 90,
      reliability: 88
    }
  },
  finance: {
    id: 'finance',
    name: 'AI财务经理',
    title: '财务总监',
    department: '财务部',
    color: '#228B22',
    icon: '💰',
    description: '负责研究院财务管理与预算控制，确保资金使用合规高效，支持业务发展。',
    responsibilities: [
      '财务预算管理',
      '成本控制分析',
      '财务报表编制',
      '审计合规管理',
      '投资决策支持'
    ],
    skills: ['财务报表分析', '成本精细化控制', '投资风险评估', '合规审计管理', '财务数据建模', '预算编制管理', '税务筹划优化'],
    currentTask: '编制年度财务审计报告',
    status: 'busy' as ManagerStatus,
    stats: {
      efficiency: 96,
      collaboration: 85,
      innovation: 82,
      reliability: 99
    }
  },
  operations: {
    id: 'operations',
    name: 'AI运营经理',
    title: '运营总监',
    department: '运营部',
    color: '#008B8B',
    icon: '⚙️',
    description: '负责研究院日常运营管理与流程优化，确保各项业务高效运转，提升组织效能。',
    responsibilities: [
      '运营流程优化',
      '资源调配管理',
      '服务质量监控',
      '数据分析报告',
      '办公环境管理'
    ],
    skills: ['运营流程优化', '业务数据分析', '资源高效配置', '服务质量管理', '系统化思维', '运营指标监控', '问题诊断解决'],
    currentTask: '优化内部审批流程系统',
    status: 'idle' as ManagerStatus,
    stats: {
      efficiency: 93,
      collaboration: 91,
      innovation: 86,
      reliability: 95
    }
  }
}

// 角色配置（用于渲染）
export const ROLE_CONFIG = {
  president: { name: 'AI院长', color: '#DC143C', icon: '👔', height: 1.6, scale: 1.1 },
  vp: { name: 'AI副院长', color: '#FF8C00', icon: '🎖️', height: 1.55, scale: 1.05 },
  cto: { name: 'AI总工', color: '#4169E1', icon: '🔬', height: 1.5, scale: 1.0 },
  product: { name: 'AI产品经理', color: '#9932CC', icon: '📱', height: 1.45, scale: 0.95 },
  marketing: { name: 'AI市场经理', color: '#FF1493', icon: '📢', height: 1.45, scale: 0.95 },
  finance: { name: 'AI财务经理', color: '#228B22', icon: '💰', height: 1.4, scale: 0.9 },
  operations: { name: 'AI运营经理', color: '#008B8B', icon: '⚙️', height: 1.4, scale: 0.9 }
}
