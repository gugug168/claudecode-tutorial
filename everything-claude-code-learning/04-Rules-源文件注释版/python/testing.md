<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个规则是做什么的：Python 语言特定的测试规范                       ║
║  什么时候用它：编写 Python 测试、运行测试时参考                       ║
║  核心能力：pytest 框架、覆盖率检查、测试分类                        ║
║  适用范围：Python 语言项目                                         ║
╚══════════════════════════════════════════════════════════════════╝
-->

---
# 【元数据说明】paths: 指定此规则适用于哪些 Python 文件路径
paths:
  - "**/*.py"
  - "**/*.pyi"
---

# Python Testing

> This file extends [common/testing.md](../common/testing.md) with Python specific content.

<!--
【说明】框架：使用 pytest 作为测试框架
-->
## Framework

Use **pytest** as the testing framework.

<!--
【说明】覆盖率：运行测试并生成覆盖率报告，显示缺失的行
-->
## Coverage

```bash
pytest --cov=src --cov-report=term-missing
```

<!--
【说明】测试组织：使用 pytest.mark 进行测试分类
- @pytest.mark.unit 标记为单元测试
- @pytest.mark.integration 标记为集成测试
-->
## Test Organization

Use `pytest.mark` for test categorization:

```python
import pytest

@pytest.mark.unit
def test_calculate_total():
    ...

@pytest.mark.integration
def test_database_connection():
    ...
```

<!--
【说明】参考：参见技能 python-testing 获取详细的 pytest 模式和 fixtures
-->
## Reference

See skill: `python-testing` for detailed pytest patterns and fixtures.
