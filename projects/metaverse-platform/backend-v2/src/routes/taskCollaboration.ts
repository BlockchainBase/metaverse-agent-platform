import { Router } from 'express'
import * as taskCollaborationController from '../controllers/taskCollaborationController'

const router = Router()

// ==================== Task Delegation ====================
router.post('/:taskId/delegate', taskCollaborationController.delegateTask)

// ==================== Task Transfer ====================
router.post('/:taskId/transfer', taskCollaborationController.transferTask)

// ==================== Task Claim ====================
router.post('/:taskId/claim', taskCollaborationController.claimTask)
router.post('/:taskId/unclaim', taskCollaborationController.unclaimTask)
router.get('/available', taskCollaborationController.getAvailableTasks)

// ==================== Task Collaboration ====================
router.post('/:taskId/collaborators', taskCollaborationController.addCollaborator)
router.delete('/:taskId/collaborators/:collaboratorId', taskCollaborationController.removeCollaborator)
router.patch('/:taskId/collaborators/:collaboratorId/role', taskCollaborationController.updateCollaboratorRole)

// ==================== Task Dependencies ====================
router.post('/:taskId/dependencies', taskCollaborationController.addDependency)
router.delete('/:taskId/dependencies/:dependencyId', taskCollaborationController.removeDependency)
router.get('/:taskId/dependencies', taskCollaborationController.getTaskDependencies)

// ==================== Task Chain ====================
router.get('/:taskId/chain', taskCollaborationController.getTaskChain)

export default router
