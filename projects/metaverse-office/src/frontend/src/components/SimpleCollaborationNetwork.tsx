// 简化版协作网络组件 - 使用DOM覆盖层（与管理中枢相同风格）
import { useState, useEffect, useMemo } from 'react'
import { useDeviceDetect } from '../hooks/useDeviceDetect'
import { metaverseDataService } from '../services/metaverseData'

// 骨架屏组件
const NetworkSkeleton = ({ isMobile }: { isMobile: boolean }) => (
  <div style={{ padding: isMobile ? '10px' : '20px' }}>
    {/* 统计卡片骨架 */}
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '12px',
      marginBottom: '20px'
    }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{
          background: 'rgba(255,255,255,0.05)',
          padding: '16px',
          borderRadius: '10px',
          height: '60px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{
            background: 'linear-gradient(90deg, rgba(156,39,176,0.1) 25%, rgba(156,39,176,0.2) 50%, rgba(156,39,176,0.1) 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
            borderRadius: '4px',
            height: '100%'
          }}/>
        </div>
      ))}
    </div>
    {/* 网络图骨架 */}
    <div style={{
      background: 'rgba(255,255,255,0.05)',
      borderRadius: '12px',
      height: isMobile ? '300px' : '400px',
      border: '1px solid rgba(156,39,176,0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        width: isMobile ? '150px' : '200px',
        height: isMobile ? '150px' : '200px',
        borderRadius: '50%',
        border: '4px solid rgba(156,39,176,0.2)',
        borderTop: '4px solid #9C27B0',
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
        
        // 使用 /api/agents 获取数据并生成协作网络
        const response = await fetch(`${apiBase}/api/agents`)
        const result = await response.json()
        
        if (result.success && result.data) {
          const agents = result.data
          
          // 生成协作网络数据
          const nodes = agents.map((a: any) => ({
            id: a.id,
            type: 'agent',
            label: a.name,
            data: { role: a.role, status: a.status }
          }))
          
          // 生成部门间协作边
          const edges: any[] = []
          const roleGroups: Record<string, string[]> = {}
          agents.forEach((a: any) => {
            if (!roleGroups[a.role]) roleGroups[a.role] = []
            roleGroups[a.role].push(a.id)
          })
          
          // 同部门内连接
          Object.values(roleGroups).forEach((group: string[]) => {
            for (let i = 0; i < group.length; i++) {
              for (let j = i + 1; j < group.length; j++) {
                edges.push({
                  id: `${group[i]}-${group[j]}`,
                  source: group[i],
                  target: group[j],
                  weight: 3,
                  collaborationCount: 1
                })
              }
            }
          })
          
          const networkData = {
            nodes,
            edges,
            stats: {
              totalAgents: agents.length,
              totalConnections: edges.length,
              avgConnections: edges.length / agents.length,
              isolatedAgents: 0,
              clusters: Object.keys(roleGroups).length
            }
          }
          
          setData(networkData)
        }
      } catch (e) {
        console.error('Network error:', e)
      } finally {
        setLoading(false)
      }
    }
    
    // 初始加载
    fetchData()
    
    // 每30秒刷新
    const interval = setInterval(fetchData, 30000)
    
    return () => {
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

      {loading && <NetworkSkeleton isMobile={isMobile} />}

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
                🕸️ 协作关系图 ({Math.min(data?.nodes?.length || 0, 20)}/{data?.nodes?.length || 0}个节点, {data?.edges?.length || 0}条连接)
                {data?.nodes?.length > 20 && <span style={{fontSize: '12px', color: '#888', marginLeft: '8px'}}>(显示前20个)</span>}
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
                  
                  {/* Agent节点 - 限制最多显示20个以优化性能 */}
                  {data.nodes.slice(0, 20).map((node: any, index: number) => {
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
