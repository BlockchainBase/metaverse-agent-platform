# 🚀 Phase 3 完成：阿里云部署

## ✅ 部署配置完成

### 1. Docker生产环境

**配置文件**:
- `docker-compose.prod.yml` - 生产环境编排
- `apps/server/Dockerfile` - 后端服务镜像
- `nginx.conf` - Nginx反向代理配置

**服务栈**:
```
PostgreSQL 15  - 数据库
Redis 7        - 缓存
Node.js API    - 后端服务
Nginx          - 反向代理 + 静态文件
```

### 2. 部署脚本

**本地打包**:
```bash
./scripts/deploy.sh
```

**服务器安装**:
```bash
# 在阿里云服务器上运行
curl -fsSL https://raw.githubusercontent.com/your-repo/main/scripts/install.sh | sudo bash
```

### 3. 手动部署步骤

#### 步骤1: 准备部署包

```bash
cd ~/.openclaw/workspace/projects/research-agent-platform

# 构建Web前端
cd apps/web && npm run build && cd ../..

# 构建元宇宙
cd apps/metaverse && npm run build && cd ../..

# 构建后端
cd apps/server && npm run build && cd ../..

# 创建部署目录
mkdir -p deploy
cp -r apps/web/dist deploy/
cp -r apps/metaverse/dist deploy/
cp -r apps/server/dist deploy/server/
cp apps/server/package.json deploy/server/
cp docker-compose.prod.yml deploy/
cp nginx.conf deploy/
cp scripts/install.sh deploy/
```

#### 步骤2: 上传到阿里云

```bash
# 压缩部署包
tar -czvf deploy.tar.gz deploy/

# 上传到服务器（替换为你的服务器IP）
scp deploy.tar.gz root@8.215.54.214:/opt/

# SSH登录服务器
ssh root@8.215.54.214
```

#### 步骤3: 服务器安装

```bash
# 解压
cd /opt && tar -xzvf deploy.tar.gz

# 运行安装脚本
cd deploy && chmod +x install.sh && ./install.sh
```

#### 步骤4: 配置环境变量

```bash
cd /opt/research-agent-platform

# 编辑环境变量
nano .env

# 配置飞书（可选）
FEISHU_APP_ID=cli_xxxxx
FEISHU_APP_SECRET=xxxxx
FEISHU_PROJECT_CHAT_ID=oc_xxxxx

# 重启服务
docker-compose -f docker-compose.prod.yml up -d
```

### 4. 访问地址

部署完成后访问：
- **管理后台**: http://8.215.54.214
- **后端API**: http://8.215.54.214/api
- **元宇宙**: http://8.215.54.214/metaverse

### 5. 常用命令

```bash
# 查看状态
docker-compose -f docker-compose.prod.yml ps

# 查看日志
docker-compose -f docker-compose.prod.yml logs -f

# 重启服务
docker-compose -f docker-compose.prod.yml restart

# 停止服务
docker-compose -f docker-compose.prod.yml down

# 更新代码后重新部署
docker-compose -f docker-compose.prod.yml up -d --build
```

## 📦 项目文件结构

```
research-agent-platform/
├── apps/
│   ├── server/          # 后端服务
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── src/
│   ├── web/             # Web前端
│   │   └── dist/        # 构建输出
│   └── metaverse/       # 元宇宙
│       └── dist/        # 构建输出
├── docker-compose.prod.yml
├── nginx.conf
├── scripts/
│   ├── deploy.sh        # 本地部署脚本
│   └── install.sh       # 服务器安装脚本
└── .env                 # 环境变量
```

## ⚙️ 生产环境配置

### 数据库
- PostgreSQL 15 with persistent volume
- 自动备份配置（建议添加）

### 安全
- JWT Secret 自动生成
- 数据库密码自动生成
- 建议配置 HTTPS（SSL证书）

### 性能
- Nginx Gzip压缩
- 静态文件缓存
- 负载均衡（可选）

## 🔧 后续优化建议

1. **HTTPS配置** - 添加SSL证书
2. **自动备份** - 数据库定时备份
3. **监控告警** - 系统状态监控
4. **日志收集** - 集中式日志管理
5. **CI/CD** - 自动化部署流水线

---
**部署准备完成！**

需要我协助进行实际部署吗？🫡
