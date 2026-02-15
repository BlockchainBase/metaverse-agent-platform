import { useEffect, useState } from 'react';
import { openClawClient, AgentIdentity } from '../services/openClawClient';
import { AGENTS_DATA, AgentRole } from '../data/agents';

interface ConnectionStatusProps {
  role: AgentRole;
}

export function ConnectionStatus({ role }: ConnectionStatusProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [onlineAgents, setOnlineAgents] = useState<string[]>([]);

  useEffect(() => {
    const agent = AGENTS_DATA[role];
    
    // 构建身份信息
    const identity: AgentIdentity = {
      agentId: role,
      agentName: agent.name,
      ownerName: agent.ownerName,
      deviceInfo: {
        deviceId: 'browser-' + role,
        hostName: 'metaverse-client',
        platform: 'web'
      }
    };

    // 连接到协作网络
    const wsUrl = 'ws://localhost:9876';
    openClawClient.connect(wsUrl, identity);

    // 监听连接状态
    openClawClient.onConnectionChange((connected) => {
      setIsConnected(connected);
    });

    // 监听其他Agent上线
    openClawClient.onMessage('agent_online', (payload) => {
      setOnlineAgents(prev => [...prev, payload.agentId]);
    });

    // 监听其他Agent离线
    openClawClient.onMessage('agent_offline', (payload) => {
      setOnlineAgents(prev => prev.filter(id => id !== payload.agentId));
    });

    return () => {
      openClawClient.disconnect();
    };
  }, [role]);

  return (
    <div className="connection-status" style={{
      position: 'fixed',
      top: '80px',
      right: '24px',
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
      borderRadius: '12px',
      padding: '16px',
      color: 'white',
      minWidth: '200px',
      zIndex: 1000
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        marginBottom: '12px'
      }}>
        <div style={{
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          background: isConnected ? '#10B981' : '#EF4444',
          boxShadow: isConnected ? '0 0 10px #10B981' : 'none'
        }} />
        <span style={{ fontWeight: 600 }}>
          {isConnected ? '已连接协作网络' : '未连接'}
        </span>
      </div>

      {isConnected && (
        <>
          <div style={{ 
            fontSize: '12px', 
            color: 'rgba(255,255,255,0.6)',
            marginBottom: '8px'
          }}>
            在线Agent: {onlineAgents.length + 1}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {/* 自己 */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              padding: '4px 8px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '4px'
            }}>
              <span>{AGENTS_DATA[role].emoji}</span>
              <span style={{ fontSize: '14px' }}>{AGENTS_DATA[role].name}</span>
              <span style={{ 
                fontSize: '10px', 
                color: '#10B981',
                marginLeft: 'auto'
              }}>我</span>
            </div>

            {/* 其他在线Agent */}
            {onlineAgents.map(agentId => {
              const agent = AGENTS_DATA[agentId as AgentRole];
              if (!agent || agentId === role) return null;
              
              return (
                <div key={agentId} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  padding: '4px 8px',
                  borderRadius: '4px'
                }}>
                  <span>{agent.emoji}</span>
                  <span style={{ fontSize: '14px' }}>{agent.name}</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// 简化的连接指示器
export function ConnectionIndicator() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    openClawClient.onConnectionChange((connected) => {
      setIsConnected(connected);
    });
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: '80px',
      right: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      background: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(10px)',
      padding: '8px 16px',
      borderRadius: '20px',
      color: 'white',
      fontSize: '14px',
      zIndex: 1000
    }}>
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: isConnected ? '#10B981' : '#EF4444',
        boxShadow: isConnected ? '0 0 8px #10B981' : 'none'
      }} />
      <span>{isConnected ? '协作网络已连接' : '未连接'}</span>
    </div>
  );
}
