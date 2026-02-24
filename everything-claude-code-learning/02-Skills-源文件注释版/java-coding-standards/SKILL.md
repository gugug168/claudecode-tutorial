<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个技能是做什么的：Java 编码标准                                  ║
║  什么时候用它：编写或审查 Spring Boot 项目中的 Java 代码时         ║
║  核心能力：命名规范、不可变性、Optional、Streams、异常、泛型、日志  ║
╚══════════════════════════════════════════════════════════════════╝
-->

---
name: java-coding-standards
description: "Java coding standards for Spring Boot services: naming, immutability, Optional usage, streams, exceptions, generics, and project layout."
---

# Java Coding Standards

Standards for readable, maintainable Java (17+) code in Spring Boot services.

<!--
【说明】何时激活此技能：
- 编写或审查 Spring Boot 项目中的 Java 代码
- 执行命名、不可变性或异常处理约定
- 使用 records、sealed classes 或模式匹配 (Java 17+)
- 审查 Optional、streams 或泛型的使用
- 构建包和项目布局
-->
## When to Activate

- Writing or reviewing Java code in Spring Boot projects
- Enforcing naming, immutability, or exception handling conventions
- Working with records, sealed classes, or pattern matching (Java 17+)
- Reviewing use of Optional, streams, or generics
- Structuring packages and project layout

<!--
【说明】核心原则：
- 清晰胜过巧妙
- 默认不可变；最小化共享可变状态
- 使用有意义的异常快速失败
- 一致的命名和包结构
-->
## Core Principles

- Prefer clarity over cleverness
- Immutable by default; minimize shared mutable state
- Fail fast with meaningful exceptions
- Consistent naming and package structure

<!--
【说明】命名规范：
- 类/Record：帕斯卡命名法 (PascalCase)
- 方法/字段：驼峰命名法 (camelCase)
- 常量：大写下划线命名法 (UPPER_SNAKE_CASE)
-->
## Naming

```java
// ✅ Classes/Records: PascalCase
public class MarketService {}
public record Money(BigDecimal amount, Currency currency) {}

// ✅ Methods/fields: camelCase
private final MarketRepository marketRepository;
public Market findBySlug(String slug) {}

// ✅ Constants: UPPER_SNAKE_CASE
private static final int MAX_PAGE_SIZE = 100;
```

<!--
【说明】不可变性：
偏好 record 和 final 字段，只有 getter，没有 setter。
-->
## Immutability

```java
// ✅ Favor records and final fields
public record MarketDto(Long id, String name, MarketStatus status) {}

public class Market {
  private final Long id;
  private final String name;
  // getters only, no setters
}
```

<!--
【说明】Optional 使用：
- find* 方法返回 Optional
- 使用 map/flatMap 代替 get()
-->
## Optional Usage

```java
// ✅ Return Optional from find* methods
Optional<Market> market = marketRepository.findBySlug(slug);

// ✅ Map/flatMap instead of get()
return market
    .map(MarketResponse::from)
    .orElseThrow(() -> new EntityNotFoundException("Market not found"));
```

<!--
【说明】Streams 最佳实践：
- 使用 streams 进行转换，保持管道简短
- 避免复杂的嵌套 streams；为了清晰更偏好循环
-->
## Streams Best Practices

```java
// ✅ Use streams for transformations, keep pipelines short
List<String> names = markets.stream()
    .map(Market::name)
    .filter(Objects::nonNull)
    .toList();

// ❌ Avoid complex nested streams; prefer loops for clarity
```

<!--
【说明】异常处理：
- 领域错误使用 unchecked 异常；包装技术异常并添加上下文
- 创建领域特定异常（如 MarketNotFoundException）
- 避免宽泛的 catch (Exception ex)，除非重新抛出/集中记录
-->
## Exceptions

- Use unchecked exceptions for domain errors; wrap technical exceptions with context
- Create domain-specific exceptions (e.g., `MarketNotFoundException`)
- Avoid broad `catch (Exception ex)` unless rethrowing/logging centrally

```java
throw new MarketNotFoundException(slug);
```

<!--
【说明】泛型和类型安全：
- 避免原始类型；声明泛型参数
- 可复用工具类偏好有界泛型
-->
## Generics and Type Safety

- Avoid raw types; declare generic parameters
- Prefer bounded generics for reusable utilities

```java
public <T extends Identifiable> Map<Long, T> indexById(Collection<T> items) { ... }
```

<!--
【说明】项目结构 (Maven/Gradle)
-->
## Project Structure (Maven/Gradle)

```
src/main/java/com/example/app/
  config/
  controller/
  service/
  repository/
  domain/
  dto/
  util/
src/main/resources/
  application.yml
src/test/java/... (mirrors main)
```

<!--
【说明】格式和风格：
- 统一使用 2 或 4 空格（项目标准）
- 每个文件一个公共顶级类型
- 保持方法简短专注；提取辅助方法
- 成员顺序：常量、字段、构造函数、公共方法、受保护、私有
-->
## Formatting and Style

- Use 2 or 4 spaces consistently (project standard)
- One public top-level type per file
- Keep methods short and focused; extract helpers
- Order members: constants, fields, constructors, public methods, protected, private

<!--
【说明】要避免的代码异味：
- 长参数列表 → 使用 DTO/builders
- 深层嵌套 → 早返回
- 魔术数字 → 命名常量
- 静态可变状态 → 偏好依赖注入
- 沉默的 catch 块 → 记录并处理或重新抛出
-->
## Code Smells to Avoid

- Long parameter lists → use DTO/builders
- Deep nesting → early returns
- Magic numbers → named constants
- Static mutable state → prefer dependency injection
- Silent catch blocks → log and act or rethrow

<!--
【说明】日志
-->
## Logging

```java
private static final Logger log = LoggerFactory.getLogger(MarketService.class);
log.info("fetch_market slug={}", slug);
log.error("failed_fetch_market slug={}", slug, ex);
```

<!--
【说明】Null 处理：
- 只有在不可避免时才接受 @Nullable；否则使用 @NonNull
- 在输入上使用 Bean Validation (@NotNull, @NotBlank)
-->
## Null Handling

- Accept `@Nullable` only when unavoidable; otherwise use `@NonNull`
- Use Bean Validation (`@NotNull`, `@NotBlank`) on inputs

<!--
【说明】测试期望：
- JUnit 5 + AssertJ 进行流畅断言
- Mockito 进行 mocking；尽可能避免部分 mock
- 偏好确定性测试；不要隐藏 sleep
-->
## Testing Expectations

- JUnit 5 + AssertJ for fluent assertions
- Mockito for mocking; avoid partial mocks where possible
- Favor deterministic tests; no hidden sleeps

**Remember**: Keep code intentional, typed, and observable. Optimize for maintainability over micro-optimizations unless proven necessary.
