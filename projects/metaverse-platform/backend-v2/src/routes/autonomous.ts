import { Router } from 'express'
import * as autonomousController from '../controllers/autonomousController.js'

const router = Router()

// ============================================
// 自然语言命令
// ============================================
router.post('/parse', autonomousController.parseCommand)
router.post('/execute', autonomousController.executeCommand)
router.get('/history', autonomousController.getCommandHistory)

// ============================================
// 工作流触发器
// ============================================
router.post('/triggers', autonomousController.createWorkflowTrigger)
router.get('/triggers', autonomousController.listWorkflowTriggers)
router.patch('/triggers/:id/status', autonomousController.updateWorkflowTriggerStatus)
router.delete('/triggers/:id', autonomousController.deleteWorkflowTrigger)

// ============================================
// 工作流执行
// ============================================
router.post('/triggers/:triggerId/execute', autonomousController.executeWorkflow)
router.post('/trigger-nl', autonomousController.triggerFromNL)
router.get('/executions', autonomousController.getWorkflowExecutionHistory)

// ============================================
// Agent版本管理
// ============================================
router.post('/agents/:agentId/versions', autonomousController.createAgentVersion)
router.get('/agents/:agentId/versions', autonomousController.listAgentVersions)
router.post('/agents/:agentId/rollback', autonomousController.rollbackToVersion)
router.post('/versions/compare', autonomousController.compareVersions)

export default router