<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个命令是做什么的：增量式修复 Go 构建错误、go vet 警告和 linter 问题║
║  什么时候用它：go build 失败、go vet 报告问题、模块依赖损坏时        ║
║  核心能力：运行诊断、解析错误、增量修复、验证修复                    ║
║  触发方式：/go-build                                               ║
║  关联 Agent：go-build-resolver                                     ║
╚══════════════════════════════════════════════════════════════════╝
-->

---
description: Fix Go build errors, go vet warnings, and linter issues incrementally. Invokes the go-build-resolver agent for minimal, surgical fixes.
---

# Go Build and Fix

<!--
【说明】此命令调用 **go-build-resolver** agent 增量式修复 Go 构建错误，使用最小变更。
-->
This command invokes the **go-build-resolver** agent to incrementally fix Go build errors with minimal changes.

<!--
【说明】此命令做什么：
1. 运行诊断：执行 go build、go vet、staticcheck
2. 解析错误：按文件分组并按严重程度排序
3. 增量修复：一次修复一个错误
4. 验证每个修复：每次变更后重新运行构建
5. 报告摘要：显示已修复和剩余的内容
-->
## What This Command Does

1. **Run Diagnostics**: Execute `go build`, `go vet`, `staticcheck`
2. **Parse Errors**: Group by file and sort by severity
3. **Fix Incrementally**: One error at a time
4. **Verify Each Fix**: Re-run build after each change
5. **Report Summary**: Show what was fixed and what remains

<!--
【说明】在以下情况使用 `/go-build`：
- go build ./... 失败并有错误
- go vet ./... 报告问题
- golangci-lint run 显示警告
- 模块依赖损坏
- 拉取破坏构建的变更后
-->
## When to Use

Use `/go-build` when:
- `go build ./...` fails with errors
- `go vet ./...` reports issues
- `golangci-lint run` shows warnings
- Module dependencies are broken
- After pulling changes that break the build

<!--
【说明】常见错误修复：
| 错误 | 典型修复 |
| undefined: X | 添加导入或修复拼写错误 |
| cannot use X as Y | 类型转换或修复赋值 |
| missing return | 添加返回语句 |
| X does not implement Y | 添加缺失的方法 |
| import cycle | 重构包结构 |
| declared but not used | 删除或使用变量 |
| cannot find package | go get 或 go mod tidy |
-->
## Common Errors Fixed

| Error | Typical Fix |
|-------|-------------|
| `undefined: X` | Add import or fix typo |
| `cannot use X as Y` | Type conversion or fix assignment |
| `missing return` | Add return statement |
| `X does not implement Y` | Add missing method |
| `import cycle` | Restructure packages |
| `declared but not used` | Remove or use variable |
| `cannot find package` | `go get` or `go mod tidy` |

<!--
【说明】修复策略：
1. 先修复构建错误 - 代码必须能编译
2. 再修复 vet 警告 - 修复可疑构造
3. 最后修复 lint 警告 - 风格和最佳实践
4. 一次修复一个 - 验证每个变更
5. 最小化变更 - 不要重构，只修复
-->
## Fix Strategy

1. **Build errors first** - Code must compile
2. **Vet warnings second** - Fix suspicious constructs
3. **Lint warnings third** - Style and best practices
4. **One fix at a time** - Verify each change
5. **Minimal changes** - Don't refactor, just fix

<!--
【说明】相关命令：
- /go-test - 构建成功后运行测试
- /go-review - 审查代码质量
- /verify - 完整验证循环
-->
## Related Commands

- `/go-test` - Run tests after build succeeds
- `/go-review` - Review code quality
- `/verify` - Full verification loop
