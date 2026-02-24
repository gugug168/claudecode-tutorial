# MCP 服务器配置详解

<!--
╔══════════════════════════════════════════════════════════════════╗
║  【教学概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  MCP 是什么：Model Context Protocol，让 Claude 连接外部工具和服务  ║
║  有什么用：扩展 Claude 能力，访问数据库、API、文件系统等           ║
║  核心配置：mcpServers 配置块，定义服务器连接方式                   ║
╚══════════════════════════════════════════════════════════════════╝
-->

MCP (Model Context Protocol) 让 Claude Code 能够连接外部工具和服务，大大扩展其能力。

## 配置位置

MCP 配置放在 `~/.claude.json` 文件的 `mcpServers` 部分：

```json
{
  "mcpServers": {
    "服务器名称": {
      "command": "启动命令",
      "args": ["参数"],
      "env": {
        "环境变量": "值"
      }
    }
  }
}
```

---

## 推荐的 MCP 服务器

### 1. GitHub - GitHub 操作

```json
"github": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-github"],
  "env": {
    "GITHUB_PERSONAL_ACCESS_TOKEN": "你的_GitHub_令牌"
  },
  "description": "GitHub 操作 - PR、issue、仓库管理"
}
```

**用途**：
- 创建和管理 PR
- 查看 issue
- 仓库操作

**获取令牌**：GitHub Settings → Developer settings → Personal access tokens

---

### 2. Firecrawl - 网页抓取

```json
"firecrawl": {
  "command": "npx",
  "args": ["-y", "firecrawl-mcp"],
  "env": {
    "FIRECRAWL_API_KEY": "你的_Firecrawl_密钥"
  },
  "description": "网页抓取和爬虫"
}
```

**用途**：
- 抓取网页内容
- 批量爬取网站

---

### 3. Supabase - 数据库操作

```json
"supabase": {
  "command": "npx",
  "args": ["-y", "@supabase/mcp-server-supabase@latest", "--project-ref=你的项目ID"],
  "description": "Supabase 数据库操作"
}
```

**用途**：
- 数据库查询
- 表管理
- 用户管理

---

### 4. Memory - 持久记忆

```json
"memory": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-memory"],
  "description": "跨会话持久记忆"
}
```

**用途**：
- 在会话之间记住信息
- 存储用户偏好
- 记录项目知识

---

### 5. Sequential Thinking - 链式思考

```json
"sequential-thinking": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"],
  "description": "链式推理思考"
}
```

**用途**：
- 复杂问题分解
- 步骤化推理

---

### 6. Vercel - 部署管理

```json
"vercel": {
  "type": "http",
  "url": "https://mcp.vercel.com",
  "description": "Vercel 部署和项目管理"
}
```

**用途**：
- 部署管理
- 项目配置

---

### 7. Cloudflare - Cloudflare 服务

```json
"cloudflare-docs": {
  "type": "http",
  "url": "https://docs.mcp.cloudflare.com/mcp",
  "description": "Cloudflare 文档搜索"
},
"cloudflare-workers-builds": {
  "type": "http",
  "url": "https://builds.mcp.cloudflare.com/mcp",
  "description": "Cloudflare Workers 构建"
}
```

**用途**：
- 搜索文档
- Workers 管理

---

### 8. ClickHouse - 分析数据库

```json
"clickhouse": {
  "type": "http",
  "url": "https://mcp.clickhouse.cloud/mcp",
  "description": "ClickHouse 分析查询"
}
```

**用途**：
- 大数据分析
- SQL 查询

---

### 9. Context7 - 实时文档

```json
"context7": {
  "command": "npx",
  "args": ["-y", "@context7/mcp-server"],
  "description": "实时文档查询"
}
```

**用途**：
- 获取最新库文档
- 查询 API 说明

---

### 10. Magic UI - UI 组件

```json
"magic": {
  "command": "npx",
  "args": ["-y", "@magicuidesign/mcp@latest"],
  "description": "Magic UI 组件"
}
```

**用途**：
- 生成 UI 组件
- 设计辅助

---

### 11. Filesystem - 文件系统

```json
"filesystem": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/your/projects"],
  "description": "文件系统操作（设置你的路径）"
}
```

**用途**：
- 文件读写
- 目录管理

---

## MCP 服务器类型

### 命令型（command）

通过命令行启动：

```json
{
  "command": "npx",
  "args": ["-y", "包名"],
  "env": {
    "API_KEY": "密钥"
  }
}
```

### HTTP 型（type: http）

通过 HTTP 连接：

```json
{
  "type": "http",
  "url": "https://mcp.example.com/mcp"
}
```

---

## 重要注意事项

### 1. 环境变量

将 `YOUR_*_HERE` 占位符替换为实际值：

```json
// ❌ 错误
"GITHUB_PERSONAL_ACCESS_TOKEN": "YOUR_GITHUB_PAT_HERE"

// ✅ 正确
"GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_xxxxxxxxxxxx"
```

### 2. 上下文限制

**保持启用的 MCP 服务器 < 10 个**，以保留上下文窗口。

```json
"_comments": {
  "context_warning": "保持启用的 MCP 服务器 < 10 个以保留上下文窗口"
}
```

### 3. 禁用特定服务器

使用 `disabledMcpServers` 数组按项目禁用：

```json
{
  "disabledMcpServers": ["firecrawl", "clickhouse"]
}
```

---

## 完整配置示例

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_your_token"
      }
    },
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    },
    "context7": {
      "command": "npx",
      "args": ["-y", "@context7/mcp-server"]
    }
  },
  "disabledMcpServers": []
}
```

---

## 故障排除

### MCP 服务器无法启动

1. 确保安装了 Node.js 18+
2. 检查环境变量是否正确
3. 尝试手动运行命令：`npx -y @modelcontextprotocol/server-github`

### 上下文窗口不足

减少启用的 MCP 服务器数量，禁用不常用的。

### 连接超时

检查网络连接，某些服务可能需要代理。
