# 05-Hooks配置

> 本文件扩展了 [通用 Hooks 配置](../common/hooks.md)，添加 TypeScript/JavaScript 特定内容。

## 📋 概述

这个规则定义了 TypeScript/JavaScript 项目的 Hooks 配置，包括：
- **PostToolUse Hooks**：工具执行后的自动操作
- **Stop Hooks**：会话结束前的检查

---

## 1️⃣ PostToolUse Hooks（工具执行后钩子）

### 🎯 什么是 PostToolUse Hook？

**PostToolUse Hook** 是在每次使用工具（如 Edit、Write）后自动执行的脚本，就像：

```
你编辑文件 → Hook 自动执行 → 检查/修复问题
```

```
┌─────────────────────────────────────┐
│         PostToolUse Hook 的好处      │
├─────────────────────────────────────┤
│ ✅ 自动化：无需手动执行              │
│ ✅ 即时反馈：立即发现问题            │
│ ✅ 代码质量：保持代码风格一致        │
│ ✅ 节省时间：自动化重复任务          │
└─────────────────────────────────────┘
```

### ⚙️ 配置位置

在 `~/.claude/settings.json` 中配置：

```json
{
  "hooks": {
    "postToolUse": [
      {
        "name": "prettier",
        "command": "prettier --write {{filePaths}}",
        "include": ["**/*.js", "**/*.ts", "**/*.jsx", "**/*.tsx"]
      },
      {
        "name": "typescript-check",
        "command": "tsc --noEmit",
        "include": ["**/*.ts", "**/*.tsx"]
      },
      {
        "name": "console-log-warning",
        "command": "node -e \"console.warn('⚠️  Console.log detected in:', process.argv[1])\"",
        "include": ["**/*.js", "**/*.ts", "**/*.jsx", "**/*.tsx"],
        "condition": "grep -l 'console.log' {{filePaths}}"
      }
    ]
  }
}
```

---

## 2️⃣ Prettier Hook（自动格式化）

### 🎨 什么是 Prettier？

**Prettier** 是一个代码格式化工具，就像自动修图软件：
- 统一缩进（2 空格 vs 4 空格）
- 统一引号（单引号 vs 双引号）
- 统一行尾（分号有无）
- 统一换行规则

### 📝 配置示例

```json
{
  "name": "prettier",
  "command": "prettier --write {{filePaths}}",
  "include": ["**/*.js", "**/*.ts", "**/*.jsx", "**/*.tsx"]
}
```

### 🔄 工作流程

```
你编辑文件 → Prettier 自动格式化 → 保存格式化后的文件
```

### 📊 格式化前后对比

```javascript
// ❌ 格式化前：混乱的代码
const  user={name:"张三",age:25,getEmail:function(){return this.email}}
function  add( a,b ){return a+b}

// ✅ 格式化后：整洁的代码
const user = {
  name: '张三',
  age: 25,
  getEmail() {
    return this.email
  }
}

function add(a, b) {
  return a + b
}
```

---

## 3️⃣ TypeScript 检查 Hook

### 🔍 什么是 TypeScript 检查？

**TypeScript 检查**（`tsc`）会在编辑 `.ts`/`.tsx` 文件后自动运行，检测类型错误：

```json
{
  "name": "typescript-check",
  "command": "tsc --noEmit",
  "include": ["**/*.ts", "**/*.tsx"]
}
```

### 🎯 检测的错误类型

| 错误类型 | 示例 |
|---------|------|
| **类型不匹配** | `const num: number = "string"` |
| **属性不存在** | `user.namee` （拼写错误） |
| **缺少参数** | `function add(a, b)` 调用时只传一个参数 |
| **null/undefined** | 可能的空值访问 |

### 📝 错误输出示例

```bash
$ tsc --noEmit

src/user.ts:10:5 - error TS2322: Type 'string' is not assignable to type 'number'.

10   age: "25",       // ❌ 类型错误
       ~~~~~~~~~~~~~

Found 1 error in src/user.ts:10
```

---

## 4️⃣ Console.log 警告 Hook

### 🚨 为什么需要警告？

`console.log` 是调试工具，不应该留在生产代码中：

```json
{
  "name": "console-log-warning",
  "command": "node -e \"console.warn('⚠️  Console.log detected in:', process.argv[1])\"",
  "include": ["**/*.js", "**/*.ts", "**/*.jsx", "**/*.tsx"],
  "condition": "grep -l 'console.log' {{filePaths}}"
}
```

### 🎯 工作原理

```
你编辑文件 → Hook 检查文件内容 → 发现 console.log → 显示警告
```

### 📊 警告输出示例

```bash
⚠️  Console.log detected in: /project/src/user.ts
```

---

## 5️⃣ Stop Hooks（会话结束钩子）

### 🎯 什么是 Stop Hook？

**Stop Hook** 在会话结束前执行，进行最终检查：

```json
{
  "hooks": {
    "stop": [
      {
        "name": "console-log-audit",
        "command": "git diff --name-only | xargs grep -l 'console.log' || echo '✅ No console.log found'"
      }
    ]
  }
}
```

### 🔍 Console.log 审计

在会话结束前检查所有修改的文件中是否有 `console.log`：

```bash
# 命令说明
git diff --name-only    # 获取所有修改的文件
| xargs grep -l 'console.log'   # 搜索包含 console.log 的文件
|| echo '✅ No console.log found'  # 如果没有找到，显示成功消息
```

### 📊 输出示例

```bash
# 如果发现 console.log
src/user.ts
src/auth.js

# 如果没有发现
✅ No console.log found
```

---

## 6️⃣ 完整配置示例

### 📝 settings.json 完整配置

```json
{
  "hooks": {
    "postToolUse": [
      {
        "name": "prettier",
        "command": "prettier --write {{filePaths}}",
        "include": ["**/*.js", "**/*.ts", "**/*.jsx", "**/*.tsx"]
      },
      {
        "name": "typescript-check",
        "command": "tsc --noEmit",
        "include": ["**/*.ts", "**/*.tsx"]
      },
      {
        "name": "console-log-warning",
        "command": "node -e \"console.warn('⚠️  Console.log detected in:', process.argv[1])\"",
        "include": ["**/*.js", "**/*.ts", "**/*.jsx", "**/*.tsx"],
        "condition": "grep -l 'console.log' {{filePaths}}"
      }
    ],
    "stop": [
      {
        "name": "console-log-audit",
        "command": "git diff --name-only | xargs grep -l 'console.log' || echo '✅ No console.log found'"
      }
    ]
  }
}
```

---

## 🎓 总结

| Hook 类型 | 用途 | 执行时机 |
|----------|------|---------|
| **Prettier** | 自动格式化代码 | 编辑文件后 |
| **TypeScript 检查** | 检测类型错误 | 编辑 `.ts`/`.tsx` 后 |
| **Console.log 警告** | 警告调试语句 | 编辑包含 console.log 的文件后 |
| **Console.log 审计** | 最终检查 | 会话结束前 |

### 🔄 Hooks 工作流程

```
┌─────────────┐
│ 编辑文件    │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────┐
│ PostToolUse Hooks 执行          │
├─────────────────────────────────┤
│ 1. Prettier 格式化              │
│ 2. TypeScript 类型检查          │
│ 3. Console.log 警告             │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────┐
│ 继续工作... │
└─────────────┘

...（会话结束前）

┌─────────────────────────────────┐
│ Stop Hooks 执行                 │
├─────────────────────────────────┤
│ Console.log 审计                │
└─────────────────────────────────┘
```

---

## 📖 相关资源

- **通用 Hooks 配置**：[通用 Hooks](../common/hooks.md)
- **编码风格**：[01-编码风格.md](./01-编码风格.md)
- **Prettier 文档**：[https://prettier.io](https://prettier.io)
- **TypeScript 文档**：[https://www.typescriptlang.org](https://www.typescriptlang.org)
- **Claude Code Hooks 指南**：[官方文档](https://docs.anthropic.com/claude-code)
