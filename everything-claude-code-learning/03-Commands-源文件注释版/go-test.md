<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个命令是做什么的：为 Go 代码强制执行 TDD 工作流程                  ║
║  什么时候用它：实现新 Go 函数、添加测试覆盖、修复 bug 时             ║
║  核心能力：定义类型/接口、编写表驱动测试、实现代码、验证覆盖率        ║
║  触发方式：/go-test                                                ║
╚══════════════════════════════════════════════════════════════════╝
-->

---
description: Enforce TDD workflow for Go. Write table-driven tests first, then implement. Verify 80%+ coverage with go test -cover.
---

# Go TDD Command

<!--
【说明】此命令为 Go 代码强制执行测试驱动开发方法论，使用惯用的 Go 测试模式。
-->
This command enforces test-driven development methodology for Go code using idiomatic Go testing patterns.

<!--
【说明】此命令做什么：
1. 定义类型/接口：先脚手架函数签名
2. 编写表驱动测试：创建全面的测试用例（红色）
3. 运行测试：验证测试因正确原因失败
4. 实现代码：编写最小代码通过（绿色）
5. 重构：在保持测试通过的同时改进
6. 检查覆盖率：确保 80%+ 覆盖率
-->
## What This Command Does

1. **Define Types/Interfaces**: Scaffold function signatures first
2. **Write Table-Driven Tests**: Create comprehensive test cases (RED)
3. **Run Tests**: Verify tests fail for the right reason
4. **Implement Code**: Write minimal code to pass (GREEN)
5. **Refactor**: Improve while keeping tests green
6. **Check Coverage**: Ensure 80%+ coverage

<!--
【说明】TDD 循环：红（编写失败的表驱动测试）→ 绿（实现最小代码通过）→ 重构（改进代码，测试保持通过）→ 重复（下一个测试用例）
-->
## TDD Cycle

```
RED     → Write failing table-driven test
GREEN   → Implement minimal code to pass
REFACTOR → Improve code, tests stay green
REPEAT  → Next test case
```

<!--
【说明】测试模式 - 表驱动测试示例：使用结构体切片定义测试用例，然后用 t.Run 遍历执行
-->
## Test Patterns

### Table-Driven Tests
```go
tests := []struct {
    name     string
    input    InputType
    want     OutputType
    wantErr  bool
}{
    {"case 1", input1, want1, false},
    {"case 2", input2, want2, true},
}

for _, tt := range tests {
    t.Run(tt.name, func(t *testing.T) {
        got, err := Function(tt.input)
        // assertions
    })
}
```

<!--
【说明】覆盖率命令：
- 基本覆盖率：go test -cover ./...
- 覆盖率配置文件：go test -coverprofile=coverage.out ./...
- 在浏览器中查看：go tool cover -html=coverage.out
- 带竞态检测：go test -race -cover ./...
-->
## Coverage Commands

```bash
# Basic coverage
go test -cover ./...

# Coverage profile
go test -coverprofile=coverage.out ./...

# View in browser
go tool cover -html=coverage.out

# With race detection
go test -race -cover ./...
```

<!--
【说明】覆盖率目标：
| 代码类型 | 目标 |
| 关键业务逻辑 | 100% |
| 公共 API | 90%+ |
| 一般代码 | 80%+ |
| 生成的代码 | 排除 |
-->
## Coverage Targets

| Code Type | Target |
|-----------|--------|
| Critical business logic | 100% |
| Public APIs | 90%+ |
| General code | 80%+ |
| Generated code | Exclude |

<!--
【说明】TDD 最佳实践：
应该做：先写测试在任何实现之前、每次更改后运行测试、使用表驱动测试实现全面覆盖、测试行为而不是实现细节
不应该做：在测试之前写实现、跳过红色阶段、直接测试私有函数、在测试中使用 time.Sleep
-->
## TDD Best Practices

**DO:**
- Write test FIRST, before any implementation
- Run tests after each change
- Use table-driven tests for comprehensive coverage
- Test behavior, not implementation details

**DON'T:**
- Write implementation before tests
- Skip the RED phase
- Test private functions directly
- Use `time.Sleep` in tests
