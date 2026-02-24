<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个规则是做什么的：定义 Git 工作流和提交规范                       ║
║  什么时候用它：提交代码、创建 PR、功能实现时参考                     ║
║  核心能力：提交消息格式、PR工作流、功能实现工作流                    ║
║  适用范围：通用规则                                                ║
╚══════════════════════════════════════════════════════════════════╝
-->

# Git Workflow

<!--
【说明】提交消息格式：<类型>: <描述> + 可选正文
- 类型：feat（新功能）、fix（修复）、refactor（重构）
- docs（文档）、test（测试）、chore（杂项）、perf（性能）、ci（持续集成）
- 注意：通过 ~/.claude/settings.json 全局禁用归属签名
-->
## Commit Message Format

```
<type>: <description>

<optional body>
```

Types: feat, fix, refactor, docs, test, chore, perf, ci

Note: Attribution disabled globally via ~/.claude/settings.json.

<!--
【说明】Pull Request 工作流：
1. 分析完整提交历史（不只是最新提交）
2. 使用 git diff [base-branch]...HEAD 查看所有变更
3. 起草全面的 PR 摘要
4. 包含带 TODO 的测试计划
5. 如果是新分支，使用 -u 标志推送
-->
## Pull Request Workflow

When creating PRs:
1. Analyze full commit history (not just latest commit)
2. Use `git diff [base-branch]...HEAD` to see all changes
3. Draft comprehensive PR summary
4. Include test plan with TODOs
5. Push with `-u` flag if new branch

<!--
【说明】功能实现工作流：
1. 先规划 - 使用 planner 代理创建实现计划
2. TDD 方法 - 使用 tdd-guide 代理，RED → GREEN → IMPROVE
3. 代码审查 - 编写代码后立即使用 code-reviewer 代理
4. 提交和推送 - 遵循约定式提交格式
-->
## Feature Implementation Workflow

1. **Plan First**
   - Use **planner** agent to create implementation plan
   - Identify dependencies and risks
   - Break down into phases

2. **TDD Approach**
   - Use **tdd-guide** agent
   - Write tests first (RED)
   - Implement to pass tests (GREEN)
   - Refactor (IMPROVE)
   - Verify 80%+ coverage

3. **Code Review**
   - Use **code-reviewer** agent immediately after writing code
   - Address CRITICAL and HIGH issues
   - Fix MEDIUM issues when possible

4. **Commit & Push**
   - Detailed commit messages
   - Follow conventional commits format
