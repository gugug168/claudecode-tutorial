<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个技能是做什么的：前端开发模式和最佳实践                          ║
║  什么时候用它：构建 React 组件、管理状态、优化性能、处理表单时       ║
║  核心能力：组件模式、自定义 Hooks、状态管理、性能优化、表单处理      ║
╚══════════════════════════════════════════════════════════════════╝
-->

---
name: frontend-patterns
description: Frontend development patterns for React, Next.js, state management, performance optimization, and UI best practices.
---

# Frontend Development Patterns

Modern frontend patterns for React, Next.js, and performant user interfaces.

<!--
【说明】何时使用此技能：
- 构建 React 组件（组合、props、渲染）
- 管理状态（useState、useReducer、Zustand、Context）
- 实现数据获取（SWR、React Query、服务器组件）
- 优化性能（记忆化、虚拟化、代码分割）
- 处理表单（验证、受控输入、Zod schemas）
-->
## When to Activate

- Building React components (composition, props, rendering)
- Managing state (useState, useReducer, Zustand, Context)
- Implementing data fetching (SWR, React Query, server components)
- Optimizing performance (memoization, virtualization, code splitting)
- Working with forms (validation, controlled inputs, Zod schemas)

<!--
【说明】组件模式 - 组合优于继承：
- 使用 children prop 实现组件组合
- 通过 props 传递配置
- 保持组件职责单一
-->
## Component Patterns

### Composition Over Inheritance

```typescript
// GOOD: Component composition
interface CardProps {
  children: React.ReactNode
  variant?: 'default' | 'outlined'
}

export function Card({ children, variant = 'default' }: CardProps) {
  return <div className={`card card-${variant}`}>{children}</div>
}

// Usage
<Card>
  <CardHeader>Title</CardHeader>
  <CardBody>Content</CardBody>
</Card>
```

<!--
【说明】复合组件模式：
- 通过 Context 共享状态
- 子组件无需显式传递 props
- 类似 <select><option> 的 HTML 模式
-->
### Compound Components

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

<!--
【说明】自定义 Hooks 模式：
- 封装可复用逻辑
- 返回状态和操作函数
- 保持 Hooks 功能单一
-->
## Custom Hooks Patterns

### State Management Hook

```typescript
export function useToggle(initialValue = false): [boolean, () => void] {
  const [value, setValue] = useState(initialValue)

  const toggle = useCallback(() => {
    setValue(v => !v)
  }, [])

  return [value, toggle]
}

// Usage
const [isOpen, toggleOpen] = useToggle()
```

### Debounce Hook

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

<!--
【说明】Context + Reducer 模式：
- 使用 useReducer 管理复杂状态
- 通过 Context 共享状态和 dispatch
- 定义明确的 Action 类型
-->
## State Management Patterns

### Context + Reducer Pattern

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

<!--
【说明】性能优化技巧：
- useMemo 缓存昂贵计算
- useCallback 缓存传递给子组件的函数
- React.memo 避免不必要的重渲染
- lazy + Suspense 实现代码分割
-->
## Performance Optimization

### Memoization

```typescript
// useMemo for expensive computations
const sortedMarkets = useMemo(() => {
  return markets.sort((a, b) => b.volume - a.volume)
}, [markets])

// useCallback for functions passed to children
const handleSearch = useCallback((query: string) => {
  setSearchQuery(query)
}, [])

// React.memo for pure components
export const MarketCard = React.memo<MarketCardProps>(({ market }) => {
  return <div className="market-card">...</div>
})
```

### Code Splitting & Lazy Loading

```typescript
import { lazy, Suspense } from 'react'

// Lazy load heavy components
const HeavyChart = lazy(() => import('./HeavyChart'))

export function Dashboard() {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      <HeavyChart data={data} />
    </Suspense>
  )
}
```

<!--
【说明】表单处理模式：
- 使用状态管理表单数据
- 实现验证逻辑
- 处理错误显示
-->
## Form Handling Patterns

### Controlled Form with Validation

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

<!--
【说明】前端开发最佳实践：
- 组合优于继承
- 保持组件小且职责单一
- 使用自定义 Hooks 提取可复用逻辑
- 需要时使用记忆化优化渲染
- 使用错误边界优雅处理错误
-->
## Best Practices

1. **Composition Over Inheritance** - Prefer component composition
2. **Keep Components Small** - One responsibility per component
3. **Use Custom Hooks** - Extract reusable logic
4. **Optimize Renders** - Memoize when needed
5. **Handle Errors Gracefully** - Error boundaries
