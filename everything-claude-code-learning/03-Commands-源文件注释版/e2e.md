<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个命令是做什么的：使用 Playwright 生成和运行端到端测试            ║
║  什么时候用它：测试关键用户旅程、验证多步骤流程、准备生产部署        ║
║  核心能力：生成测试旅程、运行测试、捕获工件、上传结果                ║
║  触发方式：/e2e                                                    ║
║  关联 Agent：e2e-runner                                            ║
╚══════════════════════════════════════════════════════════════════╝
-->

---
description: Generate and run end-to-end tests with Playwright. Creates test journeys, runs tests, captures screenshots/videos/traces, and uploads artifacts.
---

# E2E Command

<!--
【说明】此命令调用 **e2e-runner** agent 使用 Playwright 生成、维护和执行端到端测试。
-->
This command invokes the **e2e-runner** agent to generate, maintain, and execute end-to-end tests using Playwright.

<!--
【说明】此命令做什么：
1. 生成测试旅程 - 为用户流程创建 Playwright 测试
2. 运行 E2E 测试 - 跨浏览器执行测试
3. 捕获工件 - 失败时截图、视频、追踪
4. 上传结果 - HTML 报告和 JUnit XML
5. 识别不稳定测试 - 隔离不稳定的测试
-->
## What This Command Does

1. **Generate Test Journeys** - Create Playwright tests for user flows
2. **Run E2E Tests** - Execute tests across browsers
3. **Capture Artifacts** - Screenshots, videos, traces on failures
4. **Upload Results** - HTML reports and JUnit XML
5. **Identify Flaky Tests** - Quarantine unstable tests

<!--
【说明】在以下情况使用 `/e2e`：
- 测试关键用户旅程（登录、交易、支付）
- 验证多步骤流程端到端工作
- 测试 UI 交互和导航
- 验证前端和后端的集成
- 准备生产部署
-->
## When to Use

Use `/e2e` when:
- Testing critical user journeys (login, trading, payments)
- Verifying multi-step flows work end-to-end
- Testing UI interactions and navigation
- Validating integration between frontend and backend
- Preparing for production deployment

<!--
【说明】测试工件：
- 所有测试：带时间线和结果的 HTML 报告、用于 CI 集成的 JUnit XML
- 仅失败时：失败状态的截图、测试的视频录制、用于调试的追踪文件（逐步回放）
-->
## Test Artifacts

When tests run, the following artifacts are captured:

**On All Tests:**
- HTML Report with timeline and results
- JUnit XML for CI integration

**On Failure Only:**
- Screenshot of the failing state
- Video recording of the test
- Trace file for debugging (step-by-step replay)

<!--
【说明】最佳实践：
应该做：使用页面对象模型、使用 data-testid 属性作为选择器、等待 API 响应而不是任意超时、端到端测试关键用户旅程、合并到主分支前运行测试
不应该做：使用脆弱的选择器（CSS 类可能会变）、测试实现细节、对生产环境运行测试、忽略不稳定的测试
-->
## Best Practices

**DO:**
- ✅ Use Page Object Model for maintainability
- ✅ Use data-testid attributes for selectors
- ✅ Wait for API responses, not arbitrary timeouts
- ✅ Test critical user journeys end-to-end
- ✅ Run tests before merging to main

**DON'T:**
- ❌ Use brittle selectors (CSS classes can change)
- ❌ Test implementation details
- ❌ Run tests against production
- ❌ Ignore flaky tests

<!--
【说明】快速命令：
- 运行所有 E2E 测试
- 运行特定测试文件
- 以有头模式运行（查看浏览器）
- 调试测试
- 生成测试代码
- 查看报告
-->
## Quick Commands

```bash
# Run all E2E tests
npx playwright test

# Run specific test file
npx playwright test tests/e2e/markets/search.spec.ts

# Run in headed mode (see browser)
npx playwright test --headed

# Debug test
npx playwright test --debug

# Generate test code
npx playwright codegen http://localhost:3000

# View report
npx playwright show-report
```

<!--
【说明】此命令调用的 `e2e-runner` agent 位于用户配置目录
-->
## Related Agents

This command invokes the `e2e-runner` agent located at:
`~/.claude/agents/e2e-runner.md`
