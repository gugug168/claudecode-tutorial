<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个技能是做什么的：C++ 测试工作流（GoogleTest/CTest）             ║
║  什么时候用它：编写/修复 C++ 测试、配置 CMake/CTest、诊断失败时     ║
║  核心能力：TDD 循环、gtest/gmock、CTest、覆盖率、sanitizers       ║
╚══════════════════════════════════════════════════════════════════╝
-->

---
name: cpp-testing
description: Use only when writing/updating/fixing C++ tests, configuring GoogleTest/CTest, diagnosing failing or flaky tests, or adding coverage/sanitizers.
---

# C++ Testing (Agent Skill)

<!--
【说明】C++ 测试的核心内容：
- 现代 C++（C++17/20）的代理聚焦测试工作流
- 使用 GoogleTest/GoogleMock 和 CMake/CTest
-->
Agent-focused testing workflow for modern C++ (C++17/20) using GoogleTest/GoogleMock with CMake/CTest.

<!--
【说明】何时使用：
- 编写新 C++ 测试或修复现有测试
- 为 C++ 组件设计单元/集成测试覆盖
- 添加测试覆盖、CI 门控或回归保护
- 配置 CMake/CTest 工作流以保持一致执行
- 调查测试失败或不稳定行为
- 启用 sanitizers 进行内存/竞态诊断
-->
## When to Use

- Writing new C++ tests or fixing existing tests
- Designing unit/integration test coverage for C++ components
- Adding test coverage, CI gating, or regression protection
- Configuring CMake/CTest workflows for consistent execution
- Investigating test failures or flaky behavior
- Enabling sanitizers for memory/race diagnostics

<!--
【说明】何时不使用：
- 实现新产品功能但不涉及测试变更
- 与测试覆盖或失败无关的大规模重构
- 没有测试回归验证的性能调优
- 非 C++ 项目或非测试任务
-->
### When NOT to Use

- Implementing new product features without test changes
- Large-scale refactors unrelated to test coverage or failures
- Performance tuning without test regressions to validate
- Non-C++ projects or non-test tasks

<!--
【说明】核心概念：
- TDD 循环：红 → 绿 → 重构（先写测试，最小修复，然后清理）
- 隔离：优先使用依赖注入和 fake 而非全局状态
- 测试布局：tests/unit、tests/integration、tests/testdata
- Mock vs Fake：mock 用于交互，fake 用于有状态行为
- CTest 发现：使用 gtest_discover_tests() 进行稳定的测试发现
- CI 信号：先运行子集，然后用 --output-on-failure 运行完整套件
-->
## Core Concepts

- **TDD loop**: red → green → refactor (tests first, minimal fix, then cleanups).
- **Isolation**: prefer dependency injection and fakes over global state.
- **Test layout**: `tests/unit`, `tests/integration`, `tests/testdata`.
- **Mocks vs fakes**: mock for interactions, fake for stateful behavior.
- **CTest discovery**: use `gtest_discover_tests()` for stable test discovery.
- **CI signal**: run subset first, then full suite with `--output-on-failure`.

<!--
【说明】TDD 工作流 - 遵循 RED → GREEN → REFACTOR 循环：
1. RED：编写一个捕获新行为的失败测试
2. GREEN：实现最小变更使其通过
3. REFACTOR：在测试保持绿色时清理
-->
## TDD Workflow

Follow the RED → GREEN → REFACTOR loop:

1. **RED**: write a failing test that captures the new behavior
2. **GREEN**: implement the smallest change to pass
3. **REFACTOR**: clean up while tests stay green

```cpp
// tests/add_test.cpp
#include <gtest/gtest.h>

int Add(int a, int b); // Provided by production code.

TEST(AddTest, AddsTwoNumbers) { // RED
  EXPECT_EQ(Add(2, 3), 5);
}

// src/add.cpp
int Add(int a, int b) { // GREEN
  return a + b;
}

// REFACTOR: simplify/rename once tests pass
```

<!--
【说明】代码示例：
- 基本单元测试：简单的 EXPECT_EQ 断言
- 测试夹具：SetUp/TearDown 生命周期
- Mock：MOCK_METHOD 宏定义
-->
## Code Examples

### Basic Unit Test (gtest)

```cpp
// tests/calculator_test.cpp
#include <gtest/gtest.h>

int Add(int a, int b); // Provided by production code.

TEST(CalculatorTest, AddsTwoNumbers) {
    EXPECT_EQ(Add(2, 3), 5);
}
```

### Fixture (gtest)

```cpp
// tests/user_store_test.cpp
// Pseudocode stub: replace UserStore/User with project types.
#include <gtest/gtest.h>
#include <memory>
#include <optional>
#include <string>

struct User { std::string name; };
class UserStore {
public:
    explicit UserStore(std::string /*path*/) {}
    void Seed(std::initializer_list<User> /*users*/) {}
    std::optional<User> Find(const std::string &/*name*/) { return User{"alice"}; }
};

class UserStoreTest : public ::testing::Test {
protected:
    void SetUp() override {
        store = std::make_unique<UserStore>(":memory:");
        store->Seed({{"alice"}, {"bob"}});
    }

    std::unique_ptr<UserStore> store;
};

TEST_F(UserStoreTest, FindsExistingUser) {
    auto user = store->Find("alice");
    ASSERT_TRUE(user.has_value());
    EXPECT_EQ(user->name, "alice");
}
```

### Mock (gmock)

```cpp
// tests/notifier_test.cpp
#include <gmock/gmock.h>
#include <gtest/gtest.h>
#include <string>

class Notifier {
public:
    virtual ~Notifier() = default;
    virtual void Send(const std::string &message) = 0;
};

class MockNotifier : public Notifier {
public:
    MOCK_METHOD(void, Send, (const std::string &message), (override));
};

class Service {
public:
    explicit Service(Notifier &notifier) : notifier_(notifier) {}
    void Publish(const std::string &message) { notifier_.Send(message); }

private:
    Notifier &notifier_;
};

TEST(ServiceTest, SendsNotifications) {
    MockNotifier notifier;
    Service service(notifier);

    EXPECT_CALL(notifier, Send("hello")).Times(1);
    service.Publish("hello");
}
```

<!--
【说明】CMake/CTest 快速入门：
- 使用 FetchContent 获取 GoogleTest
- 使用 gtest_discover_tests() 发现测试
- 构建和运行命令
-->
### CMake/CTest Quickstart

```cmake
# CMakeLists.txt (excerpt)
cmake_minimum_required(VERSION 3.20)
project(example LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include(FetchContent)
# Prefer project-locked versions. If using a tag, use a pinned version per project policy.
set(GTEST_VERSION v1.17.0) # Adjust to project policy.
FetchContent_Declare(
  googletest
  URL https://github.com/google/googletest/archive/refs/tags/${GTEST_VERSION}.zip
)
FetchContent_MakeAvailable(googletest)

add_executable(example_tests
  tests/calculator_test.cpp
  src/calculator.cpp
)
target_link_libraries(example_tests GTest::gtest GTest::gmock GTest::gtest_main)

enable_testing()
include(GoogleTest)
gtest_discover_tests(example_tests)
```

```bash
cmake -S . -B build -DCMAKE_BUILD_TYPE=Debug
cmake --build build -j
ctest --test-dir build --output-on-failure
```

<!--
【说明】运行测试：
- 使用 ctest 运行全部或按名称过滤
- 使用 gtest_filter 运行特定测试
-->
## Running Tests

```bash
ctest --test-dir build --output-on-failure
ctest --test-dir build -R ClampTest
ctest --test-dir build -R "UserStoreTest.*" --output-on-failure
```

```bash
./build/example_tests --gtest_filter=ClampTest.*
./build/example_tests --gtest_filter=UserStoreTest.FindsExistingUser
```

<!--
【说明】调试失败：
1. 使用 gtest filter 重新运行单个失败测试
2. 在失败断言周围添加作用域日志
3. 启用 sanitizers 重新运行
4. 修复根本原因后扩展到完整套件
-->
## Debugging Failures

1. Re-run the single failing test with gtest filter.
2. Add scoped logging around the failing assertion.
3. Re-run with sanitizers enabled.
4. Expand to full suite once the root cause is fixed.

<!--
【说明】覆盖率 - 优先使用目标级设置：
- GCC + gcov + lcov 工作流
- Clang + llvm-cov 工作流
-->
## Coverage

Prefer target-level settings instead of global flags.

```cmake
option(ENABLE_COVERAGE "Enable coverage flags" OFF)

if(ENABLE_COVERAGE)
  if(CMAKE_CXX_COMPILER_ID MATCHES "GNU")
    target_compile_options(example_tests PRIVATE --coverage)
    target_link_options(example_tests PRIVATE --coverage)
  elseif(CMAKE_CXX_COMPILER_ID MATCHES "Clang")
    target_compile_options(example_tests PRIVATE -fprofile-instr-generate -fcoverage-mapping)
    target_link_options(example_tests PRIVATE -fprofile-instr-generate)
  endif()
endif()
```

```bash
cmake -S . -B build-cov -DENABLE_COVERAGE=ON
cmake --build build-cov -j
ctest --test-dir build-cov
lcov --capture --directory build-cov --output-file coverage.info
lcov --remove coverage.info '/usr/*' --output-file coverage.info
genhtml coverage.info --output-directory coverage
```

```bash
cmake -S . -B build-llvm -DENABLE_COVERAGE=ON -DCMAKE_CXX_COMPILER=clang++
cmake --build build-llvm -j
LLVM_PROFILE_FILE="build-llvm/default.profraw" ctest --test-dir build-llvm
llvm-profdata merge -sparse build-llvm/default.profraw -o build-llvm/default.profdata
llvm-cov report build-llvm/example_tests -instr-profile=build-llvm/default.profdata
```

<!--
【说明】Sanitizers - 内存和竞态检测：
- AddressSanitizer (ASAN)：内存错误
- UndefinedBehaviorSanitizer (UBSAN)：未定义行为
- ThreadSanitizer (TSAN)：数据竞争
-->
## Sanitizers

```cmake
option(ENABLE_ASAN "Enable AddressSanitizer" OFF)
option(ENABLE_UBSAN "Enable UndefinedBehaviorSanitizer" OFF)
option(ENABLE_TSAN "Enable ThreadSanitizer" OFF)

if(ENABLE_ASAN)
  add_compile_options(-fsanitize=address -fno-omit-frame-pointer)
  add_link_options(-fsanitize=address)
endif()
if(ENABLE_UBSAN)
  add_compile_options(-fsanitize=undefined -fno-omit-frame-pointer)
  add_link_options(-fsanitize=undefined)
endif()
if(ENABLE_TSAN)
  add_compile_options(-fsanitize=thread)
  add_link_options(-fsanitize=thread)
endif()
```

<!--
【说明】不稳定测试防护：
- 永远不要用 sleep 做同步；使用条件变量或闩锁
- 每个测试使用唯一临时目录并始终清理
- 单元测试中避免真实时间、网络或文件系统依赖
- 随机输入使用确定性种子
-->
## Flaky Tests Guardrails

- Never use `sleep` for synchronization; use condition variables or latches.
- Make temp directories unique per test and always clean them.
- Avoid real time, network, or filesystem dependencies in unit tests.
- Use deterministic seeds for randomized inputs.

<!--
【说明】最佳实践：
- 应该做：保持测试确定性和隔离、优先使用依赖注入、使用 ASSERT_* 和 EXPECT_* 正确
- 不应该做：不要依赖真实时间或网络、不要用 sleep 做同步、不要过度 mock
-->
## Best Practices

### DO

- Keep tests deterministic and isolated
- Prefer dependency injection over globals
- Use `ASSERT_*` for preconditions, `EXPECT_*` for multiple checks
- Separate unit vs integration tests in CTest labels or directories
- Run sanitizers in CI for memory and race detection

### DON'T

- Don't depend on real time or network in unit tests
- Don't use sleeps as synchronization when a condition variable can be used
- Don't over-mock simple value objects
- Don't use brittle string matching for non-critical logs

<!--
【说明】常见陷阱：
- 使用固定临时路径 → 每个测试生成唯一临时目录并清理
- 依赖墙钟时间 → 注入时钟或使用假时间源
- 不稳定并发测试 → 使用条件变量/闩锁和有界等待
- 隐藏全局状态 → 在夹具中重置全局状态或移除全局变量
- 过度 mock → 有状态行为优先用 fake，只 mock 交互
-->
### Common Pitfalls

- **Using fixed temp paths** → Generate unique temp directories per test and clean them.
- **Relying on wall clock time** → Inject a clock or use fake time sources.
- **Flaky concurrency tests** → Use condition variables/latches and bounded waits.
- **Hidden global state** → Reset global state in fixtures or remove globals.
- **Over-mocking** → Prefer fakes for stateful behavior and only mock interactions.
- **Missing sanitizer runs** → Add ASan/UBSan/TSan builds in CI.
- **Coverage on debug-only builds** → Ensure coverage targets use consistent flags.

<!--
【说明】可选附录：模糊测试 / 属性测试 - 仅在项目已支持时使用：
- libFuzzer：最适合最小 I/O 的纯函数
- RapidCheck：基于属性的测试来验证不变量
-->
## Optional Appendix: Fuzzing / Property Testing

Only use if the project already supports LLVM/libFuzzer or a property-testing library.

- **libFuzzer**: best for pure functions with minimal I/O.
- **RapidCheck**: property-based tests to validate invariants.

```cpp
#include <cstddef>
#include <cstdint>
#include <string>

extern "C" int LLVMFuzzerTestOneInput(const uint8_t *data, size_t size) {
    std::string input(reinterpret_cast<const char *>(data), size);
    // ParseConfig(input); // project function
    return 0;
}
```

<!--
【说明】GoogleTest 替代方案：
- Catch2：仅头文件，富有表现力的匹配器
- doctest：轻量级，最小编译开销
-->
## Alternatives to GoogleTest

- **Catch2**: header-only, expressive matchers
- **doctest**: lightweight, minimal compile overhead
