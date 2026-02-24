<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个命令是做什么的：调用 tdd-guide agent 强制测试驱动开发           ║
║  什么时候用它：实现新功能、添加新函数/组件、修复 bug、重构代码时     ║
║  核心能力：脚手架接口、先生成测试、最小实现、重构、验证覆盖率        ║
║  触发方式：/tdd                                                    ║
║  关联 Agent：tdd-guide                                             ║
╚══════════════════════════════════════════════════════════════════╝
-->

---
# 【元数据说明】
# description: 命令描述，关键词：test-driven development（测试驱动开发）、
#              Scaffold interfaces（脚手架接口）、generate tests FIRST（先生成测试）、
#              80%+ coverage（80%+覆盖率）
---
description: Enforce test-driven development workflow. Scaffold interfaces, generate tests FIRST, then implement minimal code to pass. Ensure 80%+ coverage.
---

# TDD Command

<!--
【说明】此命令调用 **tdd-guide** agent 强制执行测试驱动开发方法论。
-->
This command invokes the **tdd-guide** agent to enforce test-driven development methodology.

<!--
【说明】此命令做什么：
1. 脚手架接口 - 先定义类型/接口
2. 先生成测试 - 编写失败的测试（红色）
3. 最小实现 - 只写足够的代码通过（绿色）
4. 重构 - 在保持测试通过的同时改进代码（重构）
5. 验证覆盖率 - 确保 80%+ 测试覆盖率
-->
## What This Command Does

1. **Scaffold Interfaces** - Define types/interfaces first
2. **Generate Tests First** - Write failing tests (RED)
3. **Implement Minimal Code** - Write just enough to pass (GREEN)
4. **Refactor** - Improve code while keeping tests green (REFACTOR)
5. **Verify Coverage** - Ensure 80%+ test coverage

<!--
【说明】在以下情况使用 `/tdd`：
- 实现新功能
- 添加新函数/组件
- 修复 bug（先写重现 bug 的测试）
- 重构现有代码
- 构建关键业务逻辑
-->
## When to Use

Use `/tdd` when:
- Implementing new features
- Adding new functions/components
- Fixing bugs (write test that reproduces bug first)
- Refactoring existing code
- Building critical business logic

<!--
【说明】tdd-guide agent 的工作流程：
1. 定义接口用于输入/输出
2. 编写会失败的测试（因为代码还不存在）
3. 运行测试并验证它们因正确的原因失败
4. 编写最小实现使测试通过
5. 运行测试并验证它们通过
6. 重构代码同时保持测试通过
7. 检查覆盖率，如果低于 80% 添加更多测试
-->
## How It Works

The tdd-guide agent will:

1. **Define interfaces** for inputs/outputs
2. **Write tests that will FAIL** (because code doesn't exist yet)
3. **Run tests** and verify they fail for the right reason
4. **Write minimal implementation** to make tests pass
5. **Run tests** and verify they pass
6. **Refactor** code while keeping tests green
7. **Check coverage** and add more tests if below 80%

<!--
【说明】TDD 循环：红 → 绿 → 重构 → 重复
- 红：编写失败的测试
- 绿：编写最小代码通过
- 重构：改进代码，保持测试通过
- 重复：下一个功能/场景
-->
## TDD Cycle

```
RED → GREEN → REFACTOR → REPEAT

RED:      Write a failing test
GREEN:    Write minimal code to pass
REFACTOR: Improve code, keep tests passing
REPEAT:   Next feature/scenario
```

<!--
【说明】TDD 最佳实践 - 应该做：
- 先写测试，在任何实现之前
- 运行测试并验证它们在实现之前失败
- 编写最小代码使测试通过
- 只在测试通过后重构
- 添加边缘情况和错误场景
- 目标 80%+ 覆盖率（关键代码 100%）
-->
## TDD Best Practices

**DO:**
- ✅ Write the test FIRST, before any implementation
- ✅ Run tests and verify they FAIL before implementing
- ✅ Write minimal code to make tests pass
- ✅ Refactor only after tests are green
- ✅ Add edge cases and error scenarios
- ✅ Aim for 80%+ coverage (100% for critical code)

<!--
【说明】不应该做：
- 在测试之前写实现
- 每次更改后跳过运行测试
- 一次写太多代码
- 忽略失败的测试
- 测试实现细节（应该测试行为）
- 模拟一切（优先集成测试）
-->
**DON'T:**
- ❌ Write implementation before tests
- ❌ Skip running tests after each change
- ❌ Write too much code at once
- ❌ Ignore failing tests
- ❌ Test implementation details (test behavior)
- ❌ Mock everything (prefer integration tests)

<!--
【说明】要包含的测试类型：
- 单元测试（函数级别）：正常路径、边缘情况、错误条件、边界值
- 集成测试（组件级别）：API 端点、数据库操作、外部服务调用、带 hooks 的 React 组件
- 端到端测试（使用 /e2e 命令）：关键用户流程、多步骤流程、全栈集成
-->
## Test Types to Include

**Unit Tests** (Function-level):
- Happy path scenarios
- Edge cases (empty, null, max values)
- Error conditions
- Boundary values

**Integration Tests** (Component-level):
- API endpoints
- Database operations
- External service calls
- React components with hooks

**E2E Tests** (use `/e2e` command):
- Critical user flows
- Multi-step processes
- Full stack integration

<!--
【说明】覆盖率要求：
- 所有代码最低 80% 覆盖率
- 以下场景要求 100%：财务计算、认证逻辑、安全关键代码、核心业务逻辑
-->
## Coverage Requirements

- **80% minimum** for all code
- **100% required** for:
  - Financial calculations
  - Authentication logic
  - Security-critical code
  - Core business logic

<!--
【说明】重要说明：测试必须在实现之前编写。TDD 循环是 红-绿-重构。永远不要跳过红色阶段，永远不要在测试之前写代码。
-->
## Important Notes

**MANDATORY**: Tests must be written BEFORE implementation. The TDD cycle is:

1. **RED** - Write failing test
2. **GREEN** - Implement to pass
3. **REFACTOR** - Improve code

Never skip the RED phase. Never write code before tests.

<!--
【说明】与其他命令的集成：
- 先用 /plan 了解要构建什么
- 用 /tdd 进行测试实现
- 如果出现构建错误，用 /build-fix
- 用 /code-review 审查实现
- 用 /test-coverage 验证覆盖率
-->
## Integration with Other Commands

- Use `/plan` first to understand what to build
- Use `/tdd` to implement with tests
- Use `/build-fix` if build errors occur
- Use `/code-review` to review implementation
- Use `/test-coverage` to verify coverage

<!--
【说明】相关 Agent 和 Skill 的位置
-->
## Related Agents

This command invokes the `tdd-guide` agent located at:
`~/.claude/agents/tdd-guide.md`

And can reference the `tdd-workflow` skill at:
`~/.claude/skills/tdd-workflow/`
