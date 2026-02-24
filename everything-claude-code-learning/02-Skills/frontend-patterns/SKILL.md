---
name: frontend-patterns
description: React、Next.js、状态管理、性能优化和 UI 最佳实践的前端开发模式。
---

# 前端开发模式

React、Next.js 和高性能用户界面的现代前端模式。

## 何时激活此技能

- 构建 React 组件（组合、props、渲染）
- 管理状态（useState、useReducer、Zustand、Context）
- 实现数据获取（SWR、React Query、服务器组件）
- 优化性能（记忆化、虚拟化、代码分割）
- 处理表单（验证、受控输入、Zod schemas）

## 组件模式

### 组合优于继承

```typescript
// 好的写法：组件组合
interface CardProps {
  children: React.ReactNode
  variant?: 'default' | 'outlined'
}

export function Card({ children, variant = 'default' }: CardProps) {
  return <div className={`card card-${variant}`}>{children}</div>
}

// 使用方式
<Card>
  <CardHeader>Title</CardHeader>
  <CardBody>Content</CardBody>
</Card>
```

### 复合组件模式

通过 Context 共享状态，子组件无需显式传递 props，类似 HTML 的 `<select><option>` 模式。

```typescript
const TabsContext = createContext<TabsContextValue | undefined>(undefined)

export function Tabs({ children, defaultTab }: {
  children: React.ReactNode
  defaultTab: string
}) {
  const [activeTab, setActiveTab] = useState(defaultTab)

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabsContext.Provider>
  )
}
```

## 自定义 Hooks 模式

封装可复用逻辑，返回状态和操作函数，保持 Hooks 功能单一。

### 状态管理 Hook

```typescript
export function useToggle(initialValue = false): [boolean, () => void] {
  const [value, setValue] = useState(initialValue)

  const toggle = useCallback(() => {
    setValue(v => !v)
  }, [])

  return [value, toggle]
}

// 使用方式
const [isOpen, toggleOpen] = useToggle()
```

### 防抖 Hook

```typescript
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
```

## 状态管理模式

### Context + Reducer 模式

使用 useReducer 管理复杂状态，通过 Context 共享状态和 dispatch，定义明确的 Action 类型。

```typescript
interface State {
  markets: Market[]
  selectedMarket: Market | null
  loading: boolean
}

type Action =
  | { type: 'SET_MARKETS'; payload: Market[] }
  | { type: 'SELECT_MARKET'; payload: Market }
  | { type: 'SET_LOADING'; payload: boolean }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_MARKETS':
      return { ...state, markets: action.payload }
    case 'SELECT_MARKET':
      return { ...state, selectedMarket: action.payload }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    default:
      return state
  }
}
```

## 性能优化

### 记忆化

```typescript
// useMemo 缓存昂贵计算
const sortedMarkets = useMemo(() => {
  return markets.sort((a, b) => b.volume - a.volume)
}, [markets])

// useCallback 缓存传递给子组件的函数
const handleSearch = useCallback((query: string) => {
  setSearchQuery(query)
}, [])

// React.memo 避免不必要的重渲染
export const MarketCard = React.memo<MarketCardProps>(({ market }) => {
  return <div className="market-card">...</div>
})
```

### 代码分割与懒加载

```typescript
import { lazy, Suspense } from 'react'

// 懒加载重型组件
const HeavyChart = lazy(() => import('./HeavyChart'))

export function Dashboard() {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      <HeavyChart data={data} />
    </Suspense>
  )
}
```

## 表单处理模式

### 带验证的受控表单

```typescript
export function CreateMarketForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    endDate: ''
  })

  const [errors, setErrors] = useState<FormErrors>({})

  const validate = (): boolean => {
    const newErrors: FormErrors = {}
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
}
```

## 最佳实践

1. **组合优于继承** - 偏好组件组合
2. **保持组件小** - 每个组件一个职责
3. **使用自定义 Hooks** - 提取可复用逻辑
4. **优化渲染** - 需要时记忆化
5. **优雅处理错误** - 错误边界
