<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个命令是做什么的：分析当前会话并提取值得保存的模式为技能           ║
║  什么时候用它：解决非平凡问题后、发现可复用模式时                    ║
║  核心能力：错误解决模式、调试技术、变通方法、项目特定模式             ║
║  触发方式：/learn                                                  ║
╚══════════════════════════════════════════════════════════════════╝
-->

# /learn - Extract Reusable Patterns

<!--
【说明】分析当前会话并提取任何值得保存为技能的模式。
-->
Analyze the current session and extract any patterns worth saving as skills.

<!--
【说明】触发：在会话中解决非平凡问题后的任何时候运行 `/learn`。
-->
## Trigger

Run `/learn` at any point during a session when you've solved a non-trivial problem.

<!--
【说明】要提取什么：
1. 错误解决模式：发生了什么错误？根本原因是什么？什么修复了它？这对类似错误可复用吗？
2. 调试技术：非显而易见的调试步骤、有效的工具组合、诊断模式
3. 变通方法：库的怪癖、API 限制、特定版本的修复
4. 项目特定模式：发现的代码库约定、做出的架构决策、集成模式
-->
## What to Extract

Look for:

1. **Error Resolution Patterns**
   - What error occurred?
   - What was the root cause?
   - What fixed it?
   - Is this reusable for similar errors?

2. **Debugging Techniques**
   - Non-obvious debugging steps
   - Tool combinations that worked
   - Diagnostic patterns

3. **Workarounds**
   - Library quirks
   - API limitations
   - Version-specific fixes

4. **Project-Specific Patterns**
   - Codebase conventions discovered
   - Architecture decisions made
   - Integration patterns

<!--
【说明】输出格式：在 `~/.claude/skills/learned/[pattern-name].md` 创建技能文件，包含问题、解决方案、示例、何时使用等章节
-->
## Output Format

Create a skill file at `~/.claude/skills/learned/[pattern-name].md`:

```markdown
# [Descriptive Pattern Name]

**Extracted:** [Date]
**Context:** [Brief description of when this applies]

## Problem
[What problem this solves - be specific]

## Solution
[The pattern/technique/workaround]

## Example
[Code example if applicable]

## When to Use
[Trigger conditions - what should activate this skill]
```

<!--
【说明】注意事项：
- 不要提取琐碎修复（拼写错误、简单语法错误）
- 不要提取一次性问题（特定 API 中断等）
- 专注于能在未来会话中节省时间的模式
- 保持技能专注 - 每个技能一个模式
-->
## Notes

- Don't extract trivial fixes (typos, simple syntax errors)
- Don't extract one-time issues (specific API outages, etc.)
- Focus on patterns that will save time in future sessions
- Keep skills focused - one pattern per skill
