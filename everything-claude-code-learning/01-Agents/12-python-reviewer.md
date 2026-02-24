# Python-Reviewer（Python代码审查代理）

## 一句话总结
Python-Reviewer 是一个Python代码审查专家，它专门检查PEP 8规范、Pythonic写法、类型注解、安全性和性能问题，确保代码符合Python最佳实践。

---

## 它是什么？（小白视角）

### 用一个比喻来理解

想象你在用英语写文章：

- **通用 Code-Reviewer**：检查基本语法、逻辑问题
- **Python-Reviewer**：专门检查你的英语是否地道、是否符合英语写作规范

**Python-Reviewer 就是那位"地道表达专家"**，它确保你的Python代码写得Pythonic，而不是"用Python语法写的Java"。

### 什么是Pythonic？

Pythonic = 符合Python风格和习惯的写法

| 不Pythonic | Pythonic |
|------------|----------|
| `for i in range(len(lst))` | `for item in lst` |
| `if type(x) == int` | `if isinstance(x, int)` |
| `result = []` + 循环append | 列表推导式 |

---

## 工作原理

```
Python代码变更 ──→ Python-Reviewer ──→ git diff -- '*.py'
    │                                   │
    │                                   ↓
    │                              静态分析工具 (ruff, mypy, pylint)
    │                                   │
    │                                   ↓
    │                              聚焦修改的.py文件
    │                                   │
    │                                   ↓
    └─────────────────←───────────── 开始审查
```

---

## 配置详解

```yaml
---
name: python-reviewer                                # 代理名称
description: Expert Python code reviewer...          # 描述
tools: ["Read", "Grep", "Glob", "Bash"]             # 只读工具
model: sonnet                                        # 使用Sonnet模型
---
```

---

## 审查优先级

### 🔴 CRITICAL — 安全

| 问题 | 说明 |
|------|------|
| **SQL注入** | f-string在查询中 — 使用参数化查询 |
| **命令注入** | shell命令中未验证输入 — 使用subprocess列表参数 |
| **路径遍历** | 用户控制路径 — 用normpath验证，拒绝 `..` |
| **eval/exec滥用** | 不安全的动态代码执行 |
| **不安全反序列化** | pickle不信任数据 |
| **硬编码密钥** | 源码中的API密钥、密码 |
| **弱加密** | MD5/SHA1用于安全目的 |
| **YAML不安全加载** | yaml.load() 而非 yaml.safe_load() |

### 🔴 CRITICAL — 错误处理

| 问题 | 说明 |
|------|------|
| **裸except** | `except: pass` — 应捕获特定异常 |
| **吞掉异常** | 静默失败 — 应记录和处理 |
| **缺少上下文管理器** | 手动文件/资源管理 — 应使用 `with` |

### 🟠 HIGH — 类型注解

| 问题 | 说明 |
|------|------|
| 公共函数无类型注解 | 所有公共函数应有类型提示 |
| 使用 `Any` | 当可以用具体类型时 |
| 缺少 `Optional` | 可空参数缺少Optional标注 |

### 🟠 HIGH — Pythonic模式

| 问题 | 说明 |
|------|------|
| C风格循环 | 应使用列表推导式 |
| `type() ==` | 应使用 `isinstance()` |
| 魔法数字 | 应使用 `Enum` |
| 循环中字符串拼接 | 应使用 `"".join()` |
| **可变默认参数** | `def f(x=[])` — 应使用 `def f(x=None)` |

### 🟠 HIGH — 代码质量

| 问题 | 说明 |
|------|------|
| 函数超过50行 | 应拆分 |
| 参数超过5个 | 应使用dataclass |
| 嵌套超过4层 | 应扁平化 |
| 重复代码 | 应提取公共逻辑 |
| 魔法数字 | 应使用命名常量 |

### 🟠 HIGH — 并发

| 问题 | 说明 |
|------|------|
| 共享状态无锁 | 应使用 `threading.Lock` |
| 混用同步/异步 | async函数中调用同步阻塞 |
| N+1查询 | 循环中数据库查询 |

### 🟡 MEDIUM — 最佳实践

| 问题 | 说明 |
|------|------|
| PEP 8 | 导入顺序、命名、空格 |
| 公共函数缺少docstring | 应添加文档字符串 |
| 使用 `print()` | 应使用 `logging` |
| `from module import *` | 命名空间污染 |
| `value == None` | 应使用 `value is None` |
| 遮蔽内置函数 | `list`, `dict`, `str` 作为变量名 |

---

## 常见错误示例

### SQL注入

```python
# ❌ 错误: f-string SQL注入
cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")

# ✅ 正确: 参数化查询
cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
```

### 裸except

```python
# ❌ 错误: 裸except吞掉所有异常
try:
    do_something()
except:
    pass

# ✅ 正确: 捕获特定异常
try:
    do_something()
except ValueError as e:
    logger.error(f"Value error: {e}")
```

### 可变默认参数

```python
# ❌ 错误: 可变默认参数（危险！）
def add_item(item, items=[]):
    items.append(item)
    return items

# 每次调用都会累积！
add_item(1)  # [1]
add_item(2)  # [1, 2]  ← 不是预期的 [2]！

# ✅ 正确: 使用None
def add_item(item, items=None):
    if items is None:
        items = []
    items.append(item)
    return items
```

### Pythonic模式

```python
# ❌ 不Pythonic
result = []
for item in items:
    if item.active:
        result.append(item.name)

# ✅ Pythonic: 列表推导式
result = [item.name for item in items if item.active]
```

### 类型检查

```python
# ❌ 错误
if type(x) == int:
    ...

# ✅ 正确
if isinstance(x, int):
    ...
```

### None比较

```python
# ❌ 错误
if value == None:
    ...

# ✅ 正确
if value is None:
    ...
```

### 上下文管理器

```python
# ❌ 错误: 手动管理
f = open('file.txt')
content = f.read()
f.close()  # 如果read抛异常，不会关闭

# ✅ 正确: 上下文管理器
with open('file.txt') as f:
    content = f.read()
# 自动关闭，即使有异常
```

### 字符串拼接

```python
# ❌ 错误: 循环中拼接
result = ""
for item in items:
    result += item  # 每次都创建新字符串

# ✅ 正确: join
result = "".join(items)
```

---

## 诊断命令

```bash
# 类型检查
mypy .

# 快速lint
ruff check .

# 格式检查
black --check .

# 安全扫描
bandit -r .

# 测试覆盖率
pytest --cov=app --cov-report=term-missing
```

---

## 审查输出格式

```text
[严重性] 问题标题
文件: path/to/file.py:42
问题: 描述
修复: 如何修改
```

---

## 审批标准

| 结论 | 条件 |
|------|------|
| **通过** | 无CRITICAL或HIGH问题 |
| **警告** | 只有MEDIUM问题（可谨慎合并） |
| **阻止** | 发现CRITICAL或HIGH问题 |

---

## 框架检查

### Django

- 使用 `select_related`/`prefetch_related` 避免N+1
- 多步操作使用 `atomic()`
- 检查迁移文件

### FastAPI

- CORS配置
- Pydantic验证
- 响应模型
- async中不阻塞

### Flask

- 正确的错误处理器
- CSRF保护

---

## 使用方法

### 通过命令调用
```bash
/python-review
```

### 或者描述需求
```
帮我审查这段Python代码
```

---

## 工作流配合

```
[写Python代码...]
/python-review         ← python-reviewer审查代码
pytest                 ← 运行测试
```

---

## 注意事项

1. **Pythonic优先** - 写地道的Python代码
2. **类型注解** - 公共函数都应有类型提示
3. **不信任输入** - 验证和消毒一切外部输入
4. **用with** - 资源管理使用上下文管理器
5. **具体异常** - 不用裸except

---

## 相关代理

- **code-reviewer** - 通用代码审查
- **security-reviewer** - 安全审查
- **database-reviewer** - 数据库相关检查

## 相关技能

- `skill: python-patterns` - 详细Python模式、安全示例
