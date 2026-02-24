<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个规则是做什么的：定义代理编排和使用规范                          ║
║  什么时候用它：需要调用子代理、并行执行任务时参考                     ║
║  核心能力：代理列表、即时使用场景、并行执行、多视角分析              ║
║  适用范围：通用规则                                                ║
╚══════════════════════════════════════════════════════════════════╝
-->

# Agent Orchestration

<!--
【说明】可用代理（位于 ~/.claude/agents/）：
| 代理 | 用途 | 何时使用 |
| planner | 实现规划 | 复杂功能、重构 |
| architect | 系统设计 | 架构决策 |
| tdd-guide | 测试驱动开发 | 新功能、bug 修复 |
| code-reviewer | 代码审查 | 编写代码后 |
| security-reviewer | 安全分析 | 提交前 |
| build-error-resolver | 修复构建错误 | 构建失败时 |
| e2e-runner | E2E 测试 | 关键用户流程 |
| refactor-cleaner | 死代码清理 | 代码维护 |
| doc-updater | 文档更新 | 更新文档 |
-->
## Available Agents

Located in `~/.claude/agents/`:

| Agent | Purpose | When to Use |
|-------|---------|-------------|
| planner | Implementation planning | Complex features, refactoring |
| architect | System design | Architectural decisions |
| tdd-guide | Test-driven development | New features, bug fixes |
| code-reviewer | Code review | After writing code |
| security-reviewer | Security analysis | Before commits |
| build-error-resolver | Fix build errors | When build fails |
| e2e-runner | E2E testing | Critical user flows |
| refactor-cleaner | Dead code cleanup | Code maintenance |
| doc-updater | Documentation | Updating docs |

<!--
【说明】即时代理使用（无需用户提示）：
1. 复杂功能请求 - 使用 planner 代理
2. 刚编写/修改的代码 - 使用 code-reviewer 代理
3. Bug 修复或新功能 - 使用 tdd-guide 代理
4. 架构决策 - 使用 architect 代理
-->
## Immediate Agent Usage

No user prompt needed:
1. Complex feature requests - Use **planner** agent
2. Code just written/modified - Use **code-reviewer** agent
3. Bug fix or new feature - Use **tdd-guide** agent
4. Architectural decision - Use **architect** 代理

<!--
【说明】并行任务执行：对于独立操作，始终使用并行 Task 执行
- 好：并行启动多个代理
- 坏：不必要的顺序执行
-->
## Parallel Task Execution

ALWAYS use parallel Task execution for independent operations:

```markdown
# GOOD: Parallel execution
Launch 3 agents in parallel:
1. Agent 1: Security analysis of auth module
2. Agent 2: Performance review of cache system
3. Agent 3: Type checking of utilities

# BAD: Sequential when unnecessary
First agent 1, then agent 2, then agent 3
```

<!--
【说明】多视角分析：对于复杂问题，使用分角色子代理
- 事实审查者、高级工程师、安全专家、一致性审查者、冗余检查者
-->
## Multi-Perspective Analysis

For complex problems, use split role sub-agents:
- Factual reviewer
- Senior engineer
- Security expert
- Consistency reviewer
- Redundancy checker
