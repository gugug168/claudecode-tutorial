<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个规则是做什么的：TypeScript/JavaScript 语言特定的编码风格规范    ║
║  什么时候用它：编写 TypeScript/JavaScript 代码时参考                ║
║  核心能力：不可变性、错误处理、输入验证、console.log 规范          ║
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

# TypeScript/JavaScript Coding Style

> This file extends [common/coding-style.md](../common/coding-style.md) with TypeScript/JavaScript specific content.

<!--
【说明】不可变性：使用展开运算符进行不可变更新
- 错误：直接修改对象属性（变更）
- 正确：返回包含变更的新对象
-->
## Immutability

Use spread operator for immutable updates:

```typescript
// WRONG: Mutation
function updateUser(user, name) {
  user.name = name  // MUTATION!
  return user
}

// CORRECT: Immutability
function updateUser(user, name) {
  return {
    ...user,
    name
  }
}
```

<!--
【说明】错误处理：使用 async/await 配合 try-catch
- 使用 console.error 记录错误
- 抛出用户友好的错误消息
-->
## Error Handling

Use async/await with try-catch:

```typescript
try {
  const result = await riskyOperation()
  return result
} catch (error) {
  console.error('Operation failed:', error)
  throw new Error('Detailed user-friendly message')
}
```

<!--
【说明】输入验证：使用 Zod 进行基于 schema 的验证
- 邮箱格式验证
- 整数年龄，范围 0-150
- 解析并验证输入，失败则抛出错误
-->
## Input Validation

Use Zod for schema-based validation:

```typescript
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  age: z.number().int().min(0).max(150)
})

const validated = schema.parse(input)
```

<!--
【说明】Console.log 规范：
- 生产代码中不要有 console.log 语句
- 改用适当的日志库
- 参见 hooks 了解自动检测
-->
## Console.log

- No `console.log` statements in production code
- Use proper logging libraries instead
- See hooks for automatic detection
