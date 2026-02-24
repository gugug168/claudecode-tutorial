---
name: api-design
description: REST API 设计模式，包括资源命名、状态码、分页、过滤、错误响应、版本控制和生产 API 的速率限制。
---

# API 设计模式

设计一致、开发者友好的 REST API 的约定和最佳实践。

## 何时激活此技能

- 设计新的 API 端点
- 审查现有 API 契约
- 添加分页、过滤或排序功能
- 实现 API 错误处理
- 规划 API 版本策略
- 构建面向公众或合作伙伴的 API

## 资源设计

### URL 结构

```
# 资源使用名词、复数、小写、kebab-case
GET    /api/v1/users
GET    /api/v1/users/:id
POST   /api/v1/users
PUT    /api/v1/users/:id
PATCH  /api/v1/users/:id
DELETE /api/v1/users/:id

# 子资源用于表达关系
GET    /api/v1/users/:id/orders
POST   /api/v1/users/:id/orders

# 不映射到 CRUD 的操作（谨慎使用动词）
POST   /api/v1/orders/:id/cancel
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
```

### 命名规则

```
# 好的写法
/api/v1/team-members          # 多词资源使用 kebab-case
/api/v1/orders?status=active  # 过滤使用查询参数
/api/v1/users/123/orders      # 所有权使用嵌套资源

# 不好的写法
/api/v1/getUsers              # URL 中有动词
/api/v1/user                  # 单数（使用复数）
/api/v1/team_members          # URL 中使用 snake_case
/api/v1/users/123/getOrders   # 嵌套资源中有动词
```

## HTTP 方法和状态码

### 方法语义

| 方法 | 幂等 | 安全 | 用途 |
|------|------|------|------|
| GET | 是 | 是 | 检索资源 |
| POST | 否 | 否 | 创建资源，触发操作 |
| PUT | 是 | 否 | 完整替换资源 |
| PATCH | 否* | 否 | 部分更新资源 |
| DELETE | 是 | 否 | 删除资源 |

### 状态码参考

```
# 成功
200 OK                    — GET, PUT, PATCH（有响应体）
201 Created               — POST（包含 Location 头）
204 No Content            — DELETE, PUT（无响应体）

# 客户端错误
400 Bad Request           — 验证失败，JSON 格式错误
401 Unauthorized          — 缺少或无效的认证
403 Forbidden             — 已认证但未授权
404 Not Found             — 资源不存在
409 Conflict              — 重复条目，状态冲突
422 Unprocessable Entity  — 语义无效（有效的 JSON，错误的数据）
429 Too Many Requests     — 超过速率限制

# 服务器错误
500 Internal Server Error — 意外失败（永远不要暴露详情）
502 Bad Gateway           — 上游服务失败
503 Service Unavailable   — 临时过载，包含 Retry-After
```

## 响应格式

### 成功响应

```json
{
  "data": {
    "id": "abc-123",
    "email": "alice@example.com",
    "name": "Alice",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

### 集合响应（带分页）

```json
{
  "data": [
    { "id": "abc-123", "name": "Alice" },
    { "id": "def-456", "name": "Bob" }
  ],
  "meta": {
    "total": 142,
    "page": 1,
    "per_page": 20,
    "total_pages": 8
  },
  "links": {
    "self": "/api/v1/users?page=1&per_page=20",
    "next": "/api/v1/users?page=2&per_page=20",
    "last": "/api/v1/users?page=8&per_page=20"
  }
}
```

### 错误响应

```json
{
  "error": {
    "code": "validation_error",
    "message": "Request validation failed",
    "details": [
      {
        "field": "email",
        "message": "Must be a valid email address",
        "code": "invalid_format"
      }
    ]
  }
}
```

## 分页

### 基于偏移量（简单）

```
GET /api/v1/users?page=2&per_page=20

# 实现
SELECT * FROM users
ORDER BY created_at DESC
LIMIT 20 OFFSET 20;
```

**优点**：易于实现，支持"跳到第 N 页"
**缺点**：大偏移量时慢（OFFSET 100000），并发插入时不一致

### 基于游标（可扩展）

```
GET /api/v1/users?cursor=eyJpZCI6MTIzfQ&limit=20

# 实现
SELECT * FROM users
WHERE id > :cursor_id
ORDER BY id ASC
LIMIT 21;  -- 多获取一个以确定 has_next
```

**优点**：无论位置如何性能一致，并发插入时稳定
**缺点**：无法跳到任意页面，游标是不透明的

## API 设计检查清单

发布新端点前：

- [ ] 资源 URL 遵循命名约定（复数、kebab-case、无动词）
- [ ] 使用正确的 HTTP 方法（GET 用于读取，POST 用于创建等）
- [ ] 返回适当的状态码（不要所有都返回 200）
- [ ] 使用 schema 验证输入（Zod、Pydantic、Bean Validation）
- [ ] 错误响应遵循标准格式，包含代码和消息
- [ ] 列表端点实现分页（游标或偏移量）
- [ ] 需要认证或明确标记为公开
- [ ] 配置速率限制
