<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个技能是做什么的：REST API 设计模式和最佳实践                     ║
║  什么时候用它：设计 API 端点、实现分页/过滤/错误处理时参考           ║
║  核心能力：资源命名、状态码、分页、过滤、错误响应、版本控制、限流    ║
╚══════════════════════════════════════════════════════════════════╝
-->

---
name: api-design
description: REST API design patterns including resource naming, status codes, pagination, filtering, error responses, versioning, and rate limiting for production APIs.
---

# API Design Patterns

<!--
【说明】API 设计模式的核心内容：
- 设计一致、开发者友好的 REST API 约定和最佳实践
- 适用于新项目、代码审查、重构等场景
-->
Conventions and best practices for designing consistent, developer-friendly REST APIs.

<!--
【说明】何时激活此技能：
- 设计新的 API 端点
- 审查现有 API 契约
- 添加分页、过滤或排序功能
- 实现 API 错误处理
- 规划 API 版本策略
- 构建面向公众或合作伙伴的 API
-->
## When to Activate

- Designing new API endpoints
- Reviewing existing API contracts
- Adding pagination, filtering, or sorting
- Implementing error handling for APIs
- Planning API versioning strategy
- Building public or partner-facing APIs

<!--
【说明】资源设计 - URL 结构要点：
- 资源使用名词、复数、小写、kebab-case
- 子资源用于表达关系
- 不映射到 CRUD 的操作谨慎使用动词
-->
## Resource Design

### URL Structure

```
# Resources are nouns, plural, lowercase, kebab-case
GET    /api/v1/users
GET    /api/v1/users/:id
POST   /api/v1/users
PUT    /api/v1/users/:id
PATCH  /api/v1/users/:id
DELETE /api/v1/users/:id

# Sub-resources for relationships
GET    /api/v1/users/:id/orders
POST   /api/v1/users/:id/orders

# Actions that don't map to CRUD (use verbs sparingly)
POST   /api/v1/orders/:id/cancel
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
```

<!--
【说明】命名规则：
- 多词资源使用 kebab-case
- 过滤使用查询参数
- 所有权使用嵌套资源
- 避免 URL 中有动词
- 使用复数形式
-->
### Naming Rules

```
# GOOD
/api/v1/team-members          # kebab-case for multi-word resources
/api/v1/orders?status=active  # query params for filtering
/api/v1/users/123/orders      # nested resources for ownership

# BAD
/api/v1/getUsers              # verb in URL
/api/v1/user                  # singular (use plural)
/api/v1/team_members          # snake_case in URLs
/api/v1/users/123/getOrders   # verb in nested resource
```

<!--
【说明】HTTP 方法和状态码：
- GET：检索资源，幂等且安全
- POST：创建资源/触发操作，非幂等
- PUT：完整替换资源，幂等
- PATCH：部分更新资源，非幂等
- DELETE：删除资源，幂等
-->
## HTTP Methods and Status Codes

### Method Semantics

| Method | Idempotent | Safe | Use For |
|--------|-----------|------|---------|
| GET | Yes | Yes | Retrieve resources |
| POST | No | No | Create resources, trigger actions |
| PUT | Yes | No | Full replacement of a resource |
| PATCH | No* | No | Partial update of a resource |
| DELETE | Yes | No | Remove a resource |

<!--
【说明】状态码参考：
- 2xx 成功：200 OK、201 Created、204 No Content
- 4xx 客户端错误：400 Bad Request、401 Unauthorized、403 Forbidden、404 Not Found、409 Conflict、422 Unprocessable Entity、429 Too Many Requests
- 5xx 服务端错误：500 Internal Server Error、502 Bad Gateway、503 Service Unavailable
-->
### Status Code Reference

```
# Success
200 OK                    — GET, PUT, PATCH (with response body)
201 Created               — POST (include Location header)
204 No Content            — DELETE, PUT (no response body)

# Client Errors
400 Bad Request           — Validation failure, malformed JSON
401 Unauthorized          — Missing or invalid authentication
403 Forbidden             — Authenticated but not authorized
404 Not Found             — Resource doesn't exist
409 Conflict              — Duplicate entry, state conflict
422 Unprocessable Entity  — Semantically invalid (valid JSON, bad data)
429 Too Many Requests     — Rate limit exceeded

# Server Errors
500 Internal Server Error — Unexpected failure (never expose details)
502 Bad Gateway           — Upstream service failed
503 Service Unavailable   — Temporary overload, include Retry-After
```

<!--
【说明】响应格式标准：
- 成功响应包含 data 字段
- 集合响应包含分页元信息 meta 和导航链接 links
- 错误响应包含 error 对象，含 code、message、details
-->
## Response Format

### Success Response

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

### Collection Response (with Pagination)

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

### Error Response

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

<!--
【说明】分页策略：
- 基于偏移量：简单易实现，支持跳页，但大偏移量性能差
- 基于游标：性能稳定，但不支持跳页
-->
## Pagination

### Offset-Based (Simple)

```
GET /api/v1/users?page=2&per_page=20

# Implementation
SELECT * FROM users
ORDER BY created_at DESC
LIMIT 20 OFFSET 20;
```

**Pros:** Easy to implement, supports "jump to page N"
**Cons:** Slow on large offsets (OFFSET 100000), inconsistent with concurrent inserts

### Cursor-Based (Scalable)

```
GET /api/v1/users?cursor=eyJpZCI6MTIzfQ&limit=20

# Implementation
SELECT * FROM users
WHERE id > :cursor_id
ORDER BY id ASC
LIMIT 21;  -- fetch one extra to determine has_next
```

**Pros:** Consistent performance regardless of position, stable with concurrent inserts
**Cons:** Cannot jump to arbitrary page, cursor is opaque

<!--
【说明】API 设计检查清单 - 发布新端点前：
- 资源 URL 遵循命名约定
- 使用正确的 HTTP 方法
- 返回适当的状态码
- 使用 schema 验证输入
- 错误响应遵循标准格式
- 列表端点实现分页
- 需要认证或明确标记公开
- 配置速率限制
-->
## API Design Checklist

Before shipping a new endpoint:

- [ ] Resource URL follows naming conventions (plural, kebab-case, no verbs)
- [ ] Correct HTTP method used (GET for reads, POST for creates, etc.)
- [ ] Appropriate status codes returned (not 200 for everything)
- [ ] Input validated with schema (Zod, Pydantic, Bean Validation)
- [ ] Error responses follow standard format with codes and messages
- [ ] Pagination implemented for list endpoints (cursor or offset)
- [ ] Authentication required (or explicitly marked as public)
- [ ] Rate limiting configured
