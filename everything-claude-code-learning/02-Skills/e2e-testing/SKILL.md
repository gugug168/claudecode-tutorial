<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个技能是做什么的:Playwright E2E 端到端测试模式                   ║
║  什么时候用它:编写 E2E 测试、Page Object Model、CI/CD 集成时      ║
║  核心能力:POM 模式、测试配置、Flaky 测试策略、制品管理、Web3测试  ║
╚══════════════════════════════════════════════════════════════════╝
-->

---
name: e2e-testing
description: Playwright E2E testing patterns, Page Object Model, configuration, CI/CD integration, artifact management, and flaky test strategies.
---

# E2E 测试模式

构建稳定、快速和可维护的 E2E 测试套件的综合 Playwright 模式。

<!--
【说明】测试文件组织:
- 按功能模块组织测试(auth/features/api)
- fixtures 目录存放测试数据
- 配置文件在根目录
-->
## 测试文件组织

```
tests/
├── e2e/
│   ├── auth/
│   │   ├── login.spec.ts
│   │   ├── logout.spec.ts
│   │   └── register.spec.ts
│   ├── features/
│   │   ├── browse.spec.ts
│   │   ├── search.spec.ts
│   │   └── create.spec.ts
│   └── api/
│       └── endpoints.spec.ts
├── fixtures/
│   ├── auth.ts
│   └── data.ts
└── playwright.config.ts
```

<!--
【说明】Page Object Model (POM):
- 将页面元素和操作封装到类中
- 使用 data-testid 定位元素(更稳定)
- 封装常用操作方法
- 使测试代码更可维护
-->
## Page Object Model (POM)

```typescript
import { Page, Locator } from '@playwright/test'

export class ItemsPage {
  readonly page: Page
  readonly searchInput: Locator
  readonly itemCards: Locator
  readonly createButton: Locator

  constructor(page: Page) {
    this.page = page
    this.searchInput = page.locator('[data-testid="search-input"]')
    this.itemCards = page.locator('[data-testid="item-card"]')
    this.createButton = page.locator('[data-testid="create-btn"]')
  }

  async goto() {
    await this.page.goto('/items')
    await this.page.waitForLoadState('networkidle')
  }

  async search(query: string) {
    await this.searchInput.fill(query)
    await this.page.waitForResponse(resp => resp.url().includes('/api/search'))
    await this.page.waitForLoadState('networkidle')
  }

  async getItemCount() {
    return await this.itemCards.count()
  }
}
```

<!--
【说明】测试结构最佳实践:
- 使用 test.describe 组织相关测试
- beforeEach 设置测试环境
- 测试名称描述场景
- 失败时截图保存到 artifacts
-->
## 测试结构

```typescript
import { test, expect } from '@playwright/test'
import { ItemsPage } from '../../pages/ItemsPage'

test.describe('商品搜索', () => {
  let itemsPage: ItemsPage

  test.beforeEach(async ({ page }) => {
    itemsPage = new ItemsPage(page)
    await itemsPage.goto()
  })

  test('应该能够按关键词搜索', async ({ page }) => {
    await itemsPage.search('test')

    const count = await itemsPage.getItemCount()
    expect(count).toBeGreaterThan(0)

    await expect(itemsPage.itemCards.first()).toContainText(/test/i)
    await page.screenshot({ path: 'artifacts/search-results.png' })
  })

  test('应该能够处理无结果的情况', async ({ page }) => {
    await itemsPage.search('xyznonexistent123')

    await expect(page.locator('[data-testid="no-results"]')).toBeVisible()
    expect(await itemsPage.getItemCount()).toBe(0)
  })
})
```

<!--
【说明】Playwright 配置要点:
- fullyParallel 完全并行运行
- CI 环境禁止 test.only,增加重试
- trace/screenshot/video 仅在失败时记录
- 配置多浏览器测试项目
- webServer 自动启动开发服务器
-->
## Playwright 配置

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'playwright-results.xml' }],
    ['json', { outputFile: 'playwright-results.json' }]
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
})
```

<!--
【说明】Flaky 测试处理策略:
- 使用 test.fixme 标记需要修复的测试
- 使用 test.skip 在 CI 跳过 flaky 测试
- 重复运行检测 flaky
-->
## Flaky 测试模式

### 隔离

```typescript
test('flaky: 复杂搜索', async ({ page }) => {
  test.fixme(true, 'Flaky - Issue #123')
  // 测试代码...
})

test('条件跳过', async ({ page }) => {
  test.skip(process.env.CI, '在 CI 中 flaky - Issue #123')
  // 测试代码...
})
```

### 识别不稳定性

```bash
npx playwright test tests/search.spec.ts --repeat-each=10
npx playwright test tests/search.spec.ts --retries=3
```

<!--
【说明】Flaky 测试常见原因和修复:
- 竞态条件:使用 locator 自动等待
- 网络时序:等待特定条件而非固定超时
- 动画时序:等待元素可见和网络空闲
-->
### 常见原因和修复

**竞态条件:**
```typescript
// 坏的做法:假设元素已就绪
await page.click('[data-testid="button"]')

// 好的做法:自动等待 locator
await page.locator('[data-testid="button"]').click()
```

**网络时序:**
```typescript
// 坏的做法:任意超时
await page.waitForTimeout(5000)

// 好的做法:等待特定条件
await page.waitForResponse(resp => resp.url().includes('/api/data'))
```

**动画时序:**
```typescript
// 坏的做法:动画期间点击
await page.click('[data-testid="menu-item"]')

// 好的做法:等待稳定
await page.locator('[data-testid="menu-item"]').waitFor({ state: 'visible' })
await page.waitForLoadState('networkidle')
await page.locator('[data-testid="menu-item"]').click()
```

<!--
【说明】制品管理:
- 截图:支持全页面、特定元素
- Trace:包含截图和快照的完整记录
- 视频:失败时保留
-->
## 制品管理

### 截图

```typescript
await page.screenshot({ path: 'artifacts/after-login.png' })
await page.screenshot({ path: 'artifacts/full-page.png', fullPage: true })
await page.locator('[data-testid="chart"]').screenshot({ path: 'artifacts/chart.png' })
```

### Trace

```typescript
await browser.startTracing(page, {
  path: 'artifacts/trace.json',
  screenshots: true,
  snapshots: true,
})
// ... 测试操作 ...
await browser.stopTracing()
```

### 视频

```typescript
// 在 playwright.config.ts 中
use: {
  video: 'retain-on-failure',
  videosPath: 'artifacts/videos/'
}
```

<!--
【说明】CI/CD 集成:
- 使用 GitHub Actions 自动化测试
- 安装浏览器和依赖
- 上传测试报告作为 artifact
-->
## CI/CD 集成

```yaml
# .github/workflows/e2e.yml
name: E2E Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
        env:
          BASE_URL: ${{ vars.STAGING_URL }}
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

<!--
【说明】测试报告模板:
- 包含日期、持续时间、状态
- 失败测试详情和修复建议
- 制品链接
-->
## 测试报告模板

```markdown
# E2E 测试报告

**日期:** YYYY-MM-DD HH:MM
**持续时间:** Xm Ys
**状态:** 通过 / 失败

## 概要
- 总计: X | 通过: Y (Z%) | 失败: A | Flaky: B | 跳过: C

## 失败的测试

### test-name
**文件:** `tests/e2e/feature.spec.ts:45`
**错误:** 期望元素可见
**截图:** artifacts/failed.png
**建议修复:** [描述]

## 制品
- HTML 报告: playwright-report/index.html
- 截图: artifacts/*.png
- 视频: artifacts/videos/*.webm
- Trace: artifacts/*.zip
```

<!--
【说明】钱包 / Web3 测试:
- Mock window.ethereum 对象
- 模拟钱包连接和签名操作
-->
## 钱包 / Web3 测试

```typescript
test('钱包连接', async ({ page, context }) => {
  // Mock 钱包提供者
  await context.addInitScript(() => {
    window.ethereum = {
      isMetaMask: true,
      request: async ({ method }) => {
        if (method === 'eth_requestAccounts')
          return ['0x1234567890123456789012345678901234567890']
        if (method === 'eth_chainId') return '0x1'
      }
    }
  })

  await page.goto('/')
  await page.locator('[data-testid="connect-wallet"]').click()
  await expect(page.locator('[data-testid="wallet-address"]')).toContainText('0x1234')
})
```

<!--
【说明】金融 / 关键流程测试:
- 生产环境跳过(涉及真实资金)
- 验证预览和确认步骤
- 等待区块链确认
-->
## 金融 / 关键流程测试

```typescript
test('交易执行', async ({ page }) => {
  // 在生产环境跳过 — 真实资金
  test.skip(process.env.NODE_ENV === 'production', '在生产环境跳过')

  await page.goto('/markets/test-market')
  await page.locator('[data-testid="position-yes"]').click()
  await page.locator('[data-testid="trade-amount"]').fill('1.0')

  // 验证预览
  const preview = page.locator('[data-testid="trade-preview"]')
  await expect(preview).toContainText('1.0')

  // 确认并等待区块链
  await page.locator('[data-testid="confirm-trade"]').click()
  await page.waitForResponse(
    resp => resp.url().includes('/api/trade') && resp.status() === 200,
    { timeout: 30000 }
  )

  await expect(page.locator('[data-testid="trade-success"]')).toBeVisible()
})
```
