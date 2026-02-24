<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个技能是做什么的：Spring Boot 测试驱动开发工作流                  ║
║  什么时候用它：添加功能、修复bug、重构时                            ║
║  核心能力：JUnit 5、Mockito、MockMvc、Testcontainers、JaCoCo      ║
╚══════════════════════════════════════════════════════════════════╝
-->

---
name: springboot-tdd
description: Test-driven development for Spring Boot using JUnit 5, Mockito, MockMvc, Testcontainers, and JaCoCo. Use when adding features, fixing bugs, or refactoring.
---

# Spring Boot TDD Workflow

<!--
【说明】Spring Boot 服务的 TDD 指导，目标覆盖率 80%+（单元 + 集成）。
-->
TDD guidance for Spring Boot services with 80%+ coverage (unit + integration).

<!--
【说明】何时使用：
- 新功能或端点
- Bug 修复或重构
- 添加数据访问逻辑或安全规则
-->
## When to Use

- New features or endpoints
- Bug fixes or refactors
- Adding data access logic or security rules

<!--
【说明】工作流：
1. 先写测试（应该失败）
2. 实现最小代码使其通过
3. 在测试通过时重构
4. 强制覆盖率（JaCoCo）
-->
## Workflow

1) Write tests first (they should fail)
2) Implement minimal code to pass
3) Refactor with tests green
4) Enforce coverage (JaCoCo)

<!--
【说明】单元测试（JUnit 5 + Mockito）：
- 准备-执行-断言模式
- 避免部分 mock；优先显式 stub
- 对变体使用 `@ParameterizedTest`
-->
## Unit Tests (JUnit 5 + Mockito)

```java
@ExtendWith(MockitoExtension.class)
class MarketServiceTest {
  @Mock MarketRepository repo;
  @InjectMocks MarketService service;

  @Test
  void createsMarket() {
    CreateMarketRequest req = new CreateMarketRequest("name", "desc", Instant.now(), List.of("cat"));
    when(repo.save(any())).thenAnswer(inv -> inv.getArgument(0));

    Market result = service.create(req);

    assertThat(result.name()).isEqualTo("name");
    verify(repo).save(any());
  }
}
```

Patterns:
- Arrange-Act-Assert
- Avoid partial mocks; prefer explicit stubbing
- Use `@ParameterizedTest` for variants

<!--
【说明】Web 层测试（MockMvc）
-->
## Web Layer Tests (MockMvc)

```java
@WebMvcTest(MarketController.class)
class MarketControllerTest {
  @Autowired MockMvc mockMvc;
  @MockBean MarketService marketService;

  @Test
  void returnsMarkets() throws Exception {
    when(marketService.list(any())).thenReturn(Page.empty());

    mockMvc.perform(get("/api/markets"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.content").isArray());
  }
}
```

<!--
【说明】集成测试（SpringBootTest）
-->
## Integration Tests (SpringBootTest)

```java
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class MarketIntegrationTest {
  @Autowired MockMvc mockMvc;

  @Test
  void createsMarket() throws Exception {
    mockMvc.perform(post("/api/markets")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
          {"name":"Test","description":"Desc","endDate":"2030-01-01T00:00:00Z","categories":["general"]}
        """))
      .andExpect(status().isCreated());
  }
}
```

<!--
【说明】持久化测试（DataJpaTest）
-->
## Persistence Tests (DataJpaTest)

```java
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(TestContainersConfig.class)
class MarketRepositoryTest {
  @Autowired MarketRepository repo;

  @Test
  void savesAndFinds() {
    MarketEntity entity = new MarketEntity();
    entity.setName("Test");
    repo.save(entity);

    Optional<MarketEntity> found = repo.findByName("Test");
    assertThat(found).isPresent();
  }
}
```

<!--
【说明】Testcontainers：
- 使用可重用容器运行 Postgres/Redis 以镜像生产环境
- 通过 `@DynamicPropertySource` 将 JDBC URL 注入 Spring 上下文
-->
## Testcontainers

- Use reusable containers for Postgres/Redis to mirror production
- Wire via `@DynamicPropertySource` to inject JDBC URLs into Spring context

<!--
【说明】覆盖率（JaCoCo）：Maven 配置片段
-->
## Coverage (JaCoCo)

Maven snippet:
```xml
<plugin>
  <groupId>org.jacoco</groupId>
  <artifactId>jacoco-maven-plugin</artifactId>
  <version>0.8.14</version>
  <executions>
    <execution>
      <goals><goal>prepare-agent</goal></goals>
    </execution>
    <execution>
      <id>report</id>
      <phase>verify</phase>
      <goals><goal>report</goal></goals>
    </execution>
  </executions>
</plugin>
```

<!--
【说明】断言：
- 优先使用 AssertJ（`assertThat`）以提高可读性
- 对于 JSON 响应，使用 `jsonPath`
- 对于异常：`assertThatThrownBy(...)`
-->
## Assertions

- Prefer AssertJ (`assertThat`) for readability
- For JSON responses, use `jsonPath`
- For exceptions: `assertThatThrownBy(...)`

<!--
【说明】测试数据构建器
-->
## Test Data Builders

```java
class MarketBuilder {
  private String name = "Test";
  MarketBuilder withName(String name) { this.name = name; return this; }
  Market build() { return new Market(null, name, MarketStatus.ACTIVE); }
}
```

<!--
【说明】CI 命令
-->
## CI Commands

- Maven: `mvn -T 4 test` or `mvn verify`
- Gradle: `./gradlew test jacocoTestReport`

<!--
【说明】记住：保持测试快速、隔离和确定性。测试行为，而非实现细节。
-->
**Remember**: Keep tests fast, isolated, and deterministic. Test behavior, not implementation details.
