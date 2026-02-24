<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个技能是做什么的:PostgreSQL 数据库模式                          ║
║  什么时候用它:写SQL查询、设计schema、排查慢查询、RLS、连接池时    ║
║  核心能力:索引策略、数据类型、查询优化、RLS策略、UPSERT、游标分页║
╚══════════════════════════════════════════════════════════════════╝
-->

---
name: postgres-patterns
description: PostgreSQL database patterns for query optimization, schema design, indexing, and security. Based on Supabase best practices.
---

# PostgreSQL 模式

<!--
【说明】PostgreSQL 最佳实践快速参考。详细指导请使用 `database-reviewer` 代理。
-->
PostgreSQL 最佳实践快速参考。如需详细指导,请使用 `database-reviewer` 代理。

<!--
【说明】何时激活此技能:
- 编写 SQL 查询或迁移
- 设计数据库 schema
- 排查慢查询
- 实施行级安全 (RLS)
- 设置连接池
-->
## 何时激活

- 编写 SQL 查询或迁移
- 设计数据库 schema
- 排查慢查询
- 实施行级安全 (RLS)
- 设置连接池

<!--
【说明】快速参考
-->
## 快速参考

<!--
【说明】索引速查表:
- 等值查询用 B-tree
- 范围查询用 B-tree
- 组合条件用复合索引
- JSONB 包含查询用 GIN
- 全文搜索用 GIN
- 时间序列范围用 BRIN
-->
### 索引速查表

| 查询模式 | 索引类型 | 示例 |
|--------------|------------|---------|
| `WHERE col = value` | B-tree (默认) | `CREATE INDEX idx ON t (col)` |
| `WHERE col > value` | B-tree | `CREATE INDEX idx ON t (col)` |
| `WHERE a = x AND b > y` | 复合索引 | `CREATE INDEX idx ON t (a, b)` |
| `WHERE jsonb @> '{}'` | GIN | `CREATE INDEX idx ON t USING gin (col)` |
| `WHERE tsv @@ query` | GIN | `CREATE INDEX idx ON t USING gin (col)` |
| 时间序列范围 | BRIN | `CREATE INDEX idx ON t USING brin (col)` |

<!--
【说明】数据类型快速参考:
- ID 用 bigint(避免 int 和随机 UUID)
- 字符串用 text(避免 varchar(255))
- 时间戳用 timestamptz(避免 timestamp)
- 金额用 numeric(避免 float)
- 标志位用 boolean(避免 varchar, int)
-->
### 数据类型快速参考

| 使用场景 | 正确类型 | 避免 |
|----------|-------------|-------|
| ID | `bigint` | `int`, 随机 UUID |
| 字符串 | `text` | `varchar(255)` |
| 时间戳 | `timestamptz` | `timestamp` |
| 金额 | `numeric(10,2)` | `float` |
| 标志位 | `boolean` | `varchar`, `int` |

<!--
【说明】常见模式
-->
### 常见模式

<!--
【说明】复合索引顺序:等值列在前,范围列在后
-->
**复合索引顺序:**
```sql
-- 等值列在前,然后是范围列
CREATE INDEX idx ON orders (status, created_at);
-- 适用于: WHERE status = 'pending' AND created_at > '2024-01-01'
```

<!--
【说明】覆盖索引:使用 INCLUDE 避免表查找
-->
**覆盖索引:**
```sql
CREATE INDEX idx ON users (email) INCLUDE (name, created_at);
-- 对于 SELECT email, name, created_at 避免表查找
```

<!--
【说明】部分索引:更小的索引,只包含活跃用户
-->
**部分索引:**
```sql
CREATE INDEX idx ON users (email) WHERE deleted_at IS NULL;
-- 更小的索引,只包含活跃用户
```

<!--
【说明】RLS 策略:必须包装在 SELECT 中以优化性能
-->
**RLS 策略(优化版):**
```sql
CREATE POLICY policy ON orders
  USING ((SELECT auth.uid()) = user_id);  -- 必须包装在 SELECT 中!
```

<!--
【说明】UPSERT:INSERT ... ON CONFLICT DO UPDATE
-->
**UPSERT:**
```sql
INSERT INTO settings (user_id, key, value)
VALUES (123, 'theme', 'dark')
ON CONFLICT (user_id, key)
DO UPDATE SET value = EXCLUDED.value;
```

<!--
【说明】游标分页:O(1) 复杂度,比 OFFSET O(n) 更高效
-->
**游标分页:**
```sql
SELECT * FROM products WHERE id > $last_id ORDER BY id LIMIT 20;
-- O(1) 复杂度,而 OFFSET 是 O(n)
```

<!--
【说明】队列处理:FOR UPDATE SKIP LOCKED 实现高吞吐量
-->
**队列处理:**
```sql
UPDATE jobs SET status = 'processing'
WHERE id = (
  SELECT id FROM jobs WHERE status = 'pending'
  ORDER BY created_at LIMIT 1
  FOR UPDATE SKIP LOCKED
) RETURNING *;
```

<!--
【说明】反模式检测 SQL:
- 查找未索引的外键
- 查找慢查询
- 检查表膨胀
-->
### 反模式检测

```sql
-- 查找未索引的外键
SELECT conrelid::regclass, a.attname
FROM pg_constraint c
JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
WHERE c.contype = 'f'
  AND NOT EXISTS (
    SELECT 1 FROM pg_index i
    WHERE i.indrelid = c.conrelid AND a.attnum = ANY(i.indkey)
  );

-- 查找慢查询
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY mean_exec_time DESC;

-- 检查表膨胀
SELECT relname, n_dead_tup, last_vacuum
FROM pg_stat_user_tables
WHERE n_dead_tup > 1000
ORDER BY n_dead_tup DESC;
```

<!--
【说明】配置模板:
- 连接限制(根据 RAM 调整)
- 超时设置
- 监控(pg_stat_statements)
- 安全默认值(撤销 public schema 权限)
-->
### 配置模板

```sql
-- 连接限制(根据 RAM 调整)
ALTER SYSTEM SET max_connections = 100;
ALTER SYSTEM SET work_mem = '8MB';

-- 超时设置
ALTER SYSTEM SET idle_in_transaction_session_timeout = '30s';
ALTER SYSTEM SET statement_timeout = '30s';

-- 监控
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- 安全默认值
REVOKE ALL ON SCHEMA public FROM public;

SELECT pg_reload_conf();
```

<!--
【说明】相关资源
-->
## 相关资源

- 代理: `database-reviewer` - 完整的数据库审查工作流
- 技能: `clickhouse-io` - ClickHouse 分析模式
- 技能: `backend-patterns` - API 和后端模式

---

*基于 [Supabase Agent Skills](https://github.com/supabase/agent-skills) (MIT 许可证)*
