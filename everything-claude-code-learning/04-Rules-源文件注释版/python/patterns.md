<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个规则是做什么的：Python 语言特定的设计模式                       ║
║  什么时候用它：编写 Python 代码、架构设计时参考                       ║
║  核心能力：Protocol、Dataclass、上下文管理器、生成器                ║
║  适用范围：Python 语言项目                                         ║
╚══════════════════════════════════════════════════════════════════╝
-->

---
# 【元数据说明】paths: 指定此规则适用于哪些 Python 文件路径
paths:
  - "**/*.py"
  - "**/*.pyi"
---

# Python Patterns

> This file extends [common/patterns.md](../common/patterns.md) with Python specific content.

<!--
【说明】Protocol（鸭子类型）：Protocol 定义接口规范，任何实现这些方法的类都兼容
-->
## Protocol (Duck Typing)

```python
from typing import Protocol

class Repository(Protocol):
    def find_by_id(self, id: str) -> dict | None: ...
    def save(self, entity: dict) -> dict: ...
```

<!--
【说明】Dataclass 作为 DTO：使用 dataclass 创建数据传输对象，可选字段带默认值
-->
## Dataclasses as DTOs

```python
from dataclasses import dataclass

@dataclass
class CreateUserRequest:
    name: str
    email: str
    age: int | None = None
```

<!--
【说明】上下文管理器和生成器：
- 使用上下文管理器（with 语句）进行资源管理
- 使用生成器进行惰性求值和内存高效迭代
-->
## Context Managers & Generators

- Use context managers (`with` statement) for resource management
- Use generators for lazy evaluation and memory-efficient iteration

<!--
【说明】参考：参见技能 python-patterns 获取全面的模式
-->
## Reference

See skill: `python-patterns` for comprehensive patterns including decorators, concurrency, and package organization.
