# 🗣️ TTS语音合成使用指南

## 已配置模型

### 1. 中文模型（vits-zh-hf-fanchen-C）
- **特点**：中文普通话，女声
- **路径**：`~/.openclaw/tools/sherpa-onnx-tts/models/vits-zh-hf-fanchen-C/`
- **测试状态**：✅ 测试成功（RTF=0.772）

**使用命令**：
```bash
ZH_MODEL="$HOME/.openclaw/tools/sherpa-onnx-tts/models/vits-zh-hf-fanchen-C"
~/.openclaw/tools/sherpa-onnx-tts/runtime/bin/sherpa-onnx-offline-tts \
  --vits-model="$ZH_MODEL/vits-zh-hf-fanchen-C.onnx" \
  --vits-tokens="$ZH_MODEL/tokens.txt" \
  --vits-lexicon="$ZH_MODEL/lexicon.txt" \
  --output-filename=output.wav \
  "你好，我是AI秘书。"
```

### 2. 英文模型（vits-piper-en_US-lessac-high）
- **特点**：美式英语，女声
- **路径**：`~/.openclaw/tools/sherpa-onnx-tts/models/vits-piper-en_US-lessac-high/`
- **测试状态**：✅ 测试成功（RTF=0.641）

**使用命令**：
```bash
EN_MODEL="$HOME/.openclaw/tools/sherpa-onnx-tts/models/vits-piper-en_US-lessac-high"
~/.openclaw/tools/sherpa-onnx-tts/runtime/bin/sherpa-onnx-offline-tts \
  --vits-model="$EN_MODEL/en_US-lessac-high.onnx" \
  --vits-tokens="$EN_MODEL/tokens.txt" \
  --vits-data-dir="$EN_MODEL/espeak-ng-data" \
  --output-filename=output.wav \
  "Hello, I am AI secretary."
```

## 性能指标

| 模型 | RTF（实时因子） | 说明 |
|------|----------------|------|
| 中文 | 0.772 | 生成1秒音频需0.772秒 |
| 英文 | 0.641 | 生成1秒音频需0.641秒 |

> RTF < 1.0 表示实时生成，速度优秀！

## 使用场景

1. **报告语音播报**：将行业研究报告转为语音
2. **消息提醒**：重要事项语音通知
3. **内容创作**：视频配音、播客制作
4. **辅助阅读**：长文本语音朗读

## 注意事项

- 当前为离线本地运行，无需联网
- 中文模型暂不支持英文单词（如"AI"会被忽略）
- 建议单次生成不超过100字，避免内存占用过高
