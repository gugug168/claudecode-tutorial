# TDD-Workflow（测试驱动开发工作流程）

## 一句话总结
这是一个完整的测试驱动开发工作流程指南，确保所有代码都先写测试，实现80%+覆盖率。

---

## 什么时候激活

- 编写新功能或功能
- 修复 bug 或问题
- 重构现有代码
- 添加 API 端点
- 创建新组件

---

## 核心原则

### 1. 测试在代码之前
**永远**先写测试，然后实现代码让测试通过。

### 2. 覆盖率要求
- 最低 80% 覆盖率（单元 + 集成 + E2E）
- 所有边界情况覆盖
- 错误场景测试
- 边界条件验证

### 3. 测试类型

| 类型 | 范围 | 工具 |
|------|------|------|
| 单元测试 | 单个函数和工具 | Jest/Vitest |
| 集成测试 | API端点、数据库操作 | Jest + Supertest |
| E2E测试 | 关键用户流程 | Playwright |

---

## TDD 工作流程步骤

### 步骤 1: 编写用户旅程

```
作为 [角色]，我想要 [行动]，以便 [收益]

示例:
作为用户，我想要语义搜索市场，
以便即使没有精确关键词也能找到相关市场。
```

### 步骤 2: 生成测试用例

```typescript
describe('语义搜索', () => {
  it('为查询返回相关市场', async () => {
    // 测试实现
  })

  it('优雅处理空查询', async () => {
    // 边界情况测试
  })

  it('当Redis不可用时回退到子串搜索', async () => {
    // 回退行为测试
  })

  it('按相似度分数排序结果', async () => {
    // 排序逻辑测试
  })
})
```

### 步骤 3: 运行测试（应该失败）

```bash
npm test
# 测试应该失败 - 我们还没实现
```

**重要**: 测试必须先失败！如果测试一开始就通过，说明测试有问题。

### 步骤 4: 实现代码

```typescript
// 由测试指导的实现
export async function searchMarkets(query: string) {
  // 实现在这里
}
```

### 步骤 5: 再次运行测试

```bash
npm test
# 测试现在应该通过
```

### 步骤 6: 重构

在保持测试通过的情况下提高代码质量：
- 删除重复
- 改进命名
- 优化性能
- 增强可读性

### 步骤 7: 验证覆盖率

```bash
npm run test:coverage
# 验证达到80%+覆盖率
```

---

## 测试模式

### 单元测试模式 (Jest/Vitest)

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'

describe('Button 组件', () => {
  it('用正确的文本渲染', () => {
    render(<Button>点击我</Button>)
    expect(screen.getByText('点击我')).toBeInTheDocument()
  })

  it('点击时调用 onClick', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>点击</Button>)

    fireEvent.click(screen.getByRole('button'))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('disabled prop 为 true 时禁用', () => {
    render(<Button disabled>点击</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

### API 集成测试模式

```typescript
import { NextRequest } from 'next/server'
import { GET } from './route'

describe('GET /api/markets', () => {
  it('成功返回市场', async () => {
    const request = new NextRequest('http://localhost/api/markets')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(Array.isArray(data.data)).toBe(true)
  })

  it('验证查询参数', async () => {
    const request = new NextRequest('http://localhost/api/markets?limit=invalid')
    const response = await GET(request)

    expect(response.status).toBe(400)
  })
})
```

### E2E 测试模式 (Playwright)

```typescript
import { test, expect } from '@playwright/test'

test('用户可以搜索和过滤市场', async ({ page }) => {
  // 导航到市场页面
  await page.goto('/')
  await page.click('a[href="/markets"]')

  // 验证页面加载
  await expect(page.locator('h1')).toContainText('Markets')

  // 搜索市场
  await page.fill('input[placeholder="Search markets"]', 'election')

  // 等待防抖和结果
  await page.waitForTimeout(600)

  // 验证搜索结果显示
  const results = page.locator('[data-testid="market-card"]')
  await expect(results).toHaveCount(5, { timeout: 5000 })
})
```

---

## 测试文件组织

```
src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx          # 单元测试
│   │   └── Button.stories.tsx       # Storybook
│   └── MarketCard/
│       ├── MarketCard.tsx
│       └── MarketCard.test.tsx
├── app/
│   └── api/
│       └── markets/
│           ├── route.ts
│           └── route.test.ts         # 集成测试
└── e2e/
    ├── markets.spec.ts               # E2E 测试
    ├── trading.spec.ts
    └── auth.spec.ts
```

---

## Mock 外部服务

### Supabase Mock

```typescript
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({
          data: [{ id: 1, name: 'Test Market' }],
          error: null
        }))
      }))
    }))
  }
}))
```

### Redis Mock

```typescript
jest.mock('@/lib/redis', () => ({
  searchMarketsByVector: jest.fn(() => Promise.resolve([
    { slug: 'test-market', similarity_score: 0.95 }
  ])),
  checkRedisHealth: jest.fn(() => Promise.resolve({ connected: true }))
}))
```

### OpenAI Mock

```typescript
jest.mock('@/lib/openai', () => ({
  generateEmbedding: jest.fn(() => Promise.resolve(
    new Array(1536).fill(0.1) // Mock 1536维嵌入
  ))
}))
```

---

## 常见测试错误

### ❌ 错误: 测试实现细节

```typescript
// 不要测试内部状态
expect(component.state.count).toBe(5)
```

### ✅ 正确: 测试用户可见行为

```typescript
// 测试用户看到的内容
expect(screen.getByText('Count: 5')).toBeInTheDocument()
```

### ❌ 错误: 脆弱的选择器

```typescript
// 容易失效
await page.click('.css-class-xyz')
```

### ✅ 正确: 语义选择器

```typescript
// 对变更更有弹性
await page.click('button:has-text("Submit")')
await page.click('[data-testid="submit-button"]')
```

### ❌ 错误: 无测试隔离

```typescript
// 测试相互依赖
test('creates user', () => { /* ... */ })
test('updates same user', () => { /* 依赖上一个测试 */ })
```

### ✅ 正确: 独立测试

```typescript
// 每个测试设置自己的数据
test('creates user', () => {
  const user = createTestUser()
  // 测试逻辑
})

test('updates user', () => {
  const user = createTestUser()
  // 更新逻辑
})
```

---

## 持续测试

### 开发时监视模式

```bash
npm test -- --watch
# 文件更改时自动运行测试
```

### Pre-Commit Hook

```bash
# 每次提交前运行
npm test && npm run lint
```

### CI/CD 集成

```yaml
# GitHub Actions
- name: Run Tests
  run: npm test -- --coverage
- name: Upload Coverage
  uses: codecov/codecov-action@v3
```

---

## 最佳实践

1. **先写测试** - 永远 TDD
2. **每个测试一个断言** - 聚焦单一行为
3. **描述性测试名** - 解释测试什么
4. **Arrange-Act-Assert** - 清晰的测试结构
5. **Mock 外部依赖** - 隔离单元测试
6. **测试边界情况** - Null, undefined, 空, 大数据
7. **测试错误路径** - 不只是正常路径
8. **保持测试快速** - 单元测试每个 < 50ms
9. **测试后清理** - 无副作用
10. **审查覆盖率报告** - 识别缺口

---

## 成功指标

- [ ] 达到 80%+ 代码覆盖率
- [ ] 所有测试通过（绿色）
- [ ] 无跳过或禁用的测试
- [ ] 快速测试执行（单元测试 < 30s）
- [ ] E2E 测试覆盖关键用户流程
- [ ] 测试在生产前捕获 bug

---

## 关键要点

**测试不是可选的**。它们是让你自信重构、快速开发和保证生产可靠性的安全网。
