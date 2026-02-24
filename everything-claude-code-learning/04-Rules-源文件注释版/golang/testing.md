<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个规则是做什么的：Go 语言特定的测试规范                          ║
║  什么时候用它：编写 Go 测试、运行测试时参考                          ║
║  核心能力：测试框架、竞态检测、覆盖率检查                           ║
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

# Go Testing

> This file extends [common/testing.md](../common/testing.md) with Go specific content.

<!--
【说明】框架：使用标准的 go test 和表驱动测试
-->
## Framework

Use the standard `go test` with **table-driven tests**.

<!--
【说明】竞态检测：始终使用 -race 标志运行
-->
## Race Detection

Always run with the `-race` flag:

```bash
go test -race ./...
```

<!--
【说明】覆盖率：使用 -cover 标志检查覆盖率
-->
## Coverage

```bash
go test -cover ./...
```

<!--
【说明】参考：参见技能 golang-testing 获取详细的 Go 测试模式
-->
## Reference

See skill: `golang-testing` for detailed Go testing patterns and helpers.
