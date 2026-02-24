<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个技能是做什么的：使用 AgentShield 扫描 Claude Code 配置安全     ║
║  什么时候用它：设置新项目、修改配置文件、提交前检查、定期安全检查   ║
║  核心能力：配置扫描、漏洞检测、自动修复、CI/CD集成                 ║
╚══════════════════════════════════════════════════════════════════╝
-->

---
name: security-scan
description: Scan your Claude Code configuration (.claude/ directory) for security vulnerabilities, misconfigurations, and injection risks using AgentShield. Checks CLAUDE.md, settings.json, MCP servers, hooks, and agent definitions.
---

# Security Scan Skill

<!--
【说明】使用 AgentShield 审计 Claude Code 配置安全问题。
项目地址：https://github.com/affaan-m/agentshield
-->
Audit your Claude Code configuration for security issues using [AgentShield](https://github.com/affaan-m/agentshield).

<!--
【说明】何时激活此技能：
- 设置新的 Claude Code 项目
- 修改 `.claude/settings.json`、`CLAUDE.md` 或 MCP 配置后
- 提交配置更改前
- 加入有现有 Claude Code 配置的新仓库时
- 定期安全卫生检查
-->
## When to Activate

- Setting up a new Claude Code project
- After modifying `.claude/settings.json`, `CLAUDE.md`, or MCP configs
- Before committing configuration changes
- When onboarding to a new repository with existing Claude Code configs
- Periodic security hygiene checks

<!--
【说明】扫描内容和检查项：
- CLAUDE.md：硬编码密钥、自动运行指令、提示注入模式
- settings.json：过于宽松的允许列表、缺少拒绝列表、危险的绕过标志
- mcp.json：危险的 MCP 服务器、硬编码的环境密钥、npx 供应链风险
- hooks/：通过插值的命令注入、数据泄露、静默错误抑制
- agents/*.md：不受限制的工具访问、提示注入面、缺少模型规格
-->
## What It Scans

| File | Checks |
|------|--------|
| `CLAUDE.md` | Hardcoded secrets, auto-run instructions, prompt injection patterns |
| `settings.json` | Overly permissive allow lists, missing deny lists, dangerous bypass flags |
| `mcp.json` | Risky MCP servers, hardcoded env secrets, npx supply chain risks |
| `hooks/` | Command injection via interpolation, data exfiltration, silent error suppression |
| `agents/*.md` | Unrestricted tool access, prompt injection surface, missing model specs |

<!--
【说明】先决条件：需要安装 AgentShield
-->
## Prerequisites

AgentShield must be installed. Check and install if needed:

```bash
# Check if installed
npx ecc-agentshield --version

# Install globally (recommended)
npm install -g ecc-agentshield

# Or run directly via npx (no install needed)
npx ecc-agentshield scan .
```

<!--
【说明】用法：基本扫描、输出格式、自动修复、Opus 4.6 深度分析、初始化安全配置、GitHub Action
-->
## Usage

<!--
【说明】基本扫描
-->
### Basic Scan

Run against the current project's `.claude/` directory:

```bash
# Scan current project
npx ecc-agentshield scan

# Scan a specific path
npx ecc-agentshield scan --path /path/to/.claude

# Scan with minimum severity filter
npx ecc-agentshield scan --min-severity medium
```

<!--
【说明】输出格式：
- 终端输出（默认）：带评分的彩色报告
- JSON：用于 CI/CD 集成
- Markdown：用于文档
- HTML：自包含的深色主题报告
-->
### Output Formats

```bash
# Terminal output (default) — colored report with grade
npx ecc-agentshield scan

# JSON — for CI/CD integration
npx ecc-agentshield scan --format json

# Markdown — for documentation
npx ecc-agentshield scan --format markdown

# HTML — self-contained dark-theme report
npx ecc-agentshield scan --format html > security-report.html
```

<!--
【说明】自动修复：自动应用安全修复（只修复标记为可自动修复的）
- 用环境变量引用替换硬编码密钥
- 将通配符权限收紧为范围限定的替代方案
- 永不修改仅限手动的建议
-->
### Auto-Fix

Apply safe fixes automatically (only fixes marked as auto-fixable):

```bash
npx ecc-agentshield scan --fix
```

This will:
- Replace hardcoded secrets with environment variable references
- Tighten wildcard permissions to scoped alternatives
- Never modify manual-only suggestions

<!--
【说明】Opus 4.6 深度分析：运行对抗性三代理管道进行更深入的分析
1. 攻击者（红队）— 找出攻击向量
2. 防御者（蓝队）— 推荐加固措施
3. 审计员（最终裁决）— 综合两种观点
-->
### Opus 4.6 Deep Analysis

Run the adversarial three-agent pipeline for deeper analysis:

```bash
# Requires ANTHROPIC_API_KEY
export ANTHROPIC_API_KEY=your-key
npx ecc-agentshield scan --opus --stream
```

This runs:
1. **Attacker (Red Team)** — finds attack vectors
2. **Defender (Blue Team)** — recommends hardening
3. **Auditor (Final Verdict)** — synthesizes both perspectives

<!--
【说明】初始化安全配置：从头搭建新的安全 `.claude/` 配置
- 带范围权限和拒绝列表的 `settings.json`
- 带安全最佳实践的 `CLAUDE.md`
- `mcp.json` 占位符
-->
### Initialize Secure Config

Scaffold a new secure `.claude/` configuration from scratch:

```bash
npx ecc-agentshield init
```

Creates:
- `settings.json` with scoped permissions and deny list
- `CLAUDE.md` with security best practices
- `mcp.json` placeholder

<!--
【说明】GitHub Action：添加到 CI 管道
-->
### GitHub Action

Add to your CI pipeline:

```yaml
- uses: affaan-m/agentshield@v1
  with:
    path: '.'
    min-severity: 'medium'
    fail-on-findings: true
```

<!--
【说明】严重级别：
- A (90-100)：安全配置
- B (75-89)：小问题
- C (60-74)：需要关注
- D (40-59)：重大风险
- F (0-39)：严重漏洞
-->
## Severity Levels

| Grade | Score | Meaning |
|-------|-------|---------|
| A | 90-100 | Secure configuration |
| B | 75-89 | Minor issues |
| C | 60-74 | Needs attention |
| D | 40-59 | Significant risks |
| F | 0-39 | Critical vulnerabilities |

<!--
【说明】解读结果
-->
## Interpreting Results

<!--
【说明】关键发现（立即修复）：
- 配置文件中硬编码的 API 密钥或令牌
- 允许列表中的 `Bash(*)`（不受限制的 shell 访问）
- 通过 `${file}` 插值在 hooks 中的命令注入
- 运行 shell 的 MCP 服务器
-->
### Critical Findings (fix immediately)
- Hardcoded API keys or tokens in config files
- `Bash(*)` in the allow list (unrestricted shell access)
- Command injection in hooks via `${file}` interpolation
- Shell-running MCP servers

<!--
【说明】高危发现（生产前修复）：
- CLAUDE.md 中的自动运行指令（提示注入向量）
- 权限中缺少拒绝列表
- 代理有不必要的 Bash 访问权限
-->
### High Findings (fix before production)
- Auto-run instructions in CLAUDE.md (prompt injection vector)
- Missing deny lists in permissions
- Agents with unnecessary Bash access

<!--
【说明】中等发现（推荐）：
- hooks 中的静默错误抑制（`2>/dev/null`、`|| true`）
- 缺少 PreToolUse 安全 hooks
- MCP 服务器配置中的 `npx -y` 自动安装
-->
### Medium Findings (recommended)
- Silent error suppression in hooks (`2>/dev/null`, `|| true`)
- Missing PreToolUse security hooks
- `npx -y` auto-install in MCP server configs

<!--
【说明】信息级发现（了解）：
- MCP 服务器缺少描述
- 正确标记为良好实践的禁止性指令
-->
### Info Findings (awareness)
- Missing descriptions on MCP servers
- Prohibitive instructions correctly flagged as good practice

<!--
【说明】链接
-->
## Links

- **GitHub**: [github.com/affaan-m/agentshield](https://github.com/affaan-m/agentshield)
- **npm**: [npmjs.com/package/ecc-agentshield](https://www.npmjs.com/package/ecc-agentshield)
