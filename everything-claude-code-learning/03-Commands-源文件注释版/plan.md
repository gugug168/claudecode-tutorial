<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个命令是做什么的：调用 planner agent 创建实施计划                  ║
║  什么时候用它：开始新功能、架构变更、复杂重构、需求不明确时           ║
║  核心能力：重述需求、识别风险、分步计划、等待确认                     ║
║  触发方式：/plan                                                   ║
║  关联 Agent：planner                                               ║
╚══════════════════════════════════════════════════════════════════╝
-->

---
# 【元数据说明】
# description: 命令描述，告诉 Claude 这个命令的作用
#              关键词：Restate requirements（重述需求）、assess risks（评估风险）、
#              step-by-step implementation plan（分步实施计划）、
#              WAIT for user CONFIRM（等待用户确认）
---
description: Restate requirements, assess risks, and create step-by-step implementation plan. WAIT for user CONFIRM before touching any code.
---

# Plan Command

<!--
【说明】此命令调用 **planner** agent 在编写任何代码之前创建全面的实施计划。
-->
This command invokes the **planner** agent to create a comprehensive implementation plan before writing any code.

<!--
【说明】此命令做什么：
1. 重述需求 - 阐明需要构建什么
2. 识别风险 - 揭示潜在问题和阻碍因素
3. 创建步骤计划 - 将实施分解为阶段
4. 等待确认 - 必须在继续之前收到用户批准
-->
## What This Command Does

1. **Restate Requirements** - Clarify what needs to be built
2. **Identify Risks** - Surface potential issues and blockers
3. **Create Step Plan** - Break down implementation into phases
4. **Wait for Confirmation** - MUST receive user approval before proceeding

<!--
【说明】在以下情况使用 `/plan`：
- 开始新功能
- 进行重大架构变更
- 进行复杂重构
- 多个文件/组件将受影响
- 需求不清楚或模糊
-->
## When to Use

Use `/plan` when:
- Starting a new feature
- Making significant architectural changes
- Working on complex refactoring
- Multiple files/components will be affected
- Requirements are unclear or ambiguous

<!--
【说明】planner agent 的工作流程：
1. 分析请求并用清晰的术语重述需求
2. 分解为阶段，包含具体、可操作的步骤
3. 识别组件之间的依赖
4. 评估风险和潜在阻碍因素
5. 估算复杂度（高/中/低）
6. 呈现计划并等待你的明确确认
-->
## How It Works

The planner agent will:

1. **Analyze the request** and restate requirements in clear terms
2. **Break down into phases** with specific, actionable steps
3. **Identify dependencies** between components
4. **Assess risks** and potential blockers
5. **Estimate complexity** (High/Medium/Low)
6. **Present the plan** and WAIT for your explicit confirmation

<!--
【说明】示例用法：展示完整的规划交互过程，包括需求重述、实施阶段、依赖、风险等
-->
## Example Usage

```
User: /plan I need to add real-time notifications when markets resolve

Agent (planner):
# Implementation Plan: Real-Time Market Resolution Notifications

## Requirements Restatement
- Send notifications to users when markets they're watching resolve
- Support multiple notification channels (in-app, email, webhook)
- Ensure notifications are delivered reliably
- Include market outcome and user's position result

## Implementation Phases

### Phase 1: Database Schema
- Add notifications table with columns: id, user_id, market_id, type, status, created_at
- Add user_notification_preferences table for channel preferences
- Create indexes on user_id and market_id for performance

### Phase 2: Notification Service
- Create notification service in lib/notifications.ts
- Implement notification queue using BullMQ/Redis
- Add retry logic for failed deliveries
- Create notification templates

### Phase 3: Integration Points
- Hook into market resolution logic (when status changes to "resolved")
- Query all users with positions in market
- Enqueue notifications for each user

### Phase 4: Frontend Components
- Create NotificationBell component in header
- Add NotificationList modal
- Implement real-time updates via Supabase subscriptions
- Add notification preferences page

## Dependencies
- Redis (for queue)
- Email service (SendGrid/Resend)
- Supabase real-time subscriptions

## Risks
- HIGH: Email deliverability (SPF/DKIM required)
- MEDIUM: Performance with 1000+ users per market
- MEDIUM: Notification spam if markets resolve frequently
- LOW: Real-time subscription overhead

## Estimated Complexity: MEDIUM

**WAITING FOR CONFIRMATION**: Proceed with this plan? (yes/no/modify)
```

<!--
【说明】重要说明：
- planner agent 不会编写任何代码，直到你用"yes"或"proceed"或类似的肯定回复明确确认计划
- 如果想要修改，可以使用 modify、different approach 或跳过某个阶段等指令
-->
## Important Notes

**CRITICAL**: The planner agent will **NOT** write any code until you explicitly confirm the plan with "yes" or "proceed" or similar affirmative response.

If you want changes, respond with:
- "modify: [your changes]"
- "different approach: [alternative]"
- "skip phase 2 and do phase 3 first"

<!--
【说明】规划后可以使用的相关命令：
- /tdd 进行测试驱动开发
- /build-fix 修复构建错误
- /code-review 审查实现
-->
## Integration with Other Commands

After planning:
- Use `/tdd` to implement with test-driven development
- Use `/build-fix` if build errors occur
- Use `/code-review` to review completed implementation

<!--
【说明】此命令调用的 `planner` agent 位于用户配置目录
-->
## Related Agents

This command invokes the `planner` agent located at:
`~/.claude/agents/planner.md`
