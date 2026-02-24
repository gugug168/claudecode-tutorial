<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个规则是做什么的：Go 语言特定的编码风格规范                       ║
║  什么时候用它：编写 Go 代码时参考                                   ║
║  核心能力：格式化、设计原则、错误处理                               ║
║  适用范围：Go 语言项目                                             ║
╚══════════════════════════════════════════════════════════════════╝
-->

---
# 【元数据说明】paths: 指定此规则适用于哪些文件路径
paths:
  - "**/*.go"
  - "**/go.mod"
  - "**/go.sum"
---

# Go Coding Style

> This file extends [common/coding-style.md](../common/coding-style.md) with Go specific content.

<!--
【说明】格式化：gofmt 和 goimports 是强制的，无需风格争论
-->
## Formatting

- **gofmt** and **goimports** are mandatory — no style debates

<!--
【说明】设计原则：
- 接受接口，返回结构体
- 保持接口小（1-3 个方法）
-->
## Design Principles

- Accept interfaces, return structs
- Keep interfaces small (1-3 methods)

<!--
【说明】错误处理：始终用上下文包装错误
-->
## Error Handling

Always wrap errors with context:

```go
if err != nil {
    return fmt.Errorf("failed to create user: %w", err)
}
```

<!--
【说明】参考：参见技能 golang-patterns 获取全面的 Go 惯用法和模式
-->
## Reference

See skill: `golang-patterns` for comprehensive Go idioms and patterns.
