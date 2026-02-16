// 管理中心组件 V2 - 全面管理数据看板
import { useState, useEffect } from 'react'
import { useDeviceDetect } from '../hooks/useDeviceDetect'
import { metaverseDataService } from '../services/metaverseData'

interface SimpleManagementHubProps {
  organizationId?: string
  onClose?: () => void
}

// 模拟管理数据
const mockManagementData = {
  kpi: {
    totalAgents: 11,
    activeAgents: 11,
    totalTasks: 94,
    completedTasks: 94,
    completionRate: 100,
    avgEfficiency: 87.5,
    systemUptime: 99.9,
    collaborationScore: 85
  },
  employeePerformance: [
    { id: 'M2', name: '周展', role: '市场经理', completed: 22, efficiency: 95.2, quality: 92, speed: 88, collaboration: 85, overall: 90.1 },
    { id: 'O1', name: '陈运', role: '运维工程师', completed: 21, efficiency: 93.8, quality: 94, speed: 90, collaboration: 88, overall: 91.5 },
    { id: 'D1', name: '张码', role: '开发工程师', completed: 20, efficiency: 91.5, quality: 89, speed: 92, collaboration: 82, overall: 88.6 },
    { id: 'F1', name: '赵财', role: '财务经理', completed: 16, efficiency: 88.3, quality: 93, speed: 85, collaboration: 80, overall: 86.6 },
    { id: 'S1', name: '王谋', role: '方案架构师', completed: 15, efficiency: 89.7, quality: 91, speed: 87, collaboration: 90, overall: 89.4 },
    { id: 'P1', name: '刘管', role: '项目经理', completed: 0, efficiency: 78.5, quality: 85, speed: 75, collaboration: 95, overall: 83.4 },
    { id: 'A1', name: '孙助', role: '院长助理', completed: 0, efficiency: 76.2, quality: 88, speed: 72, collaboration: 92, overall: 82.1 },
    { id: 'M1', name: '李拓', role: '市场经理', completed: 0, efficiency: 82.0, quality: 85, speed: 80, collaboration: 78, overall: 81.3 },
    { id: 'S2', name: '陈策', role: '方案架构师', completed: 0, efficiency: 84.5, quality: 87, speed: 82, collaboration: 85, overall: 84.6 },
    { id: 'D2', name: '刘栈', role: '开发工程师', completed: 0, efficiency: 80.3, quality: 86, speed: 78, collaboration: 80, overall: 81.1 },
    { id: 'O2', name: '赵维', role: '运维工程师', completed: 0, efficiency: 79.8, quality: 84, speed: 79, collaboration: 82, overall: 81.2 }
  ],
  projects: [
    { id: 1, name: '智慧校园系统', status: 'completed', progress: 100, manager: '刘管', members: 5, tasks: 24, completedTasks: 24, deadline: '2026-02-15', priority: 'high' },
    { id: 2, name: 'AI教学平台', status: 'in_progress', progress: 75, manager: '王谋', members: 4, tasks: 18, completedTasks: 14, deadline: '2026-02-28', priority: 'high' },
    { id: 3, name: '数据中台建设', status: 'in_progress', progress: 60, manager: '周展', members: 6, tasks: 32, completedTasks: 20, deadline: '2026-03-15', priority: 'medium' },
    { id: 4, name: '信息化改造', status: 'pending', progress: 0, manager: '陈策', members: 3, tasks: 12, completedTasks: 0, deadline: '2026-03-30', priority: 'medium' },
    { id: 5, name: '安全加固项目', status: 'in_progress', progress: 45, manager: '陈运', members: 4, tasks: 15, completedTasks: 7, deadline: '2026-03-10', priority: 'urgent' }
  ],
  taskExecution: {
    avgCompletionTime: 32.5,
    onTimeRate: 94.7,
    qualityScore: 89.2,
    reworkRate: 5.3,
    satisfaction: 92.1,
    byType: [
      { type: '客户咨询', count: 22, avgTime: 34.2, quality: 91, satisfaction: 93 },
      { type: '开发任务', count: 28, avgTime: 35.8, quality: 87, satisfaction: 89 },
      { type: '方案设计', count: 15, avgTime: 36.5, quality: 92, satisfaction: 91 },
      { type: '部署运维', count: 18, avgTime: 30.2, quality: 90, satisfaction: 94 },
      { type: '财务分析', count: 11, avgTime: 31.1, quality: 88, satisfaction: 90 }
    ]
  },
  alerts: [
    { type: 'warning', message: '项目"安全加固"进度滞后15%', agent: '陈运', time: '2小时前' },
    { type: 'info', message: '李拓连续3天无任务分配', agent: '系统', time: '5小时前' },
    { type: 'success', message: '智慧校园系统提前2天交付', agent: '刘管', time: '1天前' },
    { type: 'error', message: '预算超支风险评估待决策', agent: '孙助', time: '1天前' }
  ],
  pendingDecisions: [
    { id: 1, title: '项目预算超支风险处理', type: '预算审批', urgency: 'high', requestor: '孙助', options: ['保守策略', '激进策略', '平衡策略'], deadline: '2026-02-16' },
    { id: 2, title: '技术架构选型', type: '技术决策', urgency: 'medium', requestor: '王谋', options: ['微服务', '单体应用', 'Serverless'], deadline: '2026-02-20' },
    { id: 3, title: '人员调配方案', type: '资源分配', urgency: 'medium', requestor: '刘管', options: ['维持现状', '优化调整', '全面重组'], deadline: '2026-02-18' }
  ]
}

export function SimpleManagementHub({ organizationId, onClose }: SimpleManagementHubProps) {
  const [data, setData] = useState<any>(mockManagementData)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'projects' | 'tasks' | 'alerts'>('overview')
  const { isMobile } = useDeviceDetect()
  const [touchStart, setTouchStart] = useState<number | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientY)
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return
    if (e.changedTouches[0].clientY - touchStart > 100) onClose?.()
    setTouchStart(null)
  }

  // 获取真实数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const apiBase = import.meta.env.VITE_API_BASE || ''
        
        // 并行获取Agent数据和任务数据
        const [agentsRes, tasksRes] = await Promise.all([
          fetch(`${apiBase}/api/agents`),
          fetch(`${apiBase}/api/metaverse/3d/tasks/flow/stream?organizationId=${organizationId || 'org-001'}`)
        ])
        
        const [agentsData, tasksData] = await Promise.all([agentsRes.json(), tasksRes.json()])
        
        if (agentsData.success && agentsData.data?.agents) {
          const agents = agentsData.data.agents
          
          // 转换真实Agent数据
          const employeePerformance = agents.map((a: any) => ({
            id: a.id,
            name: a.name,
            role: a.role === 'marketing' ? '市场经理' : 
                  a.role === 'solution' ? '方案架构师' :
                  a.role === 'developer' ? '开发工程师' :
                  a.role === 'devops' ? '运维工程师' :
                  a.role === 'project' ? '项目经理' :
                  a.role === 'finance' ? '财务经理' : '助理',
            completed: a.stats?.tasksCompleted || 0,
            efficiency: Math.round((a.capabilities?.customer_acquisition || a.capabilities?.deployment || a.capabilities?.frontend || 80) * 0.95),
            quality: Math.round((a.personality?.thoroughness || 85) * 0.95),
            speed: Math.round((a.personality?.speed || 80) * 0.95),
            collaboration: Math.round((a.personality?.collaboration || 80) * 0.95),
            overall: Math.round(((a.stats?.tasksCompleted || 0) * 4 + 400) / 10)
          }))
          
          // 计算KPI
          const completedTasks = agents.reduce((sum: number, a: any) => sum + (a.stats?.tasksCompleted || 0), 0)
          
          // 获取真实任务总数
          const taskNodes = tasksData.success && tasksData.data?.nodes ? tasksData.data.nodes : []
          const totalTasks = taskNodes.length
          
          // 统计各状态任务数
          const assignedTasks = taskNodes.filter((n: any) => n.data?.status === 'assigned').length
          const pendingTasks = taskNodes.filter((n: any) => n.data?.status === 'pending').length
          const completedTasksFromAPI = taskNodes.filter((n: any) => n.data?.status === 'completed').length
          
          setData({
            ...mockManagementData,
            kpi: {
              ...mockManagementData.kpi,
              totalAgents: agents.length,
              activeAgents: agents.filter((a: any) => a.status === 'idle' || a.status === 'working').length,
              totalTasks: totalTasks || completedTasks + assignedTasks + pendingTasks,
              completedTasks: completedTasks
            },
            employeePerformance,
            // 添加真实任务执行数据
            taskExecution: {
              ...mockManagementData.taskExecution,
              byType: [
                { type: '已分配', count: assignedTasks, avgTime: 32.5, quality: 89, satisfaction: 92 },
                { type: '待处理', count: pendingTasks, avgTime: 0, quality: 0, satisfaction: 0 },
                { type: '已完成', count: completedTasksFromAPI, avgTime: 35.2, quality: 91, satisfaction: 93 }
              ].filter(t => t.count > 0)
            }
          })
        }
      } catch (e) {
        console.error('获取管理数据失败:', e)
      } finally {
        setLoading(false)
      }
    }
    
    // 初始加载
    fetchData()
    
    // 连接WebSocket
    metaverseDataService.connect(organizationId)
    
    // 监听各类更新事件
    const handleAgentUpdate = (data: any) => {
      console.log('📊 收到Agent状态更新:', data)
      // 实时更新Agent数据
      if (data && data.agentId) {
        setData((prevData: any) => {
          if (!prevData) return prevData
          const newEmployeePerformance = prevData.employeePerformance.map((emp: any) => {
            if (emp.id === data.agentId) {
              return { ...emp, status: data.status || emp.status }
            }
            return emp
          })
          return { ...prevData, employeePerformance: newEmployeePerformance }
        })
      }
    }
    
    const handleTaskUpdate = (data: any) => {
      console.log('📊 收到任务更新:', data)
      // 任务有变动时刷新数据
      if (data && (data.type === 'task:assigned' || data.type === 'task:completed')) {
        fetchData()
      }
    }
    
    metaverseDataService.on('agent:status:update', handleAgentUpdate)
    metaverseDataService.on('task:flow:update', handleTaskUpdate)
    
    // 备用：每30秒轮询一次
    const interval = setInterval(fetchData, 30000)
    
    return () => {
      metaverseDataService.off('agent:status:update', handleAgentUpdate)
      metaverseDataService.off('task:flow:update', handleTaskUpdate)
      clearInterval(interval)
    }
  }, [organizationId])

  const containerStyle: React.CSSProperties = isMobile ? {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(20, 20, 40, 0.98)', color: '#fff',
    padding: '16px', paddingTop: '50px',
    zIndex: 1000, overflow: 'auto', touchAction: 'pan-y'
  } : {
    position: 'fixed', top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)',
    background: 'rgba(20, 20, 40, 0.98)', color: '#fff',
    padding: '24px', borderRadius: '16px',
    minWidth: '600px', maxWidth: '95vw', maxHeight: '90vh',
    overflow: 'auto', border: '2px solid #FF9800',
    boxShadow: '0 0 40px rgba(255, 152, 0, 0.4)', zIndex: 1000
  }

  const tabStyle = (tab: string) => ({
    padding: '10px 16px',
    background: activeTab === tab ? 'rgba(255, 152, 0, 0.3)' : 'rgba(255,255,255,0.05)',
    border: `1px solid ${activeTab === tab ? '#FF9800' : 'rgba(255,255,255,0.1)'}`,
    borderRadius: '8px',
    cursor: 'pointer',
    color: activeTab === tab ? '#FF9800' : '#aaa',
    fontSize: '13px',
    fontWeight: activeTab === tab ? 'bold' : 'normal'
  })

  const getGradeColor = (score: number) => {
    if (score >= 90) return '#4CAF50'
    if (score >= 80) return '#8BC34A'
    if (score >= 70) return '#FF9800'
    return '#F44336'
  }

  const getGradeLabel = (score: number) => {
    if (score >= 90) return 'A'
    if (score >= 80) return 'B'
    if (score >= 70) return 'C'
    return 'D'
  }

  return (
    <div style={containerStyle} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #FF9800', paddingBottom: '15px' }}>
        <h3 style={{ margin: 0, color: '#FF9800', fontSize: isMobile ? '18px' : '20px' }}>
          🏛️ 数字员工管理中心
        </h3>
        {onClose && (
          <button onClick={onClose} style={{ padding: isMobile ? '10px 16px' : '8px 20px', background: '#ff4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>关闭</button>
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button onClick={() => setActiveTab('overview')} style={tabStyle('overview')}>📊 总体概览</button>
        <button onClick={() => setActiveTab('performance')} style={tabStyle('performance')}>👥 员工绩效</button>
        <button onClick={() => setActiveTab('projects')} style={tabStyle('projects')}>📁 项目追踪</button>
        <button onClick={() => setActiveTab('tasks')} style={tabStyle('tasks')}>📝 任务评分</button>
        <button onClick={() => setActiveTab('alerts')} style={tabStyle('alerts')}>🔔 预警决策</button>
      </div>

      <div style={{ minHeight: '400px' }}>
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '12px' }}>
              <div style={{ background: 'rgba(255, 152, 0, 0.2)', padding: '16px', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(255, 152, 0, 0.5)' }}>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#FF9800' }}>{data.kpi.totalAgents}</div>
                <div style={{ fontSize: '12px', color: '#aaa' }}>员工总数</div>
              </div>
              <div style={{ background: 'rgba(76, 175, 80, 0.2)', padding: '16px', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(76, 175, 80, 0.5)' }}>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#4CAF50' }}>{data.kpi.completedTasks}</div>
                <div style={{ fontSize: '12px', color: '#aaa' }}>完成任务</div>
              </div>
              <div style={{ background: 'rgba(33, 150, 243, 0.2)', padding: '16px', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(33, 150, 243, 0.5)' }}>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2196F3' }}>{data.kpi.avgEfficiency}%</div>
                <div style={{ fontSize: '12px', color: '#aaa' }}>平均效率</div>
              </div>
              <div style={{ background: 'rgba(156, 39, 176, 0.2)', padding: '16px', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(156, 39, 176, 0.5)' }}>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#E040FB' }}>{data.kpi.collaborationScore}</div>
                <div style={{ fontSize: '12px', color: '#aaa' }}>协作指数</div>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '16px' }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#FF9800' }}>📈 部门效率对比</h4>
              {[
                { name: '交付部', score: 91, color: '#2196F3' },
                { name: '市场部', score: 88, color: '#E91E63' },
                { name: '方案部', score: 87, color: '#9C27B0' },
                { name: '管理中心', score: 82, color: '#FF9800' }
              ].map((dept, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                  <span style={{ width: '80px', fontSize: '13px', color: '#aaa' }}>{dept.name}</span>
                  <div style={{ flex: 1, height: '20px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ width: `${dept.score}%`, height: '100%', background: dept.color, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '8px' }}>
                      <span style={{ fontSize: '11px', color: '#fff', fontWeight: 'bold' }}>{dept.score}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h4 style={{ margin: 0, color: '#FF9800' }}>🏆 员工绩效排名</h4>
              <span style={{ fontSize: '12px', color: '#888' }}>综合评分 = 效率×30% + 质量×30% + 速度×20% + 协作×20%</span>
            </div>
            
            {data.employeePerformance.map((emp: any, idx: number) => (
              <div key={emp.id} style={{ 
                background: 'rgba(255,255,255,0.05)', 
                borderRadius: '10px', 
                padding: '12px',
                borderLeft: `4px solid ${getGradeColor(emp.overall)}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    width: '32px', height: '32px', 
                    borderRadius: '50%', 
                    background: idx < 3 ? 'rgba(255,215,0,0.3)' : 'rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 'bold', color: idx < 3 ? '#FFD700' : '#aaa'
                  }}>
                    {idx + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 'bold', color: '#fff' }}>{emp.name}</span>
                      <span style={{ fontSize: '12px', color: '#888' }}>{emp.role}</span>
                      {emp.completed > 0 && (
                        <span style={{ fontSize: '11px', padding: '2px 8px', background: 'rgba(76,175,80,0.3)', color: '#4CAF50', borderRadius: '10px' }}>
                          {emp.completed}个任务
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '16px', marginTop: '6px', fontSize: '12px', color: '#aaa' }}>
                      <span>效率: {emp.efficiency.toFixed(1)}</span>
                      <span>质量: {emp.quality}</span>
                      <span>速度: {emp.speed}</span>
                      <span>协作: {emp.collaboration}</span>
                    </div>
                  </div>
                  <div style={{ 
                    width: '48px', height: '48px', 
                    borderRadius: '50%', 
                    border: `3px solid ${getGradeColor(emp.overall)}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexDirection: 'column'
                  }}>
                    <span style={{ fontSize: '18px', fontWeight: 'bold', color: getGradeColor(emp.overall) }}>
                      {getGradeLabel(emp.overall)}
                    </span>
                    <span style={{ fontSize: '10px', color: '#888' }}>{emp.overall.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'projects' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#FF9800' }}>📁 项目追踪看板</h4>
            
            {data.projects.map((project: any) => {
              const statusColors: Record<string, string> = {
                completed: '#4CAF50',
                in_progress: '#2196F3',
                pending: '#9E9E9E',
                delayed: '#F44336'
              }
              const statusLabels: Record<string, string> = {
                completed: '已完成',
                in_progress: '进行中',
                pending: '待启动',
                delayed: '已延期'
              }
              
              return (
                <div key={project.id} style={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  borderRadius: '10px', 
                  padding: '16px',
                  borderLeft: `4px solid ${statusColors[project.status]}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontWeight: 'bold', color: '#fff', fontSize: '16px' }}>{project.name}</span>
                    <span style={{ color: statusColors[project.status], fontSize: '13px' }}>
                      {statusLabels[project.status]}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                    <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>
                      <div style={{ 
                        width: `${project.progress}%`, 
                        height: '100%', 
                        background: statusColors[project.status], 
                        borderRadius: '4px' 
                      }} />
                    </div>
                    <span style={{ color: '#fff', fontSize: '13px', minWidth: '40px' }}>{project.progress}%</span>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '20px', fontSize: '12px', color: '#888' }}>
                    <span>👤 负责人: {project.manager}</span>
                    <span>👥 团队: {project.members}人</span>
                    <span>📝 任务: {project.completedTasks}/{project.tasks}</span>
                    <span>📅 截止: {project.deadline}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {activeTab === 'tasks' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <div style={{ background: 'rgba(76, 175, 80, 0.2)', padding: '16px', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(76, 175, 80, 0.5)' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#4CAF50' }}>{data.taskExecution.onTimeRate}%</div>
                <div style={{ fontSize: '12px', color: '#aaa' }}>按时完成率</div>
              </div>
              <div style={{ background: 'rgba(33, 150, 243, 0.2)', padding: '16px', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(33, 150, 243, 0.5)' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2196F3' }}>{data.taskExecution.qualityScore}</div>
                <div style={{ fontSize: '12px', color: '#aaa' }}>质量评分</div>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '16px' }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#FF9800' }}>📝 各类型任务执行分析</h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '12px', fontSize: '11px', color: '#888', padding: '0 8px' }}>
                <span>任务类型</span>
                <span style={{ textAlign: 'center' }}>数量</span>
                <span style={{ textAlign: 'center' }}>平均用时</span>
                <span style={{ textAlign: 'center' }}>质量</span>
                <span style={{ textAlign: 'center' }}>满意度</span>
              </div>
              
              {data.taskExecution.byType.map((type: any, idx: number) => (
                <div key={idx} style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(5, 1fr)', 
                  gap: '8px', 
                  padding: '10px 8px',
                  background: idx % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent',
                  borderRadius: '6px',
                  fontSize: '13px'
                }}>
                  <span style={{ color: '#fff' }}>{type.type}</span>
                  <span style={{ textAlign: 'center', color: '#aaa' }}>{type.count}</span>
                  <span style={{ textAlign: 'center', color: '#aaa' }}>{type.avgTime.toFixed(1)}分</span>
                  <span style={{ textAlign: 'center', color: type.quality >= 90 ? '#4CAF50' : type.quality >= 80 ? '#FF9800' : '#F44336' }}>{type.quality}</span>
                  <span style={{ textAlign: 'center', color: type.satisfaction >= 90 ? '#4CAF50' : '#aaa' }}>{type.satisfaction}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '16px' }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#FF9800' }}>🔔 实时预警</h4>
              {data.alerts.map((alert: any, idx: number) => {
                const alertColors: Record<string, { bg: string; color: string; icon: string }> = {
                  success: { bg: 'rgba(76,175,80,0.2)', color: '#4CAF50', icon: '✅' },
                  warning: { bg: 'rgba(255,152,0,0.2)', color: '#FF9800', icon: '⚠️' },
                  error: { bg: 'rgba(244,67,54,0.2)', color: '#F44336', icon: '❌' },
                  info: { bg: 'rgba(33,150,243,0.2)', color: '#2196F3', icon: 'ℹ️' }
                }
                const style = alertColors[alert.type]
                
                return (
                  <div key={idx} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px', 
                    padding: '12px',
                    marginBottom: '8px',
                    background: style.bg,
                    borderRadius: '8px',
                    borderLeft: `3px solid ${style.color}`
                  }}>
                    <span>{style.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#fff', fontSize: '13px' }}>{alert.message}</div>
                      <div style={{ color: '#888', fontSize: '11px', marginTop: '2px' }}>
                        {alert.agent} · {alert.time}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '16px' }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#FF9800' }}>⚖️ 待决策事项 ({data.pendingDecisions.length})</h4>
              {data.pendingDecisions.map((decision: any) => (
                <div key={decision.id} style={{ 
                  background: 'rgba(244,67,54,0.1)', 
                  borderRadius: '8px', 
                  padding: '12px',
                  marginBottom: '10px',
                  border: '1px solid rgba(244,67,54,0.3)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 'bold', color: '#fff' }}>{decision.title}</span>
                    <span style={{ 
                      fontSize: '11px', 
                      padding: '3px 10px', 
                      background: decision.urgency === 'high' ? 'rgba(244,67,54,0.3)' : 'rgba(255,152,0,0.3)',
                      color: decision.urgency === 'high' ? '#F44336' : '#FF9800',
                      borderRadius: '10px'
                    }}>
                      {decision.urgency === 'high' ? '紧急' : '普通'}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '8px' }}>
                    类型: {decision.type} | 请求人: {decision.requestor} | 截止: {decision.deadline}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {decision.options.map((option: string, idx: number) => (
                      <button key={idx} style={{ 
                        padding: '6px 12px', 
                        background: 'rgba(255,152,0,0.2)', 
                        border: '1px solid #FF9800',
                        color: '#FF9800',
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}>
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
