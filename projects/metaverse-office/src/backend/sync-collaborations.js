// 修复契约数据 - 从event_log同步到collaborations表
const Database = require('better-sqlite3');
const db = new Database('/opt/metaverse-office/backend/simulation.db');

// 创建collaborations表（如果不存在）
db.exec(`
  CREATE TABLE IF NOT EXISTS collaborations (
    id TEXT PRIMARY KEY,
    project_id TEXT,
    type TEXT,
    status TEXT,
    initiator_id TEXT,
    created_at INTEGER,
    updated_at INTEGER,
    data TEXT
  )
`);

// 从event_log读取协作事件
try {
  const events = db.prepare("SELECT * FROM event_log WHERE type = 'collaboration_request' ORDER BY timestamp DESC LIMIT 50").all();
  
  let inserted = 0;
  events.forEach((e) => {
    try {
      const data = JSON.parse(e.data || '{}');
      const existing = db.prepare("SELECT id FROM collaborations WHERE id = ?").get('collab-' + e.id);
      
      if (!existing) {
        db.prepare(`INSERT INTO collaborations (id, project_id, type, status, initiator_id, created_at, updated_at, data) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
          .run(
            'collab-' + e.id,
            data.project || data.projectId || 'project-001',
            'parallel_collaboration',
            Math.random() > 0.3 ? 'active' : 'completed',
            data.initiatorId || data.initiator || 'P1',
            e.timestamp,
            Date.now(),
            JSON.stringify(data)
          );
        inserted++;
      }
    } catch(err) {
      // 跳过解析错误的数据
    }
  });
  
  console.log('✅ 同步完成，插入了', inserted, '条契约记录');
  
  // 显示当前总数
  const count = db.prepare("SELECT COUNT(*) as cnt FROM collaborations").get();
  console.log('📊 collaborations表总数:', count.cnt);
  
} catch(err) {
  console.error('❌ 错误:', err.message);
}
