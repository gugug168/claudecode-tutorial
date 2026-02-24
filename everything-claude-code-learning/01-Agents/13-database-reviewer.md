# Database-Reviewer（数据库审查代理）

## 一句话总结
Database-Reviewer 是一个PostgreSQL数据库专家，它专门检查查询性能、Schema设计、安全性和RLS策略，确保你的数据库代码遵循最佳实践。

---

## 它是什么？（小白视角）

### 用一个比喻来理解

想象数据库是你的仓库：

- **没有 Database-Reviewer**：货物乱堆，找不到东西，有时还会被偷
- **有 Database-Reviewer**：有位仓库管理专家帮你优化货架布局、设置门禁、提升效率

**Database-Reviewer 就是那位"仓库管理专家"**，它帮你优化数据库性能和安全。

### 数据库常见问题

| 问题 | 后果 |
|------|------|
| 缺少索引 | 查询慢如蜗牛 |
| N+1查询 | 一个页面查100次数据库 |
| SQL注入 | 数据被盗 |
| 无RLS | 用户A能看到用户B的数据 |

---

## 工作原理

```
数据库相关代码 ──→ Database-Reviewer ──→ 查询性能检查
    │                                     │
    │                                     ↓
    │                                Schema设计检查
    │                                     │
    │                                     ↓
    │                                安全检查(RLS)
    │                                     │
    │                                     ↓
    └─────────────────←─────────────── 报告问题
```

---

## 配置详解

```yaml
---
name: database-reviewer                              # 代理名称
description: PostgreSQL database specialist...       # 描述
tools: ["Read", "Write", "Edit", "Bash", "Grep", "Glob"]  # 可读写执行
model: sonnet                                        # 使用Sonnet模型
---
```

---

## 核心职责

1. **查询性能** - 优化查询、添加索引、防止全表扫描
2. **Schema设计** - 设计高效的表结构和约束
3. **安全与RLS** - 实现行级安全、最小权限访问
4. **连接管理** - 配置连接池、超时、限制
5. **并发** - 防止死锁、优化锁策略
6. **监控** - 设置查询分析和性能跟踪

---

## 诊断命令

```bash
# 连接数据库
psql $DATABASE_URL

# 查看最慢的10个查询
psql -c "SELECT query, mean_exec_time, calls FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"

# 查看表大小
psql -c "SELECT relname, pg_size_pretty(pg_total_relation_size(relid)) FROM pg_stat_user_tables ORDER BY pg_total_relation_size(relid) DESC;"

# 查看索引使用情况
psql -c "SELECT indexrelname, idx_scan, idx_tup_read FROM pg_stat_user_indexes ORDER BY idx_scan DESC;"
```

---

## 审查工作流程

### 1. 查询性能 (CRITICAL)

- WHERE/JOIN列有索引吗？
- 复杂查询运行 `EXPLAIN ANALYZE` — 检查大表的Seq Scan
- 注意N+1查询模式
- 验证复合索引列顺序（等值在前，范围在后）

```sql
-- 检查执行计划
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';

-- 查找全表扫描
EXPLAIN ANALYZE SELECT * FROM orders WHERE created_at > '2025-01-01';
```

### 2. Schema设计 (HIGH)

**正确的数据类型**：

| 用途 | 类型 |
|------|------|
| ID | `bigint` (不是int) |
| 字符串 | `text` (不是varchar(255)) |
| 时间戳 | `timestamptz` (不是timestamp) |
| 金额 | `numeric` (不是float) |
| 标志 | `boolean` |

**定义约束**：
- 主键 (PK)
- 外键带 `ON DELETE`
- `NOT NULL`
- `CHECK`

**命名规范**：
- 使用 `lowercase_snake_case`
- 不要用引号的混合大小写

### 3. 安全 (CRITICAL)

**RLS (Row Level Security)**：
- 多租户表启用RLS
- 使用 `(SELECT auth.uid())` 模式
- RLS策略列要建索引

**最小权限**：
- 不用 `GRANT ALL` 给应用用户
- 撤销public schema权限

---

## 关键原则

### 1. 索引外键

**永远、没有例外**

```sql
-- 外键必须索引
CREATE INDEX idx_orders_user_id ON orders(user_id);
```

### 2. 使用部分索引

```sql
-- 软删除场景
CREATE INDEX idx_users_active ON users(email) WHERE deleted_at IS NULL;
```

### 3. 覆盖索引

```sql
-- 避免回表
CREATE INDEX idx_orders_user_status ON orders(user_id, status) INCLUDE (created_at, total);
```

### 4. SKIP LOCKED用于队列

```sql
-- Worker模式，10倍吞吐量
UPDATE jobs
SET status = 'processing', worker_id = $1
WHERE id = (
    SELECT id FROM jobs
    WHERE status = 'pending'
    ORDER BY created_at
    LIMIT 1
    FOR UPDATE SKIP LOCKED
);
```

### 5. 游标分页

```sql
-- ❌ 错误: OFFSET在大表上很慢
SELECT * FROM orders ORDER BY id OFFSET 10000 LIMIT 10;

-- ✅ 正确: 游标分页
SELECT * FROM orders WHERE id > $last_id ORDER BY id LIMIT 10;
```

### 6. 批量插入

```sql
-- ❌ 错误: 循环中单条插入
for item in items:
    INSERT INTO orders (...) VALUES (...);

-- ✅ 正确: 多行INSERT或COPY
INSERT INTO orders (...) VALUES (...), (...), (...);
-- 或
COPY orders FROM STDIN CSV;
```

### 7. 短事务

```sql
-- ❌ 错误: 事务中调用外部API
BEGIN;
UPDATE accounts SET balance = balance - 100;
-- 调用外部支付API ← 这里可能很慢
COMMIT;

-- ✅ 正确: 事务外调用外部API
UPDATE accounts SET balance = balance - 100;
-- 调用外部API
```

### 8. 一致的锁顺序

```sql
-- 防止死锁：总是按id排序
SELECT * FROM accounts WHERE id IN (1, 2) ORDER BY id FOR UPDATE;
```

---

## 要标记的反模式

| 反模式 | 问题 |
|--------|------|
| 生产代码用 `SELECT *` | 浪费资源，schema变更时可能出问题 |
| ID用 `int` | 应用 `bigint` |
| 无理由用 `varchar(255)` | 应用 `text` |
| `timestamp` 不带时区 | 应用 `timestamptz` |
| 随机UUID作为主键 | 应用UUIDv7或IDENTITY |
| 大表用OFFSET分页 | 应用游标分页 |
| 未参数化查询 | SQL注入风险 |
| 给应用用户 `GRANT ALL` | 权限过大 |
| RLS策略每行调用函数 | 没有包装在 `SELECT` 中 |

---

## 审查检查清单

- [ ] 所有WHERE/JOIN列已索引
- [ ] 复合索引列顺序正确
- [ ] 正确的数据类型 (bigint, text, timestamptz, numeric)
- [ ] 多租户表启用RLS
- [ ] RLS策略使用 `(SELECT auth.uid())` 模式
- [ ] 外键有索引
- [ ] 无N+1查询模式
- [ ] 复杂查询运行过EXPLAIN ANALYZE
- [ ] 事务保持短小

---

## 实际示例

### RLS策略

```sql
-- 启用RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 正确的RLS策略
CREATE POLICY "Users can only see their own posts"
ON posts FOR ALL
TO authenticated
USING (user_id = (SELECT auth.uid()));

-- RLS策略列必须索引
CREATE INDEX idx_posts_user_id ON posts(user_id);
```

### 查询优化

```sql
-- 运行EXPLAIN ANALYZE
EXPLAIN ANALYZE
SELECT u.*, p.*
FROM users u
JOIN posts p ON p.user_id = u.id
WHERE u.email LIKE '%@example.com';

-- 如果看到Seq Scan，添加索引
CREATE INDEX idx_users_email ON users(email);
```

---

## 使用方法

### 自动触发

当你的代码涉及：
- SQL查询
- 数据库迁移
- Schema设计
- Supabase/PostgreSQL操作

Database-Reviewer 会自动被调用。

### 或者手动请求
```
帮我检查这个SQL查询有没有性能问题
```

---

## 工作流配合

```
/plan "添加订单功能"   ← planner制定计划
[写数据库代码...]
/database-reviewer     ← database-reviewer检查（自动）
/code-review           ← code-reviewer审查
```

---

## 注意事项

1. **索引外键** - 永远、没有例外
2. **EXPLAIN ANALYZE** - 复杂查询必须验证
3. **RLS安全** - 多租户必须启用
4. **短事务** - 不要在事务中调用外部API
5. **正确类型** - 用正确的数据类型

---

## 相关代理

- **security-reviewer** - 通用安全审查
- **code-reviewer** - 代码质量审查
- **python-reviewer** / **go-reviewer** - 语言特定审查

## 相关技能

- `skill: postgres-patterns` - 详细PostgreSQL模式
- `skill: database-migrations` - 迁移模式

## 参考

模式改编自 [Supabase Agent Skills](https://github.com/supabase/agent-skills) (MIT许可证)
