<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个技能是做什么的:ClickHouse 分析数据库模式                      ║
║  什么时候用它:设计分析表、优化查询、数据管道、实时仪表板时          ║
║  核心能力:MergeTree引擎、物化视图、批量插入、时间序列分析          ║
╚══════════════════════════════════════════════════════════════════╝
-->

---
name: clickhouse-io
description: ClickHouse database patterns, query optimization, analytics, and data engineering best practices for high-performance analytical workloads.
---

# ClickHouse 分析模式

<!--
【说明】ClickHouse 分析模式的核心内容:
- 高性能分析和数据工程的 ClickHouse 专用模式
- 适用于表结构设计、查询优化、数据摄入等场景
-->
高性能分析和数据工程的 ClickHouse 专用模式。

<!--
【说明】何时激活此技能:
- 设计 ClickHouse 表结构(MergeTree引擎选择)
- 编写分析查询(聚合、窗口函数、连接)
- 优化查询性能(分区裁剪、投影、物化视图)
- 摄入大量数据(批量插入、Kafka集成)
- 从PostgreSQL/MySQL迁移到ClickHouse做分析
- 实现实时仪表板或时间序列分析
-->
## 何时激活

- 设计 ClickHouse 表结构(MergeTree引擎选择)
- 编写分析查询(聚合、窗口函数、连接)
- 优化查询性能(分区裁剪、投影、物化视图)
- 摄入大量数据(批量插入、Kafka集成)
- 从PostgreSQL/MySQL迁移到ClickHouse做分析
- 实现实时仪表板或时间序列分析

<!--
【说明】概述 - ClickHouse 核心特性:
- 列式存储
- 数据压缩
- 并行查询执行
- 分布式查询
- 实时分析
-->
## 概述

ClickHouse 是一个面向列的数据库管理系统(DBMS),用于在线分析处理(OLAP)。它针对大数据集上的快速分析查询进行了优化。

**核心特性:**
- 面向列的存储
- 数据压缩
- 并行查询执行
- 分布式查询
- 实时分析

<!--
【说明】表设计模式:
- MergeTree:最常用的引擎,适合时序数据
- ReplacingMergeTree:自动去重
- AggregatingMergeTree:预聚合指标
-->
## 表设计模式

### MergeTree 引擎(最常用)

```sql
CREATE TABLE markets_analytics (
    date Date,
    market_id String,
    market_name String,
    volume UInt64,
    trades UInt32,
    unique_traders UInt32,
    avg_trade_size Float64,
    created_at DateTime
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(date)
ORDER BY (date, market_id)
SETTINGS index_granularity = 8192;
```

### ReplacingMergeTree(去重)

```sql
-- 对于可能有重复的数据(例如来自多个来源)
CREATE TABLE user_events (
    event_id String,
    user_id String,
    event_type String,
    timestamp DateTime,
    properties String
) ENGINE = ReplacingMergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (user_id, event_id, timestamp)
PRIMARY KEY (user_id, event_id);
```

### AggregatingMergeTree(预聚合)

```sql
-- 用于维护聚合指标
CREATE TABLE market_stats_hourly (
    hour DateTime,
    market_id String,
    total_volume AggregateFunction(sum, UInt64),
    total_trades AggregateFunction(count, UInt32),
    unique_users AggregateFunction(uniq, String)
) ENGINE = AggregatingMergeTree()
PARTITION BY toYYYYMM(hour)
ORDER BY (hour, market_id);

-- 查询聚合数据
SELECT
    hour,
    market_id,
    sumMerge(total_volume) AS volume,
    countMerge(total_trades) AS trades,
    uniqMerge(unique_users) AS users
FROM market_stats_hourly
WHERE hour >= toStartOfHour(now() - INTERVAL 24 HOUR)
GROUP BY hour, market_id
ORDER BY hour DESC;
```

<!--
【说明】查询优化模式:
- 优先使用索引列过滤
- 使用 ClickHouse 专用聚合函数
- 使用 quantile 计算百分位数
-->
## 查询优化模式

### 高效过滤

```sql
-- 好的做法:优先使用索引列
SELECT *
FROM markets_analytics
WHERE date >= '2025-01-01'
  AND market_id = 'market-123'
  AND volume > 1000
ORDER BY date DESC
LIMIT 100;

-- 坏的做法:优先过滤非索引列
SELECT *
FROM markets_analytics
WHERE volume > 1000
  AND market_name LIKE '%election%'
  AND date >= '2025-01-01';
```

### 聚合

```sql
-- 好的做法:使用 ClickHouse 专用聚合函数
SELECT
    toStartOfDay(created_at) AS day,
    market_id,
    sum(volume) AS total_volume,
    count() AS total_trades,
    uniq(trader_id) AS unique_traders,
    avg(trade_size) AS avg_size
FROM trades
WHERE created_at >= today() - INTERVAL 7 DAY
GROUP BY day, market_id
ORDER BY day DESC, total_volume DESC;

-- 使用 quantile 计算百分位数(比 percentile 更高效)
SELECT
    quantile(0.50)(trade_size) AS median,
    quantile(0.95)(trade_size) AS p95,
    quantile(0.99)(trade_size) AS p99
FROM trades
WHERE created_at >= now() - INTERVAL 1 HOUR;
```

### 窗口函数

```sql
-- 计算累计总和
SELECT
    date,
    market_id,
    volume,
    sum(volume) OVER (
        PARTITION BY market_id
        ORDER BY date
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS cumulative_volume
FROM markets_analytics
WHERE date >= today() - INTERVAL 30 DAY
ORDER BY market_id, date;
```

<!--
【说明】数据插入模式:
- 批量插入:高效推荐
- 流式插入:持续数据摄入
- 避免单条插入
-->
## 数据插入模式

### 批量插入(推荐)

```typescript
import { ClickHouse } from 'clickhouse'

const clickhouse = new ClickHouse({
  url: process.env.CLICKHOUSE_URL,
  port: 8123,
  basicAuth: {
    username: process.env.CLICKHOUSE_USER,
    password: process.env.CLICKHOUSE_PASSWORD
  }
})

// 批量插入(高效)
async function bulkInsertTrades(trades: Trade[]) {
  const values = trades.map(trade => `(
    '${trade.id}',
    '${trade.market_id}',
    '${trade.user_id}',
    ${trade.amount},
    '${trade.timestamp.toISOString()}'
  )`).join(',')

  await clickhouse.query(`
    INSERT INTO trades (id, market_id, user_id, amount, timestamp)
    VALUES ${values}
  `).toPromise()
}

// 单条插入(慢) - 不要在循环中这样做!
async function insertTrade(trade: Trade) {
  await clickhouse.query(`
    INSERT INTO trades VALUES ('${trade.id}', ...)
  `).toPromise()
}
```

### 流式插入

```typescript
// 用于持续数据摄入
import { createWriteStream } from 'fs'
import { pipeline } from 'stream/promises'

async function streamInserts() {
  const stream = clickhouse.insert('trades').stream()

  for await (const batch of dataSource) {
    stream.write(batch)
  }

  await stream.end()
}
```

<!--
【说明】物化视图 - 实时聚合:
- 自动维护聚合指标
- 查询时使用 Merge 函数
-->
## 物化视图

### 实时聚合

```sql
-- 创建小时统计的物化视图
CREATE MATERIALIZED VIEW market_stats_hourly_mv
TO market_stats_hourly
AS SELECT
    toStartOfHour(timestamp) AS hour,
    market_id,
    sumState(amount) AS total_volume,
    countState() AS total_trades,
    uniqState(user_id) AS unique_users
FROM trades
GROUP BY hour, market_id;

-- 查询物化视图
SELECT
    hour,
    market_id,
    sumMerge(total_volume) AS volume,
    countMerge(total_trades) AS trades,
    uniqMerge(unique_users) AS users
FROM market_stats_hourly
WHERE hour >= now() - INTERVAL 24 HOUR
GROUP BY hour, market_id;
```

<!--
【说明】性能监控:
- 查询性能:检查慢查询
- 表统计:检查表大小
-->
## 性能监控

### 查询性能

```sql
-- 检查慢查询
SELECT
    query_id,
    user,
    query,
    query_duration_ms,
    read_rows,
    read_bytes,
    memory_usage
FROM system.query_log
WHERE type = 'QueryFinish'
  AND query_duration_ms > 1000
  AND event_time >= now() - INTERVAL 1 HOUR
ORDER BY query_duration_ms DESC
LIMIT 10;
```

### 表统计

```sql
-- 检查表大小
SELECT
    database,
    table,
    formatReadableSize(sum(bytes)) AS size,
    sum(rows) AS rows,
    max(modification_time) AS latest_modification
FROM system.parts
WHERE active
GROUP BY database, table
ORDER BY sum(bytes) DESC;
```

<!--
【说明】常用分析查询:
- 时间序列分析:日活、留存
- 漏斗分析:转化率
- 队列分析:用户分组
-->
## 常用分析查询

### 时间序列分析

```sql
-- 日活跃用户
SELECT
    toDate(timestamp) AS date,
    uniq(user_id) AS daily_active_users
FROM events
WHERE timestamp >= today() - INTERVAL 30 DAY
GROUP BY date
ORDER BY date;

-- 留存分析
SELECT
    signup_date,
    countIf(days_since_signup = 0) AS day_0,
    countIf(days_since_signup = 1) AS day_1,
    countIf(days_since_signup = 7) AS day_7,
    countIf(days_since_signup = 30) AS day_30
FROM (
    SELECT
        user_id,
        min(toDate(timestamp)) AS signup_date,
        toDate(timestamp) AS activity_date,
        dateDiff('day', signup_date, activity_date) AS days_since_signup
    FROM events
    GROUP BY user_id, activity_date
)
GROUP BY signup_date
ORDER BY signup_date DESC;
```

### 漏斗分析

```sql
-- 转化漏斗
SELECT
    countIf(step = 'viewed_market') AS viewed,
    countIf(step = 'clicked_trade') AS clicked,
    countIf(step = 'completed_trade') AS completed,
    round(clicked / viewed * 100, 2) AS view_to_click_rate,
    round(completed / clicked * 100, 2) AS click_to_completion_rate
FROM (
    SELECT
        user_id,
        session_id,
        event_type AS step
    FROM events
    WHERE event_date = today()
)
GROUP BY session_id;
```

### 队列分析

```sql
-- 按注册月份的用户队列
SELECT
    toStartOfMonth(signup_date) AS cohort,
    toStartOfMonth(activity_date) AS month,
    dateDiff('month', cohort, month) AS months_since_signup,
    count(DISTINCT user_id) AS active_users
FROM (
    SELECT
        user_id,
        min(toDate(timestamp)) OVER (PARTITION BY user_id) AS signup_date,
        toDate(timestamp) AS activity_date
    FROM events
)
GROUP BY cohort, month, months_since_signup
ORDER BY cohort, months_since_signup;
```

<!--
【说明】数据管道模式:
- ETL 模式:提取、转换、加载
- CDC 模式:变更数据捕获
-->
## 数据管道模式

### ETL 模式

```typescript
// 提取、转换、加载
async function etlPipeline() {
  // 1. 从来源提取
  const rawData = await extractFromPostgres()

  // 2. 转换
  const transformed = rawData.map(row => ({
    date: new Date(row.created_at).toISOString().split('T')[0],
    market_id: row.market_slug,
    volume: parseFloat(row.total_volume),
    trades: parseInt(row.trade_count)
  }))

  // 3. 加载到 ClickHouse
  await bulkInsertToClickHouse(transformed)
}

// 定期运行
setInterval(etlPipeline, 60 * 60 * 1000)  // 每小时
```

### 变更数据捕获(CDC)

```typescript
// 监听 PostgreSQL 变更并同步到 ClickHouse
import { Client } from 'pg'

const pgClient = new Client({ connectionString: process.env.DATABASE_URL })

pgClient.query('LISTEN market_updates')

pgClient.on('notification', async (msg) => {
  const update = JSON.parse(msg.payload)

  await clickhouse.insert('market_updates', [
    {
      market_id: update.id,
      event_type: update.operation,  // INSERT, UPDATE, DELETE
      timestamp: new Date(),
      data: JSON.stringify(update.new_data)
    }
  ])
})
```

<!--
【说明】最佳实践:
1. 分区策略:按时间分区,避免过多分区
2. 排序键:最常过滤的列放前面
3. 数据类型:使用最小合适的类型
4. 避免:SELECT *、FINAL、过多 JOIN、小批量频繁插入
5. 监控:查询性能、磁盘使用、合并操作
-->
## 最佳实践

### 1. 分区策略
- 按时间分区(通常是月或天)
- 避免过多分区(会影响性能)
- 使用 DATE 类型作为分区键

### 2. 排序键
- 最常过滤的列放在前面
- 考虑基数(高基数优先)
- 排序影响压缩

### 3. 数据类型
- 使用最小合适的类型(UInt32 vs UInt64)
- 对重复字符串使用 LowCardinality
- 对分类数据使用 Enum

### 4. 避免
- SELECT *(指定列名)
- FINAL(在查询前合并数据)
- 过多 JOIN(为分析做反规范化)
- 频繁的小批量插入(改为批量)

### 5. 监控
- 跟踪查询性能
- 监控磁盘使用
- 检查合并操作
- 审查慢查询日志

---

<!--
【说明】记住:ClickHouse 擅长分析工作负载。为查询模式设计表结构、批量插入、利用物化视图实现实时聚合。
-->
**记住**: ClickHouse 擅长分析工作负载。为查询模式设计表结构、批量插入、利用物化视图实现实时聚合。
