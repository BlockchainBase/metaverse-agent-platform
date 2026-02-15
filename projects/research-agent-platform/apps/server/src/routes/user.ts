import { Router } from 'express';

const router = Router();

// Mock users
const mockUsers = [
  { id: '1', username: 'admin', name: '管理员', email: 'admin@research.com', role: 'ADMIN', status: 'ACTIVE' },
  { id: '2', username: 'manager', name: '项目经理', email: 'manager@research.com', role: 'MANAGER', status: 'ACTIVE' },
  { id: '3', username: 'member', name: '成员', email: 'member@research.com', role: 'MEMBER', status: 'ACTIVE' }
];

// Get all users
router.get('/', (req, res) => {
  res.json(mockUsers);
});

// Get user by ID
router.get('/:id', (req, res) => {
  const user = mockUsers.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});

export { router as userRouter };