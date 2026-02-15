export interface Project {
  id: string
  code: string
  name: string
  stage: 'STAGE1' | 'STAGE2' | 'STAGE3' | 'STAGE4'
  stageStatus: string
  status: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  customerName: string
  manager: {
    name: string
    avatar?: string
  }
  position: {
    x: number
    y: number
    z: number
  }
  color: string
  progress: number
}

export interface Agent {
  id: string
  name: string
  role: string
  avatar: string
  position: {
    x: number
    y: number
    z: number
  }
}