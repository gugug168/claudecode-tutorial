# Skills 总览

## 什么是 Skills（技能）？

Skills 是预定义的工作流程，告诉 Claude "如何"完成某类任务。它们包含特定领域的知识、最佳实践和具体实现模式。

### 用一个比喻

- **Agents** = 各部门专家（谁来做）
- **Commands** = 快捷键（快速执行）
- **Skills** = 操作指南（怎么做）

**Skills 就是详细的"操作指南"**，它告诉 Claude 在特定场景下应该遵循什么步骤和模式。

---

## 所有技能一览（37个）

### 编码标准类

| 技能 | 作用 | 什么时候激活 |
|------|------|-------------|
| [coding-standards](./编码标准/coding-standards.md) | 通用编码最佳实践 | 开始新项目、代码审查、重构 |
| [java-coding-standards](./编码标准/java-coding-standards.md) | Java编码标准 | Java项目 |

### 前端模式类

| 技能 | 作用 | 什么时候激活 |
|------|------|-------------|
| [frontend-patterns](./前端模式/frontend-patterns.md) | React、Next.js模式 | 构建组件、状态管理、性能优化 |

### 后端模式类

| 技能 | 作用 | 什么时候激活 |
|------|------|-------------|
| [backend-patterns](./后端模式/backend-patterns.md) | API设计、数据库优化 | 设计API、缓存、后台任务 |
| [golang-patterns](./后端模式/golang-patterns.md) | Go语言惯用法 | Go项目 |
| [python-patterns](./后端模式/python-patterns.md) | Python惯用法 | Python项目 |
| [django-patterns](./后端模式/django-patterns.md) | Django模式 | Django项目 |
| [springboot-patterns](./后端模式/springboot-patterns.md) | Spring Boot模式 | Spring Boot项目 |
| [jpa-patterns](./后端模式/jpa-patterns.md) | JPA/Hibernate模式 | JPA项目 |
| [api-design](./后端模式/api-design.md) | REST API设计 | 设计API |

### 数据库相关类

| 技能 | 作用 | 什么时候激活 |
|------|------|-------------|
| [postgres-patterns](./数据库相关/postgres-patterns.md) | PostgreSQL优化 | SQL查询、Schema设计 |
| [database-migrations](./数据库相关/database-migrations.md) | 数据库迁移模式 | Prisma、Drizzle、Django迁移 |
| [clickhouse-io](./数据库相关/clickhouse-io.md) | ClickHouse分析 | 数据分析、大规模查询 |

### 测试相关类

| 技能 | 作用 | 什么时候激活 |
|------|------|-------------|
| [tdd-workflow](./测试相关/tdd-workflow.md) | TDD方法论 | 写新功能、修bug、重构 |
| [golang-testing](./测试相关/golang-testing.md) | Go测试模式 | Go测试 |
| [python-testing](./测试相关/python-testing.md) | pytest测试 | Python测试 |
| [cpp-testing](./测试相关/cpp-testing.md) | C++ GoogleTest测试 | C++测试 |
| [django-tdd](./测试相关/django-tdd.md) | Django TDD | Django测试 |
| [springboot-tdd](./测试相关/springboot-tdd.md) | Spring Boot TDD | Spring Boot测试 |
| [e2e-testing](./测试相关/e2e-testing.md) | Playwright E2E测试 | 端到端测试 |

### 安全相关类

| 技能 | 作用 | 什么时候激活 |
|------|------|-------------|
| [security-review](./安全相关/security-review.md) | 安全检查清单 | 安全审查 |
| [security-scan](./安全相关/security-scan.md) | AgentShield安全审计 | 漏洞扫描 |
| [django-security](./安全相关/django-security.md) | Django安全 | Django安全 |
| [springboot-security](./安全相关/springboot-security.md) | Spring Boot安全 | Spring Boot安全 |

### 持续学习类

| 技能 | 作用 | 什么时候激活 |
|------|------|-------------|
| [continuous-learning](./持续学习/continuous-learning.md) | 自动提取模式 | 会话结束 |
| [continuous-learning-v2](./持续学习/continuous-learning-v2.md) | 直觉式学习 | 会话进行中 |

### 部署相关类

| 技能 | 作用 | 什么时候激活 |
|------|------|-------------|
| [deployment-patterns](./部署相关/deployment-patterns.md) | CI/CD、Docker、健康检查 | 部署配置 |
| [docker-patterns](./部署相关/docker-patterns.md) | Docker Compose模式 | 容器化 |

### 其他技能

| 技能 | 作用 | 什么时候激活 |
|------|------|-------------|
| [verification-loop](./其他技能/verification-loop.md) | 持续验证 | 验证循环 |
| [eval-harness](./其他技能/eval-harness.md) | 评估循环 | 评估测试 |
| [iterative-retrieval](./其他技能/iterative-retrieval.md) | 渐进式上下文优化 | 子代理上下文 |
| [strategic-compact](./其他技能/strategic-compact.md) | 手动压缩建议 | 上下文管理 |
| [configure-ecc](./其他技能/configure-ecc.md) | 交互式安装向导 | 安装配置 |
| [nutrient-document-processing](./其他技能/nutrient-document-processing.md) | 文档处理 | PDF处理 |

---

## 技能如何工作

### 1. 配置结构

每个技能都有一个配置头：

```yaml
---
name: skill-name                    # 技能名称
description: 技能描述...             # 什么时候激活
version: 1.0.0                      # 版本号（可选）
---
```

### 2. 激活方式

**自动激活**：
- 当 Claude 检测到技能描述中提到的场景时自动激活
- 例如：写React组件时，frontend-patterns 自动激活

**通过代理引用**：
- 代理会在需要时引用技能中的知识
- 例如：tdd-guide 代理会引用 tdd-workflow 技能

**通过命令调用**：
- 某些命令会加载特定技能
- 例如：`/tdd` 命令会加载 tdd-workflow 技能

---

## 技能与代理的关系

```
Command（命令）
    │
    └──→ Agent（代理）──→ Skill（技能）
              │              │
              │              └── 提供具体的工作流程和模式
              │
              └── 使用技能中的知识来完成任务
```

**示例**：

```
/tdd 命令
    │
    └──→ tdd-guide 代理
              │
              └──→ tdd-workflow 技能
                        │
                        └── 提供：
                            - RED-GREEN-REFACTOR 循环
                            - 测试模式
                            - Mock 示例
                            - 覆盖率要求
```

---

## 按语言选择技能

### TypeScript/JavaScript

```bash
coding-standards     # 通用标准
frontend-patterns    # React/Next.js
backend-patterns     # Node.js/Express
tdd-workflow        # 测试
```

### Python

```bash
python-patterns      # Python惯用法
django-patterns      # Django
python-testing       # pytest
django-security      # Django安全
```

### Go

```bash
golang-patterns      # Go惯用法
golang-testing       # Go测试
```

### Java

```bash
java-coding-standards    # Java标准
springboot-patterns      # Spring Boot
jpa-patterns            # JPA
springboot-security     # 安全
```

---

## 学习建议

1. **先学基础**：coding-standards, tdd-workflow
2. **按需学习领域技能**：根据你的技术栈选择
3. **关注持续学习**：continuous-learning-v2
4. **结合代理使用**：理解技能如何支持代理工作

---

## 详细文档

点击查看各技能的详细文档：

### 编码标准
- [coding-standards - 通用编码标准](./编码标准/coding-standards.md)

### 前端模式
- [frontend-patterns - 前端开发模式](./前端模式/frontend-patterns.md)

### 后端模式
- [backend-patterns - 后端开发模式](./后端模式/backend-patterns.md)

### 测试相关
- [tdd-workflow - TDD工作流程](./测试相关/tdd-workflow.md)

### 持续学习
- [continuous-learning - 持续学习v1](./持续学习/continuous-learning.md)
- [continuous-learning-v2 - 持续学习v2](./持续学习/continuous-learning-v2.md)
