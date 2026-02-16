// 协商对话气泡 - DOM覆盖层版本
import { useState, useEffect, useMemo } from 'react'
import { useDeviceDetect } from '../hooks/useDeviceDetect'
import { metaverseDataService } from '../services/metaverseData'

// 骨架屏组件
const NegotiationSkeleton = ({ isMobile }: { isMobile: boolean }) => (
  <div style={{ padding: isMobile ? '10px' : '20px' }}>
    {/* 协商统计骨架 */}
    <div style={{
      background: 'rgba(255,255,255,0.05)',
      padding: '16px',
      borderRadius: '10px',
      marginBottom: '16px',
      height: '80px',
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
    {/* 对话气泡骨架 */}
    {[1, 2, 3].map(i => (
      <div key={i} style={{
        display: 'flex',
        justifyContent: i % 2 === 0 ? 'flex-start' : 'flex-end',
        marginBottom: '12px'
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          padding: '12px 16px',
          borderRadius: '16px',
          maxWidth: '70%',
          height: '60px',
          width: i % 2 === 0 ? '200px' : '150px',
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
      </div>
    ))}
    <style>{`
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
    `}</style>
  </div>
)

interface SimpleNegotiationProps {
  organizationId?: string
  onClose?: () => void
}

const STANCE_COLORS: Record<string, { color: string; bg: string; icon: string; label: string }> = {
  support: { color: '#4CAF50', bg: 'rgba(76, 175, 80, 0.2)', icon: '✓', label: '支持' },
  challenge: { color: '#F44336', bg: 'rgba(244, 67, 54, 0.2)', icon: '✗', label: '质疑' },
  amend: { color: '#FF9800', bg: 'rgba(255, 152, 0, 0.2)', icon: '±', label: '补充' },
  question: { color: '#2196F3', bg: 'rgba(33, 150, 243, 0.2)', icon: '?', label: '提问' },
  accept: { color: '#4CAF50', bg: 'rgba(76, 175, 80, 0.2)', icon: '✓', label: '接受' },
  reject: { color: '#9E9E9E', bg: 'rgba(158, 158, 158, 0.2)', icon: '✗', label: '拒绝' }
}

export function SimpleNegotiation({ organizationId, onClose }: SimpleNegotiationProps) {
  const [negotiations, setNegotiations] = useState<any[]>([])
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
        const response = await fetch(`${apiBase}/api/metaverse/3d/negotiations?organizationId=${organizationId || 'org-001'}`)
        const result = await response.json()
        if (result.success) {
          setNegotiations(result.data || [])
        }
      } catch (e) {
        console.error('Fetch error:', e)
      } finally {
        setLoading(false)
      }
    }
    
    // 初始加载
    fetchData()
    
    // 连接WebSocket
    metaverseDataService.connect(organizationId)
    
    // 监听协商相关事件
    const handleNegotiationUpdate = (data: any) => {
      console.log('💬 收到协商实时更新:', data)
      // 如果是新的协商数据，添加到列表或刷新
      if (data && (data.type === 'negotiation' || data.type === 'consensus_reached')) {
        fetchData()
      }
    }
    
    metaverseDataService.on('pipeline:event', handleNegotiationUpdate)
    
    // 备用：每30秒轮询一次
    const interval = setInterval(fetchData, 30000)
    
    return () => {
      metaverseDataService.off('pipeline:event', handleNegotiationUpdate)
      clearInterval(interval)
    }
  }, [organizationId])

  const roleIcons: Record<string, string> = { marketing: '🎯', solution: '💡', developer: '💻', devops: '🚀', project: '📊', finance: '💰', assistant: '👔' }

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
    minWidth: '450px', maxWidth: '90vw', maxHeight: '85vh',
    overflow: 'auto', border: '2px solid #E91E63',
    boxShadow: '0 0 40px rgba(233, 30, 99, 0.4)', zIndex: 1000
  }

  return (
    <div style={containerStyle} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {isMobile && (
        <div style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', width: '40px', height: '4px', background: 'rgba(255,255,255,0.3)', borderRadius: '2px' }} />
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #E91E63', paddingBottom: '15px' }}>
        <h3 style={{ margin: 0, color: '#E91E63', fontSize: isMobile ? '18px' : '20px' }}>
          💬 协商对话 {isMobile && <span style={{fontSize:'12px',color:'#888'}}>(↓下滑关闭)</span>}
        </h3>
        {onClose && (
          <button onClick={onClose} style={{ padding: isMobile ? '10px 16px' : '8px 20px', background: '#ff4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>关闭</button>
        )}
      </div>

      {loading && <NegotiationSkeleton isMobile={isMobile} />}

      {!loading && negotiations.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '32px', marginBottom: '15px' }}>💬</div>
          <div style={{ color: '#E91E63', fontSize: '18px', marginBottom: '10px' }}>暂无协商记录</div>
          <div style={{ color: '#888', fontSize: '14px' }}>等待Agent发起协商...</div>
        </div>
      )}

      {!loading && negotiations.length > 0 && (
        <>
          {/* 显示数量提示 */}
          {negotiations.length > 30 && (
            <div style={{
              textAlign: 'center',
              padding: '8px',
              background: 'rgba(233, 30, 99, 0.1)',
              borderRadius: '6px',
              marginBottom: '12px',
              fontSize: '12px',
              color: '#888'
            }}>
              显示最近30条 / 共{negotiations.length}条协商记录
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* 限制只显示最近30条协商记录以优化性能 */}
            {negotiations.slice(-30).map((item: any, idx: number) => {
              const style = STANCE_COLORS[item.stance] || STANCE_COLORS.support
              return (
                <div key={item.id} style={{ display: 'flex', gap: '12px', padding: isMobile ? '12px' : '16px', background: style.bg, borderRadius: '12px', border: `1px solid ${style.color}`, position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '-8px', right: '12px', background: style.color, color: '#fff', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>第{item.round}轮</div>
                  <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: style.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>
                    {roleIcons[item.role] || '👤'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 'bold', color: '#fff' }}>{item.agentName}</span>
                      <span style={{ fontSize: '11px', padding: '2px 8px', background: style.color, color: '#fff', borderRadius: '4px' }}>{style.icon} {style.label}</span>
                    </div>
                    <div style={{ color: '#ddd', lineHeight: '1.5', marginBottom: '8px', fontSize: isMobile ? '13px' : '14px' }}>{item.content}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#888' }}>
                      <span>置信度: {Math.round((item.confidence || 0.5) * 100)}%</span>
                      <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(233, 30, 99, 0.3)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#E91E63' }}>{negotiations.length}</div>
              <div style={{ fontSize: '12px', color: '#aaa' }}>总轮次</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4CAF50' }}>
                {negotiations.filter((n: any) => n.stance === 'accept' || n.stance === 'support').length}
              </div>
              <div style={{ fontSize: '12px', color: '#aaa' }}>支持</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#FF9800' }}>
                {Math.round(negotiations.reduce((acc: number, n: any) => acc + (n.confidence || 0), 0) / negotiations.length * 100)}%
              </div>
              <div style={{ fontSize: '12px', color: '#aaa' }}>平均置信度</div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
