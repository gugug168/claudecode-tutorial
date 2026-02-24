---
name: continuous-learning
description: 自动从 Claude Code 会话中提取可复用模式，并保存为学习技能供将来使用。
---

# Continuous Learning Skill（持续学习技能）

<!--
【教学说明】
这个技能让 AI 能够"学习"——它会观察你如何使用 Claude Code，
提取有用的模式，并在未来的会话中自动应用。

就像一个智能助手，会记住你的偏好和工作方式。
-->

在每个会话结束时自动评估 Claude Code 会话，提取可复用模式并保存为学习技能。

## 何时激活此技能

- 设置从 Claude Code 会话自动提取模式
- 配置 Stop hook 用于会话评估
- 审查或管理 `~/.claude/skills/learned/` 中的学习技能
- 调整提取阈值或模式类别
- 比较 v1 与 v2（基于 instinct）方案

## 工作原理

<!--
【教学说明】
这个技能作为一个"Stop hook"运行——意味着它在每次会话结束时自动执行。
-->

此技能作为 **Stop hook** 在每个会话结束时运行：

1. **会话评估**：检查会话是否有足够的消息（默认：10+ 条）
2. **模式检测**：从会话中识别可提取的模式
3. **技能提取**：将有用的模式保存到 `~/.claude/skills/learned/`

**什么是 hook？** Hook 是自动触发的事件。Stop hook 在会话结束时触发。

## 配置

编辑 `config.json` 自定义：

```json
{
  "min_session_length": 10,
  "extraction_threshold": "medium",
  "auto_approve": false,
  "learned_skills_path": "~/.claude/skills/learned/",
  "patterns_to_detect": [
    "error_resolution",
    "user_corrections",
    "workarounds",
    "debugging_techniques",
    "project_specific"
  ],
  "ignore_patterns": [
    "simple_typos",
    "one_time_fixes",
    "external_api_issues"
  ]
}
```

**配置说明：**
- `min_session_length`：会话至少需要多少条消息才值得学习
- `extraction_threshold`：提取阈值——low（宽松）、medium（中等）、high（严格）
- `auto_approve`：是否自动保存学习的技能（建议 false，手动审查）
- `patterns_to_detect`：要检测的模式类型
- `ignore_patterns`：忽略的模式（避免学习无用信息）

## 模式类型

| 模式 | 说明 | 示例 |
|------|------|------|
| `error_resolution` | 特定错误如何解决 | "TypeError: Cannot read property 'x' of undefined" → 检查 null |
| `user_corrections` | 用户纠正中的模式 | 用户总是说"用函数式方法" → 偏好函数式编程 |
| `workarounds` | 框架/库怪癖的解决方案 | "Next.js 的 Image 组件需要配置域名" → 工作模式 |
| `debugging_techniques` | 有效的调试方法 | "总是先检查网络请求" → 调试策略 |
| `project_specific` | 项目特定约定 | "这个项目使用 TypeScript 严格模式" → 项目规则 |

**为什么要分类？** 不同类型的模式在不同场景下有用。

## Hook 设置

添加到你的 `~/.claude/settings.json`：

```json
{
  "hooks": {
    "Stop": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "~/.claude/skills/continuous-learning/evaluate-session.sh"
      }]
    }]
  }
}
```

**为什么使用 Stop hook？**

- **轻量级**：只在会话结束时运行一次
- **非阻塞**：不给每条消息增加延迟
- **完整上下文**：可以访问完整会话记录

**什么是 matcher？** `"*"` 表示匹配所有会话。

## 为什么需要持续学习？

<!--
【教学说明】
传统的 AI 会话是"无状态"的——每次都是新的开始。
持续学习让 AI 能够记住和应用之前学到的模式。
-->

### 问题
- 每次 Claude Code 会话都从零开始
- 重复犯错同样的问题
- 项目特定的约定需要重复说明
- 调试技巧不能积累

### 解决方案
- 自动提取有用的模式
- 跨会话保存学习到的技能
- 项目特定知识自动积累
- 调试经验持续增长

## 与 Homunculus 的比较（研究：2025年1月）

Homunculus v2 采用了更复杂的方法：

| 特性 | 我们的方法 | Homunculus v2 |
|------|-----------|---------------|
| 观察 | Stop hook（会话结束时） | PreToolUse/PostToolUse hooks（100% 可靠） |
| 分析 | 主上下文 | 后台代理（Haiku） |
| 粒度 | 完整技能 | 原子级"instincts" |
| 置信度 | 无 | 0.3-0.9 加权 |
| 进化 | 直接到技能 | Instincts → 聚类 → 技能/命令/代理 |
| 分享 | 无 | 导出/导入 instincts |

**Homunculus 的关键见解：**
> "v1 依赖技能观察。技能是概率性的——它们只触发 50-80% 的时间。v2 使用 hooks 进行观察（100% 可靠），并将 instincts 作为学习行为的原子单位。"

**什么是 instinct？** Instinct 是更小的学习单元——一个触发器，一个动作。

### 潜在 v2 增强功能

1. **基于 Instinct 的学习** ——更小、原子级的行为，带置信度评分
2. **后台观察者** ——Haiku 代理并行分析
3. **置信度衰减** ——Instincts 如果被反驳会失去置信度
4. **领域标签** ——code-style、testing、git、debugging 等
5. **进化路径** ——将相关 instincts 聚类为技能/命令

## 相关资源

- [The Longform Guide](https://x.com/affaanmustafa/status/2014040193557471352) ——持续学习章节
- `/learn` 命令——会话中手动提取模式
- Homunculus 项目：[github.com/humanplane/homunculus](https://github.com/humanplane/homunculus)

---

**记住**：持续学习让 AI 越用越聪明——它会记住你的偏好和工作方式。
