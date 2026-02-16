// 简化版协作网络组件 - 使用DOM覆盖层（与管理中枢相同风格）
import { useState, useEffect } from 'react'
import { useDeviceDetect } from '../hooks/useDeviceDetect'
import { metaverseDataService } from '../services/metaverseData'

interface SimpleCollaborationNetworkProps {
  organizationId?: string
  onClose?: () => void
}

export function SimpleCollaborationNetwork({ organizationId, onClose }: SimpleCollaborationNetworkProps) {
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
        const response = await fetch(`${apiBase}/api/metaverse/3d/collaboration/network/v2?organizationId=${organizationId || 'org-001'}`)
        const result = await response.json()
        if (result.success) setData(result.data)
      } catch (e) {
        console.error('Network error:', e)
      } finally {
        setLoading(false)
      }
    }
    
    // 初始加载
    fetchData()
    
    // 连接WebSocket并订阅协作网络更新
    metaverseDataService.connect(organizationId)
    metaverseDataService.subscribeCollaborationNetwork()
    
    // 监听实时更新
    const handleNetworkUpdate = (newData: any) => {
      console.log('🕸️ 收到协作网络实时更新:', newData)
      if (newData && newData.nodes) {
        setData(newData)
      } else if (newData && newData.data) {
        setData(newData.data)
      }
    }
    
    metaverseDataService.on('network:collaboration:update', handleNetworkUpdate)
    
    // 备用：每30秒轮询一次
    const interval = setInterval(fetchData, 30000)
    
    return () => {
      metaverseDataService.off('network:collaboration:update', handleNetworkUpdate)
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
    minWidth: '400px', maxWidth: '90vw', maxHeight: '85vh',
    overflow: 'auto', border: '2px solid #9C27B0',
    boxShadow: '0 0 40px rgba(156, 39, 176, 0.4)', zIndex: 1000
  }

  return (
    <div style={containerStyle} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {isMobile && (
        <div style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', width: '40px', height: '4px', background: 'rgba(255,255,255,0.3)', borderRadius: '2px' }} />
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #9C27B0', paddingBottom: '15px' }}>
        <h3 style={{ margin: 0, color: '#E040FB', fontSize: isMobile ? '18px' : '20px' }}>
          🕸️ 协作网络 {isMobile && <span style={{fontSize:'12px',color:'#888'}}>(↓下滑关闭)</span>}
        </h3>
        {onClose && (
          <button onClick={onClose} style={{ padding: isMobile ? '10px 16px' : '8px 20px', background: '#ff4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>关闭</button>
        )}
      </div>

      {loading && <div style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}><div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div><div>加载协作网络数据...</div></div>}

      {!loading && data && (
        <>
          {/* 协作网络关系图 */}
          {data?.nodes?.length > 0 && (
            <div style={{ 
              background: 'rgba(255,255,255,0.05)', 
              borderRadius: '10px', 
              padding: isMobile ? '12px' : '16px',
              marginBottom: '20px',
              minHeight: '200px'
            }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#E040FB', fontSize: '14px' }}>
                🕸️ 协作关系图 ({data?.edges?.length || 0}条连接)
              </h4>
              
              {/* SVG网络图 */}
              <div style={{ position: 'relative', width: '100%', height: isMobile ? '250px' : '300px' }}>
                <svg width="100%" height="100%" viewBox="0 0 400 300" style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                  {/* 协作连线 */}
                  {data.edges?.map((edge: any, index: number) => {
                    const sourceNode = data.nodes.find((n: any) => n.id === edge.source)
                    const targetNode = data.nodes.find((n: any) => n.id === edge.target)
                    if (!sourceNode || !targetNode) return null
                    
                    // 简单的圆形布局计算
                    const angleStep = (2 * Math.PI) / data.nodes.length
                    const radius = 100
                    const centerX = 200
                    const centerY = 150
                    
                    const sourceIndex = data.nodes.findIndex((n: any) => n.id === edge.source)
                    const targetIndex = data.nodes.findIndex((n: any) => n.id === edge.target)
                    
                    const x1 = centerX + radius * Math.cos(sourceIndex * angleStep - Math.PI / 2)
                    const y1 = centerY + radius * Math.sin(sourceIndex * angleStep - Math.PI / 2)
                    const x2 = centerX + radius * Math.cos(targetIndex * angleStep - Math.PI / 2)
                    const y2 = centerY + radius * Math.sin(targetIndex * angleStep - Math.PI / 2)
                    
                    const strokeWidth = Math.min(6, Math.max(1, (edge.weight || 1) / 10))
                    
                    return (
                      <g key={`edge-${index}`}>
                        <line
                          x1={x1} y1={y1} x2={x2} y2={y2}
                          stroke="#E040FB"
                          strokeWidth={strokeWidth}
                          opacity={0.6}
                        />
                        {/* 协作次数标签 */}
                        <text
                          x={(x1 + x2) / 2}
                          y={(y1 + y2) / 2}
                          fill="#fff"
                          fontSize="10"
                          textAnchor="middle"
                          style={{ background: 'rgba(0,0,0,0.5)' }}
                        >
                          {edge.collaborationCount || 1}次
                        </text>
                      </g>
                    )
                  })}
                  
                  {/* Agent节点 */}
                  {data.nodes.map((node: any, index: number) => {
                    const angleStep = (2 * Math.PI) / data.nodes.length
                    const radius = 100
                    const centerX = 200
                    const centerY = 150
                    
                    const x = centerX + radius * Math.cos(index * angleStep - Math.PI / 2)
                    const y = centerY + radius * Math.sin(index * angleStep - Math.PI / 2)
                    
                    // 根据类型着色
                    const colors: Record<string, string> = {
                      marketing: '#E91E63',
                      solution: '#9C27B0',
                      developer: '#2196F3',
                      devops: '#00BCD4',
                      project: '#FF9800',
                      finance: '#4CAF50',
                      assistant: '#F44336'
                    }
                    const color = colors[node.type] || '#9E9E9E'
                    
                    return (
                      <g key={`node-${node.id}`}>
                        <circle
                          cx={x} cy={y} r={20}
                          fill={color}
                          stroke="#fff"
                          strokeWidth={2}
                        />
                        <text
                          x={x} y={y + 5}
                          fill="#fff"
                          fontSize="16"
                          textAnchor="middle"
                        >
                          {node.data?.avatar || '👤'}
                        </text>
                        <text
                          x={x} y={y + 35}
                          fill="#aaa"
                          fontSize="10"
                          textAnchor="middle"
                        >
                          {node.label}
                        </text>
                      </g>
                    )
                  })}
                </svg>
              </div>
              
              {/* 图例 */}
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '8px', 
                marginTop: '12px',
                fontSize: '11px',
                color: '#aaa'
              }}>
                <span style={{ color: '#E91E63' }}>● 市场部</span>
                <span style={{ color: '#9C27B0' }}>● 方案部</span>
                <span style={{ color: '#2196F3' }}>● 交付部</span>
                <span style={{ color: '#FF9800' }}>● 管理中心</span>
                <span style={{ color: '#E040FB', marginLeft: 'auto' }}>━ 协作连线(粗细=频率)</span>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '20px' }}>
            <div style={{ background: 'rgba(156, 39, 176, 0.2)', padding: isMobile ? '12px' : '16px', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(156, 39, 176, 0.5)' }}>
              <div style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: 'bold', color: '#E040FB' }}>{data?.stats?.totalAgents || 0}</div>
              <div style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>总人数</div>
            </div>
            <div style={{ background: 'rgba(33, 150, 243, 0.2)', padding: isMobile ? '12px' : '16px', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(33, 150, 243, 0.5)' }}>
              <div style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: 'bold', color: '#2196F3' }}>{data?.stats?.totalConnections || 0}</div>
              <div style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>连接数</div>
            </div>
            <div style={{ background: 'rgba(255, 152, 0, 0.2)', padding: isMobile ? '12px' : '16px', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(255, 152, 0, 0.5)' }}>
              <div style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: 'bold', color: '#FF9800' }}>{data?.stats?.isolatedAgents || 0}</div>
              <div style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>孤立节点</div>
            </div>
            <div style={{ background: 'rgba(76, 175, 80, 0.2)', padding: isMobile ? '12px' : '16px', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(76, 175, 80, 0.5)' }}>
              <div style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: 'bold', color: '#4CAF50' }}>{data?.stats?.clusters || 0}</div>
              <div style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>协作簇</div>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: isMobile ? '12px' : '16px' }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#aaa', fontSize: '14px' }}>👥 Agent协作详情</h4>
            {data?.edges?.length > 0 ? (
              data.edges.map((edge: any, index: number) => {
                const sourceNode = data.nodes.find((n: any) => n.id === edge.source)
                const targetNode = data.nodes.find((n: any) => n.id === edge.target)
                return (
                  <div key={`collab-${index}`} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px', 
                    padding: isMobile ? '10px' : '12px', 
                    margin: '8px 0', 
                    background: 'rgba(156, 39, 176, 0.1)', 
                    borderRadius: '8px', 
                    border: '1px solid rgba(156, 39, 176, 0.3)'
                  }}>
                    <span style={{ fontSize: '20px' }}>🤝</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', color: '#fff', fontSize: isMobile ? '13px' : '14px' }}>
                        {sourceNode?.label} ↔ {targetNode?.label}
                      </div>
                      <div style={{ fontSize: '11px', color: '#aaa', marginTop: '4px' }}>
                        协作 {edge.collaborationCount || 1} 次 | 类型: {edge.types?.join(', ') || '通用协作'}
                      </div>
                    </div>
                    <div style={{
                      background: 'rgba(224, 64, 251, 0.3)',
                      color: '#E040FB',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {edge.weight || 1}
                    </div>
                  </div>
                )
              })
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>🕸️</div>
                <div style={{ color: '#E040FB', fontSize: '16px', marginBottom: '8px' }}>暂无协作数据</div>
                <div style={{ fontSize: '13px' }}>Agent正在初始化协作网络...</div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
