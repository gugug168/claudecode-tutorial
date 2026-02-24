<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个技能是做什么的：从 Claude Code 会话自动学习模式                ║
║  什么时候用它：配置自动学习、管理学习技能、审查学习成果时            ║
║  核心能力：Stop hook、模式检测、技能提取、v1/v2 比较               ║
╚══════════════════════════════════════════════════════════════════╝
-->

---
name: continuous-learning
description: Automatically extract reusable patterns from Claude Code sessions and save them as learned skills for future use.
---

# Continuous Learning Skill

<!--
【说明】持续学习技能的核心内容：
- 在每个会话结束时自动评估 Claude Code 会话
- 提取可复用模式并保存为学习技能
-->
Automatically evaluates Claude Code sessions on end to extract reusable patterns that can be saved as learned skills.

<!--
【说明】何时激活此技能：
- 设置从 Claude Code 会话自动提取模式
- 配置 Stop hook 用于会话评估
- 审查或管理学习技能目录
- 调整提取阈值或模式类别
- 比较 v1 与 v2（基于instinct）方案
-->
## When to Activate

- Setting up automatic pattern extraction from Claude Code sessions
- Configuring the Stop hook for session evaluation
- Reviewing or curating learned skills in `~/.claude/skills/learned/`
- Adjusting extraction thresholds or pattern categories
- Comparing v1 (this) vs v2 (instinct-based) approaches

<!--
【说明】工作原理 - 作为 Stop hook 在会话结束时运行：
1. 会话评估：检查会话是否有足够消息（默认：10+）
2. 模式检测：从会话中识别可提取模式
3. 技能提取：将有用的模式保存到学习技能目录
-->
## How It Works

This skill runs as a **Stop hook** at the end of each session:

1. **Session Evaluation**: Checks if session has enough messages (default: 10+)
2. **Pattern Detection**: Identifies extractable patterns from the session
3. **Skill Extraction**: Saves useful patterns to `~/.claude/skills/learned/`

<!--
【说明】配置 - 编辑 config.json 自定义：
- 最小会话长度
- 提取阈值
- 是否自动批准
- 检测的模式类型
- 忽略的模式
-->
## Configuration

Edit `config.json` to customize:

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

<!--
【说明】模式类型：
- error_resolution：特定错误如何解决
- user_corrections：用户纠正中的模式
- workarounds：框架/库 quirks 的解决方案
- debugging_techniques：有效的调试方法
- project_specific：项目特定约定
-->
## Pattern Types

| Pattern | Description |
|---------|-------------|
| `error_resolution` | How specific errors were resolved |
| `user_corrections` | Patterns from user corrections |
| `workarounds` | Solutions to framework/library quirks |
| `debugging_techniques` | Effective debugging approaches |
| `project_specific` | Project-specific conventions |

<!--
【说明】Hook 设置 - 添加到 settings.json：
- 轻量：会话结束时运行一次
- 非阻塞：不给每条消息增加延迟
- 完整上下文：可访问完整会话记录
-->
## Hook Setup

Add to your `~/.claude/settings.json`:

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

## Why Stop Hook?

- **Lightweight**: Runs once at session end
- **Non-blocking**: Doesn't add latency to every message
- **Complete context**: Has access to full session transcript

<!--
【说明】相关资源：
- The Longform Guide：持续学习章节
- /learn 命令：会话中手动提取模式
-->
## Related

- [The Longform Guide](https://x.com/affaanmustafa/status/2014040193557471352) - Section on continuous learning
- `/learn` command - Manual pattern extraction mid-session

---

<!--
【说明】比较说明（研究：2025年1月）- 与 Homunculus 的比较：
- v1 依赖技能观察（约 50-80% 触发率）
- v2 使用 hooks 观察（100% 可靠）
- v2 将 instincts 作为学习行为的原子单位
-->
## Comparison Notes (Research: Jan 2025)

### vs Homunculus (github.com/humanplane/homunculus)

Homunculus v2 takes a more sophisticated approach:

| Feature | Our Approach | Homunculus v2 |
|---------|--------------|---------------|
| Observation | Stop hook (end of session) | PreToolUse/PostToolUse hooks (100% reliable) |
| Analysis | Main context | Background agent (Haiku) |
| Granularity | Full skills | Atomic "instincts" |
| Confidence | None | 0.3-0.9 weighted |
| Evolution | Direct to skill | Instincts → cluster → skill/command/agent |
| Sharing | None | Export/import instincts |

**Key insight from homunculus:**
> "v1 relied on skills to observe. Skills are probabilistic—they fire ~50-80% of the time. v2 uses hooks for observation (100% reliable) and instincts as the atomic unit of learned behavior."

<!--
【说明】潜在的 v2 增强：
1. 基于 Instinct 的学习 - 更小、原子级的行为，带置信度评分
2. 后台观察者 - Haiku 代理并行分析
3. 置信度衰减 - Instincts 如果被反驳会失去置信度
4. 领域标签 - code-style、testing、git、debugging 等
5. 进化路径 - 将相关 instincts 聚类为技能/命令
-->
### Potential v2 Enhancements

1. **Instinct-based learning** - Smaller, atomic behaviors with confidence scoring
2. **Background observer** - Haiku agent analyzing in parallel
3. **Confidence decay** - Instincts lose confidence if contradicted
4. **Domain tagging** - code-style, testing, git, debugging, etc.
5. **Evolution path** - Cluster related instincts into skills/commands

See: `/Users/affoon/Documents/tasks/12-continuous-learning-v2.md` for full spec.
