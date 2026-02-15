# 🤖 QQ接入配置指南（go-cqhttp）

> 通过 go-cqhttp 将 QQ 接入 OpenClaw

---

## 📋 配置状态

| 项目 | 状态 |
|------|------|
| go-cqhttp 下载 | ✅ 完成 |
| 配置文件创建 | ✅ 完成 |
| QQ账号配置 | ⏳ 待填写 |
| 扫码登录 | ⏳ 待执行 |
| OpenClaw连接 | ⏳ 待配置 |

---

## 🔧 安装路径

```
~/.openclaw/tools/go-cqhttp/
├── go-cqhttp          # 主程序
├── config.yml         # 配置文件
└── start.sh           # 启动脚本
```

---

## 📝 配置步骤

### 步骤1：编辑配置文件

**文件**: `~/.openclaw/tools/go-cqhttp/config.yml`

**需要修改的内容**:

```yaml
account:
  uin: 123456789          # ← 修改为你的QQ号码
  password: ''            # ← 留空（使用扫码登录）
```

### 步骤2：启动 go-cqhttp

**方式1：使用启动脚本**
```bash
~/.openclaw/tools/go-cqhttp/start.sh
```

**方式2：直接启动**
```bash
cd ~/.openclaw/tools/go-cqhttp
./go-cqhttp -faststart
```

### 步骤3：扫码登录

首次启动时会显示二维码，请用手机QQ扫码登录。

```
[INFO]: 请使用手机QQ扫描二维码登录
[QR-Code]:
█████████████████████████
██ ▄▄▄▄▄ █▀▄█▄▀▄█ ▄▄▄▄▄ ██
██ █   █ █▄▀▄▄▄▀█ █   █ ██
... (二维码图像)
```

### 步骤4：验证连接

登录成功后，会看到以下日志：
```
[INFO]: 登录成功: 你的QQ昵称(123456789)
[INFO]: 开始处理消息
[INFO]: WebSocket连接已建立
```

---

## 🔌 OpenClaw 集成

### 当前配置

generateservers:
  - ws-reverse:
      universal: ws://127.0.0.1:18789/cqhttp/ws
      reconnect-interval: 3000
```

### OpenClaw 端配置

需要在 OpenClaw 中配置 QQ Channel:

```json5
// 添加到 ~/.openclaw/openclaw.json
{
  "channels": {
    "qq": {
      "enabled": true,
      "host": "127.0.0.1",
      "port": 5700,
      "ws-port": 18789,
      "access-token": ""
    }
  }
}
```

**注意**: OpenClaw 需要安装 QQ 插件或自定义适配器才能接收 go-cqhttp 消息。

---

## ⚠️ 风险提示

### 使用 go-cqhttp 的风险

1. **账号安全**
   - 使用第三方QQ协议实现
   - 存在被封号风险（概率较低但存在）
   - 建议用小号测试

2. **稳定性**
   - 依赖QQ协议逆向
   - QQ更新可能导致失效
   - 需要及时更新 go-cqhttp

3. **隐私**
   - 消息经过本地中转
   - 确保环境安全

---

## 🔄 维护操作

### 重启 go-cqhttp
```bash
cd ~/.openclaw/tools/go-cqhttp
pkill go-cqhttp
./go-cqhttp -faststart
```

### 更新 go-cqhttp
```bash
cd /tmp
curl -L -o go-cqhttp.tar.gz "https://github.com/Mrs4s/go-cqhttp/releases/latest/download/go-cqhttp_darwin_arm64.tar.gz"
tar -xzf go-cqhttp.tar.gz
mv go-cqhttp ~/.openclaw/tools/go-cqhttp/
```

### 查看日志
```bash
cd ~/.openclaw/tools/go-cqhttp
tail -f logs/*.log
```

---

## 📱 使用说明

### 私聊消息
直接在QQ中给机器人账号发消息，会转发到OpenClaw。

### 群消息
在QQ群中@机器人账号，会触发OpenClaw回复。

### 指令示例
```
/帮助          - 显示帮助信息
/状态          - 查看系统状态
/搜索 [关键词]  - 使用Brave搜索
```

---

## 🎯 下一步行动

1. ✅ **填写QQ号码** - 编辑 config.yml
2. ⏳ **启动程序** - 运行 start.sh
3. ⏳ **扫码登录** - 手机QQ扫码
4. ⏳ **配置OpenClaw** - 添加QQ Channel
5. ⏳ **测试消息** - 发送测试消息

---

## 📞 需要帮助？

- go-cqhttp 文档: https://docs.go-cqhttp.org/
- QQ群: go-cqhttp交流群
- GitHub: https://github.com/Mrs4s/go-cqhttp

---

**配置时间**: 2026-02-11 15:10  
**配置者**: AI秘书 🦞
