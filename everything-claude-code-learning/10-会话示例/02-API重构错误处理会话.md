<!--
【教学目标】

本示例展示如何使用 Claude Code 进行API重构会话。

学习要点：
1. 如何追踪大型重构任务的进度
2. 如何记录标准化规范
3. 如何发现并记录代码中的不一致问题
4. 如何组织多阶段重构工作

适用场景：
- 代码规范统一
- 多文件重构
- 需要保持一致性的大型改动

【Claude Code 使用技巧】

1. 用"关键发现"部分记录量化数据
2. 保存代码标准示例供参考
3. 使用待办清单追踪迁移进度
4. 记录下次会话的后续任务
5. 列出所有相关文件路径

-->

# 会话：API重构 - 错误处理
**日期：** 2026-01-19
**开始时间：** 10:00
**最后更新：** 13:30

---

## 当前状态

正在标准化所有API端点的错误处理。从零散的 try/catch 迁移到集中式错误中间件。

### 已完成
- [x] 创建带状态码的 AppError 类
- [x] 构建全局错误处理中间件
- [x] 迁移 `/users` 路由到新模式
- [x] 迁移 `/products` 路由

### 关键发现
- 47个端点的错误响应格式不一致
- 有些返回 `{ error: message }`，有些返回 `{ message: message }`
- 没有统一的HTTP状态码

### 错误响应标准
```javascript
{
  success: false,
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Email is required',
    field: 'email'  // 可选，用于验证错误
  }
}
```

### 下次会话的注意事项
- 迁移剩余路由：`/orders`、`/payments`、`/admin`
- 添加错误日志到监控服务

### 需要加载的上下文
src/middleware/errorHandler.js
src/utils/AppError.js
