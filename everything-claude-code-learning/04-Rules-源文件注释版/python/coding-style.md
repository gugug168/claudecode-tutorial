<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个规则是做什么的：Python 语言特定的编码风格规范                   ║
║  什么时候用它：编写 Python 代码时参考                               ║
║  核心能力：PEP 8、类型注解、不可变性、格式化工具                     ║
║  适用范围：Python 语言项目                                         ║
╚══════════════════════════════════════════════════════════════════╝
-->

---
# 【元数据说明】paths: 指定此规则适用于哪些 Python 文件路径
paths:
  - "**/*.py"
  - "**/*.pyi"
---

# Python Coding Style

> This file extends [common/coding-style.md](../common/coding-style.md) with Python specific content.

<!--
【说明】标准：遵循 PEP 8 约定，在所有函数签名上使用类型注解
-->
## Standards

- Follow **PEP 8** conventions
- Use **type annotations** on all function signatures

<!--
【说明】不可变性：优先使用不可变数据结构
- 使用 frozen=True 的 dataclass
- 使用 NamedTuple（默认不可变）
-->
## Immutability

Prefer immutable data structures:

```python
from dataclasses import dataclass

@dataclass(frozen=True)
class User:
    name: str
    email: str

from typing import NamedTuple

class Point(NamedTuple):
    x: float
    y: float
```

<!--
【说明】格式化：
- black 用于代码格式化
- isort 用于导入排序
- ruff 用于代码检查
-->
## Formatting

- **black** for code formatting
- **isort** for import sorting
- **ruff** for linting

<!--
【说明】参考：参见技能 python-patterns 获取全面的 Python 惯用法和模式
-->
## Reference

See skill: `python-patterns` for comprehensive Python idioms and patterns.
