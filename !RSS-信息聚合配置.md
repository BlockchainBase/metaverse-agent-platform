# 📰 AI秘书 RSS 信息聚合系统配置

> RSS订阅源整理与监控配置 | 2026-02-11

---

## 🎯 订阅源分类

### 1. 行业资讯（AI/科技）

| 名称 | RSS链接 | 更新频率 | 重要性 |
|------|---------|----------|--------|
| **机器之心** | https://www.jiqizhixin.com/rss | 每日 | ⭐⭐⭐⭐⭐ |
| **量子位** | https://www.qbitai.com/rss | 每日 | ⭐⭐⭐⭐⭐ |
| **InfoQ AI** | https://www.infoq.cn/ai/rss | 每日 | ⭐⭐⭐⭐ |
| **新智元** | https://mp.weixin.qq.com/rss | 每日 | ⭐⭐⭐⭐ |
| **NVIDIA博客** | https://nvidianews.nvidia.com/rss.xml | 每周 | ⭐⭐⭐⭐ |
| **MIT Tech Review** | https://www.technologyreview.com/feed/ | 每日 | ⭐⭐⭐⭐ |

### 2. 学术前沿（论文/研究）

| 名称 | RSS链接 | 更新频率 | 重要性 |
|------|---------|----------|--------|
| **arXiv AI** | https://arxiv.org/rss/cs.AI | 每日 | ⭐⭐⭐⭐⭐ |
| **arXiv ML** | https://arxiv.org/rss/cs.LG | 每日 | ⭐⭐⭐⭐⭐ |
| **arXiv CL** | https://arxiv.org/rss/cs.CL | 每日 | ⭐⭐⭐⭐ |
| **Papers with Code** | https://paperswithcode.com/rss | 每日 | ⭐⭐⭐⭐ |
| **Google Scholar Alert** | 自定义关键词 | 每周 | ⭐⭐⭐⭐ |

### 3. 政策/行业报告

| 名称 | RSS链接 | 更新频率 | 重要性 |
|------|---------|----------|--------|
| **教育部** | http://www.moe.gov.cn/rss.xml | 每周 | ⭐⭐⭐⭐ |
| **科技部** | http://www.most.gov.cn/rss.xml | 每周 | ⭐⭐⭐⭐ |
| **中国信通院** | https://www.caict.ac.cn/rss | 每周 | ⭐⭐⭐⭐ |
| **艾瑞咨询** | https://www.iresearch.com.cn/rss | 每周 | ⭐⭐⭐ |
| **麦肯锡** | https://www.mckinsey.com/feed | 每周 | ⭐⭐⭐⭐ |

### 4. 竞品动态（研究院相关企业）

| 名称 | 监控方式 | 更新频率 | 重要性 |
|------|----------|----------|--------|
| **研究院孵化企业** | Web搜索+官网监控 | 每日 | ⭐⭐⭐⭐⭐ |
| **同行业AI公司** | Web搜索监控 | 每周 | ⭐⭐⭐⭐ |

---

## 🔧 技术实现方案

### 方案1：使用 OpenClaw 原生功能
- 利用 `web_search` 定期搜索
- 利用 `web_fetch` 抓取网页内容
- 利用 `cron` 定时任务执行

### 方案2：自建 RSS 聚合器
- Python脚本 + feedparser
- 数据库存储
- 自动摘要 + 推送

### 方案3：使用第三方服务
- Feedly Pro
- Inoreader
- Readwise Reader

---

## 📝 推荐配置

### 高频监控（每日）
- 机器之心
- 量子位
- arXiv AI/ML
- 竞品动态

### 中频监控（每周）
- 政策发布
- 行业报告
- 学术期刊

### 低频监控（每月）
- 竞品财报
- 行业白皮书

---

## 🔔 推送策略

### 定时摘要
- **每日09:00**：AI资讯早报
- **每周一**：上周论文精选
- **每周五**：政策/行业周报

### 即时推送
- 重大政策发布
- 竞品重大动态
- 突发科技新闻

---

## 📊 信息处理流程

```
RSS订阅源
    ↓
抓取器（Python/feedparser）
    ↓
去重 + 分类 + 摘要
    ↓
重要度评分
    ↓
存储（Obsidian/飞书）
    ↓
定时推送（Cron任务）
```

---

## 🚀 下一步行动

1. **选择RSS工具**
   - 自建（推荐，更灵活）
   - 第三方（Feedly/Inoreader）

2. **配置订阅源**
   - 添加上述RSS链接
   - 测试抓取

3. **设置摘要生成**
   - 使用AI自动生成摘要
   - 人工审核重要内容

4. **配置推送规则**
   - 高频→即时推送
   - 中频→每日摘要
   - 低频→每周报告

---

## 📁 文件位置

- 订阅源配置：`memory/rss-config.json`
- 抓取脚本：`skills/rss-aggregator/`
- 历史数据：`memory/rss-archive/YYYY-MM-DD.md`

---

**创建时间**: 2026-02-11 14:40  
**维护者**: AI秘书 🦞
