<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个命令是做什么的：复杂任务的顺序代理工作流                        ║
║  什么时候用它：需要多个 agent 协作完成复杂任务时                     ║
║  核心能力：feature/bugfix/refactor/security 工作流、交接文档        ║
║  触发方式：/orchestrate [workflow-type] [task-description]         ║
╚══════════════════════════════════════════════════════════════════╝
-->

# Orchestrate Command

<!--
【说明】复杂任务的顺序代理工作流。
-->
Sequential agent workflow for complex tasks.

<!--
【说明】用法：/orchestrate [工作流类型] [任务描述]
-->
## Usage

`/orchestrate [workflow-type] [task-description]`

<!--
【说明】工作流类型：
- feature（功能）：planner -> tdd-guide -> code-reviewer -> security-reviewer
- bugfix（修复）：planner -> tdd-guide -> code-reviewer
- refactor（重构）：architect -> code-reviewer -> tdd-guide
- security（安全）：security-reviewer -> code-reviewer -> architect
-->
## Workflow Types

### feature
Full feature implementation workflow:
```
planner -> tdd-guide -> code-reviewer -> security-reviewer
```

### bugfix
Bug investigation and fix workflow:
```
planner -> tdd-guide -> code-reviewer
```

### refactor
Safe refactoring workflow:
```
architect -> code-reviewer -> tdd-guide
```

### security
Security-focused review:
```
security-reviewer -> code-reviewer -> architect
```

<!--
【说明】执行模式：对于工作流中的每个代理：
1. 调用代理，带上前一个代理的上下文
2. 收集输出为结构化交接文档
3. 传递给下一个代理在链中
4. 汇总结果为最终报告
-->
## Execution Pattern

For each agent in the workflow:

1. **Invoke agent** with context from previous agent
2. **Collect output** as structured handoff document
3. **Pass to next agent** in chain
4. **Aggregate results** into final report

<!--
【说明】交接文档格式：在代理之间创建交接文档，包含上下文、发现、已修改文件、待解决问题、建议
-->
## Handoff Document Format

Between agents, create handoff document:

```markdown
## HANDOFF: [previous-agent] -> [next-agent]

### Context
[Summary of what was done]

### Findings
[Key discoveries or decisions]

### Files Modified
[List of files touched]

### Open Questions
[Unresolved items for next agent]

### Recommendations
[Suggested next steps]
```

<!--
【说明】参数：
- feature <描述> - 完整功能工作流
- bugfix <描述> - Bug 修复工作流
- refactor <描述> - 重构工作流
- security <描述> - 安全审查工作流
- custom <代理列表> <描述> - 自定义代理序列
-->
## Arguments

$ARGUMENTS:
- `feature <description>` - Full feature workflow
- `bugfix <description>` - Bug fix workflow
- `refactor <description>` - Refactoring workflow
- `security <description>` - Security review workflow
- `custom <agents> <description>` - Custom agent sequence

<!--
【说明】技巧：
1. 从 planner 开始用于复杂功能
2. 始终包含 code-reviewer 在合并前
3. 使用 security-reviewer 用于认证/支付/PII
4. 保持交接简洁 - 专注于下一个代理需要什么
-->
## Tips

1. **Start with planner** for complex features
2. **Always include code-reviewer** before merge
3. **Use security-reviewer** for auth/payment/PII
4. **Keep handoffs concise** - focus on what next agent needs
