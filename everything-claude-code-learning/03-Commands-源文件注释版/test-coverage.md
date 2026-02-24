<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个命令是做什么的：分析测试覆盖率，识别差距，生成缺失测试           ║
║  什么时候用它：需要确保 80%+ 测试覆盖率时                           ║
║  核心能力：检测测试框架、分析覆盖率报告、生成缺失测试                ║
║  触发方式：/test-coverage                                          ║
╚══════════════════════════════════════════════════════════════════╝
-->

# Test Coverage

<!--
【说明】分析测试覆盖率，识别差距，并生成缺失的测试以达到 80%+ 覆盖率。
-->
Analyze test coverage, identify gaps, and generate missing tests to reach 80%+ coverage.

<!--
【说明】步骤1：检测测试框架。根据项目指示器选择覆盖率命令：
| 指示器 | 覆盖率命令 |
| jest.config.* 或 package.json jest | npx jest --coverage |
| vitest.config.* | npx vitest run --coverage |
| pytest.ini / pyproject.toml pytest | pytest --cov=src --cov-report=json |
| Cargo.toml | cargo llvm-cov --json |
| pom.xml with JaCoCo | mvn test jacoco:report |
| go.mod | go test -coverprofile=coverage.out ./... |
-->
## Step 1: Detect Test Framework

| Indicator | Coverage Command |
|-----------|-----------------|
| `jest.config.*` or `package.json` jest | `npx jest --coverage --coverageReporters=json-summary` |
| `vitest.config.*` | `npx vitest run --coverage` |
| `pytest.ini` / `pyproject.toml` pytest | `pytest --cov=src --cov-report=json` |
| `Cargo.toml` | `cargo llvm-cov --json` |
| `pom.xml` with JaCoCo | `mvn test jacoco:report` |
| `go.mod` | `go test -coverprofile=coverage.out ./...` |

<!--
【说明】步骤2：分析覆盖率报告：
1. 运行覆盖率命令
2. 解析输出（JSON 摘要或终端输出）
3. 列出低于 80% 覆盖率的文件，从最差开始排序
4. 对于每个覆盖率不足的文件，识别：未测试的函数或方法、缺少的分支覆盖（if/else、switch、错误路径）、增大分母的死代码
-->
## Step 2: Analyze Coverage Report

1. Run the coverage command
2. Parse the output (JSON summary or terminal output)
3. List files **below 80% coverage**, sorted worst-first
4. For each under-covered file, identify:
   - Untested functions or methods
   - Missing branch coverage (if/else, switch, error paths)
   - Dead code that inflates the denominator

<!--
【说明】步骤3：生成缺失测试。对于每个覆盖率不足的文件，按以下优先级生成测试：
1. 正常路径 — 使用有效输入的核心功能
2. 错误处理 — 无效输入、缺失数据、网络失败
3. 边缘情况 — 空数组、null/undefined、边界值
4. 分支覆盖 — 每个 if/else、switch case、三元表达式
-->
## Step 3: Generate Missing Tests

For each under-covered file, generate tests following this priority:

1. **Happy path** — Core functionality with valid inputs
2. **Error handling** — Invalid inputs, missing data, network failures
3. **Edge cases** — Empty arrays, null/undefined, boundary values
4. **Branch coverage** — Each if/else, switch case, ternary

<!--
【说明】重点区域：
- 具有复杂分支的函数（高圈复杂度）
- 错误处理器和 catch 块
- 代码库中使用的工具函数
- API 端点处理器（请求 → 响应流程）
- 边缘情况：null、undefined、空字符串、空数组、零、负数
-->
## Focus Areas

- Functions with complex branching (high cyclomatic complexity)
- Error handlers and catch blocks
- Utility functions used across the codebase
- API endpoint handlers (request → response flow)
- Edge cases: null, undefined, empty string, empty array, zero, negative numbers
