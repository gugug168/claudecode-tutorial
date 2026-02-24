# Test Coverage 测试覆盖率命令

分析测试覆盖率，识别差距，并生成缺失的测试以达到 80%+ 覆盖率。

## 步骤 1：检测测试框架

根据项目指示器选择覆盖率命令：

| 指示器 | 覆盖率命令 |
|--------|-----------|
| `jest.config.*` 或 `package.json` jest | `npx jest --coverage --coverageReporters=json-summary` |
| `vitest.config.*` | `npx vitest run --coverage` |
| `pytest.ini` / `pyproject.toml` pytest | `pytest --cov=src --cov-report=json` |
| `Cargo.toml` | `cargo llvm-cov --json` |
| `pom.xml` with JaCoCo | `mvn test jacoco:report` |
| `go.mod` | `go test -coverprofile=coverage.out ./...` |

## 步骤 2：分析覆盖率报告

1. 运行覆盖率命令
2. 解析输出（JSON 摘要或终端输出）
3. 列出**低于 80% 覆盖率**的文件，从最差开始排序
4. 对于每个覆盖率不足的文件，识别：
   - 未测试的函数或方法
   - 缺少的分支覆盖（if/else、switch、错误路径）
   - 增大分母的死代码

## 步骤 3：生成缺失测试

对于每个覆盖率不足的文件，按以下优先级生成测试：

1. **正常路径** — 使用有效输入的核心功能
2. **错误处理** — 无效输入、缺失数据、网络失败
3. **边缘情况** — 空数组、null/undefined、边界值
4. **分支覆盖** — 每个 if/else、switch case、三元表达式

## 重点区域

- 具有复杂分支的函数（高圈复杂度）
- 错误处理器和 catch 块
- 代码库中使用的工具函数
- API 端点处理器（请求 → 响应流程）
- 边缘情况：null、undefined、空字符串、空数组、零、负数
