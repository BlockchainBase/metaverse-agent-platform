// 推理链回放 - DOM覆盖层版本
import { useState, useEffect, useRef } from 'react'
import { useDeviceDetect } from '../hooks/useDeviceDetect'

interface SimpleReasoningProps {
  organizationId?: string
  onClose?: () => void
}

export function SimpleReasoning({ organizationId, onClose }: SimpleReasoningProps) {
  const [steps, setSteps] = useState<any[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const { isMobile } = useDeviceDetect()
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const apiBase = import.meta.env.VITE_API_BASE || ''
        const response = await fetch(`${apiBase}/api/metaverse/3d/reasoning?organizationId=${organizationId || 'org-001'}`)
        const result = await response.json()
        if (result.success && result.data.length > 0) {
          setSteps(result.data)
        } else {
          setSteps([
            { type: 'initiation', title: '契约发起', content: '智慧校园系统建设方案讨论启动', agentId: 'M2', agentName: '周展', role: 'marketing', timestamp: Date.now() - 7200000, evidence: [{ type: 'document', source: '市场调研报告', content: '教育数字化市场需求旺盛', relevance: 0.95 }] },
            { type: 'negotiation', stance: 'support', title: '方案可行性分析', content: '技术架构成熟，可复用现有平台组件', agentId: 'S1', agentName: '王谋', role: 'solution', timestamp: Date.now() - 5400000, confidence: 0.85, evidence: [{ type: 'data', source: '技术评估', content: '微服务架构支持横向扩展', relevance: 0.88 }] },
            { type: 'negotiation', stance: 'question', title: '技术风险识别', content: '需关注高并发场景下的数据库性能', agentId: 'D1', agentName: '张码', role: 'developer', timestamp: Date.now() - 3600000, confidence: 0.72, evidence: [{ type: 'historicalCase', source: '同类项目', content: '某校系统曾因并发过高导致崩溃', relevance: 0.75 }] },
            { type: 'negotiation', stance: 'amend', title: '运维方案补充', content: '建议增加自动化扩容机制和监控告警', agentId: 'O1', agentName: '陈运', role: 'devops', timestamp: Date.now() - 1800000, confidence: 0.90, evidence: [{ type: 'expertOpinion', source: '最佳实践', content: '容器化部署+弹性伸缩是标准方案', relevance: 0.92 }] },
            { type: 'consensus', title: '达成共识', content: '智慧校园系统方案获得全体Agent认可，进入执行阶段', agentIds: ['M2', 'S1', 'D1', 'O1', 'P1'], timestamp: Date.now() - 300000, confidence: 0.88 }
          ])
        }
      } catch (e) {
        console.error('Fetch error:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [organizationId])

  useEffect(() => {
    if (!isPlaying) return
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= steps.length - 1) {
          setIsPlaying(false)
          return prev
        }
        return prev + 1
      })
    }, 3000)
    return () => clearInterval(interval)
  }, [isPlaying, steps.length])

  const getStepColor = (step: any) => {
    if (step.type === 'initiation') return '#FF9800'
    if (step.type === 'consensus') return '#4CAF50'
    switch (step.stance) {
      case 'support': return '#4CAF50'
      case 'challenge': return '#F44336'
      case 'amend': return '#FF9800'
      case 'question': return '#2196F3'
      default: return '#9E9E9E'
    }
  }

  const roleIcons: Record<string, string> = { marketing: '🎯', solution: '💡', developer: '💻', devops: '🚀', project: '📊', finance: '💰', assistant: '👔' }

  return (
    <div style={{
      position: 'fixed',
      top: isMobile ? 0 : '50%',
      left: isMobile ? 0 : '50%',
      right: isMobile ? 0 : 'auto',
      bottom: isMobile ? 0 : 'auto',
      transform: isMobile ? 'none' : 'translate(-50%, -50%)',
      width: isMobile ? '100%' : '90vw',
      maxWidth: isMobile ? '100%' : '500px',
      height: isMobile ? '100%' : 'auto',
      maxHeight: isMobile ? '100%' : '85vh',
      background: 'rgba(20, 20, 40, 0.98)',
      color: '#fff',
      padding: isMobile ? '50px 16px 16px' : '20px',
      borderRadius: isMobile ? 0 : '16px',
      border: isMobile ? 'none' : '2px solid #9C27B0',
      boxShadow: isMobile ? 'none' : '0 0 40px rgba(156, 39, 176, 0.4)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* 标题栏 - 固定 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        borderBottom: '1px solid #9C27B0',
        paddingBottom: '12px',
        flexShrink: 0
      }}>
        <h3 style={{ margin: 0, color: '#9C27B0', fontSize: isMobile ? '18px' : '20px' }}>
          🧠 推理链回放
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

      {/* 可滚动内容区 */}
      <div ref={contentRef} style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch'
      }}>
        {loading && <div style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}><div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div><div>加载推理链...</div></div>}

        {!loading && steps.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '32px', marginBottom: '15px' }}>🧠</div>
            <div style={{ color: '#9C27B0', fontSize: '18px' }}>暂无推理记录</div>
          </div>
        )}

        {!loading && steps.length > 0 && (
          <>
            {/* 时间轴 */}
            <div style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '16px',
              padding: '10px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '8px',
              overflowX: 'auto'
            }}>
              {steps.map((step, idx) => (
                <button key={idx} onClick={() => setCurrentStep(idx)} style={{
                  minWidth: '36px', height: '36px',
                  borderRadius: '50%', border: 'none',
                  background: idx === currentStep ? getStepColor(step) : idx < currentStep ? '#4CAF50' : '#555',
                  color: '#fff', cursor: 'pointer', fontWeight: 'bold'
                }}>{idx + 1}</button>
              ))}
            </div>

            {steps[currentStep] && (
              <div style={{
                padding: isMobile ? '14px' : '18px',
                background: 'rgba(156, 39, 176, 0.1)',
                borderRadius: '12px',
                border: `2px solid ${getStepColor(steps[currentStep])}`,
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '12px', padding: '3px 10px', background: getStepColor(steps[currentStep]), color: '#fff', borderRadius: '10px' }}>
                    步骤 {currentStep + 1} / {steps.length}
                  </span>
                  <span style={{ color: '#aaa', fontSize: '12px' }}>
                    {steps[currentStep].type === 'initiation' ? '🚀 发起' : steps[currentStep].type === 'consensus' ? '✅ 共识' : steps[currentStep].stance?.toUpperCase()}
                  </span>
                </div>

                <h4 style={{ margin: '0 0 10px 0', color: '#fff', fontSize: isMobile ? '15px' : '17px' }}>{steps[currentStep].title}</h4>
                <p style={{ color: '#ddd', lineHeight: '1.5', marginBottom: '12px', fontSize: isMobile ? '13px' : '14px' }}>{steps[currentStep].content}</p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '20px' }}>{roleIcons[steps[currentStep].role] || '👥'}</span>
                  <span style={{ color: '#aaa', fontSize: '13px' }}>{steps[currentStep].agentName || steps[currentStep].agentIds?.join(', ')}</span>
                  {steps[currentStep].confidence && (
                    <span style={{ marginLeft: 'auto', fontSize: '11px', padding: '2px 8px', background: 'rgba(76, 175, 80, 0.3)', color: '#4CAF50', borderRadius: '4px' }}>
                      置信度 {Math.round(steps[currentStep].confidence * 100)}%
                    </span>
                  )}
                </div>

                {steps[currentStep].evidence && steps[currentStep].evidence.length > 0 && (
                  <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '6px' }}>📋 相关证据</div>
                    {steps[currentStep].evidence.map((ev: any, idx: number) => (
                      <div key={idx} style={{ padding: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '4px', fontSize: '12px' }}>
                        <span style={{ color: '#9C27B0' }}>{ev.source}</span>: {ev.content}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 控制按钮 */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', paddingBottom: isMobile ? '20px' : '0' }}>
              <button onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} disabled={currentStep === 0} style={{ padding: '10px 16px', border: 'none', borderRadius: '8px', background: currentStep === 0 ? '#555' : '#2196F3', color: '#fff', cursor: currentStep === 0 ? 'not-allowed' : 'pointer', fontSize: '13px' }}>⏮ 上一步</button>
              <button onClick={() => setIsPlaying(!isPlaying)} style={{ padding: '10px 24px', border: 'none', borderRadius: '8px', background: isPlaying ? '#FF9800' : '#4CAF50', color: '#fff', fontWeight: 'bold' }}>{isPlaying ? '⏸ 暂停' : '▶ 播放'}</button>
              <button onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))} disabled={currentStep === steps.length - 1} style={{ padding: '10px 16px', border: 'none', borderRadius: '8px', background: currentStep === steps.length - 1 ? '#555' : '#2196F3', color: '#fff', cursor: currentStep === steps.length - 1 ? 'not-allowed' : 'pointer', fontSize: '13px' }}>下一步 ⏭</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
