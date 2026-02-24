# Coding-Standards（通用编码标准）

## 一句话总结
这是一个通用的编码标准和最佳实践指南，适用于 TypeScript、JavaScript、React 和 Node.js 开发。

---

## 什么时候激活

- 开始新项目或模块
- 审查代码质量和可维护性
- 重构代码以遵循约定
- 强制命名、格式或结构一致性
- 设置 linting、格式化或类型检查规则
- 新贡献者入职编码约定

---

## 代码质量原则

### 1. 可读性优先

- 代码被阅读的次数远多于被编写的次数
- 清晰的变量和函数命名
- 自文档化代码优于注释
- 一致的格式

### 2. KISS（保持简单愚蠢）

- 最简单的可行方案
- 避免过度工程
- 不做过早优化
- 易于理解 > 聪明代码

### 3. DRY（不要重复自己）

- 提取公共逻辑到函数
- 创建可复用组件
- 跨模块共享工具
- 避免复制粘贴编程

### 4. YAGNI（你不会需要它）

- 不要提前构建功能
- 避免推测性泛化
- 只在需要时增加复杂性
- 从简单开始，需要时重构

---

## TypeScript/JavaScript 标准

### 变量命名

```typescript
// ✅ 好: 描述性名称
const marketSearchQuery = 'election'
const isUserAuthenticated = true
const totalRevenue = 1000

// ❌ 坏: 不清晰的名称
const q = 'election'
const flag = true
const x = 1000
```

### 函数命名

```typescript
// ✅ 好: 动词-名词模式
async function fetchMarketData(marketId: string) { }
function calculateSimilarity(a: number[], b: number[]) { }
function isValidEmail(email: string): boolean { }

// ❌ 坏: 不清晰或只有名词
async function market(id: string) { }
function similarity(a, b) { }
function email(e) { }
```

### 不可变性模式（关键）

```typescript
// ✅ 总是使用展开运算符
const updatedUser = {
  ...user,
  name: 'New Name'
}

const updatedArray = [...items, newItem]

// ❌ 永远不要直接修改
user.name = 'New Name'  // 坏
items.push(newItem)     // 坏
```

### 错误处理

```typescript
// ✅ 好: 完整的错误处理
async function fetchData(url: string) {
  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Fetch failed:', error)
    throw new Error('Failed to fetch data')
  }
}

// ❌ 坏: 没有错误处理
async function fetchData(url) {
  const response = await fetch(url)
  return response.json()
}
```

### Async/Await 最佳实践

```typescript
// ✅ 好: 尽可能并行执行
const [users, markets, stats] = await Promise.all([
  fetchUsers(),
  fetchMarkets(),
  fetchStats()
])

// ❌ 坏: 不必要的顺序执行
const users = await fetchUsers()
const markets = await fetchMarkets()
const stats = await fetchStats()
```

### 类型安全

```typescript
// ✅ 好: 正确的类型
interface Market {
  id: string
  name: string
  status: 'active' | 'resolved' | 'closed'
  created_at: Date
}

function getMarket(id: string): Promise<Market> {
  // 实现
}

// ❌ 坏: 使用 'any'
function getMarket(id: any): Promise<any> {
  // 实现
}
```

---

## React 最佳实践

### 组件结构

```typescript
// ✅ 好: 带类型的功能组件
interface ButtonProps {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary'
}

export function Button({
  children,
  onClick,
  disabled = false,
  variant = 'primary'
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
    >
      {children}
    </button>
  )
}

// ❌ 坏: 没有类型，结构不清晰
export function Button(props) {
  return <button onClick={props.onClick}>{props.children}</button>
}
```

### 自定义 Hooks

```typescript
// ✅ 好: 可复用的自定义 hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

// 使用
const debouncedQuery = useDebounce(searchQuery, 500)
```

### 状态管理

```typescript
// ✅ 好: 正确的状态更新
const [count, setCount] = useState(0)

// 基于前一个状态的功能更新
setCount(prev => prev + 1)

// ❌ 坏: 直接状态引用
setCount(count + 1)  // 异步场景中可能过时
```

### 条件渲染

```typescript
// ✅ 好: 清晰的条件渲染
{isLoading && <Spinner />}
{error && <ErrorMessage error={error} />}
{data && <DataDisplay data={data} />}

// ❌ 坏: 三元地狱
{isLoading ? <Spinner /> : error ? <ErrorMessage error={error} /> : data ? <DataDisplay data={data} /> : null}
```

---

## API 设计标准

### REST API 约定

```
GET    /api/markets              # 列出所有市场
GET    /api/markets/:id          # 获取特定市场
POST   /api/markets              # 创建新市场
PUT    /api/markets/:id          # 更新市场（完整）
PATCH  /api/markets/:id          # 更新市场（部分）
DELETE /api/markets/:id          # 删除市场

# 查询参数用于过滤
GET /api/markets?status=active&limit=10&offset=0
```

### 响应格式

```typescript
// ✅ 好: 一致的响应结构
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  meta?: {
    total: number
    page: number
    limit: number
  }
}

// 成功响应
return NextResponse.json({
  success: true,
  data: markets,
  meta: { total: 100, page: 1, limit: 10 }
})

// 错误响应
return NextResponse.json({
  success: false,
  error: 'Invalid request'
}, { status: 400 })
```

### 输入验证

```typescript
import { z } from 'zod'

// ✅ 好: Schema验证
const CreateMarketSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  endDate: z.string().datetime(),
  categories: z.array(z.string()).min(1)
})

export async function POST(request: Request) {
  const body = await request.json()

  try {
    const validated = CreateMarketSchema.parse(body)
    // 继续处理验证后的数据
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      }, { status: 400 })
    }
  }
}
```

---

## 代码异味检测

### 1. 长函数

```typescript
// ❌ 坏: 函数超过50行
function processMarketData() {
  // 100行代码
}

// ✅ 好: 拆分成小函数
function processMarketData() {
  const validated = validateData()
  const transformed = transformData(validated)
  return saveData(transformed)
}
```

### 2. 深嵌套

```typescript
// ❌ 坏: 5+层嵌套
if (user) {
  if (user.isAdmin) {
    if (market) {
      if (market.isActive) {
        if (hasPermission) {
          // 做某事
        }
      }
    }
  }
}

// ✅ 好: 早返回
if (!user) return
if (!user.isAdmin) return
if (!market) return
if (!market.isActive) return
if (!hasPermission) return

// 做某事
```

### 3. 魔法数字

```typescript
// ❌ 坏: 未解释的数字
if (retryCount > 3) { }
setTimeout(callback, 500)

// ✅ 好: 命名常量
const MAX_RETRIES = 3
const DEBOUNCE_DELAY_MS = 500

if (retryCount > MAX_RETRIES) { }
setTimeout(callback, DEBOUNCE_DELAY_MS)
```

---

## 测试标准

### AAA 模式

```typescript
test('calculates similarity correctly', () => {
  // Arrange（准备）
  const vector1 = [1, 0, 0]
  const vector2 = [0, 1, 0]

  // Act（执行）
  const similarity = calculateCosineSimilarity(vector1, vector2)

  // Assert（断言）
  expect(similarity).toBe(0)
})
```

### 测试命名

```typescript
// ✅ 好: 描述性测试名
test('returns empty array when no markets match query', () => { })
test('throws error when OpenAI API key is missing', () => { })
test('falls back to substring search when Redis unavailable', () => { })

// ❌ 坏: 模糊的测试名
test('works', () => { })
test('test search', () => { })
```

---

## 性能最佳实践

### Memoization

```typescript
import { useMemo, useCallback } from 'react'

// ✅ 好: 记忆昂贵计算
const sortedMarkets = useMemo(() => {
  return markets.sort((a, b) => b.volume - a.volume)
}, [markets])

// ✅ 好: 记忆回调
const handleSearch = useCallback((query: string) => {
  setSearchQuery(query)
}, [])
```

### 懒加载

```typescript
import { lazy, Suspense } from 'react'

// ✅ 好: 懒加载重型组件
const HeavyChart = lazy(() => import('./HeavyChart'))

export function Dashboard() {
  return (
    <Suspense fallback={<Spinner />}>
      <HeavyChart />
    </Suspense>
  )
}
```

---

## 文件组织

### 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   ├── markets/           # 市场页面
│   └── (auth)/           # 认证页面（路由组）
├── components/            # React 组件
│   ├── ui/               # 通用UI组件
│   ├── forms/            # 表单组件
│   └── layouts/          # 布局组件
├── hooks/                # 自定义 React hooks
├── lib/                  # 工具和配置
│   ├── api/             # API 客户端
│   ├── utils/           # 辅助函数
│   └── constants/       # 常量
├── types/                # TypeScript 类型
└── styles/              # 全局样式
```

### 文件命名

```
components/Button.tsx          # 组件用 PascalCase
hooks/useAuth.ts              # hooks 用 camelCase 带 'use' 前缀
lib/formatDate.ts             # 工具用 camelCase
types/market.types.ts         # 类型用 camelCase 带 .types 后缀
```

---

## 关键要点

1. **可读性优先** - 代码被阅读的次数远多于被编写的次数
2. **不可变性** - 总是使用展开运算符，永远不要直接修改
3. **类型安全** - 避免使用 `any`
4. **错误处理** - 永远不要让错误未处理
5. **并行执行** - 使用 `Promise.all` 并行化独立操作
6. **简单优先** - KISS, DRY, YAGNI
