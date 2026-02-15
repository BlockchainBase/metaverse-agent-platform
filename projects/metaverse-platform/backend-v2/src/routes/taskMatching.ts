import { Router } from 'express'
import * as taskMatchingController from '../controllers/taskMatchingController.js'

const router = Router()

// ============================================
// Agent能力画像
// ============================================
router.get('/agents/:agentId/profile', taskMatchingController.getAgentCapabilityProfile)
router.put('/agents/:agentId/skills', taskMatchingController.updateAgentSkills)

// ============================================
// 任务匹配
// ============================================
router.post('/tasks/:taskId/match', taskMatchingController.findBestAgents)
router.post('/tasks/:taskId/auto-assign', taskMatchingController.autoAssignTask)
router.get('/tasks/:taskId/match-history', taskMatchingController.getTaskMatchHistory)

// ============================================
// 负载均衡
// ============================================
router.post('/organizations/:organizationId/load-balance', taskMatchingController.performLoadBalancing)
router.get('/organizations/:organizationId/load-distribution', taskMatchingController.getLoadDistribution)

// ============================================
// 任务推荐
// ============================================
router.get('/agents/:agentId/recommendations', taskMatchingController.recommendTasks)

export default router