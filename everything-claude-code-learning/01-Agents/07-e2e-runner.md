# E2E-Runner（端到端测试代理）

## 一句话总结
E2E-Runner 是一个端到端测试专家，它会帮你创建、维护和运行E2E测试，确保关键用户流程在实际浏览器中正常工作。

---

## 它是什么？（小白视角）

### 用一个比喻来理解

想象你开了一家餐厅：

- **单元测试** = 检查每个食材是否新鲜
- **集成测试** = 检查每道菜的做法是否正确
- **E2E测试** = 模拟顾客完整用餐体验：进门→点菜→吃饭→结账→离开

**E2E-Runner 就是那位"神秘顾客"**，它模拟真实用户行为，从头到尾测试你的应用。

### 为什么需要E2E测试？

| 测试类型 | 测试范围 | 发现问题 |
|----------|----------|----------|
| 单元测试 | 单个函数 | 逻辑错误 |
| 集成测试 | API+数据库 | 集成问题 |
| E2E测试 | 完整用户流程 | 整体体验问题 |

**E2E测试是你的最后一道防线**，它捕获单元测试和集成测试遗漏的集成问题。

---

## 工作原理

```
用户旅程 ──→ E2E-Runner ──→ 规划测试场景
    │                             │
    │                             ↓
    │                        创建测试（优先Agent Browser）
    │                             │
    │                             ↓
    │                        本地多次运行
    │                             │
    │                             ↓
    │                        识别不稳定测试
    │                             │
    │                             ↓
    └────────────────←───────── 上传产物（截图/视频）
```

---

## 配置详解

```yaml
---
name: e2e-runner                                     # 代理名称
description: End-to-end testing specialist...        # 描述
tools: ["Read", "Write", "Edit", "Bash", "Grep", "Glob"]  # 可读写执行
model: sonnet                                        # 使用Sonnet模型
---
```

---

## 核心职责

1. **测试旅程创建** - 编写用户流程测试（优先Agent Browser，备选Playwright）
2. **测试维护** - 保持测试与UI变更同步
3. **不稳定测试管理** - 识别和隔离不稳定的测试
4. **产物管理** - 捕获截图、视频、追踪记录
5. **CI/CD集成** - 确保测试在流水线中可靠运行
6. **测试报告** - 生成HTML报告和JUnit XML

---

## 首选工具：Agent Browser

**Agent Browser 优于原生 Playwright**

特点：语义选择器、AI优化、自动等待、基于Playwright构建

```bash
# 安装
npm install -g agent-browser && agent-browser install

# 核心工作流
agent-browser open https://example.com      # 打开页面
agent-browser snapshot -i                   # 获取带ref的元素 [ref=e1]
agent-browser click @e1                     # 通过ref点击
agent-browser fill @e2 "text"               # 通过ref填写输入
agent-browser wait visible @e5              # 等待元素可见
agent-browser screenshot result.png         # 截图
```

---

## 备选工具：Playwright

当Agent Browser不可用时，使用Playwright：

```bash
npx playwright test                        # 运行所有E2E测试
npx playwright test tests/auth.spec.ts     # 运行特定文件
npx playwright test --headed               # 显示浏览器
npx playwright test --debug                # 用调试器调试
npx playwright test --trace on             # 运行并记录追踪
npx playwright show-report                 # 查看HTML报告
```

---

## 工作流程

### 1. 规划

识别关键用户旅程：
- 认证流程（登录、注册、登出）
- 核心功能（创建、读取、更新、删除）
- 支付流程
- 搜索功能

定义场景：
- 正常路径（Happy path）
- 边界情况
- 错误情况

按风险优先级排序：
- **HIGH**: 金融、认证相关
- **MEDIUM**: 搜索、导航
- **LOW**: UI打磨

### 2. 创建

使用Page Object Model (POM)模式：

```typescript
// Page Object
class LoginPage {
  constructor(private page: Page) {}

  async login(email: string, password: string) {
    await this.page.fill('[data-testid="email"]', email);
    await this.page.fill('[data-testid="password"]', password);
    await this.page.click('[data-testid="login-button"]');
  }
}

// 测试
test('user can login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('user@test.com', 'password');
  await expect(page).toHaveURL('/dashboard');
});
```

优先使用 `data-testid` 定位器：

```typescript
// ✅ 推荐
await page.click('[data-testid="submit-button"]');

// ⚠️ 可接受但不推荐
await page.click('.submit-btn');

// ❌ 不推荐
await page.click('#submit');  // ID可能变化
await page.click('//div[@class="submit"]');  // XPath脆弱
```

### 3. 执行

```bash
# 本地运行3-5次检查稳定性
npx playwright test --repeat-each=5

# 不稳定测试隔离
# test.fixme() 或 test.skip()
```

---

## 关键原则

1. **使用语义定位器**: `[data-testid="..."]` > CSS选择器 > XPath
2. **等待条件而非时间**: `waitForResponse()` > `waitForTimeout()`
3. **内置自动等待**: `page.locator().click()` 自动等待; 原生 `page.click()` 不等待
4. **测试隔离**: 每个测试应该独立; 无共享状态
5. **快速失败**: 每个关键步骤都使用 `expect()` 断言
6. **失败时追踪**: 配置 `trace: 'on-first-retry'` 用于调试失败

---

## 不稳定测试处理

```typescript
// 隔离不稳定测试
test('flaky: market search', async ({ page }) => {
  test.fixme(true, '不稳定 - Issue #123')
})

// 识别不稳定性
// npx playwright test --repeat-each=10
```

### 常见不稳定原因

| 原因 | 解决方法 |
|------|----------|
| 竞态条件 | 使用自动等待定位器 |
| 网络时序 | 等待响应 |
| 动画时序 | 等待 `networkidle` |

---

## 测试产物

E2E-Runner 会自动管理：

| 产物 | 用途 |
|------|------|
| 截图 | 失败时自动捕获 |
| 视频 | 可配置录制 |
| 追踪记录 | 详细调试信息 |
| HTML报告 | 测试结果可视化 |

```typescript
// playwright.config.ts
export default {
  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },
};
```

---

## 成功指标

- [ ] 所有关键旅程通过 (100%)
- [ ] 整体通过率 > 95%
- [ ] 不稳定率 < 5%
- [ ] 测试时长 < 10分钟
- [ ] 产物已上传且可访问

---

## 使用方法

### 通过命令调用
```bash
/e2e
```

### 或者描述测试需求
```
帮我写一个用户注册流程的E2E测试
```

---

## 工作流配合

```
/plan "添加购物车"     ← planner制定计划
/tdd                   ← tdd-guide单元测试
[你写代码...]
/e2e                   ← e2e-runner端到端测试
```

---

## 注意事项

1. **不要过度测试** - E2E测试慢，聚焦关键流程
2. **避免依赖时间** - 用条件等待而非固定等待
3. **保持独立** - 每个测试应该能单独运行
4. **使用Page Object** - 提高可维护性
5. **处理不稳定** - 隔离而非删除不稳定测试
6. **记录调试信息** - 截图和追踪很重要

---

## 相关代理

- **tdd-guide** - 单元测试和集成测试
- **code-reviewer** - 代码质量审查

## 相关技能

- `skill: e2e-testing` - 详细Playwright模式、Page Object Model示例、CI/CD工作流
