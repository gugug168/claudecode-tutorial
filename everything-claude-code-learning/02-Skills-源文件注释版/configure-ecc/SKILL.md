<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个技能是做什么的：Everything Claude Code 的交互式安装向导        ║
║  什么时候用它：用户需要安装/配置 ECC 的 skills 和 rules 时          ║
║  核心能力：交互式安装、选择性安装、路径验证、优化配置               ║
╚══════════════════════════════════════════════════════════════════╝
-->

---
name: configure-ecc
description: Interactive installer for Everything Claude Code — guides users through selecting and installing skills and rules to user-level or project-level directories, verifies paths, and optionally optimizes installed files.
---

# Configure Everything Claude Code (ECC)

<!--
【说明】Configure ECC 的核心内容：
- Everything Claude Code 项目的交互式分步安装向导
- 使用 AskUserQuestion 引导用户选择性安装 skills 和 rules
- 验证正确性并提供优化选项
-->
An interactive, step-by-step installation wizard for the Everything Claude Code project. Uses `AskUserQuestion` to guide users through selective installation of skills and rules, then verifies correctness and offers optimization.

<!--
【说明】何时激活此技能：
- 用户说 "configure ecc"、"install ecc"、"setup everything claude code" 等
- 用户想选择性安装此项目的 skills 或 rules
- 用户想验证或修复现有的 ECC 安装
- 用户想为项目优化已安装的 skills 或 rules
-->
## When to Activate

- User says "configure ecc", "install ecc", "setup everything claude code", or similar
- User wants to selectively install skills or rules from this project
- User wants to verify or fix an existing ECC installation
- User wants to optimize installed skills or rules for their project

<!--
【说明】先决条件 - 两种引导方式：
1. 通过插件：/plugin install everything-claude-code
2. 手动：只复制此技能到 ~/.claude/skills/configure-ecc/SKILL.md
-->
## Prerequisites

This skill must be accessible to Claude Code before activation. Two ways to bootstrap:
1. **Via Plugin**: `/plugin install everything-claude-code` — the plugin loads this skill automatically
2. **Manual**: Copy only this skill to `~/.claude/skills/configure-ecc/SKILL.md`, then activate by saying "configure ecc"

---

<!--
【说明】步骤0：克隆 ECC 仓库
- 将最新的 ECC 源码克隆到 /tmp
- 设置 ECC_ROOT 环境变量作为后续复制操作的源
-->
## Step 0: Clone ECC Repository

Before any installation, clone the latest ECC source to `/tmp`:

```bash
rm -rf /tmp/everything-claude-code
git clone https://github.com/affaan-m/everything-claude-code.git /tmp/everything-claude-code
```

Set `ECC_ROOT=/tmp/everything-claude-code` as the source for all subsequent copy operations.

---

<!--
【说明】步骤1：选择安装级别
- 用户级：应用于所有 Claude Code 项目
- 项目级：只应用于当前项目
- 两者：通用项用户级，项目特定项项目级
-->
## Step 1: Choose Installation Level

Use `AskUserQuestion` to ask the user where to install:

```
Question: "Where should ECC components be installed?"
Options:
  - "User-level (~/.claude/)" — "Applies to all your Claude Code projects"
  - "Project-level (.claude/)" — "Applies only to the current project"
  - "Both" — "Common/shared items user-level, project-specific items project-level"
```

---

<!--
【说明】步骤2：选择并安装 Skills
- 共 27 个 skills 分为 4 个类别
- 框架和语言（16个）、数据库（3个）、工作流和质量（8个）
-->
## Step 2: Select & Install Skills

There are 27 skills organized into 4 categories.

**Category: Framework & Language (16 skills)**

| Skill | Description |
|-------|-------------|
| `backend-patterns` | Backend architecture, API design, server-side best practices |
| `coding-standards` | Universal coding standards for TypeScript, JavaScript, React |
| `django-patterns` | Django architecture, REST API with DRF, ORM, caching |
| `frontend-patterns` | React, Next.js, state management, performance |
| `golang-patterns` | Idiomatic Go patterns, conventions |
| `python-patterns` | Pythonic idioms, PEP 8, type hints |
| `springboot-patterns` | Spring Boot architecture, REST API |

**Category: Database (3 skills)**

| Skill | Description |
|-------|-------------|
| `clickhouse-io` | ClickHouse patterns, query optimization |
| `jpa-patterns` | JPA/Hibernate entity design |
| `postgres-patterns` | PostgreSQL query optimization |

**Category: Workflow & Quality (8 skills)**

| Skill | Description |
|-------|-------------|
| `continuous-learning` | Auto-extract reusable patterns from sessions |
| `continuous-learning-v2` | Instinct-based learning with confidence scoring |
| `tdd-workflow` | Enforces TDD with 80%+ coverage |
| `security-review` | Security checklist |
| `verification-loop` | Verification and quality loop patterns |

---

<!--
【说明】步骤3：选择并安装 Rules
- 通用规则（推荐）：语言无关原则
- TypeScript/JavaScript：TS/JS 模式、hooks、测试
- Python：Python 模式、pytest、black/ruff
- Go：Go 模式、表驱动测试
-->
## Step 3: Select & Install Rules

Use `AskUserQuestion` with `multiSelect: true`:

```
Question: "Which rule sets do you want to install?"
Options:
  - "Common rules (Recommended)" — "Language-agnostic principles (8 files)"
  - "TypeScript/JavaScript" — "TS/JS patterns, hooks, testing (5 files)"
  - "Python" — "Python patterns, pytest, black/ruff (5 files)"
  - "Go" — "Go patterns, table-driven tests (5 files)"
```

---

<!--
【说明】步骤4：安装后验证
- 验证文件存在
- 检查路径引用
- 检查技能间交叉引用
- 报告问题
-->
## Step 4: Post-Installation Verification

After installation, perform these automated checks:

- Verify File Existence
- Check Path References
- Check Cross-References Between Skills
- Report Issues

---

<!--
【说明】步骤5：优化已安装文件（可选）
- 优化技能：移除不相关章节、调整路径
- 优化规则：调整覆盖率目标、自定义工具配置
- 跳过：保持原样
-->
## Step 5: Optimize Installed Files (Optional)

Use `AskUserQuestion`:

```
Question: "Would you like to optimize the installed files for your project?"
Options:
  - "Optimize skills" — "Remove irrelevant sections, adjust paths"
  - "Optimize rules" — "Adjust coverage targets, customize tool configs"
  - "Skip" — "Keep everything as-is"
```

---

<!--
【说明】步骤6：安装摘要
- 清理克隆的仓库
- 打印摘要报告：安装目标、已安装技能、已安装规则、验证结果
-->
## Step 6: Installation Summary

Clean up the cloned repository and print a summary report:

```
## ECC Installation Complete

### Installation Target
- Level: [user-level / project-level / both]
- Path: [target path]

### Skills Installed ([count])
- skill-1, skill-2, skill-3, ...

### Rules Installed ([count])
- common (8 files)
- typescript (5 files)

### Verification Results
- [count] issues found, [count] fixed
```
