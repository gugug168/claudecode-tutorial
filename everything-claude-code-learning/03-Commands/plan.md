# Plan 计划命令

调用 **planner** agent 创建全面的实施计划。在编写任何代码之前等待用户确认。

## 此命令做什么

1. **重述需求** - 阐明需要构建什么
2. **识别风险** - 揭示潜在问题和阻碍因素
3. **创建步骤计划** - 将实施分解为阶段
4. **等待确认** - 必须在继续之前收到用户批准

## 什么时候使用

使用 `/plan` 当：
- 开始新功能
- 进行重大架构变更
- 进行复杂重构
- 多个文件/组件将受影响
- 需求不清楚或模糊

## planner agent 的工作流程

planner agent 将：

1. **分析请求**并用清晰的术语重述需求
2. **分解为阶段**，包含具体、可操作的步骤
3. **识别依赖**组件之间的关系
4. **评估风险**和潜在阻碍因素
5. **估算复杂度**（高/中/低）
6. **呈现计划**并等待你的明确确认

## 示例用法

```
用户: /plan 我需要添加实时通知，当市场结算时

Agent (planner):
# 实施计划：实时市场结算通知

## 需求重述
- 当用户关注的市场结算时发送通知
- 支持多种通知渠道（应用内、邮件、webhook）
- 确保通知可靠送达
- 包含市场结果和用户持仓结果

## 实施阶段

### 阶段 1：数据库模式
- 添加 notifications 表，字段：id, user_id, market_id, type, status, created_at
- 添加 user_notification_preferences 表用于渠道偏好
- 在 user_id 和 market_id 上创建索引提高性能

### 阶段 2：通知服务
- 在 lib/notifications.ts 创建通知服务
- 使用 BullMQ/Redis 实现通知队列
- 添加失败重试逻辑
- 创建通知模板

### 阶段 3：集成点
- 钩入市场结算逻辑（当状态变为"已结算"时）
- 查询所有在市场中有持仓的用户
- 为每个用户入队通知

### 阶段 4：前端组件
- 在头部创建 NotificationBell 组件
- 添加 NotificationList 弹窗
- 通过 Supabase 订阅实现实时更新
- 添加通知偏好设置页面

## 依赖
- Redis（用于队列）
- 邮件服务（SendGrid/Resend）
- Supabase 实时订阅

## 风险
- 高：邮件送达能力（需要 SPF/DKIM）
- 中：每个市场 1000+ 用户时的性能
- 中：市场频繁结算时的通知垃圾
- 低：实时订阅开销

## 估算复杂度：中

**等待确认**：是否继续此计划？(yes/no/modify)
```

## 重要说明

**关键**：planner agent **不会**编写任何代码，直到你用"yes"或"proceed"或类似的肯定回复明确确认计划。

如果想要修改，可以回复：
- "modify: [你的修改]"
- "different approach: [替代方案]"
- "skip phase 2 and do phase 3 first"

## 与其他命令的集成

规划后：
- 使用 `/tdd` 进行测试驱动开发
- 如果出现构建错误，使用 `/build-fix`
- 使用 `/code-review` 审查完成的实现

## 相关 Agent

此命令调用的 `planner` agent 位于：
`~/.claude/agents/planner.md`
