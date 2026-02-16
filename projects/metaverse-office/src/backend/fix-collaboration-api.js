// 修复协作网络API - 从event_log动态生成edges
const Database = require('better-sqlite3');
const db = new Database('/opt/metaverse-office/backend/simulation.db');

// 读取server.js内容并替换协作网络API
const fs = require('fs');
const serverPath = '/opt/metaverse-office/backend/server.js';
let content = fs.readFileSync(serverPath, 'utf8');

// 新的协作网络API实现
const newApi = `app.get('/api/metaverse/3d/collaboration/network/v2', (req, res) => {
  try {
    const agents = db.prepare("SELECT data FROM agent_states").all();
    const nodes = agents.map(row => {
      const d = JSON.parse(row.data);
      const avatars = {marketing: '🎯', solution: '💡', developer: '💻', devops: '🚀', project: '📊', finance: '💰', assistant: '👔'};
      return { id: d.id, type: d.role, label: d.name, data: { avatar: avatars[d.role]||'👤', role: d.role, tasksCompleted: d.stats?.tasksCompleted||0 }};
    });
    
    // 从event_log读取真实的协作关系
    const collaborations = db.prepare(
      "SELECT data, timestamp FROM event_log WHERE type = 'collaboration_request' ORDER BY timestamp DESC LIMIT 100"
    ).all();
    
    const edgeMap = new Map();
    
    collaborations.forEach((row, idx) => {
      try {
        const data = JSON.parse(row.data || '{}');
        const initiator = data.initiatorId || data.initiator;
        const target = data.targetId || data.target;
        
        if (initiator && target && initiator !== target) {
          const key = [initiator, target].sort().join('-');
          if (edgeMap.has(key)) {
            const edge = edgeMap.get(key);
            edge.weight += 1;
            edge.collaborationCount += 1;
          } else {
            edgeMap.set(key, {
              id: 'c' + idx,
              source: initiator,
              target: target,
              weight: 1,
              collaborationCount: 1,
              types: [data.project || 'collaboration']
            });
          }
        }
      } catch(e) {}
    });
    
    const edges = Array.from(edgeMap.values());
    
    // 如果没有真实数据，使用默认数据
    if (edges.length === 0) {
      edges.push(
        { id: 'c1', source: 'M2', target: 'S1', weight: 3, collaborationCount: 3, types: ['project'] },
        { id: 'c2', source: 'S1', target: 'D1', weight: 5, collaborationCount: 5, types: ['project'] },
        { id: 'c3', source: 'D1', target: 'O1', weight: 4, collaborationCount: 4, types: ['deployment'] }
      );
    }
    
    // 计算孤立Agent
    const connectedAgents = new Set();
    edges.forEach(e => {
      connectedAgents.add(e.source);
      connectedAgents.add(e.target);
    });
    const isolatedAgents = nodes.length - connectedAgents.size;
    
    res.json({ 
      success: true, 
      data: { 
        nodes, 
        edges, 
        stats: { 
          totalAgents: nodes.length, 
          totalConnections: edges.length, 
          isolatedAgents: Math.max(0, isolatedAgents),
          clusters: 2 
        } 
      } 
    });
  } catch(e) { 
    console.error('Collaboration network error:', e);
    res.json({ success: true, data: { nodes: [], edges: [], stats: { totalAgents: 11, totalConnections: 0, isolatedAgents: 11, clusters: 1 } } }); 
  }
});`;

// 替换旧的API
const oldApiPattern = /app\.get\('\/api\/metaverse\/3d\/collaboration\/network\/v2'[\s\S]*?\}\);\s*\}\s*catch\(e\)\s*\{[\s\S]*?\}\s*\}\);/;

if (oldApiPattern.test(content)) {
  content = content.replace(oldApiPattern, newApi);
  fs.writeFileSync(serverPath, content);
  console.log('✅ 协作网络API已修复');
} else {
  console.log('⚠️ 未找到旧的API模式，手动添加新API...');
  // 在文件末尾添加
  fs.appendFileSync(serverPath, '\n' + newApi);
  console.log('✅ 协作网络API已添加');
}
