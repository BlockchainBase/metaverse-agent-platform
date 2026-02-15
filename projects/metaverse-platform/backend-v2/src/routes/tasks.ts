import { Router } from 'express'
import * as taskController from '../controllers/taskController'

const router = Router()

// ==================== Task CRUD ====================
router.get('/', taskController.getTasks)
router.post('/', taskController.createTask)
router.get('/:id', taskController.getTask)
router.put('/:id', taskController.updateTask)
router.delete('/:id', taskController.deleteTask)

// ==================== Task Status & Assignment ====================
router.patch('/:id/status', taskController.updateTaskStatus)
router.patch('/:id/assign', taskController.assignTask)

// ==================== Batch Operations ====================
router.post('/batch/update', taskController.batchUpdateTasks)

// ==================== Statistics ====================
router.get('/stats/overview', taskController.getTaskStats)

export default router
