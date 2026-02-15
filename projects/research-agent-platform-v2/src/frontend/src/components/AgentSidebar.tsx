import { useState } from 'react';
import { AGENTS_DATA, AgentRole, STATUS_CONFIG } from '../data/agents';

interface AgentSidebarProps {
  selectedRole: AgentRole | null;
  onSelectRole: (role: AgentRole) => void;
  onlineAgents: string[];
  visible?: boolean;
}

// 角色显示顺序：市场→方案→开发→交付→项目→财务→院长
const ROLE_ORDER: AgentRole[] = [
  'market',      // 1. 市场专员
  'solution',    // 2. 方案架构师
  'developer',   // 3. AI开发工程师
  'delivery',    // 4. AI交付专家
  'project',     // 5. 项目管家
  'finance',     // 6. 财务助手
  'director',    // 7. 院长助理
];

export function AgentSidebar({ selectedRole, onSelectRole, onlineAgents, visible = true }: AgentSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!visible) return null;

  return (
    <div
      className="agent-sidebar"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      style={{
        position: 'fixed',
        left: 0,
        top: '80px',
        bottom: '20px',
        width: isExpanded ? '280px' : '50px',
        background: isExpanded ? 'rgba(0, 0, 0, 0.9)' : 'transparent',
        backdropFilter: isExpanded ? 'blur(10px)' : 'none',
        borderRight: isExpanded ? '1px solid rgba(255,255,255,0.1)' : 'none',
        color: 'white',
        overflowY: isExpanded ? 'auto' : 'visible',
        zIndex: 16777272,
        transition: 'all 0.3s ease',
        padding: isExpanded ? '16px' : '0',
        borderRadius: isExpanded ? '0 12px 12px 0' : '0',
      }}
    >
      {/* 缩略浮标 - 收起时显示 */}
      {!isExpanded && (
        <div style={{
          position: 'absolute',
          left: '0',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '40px',
          height: '120px',
          background: 'rgba(0, 0, 0, 0.7)',
          borderRadius: '0 8px 8px 0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          cursor: 'pointer',
          border: '1px solid rgba(255,255,255,0.2)',
          borderLeft: 'none',
        }}>
          <span style={{ fontSize: '20px' }}>🤖</span>
          <span style={{ fontSize: '12px', writingMode: 'vertical-rl' }}>AI团队</span>
          <span style={{ fontSize: '14px' }}>›</span>
        </div>
      )}

      {/* 展开内容 */}
      {isExpanded && (
        <>
          <h3 style={{
            margin: '0 0 16px 0',
            fontSize: '16px',
            color: '#4A90E2',
            borderBottom: '1px solid rgba(255,255,255,0.2)',
            paddingBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>🤖</span>
            <span>AI Agent团队</span>
          </h3>

          <div style={{ marginBottom: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
            在线: {onlineAgents.length}/7
          </div>

          {ROLE_ORDER.map((role) => {
            const agent = AGENTS_DATA[role];
            const isOnline = onlineAgents.includes(role);
            const isSelected = selectedRole === role;
            const status = STATUS_CONFIG[agent.status];

            return (
              <div
                key={role}
                onClick={() => onSelectRole(role)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  marginBottom: '8px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: isSelected ? 'rgba(74, 144, 226, 0.3)' : 'transparent',
                  border: isSelected ? '1px solid #4A90E2' : '1px solid transparent',
                  transition: 'all 0.2s'
                }}
              >
                {/* 头像 */}
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: agent.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  position: 'relative',
                  flexShrink: 0
                }}>
                  {agent.emoji}
                  {/* 在线状态指示器 */}
                  <div style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: isOnline ? '#10B981' : '#6B7280',
                    border: '2px solid rgba(0,0,0,0.85)'
                  }} />
                </div>

                {/* 信息 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontWeight: 600,
                    fontSize: '14px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {agent.name}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span>{status.icon}</span>
                    <span>{status.label}</span>
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.4)',
                    marginTop: '2px'
                  }}>
                    {agent.department}
                  </div>
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
