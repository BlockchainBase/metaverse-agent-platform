import { Router } from 'express'
import * as visualizationController from '../controllers/visualizationController'

const router = Router()

// ==================== Agent Real-time Status ====================
router.get('/agents/status', visualizationController.getAgentRealtimeStatus)
router.put('/agents/:agentId/position', visualizationController.updateAgentPosition)

// ==================== Task Flow ====================
router.get('/tasks/flow', visualizationController.getTaskFlowData)
router.get('/tasks/timeline', visualizationController.getTaskTimeline)

// ==================== Collaboration Network ====================
router.get('/collaboration/network', visualizationController.getCollaborationNetwork)

// ==================== Organization 3D Data ====================
router.get('/organizations/:organizationId/3d-data', visualizationController.getOrganization3DData)

// ==================== Activity Stream ====================
router.get('/activities', visualizationController.getActivityStream)
router.post('/activities', visualizationController.recordActivity)
router.get('/activities/heatmap', visualizationController.getAgentActivityHeatmap)

export default router
