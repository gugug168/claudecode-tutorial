# Build-Error-Resolver（构建错误解决代理）

## 一句话总结
Build-Error-Resolver 是一个构建错误修复专家，当你的项目编译失败、出现TypeScript类型错误时，它会用最小的改动快速修复问题，让构建重新通过。

---

## 它是什么？（小白视角）

### 用一个比喻来理解

想象你在搭积木塔：

- **没有 Build-Error-Resolver**：塔倒了，你不知道哪块积木放错了，胡乱尝试
- **有 Build-Error-Resolver**：有位积木专家告诉你"第3层那块红色积木应该换成蓝色的"，精准修复

**Build-Error-Resolver 就是那位"积木专家"**，它精准定位问题，用最小改动修复构建错误。

### 它的特点

| 特点 | 说明 |
|------|------|
| 只修错误 | 不做重构、不做架构变更、不做优化 |
| 最小改动 | 用最少的代码变更解决问题 |
| 快速 | 目标是让构建尽快通过 |

---

## 工作原理

```
构建失败 ──→ Build-Error-Resolver ──→ 收集所有错误
    │                                    │
    │                                    ↓
    │                              分类错误
    │                                    │
    │                                    ↓
    │                              优先处理阻塞构建的错误
    │                                    │
    │                                    ↓
    │                              逐个最小化修复
    │                                    │
    │                                    ↓
    └─────────────────←────────────── 验证构建通过
```

---

## 配置详解

```yaml
---
name: build-error-resolver                           # 代理名称
description: Build and TypeScript error resolution... # 描述
tools: ["Read", "Write", "Edit", "Bash", "Grep", "Glob"]  # 可读写执行
model: sonnet                                         # 使用Sonnet模型
---
```

---

## 核心职责

1. **TypeScript错误解决** - 修复类型错误、推断问题、泛型约束
2. **构建错误修复** - 解决编译失败、模块解析问题
3. **依赖问题** - 修复导入错误、缺失包、版本冲突
4. **配置错误** - 解决tsconfig、webpack、Next.js配置问题
5. **最小差异** - 做最小的改动来修复错误
6. **不做架构变更** - 只修复错误，不重新设计

---

## 诊断命令

```bash
# 检查TypeScript类型错误
npx tsc --noEmit --pretty

# 显示所有错误（不增量）
npx tsc --noEmit --pretty --incremental false

# 运行构建
npm run build

# ESLint检查
npx eslint . --ext .ts,.tsx,.js,.jsx
```

---

## 工作流程

### 1. 收集所有错误
```bash
npx tsc --noEmit --pretty
```
获取所有类型错误，分类：
- 类型推断问题
- 缺失类型
- 导入问题
- 配置问题
- 依赖问题

### 2. 修复策略（最小变更）

对每个错误：
1. 仔细阅读错误信息 — 理解期望值与实际值
2. 找到最小修复（类型注解、null检查、导入修复）
3. 验证修复不破坏其他代码 — 重新运行tsc
4. 迭代直到构建通过

### 3. 常见修复

| 错误 | 修复方法 |
|------|----------|
| `implicitly has 'any' type` | 添加类型注解 |
| `Object is possibly 'undefined'` | 可选链 `?.` 或null检查 |
| `Property does not exist` | 添加到接口或使用可选 `?` |
| `Cannot find module` | 检查tsconfig paths、安装包或修复导入路径 |
| `Type 'X' not assignable to 'Y'` | 解析/转换类型或修复类型 |
| `Generic constraint` | 添加 `extends { ... }` |
| `Hook called conditionally` | 将hooks移到顶层 |
| `'await' outside async` | 添加 `async` 关键字 |

---

## 常见错误示例

### 1. 隐式any类型

```typescript
// ❌ 错误
function processData(data) {  // Parameter 'data' implicitly has an 'any' type
  return data.name;
}

// ✅ 修复: 添加类型注解
function processData(data: { name: string }) {
  return data.name;
}
```

### 2. 可能undefined

```typescript
// ❌ 错误
const name = user.profile.name;  // 'profile' is possibly 'undefined'

// ✅ 修复: 可选链
const name = user.profile?.name;

// ✅ 或null检查
if (user.profile) {
  const name = user.profile.name;
}
```

### 3. 属性不存在

```typescript
// ❌ 错误
interface User {
  name: string;
}
const user: User = { name: 'John', age: 30 };  // 'age' does not exist in type 'User'

// ✅ 修复: 添加到接口
interface User {
  name: string;
  age: number;
}
```

### 4. 找不到模块

```typescript
// ❌ 错误
import { something } from 'my-lib';  // Cannot find module 'my-lib'

// ✅ 修复: 安装包
// npm install my-lib

// ✅ 或检查tsconfig paths
// tsconfig.json: { "paths": { "my-lib": ["./src/lib"] } }
```

### 5. 类型不匹配

```typescript
// ❌ 错误
const id: string = 123;  // Type 'number' is not assignable to type 'string'

// ✅ 修复: 类型转换
const id: string = String(123);
// 或
const id: string = 123.toString();
```

---

## 该做和不该做

### ✅ 应该做

- 在缺失的地方添加类型注解
- 在需要的地方添加null检查
- 修复导入/导出
- 添加缺失的依赖
- 更新类型定义
- 修复配置文件

### ❌ 不该做

- 重构无关代码
- 改变架构
- 重命名变量（除非导致错误）
- 添加新功能
- 改变逻辑流程（除非修复错误）
- 优化性能或风格

---

## 优先级

| 级别 | 症状 | 行动 |
|------|------|------|
| **CRITICAL** | 构建完全失败，无开发服务器 | 立即修复 |
| **HIGH** | 单个文件失败，新代码类型错误 | 尽快修复 |
| **MEDIUM** | Linter警告、废弃API | 有空时修复 |

---

## 快速恢复

如果遇到严重问题，可以尝试：

```bash
# 核选项: 清除所有缓存
rm -rf .next node_modules/.cache && npm run build

# 重新安装依赖
rm -rf node_modules package-lock.json && npm install

# ESLint自动修复
npx eslint . --fix
```

---

## 成功指标

- `npx tsc --noEmit` 退出码为0
- `npm run build` 成功完成
- 没有引入新错误
- 改动行数最小（< 受影响文件的5%）
- 测试仍然通过

---

## 什么时候不用这个代理

| 情况 | 应该用 |
|------|--------|
| 代码需要重构 | `refactor-cleaner` |
| 需要架构变更 | `architect` |
| 需要新功能 | `planner` |
| 测试失败 | `tdd-guide` |
| 安全问题 | `security-reviewer` |

---

## 使用方法

### 通过命令调用
```bash
/build-fix
```

### 或者描述构建错误
```
npm run build 失败了，帮我修复
```

---

## 工作流配合

```
[你写代码...]
npm run build          ← 构建失败!
/build-fix             ← build-error-resolver快速修复
npm run build          ← 构建通过!
```

---

## 注意事项

1. **只修错误** - 不要趁机重构或优化
2. **最小改动** - 用最少的代码变更
3. **验证每步** - 每次修复后重新构建验证
4. **不要过度** - 能用类型注解解决的，不要改逻辑
5. **保持专注** - 目标是让构建通过，不是完美代码

---

## 相关代理

- **code-reviewer** - 构建通过后进行代码审查
- **tdd-guide** - 确保测试通过
- **go-build-resolver** - Go语言的构建错误修复
