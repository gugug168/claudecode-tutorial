<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个命令是做什么的：全面的 Python 代码审查，检查 PEP 8、类型提示等  ║
║  什么时候用它：编写或修改 Python 代码后、提交前、审查 PR 时         ║
║  核心能力：静态分析、安全扫描、类型安全审查、Pythonic 代码检查       ║
║  触发方式：/python-review                                          ║
║  关联 Agent：python-reviewer                                       ║
╚══════════════════════════════════════════════════════════════════╝
-->

---
description: Comprehensive Python code review for PEP 8 compliance, type hints, security, and Pythonic idioms. Invokes the python-reviewer agent.
---

# Python Code Review

<!--
【说明】此命令调用 **python-reviewer** agent 进行全面的 Python 特定代码审查。
-->
This command invokes the **python-reviewer** agent for comprehensive Python-specific code review.

<!--
【说明】此命令做什么：
1. 识别 Python 变更：通过 git diff 查找修改的 .py 文件
2. 运行静态分析：执行 ruff、mypy、pylint、black --check
3. 安全扫描：检查 SQL 注入、命令注入、不安全的反序列化
4. 类型安全审查：分析类型提示和 mypy 错误
5. Pythonic 代码检查：验证代码遵循 PEP 8 和 Python 最佳实践
6. 生成报告：按严重程度分类问题
-->
## What This Command Does

1. **Identify Python Changes**: Find modified `.py` files via `git diff`
2. **Run Static Analysis**: Execute `ruff`, `mypy`, `pylint`, `black --check`
3. **Security Scan**: Check for SQL injection, command injection, unsafe deserialization
4. **Type Safety Review**: Analyze type hints and mypy errors
5. **Pythonic Code Check**: Verify code follows PEP 8 and Python best practices
6. **Generate Report**: Categorize issues by severity

<!--
【说明】审查类别：
关键（必须修复）：SQL/命令注入、不安全的 eval/exec、Pickle 不安全反序列化、硬编码凭证、YAML 不安全加载、隐藏错误的裸 except 子句
高（应该修复）：公共函数缺少类型提示、可变默认参数、静默吞掉异常、资源不使用上下文管理器、C 风格循环而不是推导式、使用 type() 而不是 isinstance()、没有锁的竞态条件
中（考虑修复）：PEP 8 格式违规、公共函数缺少 docstring、使用 print 而不是 logging、低效的字符串操作、没有命名常量的魔法数字、不使用 f-strings 格式化、不必要的列表创建
-->
## Review Categories

### CRITICAL (Must Fix)
- SQL/Command injection vulnerabilities
- Unsafe eval/exec usage
- Pickle unsafe deserialization
- Hardcoded credentials
- YAML unsafe load
- Bare except clauses hiding errors

### HIGH (Should Fix)
- Missing type hints on public functions
- Mutable default arguments
- Swallowing exceptions silently
- Not using context managers for resources
- C-style looping instead of comprehensions
- Using type() instead of isinstance()
- Race conditions without locks

### MEDIUM (Consider)
- PEP 8 formatting violations
- Missing docstrings on public functions
- Print statements instead of logging
- Inefficient string operations
- Magic numbers without named constants
- Not using f-strings for formatting
- Unnecessary list creation

<!--
【说明】批准标准：
| 状态 | 条件 |
| ✅ 批准 | 没有关键或高优先级问题 |
| ⚠️ 警告 | 只有中优先级问题（谨慎合并） |
| ❌ 阻止 | 发现关键或高优先级问题 |
-->
## Approval Criteria

| Status | Condition |
|--------|-----------|
| ✅ Approve | No CRITICAL or HIGH issues |
| ⚠️ Warning | Only MEDIUM issues (merge with caution) |
| ❌ Block | CRITICAL or HIGH issues found |

<!--
【说明】常见修复示例：修复可变默认参数（使用 None 替代空列表）、使用上下文管理器（with 语句）
-->
## Common Fixes

### Fix Mutable Defaults
```python
# Before
def append(value, items=[]):
    items.append(value)
    return items

# After
def append(value, items=None):
    if items is None:
        items = []
    items.append(value)
    return items
```

### Use Context Managers
```python
# Before
f = open("file.txt")
data = f.read()
f.close()

# After
with open("file.txt") as f:
    data = f.read()
```
