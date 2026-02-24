<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个规则是做什么的：定义测试要求和 TDD 工作流                       ║
║  什么时候用它：编写测试、实现新功能、排查测试失败时参考              ║
║  核心能力：80%覆盖率、TDD工作流、测试故障排除                       ║
║  适用范围：通用规则                                                ║
╚══════════════════════════════════════════════════════════════════╝
-->

# Testing Requirements

<!--
【说明】最低测试覆盖率：80%
测试类型（全部必需）：
1. 单元测试 - 单个函数、工具、组件
2. 集成测试 - API 端点、数据库操作
3. E2E 测试 - 关键用户流程（根据语言选择框架）
-->
## Minimum Test Coverage: 80%

Test Types (ALL required):
1. **Unit Tests** - Individual functions, utilities, components
2. **Integration Tests** - API endpoints, database operations
3. **E2E Tests** - Critical user flows (framework chosen per language)

<!--
【说明】测试驱动开发（强制工作流）：
1. 先写测试（RED 红色）
2. 运行测试 - 应该失败
3. 编写最小实现（GREEN 绿色）
4. 运行测试 - 应该通过
5. 重构（IMPROVE 改进）
6. 验证覆盖率（80%+）
-->
## Test-Driven Development

MANDATORY workflow:
1. Write test first (RED)
2. Run test - it should FAIL
3. Write minimal implementation (GREEN)
4. Run test - it should PASS
5. Refactor (IMPROVE)
6. Verify coverage (80%+)

<!--
【说明】测试失败故障排除：
1. 使用 tdd-guide 代理
2. 检查测试隔离
3. 验证 mock 是否正确
4. 修复实现，而不是测试（除非测试错误）
-->
## Troubleshooting Test Failures

1. Use **tdd-guide** agent
2. Check test isolation
3. Verify mocks are correct
4. Fix implementation, not tests (unless tests are wrong)

<!--
【说明】代理支持：
- tdd-guide - 主动用于新功能，强制先写测试
-->
## Agent Support

- **tdd-guide** - Use PROACTIVELY for new features, enforces write-tests-first
