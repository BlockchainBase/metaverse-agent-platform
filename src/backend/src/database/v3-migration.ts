// v3.0 数据库迁移脚本
// 从 v2.0 迁移到 v3.0

export const v3Migration = `
-- ============================================
-- v3.0 数据库迁移
-- 新增：能力档案、协作契约、人类介入表
-- ============================================

-- 1. 创建 Agent 能力档案表
CREATE TABLE IF NOT EXISTS agent_capabilities (
    agent_id VARCHAR(64) PRIMARY KEY,
    org_id VARCHAR(64),
    name VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL,
    
    -- 专业能力 (JSONB)
    expertise JSONB NOT NULL DEFAULT '[]',
    -- 示例: [{"domain": "AI医疗", "level": 0.92, "evidence": ["项目A", "项目B"], "lastValidated": "2026-02-15"}]
    
    -- 协作特征
    collaboration_profile JSONB NOT NULL DEFAULT '{}',
    -- 示例: {"responseTime": 30, "qualityScore": 0.88, "preferredTaskSize": "medium"}
    
    -- 置信度阈值
    confidence_threshold JSONB NOT NULL DEFAULT '{"autoExecute": 0.9, "negotiate": 0.75, "escalateToHuman": 0.5}',
    
    -- 证书信息 (保留)
    cert JSONB,
    
    -- 当前状态
    status VARCHAR(32) DEFAULT 'offline',
    current_workload DECIMAL(3,2) DEFAULT 0,
    active_contracts JSONB DEFAULT '[]',
    
    last_seen TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. 创建协作契约表
CREATE TABLE IF NOT EXISTS collaboration_contracts (
    contract_id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) NOT NULL,
    type VARCHAR(32) NOT NULL, -- taskDelegation/jointWork/peerReview/consultation/arbitration
    
    -- 上下文
    context JSONB NOT NULL,
    
    -- 发起提议
    proposal JSONB NOT NULL,
    
    -- 协商过程 (数组)
    negotiation JSONB DEFAULT '[]',
    
    -- 共识结果
    consensus JSONB,
    
    -- 执行追踪
    execution JSONB DEFAULT '{}',
    
    -- 审计追踪
    audit_trail JSONB NOT NULL,
    
    -- 人类介入
    human_intervention JSONB,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. 创建人类介入请求表
CREATE TABLE IF NOT EXISTS human_intervention_requests (
    request_id VARCHAR(64) PRIMARY KEY,
    contract_id VARCHAR(64) NOT NULL,
    
    type VARCHAR(32) NOT NULL,
    
    context JSONB NOT NULL,
    options JSONB NOT NULL,
    agent_analysis JSONB NOT NULL,
    
    urgency VARCHAR(32) DEFAULT 'thisWeek',
    
    status VARCHAR(32) DEFAULT 'pending',
    human_decision JSONB,
    resolved_at TIMESTAMP,
    
    requested_at TIMESTAMP DEFAULT NOW()
);

-- 4. 创建任务需求表 (v3.0新增)
CREATE TABLE IF NOT EXISTS task_requirements (
    task_id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) NOT NULL,
    contract_id VARCHAR(64),
    
    type VARCHAR(32) NOT NULL,
    description TEXT NOT NULL,
    
    -- 能力需求
    required_capabilities JSONB NOT NULL,
    
    -- 协作需求
    collaboration_profile JSONB NOT NULL,
    
    -- 约束条件
    constraints JSONB,
    
    -- 匹配结果
    matched_agent_id VARCHAR(64),
    match_score DECIMAL(3,2),
    match_reasoning TEXT,
    
    status VARCHAR(32) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. 创建审计日志表 (增强版)
CREATE TABLE IF NOT EXISTS audit_logs (
    log_id VARCHAR(64) PRIMARY KEY,
    entity_type VARCHAR(32) NOT NULL, -- contract/agent/task
    entity_id VARCHAR(64) NOT NULL,
    action VARCHAR(64) NOT NULL,
    actor_id VARCHAR(64) NOT NULL,
    actor_type VARCHAR(32) NOT NULL, -- agent/human/system
    details JSONB,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 索引优化
-- ============================================

CREATE INDEX IF NOT EXISTS idx_agents_org ON agent_capabilities(org_id);
CREATE INDEX IF NOT EXISTS idx_agents_role ON agent_capabilities(role);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agent_capabilities(status);

CREATE INDEX IF NOT EXISTS idx_contracts_project ON collaboration_contracts(project_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON collaboration_contracts((execution->>'status'));
CREATE INDEX IF NOT EXISTS idx_contracts_human ON collaboration_contracts((human_intervention->>'required'));

CREATE INDEX IF NOT EXISTS idx_intervention_status ON human_intervention_requests(status);
CREATE INDEX IF NOT EXISTS idx_intervention_urgency ON human_intervention_requests(urgency);

CREATE INDEX IF NOT EXISTS idx_tasks_project ON task_requirements(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_matched ON task_requirements(matched_agent_id);

CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);

-- ============================================
-- 数据迁移：从旧表迁移到新表
-- ============================================

-- 迁移现有Agent数据到新表
INSERT INTO agent_capabilities (
    agent_id, org_id, name, role, 
    expertise, collaboration_profile, confidence_threshold,
    cert, status, current_workload, active_contracts,
    last_seen, created_at, updated_at
)
SELECT 
    a.agent_id,
    a.org_id,
    a.name,
    a.role,
    -- 初始化expertise（后续需要手动补充详细信息）
    '[]'::JSONB as expertise,
    -- 初始化collaboration_profile
    '{
        "responseTime": 30,
        "qualityScore": 0.85,
        "completionRate": 0.90,
        "preferredTaskSize": "medium",
        "communicationStyle": "analytical"
    }'::JSONB as collaboration_profile,
    -- 默认置信度阈值
    '{
        "autoExecute": 0.9,
        "negotiate": 0.75,
        "escalateToHuman": 0.5
    }'::JSONB as confidence_threshold,
    a.cert,
    a.status,
    0 as current_workload,
    '[]'::JSONB as active_contracts,
    a.last_seen,
    NOW() as created_at,
    NOW() as updated_at
FROM agents a
ON CONFLICT (agent_id) DO NOTHING;

-- 添加注释
COMMENT ON TABLE agent_capabilities IS 'v3.0 Agent能力档案表';
COMMENT ON TABLE collaboration_contracts IS 'v3.0 协作契约表';
COMMENT ON TABLE human_intervention_requests IS 'v3.0 人类介入请求表';
COMMENT ON TABLE task_requirements IS 'v3.0 任务需求表';
`;

export default v3Migration;
