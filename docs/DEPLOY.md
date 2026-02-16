# 部署文档

## 环境要求

- Node.js 18+
- SQLite 3
- Nginx

## 部署步骤

1. 安装依赖
```bash
npm install
```

2. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件配置您的环境
```

3. 构建项目
```bash
npm run build
```

4. 启动服务
```bash
npm start
```

## 注意事项

- 生产环境请使用HTTPS
- 配置适当的数据库备份策略
- 定期更新依赖包

## 联系方式

如有问题请联系系统管理员。
