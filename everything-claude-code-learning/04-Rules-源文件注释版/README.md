<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个文件是做什么的：Rules 组件的说明文档和安装指南                  ║
║  什么时候用它：了解 Rules 结构、安装规则、添加新语言支持时           ║
║  核心能力：目录结构、安装方法、Rules vs Skills 区别                ║
╚══════════════════════════════════════════════════════════════════╝
-->

# Rules

<!--
【说明】结构：规则组织为通用层加上语言特定目录
- common/：语言无关原则（始终安装）
- typescript/：TypeScript/JavaScript 专用
- python/：Python 专用
- golang/：Go 专用

重要：复制整个目录，不要使用 /* 展开，避免同名文件覆盖问题
-->
## Structure

Rules are organized into a **common** layer plus **language-specific** directories:

```
rules/
├── common/          # Language-agnostic principles (always install)
│   ├── coding-style.md
│   ├── git-workflow.md
│   ├── testing.md
│   ├── performance.md
│   ├── patterns.md
│   ├── hooks.md
│   ├── agents.md
│   └── security.md
├── typescript/      # TypeScript/JavaScript specific
├── python/          # Python specific
└── golang/          # Go specific
```

- **common/** contains universal principles — no language-specific code examples.
- **Language directories** extend the common rules with framework-specific patterns, tools, and code examples. Each file references its common counterpart.

<!--
【说明】安装：
选项1：安装脚本（推荐）- 安装 common + 语言特定规则集
选项2：手动安装 - 复制整个目录到 ~/.claude/rules/
-->
## Installation

### Option 1: Install Script (Recommended)

```bash
# Install common + one or more language-specific rule sets
./install.sh typescript
./install.sh python
./install.sh golang

# Install multiple languages at once
./install.sh typescript python
```

### Option 2: Manual Installation

> **Important:** Copy entire directories — do NOT flatten with `/*`.
> Common and language-specific directories contain files with the same names.
> Flattening them into one directory causes language-specific files to overwrite
> common rules, and breaks the relative `../common/` references used by
> language-specific files.

```bash
# Install common rules (required for all projects)
cp -r rules/common ~/.claude/rules/common

# Install language-specific rules based on your project's tech stack
cp -r rules/typescript ~/.claude/rules/typescript
cp -r rules/python ~/.claude/rules/python
cp -r rules/golang ~/.claude/rules/golang

# Attention ! ! ! Configure according to your actual project requirements; the configuration here is for reference only.
```

<!--
【说明】Rules vs Skills：
- Rules：定义广泛适用的标准、约定和检查清单（如"80% 测试覆盖率"）
- Skills：为特定任务提供深度、可操作的参考资料（如 python-patterns）
- Rules 告诉你做什么；Skills 告诉你怎么做
-->
## Rules vs Skills

- **Rules** define standards, conventions, and checklists that apply broadly (e.g., "80% test coverage", "no hardcoded secrets").
- **Skills** (`skills/` directory) provide deep, actionable reference material for specific tasks (e.g., `python-patterns`, `golang-testing`).

Language-specific rule files reference relevant skills where appropriate. Rules tell you *what* to do; skills tell you *how* to do it.

<!--
【说明】添加新语言：创建新语言目录并添加扩展通用规则的文件
- coding-style.md：格式化工具、惯用法、错误处理模式
- testing.md：测试框架、覆盖率工具、测试组织
- patterns.md：语言特定设计模式
- hooks.md：用于格式化器、linter、类型检查器的 PostToolUse hooks
- security.md：密钥管理、安全扫描工具
-->
## Adding a New Language

To add support for a new language (e.g., `rust/`):

1. Create a `rules/rust/` directory
2. Add files that extend the common rules:
   - `coding-style.md` — formatting tools, idioms, error handling patterns
   - `testing.md` — test framework, coverage tools, test organization
   - `patterns.md` — language-specific design patterns
   - `hooks.md` — PostToolUse hooks for formatters, linters, type checkers
   - `security.md` — secret management, security scanning tools
3. Each file should start with:
   ```
   > This file extends [common/xxx.md](../common/xxx.md) with <Language> specific content.
   ```
4. Reference existing skills if available, or create new ones under `skills/`.
