# Agents 总览

## 什么是 Agents（子代理）？

Agents 是专门处理特定任务的"专家"。当主 Claude 遇到特定领域的问题时，可以把任务委托给它们。

### 用一个比喻

想象你开了一家公司：
- **主 Claude** = CEO，负责协调和决策
- **Agents** = 各部门专家（财务、法务、技术、安全等）

当 CEO 遇到财务问题时，会请财务专家处理；遇到安全问题时，会请安全专家处理。

---

## 所有代理一览（13个）

### 规划与设计

| 代理 | 作用 | 什么时候用 |
|------|------|-----------|
| [planner](./01-planner.md) | 功能规划 | 开始新功能时制定实施计划 |
| [architect](./02-architect.md) | 架构设计 | 需要做系统架构决策时 |

### 开发与测试

| 代理 | 作用 | 什么时候用 |
|------|------|-----------|
| [tdd-guide](./03-tdd-guide.md) | TDD指导 | 想用测试驱动开发方式写代码 |
| [code-reviewer](./04-code-reviewer.md) | 代码审查 | 检查代码质量和安全性 |
| [e2e-runner](./07-e2e-runner.md) | E2E测试 | 运行端到端测试 |

### 安全与质量

| 代理 | 作用 | 什么时候用 |
|------|------|-----------|
| [security-reviewer](./05-security-reviewer.md) | 安全审查 | 查找安全漏洞 |

### 错误修复

| 代理 | 作用 | 什么时候用 |
|------|------|-----------|
| [build-error-resolver](./06-build-error-resolver.md) | 构建错误解决 | TypeScript/JS构建失败时 |
| [go-build-resolver](./11-go-build-resolver.md) | Go构建错误 | Go构建失败时 |

### 重构与文档

| 代理 | 作用 | 什么时候用 |
|------|------|-----------|
| [refactor-cleaner](./08-refactor-cleaner.md) | 重构清理 | 删除死代码、清理依赖 |
| [doc-updater](./09-doc-updater.md) | 文档更新 | 同步更新文档和代码地图 |

### 语言特定

| 代理 | 作用 | 什么时候用 |
|------|------|-----------|
| [go-reviewer](./10-go-reviewer.md) | Go代码审查 | 审查Go语言代码 |
| [python-reviewer](./12-python-reviewer.md) | Python审查 | 审查Python代码 |
| [database-reviewer](./13-database-reviewer.md) | 数据库审查 | 审查数据库相关代码 |

---

## 代理如何工作

### 1. 触发方式

**手动触发**：
```bash
/plan "添加用户认证"
/code-review
/security-scan
```

**自动触发**：
- 当 Claude 检测到特定领域的问题时，自动委托给相应代理

### 2. 代理配置结构

每个代理都有一个配置头：

```yaml
---
name: agent-name                    # 代理名称
description: 代理描述...             # 什么时候用这个代理
tools: ["Read", "Grep", "Glob"]     # 可用的工具
model: opus/sonnet/haiku            # 使用的模型
---
```

### 3. 工具权限

| 工具 | 作用 | 只读代理 | 可写代理 |
|------|------|----------|----------|
| Read | 读取文件 | ✅ | ✅ |
| Grep | 搜索内容 | ✅ | ✅ |
| Glob | 查找文件 | ✅ | ✅ |
| Bash | 执行命令 | ✅ | ✅ |
| Write | 创建文件 | ❌ | ✅ |
| Edit | 编辑文件 | ❌ | ✅ |

---

## 常用工作流

### 新功能开发

```
/plan "功能描述"    → planner 制定计划
/tdd               → tdd-guide 指导TDD开发
[写代码...]
/code-review       → code-reviewer 审查代码
/security-scan     → security-reviewer 安全检查
```

### 修复Bug

```
/tdd               → tdd-guide: 先写失败测试
[修复代码...]
/code-review       → code-reviewer: 检查回归
```

### 生产准备

```
/security-scan     → security-reviewer: OWASP Top 10审计
/e2e               → e2e-runner: 关键用户流程测试
/test-coverage     → 验证80%+覆盖率
```

### Go项目

```
/go-review         → go-reviewer: Go代码审查
/go-build          → go-build-resolver: 构建错误修复
/go-test           → 运行Go测试
```

### Python项目

```
/python-review     → python-reviewer: Python代码审查
pytest             → 运行测试
```

---

## 模型选择

不同代理使用不同模型，平衡成本和质量：

| 模型 | 用途 | 代理 |
|------|------|------|
| **opus** | 深度思考、复杂决策 | planner, architect |
| **sonnet** | 平衡成本和质量 | 大多数代理 |
| **haiku** | 简单任务、节省成本 | doc-updater |

---

## 代理 vs 命令 vs 技能

| 组件 | 作用 | 触发方式 |
|------|------|----------|
| **Agents** | 独立处理任务 | 自动或通过命令委托 |
| **Commands** | 快速执行特定任务 | `/命令名` |
| **Skills** | 定义工作流程 | 被代理或命令引用 |

**关系**：命令调用代理，代理使用技能中的知识。

---

## 学习建议

1. **先学常用代理**：planner, code-reviewer, tdd-guide
2. **按需学习语言特定代理**：go-reviewer, python-reviewer
3. **了解触发条件**：知道什么时候会自动触发
4. **配合使用**：多个代理可以串联使用

---

## 详细文档

点击查看各代理的详细文档：

1. [Planner - 功能规划代理](./01-planner.md)
2. [Architect - 架构设计代理](./02-architect.md)
3. [TDD-Guide - 测试驱动开发代理](./03-tdd-guide.md)
4. [Code-Reviewer - 代码审查代理](./04-code-reviewer.md)
5. [Security-Reviewer - 安全审查代理](./05-security-reviewer.md)
6. [Build-Error-Resolver - 构建错误解决代理](./06-build-error-resolver.md)
7. [E2E-Runner - 端到端测试代理](./07-e2e-runner.md)
8. [Refactor-Cleaner - 重构清理代理](./08-refactor-cleaner.md)
9. [Doc-Updater - 文档更新代理](./09-doc-updater.md)
10. [Go-Reviewer - Go代码审查代理](./10-go-reviewer.md)
11. [Go-Build-Resolver - Go构建错误代理](./11-go-build-resolver.md)
12. [Python-Reviewer - Python代码审查代理](./12-python-reviewer.md)
13. [Database-Reviewer - 数据库审查代理](./13-database-reviewer.md)
