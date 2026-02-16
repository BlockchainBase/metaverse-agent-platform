// 任务委托链可视化 - DOM覆盖层版本
import { useState, useEffect, useMemo } from 'react'
import { useDeviceDetect } from '../hooks/useDeviceDetect'

// 骨架屏组件
const DelegationSkeleton = ({ isMobile }: { isMobile: boolean }) => (
  <div style={{ padding: isMobile ? '10px' : '20px' }}>
    {/* 统计卡片骨架 */}
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '12px',
      marginBottom: '20px'
    }}>
      {[1, 2, 3, 4].map(i => (
        <div key={i} style={{
          background: 'rgba(255,255,255,0.05)',
          padding: '12px',
          borderRadius: '10px',
          height: '50px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{
            background: 'linear-gradient(90deg, rgba(255,152,0,0.1) 25%, rgba(255,152,0,0.2) 50%, rgba(255,152,0,0.1) 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
            borderRadius: '4px',
            height: '100%'
          }}/>
        </div>
      ))}
    </div>
    {/* 委托流程骨架 */}
    <div style={{
      background: 'rgba(255,255,255,0.05)',
      borderRadius: '12px',
      height: isMobile ? '250px' : '350px',
      border: '1px solid rgba(255,152,0,0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        border: '4px solid rgba(255,152,0,0.2)',
        borderTop: '4px solid #FF9800',
        animation: 'spin 1s linear infinite'
      }}/>
    </div>
    <style>{`
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
)

interface SimpleTaskDelegationProps {
  organizationId?: string
  onClose?: () => void
}

export function SimpleTaskDelegation({ organizationId, onClose }: SimpleTaskDelegationProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { isMobile } = useDeviceDetect()
  const [touchStart, setTouchStart] = useState<number | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientY)
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return
    if (e.changedTouches[0].clientY - touchStart > 100) onClose?.()
    setTouchStart(null)
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const apiBase = import.meta.env.VITE_API_BASE || ''
        
        // 使用 /api/agents 获取数据并生成委托链
        const response = await fetch(`${apiBase}/api/agents`)
        const result = await response.json()
        
        if (result.success && result.data) {
          const agents = result.data.filter((a: any) => a.currentTask)
          
          // 生成模拟委托链数据
          const mockDelegations = [
            { id: 'd1', taskTitle: '智慧校园系统交付', fromAgentId: 'P1', fromAgentName: '刘管', toAgentId: 'S1', toAgentName: '王谋', status: 'accepted' },
            { id: 'd2', taskTitle: '技术方案选型', fromAgentId: 'S1', fromAgentName: '王谋', toAgentId: 'D1', toAgentName: '张码', status: 'flying' },
            { id: 'd3', taskTitle: '数据库设计', fromAgentId: 'D1', fromAgentName: '张码', toAgentId: 'D2', toAgentName: '刘栈', status: 'accepted' },
            { id: 'd4', taskTitle: '系统部署', fromAgentId: 'D2', fromAgentName: '刘栈', toAgentId: 'O1', toAgentName: '陈运', status: 'flying' },
            { id: 'd5', taskTitle: '运维监控', fromAgentId: 'O1', fromAgentName: '陈运', toAgentId: 'O2', toAgentName: '赵维', status: 'accepted' }
          ]
          
          const nodes = mockDelegations.map((d: any, idx: number) => ({
            id: d.id, type: 'task', label: d.taskTitle,
            data: { title: d.taskTitle, status: d.status, assignee: d.toAgentName },
            position: { x: (idx % 5) * 3 - 6, y: Math.floor(idx / 5) * 2 + 2, z: 0 }
          }))
          
          const edges = mockDelegations.map((d: any, idx: number) => ({
            id: 'e' + idx, source: d.id, target: 'agent-' + idx, type: 'assignment', animated: d.status === 'flying'
          }))
          
          setData({ 
            nodes, 
            edges, 
            stats: { 
              total: mockDelegations.length, 
              completed: mockDelegations.filter((d: any) => d.status === 'accepted').length, 
              inProgress: mockDelegations.filter((d: any) => d.status === 'flying').length, 
              pending: 0 
            }
          })
        }
      } catch (e) {
        console.error('Fetch error:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
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
    minWidth: '400px', maxWidth: '90vw', maxHeight: '85vh',
    overflow: 'auto', border: '2px solid #FF9800',
    boxShadow: '0 0 40px rgba(255, 152, 0, 0.4)', zIndex: 1000
  }

  return (
    <div style={containerStyle} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {isMobile && (
        <div style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', width: '40px', height: '4px', background: 'rgba(255,255,255,0.3)', borderRadius: '2px' }} />
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #FF9800', paddingBottom: '15px' }}>
        <h3 style={{ margin: 0, color: '#FF9800', fontSize: isMobile ? '18px' : '20px' }}>
          📋 任务委托链 {isMobile && <span style={{fontSize:'12px',color:'#888'}}>(↓下滑关闭)</span>}
        </h3>
        {onClose && (
          <button onClick={onClose} style={{ padding: isMobile ? '10px 16px' : '8px 20px', background: '#ff4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>关闭</button>
        )}
      </div>

      {loading && <DelegationSkeleton isMobile={isMobile} />}

      {!loading && (!data || data.nodes.length === 0) && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '32px', marginBottom: '15px' }}>📋</div>
          <div style={{ color: '#FF9800', fontSize: '18px', marginBottom: '10px' }}>暂无委托数据</div>
          <div style={{ color: '#888', fontSize: '14px' }}>等待任务分配...</div>
        </div>
      )}

      {!loading && data && data.edges && data.edges.length > 0 && (
        <>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: isMobile ? '12px' : '16px', marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#aaa', fontSize: '14px' }}>🔄 任务分配流向 ({data.edges.length} 条)</h4>
            {data.edges.map((edge: any, idx: number) => {
              const sourceNode = data.nodes.find((n: any) => n.id === edge.source)
              const targetNode = data.nodes.find((n: any) => n.id === edge.target)
              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: isMobile ? '10px' : '12px', margin: '8px 0', background: 'rgba(255, 152, 0, 0.1)', borderRadius: '8px', border: '1px solid rgba(255, 152, 0, 0.3)' }}>
                  <div style={{ background: '#FF9800', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {sourceNode?.data?.title || '任务'}
                  </div>
                  <div style={{ color: '#FF9800', fontSize: '20px' }}>→</div>
                  <div style={{ background: '#4CAF50', padding: '8px 12px', borderRadius: '6px', fontSize: '12px' }}>
                    👤 {targetNode?.data?.assignee || edge.target}
                  </div>
                  <span style={{ marginLeft: 'auto', fontSize: '11px', padding: '4px 8px', background: edge.animated ? 'rgba(76, 175, 80, 0.3)' : 'rgba(158, 158, 158, 0.3)', color: edge.animated ? '#4CAF50' : '#9E9E9E', borderRadius: '4px' }}>
                    {edge.animated ? '进行中' : '已分配'}
                  </span>
                </div>
              )
            })}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            <div style={{ background: 'rgba(255, 152, 0, 0.2)', padding: isMobile ? '12px' : '16px', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(255, 152, 0, 0.5)' }}>
              <div style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: 'bold', color: '#FF9800' }}>{data.edges.length}</div>
              <div style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>委托链</div>
            </div>
            <div style={{ background: 'rgba(76, 175, 80, 0.2)', padding: isMobile ? '12px' : '16px', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(76, 175, 80, 0.5)' }}>
              <div style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: 'bold', color: '#4CAF50' }}>{data.edges.filter((e: any) => e.animated).length}</div>
              <div style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>进行中</div>
            </div>
            <div style={{ background: 'rgba(33, 150, 243, 0.2)', padding: isMobile ? '12px' : '16px', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(33, 150, 243, 0.5)' }}>
              <div style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: 'bold', color: '#2196F3' }}>{data.stats.total}</div>
              <div style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>总任务</div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
