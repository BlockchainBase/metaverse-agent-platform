/**
 * 11 Agent 配置文件
 * 包含所有Agent的完整配置
 */

import { AgentProfile, AgentRole } from '../types.js'

// ==================== 市场部 (2人) ====================

export const MARKETER_1: AgentProfile = {
  id: 'M1',
  name: '李拓',
  role: 'marketing',
  position: [-3, 0, 12],
  
  capabilities: {
    customer_acquisition: 70,
    requirement_analysis: 80,
    communication: 85,
    negotiation: 75,
    market_research: 70,
    presentation: 80
  },
  
  personality: {
    proactivity: 85,
    thoroughness: 70,
    speed: 80,
    collaboration: 75,
    riskTolerance: 70
  },
  
  initialState: {
    status: 'idle',
    workload: 0,
    energy: 100,
    currentTasks: [],
    lastUpdate: Date.now()
  }
}

export const MARKETER_2: AgentProfile = {
  id: 'M2',
  name: '周展',
  role: 'marketing',
  position: [3, 0, 12],
  
  capabilities: {
    customer_acquisition: 80,
    requirement_analysis: 70,
    communication: 80,
    negotiation: 85,
    market_research: 75,
    presentation: 75
  },
  
  personality: {
    proactivity: 75,
    thoroughness: 85,
    speed: 70,
    collaboration: 80,
    riskTolerance: 60
  },
  
  initialState: {
    status: 'idle',
    workload: 0,
    energy: 100,
    currentTasks: [],
    lastUpdate: Date.now()
  }
}

// ==================== 方案部 (2人) ====================

export const SOLUTIONIST_1: AgentProfile = {
  id: 'S1',
  name: '王谋',
  role: 'solution',
  position: [8, 0, -3],
  
  capabilities: {
    product_design: 85,
    architecture: 75,
    innovation: 90,
    technical_writing: 80,
    requirement_analysis: 85,
    feasibility_analysis: 80
  },
  
  personality: {
    proactivity: 80,
    thoroughness: 75,
    speed: 75,
    collaboration: 80,
    riskTolerance: 80
  },
  
  initialState: {
    status: 'idle',
    workload: 0,
    energy: 100,
    currentTasks: [],
    lastUpdate: Date.now()
  }
}

export const SOLUTIONIST_2: AgentProfile = {
  id: 'S2',
  name: '陈策',
  role: 'solution',
  position: [8, 0, 3],
  
  capabilities: {
    product_design: 75,
    architecture: 85,
    innovation: 75,
    technical_writing: 85,
    requirement_analysis: 80,
    feasibility_analysis: 85
  },
  
  personality: {
    proactivity: 70,
    thoroughness: 90,
    speed: 70,
    collaboration: 75,
    riskTolerance: 50
  },
  
  initialState: {
    status: 'idle',
    workload: 0,
    energy: 100,
    currentTasks: [],
    lastUpdate: Date.now()
  }
}

// ==================== 研发部 (2人) ====================

export const DEVELOPER_1: AgentProfile = {
  id: 'D1',
  name: '张码',
  role: 'developer',
  position: [-8, 0, -3],
  
  capabilities: {
    frontend: 90,
    backend: 75,
    fullstack: 80,
    code_quality: 70,
    debugging: 80,
    innovation: 85
  },
  
  personality: {
    proactivity: 85,
    thoroughness: 65,
    speed: 90,
    collaboration: 70,
    riskTolerance: 85
  },
  
  initialState: {
    status: 'idle',
    workload: 0,
    energy: 100,
    currentTasks: [],
    lastUpdate: Date.now()
  }
}

export const DEVELOPER_2: AgentProfile = {
  id: 'D2',
  name: '刘栈',
  role: 'developer',
  position: [-8, 0, 3],
  
  capabilities: {
    frontend: 75,
    backend: 90,
    fullstack: 80,
    code_quality: 90,
    debugging: 85,
    innovation: 75
  },
  
  personality: {
    proactivity: 75,
    thoroughness: 90,
    speed: 75,
    collaboration: 75,
    riskTolerance: 60
  },
  
  initialState: {
    status: 'idle',
    workload: 0,
    energy: 100,
    currentTasks: [],
    lastUpdate: Date.now()
  }
}

// ==================== 运维部 (2人) ====================

export const OPERATOR_1: AgentProfile = {
  id: 'O1',
  name: '陈运',
  role: 'devops',
  position: [-12, 0, -3],
  
  capabilities: {
    deployment: 85,
    maintenance: 80,
    automation: 90,
    monitoring: 85,
    troubleshooting: 80,
    security: 75
  },
  
  personality: {
    proactivity: 80,
    thoroughness: 80,
    speed: 85,
    collaboration: 75,
    riskTolerance: 70
  },
  
  initialState: {
    status: 'idle',
    workload: 0,
    energy: 100,
    currentTasks: [],
    lastUpdate: Date.now()
  }
}

export const OPERATOR_2: AgentProfile = {
  id: 'O2',
  name: '赵维',
  role: 'devops',
  position: [-12, 0, 3],
  
  capabilities: {
    deployment: 80,
    maintenance: 85,
    automation: 75,
    monitoring: 90,
    troubleshooting: 85,
    security: 80
  },
  
  personality: {
    proactivity: 70,
    thoroughness: 85,
    speed: 75,
    collaboration: 80,
    riskTolerance: 50
  },
  
  initialState: {
    status: 'idle',
    workload: 0,
    energy: 100,
    currentTasks: [],
    lastUpdate: Date.now()
  }
}

// ==================== 管理中心 (3人) ====================

export const PROJECT_MANAGER: AgentProfile = {
  id: 'P1',
  name: '刘管',
  role: 'project',
  position: [0, 0, -10],
  
  capabilities: {
    coordination: 90,
    scheduling: 85,
    risk_management: 85,
    communication: 90,
    decision_making: 85,
    reporting: 85
  },
  
  personality: {
    proactivity: 90,
    thoroughness: 85,
    speed: 80,
    collaboration: 90,
    riskTolerance: 70
  },
  
  initialState: {
    status: 'idle',
    workload: 0,
    energy: 100,
    currentTasks: [],
    lastUpdate: Date.now()
  }
}

export const FINANCE_MANAGER: AgentProfile = {
  id: 'F1',
  name: '赵财',
  role: 'finance',
  position: [4, 0, -10],
  
  capabilities: {
    budgeting: 90,
    cost_control: 85,
    financial_analysis: 85,
    risk_assessment: 90,
    reporting: 80,
    compliance: 85
  },
  
  personality: {
    proactivity: 70,
    thoroughness: 95,
    speed: 70,
    collaboration: 75,
    riskTolerance: 30
  },
  
  initialState: {
    status: 'idle',
    workload: 0,
    energy: 100,
    currentTasks: [],
    lastUpdate: Date.now()
  }
}

export const ASSISTANT: AgentProfile = {
  id: 'A1',
  name: '孙助',
  role: 'assistant',
  position: [-4, 0, -10],
  
  capabilities: {
    communication: 90,
    information_management: 90,
    scheduling: 85,
    coordination: 80,
    strategic_planning: 85,
    decision_support: 85
  },
  
  personality: {
    proactivity: 85,
    thoroughness: 90,
    speed: 80,
    collaboration: 85,
    riskTolerance: 60
  },
  
  initialState: {
    status: 'idle',
    workload: 0,
    energy: 100,
    currentTasks: [],
    lastUpdate: Date.now()
  }
}

// ==================== 导出所有Agent配置 ====================

export const ALL_AGENT_PROFILES: AgentProfile[] = [
  MARKETER_1,
  MARKETER_2,
  SOLUTIONIST_1,
  SOLUTIONIST_2,
  DEVELOPER_1,
  DEVELOPER_2,
  OPERATOR_1,
  OPERATOR_2,
  PROJECT_MANAGER,
  FINANCE_MANAGER,
  ASSISTANT
]

// 按角色分组的配置
export const AGENT_PROFILES_BY_ROLE: Record<string, AgentProfile[]> = {
  marketing: [MARKETER_1, MARKETER_2],
  solution: [SOLUTIONIST_1, SOLUTIONIST_2],
  developer: [DEVELOPER_1, DEVELOPER_2],
  devops: [OPERATOR_1, OPERATOR_2],
  project: [PROJECT_MANAGER],
  finance: [FINANCE_MANAGER],
  assistant: [ASSISTANT]
}

// 快速查找
export function getAgentProfileById(id: string): AgentProfile | undefined {
  return ALL_AGENT_PROFILES.find(p => p.id === id)
}

export function getAgentProfilesByRole(role: AgentRole): AgentProfile[] {
  return AGENT_PROFILES_BY_ROLE[role] || []
}
