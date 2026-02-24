<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个命令是做什么的：全功能多模型协作开发工作流                       ║
║  什么时候用它：需要完整开发流程、自动路由前后端任务时                 ║
║  核心能力：6阶段工作流、质量门控、MCP集成、智能路由                  ║
║  触发方式：/workflow <任务描述>                                    ║
╚══════════════════════════════════════════════════════════════════╝
-->

# Workflow - Multi-Model Collaborative Development

Multi-model collaborative development workflow (Research → Ideation → Plan → Execute → Optimize → Review), with intelligent routing: Frontend → Gemini, Backend → Codex.

Structured development workflow with quality gates, MCP services, and multi-model collaboration.

<!--
【说明】用法：/workflow <任务描述>
-->
## Usage

```bash
/workflow <task description>
```

<!--
【说明】上下文：
- 待开发任务：$ARGUMENTS
- 带质量门控的结构化6阶段工作流
- 多模型协作：Codex（后端）+ Gemini（前端）+ Claude（协调）
- MCP 服务集成（ace-tool）
-->
## Context

- Task to develop: $ARGUMENTS
- Structured 6-phase workflow with quality gates
- Multi-model collaboration: Codex (backend) + Gemini (frontend) + Claude (orchestration)
- MCP service integration (ace-tool) for enhanced capabilities

<!--
【说明】你的角色：
- 你是**协调者**，协调多模型协作系统
- 协作模型分工：
  - ace-tool MCP：代码检索 + 提示增强
  - Codex：后端逻辑、算法、调试（后端权威，可信）
  - Gemini：前端 UI/UX、视觉设计（前端专家，后端意见仅供参考）
  - Claude（自己）：协调、规划、执行、交付
-->
## Your Role

You are the **Orchestrator**, coordinating a multi-model collaborative system (Research → Ideation → Plan → Execute → Optimize → Review). Communicate concisely and professionally for experienced developers.

**Collaborative Models**:
- **ace-tool MCP** – Code retrieval + Prompt enhancement
- **Codex** – Backend logic, algorithms, debugging (**Backend authority, trustworthy**)
- **Gemini** – Frontend UI/UX, visual design (**Frontend expert, backend opinions for reference only**)
- **Claude (self)** – Orchestration, planning, execution, delivery

---

<!--
【说明】多模型调用规范：
- 并行调用使用 run_in_background: true
- 新建会话和恢复会话的调用语法
- 重要：必须指定 timeout: 600000，否则默认30秒会超时
-->
## Multi-Model Call Specification

**Call syntax** (parallel: `run_in_background: true`, sequential: `false`):

```
# New session call
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--backend <codex|gemini> {{GEMINI_MODEL_FLAG}}- \"$PWD\" <<'EOF'
ROLE_FILE: <role prompt path>
<TASK>
Requirement: <enhanced requirement (or $ARGUMENTS if not enhanced)>
Context: <project context and analysis from previous phases>
</TASK>
OUTPUT: Expected output format
EOF",
  run_in_background: true,
  timeout: 3600000,
  description: "Brief description"
})

# Resume session call
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--backend <codex|gemini> {{GEMINI_MODEL_FLAG}}resume <SESSION_ID> - \"$PWD\" <<'EOF'
ROLE_FILE: <role prompt path>
<TASK>
Requirement: <enhanced requirement (or $ARGUMENTS if not enhanced)>
Context: <project context and analysis from previous phases>
</TASK>
OUTPUT: Expected output format
EOF",
  run_in_background: true,
  timeout: 3600000,
  description: "Brief description"
})
```

<!--
【说明】模型参数：使用 gemini 时需添加 --gemini-model gemini-3-pro-preview
-->
**Model Parameter Notes**:
- `{{GEMINI_MODEL_FLAG}}`: When using `--backend gemini`, replace with `--gemini-model gemini-3-pro-preview` (note trailing space); use empty string for codex

<!--
【说明】角色提示路径：各阶段对应的 Codex 和 Gemini 提示文件
-->
**Role Prompts**:

| Phase | Codex | Gemini |
|-------|-------|--------|
| Analysis | `~/.claude/.ccg/prompts/codex/analyzer.md` | `~/.claude/.ccg/prompts/gemini/analyzer.md` |
| Planning | `~/.claude/.ccg/prompts/codex/architect.md` | `~/.claude/.ccg/prompts/gemini/architect.md` |
| Review | `~/.claude/.ccg/prompts/codex/reviewer.md` | `~/.claude/.ccg/prompts/gemini/reviewer.md` |

**Session Reuse**: Each call returns `SESSION_ID: xxx`, use `resume xxx` subcommand for subsequent phases (note: `resume`, not `--resume`).

**Parallel Calls**: Use `run_in_background: true` to start, wait for results with `TaskOutput`. **Must wait for all models to return before proceeding to next phase**.

<!--
【说明】等待后台任务：最大超时 600000ms（10分钟）
- 如果10分钟后未完成，继续轮询，永远不要杀死进程
- 如果因超时跳过等待，必须询问用户是继续等待还是杀死任务
-->
**Wait for Background Tasks** (use max timeout 600000ms = 10 minutes):

```
TaskOutput({ task_id: "<task_id>", block: true, timeout: 600000 })
```

**IMPORTANT**:
- Must specify `timeout: 600000`, otherwise default 30 seconds will cause premature timeout.
- If still incomplete after 10 minutes, continue polling with `TaskOutput`, **NEVER kill the process**.
- If waiting is skipped due to timeout, **MUST call `AskUserQuestion` to ask user whether to continue waiting or kill task. Never kill directly.**

---

<!--
【说明】沟通指南：
1. 响应以模式标签开始
2. 遵循严格6阶段顺序
3. 每阶段完成后请求用户确认
4. 评分<7 或用户不批准时强制停止
5. 需要时使用 AskUserQuestion 工具
-->
## Communication Guidelines

1. Start responses with mode label `[Mode: X]`, initial is `[Mode: Research]`.
2. Follow strict sequence: `Research → Ideation → Plan → Execute → Optimize → Review`.
3. Request user confirmation after each phase completion.
4. Force stop when score < 7 or user does not approve.
5. Use `AskUserQuestion` tool for user interaction when needed (e.g., confirmation/selection/approval).

---

<!--
【说明】执行工作流：6阶段，任务描述为 $ARGUMENTS
-->
## Execution Workflow

**Task Description**: $ARGUMENTS

<!--
【说明】阶段1：研究和分析
- 提示增强：调用 enhance_prompt
- 上下文检索：调用 search_context
- 需求完整度评分：目标清晰度、预期结果、范围边界、约束条件
-->
### Phase 1: Research & Analysis

`[Mode: Research]` - Understand requirements and gather context:

1. **Prompt Enhancement**: Call `mcp__ace-tool__enhance_prompt`, **replace original $ARGUMENTS with enhanced result for all subsequent Codex/Gemini calls**
2. **Context Retrieval**: Call `mcp__ace-tool__search_context`
3. **Requirement Completeness Score** (0-10):
   - Goal clarity (0-3), Expected outcome (0-3), Scope boundaries (0-2), Constraints (0-2)
   - ≥7: Continue | <7: Stop, ask clarifying questions

<!--
【说明】阶段2：方案构思 - 多模型并行分析
- 并行调用 Codex 和 Gemini
- Codex：技术可行性、方案、风险
- Gemini：UI 可行性、方案、UX 评估
- 保存 SESSION_ID 用于后续复用
-->
### Phase 2: Solution Ideation

`[Mode: Ideation]` - Multi-model parallel analysis:

**Parallel Calls** (`run_in_background: true`):
- Codex: Use analyzer prompt, output technical feasibility, solutions, risks
- Gemini: Use analyzer prompt, output UI feasibility, solutions, UX evaluation

Wait for results with `TaskOutput`. **Save SESSION_ID** (`CODEX_SESSION` and `GEMINI_SESSION`).

**Follow the `IMPORTANT` instructions in `Multi-Model Call Specification` above**

Synthesize both analyses, output solution comparison (at least 2 options), wait for user selection.

<!--
【说明】阶段3：详细规划 - 多模型协作规划
- 使用 resume 恢复会话
- Codex：后端架构
- Gemini：前端架构
- Claude 综合，用户批准后保存计划
-->
### Phase 3: Detailed Planning

`[Mode: Plan]` - Multi-model collaborative planning:

**Parallel Calls** (resume session with `resume <SESSION_ID>`):
- Codex: Use architect prompt + `resume $CODEX_SESSION`, output backend architecture
- Gemini: Use architect prompt + `resume $GEMINI_SESSION`, output frontend architecture

Wait for results with `TaskOutput`.

**Follow the `IMPORTANT` instructions in `Multi-Model Call Specification` above**

**Claude Synthesis**: Adopt Codex backend plan + Gemini frontend plan, save to `.claude/plan/task-name.md` after user approval.

<!--
【说明】阶段4：实现 - 代码开发
- 严格遵循批准的计划
- 遵循现有项目代码标准
- 在关键里程碑请求反馈
-->
### Phase 4: Implementation

`[Mode: Execute]` - Code development:

- Strictly follow approved plan
- Follow existing project code standards
- Request feedback at key milestones

<!--
【说明】阶段5：代码优化 - 多模型并行审查
- Codex：安全、性能、错误处理
- Gemini：可访问性、设计一致性
- 整合反馈，用户确认后执行优化
-->
### Phase 5: Code Optimization

`[Mode: Optimize]` - Multi-model parallel review:

**Parallel Calls**:
- Codex: Use reviewer prompt, focus on security, performance, error handling
- Gemini: Use reviewer prompt, focus on accessibility, design consistency

Wait for results with `TaskOutput`. Integrate review feedback, execute optimization after user confirmation.

**Follow the `IMPORTANT` instructions in `Multi-Model Call Specification` above**

<!--
【说明】阶段6：质量审查 - 最终评估
- 对照计划检查完成度
- 运行测试验证功能
- 报告问题和建议
- 请求最终用户确认
-->
### Phase 6: Quality Review

`[Mode: Review]` - Final evaluation:

- Check completion against plan
- Run tests to verify functionality
- Report issues and recommendations
- Request final user confirmation

---

<!--
【说明】关键规则：
1. 阶段顺序不能跳过（除非用户明确指示）
2. 外部模型有零文件系统写入权限
3. 评分<7 或用户不批准时强制停止
-->
## Key Rules

1. Phase sequence cannot be skipped (unless user explicitly instructs)
2. External models have **zero filesystem write access**, all modifications by Claude
3. **Force stop** when score < 7 or user does not approve
