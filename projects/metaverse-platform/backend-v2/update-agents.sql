-- 清空现有Agent数据并插入新的7个角色
DELETE FROM agents;

INSERT INTO agents (id, name, role, department, status, organization_id, created_at, updated_at) VALUES
-- ① AI市场专员 - 市场部
('agent-marketing-001', 'AI市场专员-李拓', 'marketing', '市场部', 'online', 'org-001', datetime('now'), datetime('now')),
-- ② AI方案专家 - 方案部
('agent-solution-001', 'AI方案专家-王谋', 'solution', '方案部', 'busy', 'org-001', datetime('now'), datetime('now')),
-- ③ AI研发专家 - 交付部
('agent-developer-001', 'AI研发专家-张码', 'developer', '交付部', 'online', 'org-001', datetime('now'), datetime('now')),
-- ④ AI交付与运维专家 - 交付部
('agent-devops-001', 'AI交付与运维专家-陈运', 'devops', '交付部', 'online', 'org-001', datetime('now'), datetime('now')),
-- ⑤ AI项目管家 - 跨部门
('agent-project-001', 'AI项目管家-刘管', 'project', '管理层', 'busy', 'org-001', datetime('now'), datetime('now')),
-- ⑥ AI财务专家 - 综管部
('agent-finance-001', 'AI财务专家-赵财', 'finance', '综管部', 'online', 'org-001', datetime('now'), datetime('now')),
-- ⑦ AI院长助理 - 管理层
('agent-assistant-001', 'AI院长助理-孙助', 'assistant', '管理层', 'online', 'org-001', datetime('now'), datetime('now'));
