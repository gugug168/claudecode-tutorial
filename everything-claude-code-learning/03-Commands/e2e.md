# E2E 端到端测试命令

使用 Playwright 生成和运行端到端测试。创建测试旅程、运行测试、捕获截图/视频/追踪，并上传工件。

此命令调用 **e2e-runner** agent 使用 Playwright 生成、维护和执行端到端测试。

## 此命令做什么

1. **生成测试旅程** - 为用户流程创建 Playwright 测试
2. **运行 E2E 测试** - 跨浏览器执行测试
3. **捕获工件** - 失败时截图、视频、追踪
4. **上传结果** - HTML 报告和 JUnit XML
5. **识别不稳定测试** - 隔离不稳定的测试

## 什么时候使用

使用 `/e2e` 当：
- 测试关键用户旅程（登录、交易、支付）
- 验证多步骤流程端到端工作
- 测试 UI 交互和导航
- 验证前端和后端的集成
- 准备生产部署

## 测试工件

当测试运行时，会捕获以下工件：

**所有测试：**
- 带时间线和结果的 HTML 报告
- 用于 CI 集成的 JUnit XML

**仅失败时：**
- 失败状态的截图
- 测试的视频录制
- 用于调试的追踪文件（逐步回放）

## 最佳实践

**应该做：**
- ✅ 使用页面对象模型提高可维护性
- ✅ 使用 data-testid 属性作为选择器
- ✅ 等待 API 响应，而不是任意超时
- ✅ 端到端测试关键用户旅程
- ✅ 合并到主分支前运行测试

**不应该做：**
- ❌ 使用脆弱的选择器（CSS 类可能会变）
- ❌ 测试实现细节
- ❌ 对生产环境运行测试
- ❌ 忽略不稳定的测试

## 快速命令

```bash
# 运行所有 E2E 测试
npx playwright test

# 运行特定测试文件
npx playwright test tests/e2e/markets/search.spec.ts

# 以有头模式运行（查看浏览器）
npx playwright test --headed

# 调试测试
npx playwright test --debug

# 生成测试代码
npx playwright codegen http://localhost:3000

# 查看报告
npx playwright show-report
```

## 相关 Agent

此命令调用的 `e2e-runner` agent 位于：
`~/.claude/agents/e2e-runner.md`
