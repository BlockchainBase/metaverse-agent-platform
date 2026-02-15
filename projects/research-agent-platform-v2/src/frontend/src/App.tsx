import { useState, useCallback, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei'
import { ChineseCourtyard } from './components/Courtyard'
import { RealisticAgent } from './components/RealisticAgent'
import { Dashboards } from './components/Dashboards'
import { OfficeDecorations } from './components/OfficeDecorations'
import { AgentChatSystem } from './components/ChatBubble'
import { InteractionFeedback } from './components/InteractionFeedback'
import { EnvironmentController, SeasonType } from './components/EnvironmentController'
import { metaverseDataService, AgentState } from './services/metaverseData'
import { AGENTS_DATA, AgentRole, STATUS_CONFIG } from './data/agents'
import { FirstPersonController } from './components/FirstPersonController'
// import { MeetingRoom3D } from './components/MeetingRoom3D'
import { CollaborationLines, CollaborationHub } from './components/CollaborationLines'
import { ConnectionIndicator } from './components/ConnectionStatus'
import { AgentSidebar } from './components/AgentSidebar'
import { DepartmentRooms, DEPARTMENT_INFO } from './components/DepartmentRooms'
import { DEPARTMENTS_DATA } from './data/agents'
import { BrainstormingSpace } from './components/BrainstormingSpace'
// import { DepartmentTaskBoards } from './components/DepartmentTaskBoard'
import './App.css'

// AI角色位置配置（基于业务阶段）- 7个Agent（运维已合并到交付）
const AGENT_POSITIONS: Record<AgentRole, [number, number, number]> = {
  market: [-15, 0, 10],      // 阶段1: 市场对接
  solution: [-5, 0, 5],      // 阶段2: 方案制定
  project: [0, 0, 0],        // 中心: 项目管家
  developer: [5, 0, 0],      // 阶段3: 研发Demo
  delivery: [15, 0, -5],     // 阶段4: 实施交付（含运维）
  finance: [5, 0, -5],       // 账房
  director: [0, 5, -15],     // 正堂高位
}

// 角色详情弹窗
function AgentModal({ 
  role, 
  onClose,
  onlineAgents
}: { 
  role: AgentRole
  onClose: () => void
  onlineAgents: string[]
}) {
  const agent = AGENTS_DATA[role]
  const status = STATUS_CONFIG[agent.status]
  const isOnline = onlineAgents.includes(role)
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        {/* 头部 */}
        <div className="modal-header" style={{ backgroundColor: agent.color }}>
          <div className="modal-icon">{agent.emoji}</div>
          <div className="modal-title">
            <h2>{agent.name}</h2>
            <p>{agent.title} | {agent.department}</p>
            <span className="status-badge" style={{ backgroundColor: status.bgColor, color: status.color }}>
              {isOnline ? '🟢' : '⚪'} {status.label}
            </span>
          </div>
        </div>
        
        {/* 内容 */}
        <div className="modal-body">
          {/* OpenClaw设备信息 */}
          <div className="modal-section device-info">
            <h3>🔌 OpenClaw设备</h3>
            <p><strong>所属真人:</strong> {agent.ownerName}</p>
            <p><strong>联系邮箱:</strong> {agent.ownerEmail}</p>
            <p><strong>设备状态:</strong> {isOnline ? '🟢 在线' : '⚪ 离线'}</p>
          </div>
          
          {/* 简介 */}
          <div className="modal-section">
            <h3>📋 角色简介</h3>
            <p>{agent.description}</p>
          </div>
          
          {/* 当前任务 */}
          <div className="modal-section highlight">
            <h3>🎯 当前任务</h3>
            <p className="current-task">{agent.currentTask}</p>
          </div>
          
          {/* 能力清单 */}
          <div className="modal-section">
            <h3>💪 能力清单</h3>
            <ul>
              {agent.capabilities.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
          
          {/* 技能 */}
          <div className="modal-section">
            <h3>💡 核心技能</h3>
            <div className="skills-grid">
              {agent.skills.map((skill, i) => (
                <span key={i} className="skill-tag">{skill}</span>
              ))}
            </div>
          </div>
          
          {/* 统计 */}
          <div className="modal-section stats">
            <h3>📊 工作统计</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-value">{agent.stats.tasksCompleted}</span>
                <span className="stat-label">已完成任务</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{agent.stats.tasksPending}</span>
                <span className="stat-label">待处理任务</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{agent.stats.collaborationScore}</span>
                <span className="stat-label">协作评分</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{agent.stats.responseTime}min</span>
                <span className="stat-label">平均响应</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 顶部信息面板
function InfoPanel() {
  return (
    <div className="info-panel" style={{ left: '300px' }}>
      <div className="info-title">
        <span className="info-icon">🏛️</span>
        <div>
          <h1>研究院AI Agent协作平台</h1>
          <p>8个OpenClaw数字员工自主协作</p>
        </div>
      </div>
      
      <div className="stage-legend">
        <div className="stage-item">
          <span className="stage-dot" style={{ background: '#3B82F6' }}></span>
          <span>阶段1: 市场对接</span>
        </div>
        <div className="stage-item">
          <span className="stage-dot" style={{ background: '#F59E0B' }}></span>
          <span>阶段2: 方案制定</span>
        </div>
        <div className="stage-item">
          <span className="stage-dot" style={{ background: '#EF4444' }}></span>
          <span>阶段3: 研发Demo</span>
        </div>
        <div className="stage-item">
          <span className="stage-dot" style={{ background: '#10B981' }}></span>
          <span>阶段4: 实施交付</span>
        </div>
      </div>
    </div>
  )
}

// 四季及极端天气配置
const SEASONS: Array<{ id: SeasonType; name: string; icon: string; color: string }> = [
  { id: 'spring', name: '春季', icon: '🌸', color: '#FFB6C1' },
  { id: 'summer', name: '夏季', icon: '☀️', color: '#FFD54F' },
  { id: 'autumn', name: '秋季', icon: '🍂', color: '#E64A19' },
  { id: 'winter', name: '冬季', icon: '❄️', color: '#90A4AE' },
  { id: 'pleasant', name: '风和日丽', icon: '🌤️', color: '#87CEEB' },
  { id: 'scorching_sun', name: '烈日', icon: '🌞', color: '#FF6B00' },
  { id: 'heavy_rain', name: '暴雨', icon: '⛈️', color: '#4A5568' },
  { id: 'heavy_snow', name: '暴雪', icon: '🌨️', color: '#CBD5E0' },
  { id: 'strong_wind', name: '大风', icon: '💨', color: '#718096' }
]

// 右侧操作菜单面板
function RightSideMenu({
  onViewModeChange,
  onSeasonChange,
  viewMode,
  currentSeason,
  visible = true
}: {
  onViewModeChange: (mode: 'orbit' | 'first-person') => void
  onSeasonChange: (season: SeasonType) => void
  viewMode: 'orbit' | 'first-person'
  currentSeason: SeasonType
  visible?: boolean
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!visible) return null;

  return (
    <div
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      style={{
        position: 'fixed',
        right: '0',
        top: '80px',
        bottom: '20px',
        width: isExpanded ? '200px' : '50px',
        background: isExpanded ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
        backdropFilter: isExpanded ? 'blur(10px)' : 'none',
        borderRadius: isExpanded ? '16px 0 0 16px' : '0',
        padding: isExpanded ? '20px' : '0',
        boxShadow: isExpanded ? '0 8px 32px rgba(0, 0, 0, 0.2)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        zIndex: 16777272,
        maxHeight: '80vh',
        overflowY: isExpanded ? 'auto' : 'visible',
        transition: 'all 0.3s ease',
      }}
    >
      {/* 缩略浮标 - 收起时显示 */}
      {!isExpanded && (
        <div style={{
          position: 'absolute',
          right: '0',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '40px',
          height: '120px',
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '8px 0 0 8px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          cursor: 'pointer',
          border: '1px solid rgba(0,0,0,0.1)',
          borderRight: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}>
          <span style={{ fontSize: '20px' }}>🎮</span>
          <span style={{ fontSize: '12px', writingMode: 'vertical-rl', color: '#333' }}>功能菜单</span>
          <span style={{ fontSize: '14px', color: '#333' }}>‹</span>
        </div>
      )}

      {/* 展开内容 */}
      {isExpanded && (
        <>
          <h4 style={{
            margin: '0 0 8px 0',
            fontSize: '16px',
            color: '#333',
            borderBottom: '2px solid #e0e0e0',
            paddingBottom: '10px',
            textAlign: 'center'
          }}>
            🎮 功能菜单
          </h4>
      
      <button
        onClick={() => onViewModeChange('orbit')}
        style={{
          padding: '12px 16px',
          borderRadius: '10px',
          border: 'none',
          background: viewMode === 'orbit' ? '#4A90E2' : '#f0f0f0',
          color: viewMode === 'orbit' ? 'white' : '#333',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.2s'
        }}
      >
        🎥 环绕视角
      </button>
      
      <button
        onClick={() => onViewModeChange('first-person')}
        style={{
          padding: '12px 16px',
          borderRadius: '10px',
          border: 'none',
          background: viewMode === 'first-person' ? '#4A90E2' : '#f0f0f0',
          color: viewMode === 'first-person' ? 'white' : '#333',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.2s'
        }}
      >
        🚶 漫游模式
      </button>
      
      <div style={{ height: '1px', background: '#e0e0e0', margin: '8px 0' }} />

      <h4 style={{
        margin: '0',
        fontSize: '14px',
        color: '#333',
        textAlign: 'center'
      }}>
        🌿 四季环境
      </h4>

      {SEASONS.map(season => (
        <button
          key={season.id}
          onClick={() => onSeasonChange(season.id)}
          style={{
            padding: '10px 12px',
            borderRadius: '8px',
            border: '2px solid ' + (currentSeason === season.id ? season.color : '#e0e0e0'),
            background: currentSeason === season.id ? season.color : 'white',
            color: currentSeason === season.id ? 'white' : '#333',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: currentSeason === season.id ? 'bold' : 'normal',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
        >
          <span style={{ fontSize: '18px' }}>{season.icon}</span>
          <span>{season.name}</span>
        </button>
      ))}

      <div style={{
        marginTop: '8px',
        padding: '10px',
        background: '#f8f9fa',
        borderRadius: '8px',
        fontSize: '11px',
        color: '#666',
        lineHeight: '1.5'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#333' }}>💡 操作提示：</div>
        <div>• 点击切换四季</div>
        <div>• 漫游：WASD移动</div>
        <div>• 鼠标控制视角</div>
      </div>
        </>
      )}
    </div>
  );
}

// 底部控制面板
function ControlPanel({
  selectedRole,
  onSeasonChange,
  currentSeason
}: {
  selectedRole: AgentRole | null
  onSeasonChange: (season: SeasonType) => void
  currentSeason: SeasonType
}) {
  const seasonNames: Record<SeasonType, string> = {
    spring: '🌸 春季',
    summer: '☀️ 夏季',
    autumn: '🍂 秋季',
    winter: '❄️ 冬季'
  }

  return (
    <div className="control-panel" style={{ left: '300px' }}>
      <div className="control-buttons">
        {SEASONS.map(season => (
          <button
            key={season.id}
            className="control-btn"
            onClick={() => onSeasonChange(season.id)}
            style={{
              background: currentSeason === season.id ? season.color : '#f0f0f0',
              color: currentSeason === season.id ? 'white' : '#333'
            }}
          >
            {season.icon} {season.name}
          </button>
        ))}
      </div>
      
      {selectedRole && (
        <div className="selected-info">
          已选择: <strong>{AGENTS_DATA[selectedRole].name}</strong>
        </div>
      )}
    </div>
  )
}

// 部门信息弹窗 - 包含任务列表
function DepartmentModal({
  deptKey,
  onClose
}: {
  deptKey: string
  onClose: () => void
}) {
  const info = DEPARTMENT_INFO[deptKey]
  const deptData = DEPARTMENTS_DATA[deptKey]
  if (!info) return null

  // 任务状态颜色
  const statusColors: Record<string, string> = {
    pending: '#9E9E9E',
    in_progress: '#2196F3',
    completed: '#4CAF50',
    blocked: '#F44336'
  }

  const statusLabels: Record<string, string> = {
    pending: '待处理',
    in_progress: '进行中',
    completed: '已完成',
    blocked: '已阻塞'
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxHeight: '80vh', overflow: 'auto' }}>
        <button className="modal-close" onClick={onClose}>×</button>

        <div className="modal-header" style={{ background: deptData?.color || '#4A90E2' }}>
          <h2>{info.name}</h2>
          <p>{info.stage}</p>
        </div>

        <div className="modal-body">
          <div className="modal-section">
            <h3>📋 部门职责</h3>
            <p>{info.description}</p>
          </div>

          {/* 任务列表 - 部门作为任务中心 */}
          {deptData && deptData.tasks && deptData.tasks.length > 0 && (
            <div className="modal-section">
              <h3>📋 当前任务 ({deptData.stats.inProgressTasks}进行中 / {deptData.stats.totalTasks}总任务)</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                {deptData.tasks.map((task: any) => (
                  <div key={task.id} style={{
                    padding: '12px',
                    background: '#f8f9fa',
                    borderRadius: '8px',
                    borderLeft: `4px solid ${statusColors[task.status]}`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{task.title}</span>
                      <span style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: statusColors[task.status],
                        color: 'white'
                      }}>
                        {statusLabels[task.status]}
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#666', margin: '0 0 8px 0' }}>{task.description}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                      <span style={{ color: '#888' }}>负责人: {task.assignee}</span>
                      <span style={{ color: '#888' }}>截止: {task.dueDate}</span>
                    </div>
                    {/* 进度条 */}
                    <div style={{ marginTop: '8px' }}>
                      <div style={{ height: '4px', background: '#e0e0e0', borderRadius: '2px' }}>
                        <div style={{
                          width: `${task.progress}%`,
                          height: '100%',
                          background: statusColors[task.status],
                          borderRadius: '2px'
                        }} />
                      </div>
                      <span style={{ fontSize: '11px', color: '#888' }}>进度: {task.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="modal-section">
            <h3>📌 主要工作</h3>
            <ul>
              {info.responsibilities.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="modal-section stats">
            <h3>📊 关键指标</h3>
            <div className="stats-grid">
              {info.keyMetrics.map((metric: any, i: number) => (
                <div key={i} className="stat-item">
                  <span className="stat-value">{metric.value}</span>
                  <span className="stat-label">{metric.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [selectedRole, setSelectedRole] = useState<AgentRole | null>(null)
  const [selectedDept, setSelectedDept] = useState<string | null>(null)
  const [season, setSeason] = useState<SeasonType>('spring')
  const [viewMode, setViewMode] = useState<'orbit' | 'first-person'>('orbit')
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false)
  // 分层加载控制
  const [loadingStage, setLoadingStage] = useState(0)
  // 会议室功能已删除
  
  // 分层加载：逐步显示各图层
  useEffect(() => {
    // Stage 0: 四合院基础场景（立即显示）
    // Stage 1: 1秒后显示Agent和部门房间
    const stage1 = setTimeout(() => setLoadingStage(1), 1000)
    // Stage 2: 2秒后显示思维碰撞中心和数据看板
    const stage2 = setTimeout(() => {
      setLoadingStage(2)
      setShowAdvancedFeatures(true)
    }, 2000)
    // Stage 3: 3秒后显示左右菜单
    const stage3 = setTimeout(() => setLoadingStage(3), 3000)
    
    return () => {
      clearTimeout(stage1)
      clearTimeout(stage2)
      clearTimeout(stage3)
    }
  }, [])
  
  const [onlineAgents, setOnlineAgents] = useState<string[]>(['market', 'solution', 'project', 'developer'])
  const [agentStates, setAgentStates] = useState<Record<AgentRole, AgentState>>(() => {
    const initial: Record<string, AgentState> = {}
    Object.keys(AGENTS_DATA).forEach(role => {
      initial[role] = {
        status: AGENTS_DATA[role as AgentRole].status,
        currentTask: AGENTS_DATA[role as AgentRole].currentTask,
        lastActive: new Date().toISOString()
      }
    })
    return initial as Record<AgentRole, AgentState>
  })

  // 监听角色点击
  const handleAgentClick = useCallback((role: AgentRole) => {
    setSelectedRole(role)
    metaverseDataService.triggerInteraction(role, 'click')
  }, [])

  // 关闭弹窗
  const handleCloseModal = useCallback(() => {
    setSelectedRole(null)
  }, [])

  // 切换季节
  const handleSeasonChange = useCallback((newSeason: SeasonType) => {
    setSeason(newSeason)
  }, [])

  // 切换视角模式
  const handleViewModeChange = useCallback((mode: 'orbit' | 'first-person') => {
    setViewMode(mode)
  }, [])

  // 会议室功能已删除
  // const handleEnterMeetingRoom = useCallback((roomId: string | null) => {
  //   setCurrentMeetingRoom(roomId)
  // }, [])

  // 点击部门
  const handleDepartmentClick = useCallback((deptKey: string) => {
    setSelectedDept(deptKey)
  }, [])

  // 关闭部门弹窗
  const handleCloseDeptModal = useCallback(() => {
    setSelectedDept(null)
  }, [])

  return (
    <div className="app">
      {/* 左侧Agent列表 - Stage 3后显示 */}
      <AgentSidebar
        selectedRole={selectedRole}
        onSelectRole={handleAgentClick}
        onlineAgents={onlineAgents}
        visible={loadingStage >= 3}
      />

      {/* 3D场景 */}
      <Canvas
          camera={{ position: [0, 15, 30], fov: 60 }}
          style={{ width: '100vw', height: '100vh', background: '#000000' }}
        >
          {/* 场景背景色 */}
          <color attach="background" args={['#000000']} />
          <EnvironmentController season={season} />
          
          {viewMode === 'orbit' ? (
            <OrbitControls 
              enablePan={true} 
              enableZoom={true} 
              enableRotate={true}
              maxPolarAngle={Math.PI / 2 - 0.1}
              minDistance={10}
              maxDistance={60}
            />
          ) : (
            <FirstPersonController 
              enabled={true}
              // onEnterMeetingRoom={() => handleEnterMeetingRoom('project-sync')}
            />
          )}
          
          {/* 宇宙星空背景 - 大半径确保可见 */}
          <Stars radius={300} depth={200} count={8000} factor={4} saturation={0.8} fade speed={0.3} />
          
          {/* 光照 */}
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 20, 10]} intensity={1} castShadow />
          
          {/* 四合院场景 */}
          <ChineseCourtyard />
          
          {/* 四阶段部门房间 - Stage 1后显示 */}
          {loadingStage >= 1 && <DepartmentRooms onDepartmentClick={handleDepartmentClick} />}

          {/* 办公室装饰 - Stage 1后显示 */}
          {loadingStage >= 1 && <OfficeDecorations />}

          {/* 8个AI Agent - Stage 1后显示 */}
          {loadingStage >= 1 && (Object.keys(AGENTS_DATA) as AgentRole[]).map((role) => (
            <RealisticAgent
              key={role}
              role={role}
              position={AGENT_POSITIONS[role]}
              onClick={() => handleAgentClick(role)}
              isSelected={selectedRole === role}
            />
          ))}

          {/* 协作连线 - Stage 1后显示 */}
          {loadingStage >= 1 && <CollaborationLines />}

          {/* 协作中心 - Stage 1后显示 */}
          {loadingStage >= 1 && <CollaborationHub />}

          {/* AI思维碰撞中心 - Stage 2后显示 */}
          {loadingStage >= 2 && <BrainstormingSpace isActive={true} />}

          {/* 数据看板 - Stage 2后显示 */}
          {loadingStage >= 2 && <Dashboards />}
          
          {/* 部门任务看板 - 暂时禁用测试 */}
          {/* <DepartmentTaskBoards /> */}
          
          {/* 聊天系统 - 暂时禁用 */}
          {/* <AgentChatSystem /> */}
        </Canvas>
      
      {/* UI界面 */}
      <InfoPanel />
      
      <ConnectionIndicator />
      
      <ControlPanel
        selectedRole={selectedRole}
        onSeasonChange={handleSeasonChange}
        currentSeason={season}
      />

      {/* 右侧功能菜单 - Stage 3后显示 */}
      <RightSideMenu
        onViewModeChange={handleViewModeChange}
        onSeasonChange={handleSeasonChange}
        viewMode={viewMode}
        currentSeason={season}
        visible={loadingStage >= 3}
      />
      
      {/* 角色详情弹窗 */}
      {selectedRole && (
        <AgentModal 
          role={selectedRole} 
          onClose={handleCloseModal}
          onlineAgents={onlineAgents}
        />
      )}
      
      {/* 部门信息弹窗 */}
      {selectedDept && (
        <DepartmentModal 
          deptKey={selectedDept}
          onClose={handleCloseDeptModal}
        />
      )}
      
      {/* 交互反馈 - 暂时禁用 */}
      {/* <InteractionFeedback /> */}
    </div>
  )
}

export default App