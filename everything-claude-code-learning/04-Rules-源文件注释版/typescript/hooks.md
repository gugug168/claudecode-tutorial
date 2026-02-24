<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个规则是做什么的：TypeScript/JavaScript 语言特定的 Hooks 配置     ║
║  什么时候用它：配置 TS/JS 项目的自动化检查时参考                     ║
║  核心能力：Prettier、TypeScript 检查、console.log 警告/审计        ║
║  适用范围：TypeScript/JavaScript 项目                             ║
╚══════════════════════════════════════════════════════════════════╝
-->

---
# 【元数据说明】paths: 指定此规则适用于哪些 TypeScript/JavaScript 文件路径
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
---

# TypeScript/JavaScript Hooks

> This file extends [common/hooks.md](../common/hooks.md) with TypeScript/JavaScript specific content.

<!--
【说明】PostToolUse Hooks：在 ~/.claude/settings.json 中配置
- Prettier：编辑后自动格式化 JS/TS 文件
- TypeScript 检查：编辑 .ts/.tsx 文件后运行 tsc
- console.log 警告：警告编辑文件中的 console.log
-->
## PostToolUse Hooks

Configure in `~/.claude/settings.json`:

- **Prettier**: Auto-format JS/TS files after edit
- **TypeScript check**: Run `tsc` after editing `.ts`/`.tsx` files
- **console.log warning**: Warn about `console.log` in edited files

<!--
【说明】Stop Hooks：console.log 审计 - 会话结束前检查所有修改文件中的 console.log
-->
## Stop Hooks

- **console.log audit**: Check all modified files for `console.log` before session ends
