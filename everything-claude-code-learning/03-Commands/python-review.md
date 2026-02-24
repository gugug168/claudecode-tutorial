# Python Review Python 代码审查命令

全面的 Python 代码审查，检查 PEP 8 合规、类型提示、安全和 Pythonic 惯用语。调用 python-reviewer agent。

## 此命令做什么

1. **识别 Python 变更**：通过 `git diff` 查找修改的 `.py` 文件
2. **运行静态分析**：执行 `ruff`、`mypy`、`pylint`、`black --check`
3. **安全扫描**：检查 SQL 注入、命令注入、不安全的反序列化
4. **类型安全审查**：分析类型提示和 mypy 错误
5. **Pythonic 代码检查**：验证代码遵循 PEP 8 和 Python 最佳实践
6. **生成报告**：按严重程度分类问题

## 审查类别

### 关键（必须修复）

- SQL/命令注入漏洞
- 不安全的 eval/exec 使用
- Pickle 不安全反序列化
- 硬编码凭证
- YAML 不安全加载
- 隐藏错误的裸 except 子句

### 高（应该修复）

- 公共函数缺少类型提示
- 可变默认参数
- 静默吞掉异常
- 资源不使用上下文管理器
- C 风格循环而不是推导式
- 使用 type() 而不是 isinstance()
- 没有锁的竞态条件

### 中（考虑修复）

- PEP 8 格式违规
- 公共函数缺少 docstring
- 使用 print 而不是 logging
- 低效的字符串操作
- 没有命名常量的魔法数字
- 不使用 f-strings 格式化
- 不必要的列表创建

## 批准标准

| 状态 | 条件 |
|------|------|
| ✅ 批准 | 没有关键或高优先级问题 |
| ⚠️ 警告 | 只有中优先级问题（谨慎合并） |
| ❌ 阻止 | 发现关键或高优先级问题 |

## 常见修复示例

### 修复可变默认参数

```python
# 之前
def append(value, items=[]):
    items.append(value)
    return items

# 之后
def append(value, items=None):
    if items is None:
        items = []
    items.append(value)
    return items
```

### 使用上下文管理器

```python
# 之前
f = open("file.txt")
data = f.read()
f.close()

# 之后
with open("file.txt") as f:
    data = f.read()
```
