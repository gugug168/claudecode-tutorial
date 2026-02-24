<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个规则是做什么的：Go 语言特定的 Hooks 配置                       ║
║  什么时候用它：配置 Go 项目的自动化检查时参考                        ║
║  核心能力：gofmt/goimports、go vet、staticcheck                   ║
║  适用范围：Go 语言项目                                             ║
╚══════════════════════════════════════════════════════════════════╝
-->

---
# 【元数据说明】paths: 指定此规则适用于哪些 Go 文件路径
paths:
  - "**/*.go"
  - "**/go.mod"
  - "**/go.sum"
---

# Go Hooks

> This file extends [common/hooks.md](../common/hooks.md) with Go specific content.

<!--
【说明】PostToolUse Hooks：在 ~/.claude/settings.json 中配置
- gofmt/goimports：编辑后自动格式化 .go 文件
- go vet：编辑 .go 文件后运行静态分析
- staticcheck：对修改的包运行扩展静态检查
-->
## PostToolUse Hooks

Configure in `~/.claude/settings.json`:

- **gofmt/goimports**: Auto-format `.go` files after edit
- **go vet**: Run static analysis after editing `.go` files
- **staticcheck**: Run extended static checks on modified packages
