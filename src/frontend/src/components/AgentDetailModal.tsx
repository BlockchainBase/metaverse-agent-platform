// Agent详情弹窗组件 - 适配后端真实数据
import { useState, useEffect } from 'react'
import { useDeviceDetect } from '../hooks/useDeviceDetect'

interface AgentDetailModalProps {
  agent: any
  onClose: () => void
}

// 角色配置
const ROLE_CONFIG: Record<string, { name: string; icon: string; color: string; description: string }> = {
  marketing: { name: '市场部', icon: '🎯', color: '#FF6B6B', description: '负责市场推广与客户获取' },
  solution: { name: '方案部', icon: '💡', color: '#4ECDC4', description: '负责解决方案设计' },
  developer: { name: '研发部', icon: '💻', color: '#45B7D1', description: '负责产品开发' },
  devops: { name: '运维部', icon: '🚀', color: '#96CEB4', description: '负责部署运维' },
  project: { name: '项目部', icon: '📊', color: '#FFEAA7', description: '负责项目管理' },
  finance: { name: '财务部', icon: '💰', color: '#DDA0DD', description: '负责财务预算' },
  assistant: { name: '助理', icon: '👔', color: '#F8C291', description: '行政助理' }
}

// 状态配置
const STATUS_CONFIG: Record<string, { label: string; icon: string; color: string; bgColor: string }> = {
  working: { label: '工作中', icon: '🔥', color: '#FF6B6B', bgColor: 'rgba(255, 107, 107, 0.2)' },
  idle: { label: '待机中', icon: '⚡', color: '#4CAF50', bgColor: 'rgba(76, 175, 80, 0.2)' },
  meeting: { label: '会议中', icon: '👥', color: '#2196F3', bgColor: 'rgba(33, 150, 243, 0.2)' },
  busy: { label: '忙碌', icon: '⏰', color: '#FF9800', bgColor: 'rgba(255, 152, 0, 0.2)' },
  offline: { label: '离线', icon: '💤', color: '#9E9E9E', bgColor: 'rgba(158, 158, 158, 0.2)' }
}

export function AgentDetailModal({ agent, onClose }: AgentDetailModalProps) {
  const { isMobile } = useDeviceDetect()
  const [agentDetails, setAgentDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // 获取更详细的Agent信息
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true)
        // 从后端获取该Agent的详细任务信息
        const apiBase = import.meta.env.VITE_API_BASE || ''
        
        // 获取任务数据
        const tasksRes = await fetch(`${apiBase}/api/metaverse/3d/tasks/flow/stream`)
        const tasksData = await tasksRes.json()
        
        // 筛选该Agent的任务
        let agentTasks: any[] = []
        if (tasksData.success && tasksData.data.nodes) {
          agentTasks = tasksData.data.nodes
            .filter((n: any) => n.data?.assignee === agent.id)
            .map((n: any) => ({
              id: n.id,
              title: n.data.title,
              status: n.data.status,
              priority: n.data.priority,
              progress: n.data.progress
            }))
        }

        // 组合完整数据
        setAgentDetails({
          ...agent,
          currentTasks: agentTasks.filter((t: any) => t.status === 'assigned' || t.status === 'in_progress'),
          completedTasks: agentTasks.filter((t: any) => t.status === 'completed'),
          totalTasks: agentTasks.length
        })
      } catch (e) {
        console.error('获取Agent详情失败:', e)
        setAgentDetails(agent)
      } finally {
        setLoading(false)
      }
    }

    if (agent) {
      fetchDetails()
    }
  }, [agent])

  const roleConfig = ROLE_CONFIG[agent.role] || { 
    name: '未知角色', icon: '❓', color: '#888', description: '' 
  }
  const statusConfig = STATUS_CONFIG[agent.status] || STATUS_CONFIG.offline

  // 计算统计数据
  const completedCount = agentDetails?.completedTasks?.length || agent?.metrics?.completedTasks || 0
  const currentCount = agentDetails?.currentTasks?.length || 0
  const totalCount = agentDetails?.totalTasks || completedCount
  const efficiency = agent?.efficiency || 100

  return (
    <div 
      style={{
        position: 'fixed',
        top: isMobile ? 0 : '50%',
        left: isMobile ? 0 : '50%',
        right: isMobile ? 0 : 'auto',
        bottom: isMobile ? 0 : 'auto',
        transform: isMobile ? 'none' : 'translate(-50%, -50%)',
        width: isMobile ? '100%' : '90vw',
        maxWidth: isMobile ? '100%' : '480px',
        height: isMobile ? '100%' : 'auto',
        maxHeight: isMobile ? '100%' : '85vh',
        background: 'rgba(20, 20, 40, 0.98)',
        color: '#fff',
        borderRadius: isMobile ? 0 : '16px',
        border: isMobile ? 'none' : `2px solid ${roleConfig.color}`,
        boxShadow: isMobile ? 'none' : `0 0 40px ${roleConfig.color}40`,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
      onClick={onClose}
    >
      {/* 头部 - 固定 */}
      <div 
        style={{
          background: roleConfig.color,
          padding: isMobile ? '20px 16px' : '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexShrink: 0
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ fontSize: isMobile ? '48px' : '56px' }}>{roleConfig.icon}</div>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: isMobile ? '22px' : '26px', fontWeight: 'bold' }}>
            {agent.name}
          </h2>
          <p style={{ margin: '4px 0 0 0', opacity: 0.9, fontSize: '14px' }}>
            {roleConfig.name} | ID: {agent.id}
          </p>
        </div>
        <div 
          style={{
            background: 'rgba(255,255,255,0.9)',
            color: statusConfig.color,
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          {statusConfig.icon} {statusConfig.label}
        </div>
      </div>

      {/* 关闭按钮 */}
      <button 
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          border: 'none',
          background: 'rgba(0,0,0,0.3)',
          color: '#fff',
          fontSize: '24px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10
        }}
      >
        ×
      </button>

      {/* 可滚动内容 */}
      <div 
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: isMobile ? '16px' : '20px'
        }}
        onClick={e => e.stopPropagation()}
      >
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>
            <div style={{ fontSize: '28px', marginBottom: '10px' }}>⏳</div>
            <div>加载中...</div>
          </div>
        )}

        {!loading && (
          <>
            {/* 角色描述 */}
            <div style={{ 
              padding: '14px', 
              background: 'rgba(255,255,255,0.05)', 
              borderRadius: '10px',
              marginBottom: '16px',
              borderLeft: `4px solid ${roleConfig.color}`
            }}>
              <div style={{ color: '#aaa', fontSize: '13px', marginBottom: '4px' }}>角色职责</div>
              <div style={{ color: '#fff', fontSize: '14px' }}>{roleConfig.description}</div>
            </div>

            {/* 统计卡片 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
              <div style={{ 
                background: 'rgba(76, 175, 80, 0.15)', 
                padding: '14px', 
                borderRadius: '10px',
                textAlign: 'center',
                border: '1px solid rgba(76, 175, 80, 0.3)'
              }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4CAF50' }}>{completedCount}</div>
                <div style={{ fontSize: '11px', color: '#aaa', marginTop: '4px' }}>已完成</div>
              </div>
              <div style={{ 
                background: 'rgba(255, 152, 0, 0.15)', 
                padding: '14px', 
                borderRadius: '10px',
                textAlign: 'center',
                border: '1px solid rgba(255, 152, 0, 0.3)'
              }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#FF9800' }}>{currentCount}</div>
                <div style={{ fontSize: '11px', color: '#aaa', marginTop: '4px' }}>进行中</div>
              </div>
              <div style={{ 
                background: 'rgba(33, 150, 243, 0.15)', 
                padding: '14px', 
                borderRadius: '10px',
                textAlign: 'center',
                border: '1px solid rgba(33, 150, 243, 0.3)'
              }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2196F3' }}>{typeof efficiency === 'number' ? efficiency.toFixed(1) : efficiency}%</div>
                <div style={{ fontSize: '11px', color: '#aaa', marginTop: '4px' }}>效率</div>
              </div>
            </div>

            {/* 当前任务 */}
            {currentCount > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🎯 当前任务 ({currentCount})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {agentDetails?.currentTasks?.map((task: any) => (
                    <div 
                      key={task.id} 
                      style={{ 
                        padding: '12px', 
                        background: 'rgba(255,152,0,0.1)', 
                        borderRadius: '8px',
                        border: '1px solid rgba(255,152,0,0.3)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{task.title}</span>
                        <span style={{ 
                          fontSize: '11px', 
                          padding: '3px 8px', 
                          background: task.priority === 'urgent' ? '#F44336' : task.priority === 'high' ? '#FF9800' : '#2196F3',
                          borderRadius: '4px',
                          color: '#fff'
                        }}>
                          {task.priority}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${task.progress || 0}%`, height: '100%', background: '#FF9800', borderRadius: '3px' }} />
                        </div>
                        <span style={{ fontSize: '12px', color: '#aaa' }}>{task.progress || 0}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 位置信息 */}
            <div style={{ 
              padding: '14px', 
              background: 'rgba(255,255,255,0.05)', 
              borderRadius: '10px',
              marginBottom: '16px'
            }}>
              <div style={{ color: '#aaa', fontSize: '13px', marginBottom: '8px' }}>📍 位置信息</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', fontSize: '13px' }}>
                <div style={{ textAlign: 'center', padding: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
                  <div style={{ color: '#888', fontSize: '11px' }}>X</div>
                  <div style={{ color: '#fff', fontWeight: 'bold' }}>{agent.position?.x?.toFixed(1) || 0}</div>
                </div>
                <div style={{ textAlign: 'center', padding: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
                  <div style={{ color: '#888', fontSize: '11px' }}>Y</div>
                  <div style={{ color: '#fff', fontWeight: 'bold' }}>{agent.position?.y?.toFixed(1) || 0}</div>
                </div>
                <div style={{ textAlign: 'center', padding: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
                  <div style={{ color: '#888', fontSize: '11px' }}>Z</div>
                  <div style={{ color: '#fff', fontWeight: 'bold' }}>{agent.position?.z?.toFixed(1) || 0}</div>
                </div>
              </div>
            </div>

            {/* 备注 */}
            <div style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
              <div style={{ color: '#666', fontSize: '12px', textAlign: 'center' }}>
                💡 点击空白处关闭详情窗口
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
