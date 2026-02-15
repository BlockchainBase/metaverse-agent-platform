-- 更新角色表 - 7个新角色
DELETE FROM roles;
DELETE FROM agents;

INSERT INTO roles (id, name, description, permissions, level, organizationId, createdAt, updatedAt) VALUES
('role-marketing', 'AI市场专员', '负责市场调研、客户开发和需求挖掘', '{"task:create":true,"task:read":true,"task:update":true,"business:read":true}', 2, 'org-001', datetime('now'), datetime('now')),
('role-solution', 'AI方案专家', '负责产品规划与解决方案设计', '{"task:create":true,"task:read":true,"task:update":true,"process:design":true}', 3, 'org-001', datetime('now'), datetime('now')),
('role-developer', 'AI研发专家', '负责核心技术开发与架构实现', '{"task:create":true,"task:read":true,"task:update":true,"code:write":true}', 3, 'org-001', datetime('now'), datetime('now')),
('role-devops', 'AI交付与运维专家', '负责产品部署上线、系统运维和监控', '{"task:create":true,"task:read":true,"task:update":true,"deploy:execute":true}', 3, 'org-001', datetime('now'), datetime('now')),
('role-project', 'AI项目管家', '负责项目全生命周期管理，协调各部门资源', '{"task:create":true,"task:read":true,"task:update":true,"task:assign":true,"project:manage":true}', 4, 'org-001', datetime('now'), datetime('now')),
('role-finance', 'AI财务专家', '负责项目预算管理、成本控制和财务结算', '{"task:create":true,"task:read":true,"budget:manage":true,"finance:report":true}', 2, 'org-001', datetime('now'), datetime('now')),
('role-assistant', 'AI院长助理', '负责对接院长、传达战略意图', '{"task:create":true,"task:read":true,"task:update":true,"report:generate":true,"strategy:communicate":true}', 5, 'org-001', datetime('now'), datetime('now'));

INSERT INTO agents (id, name, avatar, status, type, organizationId, roleId, createdAt, updatedAt, capabilities, skillProfile) VALUES
('agent-marketing-001', 'AI市场专员-李拓', '👨‍💼', 'online', 'ai', 'org-001', 'role-marketing', datetime('now'), datetime('now'), '{"marketResearch":true,"clientCommunication":true}', '{"efficiency":88,"collaboration":90,"innovation":85,"reliability":92}'),
('agent-solution-001', 'AI方案专家-王谋', '👨‍💻', 'busy', 'ai', 'org-001', 'role-solution', datetime('now'), datetime('now'), '{"solutionDesign":true,"productPlanning":true}', '{"efficiency":92,"collaboration":94,"innovation":96,"reliability":90}'),
('agent-developer-001', 'AI研发专家-张码', '👨‍🔬', 'online', 'ai', 'org-001', 'role-developer', datetime('now'), datetime('now'), '{"fullstackDev":true,"architecture":true}', '{"efficiency":95,"collaboration":88,"innovation":94,"reliability":93}'),
('agent-devops-001', 'AI交付与运维专家-陈运', '👨‍🚀', 'online', 'ai', 'org-001', 'role-devops', datetime('now'), datetime('now'), '{"deployment":true,"monitoring":true}', '{"efficiency":93,"collaboration":87,"innovation":88,"reliability":97}'),
('agent-project-001', 'AI项目管家-刘管', '👨‍💼', 'busy', 'ai', 'org-001', 'role-project', datetime('now'), datetime('now'), '{"projectManagement":true,"coordination":true}', '{"efficiency":94,"collaboration":98,"innovation":85,"reliability":95}'),
('agent-finance-001', 'AI财务专家-赵财', '👨‍💼', 'online', 'ai', 'org-001', 'role-finance', datetime('now'), datetime('now'), '{"budgetManagement":true,"costControl":true}', '{"efficiency":96,"collaboration":86,"innovation":80,"reliability":99}'),
('agent-assistant-001', 'AI院长助理-孙助', '👨‍💼', 'online', 'ai', 'org-001', 'role-assistant', datetime('now'), datetime('now'), '{"strategy":true,"communication":true}', '{"efficiency":91,"collaboration":95,"innovation":87,"reliability":96}');
