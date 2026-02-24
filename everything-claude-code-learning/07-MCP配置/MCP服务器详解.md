# MCP 服务器详解

## 一句话总结
MCP（Model Context Protocol）让 Claude 能够直接连接外部服务，像使用工具一样操作 GitHub、数据库、部署平台等。

---

## 它是什么？（小白视角）

### 用一个比喻来理解

想象 Claude 是一个住在盒子里的人，他能阅读文件、写代码，但无法直接"看到"外面的世界。

**MCP 就像是给 Claude 装上的"遥控器"：**

- 没有 MCP：你告诉 Claude "帮我去 GitHub 创建一个 PR"，Claude 只能告诉你怎么做，但无法真的帮你执行
- 有了 MCP：Claude 直接拿起"GitHub 遥控器"，帮你完成操作，就像你亲自操作一样

### MCP 的本质

MCP 不是什么魔法，它本质上是一个**标准化的接口协议**：

```
Claude Code ──→ MCP Server ──→ 外部服务（GitHub/Supabase/Vercel等）
     ↑              │
     └──────────────┘
       返回结果
```

---

## 两种 MCP 类型

### 类型一：NPX 类型（本地运行）

通过 `npx` 命令在本地启动一个服务器进程。

```json
{
  "github": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-github"],
    "env": {
      "GITHUB_PERSONAL_ACCESS_TOKEN": "你的密钥"
    }
  }
}
```

**优点**：灵活、可自定义、适合开发调试
**缺点**：需要本地安装 Node.js，启动稍慢

### 类型二：HTTP 类型（远程服务）

直接连接到一个远程 HTTP 端点。

```json
{
  "vercel": {
    "type": "http",
    "url": "https://mcp.vercel.com"
  }
}
```

**优点**：无需本地配置、启动快、资源占用少
**缺点**：依赖网络、功能可能受限

---

## 15 个 MCP 服务器详解

### 1. GitHub（代码托管）

```json
"github": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-github"],
  "env": {
    "GITHUB_PERSONAL_ACCESS_TOKEN": "YOUR_GITHUB_PAT_HERE"
  },
  "description": "GitHub 操作 - PR、issue、仓库"
}
```

**它能做什么：**
- 创建、查看、合并 Pull Request
- 创建和管理 Issues
- 查看仓库信息和文件
- 管理分支
- 查看提交历史

**什么时候用：**
- 需要让 Claude 帮你管理 GitHub 项目
- 自动化 PR 审查和合并
- 批量处理 Issues

**获取密钥：** GitHub Settings → Developer settings → Personal access tokens

---

### 2. Firecrawl（网页抓取）

```json
"firecrawl": {
  "command": "npx",
  "args": ["-y", "firecrawl-mcp"],
  "env": {
    "FIRECRAWL_API_KEY": "YOUR_FIRECRAWL_KEY_HERE"
  },
  "description": "网页抓取和爬取"
}
```

**它能做什么：**
- 将网页转换为 Markdown 格式
- 批量爬取整个网站
- 提取网页中的结构化数据
- 支持动态渲染的页面

**什么时候用：**
- 需要读取某个网页的内容
- 需要爬取文档网站
- 提取网页中的数据

**获取密钥：** https://firecrawl.dev 注册后获取 API Key

---

### 3. Supabase（数据库）

```json
"supabase": {
  "command": "npx",
  "args": ["-y", "@supabase/mcp-server-supabase@latest", "--project-ref=YOUR_PROJECT_REF"],
  "description": "Supabase 数据库操作"
}
```

**它能做什么：**
- 直接查询和操作数据库
- 查看表结构和数据
- 执行 SQL 语句
- 管理 Row Level Security

**什么时候用：**
- 使用 Supabase 作为后端的项目
- 需要让 Claude 直接查询数据
- 数据库调试和维护

**获取项目 ID：** Supabase Dashboard → Project Settings → General

---

### 4. Memory（记忆持久化）

```json
"memory": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-memory"],
  "description": "跨会话持久化记忆"
}
```

**它能做什么：**
- 在多个会话之间保存记忆
- 存储重要信息和上下文
- 类似"长期记忆"功能

**什么时候用：**
- 希望 Claude 记住你的偏好
- 跨项目共享上下文
- 构建个人知识库

**注意：** 这是官方提供的简单记忆服务，功能相对基础

---

### 5. Sequential Thinking（链式思维）

```json
"sequential-thinking": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"],
  "description": "链式思维推理"
}
```

**它能做什么：**
- 帮助 Claude 进行更深入的思考
- 分步骤推理复杂问题
- 提供思考过程的可见性

**什么时候用：**
- 处理复杂的逻辑问题
- 需要详细的推理过程
- 数学证明或算法设计

---

### 6. Vercel（部署平台）

```json
"vercel": {
  "type": "http",
  "url": "https://mcp.vercel.com",
  "description": "Vercel 部署和项目"
}
```

**它能做什么：**
- 查看和管理 Vercel 项目
- 触发部署
- 查看部署状态和日志
- 管理环境变量

**什么时候用：**
- 使用 Vercel 部署的项目
- 自动化部署流程
- 查看部署问题

**注意：** HTTP 类型，首次使用需要在浏览器中授权

---

### 7. Railway（部署平台）

```json
"railway": {
  "command": "npx",
  "args": ["-y", "@railway/mcp-server"],
  "description": "Railway 部署"
}
```

**它能做什么：**
- 管理 Railway 项目和服务
- 查看部署状态
- 管理环境变量
- 查看日志

**什么时候用：**
- 使用 Railway 部署的项目
- 后端服务部署管理

---

### 8. Cloudflare Docs（文档搜索）

```json
"cloudflare-docs": {
  "type": "http",
  "url": "https://docs.mcp.cloudflare.com/mcp",
  "description": "Cloudflare 文档搜索"
}
```

**它能做什么：**
- 搜索 Cloudflare 文档
- 获取最新的 API 信息
- 查询配置选项

**什么时候用：**
- 使用 Cloudflare 产品（Workers、R2、D1 等）
- 需要查阅 Cloudflare 文档

---

### 9. Cloudflare Workers Builds（构建）

```json
"cloudflare-workers-builds": {
  "type": "http",
  "url": "https://builds.mcp.cloudflare.com/mcp",
  "description": "Cloudflare Workers 构建"
}
```

**它能做什么：**
- 管理 Workers 构建过程
- 查看构建日志
- 诊断构建问题

---

### 10. Cloudflare Workers Bindings（绑定）

```json
"cloudflare-workers-bindings": {
  "type": "http",
  "url": "https://bindings.mcp.cloudflare.com/mcp",
  "description": "Cloudflare Workers 绑定"
}
```

**它能做什么：**
- 管理 Workers 的环境绑定
- 配置 KV、R2、D1 等资源
- 管理密钥和变量

---

### 11. Cloudflare Observability（可观测性）

```json
"cloudflare-observability": {
  "type": "http",
  "url": "https://observability.mcp.cloudflare.com/mcp",
  "description": "Cloudflare 可观测性/日志"
}
```

**它能做什么：**
- 查看 Workers 日志
- 监控性能指标
- 诊断运行时问题

---

### 12. ClickHouse（分析数据库）

```json
"clickhouse": {
  "type": "http",
  "url": "https://mcp.clickhouse.cloud/mcp",
  "description": "ClickHouse 分析查询"
}
```

**它能做什么：**
- 执行 ClickHouse SQL 查询
- 分析大数据
- 生成报告

**什么时候用：**
- 使用 ClickHouse 作为数据仓库
- 需要进行数据分析

---

### 13. Context7（实时文档）

```json
"context7": {
  "command": "npx",
  "args": ["-y", "@context7/mcp-server"],
  "description": "实时文档查询"
}
```

**它能做什么：**
- 获取各种库的最新文档
- 查询 API 参考
- 获取代码示例

**什么时候用：**
- 需要查阅某个库的文档
- Claude 使用的知识可能过时
- 需要最新的 API 信息

---

### 14. Magic（UI 组件）

```json
"magic": {
  "command": "npx",
  "args": ["-y", "@magicuidesign/mcp@latest"],
  "description": "Magic UI 组件"
}
```

**它能做什么：**
- 生成漂亮的 UI 组件
- 基于设计稿生成代码
- 快速原型开发

**什么时候用：**
- 需要快速生成 UI
- 前端原型开发

---

### 15. Filesystem（文件系统）

```json
"filesystem": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/your/projects"],
  "description": "文件系统操作（设置你的路径）"
}
```

**它能做什么：**
- 在指定目录中读写文件
- 创建、删除、移动文件
- 搜索文件内容

**什么时候用：**
- 需要让 Claude 访问特定目录
- 批量文件操作

**注意：** 需要将 `/path/to/your/projects` 替换为你的实际项目路径

---

## 配置位置

### 用户级别配置（全局）

在 `~/.claude.json` 文件中：

```json
{
  "mcpServers": {
    "github": { ... },
    "supabase": { ... }
  }
}
```

**适用场景：** 所有项目都能使用的 MCP

### 项目级别配置

在项目根目录的 `.claude.json` 文件中：

```json
{
  "mcpServers": {
    "project-specific-mcp": { ... }
  }
}
```

**适用场景：** 仅当前项目使用的 MCP

---

## 重要：上下文窗口管理

### 为什么这很重要？

每个 MCP 服务器都会添加"工具描述"到 Claude 的系统提示中：

```
200k 总上下文
- 系统提示 ~18k
- MCP 工具描述 每个 1-5k
- 会话内容 剩余空间
```

### 最佳实践

**规则：配置 20-30 个，但只启用 5-10 个**

```json
// 在项目配置中禁用不需要的 MCP
{
  "disabledMcpServers": [
    "cloudflare-workers-builds",
    "cloudflare-workers-bindings",
    "cloudflare-observability",
    "cloudflare-docs",
    "clickhouse",
    "magic"
  ]
}
```

### 如何管理

1. **查看当前状态**：输入 `/plugins` 或 `/mcp`
2. **按需启用**：只启用当前任务需要的 MCP
3. **定期清理**：删除不再使用的 MCP 配置

---

## 安装步骤

### 步骤 1：编辑配置文件

```bash
# 打开配置文件
code ~/.claude.json
```

### 步骤 2：添加 MCP 服务器

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_xxxxxxxxxxxx"
      }
    }
  }
}
```

### 步骤 3：重启 Claude Code

关闭并重新启动 Claude Code，新的 MCP 会自动加载。

### 步骤 4：验证

输入 `/mcp` 查看已安装的 MCP 服务器列表。

---

## 故障排除

### MCP 无法启动

**可能原因：**
1. 没有安装 Node.js
2. 网络问题（无法下载 npx 包）
3. API 密钥无效

**解决方法：**
```bash
# 检查 Node.js
node --version

# 手动测试 MCP
npx -y @modelcontextprotocol/server-github
```

### 环境变量问题

**症状**：MCP 启动但功能不正常

**解决方法**：
- 确保 API 密钥正确
- 检查环境变量名称是否正确
- 确认密钥有足够的权限

### 上下文窗口太小

**症状**：Claude 响应变慢或质量下降

**解决方法**：
- 减少启用的 MCP 数量
- 禁用不常用的 MCP
- 使用 `disabledMcpServers` 管理项目级别的禁用

---

## 总结

| MCP | 用途 | 类型 | 推荐指数 |
|-----|------|------|----------|
| github | GitHub 操作 | npx | ★★★★★ |
| supabase | 数据库操作 | npx | ★★★★☆ |
| memory | 跨会话记忆 | npx | ★★★☆☆ |
| context7 | 实时文档 | npx | ★★★★★ |
| vercel | Vercel 部署 | http | ★★★★☆ |
| firecrawl | 网页抓取 | npx | ★★★☆☆ |
| filesystem | 文件操作 | npx | ★★★☆☆ |
| cloudflare-* | Cloudflare 全套 | http | ★★★☆☆ |
| clickhouse | 数据分析 | http | ★★☆☆☆ |
| magic | UI 生成 | npx | ★★★☆☆ |

**记住：** 配置很多，但要克制。只启用你真正需要的 MCP！
