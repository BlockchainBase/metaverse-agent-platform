# 🤖 ReAct Agent 框架配置指南

## 什么是ReAct Agent？

ReAct = Reasoning（推理）+ Acting（行动）

一种让AI能够：
1. **思考**（Reasoning）- 分析问题、拆解任务
2. **行动**（Acting）- 调用工具、执行操作
3. **观察**（Observing）- 获取结果、调整策略
4. **循环** - 直到任务完成

---

## 当前已就绪的Agent能力

### 1. OpenClaw原生Agent架构
- ✅ 工具调用（Tools）
- ✅ 子Agent（Sub-agents）
- ✅ 会话管理（Sessions）
- ✅ 技能系统（Skills）

### 2. 已配置工具
- Web搜索（Brave Search）
- 飞书文档/表格/IM
- TTS语音合成
- PDF编辑
- 视频帧提取

### 3. 子Agent能力
- 行业研究员（自动生成报告）
- 技术联合创始人（产品开发）

---

## 多模型配置模板

### 目标模型矩阵

| 模型 | 提供商 | 用途 | 状态 |
|------|--------|------|------|
| **Kimi K2.5** | Moonshot | 主力日常对话 | ✅ 已配置 |
| **GPT-4o** | OpenAI | 复杂推理、代码 | ⏳ 待配置 |
| **Claude 3.5** | Anthropic | 长文本、分析 | ⏳ 待配置 |
| **DeepSeek** | DeepSeek | 中文、性价比 | ⏳ 待配置 |

---

## 配置文件模板

### 添加到 `~/.openclaw/openclaw.json`

```json5
{
  "auth": {
    "profiles": {
      "moonshot:default": {
        "provider": "moonshot",
        "mode": "api_key"
      },
      // === 新增配置 ===
      "openai:default": {
        "provider": "openai",
        "mode": "api_key"
      },
      "anthropic:default": {
        "provider": "anthropic",
        "mode": "api_key"
      }
    }
  },
  "models": {
    "mode": "merge",
    "providers": {
      "moonshot": {
        "baseUrl": "https://api.moonshot.cn/v1",
        "api": "openai-completions",
        "models": [
          {
            "id": "kimi-k2.5",
            "name": "Kimi K2.5",
            "alias": "kimi",
            "reasoning": false,
            "contextWindow": 256000,
            "maxTokens": 8192
          }
        ]
      },
      // === 新增配置 ===
      "openai": {
        "baseUrl": "https://api.openai.com/v1",
        "api": "openai-completions",
        "models": [
          {
            "id": "gpt-4o",
            "name": "GPT-4o",
            "alias": "gpt4o",
            "reasoning": true,
            "contextWindow": 128000,
            "maxTokens": 4096
          },
          {
            "id": "gpt-4o-mini",
            "name": "GPT-4o Mini",
            "alias": "gpt4o-mini",
            "reasoning": false,
            "contextWindow": 128000,
            "maxTokens": 4096
          }
        ]
      },
      "anthropic": {
        "baseUrl": "https://api.anthropic.com/v1",
        "api": "anthropic-messages",
        "models": [
          {
            "id": "claude-3-5-sonnet-20241022",
            "name": "Claude 3.5 Sonnet",
            "alias": "claude",
            "reasoning": true,
            "contextWindow": 200000,
            "maxTokens": 8192
          }
        ]
      }
    }
  },
  "agents": {
    "defaults": {
      "model": {
        "primary": "moonshot/kimi-k2.5"
      },
      "models": {
        "moonshot/kimi-k2.5": { "alias": "Kimi" },
        "openai/gpt-4o": { "alias": "GPT-4o" },
        "openai/gpt-4o-mini": { "alias": "GPT-4o-Mini" },
        "anthropic/claude-3-5-sonnet-20241022": { "alias": "Claude" }
      }
    }
  }
}
```

---

## 模型选择策略

### 按任务类型选择

```
简单问答/日常对话 → Kimi K2.5（快速、经济）
复杂推理/代码生成 → GPT-4o（强推理能力）
长文档分析/总结 → Claude 3.5（200K上下文）
快速响应/低成本 → GPT-4o-Mini（轻量级）
```

### 自动切换规则（建议）

| 场景 | 自动选择模型 |
|------|-------------|
| 代码相关 | GPT-4o |
| 超长文本（>100K） | Claude 3.5 |
| 数学/逻辑推理 | GPT-4o |
| 创意写作 | Claude 3.5 |
| 日常对话 | Kimi K2.5 |
| 快速查询 | GPT-4o-Mini |

---

## 环境变量配置

需要配置的API Key：

```bash
# 已配置
export BRAVE_API_KEY="您的Brave API Key"

# 待配置
export OPENAI_API_KEY="您的OpenAI API Key"
export ANTHROPIC_API_KEY="您的Anthropic API Key"
export DEEPSEEK_API_KEY="您的DeepSeek API Key"（可选）
```

---

## Agent工作流示例

### 复杂任务自动拆解

用户："研究AI医疗行业并生成报告"

Agent执行流程：
1. **思考** - 这是一个行业研究任务，需要：
   - 搜索最新资讯
   - 查找市场规模数据
   - 分析竞争格局
   - 整理成报告

2. **行动** - 调用工具：
   - `web_search` - 搜索"AI医疗 2025 市场规模"
   - `web_search` - 搜索"AI医疗 融资 独角兽"
   - `web_fetch` - 获取详细文章内容

3. **观察** - 获取结果：
   - 市场规模：200亿美元
   - 主要玩家：Abridge、Lila Sciences
   - 技术趋势：大模型应用

4. **循环** - 继续补充：
   - 搜索"AI医疗 政策 2025"
   - 搜索"AI医疗 挑战 风险"

5. **完成** - 调用`write`生成报告

---

## 下一步行动

### 立即可以做的：
1. ✅ 获取 OpenAI API Key（https://platform.openai.com）
2. ✅ 获取 Anthropic API Key（https://console.anthropic.com）
3. ✅ 更新 `~/.openclaw/openclaw.json` 配置
4. ✅ 添加环境变量到 `.zshrc` 或 `.bash_profile`

### 测试验证：
```bash
# 测试GPT-4o
openclaw session --model openai/gpt-4o

# 测试Claude
openclaw session --model anthropic/claude-3-5-sonnet-20241022
```

---

**配置时间**: 2026-02-11 14:35  
**说明**: 多模型配置需要API Key，请刚哥提供后完成配置 🦞
