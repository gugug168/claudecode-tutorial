# Longform Guide - 长篇指南

## 一句话总结
这是区分高效会话和浪费会话的高级技术指南，涵盖 Token 经济学、记忆持久化、验证模式、并行化策略和可复用工作流的复合效应。

> 原文来源：https://x.com/affaanmustafa/status/2014040193557471352
> 作者：Affaan Mustafa

---

## 前言

在《简写指南》中，我介绍了基础设置：Skills、Commands、Hooks、Subagents、MCPs、Plugins，以及构成有效 Claude Code 工作流骨干的配置模式。那是一个设置指南和基础架构。

这篇长篇指南探讨的是区分高效会话和浪费会话的**技术**。如果你还没读过简写指南，请先回去设置你的配置。接下来的内容假设你已经配置好了 Skills、Agents、Hooks 和 MCPs 并正常运行。

**这里的主题**：Token 经济学、记忆持久化、验证模式、并行化策略，以及构建可复用工作流的复合效应。这些是我经过 10+ 个月日常使用提炼出的模式，它们决定了是在第一个小时内就被上下文腐烂困扰，还是能保持数小时的高效会话。

> 简写指南和长篇指南中的所有内容都可在 GitHub 上找到：
> https://github.com/affaan-m/everything-claude-code

---

## 一、记忆持久化

### 会话间共享记忆

要在会话之间共享记忆，最好的方法是使用一个 Skill 或 Command 来总结进度，然后保存到 `.claude` 文件夹中的 `.tmp` 文件，并在会话期间追加内容。第二天它可以将此作为上下文并从中断的地方继续，为每个会话创建新文件，这样就不会将旧上下文污染到新工作中。最终你会有一个大文件夹的这些会话日志 —— 只需将其备份到有意义的地方或修剪不需要的会话对话。

### 工作原理

Claude 创建一个总结当前状态的文件。审查它，如果需要可以要求编辑，然后重新开始。对于新对话，只需提供文件路径。当你达到上下文限制并需要继续复杂工作时特别有用。

### 会话文件应包含

- 什么方法有效（可验证地有证据）
- 尝试过哪些方法但无效
- 哪些方法尚未尝试，还剩什么要做的

---

## 二、策略性清理上下文

### 为什么手动比自动好

一旦你的计划设置好并清理了上下文（现在是 Claude Code 中计划模式的默认选项），你可以从计划开始工作。当你积累了很多不再与执行相关的探索上下文时，这很有用。

### 关键区别

| 自动压缩 | 策略性压缩 |
|---------|-----------|
| 在任意点发生 | 在逻辑间隔发生 |
| 经常在任务中间 | 在探索后、执行前 |
| 可能丢失重要上下文 | 通过逻辑阶段保留上下文 |

### 实现方法

1. 禁用自动压缩
2. 在逻辑间隔手动压缩
3. 或创建一个 Skill 在定义的标准下建议压缩

### 示例：策略性压缩建议脚本

```bash
#!/bin/bash
# Strategic Compact Suggester
# 在 PreToolUse 上运行，在逻辑间隔建议手动压缩

COUNTER_FILE="/tmp/claude-tool-count-$$"
THRESHOLD=${COMPACT_THRESHOLD:-50}

# 初始化或递增计数器
if [ -f "$COUNTER_FILE" ]; then
  count=$(cat "$COUNTER_FILE")
  count=$((count + 1))
  echo "$count" > "$COUNTER_FILE"
else
  echo "1" > "$COUNTER_FILE"
  count=1
fi

# 在阈值工具调用后建议压缩
if [ "$count" -eq "$THRESHOLD" ]; then
  echo "[StrategicCompact] $THRESHOLD tool calls reached - consider /compact if transitioning phases" >&2
fi
```

**使用方法**：将其挂载到 Edit/Write 操作的 PreToolUse 上 —— 当你积累了足够的上下文，压缩可能有帮助时，它会提醒你。

---

## 三、高级：动态系统提示注入

### 概念

不再将所有内容放在 `~/.claude.md`（用户范围）或 `.claude/rules/`（项目范围）中每个会话加载，而是使用 CLI 标志动态注入上下文。

```bash
claude --system-prompt "$(cat memory.md)"
```

### 为什么这很重要

| 方法 | 内容来源 | 权重 |
|------|---------|------|
| @file.md 或 .claude/rules/ | 通过 Read 工具读取 | 工具输出级别 |
| --system-prompt | 直接注入系统提示 | 系统提示级别 |

**指令层次结构**：系统提示内容 > 用户消息 > 工具结果

### 实用设置

使用 `.claude/rules/` 作为基准项目规则，然后为场景特定上下文设置 CLI 别名：

```bash
# 日常开发
alias claude-dev='claude --system-prompt "$(cat ~/.claude/contexts/dev.md)"'

# PR 审查模式
alias claude-review='claude --system-prompt "$(cat ~/.claude/contexts/review.md)"'

# 研究/探索模式
alias claude-research='claude --system-prompt "$(cat ~/.claude/contexts/research.md)"'
```

- `dev.md` 专注于实现
- `review.md` 专注于代码质量/安全
- `research.md` 专注于行动前的探索

**注意**：对于大多数情况，差异是边际的。CLI 方法更快（无工具调用）、更可靠（系统级权威）、稍微更节省 Token。但对于许多人来说，这比它的价值更麻烦。

---

## 四、高级：记忆持久化 Hooks

### Hook 工作流图

```
SESSION 1                    SESSION 2
─────────                    ─────────
[Start]                      [Start]
   │                            │
   ▼                            ▼
┌──────────────┐          ┌──────────────┐
│SessionStart  │ ◄── reads ────│SessionStart │◄── loads previous
│Hook          │ nothing yet   │Hook         │   context
└──────┬───────┘              └──────┬───────┘
       │                             │
       ▼                             ▼
[Working]                     [Working]
   │                             (informed)
   ▼                             │
┌──────────────┐                 ▼
│PreCompact    │──► saves state  [Continue...]
│Hook          │ before summary
└──────┬───────┘
       │
       ▼
[Compacted]
       │
       ▼
┌──────────────┐
│Stop Hook     │──► persists to ───────►
│(session-end) │ ~/.claude/sessions/
└──────────────┘
```

### 三种关键 Hooks

| Hook | 作用 |
|------|------|
| PreCompact Hook | 在上下文压缩前保存重要状态到文件 |
| SessionComplete Hook | 会话结束时持久化学到的知识到文件 |
| SessionStart Hook | 新会话时自动加载之前的上下文 |

### 配置示例

```json
{
  "hooks": {
    "PreCompact": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "~/.claude/hooks/memory-persistence/pre-compact.sh"
      }]
    }],
    "SessionStart": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "~/.claude/hooks/memory-persistence/session-start.sh"
      }]
    }],
    "Stop": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "~/.claude/hooks/memory-persistence/session-end.sh"
      }]
    }]
  }
}
```

### 脚本功能

- `pre-compact.sh`：记录压缩事件，用压缩时间戳更新活动会话文件
- `session-start.sh`：检查最近的会话文件（过去7天），通知可用上下文和学到的技能
- `session-end.sh`：用模板创建/更新每日会话文件，跟踪开始/结束时间

将这些链接在一起，实现无需手动干预的跨会话连续记忆。

---

## 五、持续学习系统

### 问题

如果你不得不多次重复一个提示词，而 Claude 遇到了同样的问题或给了你一个你以前听过的回复，这适用于你。

很可能你需要发出第二个提示词来"重新引导"和校准 Claude 的指南针。这些模式必须**追加到 Skills 中**。

**问题的影响**：浪费 Token、浪费上下文、浪费时间，你的皮质醇飙升，当你沮丧地对 Claude 大喊不要做它在之前会话中已经告诉它不要做的事情时。

### 解决方案

当 Claude Code 发现一些不平凡的东西 —— 调试技术、变通方法、一些项目特定的模式 —— 它将那个知识保存为一个新的 Skill。下次类似的问题出现时，Skill 会自动加载。

### 为什么用 Stop Hook 而不是 UserPromptSubmit？

- **UserPromptSubmit**：在你发送的每条消息上运行 —— 开销大，给每个提示词增加延迟，对这个目的来说是大材小用
- **Stop**：只在会话结束时运行一次 —— 轻量级，不会在会话期间减慢你的速度，评估完整会话而不是零碎的

### 安装方法

```bash
# 克隆到 skills 文件夹
git clone https://github.com/affaan-m/everything-claude-code.git ~/.claude/skills/everything-claude-code

# 或只获取 continuous-learning skill
mkdir -p ~/.claude/skills/continuous-learning
curl -sL https://raw.githubusercontent.com/affaan-m/everything-claude-code/main/skills/continuous-learning/evaluate-session.sh > ~/.claude/skills/continuous-learning/evaluate-session.sh
chmod +x ~/.claude/skills/continuous-learning/evaluate-session.sh
```

### Hook 配置

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/skills/continuous-learning/evaluate-session.sh"
          }
        ]
      }
    ]
  }
}
```

### 工作原理

Stop Hook 在会话结束时触发 —— 脚本分析会话中值得提取的模式（错误解决方案、调试技术、变通方法、项目特定模式等），并将它们作为可复用的 Skills 保存在 `~/.claude/skills/learned/` 中。

### 手动提取 /learn

你不必等到会话结束。仓库还包含一个 `/learn` 命令，你可以在会话中刚解决了一些不平凡的事情时运行。它提示你立即提取模式，起草一个 Skill 文件，并在保存前要求确认。

### 会话日志模式

Skill 期望 `.tmp` 文件中的会话日志。模式是：`~/.claude/sessions/YYYY-MM-DD-topic.tmp` —— 每个会话一个文件，包含当前状态、已完成项目、阻塞项、关键决策和下次会话的上下文。

### 其他自我改进记忆模式

1. **会话反思模式**：在每个会话后，反思代理提取什么做得好、什么失败了、你做了什么纠正。这些学习更新一个在后续会话中加载的记忆文件。

2. **主动建议模式**：系统每15分钟主动建议改进，而不是等待你注意到模式。代理审查最近的交互，提出记忆更新，你批准或拒绝。随着时间的推移，它从你的批准模式中学习。

---

## 六、Token 优化策略

### 主要策略：子代理架构

主要优化你使用的工具和子代理架构，设计委托给足以完成任务的最便宜模型以减少浪费。

**选项**：试错并适应。一旦你了解了什么是什么，你可以委托给 Haiku vs Sonnet vs Opus。

### 基准测试方法（更复杂）

让 Claude 设置一个基准测试，有一个定义明确的目标和任务的仓库，以及一个定义明确的计划。在每个 git worktree 中，让所有子代理都是一种模型。记录任务完成情况 —— 理想情况下在你的计划和任务中。你将必须至少使用每个子代理一次。

完成完整遍历并从你的 Claude 计划中勾选任务后，停止并审计进度。你可以通过比较 diffs、创建在所有 worktrees 中统一的单元和集成和 E2E 测试来做到这一点。这将根据通过的案例 vs 失败的案例给你一个数值基准。

### 模型选择快速参考

| 场景 | 推荐模型 | 原因 |
|------|---------|------|
| 90% 的编码任务 | Sonnet | 平衡成本和质量 |
| 首次尝试失败 | Opus | 需要更强能力 |
| 任务跨越 5+ 文件 | Opus | 复杂性高 |
| 架构决策 | Opus | 关键决策 |
| 安全关键代码 | Opus | 不能出错 |
| 重复性任务 | Haiku | 简单、明确指令 |
| 多代理设置中的"工作者" | Haiku | 成本效益 |

**价格分析**：
- Sonnet 4.5：$3/M 输入，$15/M 输出（比 Opus 便宜约 66.7%）
- Haiku vs Opus：5x 价格差异
- Sonnet vs Opus：1.67x 价格差异

**结论**：Haiku + Opus 组合最有意义。

### 在代理定义中指定模型

```yaml
---
name: quick-search
description: Fast file search
tools: Glob, Grep
model: haiku  # 便宜且快速
---
```

### 工具特定优化

考虑 Claude 最频繁调用的工具。例如，用 mgrep 替换 grep —— 在各种任务上，平均 Token 减少约一半，相比 Claude 默认使用的传统 grep 或 ripgrep。

### 后台进程

适用时，在 Claude 之外运行后台进程，如果你不需要 Claude 处理整个输出并实时直接流式传输。这可以通过 tmux 轻松实现。获取终端输出并只总结它或只复制你需要的部分。这将节省大量输入 Token —— Opus 4.5 是 $5/M Token，输出是 $25/M Token。

### 模块化代码库的好处

拥有更模块化的代码库，具有可复用的实用程序、函数、hooks 等 —— 主文件在数百行而不是数千行 —— 有助于 Token 优化成本和在第一次就正确完成任务，这些是相关的。

如果你必须多次提示 Claude，你就在消耗 Token，特别是当它在很长的文件上一遍又一遍地阅读时。你会注意到它必须进行很多工具调用来完成阅读文件。中间它会让你知道文件很长，它将继续阅读。在这个过程中，Claude 可能会丢失一些信息。此外，停止和重新阅读会消耗额外的 Token。这可以通过拥有更模块化的代码库来避免。

### 精简代码库 = 更便宜的 Token

这可能是显而易见的，但你的代码库越精简，你的 Token 成本就越便宜。识别死代码至关重要，通过使用 Skills 来持续清理代码库，使用 Skills 和 Commands 进行重构。在某些时候，我喜欢浏览整个代码库，寻找突出或看起来重复的东西，手动拼凑那个上下文，然后将其与重构 Skill 和死代码 Skill 一起提供给 Claude。

### 系统提示瘦身（高级）

对于真正关注成本的人：Claude Code 的系统提示占用约 18k Token（约 200k 上下文的 9%）。这可以通过补丁减少到约 10k Token，节省约 7,300 Token（静态开销的 41%）。参见 YK 的指南如果你想走这条路。我个人不做这个。

---

## 七、评估和 Harness 调优

### 可观测性方法

一种方法是让 tmux 进程挂钩到跟踪思考流和输出，每当 Skill 被触发时。另一种方法是有一个 PostToolUse Hook，记录 Claude 具体执行了什么以及确切的更改和输出是什么。

### 基准测试工作流

比较与没有 Skill 时请求相同的东西并检查输出差异来基准相对性能：

```
[Same Task]
     │
     ┌────────────┴────────────┐
     ▼                         ▼
┌───────────────┐       ┌───────────────┐
│ Worktree A    │       │ Worktree B    │
│ WITH skill    │       │ WITHOUT skill │
└───────┬───────┘       └───────┬───────┘
        │                       │
        ▼                       ▼
   [Output A]              [Output B]
        │                       │
        └──────────┬────────────┘
                   ▼
              [git diff]
                   │
                   ▼
         ┌────────────────┐
         │ Compare logs,  │
         │ token usage,   │
         │ output quality │
         └────────────────┘
```

分支对话，在其中一个启动一个没有 Skill 的新 worktree，最后拉出一个 diff，看看记录了什么。这与持续学习和记忆部分相关。

### 评估模式类型

```
CHECKPOINT-BASED              CONTINUOUS
─────────────────             ──────────
[Task 1]                      [Work]
   │                             │
   ▼                             ▼
┌─────────┐                 ┌─────────┐
│Checkpoint│◄── verify      │ Timer/  │
│ #1      │   criteria      │ Change  │
└────┬────┘                 └────┬────┘
     │ pass?                     │
┌────┴────┐                      ▼
yes      no──► fix──┐      ┌──────────┐
│                   │      │Run Tests │
▼                   │      │ + Lint   │
[Task 2]            │      └────┬─────┘
│                   │           │
▼              ┌────┴────┐
┌─────────┐    │              │
│Checkpoint│    │              │
│ #2      │    ▼              ▼
└────┬────┘ [Continue]   [Stop & Fix]
     │
    ...

Best for: Linear workflows    Best for: Long sessions
with clear milestones         exploratory refactoring
```

### 检查点评估

- 在工作流中设置明确的检查点
- 在每个检查点验证定义的标准
- 如果验证失败，Claude 必须在继续之前修复
- 适合有明确里程碑的线性工作流

### 持续评估

- 每 N 分钟或在重大更改后运行
- 完整测试套件、构建状态、lint
- 立即报告回归
- 停止并在继续前修复
- 适合长时间运行的会话

**决定因素**是你工作的性质。检查点式适用于有明确阶段的功能实现。持续式适用于探索性重构或维护，你没有明确的里程碑。

### 评估方法分类

| 类型 | 示例 | 特点 |
|------|------|------|
| 基于代码的评估器 | 字符串匹配、二进制测试、静态分析、结果验证 | 快速、便宜、客观，但对有效变化脆弱 |
| 基于模型的评估器 | 评分标准、自然语言断言、成对比较 | 灵活、处理细微差别，但不确定且更昂贵 |
| 人工评估器 | SME 审查、众包判断、抽查采样 | 黄金标准质量，但昂贵且缓慢 |

### 关键指标

**pass@k**：k 次尝试中至少有一次成功
- k=1: 70%
- k=3: 91%
- k=5: 97%
- k 越高 = 成功概率越高

**pass^k**：所有 k 次尝试都必须成功
- k=1: 70%
- k=3: 34%
- k=5: 17%
- k 越高 = 越难（一致性）

**何时使用**：
- 当你只需要它工作，任何验证反馈就足够时，使用 pass@k
- 当一致性至关重要，你需要接近确定性的输出一致性（结果/质量/风格）时，使用 pass^k

### 构建评估路线图（来自 Anthropic 指南）

1. **尽早开始** - 从真实失败中获取 20-50 个简单任务
2. **将用户报告的失败转换为测试用例**
3. **编写明确的任务** - 两个专家应该达成相同的结论
4. **构建平衡的问题集** - 测试行为应该和不应该发生的情况
5. **构建健壮的 harness** - 每次试验从干净环境开始
6. **评估代理产生了什么，而不是它采取的路径**
7. **阅读许多试验的记录**
8. **监控饱和** - 100% 通过率意味着添加更多测试

---

## 八、并行化策略

### 分支对话的范围定义

在多 Claude 终端设置中分支对话时，确保分支和原始对话中的操作范围定义明确。在代码更改方面以最小重叠为目标。选择彼此正交的任务以防止干扰的可能性。

### 作者的首选模式

个人偏好主聊天处理代码更改，分支用于关于代码库及其当前状态的问题，或研究外部服务（如拉取文档、搜索适用的开源仓库），或其他有帮助的一般研究。

### 关于任意终端数量

Boris（创建 Claude Code 的传奇人物）有一些关于并行化的建议，我同意也不同意。他建议在本地运行 5 个 Claude 实例，5 个上游。我建议不要设置这样的任意终端数量。终端和实例的添加应该是出于真正的必要和目的。如果你可以用脚本处理那个任务，使用脚本。如果你可以留在主聊天中让 Claude 在 tmux 中启动一个实例并在单独的终端中流式传输，就这样做。

**你的目标应该是**：用最小可行数量的并行化完成多少工作。

对于大多数新手，我甚至建议远离并行化，直到你掌握运行单个实例并在其中管理一切的窍门。我不是在提倡限制自己 —— 我是在说要小心。大多数时候，即使我也只使用大约 4 个终端。我发现通常只用 2 或 3 个 Claude 实例就能完成大部分事情。

### 扩展实例时

如果你要开始扩展你的实例，并且你有多个 Claude 实例处理彼此重叠的代码，必须使用 git worktrees 并为每个有非常明确的计划。此外，在恢复会话时不要混淆或迷失哪个 git worktree 是什么（除了树的名称），使用 `/rename <name>` 命名为所有聊天命名。

### Git Worktrees 用于并行实例

```bash
# 为并行工作创建 worktrees
git worktree add ../project-feature-a feature-a
git worktree add ../project-feature-b feature-b
git worktree add ../project-refactor refactor-branch

# 每个 worktree 获得自己的 Claude 实例
cd ../project-feature-a && claude
```

**好处**：
- 实例之间没有 git 冲突
- 每个都有干净的工作目录
- 容易比较输出
- 可以跨不同方法对相同任务进行基准测试

### 级联方法

运行多个 Claude Code 实例时，用"级联"模式组织：

- 在右侧的新标签页中打开新任务
- 从左到右扫描，从旧到新
- 保持一致的方向流
- 根据需要检查特定任务
- 一次最多关注 3-4 个任务 —— 超过这个，心理开销增加的速度比生产力快

---

## 九、基础工作

### 从零开始

当从零开始时，实际基础非常重要。这应该是显而易见的，但随着代码库复杂性和大小的增加，技术债务也会增加。管理它非常重要，如果你遵循一些规则就不那么困难。除了为手头的项目有效设置你的 Claude（参见简写指南）。

### 双实例启动模式

对于我自己的工作流管理（不是必要但有帮助），我喜欢用 2 个打开的 Claude 实例启动一个空仓库。

**实例 1：脚手架代理**
- 将铺设脚手架和基础工作
- 创建项目结构
- 设置配置（.claude.json、rules、agents —— 简写指南中的所有内容）
- 建立约定
- 让骨架就位

**实例 2：深度研究代理**
- 连接到你所有的服务、网页搜索等。
- 创建详细的 PRD
- 创建架构 mermaid 图
- 编译带有实际文档剪辑的参考

**启动设置**：左侧终端用于编码，右侧终端用于问题 —— 使用 /rename 和 /fork。

你开始时需要的最小内容就可以 —— 这样更快，比每次都 Context7 或提供链接让它抓取或使用 Firecrawl MCP 网站。当你已经深入某事，Claude 明显语法错误或使用过时的函数或端点时，所有这些才有用。

### llms.txt 模式

如果可用，你可以在许多文档参考上找到 llms.txt，方法是在到达它们的文档页面时执行 `/llms.txt`。这给你一个干净的、LLM 优化的文档版本，可以直接提供给 Claude。

---

## 十、哲学：构建可复用模式

### 核心洞察

来自 Addy Osmani 的一个我完全认可的洞察："早期，我花时间构建可复用工作流/模式。构建起来很繁琐，但随着模型和代理 harness 的改进，这有疯狂的复合效应。"

### 投资什么

- Subagents（简写指南）
- Skills（简写指南）
- Commands（简写指南）
- Planning patterns
- MCP tools（简写指南）
- Context engineering patterns

### 为什么复合

"最好的部分是所有这些工作流都可以转移到其他代理如 Codex。" 一旦构建，它们跨模型升级工作。**对模式的投资 > 对特定模型技巧的投资。**

---

## 十一、子代理编排

### 子代理上下文问题

子代理通过返回摘要而不是转储所有内容来节省上下文。但协调者有子代理缺乏的语义上下文。子代理只知道字面查询，不知道请求背后的目的/推理。摘要经常遗漏关键细节。

### 类比

"你的老板派你去开会并要求摘要。你回来给他汇报。十有八九，他会有后续问题。你的摘要不会包含他需要的一切，因为你没有他拥有的隐式上下文。"

### 迭代检索模式

```
┌─────────────────┐
│ ORCHESTRATOR    │
│ (has context)   │
└────────┬────────┘
         │ dispatch with query + objective
         ▼
┌─────────────────┐
│ SUB-AGENT       │
│ (lacks context) │
└────────┬────────┘
         │ returns summary
         ▼
┌─────────────────┐     ┌─────────────┐
│ EVALUATE        │─no──►│ FOLLOW-UP   │
│ Sufficient?     │     │ QUESTIONS   │
└────────┬────────┘     └──────┬──────┘
         │ yes                 │
         ▼                     │ sub-agent
[ACCEPT]                      │ fetches answers
         │                     │
         ◄─────────────────────┘
         (max 3 cycles)
```

### 解决方法

让协调者：
- 评估每个子代理返回
- 在接受之前询问后续问题
- 子代理回到源，获取答案，返回
- 循环直到足够（最多 3 个循环以防止无限循环）

**传递目标上下文，而不仅仅是查询**。当派遣子代理时，同时包含特定查询和更广泛的目标。这帮助子代理优先考虑在其摘要中包含什么。

---

## 十二：具有顺序阶段的协调者

```markdown
Phase 1: RESEARCH (use Explore agent)
- Gather context
- Identify patterns
- Output: research-summary.md

Phase 2: PLAN (use planner agent)
- Read research-summary.md
- Create implementation plan
- Output: plan.md

Phase 3: IMPLEMENT (use tdd-guide agent)
- Read plan.md
- Write tests first
- Implement code
- Output: code changes

Phase 4: REVIEW (use code-reviewer agent)
- Review all changes
- Output: review-comments.md

Phase 5: VERIFY (use build-error-resolver if needed)
- Run tests
- Fix issues
- Output: done or loop back
```

### 关键规则

1. 每个代理获得一个清晰的输入并产生一个清晰的输出
2. 输出成为下一阶段的输入
3. 永远不要跳过阶段 —— 每个都增加价值
4. 在代理之间使用 `/clear` 保持上下文新鲜
5. 将中间输出存储在文件中（不仅仅是内存）

---

## 十三、代理抽象层级

### Tier 1：直接增益（易于使用）

| 模式 | 描述 |
|------|------|
| Subagents | 防止上下文腐烂和临时专业化的直接增益。作为多代理一半有用，但复杂性低得多 |
| Metaprompting | "我花3分钟提示一个20分钟的任务。" 直接增益 —— 提高稳定性并检验假设 |
| 开始时询问用户更多 | 通常是一个增益，尽管你必须在计划模式下回答问题 |

### Tier 2：高技能门槛（更难用好）

| 模式 | 挑战 |
|------|------|
| 长运行代理 | 需要理解 15 分钟任务 vs 1.5 小时 vs 4 小时任务的形状和权衡。需要一些调整，显然非常长的试错 |
| 并行多代理 | 非常高的方差，只对高度复杂或分段良好的任务有用。"如果 2 个任务花费 10 分钟，你花费任意时间提示或更糟糕地合并更改，这是适得其反的" |
| 基于角色的多代理 | "模型进化太快，除非套利非常高，否则无法进行硬编码启发式。" 难以测试 |
| 计算机使用代理 | 非常早期的范式，需要调教。"你让模型做它们一年前绝对不打算做的事情" |

**要点**：从 Tier 1 模式开始。只有在掌握了基础并有真正需求时才升级到 Tier 2。

---

## 十四、MCP 可替代性

### 概念

对于版本控制（GitHub）、数据库（Supabase）、部署（Vercel、Railway）等 MCP —— 这些平台大多数已经有健壮的 CLI，MCP 本质上只是在包装。MCP 是一个不错的包装器，但它有成本。

### 解决方案

让 CLI 功能更像 MCP 而不实际使用 MCP（以及随之而来的上下文窗口减少），考虑将功能捆绑到 Skills 和 Commands 中。剥离 MCP 暴露的使事情变得容易的工具，将它们变成命令。

**示例**：不要一直加载 GitHub MCP，创建一个 `/gh-pr` 命令来包装 `gh pr create` 并使用你首选的选项。不要让 Supabase MCP 消耗上下文，创建直接使用 Supabase CLI 的 Skills。功能相同，便利性相似，但你的上下文窗口为实际工作释放出来。

### 懒加载更新

自从我发布原文以来的过去几天里，Boris 和 Claude Code 团队在记忆管理和优化方面取得了很大进展，主要是 MCP 的懒加载，这样它们就不会从一开始就消耗你的窗口。以前我会建议在可能的情况下将 MCP 转换为 Skills，以两种方式之一卸载功能：在那时启用它（不太理想，因为你需要离开并恢复会话）或拥有使用 CLI 类似于 MCP 的 Skills（如果存在）并让 Skill 成为围绕它的包装器 —— 本质上让它充当伪 MCP。

有了懒加载，上下文窗口问题基本解决了。但 Token 使用和成本并没有以同样的方式解决。CLI + Skills 方法仍然是一个 Token 优化方法，其结果可能与使用 MCP 相当或接近。此外，你可以通过 CLI 而不是在上下文中运行 MCP 操作，这显著减少 Token 使用，对于数据库查询或部署等繁重的 MCP 操作特别有用。

---

## 参考资源

- [Anthropic: Demystifying evals for AI agents](https://anthropic.com) (Jan 2026)
- Anthropic: "Claude Code Best Practices" (Apr 2025)
- Fireworks AI: "Eval Driven Development with Claude Code" (Aug 2025)
- [YK: 32 Claude Code Tips](https://yk.do) (Dec 2025)
- Addy Osmani: "My LLM coding workflow going into 2026"
- Sub-Agent Context Negotiation
- Agent Abstractions Tierlist
- Compound Effects Philosophy
- [RLanceMartin: Session Reflection Pattern](https://x.com/rlancemartin)
- Self-Improving Memory System
