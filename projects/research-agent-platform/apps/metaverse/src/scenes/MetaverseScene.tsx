import { useEffect, useState } from 'react'
import { useMetaverseStore } from '../stores/metaverse'
import { Courtyard } from './Courtyard'
import { AgentAvatars } from './AgentAvatars'
import { ProjectPipelines } from './ProjectPipelines'
import axios from 'axios'

export function MetaverseScene() {
  const { setProjects, setAgents } = useMetaverseStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch data from API
    const fetchData = async () => {
      try {
        const [projectsRes, agentsRes] = await Promise.all([
          axios.get('/api/metaverse/projects'),
          axios.get('/api/metaverse/agents')
        ])
        setProjects(projectsRes.data)
        setAgents(agentsRes.data)
      } catch (error) {
        console.error('Failed to fetch metaverse data:', error)
        // Use mock data for development
        setProjects(mockProjects)
        setAgents(mockAgents)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return null
  }

  return (
    <group>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#2d3436" />
      </mesh>
      
      {/* Courtyard Base */}
      <Courtyard />
      
      {/* Agent Avatars */}
      <AgentAvatars />
      
      {/* Project Pipelines */}
      <ProjectPipelines />
    </group>
  )
}

// Mock data for development
const mockProjects = [
  {
    id: '1',
    name: '智慧校园系统',
    code: 'PJ2024001',
    stage: 'STAGE3',
    stageStatus: 'IN_PROGRESS',
    status: 'ONGOING',
    priority: 'HIGH',
    customerName: 'XX教育局',
    manager: { name: '张三' },
    position: { x: 5, y: 2, z: 0 },
    color: '#ef4444',
    progress: 65
  },
  {
    id: '2',
    name: '医疗AI平台',
    code: 'PJ2024002',
    stage: 'STAGE2',
    stageStatus: 'IN_PROGRESS',
    status: 'ONGOING',
    priority: 'MEDIUM',
    customerName: 'XX医院',
    manager: { name: '李四' },
    position: { x: -5, y: 2, z: 5 },
    color: '#f59e0b',
    progress: 35
  },
  {
    id: '3',
    name: '企业管理系统',
    code: 'PJ2024003',
    stage: 'STAGE1',
    stageStatus: 'IN_PROGRESS',
    status: 'ONGOING',
    priority: 'LOW',
    customerName: 'XX企业',
    manager: { name: '王五' },
    position: { x: -15, y: 2, z: 10 },
    color: '#3b82f6',
    progress: 15
  },
  {
    id: '4',
    name: '数据可视化平台',
    code: 'PJ2024004',
    stage: 'STAGE4',
    stageStatus: 'IN_PROGRESS',
    status: 'ONGOING',
    priority: 'HIGH',
    customerName: 'XX科技',
    manager: { name: '赵六' },
    position: { x: 15, y: 2, z: -5 },
    color: '#10b981',
    progress: 85
  }
]

const mockAgents = [
  { id: 'market', name: 'AI市场专员', role: 'MARKET', avatar: '🤝', position: { x: -10, y: 0, z: 10 } },
  { id: 'solution', name: 'AI方案架构师', role: 'SOLUTION', avatar: '📐', position: { x: 10, y: 0, z: 0 } },
  { id: 'project', name: 'AI项目管家', role: 'PROJECT', position: { x: 0, y: 0, z: 0 }, avatar: '📋' },
  { id: 'dev', name: 'AI开发工程师', role: 'DEVELOPER', avatar: '💻', position: { x: 15, y: 0, z: 5 } },
  { id: 'delivery', name: 'AI交付专家', role: 'DELIVERY', avatar: '🚀', position: { x: -10, y: 0, z: -10 } },
  { id: 'finance', name: 'AI财务助手', role: 'FINANCE', avatar: '💰', position: { x: 5, y: 0, z: -5 } },
  { id: 'director', name: 'AI院长助理', role: 'DIRECTOR', avatar: '👑', position: { x: 0, y: 5, z: -15 } },
  { id: 'devops', name: 'AI运维工程师', role: 'DEVOPS', avatar: '🔧', position: { x: 10, y: 0, z: -5 } }
]