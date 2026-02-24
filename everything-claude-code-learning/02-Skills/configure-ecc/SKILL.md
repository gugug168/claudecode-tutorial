---
name: configure-ecc
description: Everything Claude Code 的交互式安装向导——引导用户选择和安装技能和规则到用户级或项目级目录，验证路径，并可选地优化已安装的文件。
---

# Configure Everything Claude Code (ECC)
# 配置 Everything Claude Code (ECC)

<!--
【教学说明】
这是一个"安装向导"技能——它会问你问题，然后根据你的选择自动安装所需的技能和规则。

就像软件安装程序，但针对 Claude Code 技能和规则。
-->

交互式、分步的安装向导，用于 Everything Claude Code 项目。使用 `AskUserQuestion` 引导用户选择性安装技能和规则，然后验证正确性并提供优化。

## 何时激活此技能

- 用户说 "configure ecc"、"install ecc"、"setup everything claude code" 或类似内容
- 用户想选择性安装此项目的技能或规则
- 用户想验证或修复现有的 ECC 安装
- 用户想为项目优化已安装的技能或规则

## 先决条件

<!--
【教学说明】
在激活此技能之前，它必须对 Claude Code 可访问。
有两种方法引导安装。
-->

此技能必须对 Claude Code 可访问才能激活。两种引导方法：

1. **通过插件**：`/plugin install everything-claude-code` ——插件自动加载此技能
2. **手动**：只复制此技能到 `~/.claude/skills/configure-ecc/SKILL.md`，然后通过说 "configure ecc" 激活

---

## 步骤 0：克隆 ECC 仓库

<!--
【教学说明】
在任何安装之前，需要从 GitHub 获取最新代码。
-->

在安装之前，将最新的 ECC 源码克隆到 `/tmp`：

```bash
rm -rf /tmp/everything-claude-code
git clone https://github.com/affaan-m/everything-claude-code.git /tmp/everything-claude-code
```

设置 `ECC_ROOT=/tmp/everything-claude-code` 作为所有后续复制操作的源。

---

## 步骤 1：选择安装级别

<!--
【教学说明】
用户级安装影响所有项目，项目级只影响当前项目。
-->

使用 `AskUserQuestion` 询问用户在哪里安装：

```
问题："ECC 组件应该安装在哪里？"
选项：
  - "用户级 (~/.claude/)" ——"应用于所有你的 Claude Code 项目"
  - "项目级 (.claude/)" ——"只应用于当前项目"
  - "两者" ——"通用/共享项用户级，项目特定项项目级"
```

**安装级别说明：**
- **用户级**：安装在你的主目录，所有项目都可以使用
- **项目级**：安装在特定项目目录，只影响该项目
- **两者**：通用技能用户级，项目特定规则项目级

---

## 步骤 2：选择并安装技能

<!--
【教学说明】
ECC 包含 27 个技能，分为 4 个类别。
用户可以选择需要的技能，而不是全部安装。
-->

共有 27 个技能分为 4 个类别。

**类别：框架与语言（16 个技能）**

| 技能 | 说明 |
|------|------|
| `backend-patterns` | 后端架构、API 设计、服务器端最佳实践 |
| `coding-standards` | TypeScript、JavaScript、React 的通用编码标准 |
| `django-patterns` | Django 架构、REST API (DRF)、ORM、缓存 |
| `frontend-patterns` | React、Next.js、状态管理、性能 |
| `golang-patterns` | 惯用的 Go 模式、约定 |
| `python-patterns` | Pythonic 惯用法、PEP 8、类型提示 |
| `springboot-patterns` | Spring Boot 架构、REST API |

**类别：数据库（3 个技能）**

| 技能 | 说明 |
|------|------|
| `clickhouse-io` | ClickHouse 模式、查询优化 |
| `jpa-patterns` | JPA/Hibernate 实体设计 |
| `postgres-patterns` | PostgreSQL 查询优化 |

**类别：工作流与质量（8 个技能）**

| 技能 | 说明 |
|------|------|
| `continuous-learning` | 从会话自动提取可复用模式 |
| `continuous-learning-v2` | 基于 Instinct 的学习，带置信度评分 |
| `tdd-workflow` | 强制 80%+ 覆盖率的 TDD |
| `security-review` | 安全检查清单 |
| `verification-loop` | 验证和质量循环模式 |

**使用 `AskUserQuestion` 选择：**
```
问题："你想安装哪些技能？"
选项：
  - "所有框架和语言技能"
  - "所有数据库技能"
  - "所有工作流和质量技能"
  - "让我单独选择"
```

---

## 步骤 3：选择并安装规则

<!--
【教学说明】
规则是编码约定，不同于技能（技能是工作流程）。
-->

使用 `AskUserQuestion`，设置 `multiSelect: true`：

```
问题："你想安装哪些规则集？"
选项：
  - "通用规则（推荐）" ——"语言无关原则（8 个文件）"
  - "TypeScript/JavaScript" ——"TS/JS 模式、hooks、测试（5 个文件）"
  - "Python" ——"Python 模式、pytest、black/ruff（5 个文件）"
  - "Go" ——"Go 模式、表驱动测试（5 个文件）"
```

**规则 vs 技能：**
- **技能**：工作流程和流程（例如 "如何进行 TDD"）
- **规则**：编码约定（例如 "使用 TypeScript 严格模式"）

---

## 步骤 4：安装后验证

<!--
【教学说明】
安装后需要验证一切正常工作。
-->

安装后，执行这些自动检查：

- **验证文件存在**：确认所有文件已复制
- **检查路径引用**：确保链接和引用正确
- **检查技能间交叉引用**：确保技能之间的引用有效
- **报告问题**：列出任何需要修复的问题

**验证命令示例：**
```bash
# 检查文件是否存在
ls -la ~/.claude/skills/

# 检查语法
cat ~/.claude/skills/*/SKILL.md | grep -e "^name:" -e "^description:"

# 验证引用
grep -r "related-skills" ~/.claude/skills/
```

---

## 步骤 5：优化已安装文件（可选）

<!--
【教学说明】
优化意味着移除不需要的内容，使技能更简洁。
-->

使用 `AskUserQuestion`：

```
问题："你想为项目优化已安装的文件吗？"
选项：
  - "优化技能" ——"移除不相关章节，调整路径"
  - "优化规则" ——"调整覆盖率目标，自定义工具配置"
  - "跳过" ——"保持原样"
```

**优化示例：**
- 移除你不使用的框架的章节
- 调整测试覆盖率目标（例如从 80% 到 90%）
- 自定义代码风格规则

---

## 步骤 6：安装摘要

<!--
【教学说明】
最后，显示安装的内容和位置。
-->

清理克隆的仓库并打印摘要报告：

```
## ECC 安装完成

### 安装目标
- 级别：[用户级 / 项目级 / 两者]
- 路径：[目标路径]

### 已安装技能 ([数量])
- skill-1, skill-2, skill-3, ...

### 已安装规则 ([数量])
- common (8 个文件)
- typescript (5 个文件)

### 验证结果
- 发现 [数量] 个问题，修复 [数量] 个

### 下一步
1. 检查已安装的技能：~/.claude/skills/
2. 检查已安装的规则：~/.claude/rules/
3. 在新会话中测试
4. 根据需要自定义
```

---

## 完整安装示例

```bash
# 1. 克隆仓库
git clone https://github.com/affaan-m/everything-claude-code.git /tmp/ecc

# 2. 运行配置向导
claude-code configure-ecc

# 向导会问：
# - 安装级别？[用户级]
# - 哪些技能？[所有框架技能]
# - 哪些规则？[TypeScript + 通用]
# - 优化？[是]

# 3. 安装完成
# 技能安装到：~/.claude/skills/
# 规则安装到：~/.claude/rules/
# 验证通过
```

## 常见问题

**Q: 我应该安装用户级还是项目级？**

A:
- **用户级**：如果你在多个项目中使用 Claude Code，安装通用技能
- **项目级**：如果项目有特定需求（例如 Django 项目）
- **两者**：通用技能用户级，框架特定技能项目级

**Q: 安装后可以自定义技能吗？**

A: 可以！技能是文本文件，你可以编辑它们。建议先复制再修改。

**Q: 如何卸载技能？**

A: 只需删除技能目录：
```bash
rm -rf ~/.claude/skills/skill-name
```

**Q: 技能会自动更新吗？**

A: 不会。你需要重新运行 configure-ecc 或手动拉取更新。

---

**记住**：此向导使安装 ECC 变得简单——你只需回答问题，它会处理其余部分。
