<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个命令是做什么的：前端聚焦的多模型协作开发工作流                    ║
║  什么时候用它：处理前端任务（组件、布局、动画、样式优化）时            ║
║  核心能力：研究→构思→规划→执行→优化→审查、Gemini主导               ║
║  触发方式：/frontend <UI任务描述>                                  ║
╚══════════════════════════════════════════════════════════════════╝
-->

# Frontend - Frontend-Focused Development

Frontend-focused workflow (Research → Ideation → Plan → Execute → Optimize → Review), Gemini-led.

<!--
【说明】用法示例：/frontend <UI任务描述>
-->
## Usage

```bash
/frontend <UI task description>
```

<!--
【说明】上下文信息：
- 前端任务：$ARGUMENTS
- Gemini 主导，Codex 用于辅助参考
- 适用：组件设计、响应式布局、UI 动画、样式优化
-->
## Context

- Frontend task: $ARGUMENTS
- Gemini-led, Codex for auxiliary reference
- Applicable: Component design, responsive layout, UI animations, style optimization

<!--
【说明】你的角色：
- 你是**前端协调者**，协调多模型协作处理 UI/UX 任务
- 协作模型分工：
  - **Gemini** – 前端 UI/UX（前端权威，可信）
  - **Codex** – 后端视角（前端意见仅供参考）
  - **Claude（自己）** – 协调、规划、执行、交付
-->
## Your Role

You are the **Frontend Orchestrator**, coordinating multi-model collaboration for UI/UX tasks (Research → Ideation → Plan → Execute → Optimize → Review).

**Collaborative Models**:
- **Gemini** – Frontend UI/UX (**Frontend authority, trustworthy**)
- **Codex** – Backend perspective (**Frontend opinions for reference only**)
- **Claude (self)** – Orchestration, planning, execution, delivery

---

<!--
【说明】多模型调用规范：
- 新建会话调用和恢复会话调用的语法格式
- 需要指定 ROLE_FILE、TASK（需求+上下文）、OUTPUT
- 会话复用：每次调用返回 SESSION_ID，后续阶段使用 resume
-->
## Multi-Model Call Specification

**Call Syntax**:

```
# New session call
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--backend gemini --gemini-model gemini-3-pro-preview - \"$PWD\" <<'EOF'
ROLE_FILE: <role prompt path>
<TASK>
Requirement: <enhanced requirement (or $ARGUMENTS if not enhanced)>
Context: <project context and analysis from previous phases>
</TASK>
OUTPUT: Expected output format
EOF",
  run_in_background: false,
  timeout: 3600000,
  description: "Brief description"
})

# Resume session call
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--backend gemini --gemini-model gemini-3-pro-preview resume <SESSION_ID> - \"$PWD\" <<'EOF'
ROLE_FILE: <role prompt path>
<TASK>
Requirement: <enhanced requirement (or $ARGUMENTS if not enhanced)>
Context: <project context and analysis from previous phases>
</TASK>
OUTPUT: Expected output format
EOF",
  run_in_background: false,
  timeout: 3600000,
  description: "Brief description"
})
```

<!--
【说明】角色提示路径：按阶段选择对应的 Gemini 提示文件
-->
**Role Prompts**:

| Phase | Gemini |
|-------|--------|
| Analysis | `~/.claude/.ccg/prompts/gemini/analyzer.md` |
| Planning | `~/.claude/.ccg/prompts/gemini/architect.md` |
| Review | `~/.claude/.ccg/prompts/gemini/reviewer.md` |

**Session Reuse**: Each call returns `SESSION_ID: xxx`, use `resume xxx` for subsequent phases. Save `GEMINI_SESSION` in Phase 2, use `resume` in Phases 3 and 5.

---

<!--
【说明】沟通指南：
1. 响应以模式标签开始，初始为 [Mode: Research]
2. 遵循严格顺序：研究 → 构思 → 规划 → 执行 → 优化 → 审查
3. 需要时使用 AskUserQuestion 工具与用户交互
-->
## Communication Guidelines

1. Start responses with mode label `[Mode: X]`, initial is `[Mode: Research]`
2. Follow strict sequence: `Research → Ideation → Plan → Execute → Optimize → Review`
3. Use `AskUserQuestion` tool for user interaction when needed (e.g., confirmation/selection/approval)

---

<!--
【说明】核心工作流：6个阶段，从研究到质量审查
-->
## Core Workflow

<!--
【说明】阶段0（可选）：提示增强
- 如果 ace-tool MCP 可用，调用 enhance_prompt
- 用增强结果替换原始 $ARGUMENTS
-->
### Phase 0: Prompt Enhancement (Optional)

`[Mode: Prepare]` - If ace-tool MCP available, call `mcp__ace-tool__enhance_prompt`, **replace original $ARGUMENTS with enhanced result for subsequent Gemini calls**

<!--
【说明】阶段1：研究
- 代码检索：调用 search_context 检索组件、样式、设计系统
- 需求完整度评分：>=7 继续，<7 停止并补充
-->
### Phase 1: Research

`[Mode: Research]` - Understand requirements and gather context

1. **Code Retrieval** (if ace-tool MCP available): Call `mcp__ace-tool__search_context` to retrieve existing components, styles, design system
2. Requirement completeness score (0-10): >=7 continue, <7 stop and supplement

<!--
【说明】阶段2：构思 - Gemini 主导分析
- 必须调用 Gemini（使用 analyzer 提示）
- 输出：UI 可行性分析、推荐方案（至少2个）、UX 评估
- 保存 SESSION_ID 用于后续复用
-->
### Phase 2: Ideation

`[Mode: Ideation]` - Gemini-led analysis

**MUST call Gemini** (follow call specification above):
- ROLE_FILE: `~/.claude/.ccg/prompts/gemini/analyzer.md`
- Requirement: Enhanced requirement (or $ARGUMENTS if not enhanced)
- Context: Project context from Phase 1
- OUTPUT: UI feasibility analysis, recommended solutions (at least 2), UX evaluation

**Save SESSION_ID** (`GEMINI_SESSION`) for subsequent phase reuse.

Output solutions (at least 2), wait for user selection.

<!--
【说明】阶段3：规划 - Gemini 主导
- 使用 resume 复用会话
- 输出：组件结构、UI 流程、样式方案
- Claude 综合计划，用户批准后保存
-->
### Phase 3: Planning

`[Mode: Plan]` - Gemini-led planning

**MUST call Gemini** (use `resume <GEMINI_SESSION>` to reuse session):
- ROLE_FILE: `~/.claude/.ccg/prompts/gemini/architect.md`
- Requirement: User's selected solution
- Context: Analysis results from Phase 2
- OUTPUT: Component structure, UI flow, styling approach

Claude synthesizes plan, save to `.claude/plan/task-name.md` after user approval.

<!--
【说明】阶段4：实现 - 代码开发
- 严格遵循批准的计划
- 遵循现有项目设计系统和代码标准
- 确保响应式和可访问性
-->
### Phase 4: Implementation

`[Mode: Execute]` - Code development

- Strictly follow approved plan
- Follow existing project design system and code standards
- Ensure responsiveness, accessibility

<!--
【说明】阶段5：优化 - Gemini 主导审查
- 使用 reviewer 提示
- 输出：可访问性、响应式、性能、设计一致性问题列表
- 整合反馈，用户确认后执行优化
-->
### Phase 5: Optimization

`[Mode: Optimize]` - Gemini-led review

**MUST call Gemini** (follow call specification above):
- ROLE_FILE: `~/.claude/.ccg/prompts/gemini/reviewer.md`
- Requirement: Review the following frontend code changes
- Context: git diff or code content
- OUTPUT: Accessibility, responsiveness, performance, design consistency issues list

Integrate review feedback, execute optimization after user confirmation.

<!--
【说明】阶段6：质量审查 - 最终评估
- 对照计划检查完成度
- 验证响应式和可访问性
- 报告问题和建议
-->
### Phase 6: Quality Review

`[Mode: Review]` - Final evaluation

- Check completion against plan
- Verify responsiveness and accessibility
- Report issues and recommendations

---

<!--
【说明】关键规则：
1. Gemini 前端意见是可信的
2. Codex 前端意见仅供参考
3. 外部模型有零文件系统写入权限
4. Claude 处理所有代码写入和文件操作
-->
## Key Rules

1. **Gemini frontend opinions are trustworthy**
2. **Codex frontend opinions for reference only**
3. External models have **zero filesystem write access**
4. Claude handles all code writes and file operations
