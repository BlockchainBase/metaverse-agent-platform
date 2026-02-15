import { Router } from 'express';

const router = Router();

// Mock projects for metaverse
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
];

// Mock agents
const mockAgents = [
  { id: 'market', name: 'AI市场专员', role: 'MARKET', avatar: '🤝', position: { x: -10, y: 0, z: 10 } },
  { id: 'solution', name: 'AI方案架构师', role: 'SOLUTION', avatar: '📐', position: { x: 10, y: 0, z: 0 } },
  { id: 'project', name: 'AI项目管家', role: 'PROJECT', avatar: '📋', position: { x: 0, y: 0, z: 0 } },
  { id: 'dev', name: 'AI开发工程师', role: 'DEVELOPER', avatar: '💻', position: { x: 15, y: 0, z: 5 } },
  { id: 'delivery', name: 'AI交付专家', role: 'DELIVERY', avatar: '🚀', position: { x: -10, y: 0, z: -10 } },
  { id: 'finance', name: 'AI财务助手', role: 'FINANCE', avatar: '💰', position: { x: 5, y: 0, z: -5 } },
  { id: 'director', name: 'AI院长助理', role: 'DIRECTOR', avatar: '👑', position: { x: 0, y: 5, z: -15 } },
  { id: 'devops', name: 'AI运维工程师', role: 'DEVOPS', avatar: '🔧', position: { x: 10, y: 0, z: -5 } }
];

// Get metaverse projects
router.get('/projects', (req, res) => {
  res.json(mockProjects);
});

// Get agent positions
router.get('/agents', (req, res) => {
  res.json(mockAgents);
});

// Get activities
router.get('/activities', (req, res) => {
  res.json([
    { id: '1', type: 'AGENT_ACTION', title: '项目管家更新进度', agent: { name: 'AI项目管家' }, createdAt: new Date().toISOString() },
    { id: '2', type: 'PROJECT_STAGE_CHANGED', title: '项目阶段变更', project: { name: '智慧校园系统' }, createdAt: new Date().toISOString() }
  ]);
});

export { router as metaverseRouter };