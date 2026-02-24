<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个技能是做什么的：测试驱动开发工作流                              ║
║  什么时候用它：编写新功能、修复 bug、重构代码时                      ║
║  核心能力：TDD 原则、80%+覆盖率、单元/集成/E2E 测试                 ║
╚══════════════════════════════════════════════════════════════════╝
-->

---
name: tdd-workflow
description: Use this skill when writing new features, fixing bugs, or refactoring code. Enforces test-driven development with 80%+ coverage including unit, integration, and E2E tests.
---

# Test-Driven Development Workflow

<!--
【说明】此技能确保所有代码开发遵循 TDD 原则并有全面的测试覆盖。
-->
This skill ensures all code development follows TDD principles with comprehensive test coverage.

<!--
【说明】何时激活：
- 编写新功能或特性
- 修复 bug 或问题
- 重构现有代码
- 添加 API 端点
- 创建新组件
-->
## When to Activate

- Writing new features or functionality
- Fixing bugs or issues
- Refactoring existing code
- Adding API endpoints
- Creating new components

<!--
【说明】核心原则
-->
## Core Principles

<!--
【说明】1. 测试先于代码：始终先写测试，然后实现代码使测试通过。
-->
### 1. Tests BEFORE Code

ALWAYS write tests first, then implement code to make tests pass.

<!--
【说明】2. 覆盖率要求：
- 最低 80% 覆盖率（单元 + 集成 + E2E）
- 覆盖所有边缘情况
- 测试错误场景
- 验证边界条件
-->
### 2. Coverage Requirements
- Minimum 80% coverage (unit + integration + E2E)
- All edge cases covered
- Error scenarios tested
- Boundary conditions verified

<!--
【说明】3. 测试类型：
- 单元测试：单个函数和工具、组件逻辑、纯函数
- 集成测试：API 端点、数据库操作、服务交互
- E2E 测试：关键用户流程、完整工作流、浏览器自动化
-->
### 3. Test Types

#### Unit Tests
- Individual functions and utilities
- Component logic
- Pure functions

#### Integration Tests
- API endpoints
- Database operations
- Service interactions

#### E2E Tests (Playwright)
- Critical user flows
- Complete workflows
- Browser automation

<!--
【说明】TDD 工作流步骤
-->
## TDD Workflow Steps

<!--
【说明】步骤1：编写用户旅程
-->
### Step 1: Write User Journeys
```
As a [role], I want to [action], so that [benefit]

Example:
As a user, I want to search for markets semantically,
so that I can find relevant markets even without exact keywords.
```

<!--
【说明】步骤2：生成测试用例
-->
### Step 2: Generate Test Cases

```typescript
describe('Semantic Search', () => {
  it('returns relevant markets for query', async () => {
    // Test implementation
  })

  it('handles empty query gracefully', async () => {
    // Test implementation
  })

  it('falls back to substring search when Redis unavailable', async () => {
    // Test implementation
  })
})
```

<!--
【说明】步骤3：运行测试（应该失败）
-->
### Step 3: Run Tests (They Should Fail)
```bash
npm test
# Tests should fail - we haven't implemented yet
```

<!--
【说明】步骤4：实现代码
-->
### Step 4: Implement Code

```typescript
// Implementation guided by tests
export async function searchMarkets(query: string) {
  // Implementation here
}
```

<!--
【说明】步骤5：再次运行测试
-->
### Step 5: Run Tests Again
```bash
npm test
# Tests should now pass
```

<!--
【说明】步骤6：重构：在保持测试绿色的同时提高代码质量
- 移除重复
- 改进命名
- 优化性能
-->
### Step 6: Refactor

Improve code quality while keeping tests green:
- Remove duplication
- Improve naming
- Optimize performance

<!--
【说明】步骤7：验证覆盖率
-->
### Step 7: Verify Coverage
```bash
npm run test:coverage
# Verify 80%+ coverage achieved
```

<!--
【说明】最佳实践：
1. **先写测试** - 始终 TDD
2. **每个测试一个断言** - 关注单一行为
3. **描述性测试名称** - 解释测试内容
4. **Arrange-Act-Assert** - 清晰的测试结构
5. **Mock 外部依赖** - 隔离单元测试
6. **测试边缘情况** - null、undefined、空、大
7. **测试错误路径** - 不仅是正常路径
-->
## Best Practices

1. **Write Tests First** - Always TDD
2. **One Assert Per Test** - Focus on single behavior
3. **Descriptive Test Names** - Explain what's tested
4. **Arrange-Act-Assert** - Clear test structure
5. **Mock External Dependencies** - Isolate unit tests
6. **Test Edge Cases** - Null, undefined, empty, large
7. **Test Error Paths** - Not just happy paths

<!--
【说明】成功指标：
- 达到 80%+ 代码覆盖率
- 所有测试通过（绿色）
- 没有跳过或禁用的测试
- 快速测试执行（单元测试 < 30秒）
- E2E 测试覆盖关键用户流程
-->
## Success Metrics

- 80%+ code coverage achieved
- All tests passing (green)
- No skipped or disabled tests
- Fast test execution (< 30s for unit tests)
- E2E tests cover critical user flows

---

<!--
【说明】记住：测试不是可选的。它们是让你能够自信重构、快速开发和保证生产可靠性的安全网。
-->
**Remember**: Tests are not optional. They are the safety net that enables confident refactoring, rapid development, and production reliability.
