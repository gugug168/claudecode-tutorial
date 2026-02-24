<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个技能是做什么的:数据库迁移最佳实践                              ║
║  什么时候用它:修改表结构、数据迁移、零停机部署、设置迁移工具时      ║
║  核心能力:安全迁移、回滚策略、零停机、Prisma/Drizzle/Django       ║
╚══════════════════════════════════════════════════════════════════╝
-->

---
name: database-migrations
description: Database migration best practices for schema changes, data migrations, rollbacks, and zero-downtime deployments across PostgreSQL, MySQL, and common ORMs (Prisma, Drizzle, Django, TypeORM, golang-migrate).
---

# 数据库迁移模式

<!--
【说明】数据库迁移模式的核心内容:
- 生产系统安全、可逆的数据库结构变更
- 覆盖 PostgreSQL、MySQL 和常用 ORM
-->
生产系统安全、可逆的数据库结构变更。

<!--
【说明】何时激活此技能:
- 创建或修改数据库表
- 添加/删除列或索引
- 运行数据迁移(回填、转换)
- 规划零停机结构变更
- 为新项目设置迁移工具
-->
## 何时激活

- 创建或修改数据库表
- 添加/删除列或索引
- 运行数据迁移(回填、转换)
- 规划零停机结构变更
- 为新项目设置迁移工具

<!--
【说明】核心原则:
1. 每次变更都是迁移 — 永远不要手动修改生产数据库
2. 生产环境迁移只能向前 — 回滚使用新的前向迁移
3. 结构迁移和数据迁移分开 — 永远不要在一个迁移中混合 DDL 和 DML
4. 用生产规模数据测试迁移 — 在100行上工作的迁移可能在1000万行上锁定
5. 迁移一旦部署就不可变 — 永远不要编辑已在生产运行的迁移
-->
## 核心原则

1. **每次变更都是迁移** — 永远不要手动修改生产数据库
2. **生产环境迁移只能向前** — 回滚使用新的前向迁移
3. **结构迁移和数据迁移分开** — 永远不要在一个迁移中混合 DDL 和 DML
4. **用生产规模数据测试迁移** — 在100行上工作的迁移可能在1000万行上锁定
5. **迁移一旦部署就不可变** — 永远不要编辑已在生产运行的迁移

<!--
【说明】迁移安全检查清单 - 应用任何迁移前:
- 迁移同时有 UP 和 DOWN
- 大表无全表锁
- 新列有默认值或可为空
- 索引并发创建
- 数据回填与结构变更分开
- 已用生产数据副本测试
- 回滚计划已文档化
-->
## 迁移安全检查清单

应用任何迁移前:

- [ ] 迁移同时有 UP 和 DOWN(或明确标记为不可逆)
- [ ] 大表无全表锁(使用并发操作)
- [ ] 新列有默认值或可为空(永远不要添加没有默认值的 NOT NULL)
- [ ] 索引并发创建(对于现有表,不与 CREATE TABLE 内联)
- [ ] 数据回填与结构变更是分开的迁移
- [ ] 在生产数据副本上测试过
- [ ] 回滚计划已文档化

<!--
【说明】PostgreSQL 模式:
- 安全添加列:可空列或有默认值
- 无停机添加索引:使用 CONCURRENTLY
- 重命名列:使用扩展-收缩模式
- 安全删除列:先移除代码引用
- 大数据迁移:批量更新
-->
## PostgreSQL 模式

### 安全添加列

```sql
-- 好的做法:可为空列,无锁
ALTER TABLE users ADD COLUMN avatar_url TEXT;

-- 好的做法:有默认值的列(Postgres 11+ 是即时的,无重写)
ALTER TABLE users ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;

-- 坏的做法:现有表添加 NOT NULL 但无默认值(需要完全重写)
ALTER TABLE users ADD COLUMN role TEXT NOT NULL;
-- 这会锁定表并重写每一行
```

### 无停机添加索引

```sql
-- 坏的做法:在大表上阻塞写入
CREATE INDEX idx_users_email ON users (email);

-- 好的做法:非阻塞,允许并发写入
CREATE INDEX CONCURRENTLY idx_users_email ON users (email);

-- 注意:CONCURRENTLY 不能在事务块内运行
-- 大多数迁移工具需要特殊处理
```

### 重命名列(零停机)

永远不要在生产中直接重命名。使用扩展-收缩模式:

```sql
-- 步骤 1: 添加新列(迁移 001)
ALTER TABLE users ADD COLUMN display_name TEXT;

-- 步骤 2: 回填数据(迁移 002,数据迁移)
UPDATE users SET display_name = username WHERE display_name IS NULL;

-- 步骤 3: 更新应用代码以读写两列
-- 部署应用变更

-- 步骤 4: 停止写入旧列,删除它(迁移 003)
ALTER TABLE users DROP COLUMN username;
```

### 安全删除列

```sql
-- 步骤 1: 移除所有对该列的应用引用
-- 步骤 2: 部署不包含该列引用的应用
-- 步骤 3: 在下一次迁移中删除列
ALTER TABLE orders DROP COLUMN legacy_status;

-- 对于 Django:使用 SeparateDatabaseAndState 从模型中移除
-- 而不生成 DROP COLUMN(然后在下一次迁移中删除)
```

### 大数据迁移

```sql
-- 坏的做法:在一个事务中更新所有行(锁定表)
UPDATE users SET normalized_email = LOWER(email);

-- 好的做法:带进度的批量更新
DO $$
DECLARE
  batch_size INT := 10000;
  rows_updated INT;
BEGIN
  LOOP
    UPDATE users
    SET normalized_email = LOWER(email)
    WHERE id IN (
      SELECT id FROM users
      WHERE normalized_email IS NULL
      LIMIT batch_size
      FOR UPDATE SKIP LOCKED
    );
    GET DIAGNOSTICS rows_updated = ROW_COUNT;
    RAISE NOTICE 'Updated % rows', rows_updated;
    EXIT WHEN rows_updated = 0;
    COMMIT;
  END LOOP;
END $$;
```

<!--
【说明】Prisma(TypeScript/Node.js):
- 工作流:migrate dev、migrate deploy、migrate reset
- 结构示例:User 模型
- 自定义 SQL 迁移:用于 Prisma 无法表达的操作
-->
## Prisma (TypeScript/Node.js)

### 工作流

```bash
# 从 schema 变更创建迁移
npx prisma migrate dev --name add_user_avatar

# 在生产环境应用待处理的迁移
npx prisma migrate deploy

# 重置数据库(仅开发环境)
npx prisma migrate reset

# schema 变更后生成客户端
npx prisma generate
```

### Schema 示例

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  avatarUrl String?  @map("avatar_url")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  orders    Order[]

  @@map("users")
  @@index([email])
}
```

### 自定义 SQL 迁移

对于 Prisma 无法表达的操作(并发索引、数据回填):

```bash
# 创建空迁移,然后手动编辑 SQL
npx prisma migrate dev --create-only --name add_email_index
```

```sql
-- migrations/20240115_add_email_index/migration.sql
-- Prisma 无法生成 CONCURRENTLY,所以我们手动编写
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users (email);
```

<!--
【说明】Drizzle(TypeScript/Node.js):
- 工作流:generate、migrate、push
-->
## Drizzle (TypeScript/Node.js)

### 工作流

```bash
# 从 schema 变更生成迁移
npx drizzle-kit generate

# 应用迁移
npx drizzle-kit migrate

# 直接推送 schema(仅开发环境,无迁移文件)
npx drizzle-kit push
```

<!--
【说明】Django(Python):
- 工作流:makemigrations、migrate、showmigrations
- 数据迁移:使用 RunPython
-->
## Django (Python)

### 工作流

```bash
# 从模型变更生成迁移
python manage.py makemigrations

# 应用迁移
python manage.py migrate

# 显示迁移状态
python manage.py showmigrations

# 为自定义 SQL 生成空迁移
python manage.py makemigrations --empty app_name -n description
```

### 数据迁移

```python
from django.db import migrations

def backfill_display_names(apps, schema_editor):
    User = apps.get_model("accounts", "User")
    batch_size = 5000
    users = User.objects.filter(display_name="")
    while users.exists():
        batch = list(users[:batch_size])
        for user in batch:
            user.display_name = user.username
        User.objects.bulk_update(batch, ["display_name"], batch_size=batch_size)

def reverse_backfill(apps, schema_editor):
    pass  # 数据迁移,无需反向

class Migration(migrations.Migration):
    dependencies = [("accounts", "0015_add_display_name")]

    operations = [
        migrations.RunPython(backfill_display_names, reverse_backfill),
    ]
```

<!--
【说明】golang-migrate(Go):
- 工作流:create、up、down、force
- 迁移文件:up.sql 和 down.sql
-->
## golang-migrate (Go)

### 工作流

```bash
# 创建迁移对
migrate create -ext sql -dir migrations -seq add_user_avatar

# 应用所有待处理的迁移
migrate -path migrations -database "$DATABASE_URL" up

# 回滚最后一次迁移
migrate -path migrations -database "$DATABASE_URL" down 1

# 强制版本(修复脏状态)
migrate -path migrations -database "$DATABASE_URL" force VERSION
```

### 迁移文件

```sql
-- migrations/000003_add_user_avatar.up.sql
ALTER TABLE users ADD COLUMN avatar_url TEXT;
CREATE INDEX CONCURRENTLY idx_users_avatar ON users (avatar_url) WHERE avatar_url IS NOT NULL;

-- migrations/000003_add_user_avatar.down.sql
DROP INDEX IF EXISTS idx_users_avatar;
ALTER TABLE users DROP COLUMN IF EXISTS avatar_url;
```

<!--
【说明】零停机迁移策略 - 扩展-收缩模式:
- 阶段1 扩展:添加新列/表、应用同时写入新旧、回填现有数据
- 阶段2 迁移:应用从新读取、同时写入新旧、验证数据一致性
- 阶段3 收缩:应用只使用新、在单独迁移中删除旧列/表
-->
## 零停机迁移策略

对于关键生产变更,遵循扩展-收缩模式:

```
阶段 1: 扩展
  - 添加新列/表(可为空或有默认值)
  - 部署:应用同时写入新旧
  - 回填现有数据

阶段 2: 迁移
  - 部署:应用从新读取,同时写入新旧
  - 验证数据一致性

阶段 3: 收缩
  - 部署:应用仅使用新
  - 在单独迁移中删除旧列/表
```

<!--
【说明】反模式 - 应该避免:
- 生产中手动 SQL:无审计追踪,不可重复
- 编辑已部署迁移:导致环境间漂移
- 无默认值的 NOT NULL:锁定表,重写所有行
- 大表内联索引:构建时阻塞写入
- 结构+数据在一个迁移:难回滚,长事务
- 删除代码前删列:应用因缺少列出错
-->
## 反模式

| 反模式 | 为什么会失败 | 更好的方法 |
|-------------|-------------|-----------------|
| 生产中手动 SQL | 无审计追踪,不可重复 | 始终使用迁移文件 |
| 编辑已部署的迁移 | 导致环境间漂移 | 改为创建新迁移 |
| 无默认值的 NOT NULL | 锁定表,重写所有行 | 添加可为空列,回填,然后添加约束 |
| 大表内联索引 | 构建期间阻塞写入 | CREATE INDEX CONCURRENTLY |
| 一个迁移中包含结构+数据 | 难回滚,长事务 | 分离迁移 |
| 删除列前删除代码 | 应用因缺少列出错 | 先删除代码,下次部署时删除列 |
