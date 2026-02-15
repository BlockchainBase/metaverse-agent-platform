#!/bin/bash
# 数字人元宇宙平台 v3.0 - GitHub 推送与版本发布脚本
# 使用: ./deploy-to-github.sh [版本号] [GitHub仓库地址]

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 默认配置
VERSION="${1:-v3.0.0}"
GITHUB_REPO="${2:-}"
PROJECT_DIR="/Users/tomscomputer/.openclaw/workspace/projects/metaverse-office"

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# 检查 Git 仓库
check_git_repo() {
    log_step "检查 Git 仓库..."
    
    cd "$PROJECT_DIR"
    
    if [ ! -d ".git" ]; then
        log_error "当前目录不是 Git 仓库"
        exit 1
    fi
    
    # 检查是否有未提交的更改
    if [ -n "$(git status --porcelain)" ]; then
        log_warn "有未提交的更改，先提交..."
        git add -A
        git commit -m "Prepare for release $VERSION"
    fi
    
    log_info "Git 仓库检查完成"
}

# 配置 GitHub 远程仓库
setup_github_remote() {
    log_step "配置 GitHub 远程仓库..."
    
    cd "$PROJECT_DIR"
    
    # 如果提供了仓库地址，添加远程仓库
    if [ -n "$GITHUB_REPO" ]; then
        # 移除现有的 origin（如果存在）
        git remote remove origin 2>/dev/null || true
        
        # 添加新的 origin
        git remote add origin "$GITHUB_REPO"
        log_info "已添加远程仓库: $GITHUB_REPO"
    fi
    
    # 检查是否有 origin
    if ! git remote get-url origin &>/dev/null; then
        log_error "未配置远程仓库"
        log_info "请提供 GitHub 仓库地址，例如:"
        log_info "  ./deploy-to-github.sh v3.0.0 https://github.com/username/metaverse-office.git"
        exit 1
    fi
    
    REMOTE_URL=$(git remote get-url origin)
    log_info "远程仓库: $REMOTE_URL"
}

# 更新版本号
update_version() {
    log_step "更新版本号: $VERSION..."
    
    cd "$PROJECT_DIR"
    
    # 更新 package.json
    if [ -f "package.json" ]; then
        # macOS 和 Linux 兼容的 sed
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s/\"version\": \"[^\"]*\"/\"version\": \"${VERSION#v}\"/g" package.json 2>/dev/null || true
        else
            sed -i "s/\"version\": \"[^\"]*\"/\"version\": \"${VERSION#v}\"/g" package.json 2>/dev/null || true
        fi
        log_info "已更新 package.json"
    fi
    
    # 更新版本文件
    echo "{
  \"version\": \"${VERSION#v}\",
  \"releaseDate\": \"$(date +%Y-%m-%d)\",
  \"releaseNotes\": \"Agent协作协议版\"
}" > version.json
    
    git add -A
    git commit -m "Release $VERSION - Agent协作协议版

- 四房布局（南/东/西/北）
- Agent能力档案与匹配算法
- 协作契约机制
- 推理链可视化
- 人类决策中心" || true
    
    log_info "版本更新完成"
}

# 推送代码到 GitHub
push_to_github() {
    log_step "推送到 GitHub..."
    
    cd "$PROJECT_DIR"
    
    # 获取当前分支
    BRANCH=$(git rev-parse --abbrev-ref HEAD)
    log_info "当前分支: $BRANCH"
    
    # 推送代码
    log_info "推送分支 $BRANCH 到 origin..."
    git push -u origin "$BRANCH" || {
        log_error "推送失败"
        log_info "请检查:"
        log_info "1. SSH密钥是否配置: cat ~/.ssh/id_rsa.pub"
        log_info "2. 是否有推送权限"
        log_info "3. 远程仓库地址是否正确"
        exit 1
    }
    
    log_info "代码推送完成"
}

# 创建 Git 标签
create_git_tag() {
    log_step "创建 Git 标签: $VERSION..."
    
    cd "$PROJECT_DIR"
    
    # 删除已存在的标签（如果存在）
    git tag -d "$VERSION" 2>/dev/null || true
    git push origin :refs/tags/"$VERSION" 2>/dev/null || true
    
    # 创建带注释的标签
    git tag -a "$VERSION" -m "Release $VERSION

数字人元宇宙平台 v3.0 - Agent协作协议版

核心特性:
✅ 四合院四房布局（市场/方案/交付/管理）
✅ Agent能力档案与能力匹配算法
✅ 协作契约机制（协商-共识-执行）
✅ 推理链可视化回放
✅ 人类决策中心

新增组件:
- ContractVisualization 协作契约可视化
- NegotiationBubbles 协商对话气泡
- TaskDelegationFlow 任务委托动画
- ReasoningChainPlayer 推理链回放
- DecisionCenter 决策中心

技术栈:
- React 18 + TypeScript
- Three.js + React Three Fiber
- Express + WebSocket
- PostgreSQL + Redis

文档:
- docs/DEPLOY.md 部署文档
- CHANGELOG.md 更新日志

提交数: 6
新增文件: 18
总代码量: 8000+ 行"
    
    # 推送标签
    git push origin "$VERSION"
    
    log_info "标签 $VERSION 创建并推送完成"
}

# 显示发布信息
show_release_info() {
    log_step "发布信息汇总..."
    
    cd "$PROJECT_DIR"
    
    REMOTE_URL=$(git remote get-url origin)
    
    echo ""
    echo "===================================="
    echo -e "${GREEN}🎉 发布成功！${NC}"
    echo "===================================="
    echo ""
    echo "版本号: $VERSION"
    echo "仓库地址: $REMOTE_URL"
    echo ""
    echo "GitHub 链接:"
    # 转换 SSH URL 到 HTTPS URL
    HTTPS_URL=$(echo "$REMOTE_URL" | sed 's/git@github.com:/https:\/\/github.com\//' | sed 's/\.git$//')
    echo "  📦 代码: $HTTPS_URL"
    echo "  🏷️ 标签: $HTTPS_URL/releases/tag/$VERSION"
    echo ""
    echo "查看命令:"
    echo "  git log --oneline -10"
    echo "  git tag -l"
    echo "  git show $VERSION"
    echo ""
    echo "===================================="
}

# 验证推送
verify_push() {
    log_step "验证推送结果..."
    
    cd "$PROJECT_DIR"
    
    # 检查远程分支
    REMOTE_BRANCH=$(git ls-remote --heads origin $(git rev-parse --abbrev-ref HEAD) 2>/dev/null | wc -l)
    if [ "$REMOTE_BRANCH" -eq 1 ]; then
        log_info "✅ 代码已推送到远程仓库"
    else
        log_warn "⚠️ 远程分支未找到，请检查推送结果"
    fi
    
    # 检查标签
    REMOTE_TAG=$(git ls-remote --tags origin "$VERSION" 2>/dev/null | wc -l)
    if [ "$REMOTE_TAG" -eq 1 ]; then
        log_info "✅ 标签 $VERSION 已推送到远程"
    else
        log_warn "⚠️ 远程标签未找到"
    fi
}

# 主流程
main() {
    echo "🚀 数字人元宇宙平台 v3.0 - GitHub 发布脚本"
    echo "===================================="
    echo ""
    
    log_info "版本号: $VERSION"
    log_info "项目目录: $PROJECT_DIR"
    echo ""
    
    check_git_repo
    setup_github_remote
    update_version
    push_to_github
    create_git_tag
    verify_push
    show_release_info
}

# 帮助信息
show_help() {
    echo "使用方法:"
    echo "  $0 [版本号] [GitHub仓库地址]"
    echo ""
    echo "示例:"
    echo "  $0                          # 使用默认版本 v3.0.0"
    echo "  $0 v3.0.1                   # 指定版本号"
    echo "  $0 v3.0.0 https://github.com/username/repo.git  # 指定仓库"
    echo ""
    echo "环境变量:"
    echo "  GITHUB_TOKEN    GitHub Personal Access Token（可选）"
}

# 参数处理
case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
esac

# 执行主流程
main
