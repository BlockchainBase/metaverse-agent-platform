import { Router } from 'express';

const router = Router();

// Mock data
const mockProjects = [
  {
    id: '1',
    code: 'PJ2024001',
    name: '智慧校园系统',
    customer: { id: '1', name: 'XX教育局', level: 'A' },
    stage: 'STAGE3',
    stageStatus: 'IN_PROGRESS',
    status: 'ONGOING',
    priority: 'HIGH',
    description: '智慧校园管理平台建设',
    budget: 350000,
    contractAmount: 500000,
    startDate: '2024-01-15',
    endDate: '2024-06-15',
    manager: { id: '1', name: '张三', avatar: null },
    milestones: [
      { id: '1', name: '完成市场对接', stage: 'STAGE1', status: 'COMPLETED', completedAt: '2024-01-20' },
      { id: '2', name: '完成方案制定', stage: 'STAGE2', status: 'COMPLETED', completedAt: '2024-02-15' },
      { id: '3', name: '完成研发Demo', stage: 'STAGE3', status: 'IN_PROGRESS' },
      { id: '4', name: '完成实施交付', stage: 'STAGE4', status: 'PENDING' }
    ],
    tasks: [
      { id: '1', title: '需求分析', status: 'DONE', assignee: { name: '张三' } },
      { id: '2', title: '系统设计', status: 'DONE', assignee: { name: '李四' } },
      { id: '3', title: '前端开发', status: 'IN_PROGRESS', assignee: { name: '王五' } },
      { id: '4', title: '后端开发', status: 'IN_PROGRESS', assignee: { name: '赵六' } }
    ]
  },
  {
    id: '2',
    code: 'PJ2024002',
    name: '医疗AI平台',
    customer: { id: '2', name: 'XX医院', level: 'A' },
    stage: 'STAGE2',
    stageStatus: 'IN_PROGRESS',
    status: 'ONGOING',
    priority: 'MEDIUM',
    description: '医疗影像AI诊断平台',
    budget: 550000,
    contractAmount: 800000,
    startDate: '2024-02-01',
    endDate: '2024-07-01',
    manager: { id: '2', name: '李四', avatar: null },
    milestones: [
      { id: '1', name: '完成市场对接', stage: 'STAGE1', status: 'COMPLETED' },
      { id: '2', name: '完成方案制定', stage: 'STAGE2', status: 'IN_PROGRESS' },
      { id: '3', name: '完成研发Demo', stage: 'STAGE3', status: 'PENDING' },
      { id: '4', name: '完成实施交付', stage: 'STAGE4', status: 'PENDING' }
    ],
    tasks: [
      { id: '1', title: '需求调研', status: 'DONE', assignee: { name: '李四' } },
      { id: '2', title: '方案设计', status: 'IN_PROGRESS', assignee: { name: '张三' } }
    ]
  }
];

// Get all projects
router.get('/', (req, res) => {
  res.json(mockProjects);
});

// Get project by ID
router.get('/:id', (req, res) => {
  const project = mockProjects.find(p => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  res.json(project);
});

// Create project
router.post('/', (req, res) => {
  const newProject = {
    id: String(mockProjects.length + 1),
    code: `PJ2024${String(mockProjects.length + 1).padStart(4, '0')}`,
    ...req.body,
    milestones: [
      { id: '1', name: '完成市场对接', stage: 'STAGE1', status: 'PENDING' },
      { id: '2', name: '完成方案制定', stage: 'STAGE2', status: 'PENDING' },
      { id: '3', name: '完成研发Demo', stage: 'STAGE3', status: 'PENDING' },
      { id: '4', name: '完成实施交付', stage: 'STAGE4', status: 'PENDING' }
    ],
    tasks: []
  };
  mockProjects.push(newProject);
  res.status(201).json(newProject);
});

// Update project
router.put('/:id', (req, res) => {
  const index = mockProjects.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Project not found' });
  }
  mockProjects[index] = { ...mockProjects[index], ...req.body };
  res.json(mockProjects[index]);
});

// Update project stage
router.put('/:id/stage', (req, res) => {
  const index = mockProjects.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Project not found' });
  }
  mockProjects[index].stage = req.body.stage;
  mockProjects[index].stageStatus = req.body.stageStatus;
  res.json(mockProjects[index]);
});

// Delete project
router.delete('/:id', (req, res) => {
  const index = mockProjects.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Project not found' });
  }
  mockProjects.splice(index, 1);
  res.json({ message: 'Project deleted' });
});

// Get project stats
router.get('/stats/overview', (req, res) => {
  res.json({
    total: mockProjects.length,
    byStage: [
      { stage: 'STAGE1', _count: { id: mockProjects.filter(p => p.stage === 'STAGE1').length } },
      { stage: 'STAGE2', _count: { id: mockProjects.filter(p => p.stage === 'STAGE2').length } },
      { stage: 'STAGE3', _count: { id: mockProjects.filter(p => p.stage === 'STAGE3').length } },
      { stage: 'STAGE4', _count: { id: mockProjects.filter(p => p.stage === 'STAGE4').length } }
    ],
    byStatus: [
      { status: 'ONGOING', _count: { id: mockProjects.filter(p => p.status === 'ONGOING').length } }
    ],
    totalRevenue: mockProjects.reduce((sum, p) => sum + (p.contractAmount || 0), 0)
  });
});

export { router as projectRouter };