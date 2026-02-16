// 决策中心 - DOM覆盖层版本
import { useState, useEffect, useRef } from 'react'
import { useDeviceDetect } from '../hooks/useDeviceDetect'

interface SimpleDecisionProps {
  organizationId?: string
  onClose?: () => void
}

export function SimpleDecision({ organizationId, onClose }: SimpleDecisionProps) {
  const [interventions, setInterventions] = useState<any[]>([])
  const [contracts, setContracts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [rationale, setRationale] = useState('')
  const { isMobile } = useDeviceDetect()
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const apiBase = import.meta.env.VITE_API_BASE || ''
        const response = await fetch(`${apiBase}/api/metaverse/3d/interventions?organizationId=${organizationId || 'org-001'}`)
        const result = await response.json()
        if (result.success && result.data.length > 0) {
          setInterventions(result.data)
        } else {
          setInterventions([{
            requestId: 'req-001',
            contractId: 'c1',
            agentId: 'A1',
            agentName: '孙助',
            role: 'assistant',
            type: 'budget_overrun',
            severity: 'high',
            decisionInterface: {
              question: '项目预算超支风险评估',
              context: '智慧校园系统开发预算可能超支30%',
              deadline: '2026-02-16T18:00:00Z'
            },
            agentAnalysis: {
              recommendation: '建议选择平衡策略',
              confidence: 0.72,
              keyUncertainties: ['市场需求变化', '技术复杂度']
            },
            options: [
              { id: 'opt-a', description: '保守策略', risks: ['收益较低'], supportingAgents: ['F1'], opposingAgents: ['M2'] },
              { id: 'opt-b', description: '激进策略', risks: ['高风险'], supportingAgents: ['M2'], opposingAgents: ['F1', 'P1'] },
              { id: 'opt-c', description: '平衡策略', risks: ['中等风险'], supportingAgents: ['S1', 'D1'], opposingAgents: [] }
            ],
            timestamp: Date.now() - 3600000,
            status: 'pending'
          }])
        }
        setContracts([
          { contractId: 'c1', status: 'pending_human', context: { description: '智慧校园系统预算审批' } },
          { contractId: 'c2', status: 'active', context: { description: '数据中心运维协议' } },
          { contractId: 'c3', status: 'completed', context: { description: 'AI教学产品采购' } }
        ])
      } catch (e) {
        console.error('Fetch error:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [organizationId])

  const handleSubmitDecision = () => {
    if (!selectedOption || !selectedRequest) return
    console.log('决策提交:', selectedRequest.requestId, { option: selectedOption, rationale })
    setSelectedRequest(null)
    setSelectedOption(null)
    setRationale('')
    alert('决策已提交！')
  }

  const activeCount = contracts.filter((c: any) => c.status === 'active').length
  const completedCount = contracts.filter((c: any) => c.status === 'completed').length
  const pendingCount = interventions.filter((i: any) => i.status === 'pending').length

  return (
    <div style={{
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
      border: isMobile ? 'none' : '2px solid #F44336',
      boxShadow: isMobile ? 'none' : '0 0 40px rgba(244, 67, 54, 0.4)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* 标题栏 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        borderBottom: '1px solid #F44336',
        paddingBottom: '12px',
        flexShrink: 0
      }}>
        <h3 style={{ margin: 0, color: '#F44336', fontSize: isMobile ? '18px' : '20px' }}>
          ⚠️ 决策中心
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
        {loading && <div style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}><div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div><div>加载决策数据...</div></div>}

        {!loading && !selectedRequest && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
              <div style={{ background: pendingCount > 0 ? 'rgba(244, 67, 54, 0.2)' : 'rgba(76, 175, 80, 0.2)', padding: '14px', borderRadius: '10px', textAlign: 'center', border: `2px solid ${pendingCount > 0 ? '#F44336' : '#4CAF50'}` }}>
                <div style={{ fontSize: '26px', fontWeight: 'bold', color: pendingCount > 0 ? '#F44336' : '#4CAF50' }}>{pendingCount}</div>
                <div style={{ fontSize: '12px', color: '#aaa' }}>待决策</div>
              </div>
              <div style={{ background: 'rgba(33, 150, 243, 0.2)', padding: '14px', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(33, 150, 243, 0.5)' }}>
                <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#2196F3' }}>{activeCount}</div>
                <div style={{ fontSize: '12px', color: '#aaa' }}>进行中</div>
              </div>
              <div style={{ background: 'rgba(76, 175, 80, 0.2)', padding: '14px', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(76, 175, 80, 0.5)' }}>
                <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#4CAF50' }}>{completedCount}</div>
                <div style={{ fontSize: '12px', color: '#aaa' }}>已完成</div>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#aaa', fontSize: '13px' }}>🚨 待决策事项 ({interventions.length})</h4>
              {interventions.length === 0 && <div style={{ textAlign: 'center', padding: '30px', color: '#666' }}><div style={{ fontSize: '28px', marginBottom: '8px' }}>✅</div><div>暂无待决策事项</div></div>}
              {interventions.map((req: any) => (
                <div key={req.requestId} onClick={() => setSelectedRequest(req)} style={{ padding: '14px', margin: '8px 0', background: 'rgba(244, 67, 54, 0.1)', borderRadius: '10px', border: '1px solid rgba(244, 67, 54, 0.3)', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 'bold', color: '#fff', fontSize: '13px' }}>⚠️ {req.decisionInterface.question}</span>
                    <span style={{ fontSize: '10px', padding: '3px 6px', background: '#F44336', color: '#fff', borderRadius: '4px' }}>{req.severity === 'high' ? '高优先级' : '普通'}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '6px' }}>{req.decisionInterface.context}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#888' }}>
                    <span>请求人: {req.agentName}</span>
                    <span>{new Date(req.decisionInterface.deadline).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <h4 style={{ margin: '0 0 10px 0', color: '#aaa', fontSize: '13px' }}>📋 契约列表 ({contracts.length})</h4>
              {contracts.map((c: any) => (
                <div key={c.contractId} style={{ padding: '10px 14px', margin: '5px 0', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px' }}>{c.context.description}</span>
                  <span style={{ fontSize: '10px', padding: '3px 8px', background: c.status === 'completed' ? 'rgba(76, 175, 80, 0.3)' : c.status === 'active' ? 'rgba(33, 150, 243, 0.3)' : 'rgba(244, 67, 54, 0.3)', color: c.status === 'completed' ? '#4CAF50' : c.status === 'active' ? '#2196F3' : '#F44336', borderRadius: '4px' }}>
                    {c.status === 'completed' ? '已完成' : c.status === 'active' ? '进行中' : '待审批'}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {!loading && selectedRequest && (
          <div>
            <button onClick={() => setSelectedRequest(null)} style={{ marginBottom: '14px', padding: '8px 14px', border: 'none', borderRadius: '6px', background: '#555', color: '#fff', cursor: 'pointer', fontSize: '13px' }}>← 返回列表</button>

            <div style={{ background: 'rgba(244, 67, 54, 0.1)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(244, 67, 54, 0.3)' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#F44336', fontSize: '15px' }}>⚠️ {selectedRequest.decisionInterface.question}</h4>
              <p style={{ color: '#ddd', marginBottom: '14px', fontSize: '13px' }}>{selectedRequest.decisionInterface.context}</p>

              <div style={{ background: 'rgba(33, 150, 243, 0.1)', padding: '12px', borderRadius: '8px', marginBottom: '14px' }}>
                <div style={{ fontWeight: 'bold', color: '#2196F3', marginBottom: '6px', fontSize: '13px' }}>🤖 Agent分析建议</div>
                <div style={{ color: '#aaa', fontSize: '12px' }}>
                  <div><strong>推荐:</strong> {selectedRequest.agentAnalysis.recommendation}</div>
                  <div><strong>置信度:</strong> {Math.round(selectedRequest.agentAnalysis.confidence * 100)}%</div>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontWeight: 'bold', color: '#fff', marginBottom: '10px', fontSize: '13px' }}>📋 决策选项</div>
                {selectedRequest.options.map((opt: any, idx: number) => (
                  <div key={opt.id} onClick={() => setSelectedOption(opt.id)} style={{ padding: '14px', margin: '6px 0', background: selectedOption === opt.id ? 'rgba(33, 150, 243, 0.2)' : 'rgba(255,255,255,0.05)', borderRadius: '8px', border: `2px solid ${selectedOption === opt.id ? '#2196F3' : 'transparent'}`, cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                      <input type="radio" checked={selectedOption === opt.id} onChange={() => setSelectedOption(opt.id)} style={{ marginRight: '10px' }} />
                      <span style={{ fontWeight: 'bold', color: '#fff', fontSize: '13px' }}>选项 {idx + 1}: {opt.description}</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#888', marginLeft: '22px' }}>
                      <div>✓ 支持: {opt.supportingAgents.join(', ') || '无'}</div>
                      <div>✗ 反对: {opt.opposingAgents.join(', ') || '无'}</div>
                      <div>⚠️ 风险: {opt.risks.join(', ')}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontWeight: 'bold', color: '#fff', marginBottom: '6px', fontSize: '13px' }}>📝 决策理由（可选）</div>
                <textarea value={rationale} onChange={(e) => setRationale(e.target.value)} placeholder="请输入您的决策理由..." style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #555', background: 'rgba(0,0,0,0.3)', color: '#fff', minHeight: '70px', fontSize: '13px' }} />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button onClick={() => setSelectedRequest(null)} style={{ padding: '10px 18px', border: '1px solid #555', borderRadius: '6px', background: 'transparent', color: '#aaa', cursor: 'pointer', fontSize: '13px' }}>稍后处理</button>
                <button onClick={handleSubmitDecision} disabled={!selectedOption} style={{ padding: '10px 18px', border: 'none', borderRadius: '6px', background: selectedOption ? '#2196F3' : '#555', color: '#fff', cursor: selectedOption ? 'pointer' : 'not-allowed', fontWeight: 'bold', fontSize: '13px' }}>提交决策</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
