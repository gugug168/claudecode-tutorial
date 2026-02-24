<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个规则是做什么的：定义性能优化和模型选择策略                       ║
║  什么时候用它：选择模型、管理上下文窗口、排查构建问题时参考           ║
║  核心能力：模型选择、上下文窗口管理、扩展思考、构建故障排除          ║
║  适用范围：通用规则                                                ║
╚══════════════════════════════════════════════════════════════════╝
-->

# Performance Optimization

<!--
【说明】模型选择策略：
- Haiku 4.5（90% Sonnet 能力，3倍成本节省）：频繁调用的轻量级代理、结对编程、工作代理
- Sonnet 4.5（最佳编码模型）：主要开发工作、协调多代理工作流、复杂编码任务
- Opus 4.5（最深推理）：复杂架构决策、最大推理需求、研究和分析任务
-->
## Model Selection Strategy

**Haiku 4.5** (90% of Sonnet capability, 3x cost savings):
- Lightweight agents with frequent invocation
- Pair programming and code generation
- Worker agents in multi-agent systems

**Sonnet 4.5** (Best coding model):
- Main development work
- Orchestrating multi-agent workflows
- Complex coding tasks

**Opus 4.5** (Deepest reasoning):
- Complex architectural decisions
- Maximum reasoning requirements
- Research and analysis tasks

<!--
【说明】上下文窗口管理：
- 避免在上下文窗口最后 20% 进行：大规模重构、跨多文件功能实现、调试复杂交互
- 上下文敏感度较低的任务：单文件编辑、独立工具创建、文档更新、简单 bug 修复
-->
## Context Window Management

Avoid last 20% of context window for:
- Large-scale refactoring
- Feature implementation spanning multiple files
- Debugging complex interactions

Lower context sensitivity tasks:
- Single-file edits
- Independent utility creation
- Documentation updates
- Simple bug fixes

<!--
【说明】扩展思考 + 计划模式：
- 扩展思考默认启用，保留最多 31,999 个 token 用于内部推理
- 控制方式：Option+T/Alt+T 切换、配置文件设置、MAX_THINKING_TOKENS 环境变量
- 复杂任务：确保扩展思考启用、启用计划模式、使用多轮批判、使用分角色子代理
-->
## Extended Thinking + Plan Mode

Extended thinking is enabled by default, reserving up to 31,999 tokens for internal reasoning.

Control extended thinking via:
- **Toggle**: Option+T (macOS) / Alt+T (Windows/Linux)
- **Config**: Set `alwaysThinkingEnabled` in `~/.claude/settings.json`
- **Budget cap**: `export MAX_THINKING_TOKENS=10000`
- **Verbose mode**: Ctrl+O to see thinking output

For complex tasks requiring deep reasoning:
1. Ensure extended thinking is enabled (on by default)
2. Enable **Plan Mode** for structured approach
3. Use multiple critique rounds for thorough analysis
4. Use split role sub-agents for diverse perspectives

<!--
【说明】构建故障排除：
1. 使用 build-error-resolver 代理
2. 分析错误消息
3. 逐步修复
4. 每次修复后验证
-->
## Build Troubleshooting

If build fails:
1. Use **build-error-resolver** agent
2. Analyze error messages
3. Fix incrementally
4. Verify after each fix
