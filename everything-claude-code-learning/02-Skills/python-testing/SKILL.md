<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个技能是做什么的：Python 测试模式                                ║
║  什么时候用它：编写新代码、设计测试套件、审查覆盖率、设置测试设施   ║
║  核心能力：pytest、TDD、fixtures、mocking、参数化、覆盖率、异步测试║
╚══════════════════════════════════════════════════════════════════╝
-->

---
name: python-testing
description: Python testing strategies using pytest, TDD methodology, fixtures, mocking, parametrization, and coverage requirements.
---

# Python Testing Patterns

<!--
【说明】使用 pytest、TDD 方法和最佳实践的 Python 应用全面测试策略。
-->
Comprehensive testing strategies for Python applications using pytest, TDD methodology, and best practices.

<!--
【说明】何时激活此技能：
- 编写新的 Python 代码（遵循 TDD：红、绿、重构）
- 为 Python 项目设计测试套件
- 审查 Python 测试覆盖率
- 设置测试基础设施
-->
## When to Activate

- Writing new Python code (follow TDD: red, green, refactor)
- Designing test suites for Python projects
- Reviewing Python test coverage
- Setting up testing infrastructure

<!--
【说明】核心测试理念
-->
## Core Testing Philosophy

<!--
【说明】测试驱动开发 (TDD)：
1. RED：为期望行为编写失败的测试
2. GREEN：编写最小代码使测试通过
3. REFACTOR：在保持测试绿色的同时改进代码
-->
### Test-Driven Development (TDD)

Always follow the TDD cycle:

1. **RED**: Write a failing test for the desired behavior
2. **GREEN**: Write minimal code to make the test pass
3. **REFACTOR**: Improve code while keeping tests green

```python
# Step 1: Write failing test (RED)
def test_add_numbers():
    result = add(2, 3)
    assert result == 5

# Step 2: Write minimal implementation (GREEN)
def add(a, b):
    return a + b

# Step 3: Refactor if needed (REFACTOR)
```

<!--
【说明】覆盖率要求：
- 目标：80%+ 代码覆盖率
- 关键路径：需要 100% 覆盖率
- 使用 pytest --cov 测量覆盖率
-->
### Coverage Requirements

- **Target**: 80%+ code coverage
- **Critical paths**: 100% coverage required
- Use `pytest --cov` to measure coverage

```bash
pytest --cov=mypackage --cov-report=term-missing --cov-report=html
```

<!--
【说明】pytest 基础：基本测试结构、断言
-->
## pytest Fundamentals

### Basic Test Structure

```python
import pytest

def test_addition():
    """Test basic addition."""
    assert 2 + 2 == 4

def test_string_uppercase():
    """Test string uppercasing."""
    text = "hello"
    assert text.upper() == "HELLO"

def test_list_append():
    """Test list append."""
    items = [1, 2, 3]
    items.append(4)
    assert 4 in items
    assert len(items) == 4
```

<!--
【说明】断言：相等、不等、真值、成员、类型检查、异常测试
-->
### Assertions

```python
# Equality
assert result == expected

# Inequality
assert result != unexpected

# Truthiness
assert result  # Truthy
assert not result  # Falsy
assert result is True  # Exactly True

# Membership
assert item in collection
assert item not in collection

# Type checking
assert isinstance(result, str)

# Exception testing (preferred approach)
with pytest.raises(ValueError):
    raise ValueError("error message")

# Check exception message
with pytest.raises(ValueError, match="invalid input"):
    raise ValueError("invalid input provided")
```

<!--
【说明】Fixtures：基本 Fixture 使用、带设置/清理的 Fixture、Fixture 作用域
-->
## Fixtures

### Basic Fixture Usage

```python
import pytest

@pytest.fixture
def sample_data():
    """Fixture providing sample data."""
    return {"name": "Alice", "age": 30}

def test_sample_data(sample_data):
    """Test using the fixture."""
    assert sample_data["name"] == "Alice"
    assert sample_data["age"] == 30
```

<!--
【说明】带设置/清理的 Fixture：使用 yield 分隔设置和清理
-->
### Fixture with Setup/Teardown

```python
@pytest.fixture
def database():
    """Fixture with setup and teardown."""
    # Setup
    db = Database(":memory:")
    db.create_tables()
    db.insert_test_data()

    yield db  # Provide to test

    # Teardown
    db.close()

def test_database_query(database):
    """Test database operations."""
    result = database.query("SELECT * FROM users")
    assert len(result) > 0
```

<!--
【说明】Fixture 作用域：
- 函数作用域（默认）：每个测试运行一次
- 模块作用域：每个模块运行一次
- 会话作用域：每个测试会话运行一次
-->
### Fixture Scopes

```python
# Function scope (default) - runs for each test
@pytest.fixture
def temp_file():
    with open("temp.txt", "w") as f:
        yield f
    os.remove("temp.txt")

# Module scope - runs once per module
@pytest.fixture(scope="module")
def module_db():
    db = Database(":memory:")
    db.create_tables()
    yield db
    db.close()

# Session scope - runs once per test session
@pytest.fixture(scope="session")
def shared_resource():
    resource = ExpensiveResource()
    yield resource
    resource.cleanup()
```

<!--
【说明】参数化：基本参数化、多参数
-->
## Parametrization

### Basic Parametrization

```python
@pytest.mark.parametrize("input,expected", [
    ("hello", "HELLO"),
    ("world", "WORLD"),
    ("PyThOn", "PYTHON"),
])
def test_uppercase(input, expected):
    """Test runs 3 times with different inputs."""
    assert input.upper() == expected
```

<!--
【说明】多参数
-->
### Multiple Parameters

```python
@pytest.mark.parametrize("a,b,expected", [
    (2, 3, 5),
    (0, 0, 0),
    (-1, 1, 0),
    (100, 200, 300),
])
def test_add(a, b, expected):
    """Test addition with multiple inputs."""
    assert add(a, b) == expected
```

<!--
【说明】Mock 和 Patch：Mock 函数、Mock 异常
-->
## Mocking and Patching

### Mocking Functions

```python
from unittest.mock import patch, Mock

@patch("mypackage.external_api_call")
def test_with_mock(api_call_mock):
    """Test with mocked external API."""
    api_call_mock.return_value = {"status": "success"}

    result = my_function()

    api_call_mock.assert_called_once()
    assert result["status"] == "success"
```

<!--
【说明】Mock 异常：使用 side_effect 模拟异常
-->
### Mocking Exceptions

```python
@patch("mypackage.api_call")
def test_api_error_handling(api_call_mock):
    """Test error handling with mocked exception."""
    api_call_mock.side_effect = ConnectionError("Network error")

    with pytest.raises(ConnectionError):
        api_call()

    api_call_mock.assert_called_once()
```

<!--
【说明】测试异步代码：使用 pytest-asyncio 的异步测试、异步 Fixture
-->
## Testing Async Code

### Async Tests with pytest-asyncio

```python
import pytest

@pytest.mark.asyncio
async def test_async_function():
    """Test async function."""
    result = await async_add(2, 3)
    assert result == 5

@pytest.mark.asyncio
async def test_async_with_fixture(async_client):
    """Test async with async fixture."""
    response = await async_client.get("/api/users")
    assert response.status_code == 200
```

<!--
【说明】异步 Fixture
-->
### Async Fixture

```python
@pytest.fixture
async def async_client():
    """Async fixture providing async test client."""
    app = create_app()
    async with app.test_client() as client:
        yield client

@pytest.mark.asyncio
async def test_api_endpoint(async_client):
    """Test using async fixture."""
    response = await async_client.get("/api/data")
    assert response.status_code == 200
```

<!--
【说明】测试组织：目录结构
-->
## Test Organization

### Directory Structure

```
tests/
├── conftest.py                 # Shared fixtures
├── __init__.py
├── unit/                       # Unit tests
│   ├── __init__.py
│   ├── test_models.py
│   ├── test_utils.py
│   └── test_services.py
├── integration/                # Integration tests
│   ├── __init__.py
│   ├── test_api.py
│   └── test_database.py
└── e2e/                        # End-to-end tests
    ├── __init__.py
    └── test_user_flow.py
```

<!--
【说明】最佳实践
-->
## Best Practices

<!--
【说明】应该做：
- 遵循 TDD：代码前先写测试
- 测试一件事：每个测试应该验证单一行为
- 使用描述性名称
- 使用 fixtures 消除重复
- Mock 外部依赖
- 测试边缘情况
- 目标 80%+ 覆盖率
- 保持测试快速
-->
### DO

- **Follow TDD**: Write tests before code (red-green-refactor)
- **Test one thing**: Each test should verify a single behavior
- **Use descriptive names**: `test_user_login_with_invalid_credentials_fails`
- **Use fixtures**: Eliminate duplication with fixtures
- **Mock external dependencies**: Don't depend on external services
- **Test edge cases**: Empty inputs, None values, boundary conditions
- **Aim for 80%+ coverage**: Focus on critical paths
- **Keep tests fast**: Use marks to separate slow tests

<!--
【说明】不应该做：
- 不要测试实现：测试行为，而非内部
- 不要在测试中使用复杂条件
- 不要忽略测试失败
- 不要测试第三方代码
- 不要在测试间共享状态
- 不要在测试中捕获异常：使用 pytest.raises
-->
### DON'T

- **Don't test implementation**: Test behavior, not internals
- **Don't use complex conditionals in tests**: Keep tests simple
- **Don't ignore test failures**: All tests must pass
- **Don't test third-party code**: Trust libraries to work
- **Don't share state between tests**: Tests should be independent
- **Don't catch exceptions in tests**: Use `pytest.raises`

<!--
【说明】pytest 配置：pytest.ini
-->
## pytest Configuration

### pytest.ini

```ini
[pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts =
    --strict-markers
    --disable-warnings
    --cov=mypackage
    --cov-report=term-missing
    --cov-report=html
markers =
    slow: marks tests as slow
    integration: marks tests as integration tests
    unit: marks tests as unit tests
```

<!--
【说明】运行测试的常用命令
-->
## Running Tests

```bash
# Run all tests
pytest

# Run specific file
pytest tests/test_utils.py

# Run specific test
pytest tests/test_utils.py::test_function

# Run with verbose output
pytest -v

# Run with coverage
pytest --cov=mypackage --cov-report=html

# Run only fast tests
pytest -m "not slow"

# Run until first failure
pytest -x

# Run last failed tests
pytest --lf

# Run tests with pattern
pytest -k "test_user"

# Run with debugger on failure
pytest --pdb
```

<!--
【说明】快速参考表：
- pytest.raises()：测试预期异常
- @pytest.fixture()：创建可复用测试 fixtures
- @pytest.mark.parametrize()：用多个输入运行测试
- @pytest.mark.slow：标记慢测试
- pytest -m "not slow"：跳过慢测试
- @patch()：Mock 函数和类
- tmp_path fixture：自动临时目录
- pytest --cov：生成覆盖率报告
-->
## Quick Reference

| Pattern | Usage |
|---------|-------|
| `pytest.raises()` | Test expected exceptions |
| `@pytest.fixture()` | Create reusable test fixtures |
| `@pytest.mark.parametrize()` | Run tests with multiple inputs |
| `@pytest.mark.slow` | Mark slow tests |
| `pytest -m "not slow"` | Skip slow tests |
| `@patch()` | Mock functions and classes |
| `tmp_path` fixture | Automatic temp directory |
| `pytest --cov` | Generate coverage report |

<!--
【说明】记住：测试也是代码。保持它们干净、可读和可维护。好的测试捕获 bug；优秀的测试预防 bug。
-->
**Remember**: Tests are code too. Keep them clean, readable, and maintainable. Good tests catch bugs; great tests prevent them.
