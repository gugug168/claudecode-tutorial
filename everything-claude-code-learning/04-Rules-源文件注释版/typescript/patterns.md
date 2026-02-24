<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个规则是做什么的：TypeScript/JavaScript 语言特定的设计模式        ║
║  什么时候用它：编写 TS/JS 代码、架构设计时参考                       ║
║  核心能力：API 响应格式、自定义 Hook 模式、仓库模式                  ║
║  适用范围：TypeScript/JavaScript 项目                             ║
╚══════════════════════════════════════════════════════════════════╝
-->

---
# 【元数据说明】paths: 指定此规则适用于哪些 TypeScript/JavaScript 文件路径
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
---

# TypeScript/JavaScript Patterns

> This file extends [common/patterns.md](../common/patterns.md) with TypeScript/JavaScript specific content.

<!--
【说明】API 响应格式：统一的 API 响应结构
- success：成功/失败指示器
- data：数据负载（可选）
- error：错误消息（可选）
- meta：分页元数据（total, page, limit）
-->
## API Response Format

```typescript
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
```

<!--
【说明】自定义 Hook 模式：防抖 Hook 示例
- 延迟更新值直到输入停止变化
- 使用 useEffect 设置定时器
- 清理函数清除定时器
-->
## Custom Hooks Pattern

```typescript
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}
```

<!--
【说明】仓库模式：定义数据访问的标准接口
- findAll：查找所有
- findById：按 ID 查找
- create：创建
- update：更新
- delete：删除
-->
## Repository Pattern

```typescript
interface Repository<T> {
  findAll(filters?: Filters): Promise<T[]>
  findById(id: string): Promise<T | null>
  create(data: CreateDto): Promise<T>
  update(id: string, data: UpdateDto): Promise<T>
  delete(id: string): Promise<void>
}
```
