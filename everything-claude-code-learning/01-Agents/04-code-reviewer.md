# Code-Reviewer（代码审查代理）

## 一句话总结
Code-Reviewer 是一个资深代码审查专家，它会检查你的代码质量、安全性和可维护性，像一位严格但公正的代码评审同事。

---

## 它是什么？（小白视角）

### 用一个比喻来理解

想象你写了一篇作文：

- **没有 Code-Reviewer**：直接交作业，可能有错别字、语法错误、逻辑漏洞
- **有 Code-Reviewer**：交作业前，有位语文老师帮你检查，指出问题和改进建议

**Code-Reviewer 就是那位"语文老师"**，它在代码合并前帮你发现潜在问题。

### 为什么需要代码审查？

| 原因 | 说明 |
|------|------|
| 发现Bug | 作者容易对自己代码"视而不见" |
| 安全漏洞 | 硬编码密钥、SQL注入等安全隐患 |
| 代码质量 | 大函数、深层嵌套、重复代码 |
| 知识共享 | 审查过程也是学习过程 |
| 一致性 | 保持项目代码风格一致 |

---

## 工作原理

```
代码变更 ──→ Code-Reviewer ──→ 收集上下文
    │                              │
    │                              ↓
    │                         git diff查看变更
    │                              │
    │                              ↓
    │                         读取相关代码
    │                              │
    │                              ↓
    │                         应用审查清单
    │                              │
    │                              ↓
    └────────────────←──────── 报告发现的问题
```

### 审查流程

1. **收集上下文** - 运行 `git diff --staged` 和 `git diff` 查看所有变更
2. **理解范围** - 识别哪些文件改变，关联什么功能
3. **阅读周边代码** - 不孤立审查，理解完整上下文
4. **应用审查清单** - 从CRITICAL到LOW逐级检查
5. **报告发现** - 只报告>80%确定是真正问题的事项

---

## 配置详解

```yaml
---
name: code-reviewer                                    # 代理名称
description: Expert code review specialist...          # 描述
tools: ["Read", "Grep", "Glob", "Bash"]               # 只读工具
model: sonnet                                          # 使用Sonnet模型
---
```

---

## 置信度过滤

**重要**: Code-Reviewer 不会泛滥报告问题，而是应用严格的过滤：

- **报告** - 如果>80%确定是真正问题
- **跳过** - 风格偏好（除非违反项目约定）
- **跳过** - 未变更代码中的问题（除非是CRITICAL安全问题）
- **合并** - 类似问题合并报告（如"5个函数缺少错误处理"）
- **优先** - 可能导致bug、安全漏洞或数据丢失的问题

---

## 审查清单

### 🔴 安全 (CRITICAL) - 必须标记

| 问题 | 说明 | 示例 |
|------|------|------|
| 硬编码凭据 | API密钥、密码、令牌在源码中 | `const apiKey = "sk-abc..."` |
| SQL注入 | 字符串拼接查询而非参数化 | `SELECT * FROM users WHERE id = ${userId}` |
| XSS漏洞 | 用户输入未转义渲染 | `innerHTML = userInput` |
| 路径遍历 | 用户控制的文件路径未校验 | `fs.readFile(userPath)` |
| CSRF漏洞 | 状态改变端点无CSRF保护 | POST无token验证 |
| 认证绕过 | 受保护路由缺少认证检查 | 路由无中间件 |
| 不安全依赖 | 已知漏洞的包 | npm audit报错 |
| 日志泄露敏感信息 | 日志记录令牌、密码、PII | `console.log(user.password)` |

#### SQL注入示例

```typescript
// ❌ 错误: SQL注入
const query = `SELECT * FROM users WHERE id = ${userId}`;

// ✅ 正确: 参数化查询
const query = `SELECT * FROM users WHERE id = $1`;
const result = await db.query(query, [userId]);
```

#### XSS示例

```typescript
// ❌ 错误: 直接渲染用户HTML
<div dangerouslySetInnerHTML={{ __html: userComment }} />

// ✅ 正确: 使用文本内容或消毒
<div>{userComment}</div>
// 或
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userComment) }} />
```

---

### 🟠 代码质量 (HIGH)

| 问题 | 说明 |
|------|------|
| 大函数 | >50行，应拆分 |
| 大文件 | >800行，应提取模块 |
| 深嵌套 | >4层，应使用早返回 |
| 缺少错误处理 | 未处理的Promise拒绝、空catch块 |
| 可变模式 | 应优先不可变操作 (spread, map, filter) |
| console.log | 合并前删除调试日志 |
| 缺少测试 | 新代码路径无测试覆盖 |
| 死代码 | 注释掉的代码、未使用的导入 |

#### 重构示例

```typescript
// ❌ 错误: 深嵌套 + 可变
function processUsers(users) {
  if (users) {
    for (const user of users) {
      if (user.active) {
        if (user.email) {
          user.verified = true;  // 可变!
          results.push(user);
        }
      }
    }
  }
  return results;
}

// ✅ 正确: 早返回 + 不可变 + 扁平
function processUsers(users) {
  if (!users) return [];
  return users
    .filter(user => user.active && user.email)
    .map(user => ({ ...user, verified: true }));
}
```

---

### 🟠 React/Next.js模式 (HIGH)

| 问题 | 说明 |
|------|------|
| 缺少依赖数组 | useEffect/useMemo/useCallback依赖不完整 |
| 渲染中更新状态 | setState在渲染期间导致无限循环 |
| 列表缺少key | 使用数组索引作为key（项目可重排时） |
| Prop钻取 | Props传递超过3层（应使用context） |
| 不必要重渲染 | 昂贵计算缺少memoization |
| 客户端/服务端边界 | Server Components中使用useState/useEffect |
| 缺少加载/错误状态 | 数据获取无fallback UI |
| 陈旧闭包 | 事件处理器捕获陈旧状态值 |

#### React示例

```tsx
// ❌ 错误: 缺少依赖，陈旧闭包
useEffect(() => {
  fetchData(userId);
}, []); // userId缺失

// ✅ 正确: 完整依赖
useEffect(() => {
  fetchData(userId);
}, [userId]);
```

```tsx
// ❌ 错误: 使用索引作为key
{items.map((item, i) => <ListItem key={i} item={item} />)}

// ✅ 正确: 稳定的唯一key
{items.map(item => <ListItem key={item.id} item={item} />)}
```

---

### 🟠 Node.js/后端模式 (HIGH)

| 问题 | 说明 |
|------|------|
| 未验证输入 | 请求body/params无schema验证 |
| 缺少限流 | 公共端点无节流 |
| 无界查询 | SELECT * 或无LIMIT的用户查询 |
| N+1查询 | 循环中获取关联数据 |
| 缺少超时 | 外部HTTP调用无超时配置 |
| 错误信息泄露 | 向客户端发送内部错误详情 |
| 缺少CORS配置 | API可从未经授权的源访问 |

#### N+1查询示例

```typescript
// ❌ 错误: N+1查询
const users = await db.query('SELECT * FROM users');
for (const user of users) {
  user.posts = await db.query('SELECT * FROM posts WHERE user_id = $1', [user.id]);
}

// ✅ 正确: 单次查询JOIN或批量
const usersWithPosts = await db.query(`
  SELECT u.*, json_agg(p.*) as posts
  FROM users u
  LEFT JOIN posts p ON p.user_id = u.id
  GROUP BY u.id
`);
```

---

### 🟡 性能 (MEDIUM)

| 问题 | 说明 |
|------|------|
| 低效算法 | O(n²) 而非 O(n log n) 或 O(n) |
| 不必要重渲染 | 缺少React.memo, useMemo, useCallback |
| 大包体积 | 导入整个库而非tree-shakeable替代 |
| 缺少缓存 | 重复昂贵计算无memoization |
| 未优化图片 | 大图片无压缩或懒加载 |
| 同步I/O | 异步上下文中的阻塞操作 |

---

### 🟢 最佳实践 (LOW)

| 问题 | 说明 |
|------|------|
| TODO/FIXME无工单 | TODO应引用issue号 |
| 公共API缺少JSDoc | 导出函数无文档 |
| 命名不佳 | 非平凡上下文中的单字母变量 |
| 魔法数字 | 未解释的数字常量 |
| 格式不一致 | 混合分号、引号风格、缩进 |

---

## 审查输出格式

```text
[CRITICAL] 源码中硬编码API密钥
文件: src/api/client.ts:42
问题: API密钥 "sk-abc..." 暴露在源码中，将被提交到git历史
修复: 移至环境变量并添加到 .gitignore/.env.example

  const apiKey = "sk-abc123";           // ❌ 错误
  const apiKey = process.env.API_KEY;   // ✅ 正确
```

### 摘要格式

每次审查结束都会输出摘要：

```text
## 审查摘要

| 严重性 | 数量 | 状态 |
|--------|------|------|
| CRITICAL | 0    | pass |
| HIGH     | 2    | warn |
| MEDIUM   | 3    | info |
| LOW      | 1    | note |

结论: 警告 — 2个HIGH问题应在合并前解决
```

---

## 审批标准

| 结论 | 条件 | 行动 |
|------|------|------|
| **通过** | 无CRITICAL或HIGH问题 | 可以合并 |
| **警告** | 只有HIGH问题 | 谨慎合并 |
| **阻止** | 发现CRITICAL问题 | 必须修复后合并 |

---

## 使用方法

### 通过命令调用
```bash
/code-review
```

### 或者写完代码后自动触发
```
我刚完成了用户注册功能，帮我审查一下
```

---

## 工作流配合

```
/plan "添加功能"     ← planner制定计划
/tdd                 ← tdd-guide强制测试先行
[你写代码...]
/code-review         ← code-reviewer审查质量
/security-scan       ← security-reviewer安全审查
```

---

## 注意事项

1. **不是挑刺** - 审查是为了提高代码质量，不是批评个人
2. **聚焦变更** - 主要审查本次变更，不追溯历史问题
3. **保持一致** - 遵循项目既有约定
4. **行动导向** - 每个问题都应该有明确的修复建议
5. **优先级** - 先处理CRITICAL和HIGH问题

---

## 相关代理

- **security-reviewer** - 更深入的安全审查
- **tdd-guide** - 确保代码有测试
- **build-error-resolver** - 修复构建错误

## 项目特定约定

Code-Reviewer 会检查项目 `CLAUDE.md` 中的特定约定：

- 文件大小限制
- Emoji策略
- 不可变性要求
- 数据库策略
- 错误处理模式
- 状态管理约定
