import { Router } from 'express'
import * as knowledgeController from '../controllers/knowledgeController.js'

const router = Router()

// ============================================
// 知识库管理
// ============================================
router.post('/', knowledgeController.createKnowledgeBase)
router.get('/organization/:organizationId', knowledgeController.listKnowledgeBases)
router.get('/:id', knowledgeController.getKnowledgeBase)
router.delete('/:id', knowledgeController.deleteKnowledgeBase)

// ============================================
// 文档管理
// ============================================
router.post('/:knowledgeBaseId/documents', ...knowledgeController.uploadDocument as any)
router.get('/:knowledgeBaseId/documents', knowledgeController.listDocuments)
router.get('/documents/:id', knowledgeController.getDocument)
router.delete('/documents/:id', knowledgeController.deleteDocument)
router.post('/documents/:id/revectorize', knowledgeController.revectorizeDocument)

// ============================================
// 语义检索
// ============================================
router.post('/:knowledgeBaseId/search', knowledgeController.searchKnowledge)

// ============================================
// 统计信息
// ============================================
router.get('/:knowledgeBaseId/stats', knowledgeController.getVectorStats)

export default router