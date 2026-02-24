# Commands 总览

## 什么是 Commands（命令）？

Commands 是快速执行特定任务的"快捷键"，以 `/` 开头。它们让你用简短的指令触发复杂的工作流程。

### 用一个比喻

- **Agents** = 专家顾问（需要被委托）
- **Skills** = 操作手册（需要被查阅）
- **Commands** = 快捷键（一键触发）

**Commands 就是你的"快捷键"**，让你用一句话就能启动复杂的工作流程。

---

## 所有命令一览（31个）

### 规划与设计

| 命令 | 作用 | 调用的代理 |
|------|------|-----------|
| `/plan "描述"` | 创建实施计划 | planner |
| `/orchestrate` | 多代理协调 | 多个代理 |

### 开发与测试

| 命令 | 作用 | 调用的代理 |
|------|------|-----------|
| `/tdd` | TDD工作流 | tdd-guide |
| `/code-review` | 代码审查 | code-reviewer |
| `/build-fix` | 修复构建错误 | build-error-resolver |
| `/e2e` | E2E测试 | e2e-runner |
| `/refactor-clean` | 清理死代码 | refactor-cleaner |
| `/test-coverage` | 测试覆盖率分析 | - |

### Go 相关

| 命令 | 作用 | 调用的代理 |
|------|------|-----------|
| `/go-review` | Go代码审查 | go-reviewer |
| `/go-test` | Go TDD工作流 | - |
| `/go-build` | Go构建修复 | go-build-resolver |

### Python 相关

| 命令 | 作用 | 调用的代理 |
|------|------|-----------|
| `/python-review` | Python代码审查 | python-reviewer |

### 持续学习

| 命令 | 作用 |
|------|------|
| `/learn` | 从当前会话提取模式 |
| `/instinct-status` | 查看已学习的直觉 |
| `/instinct-import` | 导入直觉 |
| `/instinct-export` | 导出直觉 |
| `/evolve` | 将直觉聚类成技能 |
| `/skill-create` | 从git历史生成技能 |

### 验证与检查

| 命令 | 作用 |
|------|------|
| `/checkpoint` | 保存验证状态 |
| `/verify` | 运行验证循环 |
| `/eval` | 根据标准评估 |

### 多代理协作

| 命令 | 作用 |
|------|------|
| `/multi-plan` | 多模型协作规划 |
| `/multi-execute` | 多模型协作执行 |
| `/multi-backend` | 后端多服务编排 |
| `/multi-frontend` | 前端多服务编排 |
| `/multi-workflow` | 通用多服务工作流 |

### 其他

| 命令 | 作用 |
|------|------|
| `/pm2` | PM2服务生命周期管理 |
| `/sessions` | 会话历史管理 |
| `/update-docs` | 更新文档 |
| `/update-codemaps` | 更新代码地图 |
| `/setup-pm` | 配置包管理器 |

---

## 命令如何工作

### 1. 基本结构

每个命令都有一个配置文件：

```yaml
---
description: 命令描述
---

# 命令名称

命令的具体内容...
```

### 2. 调用代理

很多命令会调用代理：

```
/plan "描述"
    │
    └──→ planner 代理
              │
              └──→ 使用 skills/planner 中的知识
```

### 3. 等待确认

重要的命令（如 `/plan`）会**等待你确认**后才执行：

```
/plan "添加用户认证"
    │
    └──→ planner 生成计划
              │
              └──→ "WAITING FOR CONFIRMATION: 确认这个计划吗？"
                        │
                        └──→ 你回复 "yes" 或 "modify: ..."
```

---

## 常用工作流

### 新功能开发

```bash
/plan "添加购物车功能"    # 1. 制定计划
/tdd                       # 2. TDD开发
/code-review               # 3. 代码审查
```

### 修复Bug

```bash
/tdd                       # 1. 先写失败测试
[修复代码...]
/code-review               # 2. 检查回归
```

### 生产准备

```bash
/e2e                       # 1. E2E测试
/test-coverage             # 2. 检查覆盖率
/verify                    # 3. 验证循环
```

### Go项目

```bash
/go-review                 # 1. Go代码审查
/go-test                   # 2. 运行测试
/go-build                  # 3. 修复构建（如果需要）
```

---

## 命令详解示例

### /plan 命令

**作用**：重述需求、评估风险、创建分步实施计划

**使用**：
```bash
/plan 我需要添加实时通知功能
```

**输出**：
1. 需求重述
2. 分阶段计划
3. 依赖关系
4. 风险评估
5. 复杂度估计
6. **等待确认**

### /tdd 命令

**作用**：启动测试驱动开发工作流

**使用**：
```bash
/tdd
```

**效果**：强制先写测试，再写代码

### /code-review 命令

**作用**：审查代码质量、安全性、可维护性

**使用**：
```bash
/code-review
```

**输出**：按严重性分类的问题列表

---

## 创建自定义命令

### 命令模板

```markdown
---
description: 简短描述命令的作用
---

# 命令名称

详细说明这个命令做什么...

## 步骤

1. 第一步
2. 第二步
3. ...

## 示例

\`\`\`bash
/your-command "参数"
\`\`\`
```

### 保存位置

```
~/.claude/commands/your-command.md
```

---

## 关键要点

1. **命令是快捷键** - 用一句话触发复杂工作流
2. **多数命令调用代理** - 代理执行具体工作
3. **重要命令等待确认** - 不会自动执行需要确认的计划
4. **可以串联使用** - 多个命令组成工作流
5. **可以自定义** - 创建你自己的命令

---

## 相关文档

- [Agents 总览](../01-Agents/00-agents总览.md) - 了解各代理的职责
- [Skills 总览](../02-Skills/00-skills总览.md) - 了解各技能的内容
