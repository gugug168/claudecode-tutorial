# Refactor-Cleaner（重构清理代理）

## 一句话总结
Refactor-Cleaner 是一个死代码清理专家，它会帮你找出项目中没用到的代码、重复的代码、多余的依赖，然后安全地删除它们。

---

## 它是什么？（小白视角）

### 用一个比喻来理解

想象你的房间：

- **没有 Refactor-Cleaner**：旧衣服、坏掉的电器、不用的杂物越积越多，房间越来越挤
- **有 Refactor-Cleaner**：有位整理专家帮你找出所有不用的东西，安全地清理掉

**Refactor-Cleaner 就是那位"整理专家"**，它帮你清理代码库中的"垃圾"。

### 什么需要清理？

| 类型 | 说明 |
|------|------|
| 死代码 | 没有被调用的函数、变量 |
| 未使用的导出 | 导出了但没人导入 |
| 未使用的依赖 | package.json中有但代码没用到 |
| 重复代码 | 多个地方有相同或类似的代码 |

---

## 工作原理

```
代码库 ──→ Refactor-Cleaner ──→ 运行检测工具
    │                              │
    │                              ↓
    │                         分类发现（安全/小心/危险）
    │                              │
    │                              ↓
    │                         验证每个项目
    │                              │
    │                              ↓
    │                         安全删除（分批）
    │                              │
    │                              ↓
    └─────────────────←───────── 验证测试通过
```

---

## 配置详解

```yaml
---
name: refactor-cleaner                               # 代理名称
description: Dead code cleanup and consolidation...  # 描述
tools: ["Read", "Write", "Edit", "Bash", "Grep", "Glob"]  # 可读写执行
model: sonnet                                        # 使用Sonnet模型
---
```

---

## 核心职责

1. **死代码检测** - 找出未使用的代码、导出、依赖
2. **重复消除** - 识别和合并重复代码
3. **依赖清理** - 移除未使用的npm包和导入
4. **安全重构** - 确保变更不破坏功能

---

## 检测命令

```bash
# 检测未使用的文件、导出、依赖
npx knip

# 检测未使用的npm依赖
npx depcheck

# 检测未使用的TypeScript导出
npx ts-prune

# 检测未使用的eslint指令
npx eslint . --report-unused-disable-directives
```

---

## 工作流程

### 1. 分析

并行运行检测工具，分类发现：

| 风险级别 | 类型 | 说明 |
|----------|------|------|
| **安全** | 未使用的导出/依赖 | 可以直接删除 |
| **小心** | 动态导入 | 需要检查字符串模式 |
| **危险** | 公共API | 可能被外部使用 |

### 2. 验证

对每个要删除的项目：

1. **Grep搜索所有引用**（包括通过字符串模式的动态导入）
2. **检查是否属于公共API**
3. **查看git历史**了解上下文

```bash
# 搜索引用
grep -r "functionName" src/

# 搜索动态导入
grep -r "import('.*module')" src/

# 查看git历史
git log --oneline -- path/to/file.ts
```

### 3. 安全删除

- 只从SAFE项目开始
- 一次删除一个类别：依赖 → 导出 → 文件 → 重复
- 每批之后运行测试
- 每批之后提交

```bash
# 删除顺序
1. npm包依赖 (depcheck确认未使用)
2. TypeScript导出 (ts-prune确认未使用)
3. 整个文件 (knip确认未使用)
4. 重复代码 (手动合并)
```

### 4. 合并重复

```typescript
// 发现重复
// src/utils/date.ts
export function formatDate(date: Date): string { ... }

// src/helpers/date.ts
export function formatDate(date: Date): string { ... }

// 选择最佳实现（最完整、测试最好）
// 保留 src/utils/date.ts
// 删除 src/helpers/date.ts
// 更新所有导入
```

---

## 安全检查清单

### 删除前

- [ ] 检测工具确认未使用
- [ ] Grep确认无引用（包括动态）
- [ ] 不是公共API的一部分
- [ ] 删除后测试通过

### 每批之后

- [ ] 构建成功
- [ ] 测试通过
- [ ] 提交并写好描述信息

---

## 关键原则

1. **从小开始** - 一次一个类别
2. **经常测试** - 每批之后都测试
3. **保守行事** - 有疑问就不删除
4. **记录文档** - 每批写好提交信息
5. **绝不删除** - 在活跃功能开发期间或部署前

---

## 什么时候不该用

| 情况 | 原因 |
|------|------|
| 活跃功能开发中 | 可能误删正在开发的代码 |
| 生产部署前 | 风险太大 |
| 测试覆盖不足 | 无法验证删除安全性 |
| 不理解的代码 | 可能误删重要代码 |

---

## 成功指标

- [ ] 所有测试通过
- [ ] 构建成功
- [ ] 无回归
- [ ] 包体积减小

---

## 使用方法

### 通过命令调用
```bash
/refactor-clean
```

### 或者描述清理需求
```
帮我检查项目里有没有没用的代码和依赖
```

---

## 工作流配合

```
[项目开发一段时间...]
/refactor-clean        ← refactor-cleaner清理死代码
/code-review           ← code-reviewer审查变更
```

---

## 注意事项

1. **先备份** - 大规模删除前确保有git提交
2. **分批处理** - 不要一次性删除太多
3. **验证测试** - 每次删除后都要运行测试
4. **保守原则** - 有任何疑问就不删除
5. **记录原因** - 提交信息说明为什么删除

---

## 相关代理

- **code-reviewer** - 清理后审查变更
- **build-error-resolver** - 如果删除后构建失败

## 实用技巧

### 检查动态导入

```typescript
// 这不会被ts-prune检测到
const module = await import(`./modules/${moduleName}`);

// 需要手动搜索
grep -r "import.*modules" src/
```

### 检查反射/元数据

```typescript
// 这也不会被自动检测
@Injectable()  // 装饰器可能通过反射使用类
class MyService {}
```

### 检查配置文件引用

```bash
# 检查是否在配置文件中被引用
grep -r "moduleName" *.json *.yaml *.yml
```
