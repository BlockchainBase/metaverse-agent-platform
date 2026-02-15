import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
import cors from 'cors'
import helmet from 'helmet'

// 导入Phase 1+2路由
import agentRoutes from './routes/agents.js'
import taskRoutes from './routes/tasks.js'
import taskCollaborationRoutes from './routes/taskCollaboration.js'
import processTemplateRoutes from './routes/processTemplates.js'
import processInstanceRoutes from './routes/processInstances.js'
import meetingRoutes from './routes/meetings.js'
import visualizationRoutes from './routes/visualization.js'

// 导入Phase 3路由
import knowledgeRoutes from './routes/knowledge.js'
import rolePlayRoutes from './routes/rolePlay.js'
import taskMatchingRoutes from './routes/taskMatching.js'
import autonomousRoutes from './routes/autonomous.js'

// 导入Phase 4路由 - 3D元宇宙
import metaverse3DRoutes from './routes/metaverse3d.js'

// 导入服务
import { setupSocketHandlers } from './services/socket.js'

// 导入中间件
import { authenticate, optionalAuth } from './middleware/auth.js'
import { requestLogger, errorLogger, slowRequestWarning } from './middleware/logger.js'
import { sqlInjectionGuard, xssGuard, rateLimit } from './middleware/validation.js'

dotenv.config()

const app = express()
const httpServer = createServer(app)
export const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
  }
})

const PORT = process.env.PORT || 3000

// 安全中间件
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "ws:", "wss:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    }
  },
  crossOriginEmbedderPolicy: false // 允许3D资源加载
}))

// CORS配置
const corsOrigin = process.env.CORS_ORIGIN
app.use(cors({
  origin: corsOrigin ? corsOrigin.split(',') : ['http://localhost:5173', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// 日志中间件
app.use(requestLogger)
app.use(slowRequestWarning(1000)) // 警告超过1秒的请求

// 安全防护中间件
app.use(sqlInjectionGuard)
app.use(xssGuard)
app.use(rateLimit())

// 请求体解析
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '4.0.0',
    phase: '4',
    features: [
      'task_collaboration',
      'task_delegation',
      'task_dependencies',
      'meeting_system',
      'realtime_3d_visualization',
      'websocket_events',
      'knowledge_base_rag',
      'llm_role_playing',
      'intelligent_task_matching',
      'agent_autonomous_management',
      'natural_language_commands',
      'workflow_automation',
      'agent_version_management',
      // Phase 4 features
      '3d_agent_batch_status',
      '3d_task_flow_stream',
      '3d_collaboration_network',
      '3d_scene_configuration',
      'management_hub',
      'websocket_3d_rooms',
      'realtime_agent_sync'
    ]
  })
})

// ============================================
// Phase 1+2 API路由（需要认证）
// ============================================
app.use('/api/agents', authenticate, agentRoutes)
app.use('/api/tasks', authenticate, taskRoutes)
app.use('/api/tasks/collaboration', authenticate, taskCollaborationRoutes)
app.use('/api/process-templates', authenticate, processTemplateRoutes)
app.use('/api/process-instances', authenticate, processInstanceRoutes)
app.use('/api/meetings', authenticate, meetingRoutes)
app.use('/api/visualization', authenticate, visualizationRoutes)

// ============================================
// Phase 3 API路由 - 智能增强（需要认证）
// ============================================
app.use('/api/knowledge', authenticate, knowledgeRoutes)           // 知识库RAG
app.use('/api/role-play', authenticate, rolePlayRoutes)            // LLM角色扮演
app.use('/api/matching', authenticate, taskMatchingRoutes)         // 智能任务匹配
app.use('/api/autonomous', authenticate, autonomousRoutes)         // Agent自治管理

// ============================================
// Phase 4 API路由 - 3D元宇宙（需要认证）
// ============================================
app.use('/api/metaverse/3d', authenticate, metaverse3DRoutes)      // 3D场景API

// ============================================
// SDK端点信息
// ============================================
app.get('/api/sdk/info', (req, res) => {
  res.json({
    success: true,
    data: {
      version: '3.0.0',
      phase: '3',
      features: {
        core: [
          'task_collaboration',
          'task_delegation',
          'task_dependencies',
          'meeting_system',
          'realtime_3d_visualization',
          'websocket_events'
        ],
        ai: [
          'knowledge_base_rag',
          'llm_role_playing',
          'intelligent_task_matching',
          'agent_autonomous_management',
          'natural_language_commands',
          'workflow_automation',
          'agent_version_management'
        ]
      },
      websocket: {
        enabled: true,
        rooms: ['agents', 'tasks', 'meetings', 'agent:{id}', 'task:{id}', 'meeting:{id}'],
        events: [
          'agent:status:update',
          'task:assigned',
          'task:updated',
          'task:completed',
          'task:delegated',
          'task:claimed',
          'meeting:invited',
          'meeting:started',
          'meeting:ended',
          'meeting:participant:joined',
          'meeting:participant:left',
          'knowledge:document:processed',
          'workflow:triggered',
          'agent:version:created'
        ]
      },
      llm: {
        providers: ['openai', 'openrouter', 'local'],
        models: ['gpt-4o', 'gpt-4o-mini', 'claude-3', 'custom'],
        features: ['completion', 'streaming', 'embeddings', 'function_calling', 'structured_output']
      },
      vector_db: {
        providers: ['pinecone', 'sqlite', 'memory'],
        dimension: 1536,
        features: ['semantic_search', 'hybrid_search', 'metadata_filtering']
      }
    }
  })
})

// ============================================
// API文档端点
// ============================================
app.get('/api/docs', (req, res) => {
  res.json({
    success: true,
    data: {
      phase3_endpoints: {
        knowledge_base: {
          base: '/api/knowledge',
          endpoints: [
            'POST / - 创建知识库',
            'GET /organization/:organizationId - 获取知识库列表',
            'GET /:id - 获取知识库详情',
            'DELETE /:id - 删除知识库',
            'POST /:knowledgeBaseId/documents - 上传文档',
            'GET /:knowledgeBaseId/documents - 获取文档列表',
            'GET /documents/:id - 获取文档详情',
            'DELETE /documents/:id - 删除文档',
            'POST /documents/:id/revectorize - 重新向量化',
            'POST /:knowledgeBaseId/search - 语义检索',
            'GET /:knowledgeBaseId/stats - 获取统计信息'
          ]
        },
        role_play: {
          base: '/api/role-play',
          endpoints: [
            'POST /templates - 创建角色模板',
            'GET /templates - 获取角色模板列表',
            'GET /templates/:id - 获取角色模板详情',
            'POST /templates/apply - 应用模板到Agent',
            'POST /templates/presets - 创建预设角色',
            'GET /agents/:agentId/config - 获取Agent角色配置',
            'PUT /agents/:agentId/config - 更新Agent角色配置',
            'POST /agents/:agentId/speech - 生成发言',
            'GET /agents/:agentId/assessment - 评估角色能力'
          ]
        },
        task_matching: {
          base: '/api/matching',
          endpoints: [
            'GET /agents/:agentId/profile - 获取能力画像',
            'PUT /agents/:agentId/skills - 更新技能',
            'POST /tasks/:taskId/match - 查找最佳执行者',
            'POST /tasks/:taskId/auto-assign - 自动分配任务',
            'GET /tasks/:taskId/match-history - 获取匹配历史',
            'POST /organizations/:organizationId/load-balance - 执行负载均衡',
            'GET /organizations/:organizationId/load-distribution - 获取负载分布',
            'GET /agents/:agentId/recommendations - 推荐任务'
          ]
        },
        autonomous: {
          base: '/api/autonomous',
          endpoints: [
            'POST /parse - 解析自然语言指令',
            'POST /execute - 执行自然语言指令',
            'GET /history - 获取命令历史',
            'POST /triggers - 创建工作流触发器',
            'GET /triggers - 获取触发器列表',
            'PATCH /triggers/:id/status - 更新触发器状态',
            'DELETE /triggers/:id - 删除触发器',
            'POST /triggers/:triggerId/execute - 执行工作流',
            'POST /trigger-nl - 自然语言触发工作流',
            'GET /executions - 获取执行历史',
            'POST /agents/:agentId/versions - 创建版本',
            'GET /agents/:agentId/versions - 获取版本列表',
            'POST /agents/:agentId/rollback - 回滚到版本',
            'POST /versions/compare - 比较版本差异'
          ]
        }
      }
    }
  })
})

// ============================================
// 错误处理中间件
// ============================================
app.use(errorLogger) // 首先记录错误

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err.name === 'AppError') {
    res.status(err.statusCode || 500).json({
      success: false,
      error: err.message
    })
  } else if (err.code === 'P2002') {
    res.status(409).json({
      success: false,
      error: 'Resource already exists'
    })
  } else if (err.code === 'P2025') {
    res.status(404).json({
      success: false,
      error: 'Resource not found'
    })
  } else if (err.name === 'UnauthorizedError') {
    res.status(401).json({
      success: false,
      error: 'Unauthorized'
    })
  } else {
    // 生产环境不暴露详细错误信息
    const isDev = process.env.NODE_ENV !== 'production'
    res.status(err.statusCode || 500).json({
      success: false,
      error: isDev ? err.message : 'Internal server error',
      ...(isDev && { stack: err.stack })
    })
  }
})

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found'
  })
})

// 设置Socket.IO处理器
setupSocketHandlers(io)

// 启动服务器
httpServer.listen(PORT, () => {
  console.log(`🚀 Metaverse Platform Server v3.0.0 (Phase 3 - 智能增强)`)
  console.log(`📡 Server running on port ${PORT}`)
  console.log(`🔗 API available at http://localhost:${PORT}/api`)
  console.log(`📊 WebSocket enabled`)
  console.log(`🤖 LLM Integration enabled`)
  console.log(`🧠 Vector Database enabled`)
  console.log(`🎯 Health check: http://localhost:${PORT}/health`)
  console.log(`📚 API docs: http://localhost:${PORT}/api/docs`)
})