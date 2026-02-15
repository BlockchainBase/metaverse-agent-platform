import { Router } from 'express';

const router = Router();

// Mock data
const mockCustomers = [
  {
    id: '1',
    name: 'XX教育局',
    industry: '教育',
    scale: '大型',
    region: '成都',
    level: 'A',
    status: 'ACTIVE',
    tags: '政府,重点客户',
    owner: { id: '1', name: '张三', avatar: null },
    contacts: [
      { id: '1', name: '李主任', position: '信息中心主任', phone: '13800138000', isPrimary: true }
    ],
    createdAt: '2024-01-15T08:00:00Z'
  },
  {
    id: '2',
    name: 'XX医院',
    industry: '医疗',
    scale: '大型',
    region: '成都',
    level: 'A',
    status: 'ACTIVE',
    tags: '医疗,重点客户',
    owner: { id: '1', name: '张三', avatar: null },
    contacts: [
      { id: '2', name: '王院长', position: '副院长', phone: '13900139000', isPrimary: true }
    ],
    createdAt: '2024-02-01T08:00:00Z'
  },
  {
    id: '3',
    name: 'XX科技',
    industry: '科技',
    scale: '中型',
    region: '成都',
    level: 'B',
    status: 'POTENTIAL',
    tags: '企业',
    owner: { id: '2', name: '李四', avatar: null },
    contacts: [],
    createdAt: '2024-02-10T08:00:00Z'
  }
];

// Get all customers
router.get('/', (req, res) => {
  res.json(mockCustomers);
});

// Get customer by ID
router.get('/:id', (req, res) => {
  const customer = mockCustomers.find(c => c.id === req.params.id);
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  res.json(customer);
});

// Create customer
router.post('/', (req, res) => {
  const newCustomer = {
    id: String(mockCustomers.length + 1),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  mockCustomers.push(newCustomer);
  res.status(201).json(newCustomer);
});

// Update customer
router.put('/:id', (req, res) => {
  const index = mockCustomers.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  mockCustomers[index] = { ...mockCustomers[index], ...req.body };
  res.json(mockCustomers[index]);
});

// Delete customer
router.delete('/:id', (req, res) => {
  const index = mockCustomers.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  mockCustomers.splice(index, 1);
  res.json({ message: 'Customer deleted' });
});

export { router as customerRouter };