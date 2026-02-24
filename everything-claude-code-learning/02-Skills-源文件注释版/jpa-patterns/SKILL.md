<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个技能是做什么的：JPA/Hibernate 模式                             ║
║  什么时候用它：设计实体、定义关系、优化查询、配置事务时             ║
║  核心能力：实体设计、关系映射、N+1预防、分页、连接池、审计、迁移   ║
╚══════════════════════════════════════════════════════════════════╝
-->

---
name: jpa-patterns
description: JPA/Hibernate patterns for entity design, relationships, query optimization, transactions, auditing, indexing, pagination, and pooling in Spring Boot.
---

# JPA/Hibernate Patterns

Use for data modeling, repositories, and performance tuning in Spring Boot.

<!--
【说明】何时激活此技能：
- 设计 JPA 实体和表映射
- 定义关系 (@OneToMany, @ManyToOne, @ManyToMany)
- 优化查询（N+1 预防、抓取策略、投影）
- 配置事务、审计或软删除
- 设置分页、排序或自定义 Repository 方法
- 调优连接池 (HikariCP) 或二级缓存
-->
## When to Activate

- Designing JPA entities and table mappings
- Defining relationships (@OneToMany, @ManyToOne, @ManyToMany)
- Optimizing queries (N+1 prevention, fetch strategies, projections)
- Configuring transactions, auditing, or soft deletes
- Setting up pagination, sorting, or custom repository methods
- Tuning connection pooling (HikariCP) or second-level caching

<!--
【说明】实体设计示例：
- @Index 定义索引
- @EntityListeners 启用审计
- @CreatedDate/@LastModifiedDate 自动时间戳
-->
## Entity Design

```java
@Entity
@Table(name = "markets", indexes = {
  @Index(name = "idx_markets_slug", columnList = "slug", unique = true)
})
@EntityListeners(AuditingEntityListener.class)
public class MarketEntity {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 200)
  private String name;

  @Column(nullable = false, unique = true, length = 120)
  private String slug;

  @Enumerated(EnumType.STRING)
  private MarketStatus status = MarketStatus.ACTIVE;

  @CreatedDate private Instant createdAt;
  @LastModifiedDate private Instant updatedAt;
}
```

Enable auditing:
```java
@Configuration
@EnableJpaAuditing
class JpaConfig {}
```

<!--
【说明】关系和 N+1 预防：
- 默认延迟加载；需要时在查询中使用 JOIN FETCH
- 集合避免 EAGER；读路径使用 DTO 投影
-->
## Relationships and N+1 Prevention

```java
@OneToMany(mappedBy = "market", cascade = CascadeType.ALL, orphanRemoval = true)
private List<PositionEntity> positions = new ArrayList<>();
```

- Default to lazy loading; use `JOIN FETCH` in queries when needed
- Avoid `EAGER` on collections; use DTO projections for read paths

```java
@Query("select m from MarketEntity m left join fetch m.positions where m.id = :id")
Optional<MarketEntity> findWithPositions(@Param("id") Long id);
```

<!--
【说明】Repository 模式：
- 扩展 JpaRepository 获得基础 CRUD
- 使用 @Query 自定义 JPQL 查询
- 使用投影进行轻量级查询
-->
## Repository Patterns

```java
public interface MarketRepository extends JpaRepository<MarketEntity, Long> {
  Optional<MarketEntity> findBySlug(String slug);

  @Query("select m from MarketEntity m where m.status = :status")
  Page<MarketEntity> findByStatus(@Param("status") MarketStatus status, Pageable pageable);
}
```

- Use projections for lightweight queries:
```java
public interface MarketSummary {
  Long getId();
  String getName();
  MarketStatus getStatus();
}
Page<MarketSummary> findAllBy(Pageable pageable);
```

<!--
【说明】事务：
- 使用 @Transactional 注解服务方法
- 读路径使用 @Transactional(readOnly = true) 优化
- 谨慎选择传播行为；避免长时间运行的事务
-->
## Transactions

- Annotate service methods with `@Transactional`
- Use `@Transactional(readOnly = true)` for read paths to optimize
- Choose propagation carefully; avoid long-running transactions

```java
@Transactional
public Market updateStatus(Long id, MarketStatus status) {
  MarketEntity entity = repo.findById(id)
      .orElseThrow(() -> new EntityNotFoundException("Market"));
  entity.setStatus(status);
  return Market.from(entity);
}
```

<!--
【说明】分页：使用 PageRequest 和 Sort。
对于类似游标的分页，在 JPQL 中包含 id > :lastId 并排序。
-->
## Pagination

```java
PageRequest page = PageRequest.of(pageNumber, pageSize, Sort.by("createdAt").descending());
Page<MarketEntity> markets = repo.findByStatus(MarketStatus.ACTIVE, page);
```

For cursor-like pagination, include `id > :lastId` in JPQL with ordering.

<!--
【说明】索引和性能：
- 为常见过滤器添加索引 (status, slug, 外键)
- 使用匹配查询模式的复合索引
- 避免 select *；只投影需要的列
- 使用 saveAll 和 hibernate.jdbc.batch_size 批量写入
-->
## Indexing and Performance

- Add indexes for common filters (`status`, `slug`, foreign keys)
- Use composite indexes matching query patterns (`status, created_at`)
- Avoid `select *`; project only needed columns
- Batch writes with `saveAll` and `hibernate.jdbc.batch_size`

<!--
【说明】连接池 (HikariCP) 推荐属性
-->
## Connection Pooling (HikariCP)

Recommended properties:
```
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=30000
spring.datasource.hikari.validation-timeout=5000
```

For PostgreSQL LOB handling, add:
```
spring.jpa.properties.hibernate.jdbc.lob.non_contextual_creation=true
```

<!--
【说明】缓存：
- 一级缓存是每个 EntityManager 的；避免跨事务保留实体
- 对于读密集实体，谨慎考虑二级缓存；验证驱逐策略
-->
## Caching

- 1st-level cache is per EntityManager; avoid keeping entities across transactions
- For read-heavy entities, consider second-level cache cautiously; validate eviction strategy

<!--
【说明】迁移：
- 使用 Flyway 或 Liquibase；生产环境永远不要依赖 Hibernate 自动 DDL
- 保持迁移幂等和增量；避免无计划删除列
-->
## Migrations

- Use Flyway or Liquibase; never rely on Hibernate auto DDL in production
- Keep migrations idempotent and additive; avoid dropping columns without plan

<!--
【说明】测试数据访问：
- 偏好使用 Testcontainers 的 @DataJpaTest 来镜像生产环境
- 使用日志断言 SQL 效率：设置相关日志级别
-->
## Testing Data Access

- Prefer `@DataJpaTest` with Testcontainers to mirror production
- Assert SQL efficiency using logs: set `logging.level.org.hibernate.SQL=DEBUG` and `logging.level.org.hibernate.orm.jdbc.bind=TRACE` for parameter values

**Remember**: Keep entities lean, queries intentional, and transactions short. Prevent N+1 with fetch strategies and projections, and index for your read/write paths.
