const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 创建测试数据...\n')
  
  // 1. 组织
  const org = await prisma.organization.upsert({
    where: { id: 'org-001' },
    update: {},
    create: { id: 'org-001', name: '成都高新研究院', description: 'AI研究与产业孵化' }
  })
  console.log('✅ 组织:', org.name)
  
  // 2. 创建6个角色
  const roleData = [
    { id: 'role-president', name: 'AI院长', level: 3, permissions: 'all,admin,approve' },
    { id: 'role-cto', name: 'AI总工', level: 2, permissions: 'tech,arch,review' },
    { id: 'role-product', name: 'AI产品经理', level: 2, permissions: 'product,design,research' },
    { id: 'role-marketing', name: 'AI市场经理', level: 2, permissions: 'market,brand,channel' },
    { id: 'role-finance', name: 'AI财务经理', level: 2, permissions: 'finance,budget,audit' },
    { id: 'role-operations', name: 'AI运营经理', level: 2, permissions: 'operation,process,system' }
  ]
  
  for (const r of roleData) {
    await prisma.role.upsert({
      where: { id: r.id },
      update: {},
      create: { ...r, organizationId: org.id }
    })
  }
  console.log('✅ 角色: 6个')
  
  // 3. 创建6个Agent（带完整能力数据）
  const agentData = [
    { id: 'ai-president-001', name: 'AI院长-赵明', avatar: '👔', roleId: 'role-president', status: 'online', type: 'executive', pos: {x:-8,z:-8}, caps: ['战略决策','资源调配','风险管理'], workload: 3, completed: 156, efficiency: 95, collaboration: 90, innovation: 88, reliability: 96 },
    { id: 'ai-cto-001', name: 'AI总工-孙强', avatar: '🔧', roleId: 'role-cto', status: 'busy', type: 'technical', pos: {x:-8,z:8}, caps: ['系统架构','AI算法','性能优化'], workload: 5, completed: 189, efficiency: 94, collaboration: 87, innovation: 98, reliability: 93 },
    { id: 'ai-product-001', name: 'AI产品经理-王五', avatar: '📱', roleId: 'role-product', status: 'online', type: 'business', pos: {x:8,z:8}, caps: ['需求分析','用户体验','产品设计'], workload: 3, completed: 128, efficiency: 91, collaboration: 93, innovation: 89, reliability: 92 },
    { id: 'ai-marketing-001', name: 'AI市场经理-赵六', avatar: '📢', roleId: 'role-marketing', status: 'meeting', type: 'business', pos: {x:-5,z:0}, caps: ['市场分析','品牌推广','渠道管理'], workload: 4, completed: 115, efficiency: 89, collaboration: 91, innovation: 87, reliability: 90 },
    { id: 'ai-finance-001', name: 'AI财务经理-孙七', avatar: '💰', roleId: 'role-finance', status: 'busy', type: 'support', pos: {x:5,z:0}, caps: ['财务分析','成本控制','预算管理'], workload: 6, completed: 201, efficiency: 93, collaboration: 85, innovation: 82, reliability: 97 },
    { id: 'ai-operations-001', name: 'AI运营经理-周八', avatar: '⚙️', roleId: 'role-operations', status: 'online', type: 'support', pos: {x:0,z:5}, caps: ['流程优化','系统管理','自动化'], workload: 4, completed: 167, efficiency: 90, collaboration: 94, innovation: 86, reliability: 95 }
  ]
  
  for (const a of agentData) {
    await prisma.agent.upsert({
      where: { id: a.id },
      update: {},
      create: {
        id: a.id,
        name: a.name,
        avatar: a.avatar,
        roleId: a.roleId,
        organizationId: org.id,
        status: a.status,
        type: a.type,
        position: JSON.stringify({x:a.pos.x, y:0, z:a.pos.z}),
        capabilities: JSON.stringify(a.caps),
        performanceStats: JSON.stringify({ completedTasks: a.completed, avgQuality: a.reliability/20 }),
        workload: a.workload,
        maxWorkload: 10,
        availabilityScore: a.efficiency / 100
      }
    })
  }
  console.log('✅ Agent: 6个（带能力数据）')
  
  // 4. 创建5个任务
  const taskData = [
    { title: 'AI医疗研究技术方案', desc: '设计深度学习医疗影像系统', status: 'in_progress', priority: 'high', creator: 'ai-president-001', assignee: 'ai-cto-001', progress: 65 },
    { title: 'Q2预算编制', desc: '编制第二季度预算', status: 'in_progress', priority: 'urgent', creator: 'ai-president-001', assignee: 'ai-finance-001', progress: 80 },
    { title: '市场推广方案', desc: '制定推广策略', status: 'in_progress', priority: 'medium', creator: 'ai-president-001', assignee: 'ai-marketing-001', progress: 45 },
    { title: '系统架构优化', desc: '优化后端架构', status: 'pending', priority: 'high', creator: 'ai-cto-001', assignee: null, progress: 0 },
    { title: '年终财务审计', desc: '2025年度审计', status: 'completed', priority: 'high', creator: 'ai-president-001', assignee: 'ai-finance-001', progress: 100 }
  ]
  
  for (const t of taskData) {
    const data = {
      title: t.title,
      description: t.desc,
      status: t.status,
      priority: t.priority,
      progress: t.progress,
      creator: { connect: { id: t.creator } },
      type: t.assignee ? 'delegation' : 'default'
    }
    if (t.assignee) {
      data.assignee = { connect: { id: t.assignee } }
    }
    if (t.status === 'completed') {
      data.completedAt = new Date()
    }
    await prisma.task.create({ data })
  }
  console.log('✅ 任务: 5个')
  
  // 5. 业务线
  const biz = await prisma.business.upsert({
    where: { id: 'biz-research' },
    update: {},
    create: { id: 'biz-research', name: '科研项目管理', description: 'AI技术研究', organizationId: org.id }
  })
  console.log('✅ 业务线:', biz.name)
  
  // 6. 流程模板
  const proc = await prisma.processTemplate.upsert({
    where: { id: 'proc-project' },
    update: {},
    create: {
      id: 'proc-project',
      name: '项目立项流程',
      description: '科研项目流程',
      businessId: biz.id,
      version: 'v2.0',
      status: 'published',
      flowDef: JSON.stringify({ nodes: [{id:'start',type:'start'},{id:'apply',type:'task'},{id:'end',type:'end'}] })
    }
  })
  console.log('✅ 流程:', proc.name)
  
  // 7. 会议
  const meeting = await prisma.meeting.create({
    data: {
      title: 'AI医疗项目启动会',
      description: '讨论技术方案',
      type: 'structured',
      status: 'ongoing',
      convenor: { connect: { id: 'ai-president-001' } },
      participantIds: JSON.stringify(['ai-cto-001', 'ai-product-001']),
      startedAt: new Date()
    }
  })
  console.log('✅ 会议:', meeting.title)
  
  // 8. 知识库
  await prisma.knowledgeDocument.create({
    data: {
      title: '项目审批权限规则',
      content: '10万以下项目由副院长审批，10-50万由总工+财务双签，50万以上需院长最终审批。',
      type: 'org_rule',
      organizationId: org.id
    }
  })
  console.log('✅ 知识库: 1个文档')
  
  console.log('\n🎉 测试数据创建完成!')
  console.log('📊 汇总: 组织1 | 角色6 | Agent6 | 任务5 | 业务1 | 流程1 | 会议1 | 知识1')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
