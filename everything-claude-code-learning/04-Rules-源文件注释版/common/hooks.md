<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个规则是做什么的：定义 Hooks 系统和最佳实践                       ║
║  什么时候用它：配置自动化检查、使用 TodoWrite 时参考                 ║
║  核心能力：Hook 类型、自动接受权限、TodoWrite 最佳实践              ║
║  适用范围：通用规则                                                ║
╚══════════════════════════════════════════════════════════════════╝
-->

# Hooks System

<!--
【说明】Hook 类型：
- PreToolUse：工具执行前（验证、参数修改）
- PostToolUse：工具执行后（自动格式化、检查）
- Stop：会话结束时（最终验证）
-->
## Hook Types

- **PreToolUse**: Before tool execution (validation, parameter modification)
- **PostToolUse**: After tool execution (auto-format, checks)
- **Stop**: When session ends (final verification)

<!--
【说明】自动接受权限：谨慎使用
- 为可信、定义明确的计划启用
- 探索性工作时禁用
- 永远不要使用 dangerously-skip-permissions 标志
- 改为在 ~/.claude.json 中配置 allowedTools
-->
## Auto-Accept Permissions

Use with caution:
- Enable for trusted, well-defined plans
- Disable for exploratory work
- Never use dangerously-skip-permissions flag
- Configure `allowedTools` in `~/.claude.json` instead

<!--
【说明】TodoWrite 最佳实践：
- 跟踪多步骤任务的进度
- 验证对指令的理解
- 启用实时引导
- 显示细粒度的实现步骤

Todo 列表可以揭示：
- 步骤顺序错误、缺失项目、多余项目、粒度错误、误解的需求
-->
## TodoWrite Best Practices

Use TodoWrite tool to:
- Track progress on multi-step tasks
- Verify understanding of instructions
- Enable real-time steering
- Show granular implementation steps

Todo list reveals:
- Out of order steps
- Missing items
- Extra unnecessary items
- Wrong granularity
- Misinterpreted requirements
