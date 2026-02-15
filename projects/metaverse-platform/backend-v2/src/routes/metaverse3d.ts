import { Router } from 'express'
import * as metaverse3DController from '../controllers/metaverse3DController'

const router = Router()

// ==================== Phase 4: 聚合Agent状态流API ====================
router.post('/agents/status/batch', metaverse3DController.getAgentStatusBatch)

// ==================== Phase 4: 任务流实时数据API ====================
router.get('/tasks/flow/stream', metaverse3DController.getTaskFlowStream)

// ==================== Phase 4: 协作关系网络计算API V2 ====================
router.get('/collaboration/network/v2', metaverse3DController.getCollaborationNetworkV2)

// ==================== Phase 4: 3D场景配置数据API ====================
router.get('/scene/config', metaverse3DController.get3DSceneConfig)
router.post('/scene/config', metaverse3DController.update3DSceneConfig)

// ==================== Phase 4: 管理中枢数据API ====================
router.get('/management-hub', metaverse3DController.getManagementHubData)

export default router
