<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个命令是做什么的：全面的 Go 代码审查，检查惯用模式、并发安全等     ║
║  什么时候用它：编写或修改 Go 代码后、提交前、审查 PR 时              ║
║  核心能力：静态分析、安全扫描、并发审查、惯用 Go 检查                ║
║  触发方式：/go-review                                              ║
║  关联 Agent：go-reviewer                                           ║
╚══════════════════════════════════════════════════════════════════╝
-->

---
description: Comprehensive Go code review for idiomatic patterns, concurrency safety, error handling, and security. Invokes the go-reviewer agent.
---

# Go Code Review

<!--
【说明】此命令调用 **go-reviewer** agent 进行全面的 Go 特定代码审查。
-->
This command invokes the **go-reviewer** agent for comprehensive Go-specific code review.

<!--
【说明】此命令做什么：
1. 识别 Go 变更：通过 git diff 查找修改的 .go 文件
2. 运行静态分析：执行 go vet、staticcheck 和 golangci-lint
3. 安全扫描：检查 SQL 注入、命令注入、竞态条件
4. 并发审查：分析 goroutine 安全、channel 使用、mutex 模式
5. 惯用 Go 检查：验证代码遵循 Go 约定和最佳实践
6. 生成报告：按严重程度分类问题
-->
## What This Command Does

1. **Identify Go Changes**: Find modified `.go` files via `git diff`
2. **Run Static Analysis**: Execute `go vet`, `staticcheck`, and `golangci-lint`
3. **Security Scan**: Check for SQL injection, command injection, race conditions
4. **Concurrency Review**: Analyze goroutine safety, channel usage, mutex patterns
5. **Idiomatic Go Check**: Verify code follows Go conventions and best practices
6. **Generate Report**: Categorize issues by severity

<!--
【说明】审查类别：
关键（必须修复）：SQL/命令注入、没有同步的竞态条件、Goroutine 泄漏、硬编码凭证、不安全的指针使用、关键路径中忽略的错误
高（应该修复）：缺少带上下文的错误包装、使用 panic 而不是错误返回、Context 未传播、导致死锁的无缓冲 channel、接口未满足错误、缺少 mutex 保护
中（考虑修复）：非惯用代码模式、导出函数缺少 godoc 注释、低效的字符串拼接、Slice 未预分配、未使用表驱动测试
-->
## Review Categories

### CRITICAL (Must Fix)
- SQL/Command injection vulnerabilities
- Race conditions without synchronization
- Goroutine leaks
- Hardcoded credentials
- Unsafe pointer usage
- Ignored errors in critical paths

### HIGH (Should Fix)
- Missing error wrapping with context
- Panic instead of error returns
- Context not propagated
- Unbuffered channels causing deadlocks
- Interface not satisfied errors
- Missing mutex protection

### MEDIUM (Consider)
- Non-idiomatic code patterns
- Missing godoc comments on exports
- Inefficient string concatenation
- Slice not preallocated
- Table-driven tests not used

<!--
【说明】批准标准：
| 状态 | 条件 |
| ✅ 批准 | 没有关键或高优先级问题 |
| ⚠️ 警告 | 只有中优先级问题（谨慎合并） |
| ❌ 阻止 | 发现关键或高优先级问题 |
-->
## Approval Criteria

| Status | Condition |
|--------|-----------|
| ✅ Approve | No CRITICAL or HIGH issues |
| ⚠️ Warning | Only MEDIUM issues (merge with caution) |
| ❌ Block | CRITICAL or HIGH issues found |
