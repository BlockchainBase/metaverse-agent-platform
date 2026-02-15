import { useMetaverseStore } from '../stores/metaverse'

export function UIOverlay() {
  const { 
    projects, 
    selectedProject, 
    selectedAgent, 
    selectProject, 
    selectAgent 
  } = useMetaverseStore()

  const stats = {
    total: projects.length,
    stage1: projects.filter(p => p.stage === 'STAGE1').length,
    stage2: projects.filter(p => p.stage === 'STAGE2').length,
    stage3: projects.filter(p => p.stage === 'STAGE3').length,
    stage4: projects.filter(p => p.stage === 'STAGE4').length,
  }

  return (
    <div className="ui-overlay">
      {/* Header */}
      <header className="metaverse-header">
        <h1>🏛️ 研究院AI Agent协作空间</h1>
        <div className="header-stats">
          <div className="stat-item">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">项目总数</div>
          </div>
          <div className="stat-item">
            <div className="stat-value" style={{ color: '#3b82f6' }}>{stats.stage1}</div>
            <div className="stat-label">市场对接</div>
          </div>
          <div className="stat-item">
            <div className="stat-value" style={{ color: '#f59e0b' }}>{stats.stage2}</div>
            <div className="stat-label">方案制定</div>
          </div>
          <div className="stat-item">
            <div className="stat-value" style={{ color: '#ef4444' }}>{stats.stage3}</div>
            <div className="stat-label">研发Demo</div>
          </div>
          <div className="stat-item">
            <div className="stat-value" style={{ color: '#10b981' }}>{stats.stage4}</div>
            <div className="stat-label">实施交付</div>
          </div>
        </div>
      </header>

      {/* Side Panel - Project or Agent Details */}
      <aside className={`side-panel ${selectedProject || selectedAgent ? 'open' : ''}`}>
        {selectedProject && (
          <ProjectDetail 
            project={selectedProject} 
            onClose={() => selectProject(null)} 
          />
        )}
        {selectedAgent && (
          <AgentDetail 
            agent={selectedAgent} 
            onClose={() => selectAgent(null)} 
          />
        )}
      </aside>

      {/* Legend */}
      <div className="legend">
        <h4>项目状态</h4>
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#3b82f6' }}></div>
          <span>市场对接 (阶段1)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#f59e0b' }}></div>
          <span>方案制定 (阶段2)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#ef4444' }}></div>
          <span>研发Demo (阶段3)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#10b981' }}></div>
          <span>实施交付 (阶段4)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#ef4444', animation: 'pulse 1s infinite' }}></div>
          <span>高优先级/延期预警</span>
        </div>
      </div>
    </div>
  )
}

function ProjectDetail({ project, onClose }: { project: any; onClose: () => void }) {
  const stageNames: Record<string, string> = {
    'STAGE1': '市场对接',
    'STAGE2': '方案制定',
    'STAGE3': '研发Demo',
    'STAGE4': '实施交付'
  }

  const statusNames: Record<string, string> = {
    'NOT_STARTED': '未开始',
    'IN_PROGRESS': '进行中',
    'COMPLETED': '已完成',
    'BLOCKED': '阻塞'
  }

  return (
    <div className="side-panel-content">
      <button className="close-btn" onClick={onClose}>×</button>
      <h2>📋 项目详情</h2>
      
      <div className="info-row">
        <span className="info-label">项目编号</span>
        <span className="info-value">{project.code}</span>
      </div>
      
      <div className="info-row">
        <span className="info-label">项目名称</span>
        <span className="info-value">{project.name}</span>
      </div>
      
      <div className="info-row">
        <span className="info-label">客户名称</span>
        <span className="info-value">{project.customerName}</span>
      </div>
      
      <div className="info-row">
        <span className="info-label">当前阶段</span>
        <span className="info-value" style={{ color: project.color }}>
          {stageNames[project.stage]}
        </span>
      </div>
      
      <div className="info-row">
        <span className="info-label">阶段状态</span>
        <span className="info-value">{statusNames[project.stageStatus]}</span>
      </div>
      
      <div className="info-row">
        <span className="info-label">项目进度</span>
        <span className="info-value">{project.progress}%</span>
      </div>
      
      <div className="info-row">
        <span className="info-label">优先级</span>
        <span className="info-value">
          {project.priority === 'HIGH' ? '🔴 高' : project.priority === 'MEDIUM' ? '🟡 中' : '🟢 低'}
        </span>
      </div>
      
      <div className="info-row">
        <span className="info-label">项目经理</span>
        <span className="info-value">{project.manager?.name}</span>
      </div>

      {/* Progress Bar */}
      <div style={{ marginTop: '20px' }}>
        <div style={{ 
          width: '100%', 
          height: '8px', 
          background: 'rgba(255,255,255,0.2)', 
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${project.progress}%`,
            height: '100%',
            background: project.color,
            borderRadius: '4px',
            transition: 'width 0.3s ease'
          }}></div>
        </div>
      </div>
    </div>
  )
}

function AgentDetail({ agent, onClose }: { agent: any; onClose: () => void }) {
  const roleDescriptions: Record<string, string> = {
    'MARKET': '负责客户线索管理、初步沟通、商机跟进',
    'SOLUTION': '负责需求分析、方案设计、原型制作',
    'PROJECT': '负责项目统筹、进度跟踪、资源协调',
    'DEVELOPER': '负责任务拆解、代码管理、Demo构建',
    'DELIVERY': '负责部署上线、客户培训、运维交接',
    'FINANCE': '负责预算管理、成本核算、收款跟踪',
    'DIRECTOR': '负责全局监控、决策支持、异常预警',
    'DEVOPS': '负责用户体验优化、系统运维保障'
  }

  return (
    <div className="side-panel-content">
      <button className="close-btn" onClick={onClose}>×</button>
      <h2>{agent.avatar} {agent.name}</h2>
      
      <div className="info-row">
        <span className="info-label">角色类型</span>
        <span className="info-value">{agent.role}</span>
      </div>
      
      <div className="info-row">
        <span className="info-label">职责描述</span>
        <span className="info-value" style={{ textAlign: 'right', maxWidth: '200px' }}>
          {roleDescriptions[agent.role]}
        </span>
      </div>
      
      <div className="info-row">
        <span className="info-label">当前状态</span>
        <span className="info-value" style={{ color: '#10b981' }}>运行中</span>
      </div>

      <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
        <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6', color: 'rgba(255,255,255,0.8)' }}>
          此Agent由真人控制，可执行自动化任务并协助项目推进。
        </p>
      </div>
    </div>
  )
}