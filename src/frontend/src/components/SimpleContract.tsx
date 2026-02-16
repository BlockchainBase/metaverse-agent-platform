// 契约可视化 - DOM覆盖层版本
import { useState, useEffect, useRef, useMemo } from 'react'
import { useDeviceDetect } from '../hooks/useDeviceDetect'

// 骨架屏组件
const ContractSkeleton = ({ isMobile }: { isMobile: boolean }) => (
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
            background: 'linear-gradient(90deg, rgba(33,150,243,0.1) 25%, rgba(33,150,243,0.2) 50%, rgba(33,150,243,0.1) 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
            borderRadius: '4px',
            height: '100%'
          }}/>
        </div>
      ))}
    </div>
    {/* 契约列表骨架 */}
    {[1, 2, 3].map(i => (
      <div key={i} style={{
        background: 'rgba(255,255,255,0.05)',
        padding: '16px',
        borderRadius: '10px',
        marginBottom: '12px',
        height: '100px',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{
          background: 'linear-gradient(90deg, rgba(33,150,243,0.1) 25%, rgba(33,150,243,0.2) 50%, rgba(33,150,243,0.1) 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          borderRadius: '4px',
          height: '100%'
        }}/>
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

interface SimpleContractProps {
  organizationId?: string
  onClose?: () => void
}

const STATUS_COLORS: Record<string, { color: string; bg: string; label: string }> = {
  negotiating: { color: '#FF9800', bg: 'rgba(255, 152, 0, 0.2)', label: '协商中' },
  consensus: { color: '#4CAF50', bg: 'rgba(76, 175, 80, 0.2)', label: '已共识' },
  executing: { color: '#2196F3', bg: 'rgba(33, 150, 243, 0.2)', label: '执行中' },
  completed: { color: '#9E9E9E', bg: 'rgba(158, 158, 158, 0.2)', label: '已完成' },
  intervention: { color: '#F44336', bg: 'rgba(244, 67, 54, 0.2)', label: '需介入' }
}

export function SimpleContract({ organizationId, onClose }: SimpleContractProps) {
  const [contracts, setContracts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedContract, setSelectedContract] = useState<any>(null)
  const { isMobile } = useDeviceDetect()
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const apiBase = import.meta.env.VITE_API_BASE || ''
        
        // 尝试从协商API获取数据
        const response = await fetch(`${apiBase}/api/metaverse/3d/negotiations?organizationId=${organizationId || 'org-001'}`)
        const result = await response.json()
        
        let contractData = []
        
        if (result.success && result.data && result.data.length > 0) {
          // 将协商记录分组为契约
          const contractMap = new Map()
          result.data.forEach((neg: any) => {
            const contractId = `contract-${neg.agentId || 'general'}`
            if (!contractMap.has(contractId)) {
              contractMap.set(contractId, {
                contractId,
                title: neg.content?.slice(0, 30) || '协作契约',
                status: neg.stance === 'accept' ? 'consensus' : neg.stance === 'reject' ? 'intervention' : 'negotiating',
                participants: [neg.agentName || '未知'],
                negotiation: [neg],
                createdAt: neg.timestamp || Date.now()
              })
            } else {
              const existing = contractMap.get(contractId)
              existing.negotiation.push(neg)
              if (!existing.participants.includes(neg.agentName)) {
                existing.participants.push(neg.agentName)
              }
            }
          })
          contractData = Array.from(contractMap.values())
        }
        
        // 如果没有数据，使用模拟数据
        if (contractData.length === 0) {
          contractData = [
            {
              contractId: 'c1',
              title: '智慧校园系统建设',
              status: 'executing',
              participants: ['周展', '王谋', '张码', '陈运'],
              negotiation: [
                { agentName: '周展', stance: 'support', content: '市场需求明确，建议启动', round: 1 },
                { agentName: '王谋', stance: 'amend', content: '建议增加移动端适配方案', round: 2 },
                { agentName: '张码', stance: 'question', content: '技术架构需要考虑扩展性', round: 3 },
                { agentName: '陈运', stance: 'support', content: '部署方案已准备就绪', round: 4 }
              ],
              createdAt: Date.now() - 7200000
            },
            {
              contractId: 'c2',
              title: '数据中心运维协议',
              status: 'consensus',
              participants: ['陈运', '赵维'],
              negotiation: [
                { agentName: '陈运', stance: 'support', content: '运维流程已优化，可节省20%成本', round: 1 },
                { agentName: '赵维', stance: 'accept', content: '同意方案，立即执行', round: 2 }
              ],
              createdAt: Date.now() - 3600000
            },
            {
              contractId: 'c3',
              title: 'AI教学产品采购',
              status: 'intervention',
              participants: ['赵财', '孙助', '李拓'],
              negotiation: [
                { agentName: '赵财', stance: 'challenge', content: '预算超支风险较高，需要评估', round: 1 },
                { agentName: '孙助', stance: 'amend', content: '建议分批采购，降低风险', round: 2 },
                { agentName: '李拓', stance: 'support', content: '市场前景良好，值得投资', round: 3 }
              ],
              createdAt: Date.now() - 1800000
            },
            {
              contractId: 'c4',
              title: '多Agent协作框架',
              status: 'negotiating',
              participants: ['刘管', '王谋', '张码'],
              negotiation: [
                { agentName: '刘管', stance: 'support', content: '需要建立统一的任务分配机制', round: 1 },
                { agentName: '王谋', stance: 'amend', content: '建议增加优先级动态调整', round: 2 }
              ],
              createdAt: Date.now() - 900000
            }
          ]
        }
        
        setContracts(contractData)
      } catch (e) {
        console.error('Fetch error:', e)
        // 出错时使用模拟数据
        setContracts([
          { contractId: 'c1', title: '智慧校园系统建设', status: 'executing', participants: ['周展', '王谋'], negotiation: [{ agentName: '周展', stance: 'support', content: '市场需求明确', round: 1 }], createdAt: Date.now() - 7200000 },
          { contractId: 'c2', title: '数据中心运维协议', status: 'consensus', participants: ['陈运'], negotiation: [{ agentName: '陈运', stance: 'accept', content: '同意执行', round: 1 }], createdAt: Date.now() - 3600000 }
        ])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [organizationId])

  const containerStyle: React.CSSProperties = {
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
    padding: isMobile ? '50px 16px 16px' : '20px',
    borderRadius: isMobile ? 0 : '16px',
    border: isMobile ? 'none' : '2px solid #00BCD4',
    boxShadow: isMobile ? 'none' : '0 0 40px rgba(0, 188, 212, 0.4)',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column'
  }

  return (
    <div style={containerStyle}>
      {/* 标题栏 - 固定 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        borderBottom: '1px solid #00BCD4',
        paddingBottom: '12px',
        flexShrink: 0
      }}>
        <h3 style={{ margin: 0, color: '#00BCD4', fontSize: isMobile ? '18px' : '20px' }}>
          📋 协作契约
        </h3>
        {onClose && (
          <button onClick={onClose} style={{
            padding: isMobile ? '8px 14px' : '8px 16px',
            background: '#ff4444', color: 'white',
            border: 'none', borderRadius: '6px',
            cursor: 'pointer', fontSize: '14px'
          }}>关闭</button>
        )}
      </div>

      {/* 可滚动内容 */}
      <div ref={contentRef} style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch'
      }}>
        {loading && <ContractSkeleton isMobile={isMobile} />}

        {!loading && contracts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '32px', marginBottom: '15px' }}>📋</div>
            <div style={{ color: '#00BCD4', fontSize: '18px', marginBottom: '10px' }}>
              暂无契约数据
            </div>
            <div style={{ color: '#888', fontSize: '14px' }}>
              等待Agent发起协作...
            </div>
          </div>
        )}

        {!loading && contracts.length > 0 && !selectedContract && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {contracts.map((contract: any) => {
              const style = STATUS_COLORS[contract.status] || STATUS_COLORS.negotiating
              return (
                <div 
                  key={contract.contractId} 
                  onClick={() => setSelectedContract(contract)}
                  style={{
                    padding: isMobile ? '14px' : '16px',
                    background: style.bg,
                    borderRadius: '10px',
                    border: `2px solid ${style.color}`,
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <span style={{ fontWeight: 'bold', color: '#fff', fontSize: isMobile ? '14px' : '15px' }}>
                      {contract.title}
                    </span>
                    <span style={{
                      fontSize: '11px',
                      padding: '3px 8px',
                      background: style.color,
                      color: '#fff',
                      borderRadius: '10px'
                    }}>
                      {style.label}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '6px' }}>
                    👥 参与者: {contract.participants.join(', ')}
                  </div>
                  <div style={{ fontSize: '11px', color: '#666' }}>
                    💬 {contract.negotiation?.length || 0} 轮协商 · {new Date(contract.createdAt).toLocaleString()}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!loading && selectedContract && (
          <div>
            <button onClick={() => setSelectedContract(null)} style={{
              marginBottom: '14px',
              padding: '8px 14px',
              border: 'none',
              borderRadius: '6px',
              background: '#555',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '13px'
            }}>← 返回列表</button>

            {(() => {
              const style = STATUS_COLORS[selectedContract.status] || STATUS_COLORS.negotiating
              return (
                <div style={{
                  padding: '16px',
                  background: style.bg,
                  borderRadius: '10px',
                  border: `2px solid ${style.color}`
                }}>
                  <h4 style={{ margin: '0 0 14px 0', color: style.color, fontSize: '16px' }}>
                    {selectedContract.title}
                  </h4>
                  
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '6px' }}>👥 参与者</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {selectedContract.participants.map((p: string, idx: number) => (
                        <span key={idx} style={{
                          padding: '5px 10px',
                          background: 'rgba(255,255,255,0.1)',
                          borderRadius: '12px',
                          fontSize: '12px'
                        }}>{p}</span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '8px' }}>💬 协商记录</div>
                    {selectedContract.negotiation?.map((neg: any, idx: number) => (
                      <div key={idx} style={{
                        padding: '10px',
                        margin: '6px 0',
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '6px',
                        borderLeft: '3px solid #00BCD4'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 'bold', color: '#fff', fontSize: '13px' }}>{neg.agentName}</span>
                          <span style={{ fontSize: '10px', color: '#888' }}>第{neg.round}轮</span>
                        </div>
                        <div style={{ color: '#ddd', fontSize: '12px' }}>{neg.content}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}
          </div>
        )}
      </div>
    </div>
  )
}
