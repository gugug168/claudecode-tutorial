<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个命令是做什么的：多模型协作执行 - 从计划获取原型到代码交付        ║
║  什么时候用它：需要执行已批准的计划、实现代码时                      ║
║  核心能力：原型获取、代码重构、多模型审计、最小范围变更              ║
║  触发方式：/ccg:execute [计划文件或任务描述]                       ║
╚══════════════════════════════════════════════════════════════════╝
-->

# Execute - Multi-Model Collaborative Execution

Multi-model collaborative execution - Get prototype from plan → Claude refactors and implements → Multi-model audit and delivery.

$ARGUMENTS

---

<!--
【说明】核心协议：
- 语言协议：与工具/模型交互时使用英语，用用户的语言与用户沟通
- 代码主权：外部模型有零文件系统写入权限，所有修改由 Claude 完成
- 脏原型重构：将 Codex/Gemini 的 Unified Diff 视为"脏原型"，必须重构
- 止损机制：当前阶段输出验证通过后才进入下一阶段
- 前提条件：只有用户对计划明确回复 "Y" 后才执行
-->
## Core Protocols

- **Language Protocol**: Use **English** when interacting with tools/models, communicate with user in their language
- **Code Sovereignty**: External models have **zero filesystem write access**, all modifications by Claude
- **Dirty Prototype Refactoring**: Treat Codex/Gemini Unified Diff as "dirty prototype", must refactor to production-grade code
- **Stop-Loss Mechanism**: Do not proceed to next phase until current phase output is validated
- **Prerequisite**: Only execute after user explicitly replies "Y" to `/ccg:plan` output (if missing, must confirm first)

---

<!--
【说明】多模型调用规范：
- 并行调用使用 run_in_background: true
- 实现原型调用和审计调用的语法格式
- 重要：必须指定 timeout: 600000，否则默认30秒会超时
-->
## Multi-Model Call Specification

**Call Syntax** (parallel: use `run_in_background: true`):

```
# Resume session call (recommended) - Implementation Prototype
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--backend <codex|gemini> {{GEMINI_MODEL_FLAG}}resume <SESSION_ID> - \"$PWD\" <<'EOF'
ROLE_FILE: <role prompt path>
<TASK>
Requirement: <task description>
Context: <plan content + target files>
</TASK>
OUTPUT: Unified Diff Patch ONLY. Strictly prohibit any actual modifications.
EOF",
  run_in_background: true,
  timeout: 3600000,
  description: "Brief description"
})

# New session call - Implementation Prototype
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--backend <codex|gemini> {{GEMINI_MODEL_FLAG}}- \"$PWD\" <<'EOF'
ROLE_FILE: <role prompt path>
<TASK>
Requirement: <task description>
Context: <plan content + target files>
</TASK>
OUTPUT: Unified Diff Patch ONLY. Strictly prohibit any actual modifications.
EOF",
  run_in_background: true,
  timeout: 3600000,
  description: "Brief description"
})
```

<!--
【说明】审计调用语法：用于代码审查/审计
- 不要修改任何文件
- 输出优先级问题列表和具体修复
-->
**Audit Call Syntax** (Code Review / Audit):

```
Bash({
  command: "~/.claude/bin/codeagent-wrapper {{LITE_MODE_FLAG}}--backend <codex|gemini> {{GEMINI_MODEL_FLAG}}resume <SESSION_ID> - \"$PWD\" <<'EOF'
ROLE_FILE: <role prompt path>
<TASK>
Scope: Audit the final code changes.
Inputs:
- The applied patch (git diff / final unified diff)
- The touched files (relevant excerpts if needed)
Constraints:
- Do NOT modify any files.
- Do NOT output tool commands that assume filesystem access.
</TASK>
OUTPUT:
1) A prioritized list of issues (severity, file, rationale)
2) Concrete fixes; if code changes are needed, include a Unified Diff Patch in a fenced code block.
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
| Implementation | `~/.claude/.ccg/prompts/codex/architect.md` | `~/.claude/.ccg/prompts/gemini/frontend.md` |
| Review | `~/.claude/.ccg/prompts/codex/reviewer.md` | `~/.claude/.ccg/prompts/gemini/reviewer.md` |

**Session Reuse**: If `/ccg:plan` provided SESSION_ID, use `resume <SESSION_ID>` to reuse context.

<!--
【说明】等待后台任务：最大超时 600000ms（10分钟）
- 如果10分钟后未完成，继续轮询，永远不要杀死进程
- 如果因超时跳过等待，必须询问用户
-->
**Wait for Background Tasks** (max timeout 600000ms = 10 minutes):

```
TaskOutput({ task_id: "<task_id>", block: true, timeout: 600000 })
```

**IMPORTANT**:
- Must specify `timeout: 600000`, otherwise default 30 seconds will cause premature timeout
- If still incomplete after 10 minutes, continue polling with `TaskOutput`, **NEVER kill the process**
- If waiting is skipped due to timeout, **MUST call `AskUserQuestion` to ask user whether to continue waiting or kill task**

---

<!--
【说明】执行工作流：5个阶段，任务描述为 $ARGUMENTS
-->
## Execution Workflow

**Execute Task**: $ARGUMENTS

<!--
【说明】阶段0：读取计划
- 识别输入类型（计划文件路径或直接任务描述）
- 读取并解析计划内容
- 执行前确认
- 任务类型路由：
  - 前端：页面、组件、UI、样式、布局 → Gemini
  - 后端：API、接口、数据库、逻辑、算法 → Codex
  - 全栈：同时包含前后端 → 并行
-->
### Phase 0: Read Plan

`[Mode: Prepare]`

1. **Identify Input Type**:
   - Plan file path (e.g., `.claude/plan/xxx.md`)
   - Direct task description

2. **Read Plan Content**:
   - If plan file path provided, read and parse
   - Extract: task type, implementation steps, key files, SESSION_ID

3. **Pre-Execution Confirmation**:
   - If input is "direct task description" or plan missing `SESSION_ID` / key files: confirm with user first
   - If cannot confirm user replied "Y" to plan: must confirm again before proceeding

4. **Task Type Routing**:

   | Task Type | Detection | Route |
   |-----------|-----------|-------|
   | **Frontend** | Pages, components, UI, styles, layout | Gemini |
   | **Backend** | API, interfaces, database, logic, algorithms | Codex |
   | **Fullstack** | Contains both frontend and backend | Codex ∥ Gemini parallel |

---

<!--
【说明】阶段1：快速上下文检索
- 必须使用 MCP 工具进行检索，不要手动逐个读取文件
- 检索策略：从计划的关键文件表提取目标路径
- 永远不要使用 Bash + find/ls 手动探索项目结构
-->
### Phase 1: Quick Context Retrieval

`[Mode: Retrieval]`

**Must use MCP tool for quick context retrieval, do NOT manually read files one by one**

Based on "Key Files" list in plan, call `mcp__ace-tool__search_context`:

```
mcp__ace-tool__search_context({
  query: "<semantic query based on plan content, including key files, modules, function names>",
  project_root_path: "$PWD"
})
```

**Retrieval Strategy**:
- Extract target paths from plan's "Key Files" table
- Build semantic query covering: entry files, dependency modules, related type definitions
- If results insufficient, add 1-2 recursive retrievals
- **NEVER** use Bash + find/ls to manually explore project structure

**After Retrieval**:
- Organize retrieved code snippets
- Confirm complete context for implementation
- Proceed to Phase 3

---

<!--
【说明】阶段3：原型获取 - 根据任务类型路由
- 路由A（前端）：Gemini，上下文<32k tokens，Gemini 是前端设计权威
- 路由B（后端）：Codex，Codex 是后端逻辑权威
- 路由C（全栈）：并行调用
- 所有路由输出：仅 Unified Diff Patch
-->
### Phase 3: Prototype Acquisition

`[Mode: Prototype]`

**Route Based on Task Type**:

#### Route A: Frontend/UI/Styles → Gemini

**Limit**: Context < 32k tokens

1. Call Gemini (use `~/.claude/.ccg/prompts/gemini/frontend.md`)
2. Input: Plan content + retrieved context + target files
3. OUTPUT: `Unified Diff Patch ONLY. Strictly prohibit any actual modifications.`
4. **Gemini is frontend design authority, its CSS/React/Vue prototype is the final visual baseline**
5. **WARNING**: Ignore Gemini's backend logic suggestions
6. If plan contains `GEMINI_SESSION`: prefer `resume <GEMINI_SESSION>`

#### Route B: Backend/Logic/Algorithms → Codex

1. Call Codex (use `~/.claude/.ccg/prompts/codex/architect.md`)
2. Input: Plan content + retrieved context + target files
3. OUTPUT: `Unified Diff Patch ONLY. Strictly prohibit any actual modifications.`
4. **Codex is backend logic authority, leverage its logical reasoning and debug capabilities**
5. If plan contains `CODEX_SESSION`: prefer `resume <CODEX_SESSION>`

#### Route C: Fullstack → Parallel Calls

1. **Parallel Calls** (`run_in_background: true`):
   - Gemini: Handle frontend part
   - Codex: Handle backend part
2. Wait for both models' complete results with `TaskOutput`
3. Each uses corresponding `SESSION_ID` from plan for `resume` (create new session if missing)

**Follow the `IMPORTANT` instructions in `Multi-Model Call Specification` above**

---

<!--
【说明】阶段4：代码实现 - Claude 作为代码主权者
1. 读取 Diff：解析 Unified Diff Patch
2. 心理沙盒：模拟应用、检查一致性、识别冲突
3. 重构和清理：重构为高可读、可维护、企业级代码
4. 最小范围：变更仅限于需求范围
5. 应用变更：使用 Edit/Write 工具
6. 自验证：运行 lint/typecheck/tests
-->
### Phase 4: Code Implementation

`[Mode: Implement]`

**Claude as Code Sovereign executes the following steps**:

1. **Read Diff**: Parse Unified Diff Patch returned by Codex/Gemini

2. **Mental Sandbox**:
   - Simulate applying Diff to target files
   - Check logical consistency
   - Identify potential conflicts or side effects

3. **Refactor and Clean**:
   - Refactor "dirty prototype" to **highly readable, maintainable, enterprise-grade code**
   - Remove redundant code
   - Ensure compliance with project's existing code standards
   - **Do not generate comments/docs unless necessary**, code should be self-explanatory

4. **Minimal Scope**:
   - Changes limited to requirement scope only
   - **Mandatory review** for side effects
   - Make targeted corrections

5. **Apply Changes**:
   - Use Edit/Write tools to execute actual modifications
   - **Only modify necessary code**, never affect user's other existing functionality

6. **Self-Verification** (strongly recommended):
   - Run project's existing lint / typecheck / tests (prioritize minimal related scope)
   - If failed: fix regressions first, then proceed to Phase 5

---

<!--
【说明】阶段5：审计和交付
- 5.1 自动审计：并行调用 Codex 和 Gemini 审查
- 5.2 整合并修复：按信任规则权衡反馈
- 5.3 交付确认：报告变更摘要、审计结果、建议
-->
### Phase 5: Audit and Delivery

`[Mode: Audit]`

#### 5.1 Automatic Audit

**After changes take effect, MUST immediately parallel call** Codex and Gemini for Code Review:

1. **Codex Review** (`run_in_background: true`):
   - ROLE_FILE: `~/.claude/.ccg/prompts/codex/reviewer.md`
   - Input: Changed Diff + target files
   - Focus: Security, performance, error handling, logic correctness

2. **Gemini Review** (`run_in_background: true`):
   - ROLE_FILE: `~/.claude/.ccg/prompts/gemini/reviewer.md`
   - Input: Changed Diff + target files
   - Focus: Accessibility, design consistency, user experience

Wait for both models' complete review results with `TaskOutput`. Prefer reusing Phase 3 sessions (`resume <SESSION_ID>`) for context consistency.

#### 5.2 Integrate and Fix

1. Synthesize Codex + Gemini review feedback
2. Weigh by trust rules: Backend follows Codex, Frontend follows Gemini
3. Execute necessary fixes
4. Repeat Phase 5.1 as needed (until risk is acceptable)

#### 5.3 Delivery Confirmation

After audit passes, report to user:

```markdown
## Execution Complete

### Change Summary
| File | Operation | Description |
|------|-----------|-------------|
| path/to/file.ts | Modified | Description |

### Audit Results
- Codex: <Passed/Found N issues>
- Gemini: <Passed/Found N issues>

### Recommendations
1. [ ] <Suggested test steps>
2. [ ] <Suggested verification steps>
```

---

<!--
【说明】关键规则：
1. 代码主权 – 所有文件修改由 Claude 完成
2. 脏原型重构 – Codex/Gemini 输出视为草稿，必须重构
3. 信任规则 – 后端遵循 Codex，前端遵循 Gemini
4. 最小变更 – 只修改必要的代码
5. 强制审计 – 变更后必须进行多模型代码审查
-->
## Key Rules

1. **Code Sovereignty** – All file modifications by Claude, external models have zero write access
2. **Dirty Prototype Refactoring** – Codex/Gemini output treated as draft, must refactor
3. **Trust Rules** – Backend follows Codex, Frontend follows Gemini
4. **Minimal Changes** – Only modify necessary code, no side effects
5. **Mandatory Audit** – Must perform multi-model Code Review after changes

---

<!--
【说明】用法：
- 执行计划文件
- 直接执行任务（用于上下文中已讨论的计划）
-->
## Usage

```bash
# Execute plan file
/ccg:execute .claude/plan/feature-name.md

# Execute task directly (for plans already discussed in context)
/ccg:execute implement user authentication based on previous plan
```

---

<!--
【说明】与 /ccg:plan 的关系：
1. /ccg:plan 生成计划 + SESSION_ID
2. 用户用 "Y" 确认
3. /ccg:execute 读取计划，复用 SESSION_ID，执行实现
-->
## Relationship with /ccg:plan

1. `/ccg:plan` generates plan + SESSION_ID
2. User confirms with "Y"
3. `/ccg:execute` reads plan, reuses SESSION_ID, executes implementation
