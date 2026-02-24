# Shorthand Guide - 简写指南

## 一句话总结
这是作者经过10个月日常使用总结出的 Claude Code 完整配置指南，涵盖 Skills、Hooks、Subagents、MCPs 和 Plugins 的实战经验。

> 原文来源：https://x.com/affaanmustafa/status/2012378465664745795
> 作者：Affaan Mustafa（Anthropic x Forum Ventures 黑客马拉松获胜者）

---

## 前言

我（作者）从2025年2月 Claude Code 实验性发布时就开始使用，在 Anthropic x Forum Ventures 黑客马拉松中与 @DRodriguezFX 一起完全使用 Claude Code 构建了 [zenith.chat](https://zenith.chat)，赢得了比赛和15,000美元的 Anthropic Credits。

以下是我在10个月日常使用中总结的完整配置。

---

## Skills（技能）

### 什么是 Skills？

Skills 就像是"规则"，但限定在特定的工作流程范围内。它们是执行特定工作流时的"提示词快捷方式"。

### 使用场景

- 用 Opus 4.5 编码了很长时间后，想清理死代码和多余的 .md 文件？运行 `/refactor-clean`
- 需要测试？使用 `/tdd`、`/e2e`、`/test-coverage`
- Skills 和 Commands 可以在单个提示词中**链式调用**

### 目录结构示例

```bash
~/.claude/skills/
├── pmx-guidelines.md      # 项目特定模式
├── coding-standards.md    # 语言最佳实践
├── tdd-workflow/          # 多文件技能（带 README.md）
└── security-review/       # 基于检查清单的技能
```

### 示例：Codemap 更新器

我可以创建一个在检查点更新 codemap 的技能 —— 让 Claude 快速导航代码库而不用在探索上消耗上下文。

---

## Commands（命令）

### Commands vs Skills

它们有重叠，但存储位置不同：

| 类型 | 位置 | 特点 |
|------|------|------|
| Skills | `~/.claude/skills/` | 更广泛的工作流定义 |
| Commands | `~/.claude/commands/` | 快速可执行的提示词 |

---

## Hooks（钩子）

### 什么是 Hooks？

Hooks 是基于触发器的自动化，在特定事件上触发。与 Skills 不同，它们限定在工具调用和生命周期事件上。

### Hook 类型

| 类型 | 触发时机 | 用途 |
|------|---------|------|
| PreToolUse | 工具执行前 | 验证、提醒 |
| PostToolUse | 工具完成后 | 格式化、反馈循环 |
| UserPromptSubmit | 你发送消息时 | 预处理 |
| Stop | Claude 完成响应时 | 清理、保存 |
| PreCompact | 上下文压缩前 | 保存重要状态 |
| Notification | 权限请求时 | 通知处理 |

### 示例：tmux 提醒

```json
{
  "PreToolUse": [
    {
      "matcher": "tool == \"Bash\" && tool_input.command matches \"(npm|pnpm|yarn|cargo|pytest)\"",
      "hooks": [
        {
          "type": "command",
          "command": "if [ -z \"$TMUX\" ]; then echo '[Hook] Consider tmux for session persistence' >&2; fi"
        }
      ]
    }
  ]
}
```

**效果**：当 Claude 准备运行长时间命令时，提醒你考虑使用 tmux。

### 专业提示

使用 `hookify` 插件来**对话式地创建 Hooks**，而不是手动编写 JSON。运行 `/hookify` 并描述你想要什么。

---

## Subagents（子代理）

### 什么是 Subagents？

Subagents 是你的主 Claude（协调者）可以委托任务的进程，它们有有限的范围。可以在后台或前台运行，为主代理释放上下文。

### 与 Skills 的配合

一个能够执行你部分技能的子代理可以被委托任务，并自主使用这些技能。它们也可以被沙箱化，具有特定的工具权限。

### 目录结构

```bash
~/.claude/agents/
├── planner.md              # 功能实现规划
├── architect.md            # 系统设计决策
├── tdd-guide.md            # 测试驱动开发
├── code-reviewer.md        # 质量/安全审查
├── security-reviewer.md    # 漏洞分析
├── build-error-resolver.md
├── e2e-runner.md
└── refactor-cleaner.md
```

**关键**：为每个子代理配置允许的工具、MCP 和权限，以进行适当的范围限制。

---

## Rules（规则）

### 两种方法

1. **单文件方法**：所有内容在一个文件中（用户级或项目级）
2. **规则文件夹**：按关注点分组的模块化 `.md` 文件

### 目录结构

```bash
~/.claude/rules/
├── security.md       # 无硬编码密钥、验证输入
├── coding-style.md   # 不可变性、文件组织
├── testing.md        # TDD 工作流、80% 覆盖率
├── git-workflow.md   # 提交格式、PR 流程
├── agents.md         # 何时委托给子代理
└── performance.md    # 模型选择、上下文管理
```

### 示例规则

- 代码库中不要使用 emoji
- 前端避免使用紫色调
- 部署前始终测试代码
- 优先考虑模块化代码而不是大文件
- 永远不要提交 console.logs

---

## MCPs（模型上下文协议）

### 什么是 MCP？

MCP 将 Claude 直接连接到外部服务。它不是 API 的替代品 —— 而是围绕 API 的提示词驱动包装器，允许在导航信息方面更灵活。

### 示例

Supabase MCP 让 Claude 直接拉取特定数据，运行 SQL 而无需复制粘贴。数据库、部署平台等也是如此。

### Chrome in Claude

这是一个内置的插件 MCP，让 Claude 自主控制你的浏览器 —— 点击查看事物是如何工作的。

---

## 关键：上下文窗口管理

### 为什么这很重要？

对你的 MCP 要**挑剔**。我把所有 MCP 放在用户配置中，但**禁用所有未使用的**。

- 导航到 `/plugins` 并向下滚动，或运行 `/mcp`
- 你200k的上下文窗口，如果启用了太多工具，压缩前可能只有70k
- 性能会显著下降

### 经验法则

**配置 20-30 个 MCP，但保持 < 10 个启用 / < 80 个工具激活**

---

## Plugins（插件）

### 什么是 Plugins？

插件将工具打包以便轻松安装，而不是繁琐的手动设置。一个插件可以是 skill + MCP 的组合，或者是捆绑在一起的 hooks/tools。

### 安装插件

```bash
# 添加市场
claude plugin marketplace add https://github.com/mixedbread-ai/mgrep

# 打开 Claude，运行 /plugins，找到新市场，从那里安装
```

### LSP 插件

如果你经常在编辑器之外运行 Claude Code，LSP 插件特别有用。语言服务器协议给 Claude 提供实时类型检查、转到定义和智能补全，无需打开 IDE。

```bash
# 已启用的插件示例
typescript-lsp@claude-plugins-official   # TypeScript 智能
pyright-lsp@claude-plugins-official      # Python 类型检查
hookify@claude-plugins-official          # 对话式创建 hooks
mgrep@Mixedbread-Grep                    # 比 ripgrep 更好的搜索
```

**同样的警告**：注意你的上下文窗口。

---

## 键盘快捷键

| 快捷键 | 功能 |
|--------|------|
| Ctrl+U | 删除整行（比退格键快） |
| ! | 快速 bash 命令前缀 |
| @ | 搜索文件 |
| / | 启动斜杠命令 |
| Shift+Enter | 多行输入 |
| Tab | 切换思考显示 |
| Esc Esc | 中断 Claude / 恢复代码 |

---

## 并行工作流

### /fork

分支对话以并行执行非重叠任务，而不是发送排队的消息。

### Git Worktrees

对于有重叠的并行 Claude 而没有冲突。每个 worktree 是一个独立的检出。

```bash
git worktree add ../feature-branch feature-branch
# 现在在每个 worktree 中运行独立的 Claude 实例
```

### tmux 用于长时间运行的命令

流式传输和监视 Claude 运行的日志/bash 进程。

```bash
tmux new -s dev
# Claude 在这里运行命令，你可以分离和重新连接
tmux attach -t dev
```

### mgrep > grep

`mgrep` 是对 ripgrep/grep 的重大改进。通过插件市场安装，然后使用 `/mgrep` skill。支持本地搜索和网页搜索。

```bash
mgrep "function handleSubmit"        # 本地搜索
mgrep --web "Next.js 15 app router changes"  # 网页搜索
```

---

## 其他有用的命令

| 命令 | 功能 |
|------|------|
| /rewind | 回到之前的状态 |
| /statusline | 用分支、上下文 %、todos 自定义 |
| /checkpoints | 文件级撤销点 |
| /compact | 手动触发上下文压缩 |

---

## GitHub Actions CI/CD

在你的 PR 上设置代码审查与 GitHub Actions。配置后，Claude 可以自动审查 PR。

---

## 沙箱

使用沙箱模式进行有风险的操作 —— Claude 在受限环境中运行，不影响你的实际系统。

**危险操作**：使用 `--dangerously-skip-permissions` 让 Claude 自由漫游，如果不小心可能会造成破坏。

---

## 编辑器集成

虽然不需要编辑器，但它可以对 Claude Code 工作流产生积极或消极的影响。

### Zed（作者的选择）

一个基于 Rust 的编辑器，轻量、快速、高度可定制。

**为什么 Zed 与 Claude Code 配合得好：**
- **Agent Panel Integration** - Zed 的 Claude 集成让你实时跟踪 Claude 编辑的文件变化
- **性能** - 用 Rust 编写，瞬间打开，无延迟地处理大型代码库
- **CMD+Shift+R Command Palette** - 快速访问所有自定义斜杠命令
- **最小资源使用** - 不会在繁重操作期间与 Claude 竞争系统资源
- **Vim Mode** - 如果你喜欢的话，有完整的 vim 键绑定

**设置建议：**
1. 分屏 - 一边是带 Claude Code 的终端，另一边是编辑器
2. Ctrl + G - 快速在 Zed 中打开 Claude 当前正在处理的文件
3. 自动保存 - 启用自动保存，让 Claude 的文件读取始终是当前的
4. Git 集成 - 使用编辑器的 git 功能在提交前审查 Claude 的更改
5. 文件监视器 - 大多数编辑器自动重新加载更改的文件，验证已启用

### VSCode / Cursor

这也是一个可行的选择，与 Claude Code 配合良好。你可以使用终端格式，使用 `\ide` 与编辑器自动同步并启用 LSP 功能。或者你可以选择扩展，它与编辑器更集成，有匹配的 UI。

---

## 作者的插件配置

（通常只启用 4-5 个）

```markdown
ralph-wiggum@claude-code-plugins          # 循环自动化
frontend-design@claude-code-plugins       # UI/UX 模式
commit-commands@claude-code-plugins       # Git 工作流
security-guidance@claude-code-plugins     # 安全检查
pr-review-toolkit@claude-code-plugins     # PR 自动化
typescript-lsp@claude-plugins-official    # TS 智能
hookify@claude-plugins-official           # Hook 创建
code-simplifier@claude-plugins-official
feature-dev@claude-code-plugins
explanatory-output-style@claude-code-plugins
code-review@claude-code-plugins
context7@claude-plugins-official          # 实时文档
pyright-lsp@claude-plugins-official       # Python 类型
mgrep@Mixedbread-Grep                     # 更好的搜索
```

---

## 作者的 MCP 服务器配置

### 用户级别

```json
{
  "github": { "command": "npx", "args": ["-y", "@modelcontextprotocol/server-github"] },
  "firecrawl": { "command": "npx", "args": ["-y", "firecrawl-mcp"] },
  "supabase": {
    "command": "npx",
    "args": ["-y", "@supabase/mcp-server-supabase@latest", "--project-ref=YOUR_REF"]
  },
  "memory": { "command": "npx", "args": ["-y", "@modelcontextprotocol/server-memory"] },
  "sequential-thinking": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
  },
  "vercel": { "type": "http", "url": "https://mcp.vercel.com" },
  "railway": { "command": "npx", "args": ["-y", "@railway/mcp-server"] },
  "cloudflare-docs": { "type": "http", "url": "https://docs.mcp.cloudflare.com/mcp" },
  "cloudflare-workers-bindings": { "type": "http", "url": "https://bindings.mcp.cloudflare.com/mcp" },
  "cloudflare-workers-builds": { "type": "http", "url": "https://builds.mcp.cloudflare.com/mcp" },
  "cloudflare-observability": { "type": "http", "url": "https://observability.mcp.cloudflare.com/mcp" },
  "clickhouse": { "type": "http", "url": "https://mcp.clickhouse.cloud/mcp" },
  "AbletonMCP": { "command": "uvx", "args": ["ableton-mcp"] },
  "magic": { "command": "npx", "args": ["-y", "@magicuidesign/mcp@latest"] }
}
```

### 按项目禁用（上下文窗口管理）

```markdown
# 在 ~/.claude.json 的 projects.[path].disabledMcpServers 下
disabledMcpServers: [
  "playwright",
  "cloudflare-workers-builds",
  "cloudflare-workers-bindings",
  "cloudflare-observability",
  "cloudflare-docs",
  "clickhouse",
  "AbletonMCP",
  "context7",
  "magic"
]
```

**关键点**：我配置了 14 个 MCP，但每个项目只启用约 5-6 个。保持上下文窗口健康。

---

## 作者的关键 Hooks

```json
{
  "PreToolUse": [
    // 长时间运行命令的 tmux 提醒
    { "matcher": "npm|pnpm|yarn|cargo|pytest", "hooks": ["tmux reminder"] },
    // 阻止不必要的 .md 文件创建
    { "matcher": "Write && .md file", "hooks": ["block unless README/CLAUDE"] },
    // git push 前审查
    { "matcher": "git push", "hooks": ["open editor for review"] }
  ],
  "PostToolUse": [
    // 用 Prettier 自动格式化 JS/TS
    { "matcher": "Edit && .ts/.tsx/.js/.jsx", "hooks": ["prettier --write"] },
    // 编辑后 TypeScript 检查
    { "matcher": "Edit && .ts/.tsx", "hooks": ["tsc --noEmit"] },
    // 警告 console.log
    { "matcher": "Edit", "hooks": ["grep console.log warning"] }
  ],
  "Stop": [
    // 会话结束前审计 console.logs
    { "matcher": "*", "hooks": ["check modified files for console.log"] }
  ]
}
```

---

## 自定义状态栏

显示用户、目录、git 分支（带 dirty 指示器）、剩余上下文 %、模型、时间和 todo 数量。

---

## 作者的规则结构

```markdown
~/.claude/rules/
├── security.md       # 强制安全检查
├── coding-style.md   # 不可变性、文件大小限制
├── testing.md        # TDD、80% 覆盖率
├── git-workflow.md   # 约定式提交
├── agents.md         # 子代理委托规则
├── patterns.md       # API 响应格式
├── performance.md    # 模型选择（Haiku vs Sonnet vs Opus）
└── hooks.md          # Hook 文档
```

---

## 作者的子代理结构

```markdown
~/.claude/agents/
├── planner.md            # 分解功能
├── architect.md          # 系统设计
├── tdd-guide.md          # 先写测试
├── code-reviewer.md      # 质量审查
├── security-reviewer.md  # 漏洞扫描
├── build-error-resolver.md
├── e2e-runner.md         # Playwright 测试
├── refactor-cleaner.md   # 死代码删除
└── doc-updater.md        # 保持文档同步
```

---

## 总结：5 个关键原则

1. **不要过度复杂化** - 把配置当作微调，而不是架构
2. **上下文窗口很珍贵** - 禁用未使用的 MCP 和插件
3. **并行执行** - 分支对话，使用 git worktrees
4. **自动化重复工作** - 用 hooks 做格式化、linting、提醒
5. **限定你的子代理** - 有限的工具 = 专注的执行

---

## 相关链接

- **GitHub 仓库**：https://github.com/affaan-m/everything-claude-code
- **作者 Twitter**：@affaanmustafa
- **长篇指南**：深入技术（Token 优化、记忆持久化、评估等）
