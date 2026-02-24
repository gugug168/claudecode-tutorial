---
name: java-coding-standards
description: "Spring Boot 服务的 Java 编码标准：命名、不可变性、Optional 使用、streams、异常、泛型和项目布局。"
---

# Java 编码标准

Spring Boot 服务中可读、可维护的 Java (17+) 代码标准。

## 何时激活此技能

- 编写或审查 Spring Boot 项目中的 Java 代码
- 执行命名、不可变性或异常处理约定
- 使用 records、sealed classes 或模式匹配 (Java 17+)
- 审查 Optional、streams 或泛型的使用
- 构建包和项目布局

## 核心原则

- 清晰胜过巧妙
- 默认不可变；最小化共享可变状态
- 使用有意义的异常快速失败
- 一致的命名和包结构

## 命名规范

```java
// ✅ 类/Record：帕斯卡命名法 (PascalCase)
public class MarketService {}
public record Money(BigDecimal amount, Currency currency) {}

// ✅ 方法/字段：驼峰命名法 (camelCase)
private final MarketRepository marketRepository;
public Market findBySlug(String slug) {}

// ✅ 常量：大写下划线命名法 (UPPER_SNAKE_CASE)
private static final int MAX_PAGE_SIZE = 100;
```

## 不可变性

偏好 record 和 final 字段，只有 getter，没有 setter。

```java
// ✅ 偏好 records 和 final 字段
public record MarketDto(Long id, String name, MarketStatus status) {}

public class Market {
  private final Long id;
  private final String name;
  // 只有 getter，没有 setter
}
```

## Optional 使用

```java
// ✅ find* 方法返回 Optional
Optional<Market> market = marketRepository.findBySlug(slug);

// ✅ 使用 map/flatMap 代替 get()
return market
    .map(MarketResponse::from)
    .orElseThrow(() -> new EntityNotFoundException("Market not found"));
```

## Streams 最佳实践

```java
// ✅ 使用 streams 进行转换，保持管道简短
List<String> names = markets.stream()
    .map(Market::name)
    .filter(Objects::nonNull)
    .toList();

// ❌ 避免复杂的嵌套 streams；为了清晰更偏好循环
```

## 异常处理

- 领域错误使用 unchecked 异常；包装技术异常并添加上下文
- 创建领域特定异常（如 `MarketNotFoundException`）
- 避免宽泛的 `catch (Exception ex)`，除非重新抛出/集中记录

```java
throw new MarketNotFoundException(slug);
```

## 泛型和类型安全

- 避免原始类型；声明泛型参数
- 可复用工具类偏好有界泛型

```java
public <T extends Identifiable> Map<Long, T> indexById(Collection<T> items) { ... }
```

## 项目结构 (Maven/Gradle)

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
src/test/java/... (镜像 main 结构)
```

## 格式和风格

- 统一使用 2 或 4 空格（项目标准）
- 每个文件一个公共顶级类型
- 保持方法简短专注；提取辅助方法
- 成员顺序：常量、字段、构造函数、公共方法、受保护、私有

## 要避免的代码异味

- 长参数列表 → 使用 DTO/builders
- 深层嵌套 → 早返回
- 魔术数字 → 命名常量
- 静态可变状态 → 偏好依赖注入
- 沉默的 catch 块 → 记录并处理或重新抛出

## 日志

```java
private static final Logger log = LoggerFactory.getLogger(MarketService.class);
log.info("fetch_market slug={}", slug);
log.error("failed_fetch_market slug={}", slug, ex);
```

## Null 处理

- 只有在不可避免时才接受 `@Nullable`；否则使用 `@NonNull`
- 在输入上使用 Bean Validation (`@NotNull`, `@NotBlank`)

## 测试期望

- JUnit 5 + AssertJ 进行流畅断言
- Mockito 进行 mocking；尽可能避免部分 mock
- 偏好确定性测试；不要隐藏 sleep

**记住**：保持代码有意向性、类型化和可观察。优化可维护性而非微优化，除非被证明有必要。
