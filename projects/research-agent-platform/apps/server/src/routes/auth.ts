import { Router } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();

// Mock users
const mockUsers = [
  {
    id: '1',
    username: 'admin',
    password: 'admin',
    name: '管理员',
    email: 'admin@research.com',
    role: 'ADMIN',
    avatar: null
  },
  {
    id: '2',
    username: 'manager',
    password: 'manager',
    name: '项目经理',
    email: 'manager@research.com',
    role: 'MANAGER',
    avatar: null
  }
];

// Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  const user = mockUsers.find(u => u.username === username && u.password === password);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '7d' }
  );
  
  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    }
  });
});

// Register
router.post('/register', (req, res) => {
  const { username, email, name, password } = req.body;
  
  const newUser = {
    id: String(mockUsers.length + 1),
    username,
    email,
    name,
    password,
    role: 'ADMIN',
    avatar: null
  };
  
  mockUsers.push(newUser);
  
  res.status(201).json({
    id: newUser.id,
    username: newUser.username,
    name: newUser.name,
    email: newUser.email
  });
});

export { router as authRouter };