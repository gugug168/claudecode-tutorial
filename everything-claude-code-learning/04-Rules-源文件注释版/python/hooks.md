<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个规则是做什么的：Python 语言特定的 Hooks 配置                    ║
║  什么时候用它：配置 Python 项目的自动化检查时参考                    ║
║  核心能力：black/ruff 格式化、mypy/pyright 类型检查                 ║
║  适用范围：Python 语言项目                                         ║
╚══════════════════════════════════════════════════════════════════╝
-->

---
# 【元数据说明】paths: 指定此规则适用于哪些 Python 文件路径
paths:
  - "**/*.py"
  - "**/*.pyi"
---

# Python Hooks

> This file extends [common/hooks.md](../common/hooks.md) with Python specific content.

<!--
【说明】PostToolUse Hooks：在 ~/.claude/settings.json 中配置
- black/ruff：编辑后自动格式化 .py 文件
- mypy/pyright：编辑 .py 文件后运行类型检查
-->
## PostToolUse Hooks

Configure in `~/.claude/settings.json`:

- **black/ruff**: Auto-format `.py` files after edit
- **mypy/pyright**: Run type checking after editing `.py` files

<!--
【说明】警告：警告编辑文件中的 print() 语句（改用 logging 模块）
-->
## Warnings

- Warn about `print()` statements in edited files (use `logging` module instead)
