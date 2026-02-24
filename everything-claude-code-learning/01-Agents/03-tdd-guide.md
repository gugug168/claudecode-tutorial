# TDD-Guide（测试驱动开发代理）

## 一句话总结
TDD-Guide 是一个测试驱动开发专家，它会强制你"先写测试，再写代码"，确保你的代码有全面的测试覆盖。

---

## 它是什么？（小白视角）

### 用一个比喻来理解

想象你要做一道菜：

- **普通开发**：直接做菜，做完后尝一口看看能不能吃
- **TDD开发**：先定义"好吃的菜"的标准（咸淡、火候、口感），然后按标准做菜，每一步都验证是否符合标准

**TDD-Guide 就是那个帮你定义标准和验证的"美食评论家"**，它确保你的代码在做之前就有明确的验证标准。

### 什么是 TDD？

TDD = Test-Driven Development（测试驱动开发）

核心思想：**先写失败的测试，再写代码让测试通过**

```
┌─────────────────────────────────────────────┐
│                 TDD 循环                      │
│                                              │
│     ┌─────────┐                             │
│     │  RED    │ → 写一个失败的测试            │
│     └────┬────┘                             │
│          ↓                                   │
│     ┌─────────┐                             │
│     │  GREEN  │ → 写最少代码让测试通过        │
│     └────┬────┘                             │
│          ↓                                   │
│     ┌─────────┐                             │
│     │ REFACTOR│ → 重构优化，测试保持通过      │
│     └────┬────┘                             │
│          │                                   │
│          └────────────────→ 重复...          │
└─────────────────────────────────────────────┘
```

---

## 工作原理

```
开发任务 ──→ TDD-Guide ──→ 要求先写测试
    │                           │
    │                           ↓
    │                     测试是否失败?
    │                      ↓        ↓
    │                    是        否 ← 测试无效，重写
    │                      │
    │                      ↓
    │               写最少代码让测试通过
    │                      │
    │                      ↓
    │                    测试通过?
    │                      │
    │                      ↓
    │                    重构优化
    │                      │
    │                      ↓
    └────────────────←─── 验证覆盖率80%+
```

---

## 配置详解

```yaml
---
name: tdd-guide                                    # 代理名称
description: Test-Driven Development specialist... # 描述
tools: ["Read", "Write", "Edit", "Bash", "Grep"]  # 可读可写可执行
model: sonnet                                      # 使用Sonnet模型（平衡成本和质量）
---
```

### 配置项解释

| 配置项 | 值 | 为什么这样设置 |
|--------|-----|----------------|
| tools | Read, Write, Edit, Bash, Grep | 需要写测试、运行测试 |
| model | sonnet | TDD任务相对标准，sonnet足够 |

---

## TDD 工作流程

### 1. 写测试（RED）
先写一个失败的测试，描述期望的行为：

```typescript
// 测试：用户登录成功后应该返回token
test('login returns token on success', async () => {
  const result = await login('user@test.com', 'password123');
  expect(result.token).toBeDefined();
  expect(result.user.email).toBe('user@test.com');
});
```

### 2. 运行测试 -- 确认失败
```bash
npm test
# ❌ FAIL: login is not defined
```

**重要**: 测试必须失败！如果测试一开始就通过，说明测试有问题。

### 3. 写最小实现（GREEN）
只写足够让测试通过的代码：

```typescript
async function login(email: string, password: string) {
  // 最小实现，刚够让测试通过
  return {
    token: 'fake-token',
    user: { email }
  };
}
```

### 4. 运行测试 -- 确认通过
```bash
npm test
# ✅ PASS: login returns token on success
```

### 5. 重构（IMPROVE）
清理代码，优化结构，但测试必须保持通过：

```typescript
async function login(email: string, password: string) {
  const user = await db.users.findByEmail(email);
  if (!user) throw new Error('User not found');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new Error('Invalid password');

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
  return { token, user: { email: user.email } };
}
```

### 6. 验证覆盖率
```bash
npm run test:coverage
# 要求: 80%+ 分支、函数、行、语句覆盖率
```

---

## 必须的测试类型

| 类型 | 测试什么 | 什么时候 |
|------|----------|----------|
| **单元测试** | 独立测试单个函数 | 总是 |
| **集成测试** | API端点、数据库操作 | 总是 |
| **E2E测试** | 关键用户流程 (Playwright) | 关键路径 |

---

## 必须测试的边界情况

TDD-Guide 会强制你测试这些场景：

1. **Null/Undefined** 输入
2. **空** 数组/字符串
3. **无效类型** 传入
4. **边界值** (最小/最大)
5. **错误路径** (网络失败、数据库错误)
6. **竞态条件** (并发操作)
7. **大数据** (10k+条目的性能)
8. **特殊字符** (Unicode、emoji、SQL字符)

### 示例

```typescript
describe('login function', () => {
  // 正常情况
  test('returns token for valid credentials', async () => {
    const result = await login('user@test.com', 'valid-password');
    expect(result.token).toBeDefined();
  });

  // 边界情况
  test('throws for null email', async () => {
    await expect(login(null, 'password')).rejects.toThrow();
  });

  test('throws for empty password', async () => {
    await expect(login('user@test.com', '')).rejects.toThrow('Password required');
  });

  // 错误路径
  test('throws for invalid credentials', async () => {
    await expect(login('user@test.com', 'wrong-password')).rejects.toThrow('Invalid credentials');
  });

  // 特殊字符
  test('handles unicode in email', async () => {
    const result = await login('用户@测试.com', 'password');
    expect(result.user.email).toBe('用户@测试.com');
  });
});
```

---

## 要避免的测试反模式

### ❌ 错误做法

```typescript
// 反模式1: 测试实现细节而不是行为
test('internal state is set', () => {
  const component = new Component();
  component.doSomething();
  expect(component._internalState).toBe('x'); // ❌ 不应该测试私有状态
});

// 反模式2: 测试相互依赖
let sharedData;
test('test1', () => {
  sharedData = createData();
});
test('test2', () => {
  use(sharedData); // ❌ 测试不应该共享状态
});

// 反模式3: 断言太少
test('something works', () => {
  const result = doSomething();
  expect(result).toBeTruthy(); // ❌ 断言太弱，什么都验证不了
});

// 反模式4: 不mock外部依赖
test('saves to database', async () => {
  await saveToDatabase(data); // ❌ 没有mock，会真正写入数据库
});
```

### ✅ 正确做法

```typescript
// 正确: 测试行为
test('component renders correctly', () => {
  render(<Component />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});

// 正确: 测试独立
test('test1', () => {
  const data = createData();
  expect(data).toBeDefined();
});
test('test2', () => {
  const data = createData(); // 每个测试创建自己的数据
  expect(use(data)).toBe(true);
});

// 正确: 具体断言
test('something works', () => {
  const result = doSomething();
  expect(result.status).toBe('success');
  expect(result.data.id).toBeGreaterThan(0);
});

// 正确: Mock外部依赖
test('saves to database', async () => {
  const mockDb = { save: jest.fn().mockResolvedValue({ id: 1 }) };
  await saveToDatabase(data, mockDb);
  expect(mockDb.save).toHaveBeenCalledWith(data);
});
```

---

## 质量检查清单

TDD-Guide 会检查：

- [ ] 所有公共函数都有单元测试
- [ ] 所有API端点都有集成测试
- [ ] 关键用户流程有E2E测试
- [ ] 边界情况已覆盖 (null, 空, 无效)
- [ ] 错误路径已测试 (不只是正常路径)
- [ ] Mock了外部依赖
- [ ] 测试相互独立 (无共享状态)
- [ ] 断言具体且有意义
- [ ] 覆盖率达到80%+

---

## 使用方法

### 通过命令调用
```bash
/tdd "实现用户登录功能"
```

### 或者直接描述需求
```
我想用TDD方式实现一个购物车功能
```

TDD-Guide 会引导你一步步完成。

---

## 与其他代理配合

```
/plan "添加购物车"    ← planner制定计划
/tdd                   ← tdd-guide强制测试先行
/code-review           ← code-reviewer检查代码质量
```

---

## 注意事项

1. **测试必须先失败** - 如果测试一开始就通过，说明测试无效
2. **最小实现** - GREEN阶段只写最少的代码，优化留给REFACTOR
3. **覆盖率不是目的** - 80%覆盖率是手段，真正重要的是测试质量
4. **Mock外部依赖** - 数据库、API、文件系统都应该mock
5. **保持测试简单** - 复杂的测试本身就需要测试

---

## 相关代理

- **planner** - 获得TDD开发计划
- **code-reviewer** - 代码审查
- **e2e-runner** - E2E测试
- **build-error-resolver** - 测试失败时修复构建

## 相关技能

- `skill: tdd-workflow` - 更详细的TDD模式和框架示例
