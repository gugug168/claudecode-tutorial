<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个命令是做什么的：多模型协作规划 - 上下文检索 + 双模型分析       ║
║  什么时候用它：需要复杂功能规划、需要多模型协作分析时                ║
║  核心能力：上下文检索、多模型分析、生成实施计划                      ║
║  触发方式：/multi-plan [任务描述]                                  ║
╚══════════════════════════════════════════════════════════════════╝
-->

# Plan - Multi-Model Collaborative Planning

<!--
【说明】多模型协作规划 - 上下文检索 + 双模型分析 → 生成分步实施计划。
-->
Multi-model collaborative planning - Context retrieval + Dual-model analysis → Generate step-by-step implementation plan.

<!--
【说明】核心协议：
- 语言协议：与工具/模型交互时使用英语，用用户的语言与用户沟通
- 强制并行：Codex/Gemini 调用必须使用 run_in_background: true
- 代码主权：外部模型有零文件系统写入权限，所有修改由 Claude 完成
- 仅规划：此命令允许读取上下文和写入计划文件，但永远不要修改生产代码
-->
## Core Protocols

- **Language Protocol**: Use **English** when interacting with tools/models, communicate with user in their language
- **Mandatory Parallel**: Codex/Gemini calls MUST use `run_in_background: true`
- **Code Sovereignty**: External models have **zero filesystem write access**, all modifications by Claude
- **Planning Only**: This command allows reading context and writing to plan files, but **NEVER modify production code**

<!--
【说明】执行工作流：
阶段1：完整上下文检索 - 1.1 提示增强（必须先执行）、1.2 上下文检索
阶段2：多模型协作分析 - 2.1 分发输入（并行调用 Codex 后端分析和 Gemini 前端分析）、2.4 生成实施计划（Claude 最终版）
-->
## Execution Workflow

### Phase 1: Full Context Retrieval

#### 1.1 Prompt Enhancement (MUST execute first)

Call `mcp__ace-tool__enhance_prompt` tool:

#### 1.2 Context Retrieval

Call `mcp__ace-tool__search_context` tool:

### Phase 2: Multi-Model Collaborative Analysis

#### 2.1 Distribute Inputs

**Parallel call** Codex and Gemini (`run_in_background: true`):

1. **Codex Backend Analysis**:
   - Focus: Technical feasibility, architecture impact, performance considerations

2. **Gemini Frontend Analysis**:
   - Focus: UI/UX impact, user experience, visual design

#### 2.4 Generate Implementation Plan (Claude Final Version)

Synthesize both analyses, generate **Step-by-step Implementation Plan**:

<!--
【说明】计划保存：
- 首次规划：.claude/plan/<功能名称>.md
- 迭代版本：.claude/plan/<功能名称>-v2.md
-->
## Plan Saving

After planning completes, save plan to:

- **First planning**: `.claude/plan/<feature-name>.md`
- **Iteration versions**: `.claude/plan/<feature-name>-v2.md`

<!--
【说明】关键规则：
1. 仅规划，不实现 – 此命令不执行任何代码变更
2. 无 Y/N 提示 – 只呈现计划，让用户决定下一步
3. 信任规则 – 后端遵循 Codex，前端遵循 Gemini
4. 外部模型有零文件系统写入权限
-->
## Key Rules

1. **Plan only, no implementation** – This command does not execute any code changes
2. **No Y/N prompts** – Only present plan, let user decide next steps
3. **Trust Rules** – Backend follows Codex, Frontend follows Gemini
4. External models have **zero filesystem write access**
