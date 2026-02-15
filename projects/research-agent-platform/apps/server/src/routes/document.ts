import { Router } from 'express';

const router = Router();

// Mock documents
const mockDocuments = [
  { id: '1', name: '需求规格说明书.pdf', type: 'REQUIREMENT', projectId: '1', fileUrl: '/docs/1.pdf', fileSize: 1024000, version: 1 },
  { id: '2', name: '系统设计方案.pdf', type: 'SOLUTION', projectId: '1', fileUrl: '/docs/2.pdf', fileSize: 2048000, version: 1 }
];

// Get documents by project
router.get('/project/:projectId', (req, res) => {
  const docs = mockDocuments.filter(d => d.projectId === req.params.projectId);
  res.json(docs);
});

// Upload document (placeholder)
router.post('/', (req, res) => {
  res.status(201).json({ message: 'Document upload placeholder' });
});

export { router as documentRouter };