# Rules 总览

## 什么是 Rules（规则）？

Rules 是"永远要遵守"的指导原则，它们定义了标准、约定和检查清单，广泛应用于所有编码活动。

### 用一个比喻

- **Skills** = 操作指南（告诉你怎么做）
- **Rules** = 公司规章制度（告诉你必须遵守什么）

**Rules 就是你的"规章制度"**，它们是不可协商的标准，比如"测试覆盖率必须80%+"、"禁止硬编码密钥"。

---

## 目录结构

```
rules/
├── common/          # 语言无关的通用原则（必装）
│   ├── coding-style.md    # 代码风格
│   ├── git-workflow.md    # Git工作流
│   ├── testing.md         # 测试要求
│   ├── performance.md     # 性能优化
│   ├── patterns.md        # 设计模式
│   ├── hooks.md           # 钩子架构
│   ├── agents.md          # 代理使用
│   └── security.md        # 安全规范
├── typescript/      # TypeScript/JavaScript 专用
├── python/          # Python 专用
└── golang/          # Go 专用
```

---

## 安装方法

### 方式一：安装脚本（推荐）

```bash
# 安装 common + 一种或多种语言规则
./install.sh typescript
./install.sh python
./install.sh golang

# 同时安装多种语言
./install.sh typescript python
```

### 方式二：手动安装

```bash
# 安装通用规则（所有项目必需）
cp -r rules/common ~/.claude/rules/common

# 根据项目技术栈安装语言特定规则
cp -r rules/typescript ~/.claude/rules/typescript
cp -r rules/python ~/.claude/rules/python
cp -r rules/golang ~/.claude/rules/golang
```

---

## Rules vs Skills

| 特性 | Rules | Skills |
|------|-------|--------|
| 定义 | **做什么**（标准） | **怎么做**（方法） |
| 例子 | "80%测试覆盖率" | "如何写pytest测试" |
| 性质 | 强制遵守 | 参考指导 |
| 范围 | 广泛应用 | 特定任务 |

**关系**：语言特定的 Rules 文件会引用相关的 Skills。

---

## Common 规则详解

### 1. coding-style.md

**内容**：
- 不可变性要求（使用展开运算符）
- 文件大小限制（200-400行典型，800行最大）
- 命名约定
- 代码组织

**关键规则**：
```
- 总是使用 ...spread 而不是直接修改
- 文件超过800行应该拆分
- 使用描述性命名
```

### 2. git-workflow.md

**内容**：
- 提交信息格式
- PR 流程
- 分支命名

**关键规则**：
```
- 提交信息使用约定式提交
- PR 前必须通过测试
- 功能分支命名: feature/xxx
```

### 3. testing.md

**内容**：
- TDD 方法论
- 覆盖率要求
- 测试类型

**关键规则**：
```
- 测试覆盖率必须 80%+
- 先写测试再写代码
- 所有公共函数必须有测试
```

### 4. performance.md

**内容**：
- 模型选择
- 上下文管理
- Token 优化

**关键规则**：
```
- 默认使用 sonnet，复杂任务用 opus
- 保持 MCP 服务器 < 10个
- 活跃工具 < 80个
```

### 5. patterns.md

**内容**：
- 设计模式
- 骨架项目
- 架构决策

**关键规则**：
```
- 遵循项目既有模式
- 使用骨架项目加速启动
- 重要决策记录 ADR
```

### 6. hooks.md

**内容**：
- 钩子架构
- TodoWrite 使用

**关键规则**：
```
- 使用钩子自动化检查
- 复杂任务用 TodoWrite 跟踪
```

### 7. agents.md

**内容**：
- 何时委托给代理
- 代理选择指南

**关键规则**：
```
- 特定领域任务委托给专家代理
- 不要重复造轮子
```

### 8. security.md

**内容**：
- 安全检查清单
- 密钥管理

**关键规则**：
```
- 禁止硬编码密钥
- 使用环境变量
- 定期运行安全扫描
```

---

## 语言特定规则

### TypeScript 规则

扩展现有规则，添加：
- TypeScript/JavaScript 代码示例
- ESLint/Prettier 配置
- React/Next.js 模式
- 类型安全要求

### Python 规则

扩展现有规则，添加：
- Python 代码示例
- ruff/black/isort 配置
- Django/FastAPI 模式
- 类型注解要求

### Go 规则

扩展现有规则，添加：
- Go 代码示例
- golangci-lint 配置
- Go 惯用法
- 并发模式

---

## 添加新语言

要添加新语言支持（如 Rust）：

1. 创建 `rules/rust/` 目录
2. 添加扩展现有规则的文件：
   - `coding-style.md` — 格式工具、惯用法、错误处理模式
   - `testing.md` — 测试框架、覆盖率工具
   - `patterns.md` — 语言特定设计模式
   - `hooks.md` — 格式化器、linter 钩子
   - `security.md` — 密钥管理、安全扫描
3. 每个文件开头：
   ```
   > 本文件扩展 [common/xxx.md](../common/xxx.md) 添加 Rust 特定内容。
   ```

---

## 关键要点

1. **Rules 是强制性的** - 不像 Skills 是参考
2. **先装 Common** - 所有项目都需要通用规则
3. **按需装语言规则** - 只装你用到的语言
4. **不要扁平化** - 保持目录结构
5. **Rules + Skills 配合** - Rules 说做什么，Skills 说怎么做

---

## 相关文档

- [Hooks 总览](../05-Hooks/00-hooks总览.md) - 自动化检查机制
- [Skills 总览](../02-Skills/00-skills总览.md) - 工作流程指南
