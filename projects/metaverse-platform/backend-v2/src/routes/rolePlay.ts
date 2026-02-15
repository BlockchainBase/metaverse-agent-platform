import { Router } from 'express'
import * as rolePlayController from '../controllers/rolePlayController.js'

const router = Router()

// ============================================
// 角色模板管理
// ============================================
router.post('/templates', rolePlayController.createRoleTemplate)
router.get('/templates', rolePlayController.listRoleTemplates)
router.get('/templates/:id', rolePlayController.getRoleTemplate)
router.post('/templates/apply', rolePlayController.applyRoleTemplate)
router.post('/templates/presets', rolePlayController.createPresetRoles)

// ============================================
// Agent角色配置
// ============================================
router.get('/agents/:agentId/config', rolePlayController.getAgentRoleConfig)
router.put('/agents/:agentId/config', rolePlayController.updateAgentRoleConfig)

// ============================================
// 发言生成
// ============================================
router.post('/agents/:agentId/speech', rolePlayController.generateSpeech)

// ============================================
// 角色能力评估
// ============================================
router.get('/agents/:agentId/assessment', rolePlayController.assessAgentCapability)

export default router