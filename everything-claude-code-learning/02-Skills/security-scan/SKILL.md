---
name: security-scan
description: 使用 AgentShield 扫描你的 Claude Code 配置（.claude/ 目录），检查安全漏洞、配置错误和注入风险。检查 CLAUDE.md、settings.json、MCP 服务器、hooks 和代理定义。
---

# Security Scan Skill（安全扫描技能）

<!--
【教学说明】
这个技能使用 AgentShield 工具自动检查你的 Claude Code 配置文件是否存在安全问题。
就像杀毒软件扫描电脑一样，AgentShield 扫描你的 AI 配置。
-->

使用 [AgentShield](https://github.com/affaan-m/agentshield) 审计你的 Claude Code 配置安全问题。

## 何时激活此技能

- 设置新的 Claude Code 项目时
- 修改 `.claude/settings.json`、`CLAUDE.md` 或 MCP 配置后
- 提交配置更改前
- 加入有现有 Claude Code 配置的新仓库时
- 定期安全卫生检查

## 扫描内容和检查项

| 文件 | 检查内容 |
|------|---------|
| `CLAUDE.md` | 硬编码的密钥、自动运行指令、提示注入模式 |
| `settings.json` | 过于宽松的允许列表、缺少拒绝列表、危险的绕过标志 |
| `mcp.json` | 危险的 MCP 服务器、硬编码的环境密钥、npx 供应链风险 |
| `hooks/` | 通过插值的命令注入、数据泄露、静默错误抑制 |
| `agents/*.md` | 不受限制的工具访问、提示注入面、缺少模型规格 |

<!--
【教学说明】
这些文件控制 AI 如何工作。如果它们被恶意配置，AI 可能会被诱导执行危险操作。
-->

## 先决条件

必须安装 AgentShield。检查并安装（如果需要）：

```bash
# 检查是否已安装
npx ecc-agentshield --version

# 全局安装（推荐）
npm install -g ecc-agentshield

# 或直接通过 npx 运行（无需安装）
npx ecc-agentshield scan .
```

**什么是 npx？** 它是 npm 的包运行器，可以直接运行包而无需安装。

## 用法

### 基本扫描

针对当前项目的 `.claude/` 目录运行：

```bash
# 扫描当前项目
npx ecc-agentshield scan

# 扫描特定路径
npx ecc-agentshield scan --path /path/to/.claude

# 使用最小严重性过滤器扫描
npx ecc-agentshield scan --min-severity medium
```

**什么是严重性级别？** 它表示问题的危险程度——critical（严重）> high（高）> medium（中）> low（低）。

### 输出格式

```bash
# 终端输出（默认）——带评分的彩色报告
npx ecc-agentshield scan

# JSON ——用于 CI/CD 集成
npx ecc-agentshield scan --format json

# Markdown ——用于文档
npx ecc-agentshield scan --format markdown

# HTML ——自包含的深色主题报告
npx ecc-agentshield scan --format html > security-report.html
```

**为什么有多种格式？** 不同场景需要不同格式——终端适合人看，JSON 适合机器处理。

### 自动修复

自动应用安全修复（只修复标记为可自动修复的）：

```bash
npx ecc-agentshield scan --fix
```

这将：
- 用环境变量引用替换硬编码密钥
- 将通配符权限收紧为范围限定的替代方案
- 永不修改仅限手动的建议

**注意：** `--fix` 只修复安全的问题，不会破坏你的配置。

### Opus 4.6 深度分析

运行对抗性三代理管道进行更深入的分析：

```bash
# 需要 ANTHROPIC_API_KEY
export ANTHROPIC_API_KEY=your-key
npx ecc-agentshield scan --opus --stream
```

这运行：
1. **攻击者（红队）** ——找出攻击向量
2. **防御者（蓝队）** ——推荐加固措施
3. **审计员（最终裁决）** ——综合两种观点

**什么是对抗性分析？** 三个 AI 模拟攻击者和防御者，找出更多潜在问题。

### 初始化安全配置

从头搭建新的安全 `.claude/` 配置：

```bash
npx ecc-agentshield init
```

创建：
- `settings.json` ——带范围权限和拒绝列表
- `CLAUDE.md` ——带安全最佳实践
- `mcp.json` ——占位符

**为什么使用 init？** 它给你一个安全的起点，避免常见错误。

### GitHub Action

添加到你的 CI 管道：

```yaml
- uses: affaan-m/agentshield@v1
  with:
    path: '.'
    min-severity: 'medium'
    fail-on-findings: true
```

**什么是 CI 管道？** 持续集成——每次提交代码时自动运行的测试。

## 严重级别

| 等级 | 分数 | 含义 |
|------|------|------|
| A | 90-100 | 安全配置 |
| B | 75-89 | 小问题 |
| C | 60-74 | 需要关注 |
| D | 40-59 | 重大风险 |
| F | 0-39 | 严重漏洞 |

**评分系统：** 像学校成绩一样，A 是最好，F 是不及格。

## 解读结果

### 关键发现（立即修复）

- 配置文件中硬编码的 API 密钥或令牌
- 允许列表中的 `Bash(*)`（不受限制的 shell 访问）
- 通过 `${file}` 插值在 hooks 中的命令注入
- 运行 shell 的 MCP 服务器

**为什么关键？** 这些问题让攻击者完全控制你的系统。

### 高危发现（生产前修复）

- CLAUDE.md 中的自动运行指令（提示注入向量）
- 权限中缺少拒绝列表
- 代理有不必要的 Bash 访问权限

**为什么高危？** 这些问题可能导致数据泄露或系统损坏。

### 中等发现（推荐）

- hooks 中的静默错误抑制（`2>/dev/null`、`|| true`）
- 缺少 PreToolUse 安全 hooks
- MCP 服务器配置中的 `npx -y` 自动安装

**为什么中等？** 这些是最佳实践问题，不会立即造成危险。

### 信息级发现（了解）

- MCP 服务器缺少描述
- 正确标记为良好实践的禁止性指令

**为什么信息级？** 这些是提醒，帮助你改进配置。

## 链接

- **GitHub**: [github.com/affaan-m/agentshield](https://github.com/affaan-m/agentshield)
- **npm**: [npmjs.com/package/ecc-agentshield](https://www.npmjs.com/package/ecc-agentshield)

---

**记住**：安全扫描应该定期运行，就像定期体检一样。
