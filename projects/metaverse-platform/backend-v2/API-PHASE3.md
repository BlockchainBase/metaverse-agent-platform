# Phase 3 API 文档 - 智能增强

## 1. 知识库RAG (Knowledge Base RAG)

### 知识库管理

```
POST   /api/knowledge                           # 创建知识库
GET    /api/knowledge/organization/:orgId      # 获取知识库列表
GET    /api/knowledge/:id                       # 获取知识库详情
DELETE /api/knowledge/:id                       # 删除知识库
```

**创建知识库请求体：**
```json
{
  "name": "产品文档库",
  "description": "存储产品相关文档",
  "organizationId": "org_123",
  "vectorDimension": 1536,
  "embeddingModel": "text-embedding-3-small"
}
```

### 文档管理

```
POST   /api/knowledge/:kbId/documents          # 上传文档 (multipart/form-data)
GET    /api/knowledge/:kbId/documents          # 获取文档列表
GET    /api/knowledge/documents/:id            # 获取文档详情
DELETE /api/knowledge/documents/:id            # 删除文档
POST   /api/knowledge/documents/:id/revectorize # 重新向量化
```

**上传文档：**
```bash
curl -X POST http://localhost:3000/api/knowledge/kb_123/documents \
  -F "file=@document.pdf" \
  -F "userId=user_123"
```

### 语义检索

```
POST /api/knowledge/:kbId/search               # 语义搜索
```

**搜索请求体：**
```json
{
  "query": "如何配置系统参数？",
  "topK": 5,
  "minScore": 0.7
}
```

**搜索响应：**
```json
{
  "success": true,
  "data": {
    "answer": "根据文档[1]和[2]，系统参数配置需要...",
    "sources": [
      {
        "documentId": "doc_123",
        "documentTitle": "配置指南.pdf",
        "chunkIndex": 0,
        "content": "系统配置参数说明...",
        "relevance": 0.92
      }
    ],
    "usage": {
      "promptTokens": 1200,
      "completionTokens": 150,
      "totalTokens": 1350
    }
  }
}
```

---

## 2. LLM角色扮演 (LLM Role Playing)

### 角色模板管理

```
POST   /api/role-play/templates                # 创建角色模板
GET    /api/role-play/templates                # 获取模板列表
GET    /api/role-play/templates/:id            # 获取模板详情
POST   /api/role-play/templates/apply          # 应用模板到Agent
POST   /api/role-play/templates/presets        # 创建预设角色
```

**创建角色模板请求体：**
```json
{
  "name": "技术专家",
  "description": "专注于技术实现的专家",
  "category": "meeting",
  "personality": {
    "traits": ["analytical", "detail-oriented"],
    "communication": ["precise", "technical"],
    "decisionStyle": "data_driven",
    "conflictApproach": "collaborative"
  },
  "expertise": {
    "domains": [
      { "name": "Backend Development", "level": "expert", "yearsOfExperience": 10 }
    ],
    "specializations": ["System Architecture", "Performance"]
  },
  "speakingStyle": {
    "formality": "formal",
    "verbosity": "detailed",
    "tone": "professional",
    "directness": "direct"
  },
  "systemPrompt": "你是一个经验丰富的技术专家...",
  "isDefault": false,
  "isPublic": true
}
```

### Agent角色配置

```
GET /api/role-play/agents/:agentId/config      # 获取角色配置
PUT /api/role-play/agents/:agentId/config      # 更新角色配置
```

### 发言生成

```
POST /api/role-play/agents/:agentId/speech     # 生成会议发言
```

**发言生成请求体：**
```json
{
  "context": {
    "meetingId": "meeting_123",
    "title": "技术评审会议",
    "type": "review",
    "agenda": [
      { "id": "1", "title": "架构设计评审", "status": "pending" }
    ],
    "participants": [
      { "agentId": "agent_1", "name": "Alice", "role": "developer" }
    ],
    "previousMessages": []
  },
  "topic": "微服务架构设计",
  "intent": "opinion",
  "maxLength": 200
}
```

### 角色能力评估

```
GET /api/role-play/agents/:agentId/assessment  # 评估角色能力
```

**评估响应：**
```json
{
  "success": true,
  "data": {
    "overallScore": 85,
    "dimensions": {
      "communication": 88,
      "expertise": 92,
      "collaboration": 80,
      "leadership": 75,
      "decisionMaking": 85
    },
    "strengths": ["技术深度", "问题分析"],
    "weaknesses": ["时间管理"],
    "recommendations": ["增加团队协作任务"]
  }
}
```

---

## 3. 智能任务匹配 (Intelligent Task Matching)

### Agent能力画像

```
GET /api/matching/agents/:agentId/profile      # 获取能力画像
PUT /api/matching/agents/:agentId/skills       # 更新技能标签
```

**更新技能请求体：**
```json
{
  "skills": [
    { "name": "JavaScript", "level": "expert", "verified": true },
    { "name": "Python", "level": "intermediate", "verified": false }
  ]
}
```

### 任务匹配

```
POST /api/matching/tasks/:taskId/match         # 查找最佳执行者
POST /api/matching/tasks/:taskId/auto-assign   # 自动分配任务
GET  /api/matching/tasks/:taskId/match-history # 获取匹配历史
```

**匹配请求体：**
```json
{
  "topK": 5,
  "minOverallScore": 0.3,
  "strategy": "best_fit",
  "considerWorkload": true,
  "considerHistory": true
}
```

**策略选项：**
- `best_fit`: 最佳匹配
- `load_balanced`: 负载均衡
- `skill_diverse`: 技能多样
- `round_robin`: 轮询

**匹配响应：**
```json
{
  "success": true,
  "data": [
    {
      "agentId": "agent_123",
      "agentName": "AI Developer",
      "scores": {
        "skillMatch": 0.95,
        "availability": 0.9,
        "workload": 0.8,
        "history": 0.85,
        "overall": 0.88
      },
      "details": {
        "matchedSkills": [
          { "skill": "JavaScript", "agentLevel": "expert", "requiredLevel": "advanced", "match": 1.0 }
        ],
        "currentWorkload": 3,
        "maxWorkload": 10,
        "recentPerformance": 4.5,
        "reasons": ["技能匹配度极高", "当前负载较低"]
      },
      "recommendation": "highly_recommended"
    }
  ]
}
```

### 负载均衡

```
POST /api/matching/organizations/:orgId/load-balance      # 执行负载均衡
GET  /api/matching/organizations/:orgId/load-distribution # 获取负载分布
```

**负载均衡响应：**
```json
{
  "success": true,
  "data": {
    "redistributed": 2,
    "details": [
      {
        "taskId": "task_123",
        "fromAgentId": "agent_1",
        "toAgentId": "agent_2",
        "reason": "负载均衡"
      }
    ]
  }
}
```

### 任务推荐

```
GET /api/matching/agents/:agentId/recommendations?limit=5
```

---

## 4. Agent自治管理 (Agent Autonomous Management)

### 自然语言指令

```
POST /api/autonomous/parse       # 解析自然语言指令
POST /api/autonomous/execute     # 执行自然语言指令
GET  /api/autonomous/history     # 获取命令历史
```

**解析请求体：**
```json
{
  "command": "创建一个高优先级任务，标题是修复登录bug，分配给张三"
}
```

**解析响应：**
```json
{
  "success": true,
  "data": {
    "intent": "create_and_assign_task",
    "confidence": 0.95,
    "entities": {
      "priority": "high",
      "title": "修复登录bug",
      "assignee": "张三"
    },
    "action": "create_task",
    "parameters": {
      "title": "修复登录bug",
      "priority": "high",
      "assigneeName": "张三"
    }
  }
}
```

### 工作流触发器

```
POST   /api/autonomous/triggers                # 创建触发器
GET    /api/autonomous/triggers                # 获取触发器列表
PATCH  /api/autonomous/triggers/:id/status     # 更新触发器状态
DELETE /api/autonomous/triggers/:id            # 删除触发器
```

**创建触发器请求体：**
```json
{
  "name": "高优先级任务提醒",
  "description": "当创建高优先级任务时发送通知",
  "triggerType": "event",
  "condition": {
    "eventType": "task_created",
    "filter": { "priority": "high" }
  },
  "actionType": "send_notification",
  "actionConfig": {
    "target": "@channel",
    "message": "新的高优先级任务已创建",
    "type": "alert"
  },
  "createdBy": "user_123"
}
```

### 工作流执行

```
POST /api/autonomous/triggers/:triggerId/execute    # 执行工作流
POST /api/autonomous/trigger-nl                     # 自然语言触发
GET  /api/autonomous/executions                     # 获取执行历史
```

### Agent版本管理

```
POST /api/autonomous/agents/:agentId/versions       # 创建版本
GET  /api/autonomous/agents/:agentId/versions       # 获取版本列表
POST /api/autonomous/agents/:agentId/rollback       # 回滚到版本
POST /api/autonomous/versions/compare               # 比较版本差异
```

**创建版本请求体：**
```json
{
  "name": "v1.0-初始配置",
  "description": "Agent初始能力配置快照",
  "createdBy": "user_123"
}
```

**版本比较响应：**
```json
{
  "success": true,
  "data": {
    "version1": { "id": "ver_1", "version": 1, "name": "v1.0" },
    "version2": { "id": "ver_2", "version": 2, "name": "v2.0" },
    "differences": {
      "skillProfile": {
        "before": { "skills": ["JavaScript"] },
        "after": { "skills": ["JavaScript", "Python"] }
      }
    }
  }
}
```

---

## 环境变量配置

```bash
# LLM配置
LLM_PROVIDER=openai              # openai | openrouter | local
LLM_API_KEY=your_api_key
LLM_BASE_URL=                    # 可选，用于OpenRouter或本地模型
LLM_MODEL=gpt-4o-mini
EMBEDDING_MODEL=text-embedding-3-small

# 向量数据库配置
VECTOR_PROVIDER=sqlite           # pinecone | qdrant | sqlite | memory
VECTOR_DIMENSION=1536
PINECONE_API_KEY=                # 使用Pinecone时
PINECONE_INDEX_NAME=metaverse-knowledge
QDRANT_URL=                      # 使用Qdrant时
QDRANT_API_KEY=

# 数据库配置
DATABASE_URL=file:./dev.db

# 服务器配置
PORT=3000
CORS_ORIGIN=*
NODE_ENV=development
```