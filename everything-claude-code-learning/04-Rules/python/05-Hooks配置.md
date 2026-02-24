# Python Hooks 配置

> 本文件在 [common/hooks.md](../common/hooks.md) 基础上，增加了 Python 特定的内容。

---

## 📋 规则说明

| 项目 | 内容 |
|------|------|
| **用途** | Python 语言特定的 Hooks 配置 |
| **使用时机** | 配置 Python 项目的自动化检查时参考 |
| **核心能力** | black/ruff 格式化、mypy/pyright 类型检查 |
| **适用范围** | Python 语言项目 |

---

## 🔧 元数据说明

`paths` 字段指定此规则适用于哪些 Python 文件路径：

```yaml
paths:
  - "**/*.py"      # Python 源代码文件
  - "**/*.pyi"     # Python 类型存根文件
```

---

## ⚙️ PostToolUse Hooks

### 什么是 Hook？

**Hook（钩子）** 是在特定事件发生时自动执行的脚本。在 Claude Code 中，**PostToolUse Hook** 会在使用工具（如编辑文件）后自动运行配置的命令。

### 配置位置

在 `~/.claude/settings.json` 文件中配置（Windows 上通常是 `C:\Users\你的用户名\.claude\settings.json`）

### 推荐的 Python Hooks 配置

```json
{
  "hooks": {
    "postToolUse": {
      "black": {
        "command": "black",
        "args": ["$FILE"],
        "matcher": "\\.py$",
        "delay": 100
      },
      "ruff": {
        "command": "ruff",
        "args": ["check", "--fix", "$FILE"],
        "matcher": "\\.py$",
        "delay": 100
      },
      "mypy": {
        "command": "mypy",
        "args": ["$FILE"],
        "matcher": "\\.py$",
        "delay": 200
      }
    }
  }
}
```

### 配置说明

#### 参数解释表

| 参数 | 说明 | 示例 |
|------|------|------|
| `command` | 要执行的命令 | `"black"` |
| `args` | 命令参数 | `["$FILE"]` |
| `matcher` | 文件匹配正则表达式 | `"\\.py$"` |
| `delay` | 延迟执行时间（毫秒） | `100` |

#### 特殊变量

| 变量 | 说明 | 示例值 |
|------|------|--------|
| `$FILE` | 当前编辑的文件路径 | `/path/to/file.py` |
| `$DIR` | 当前文件所在目录 | `/path/to/` |

---

## 🎨 代码格式化 Hooks

### Black（自动格式化）

**Black** 是 Python 的代码格式化工具，它会自动统一代码风格。

#### 配置

```json
{
  "hooks": {
    "postToolUse": {
      "black": {
        "command": "black",
        "args": ["$FILE"],
        "matcher": "\\.py$",
        "delay": 100
      }
    }
  }
}
```

#### 工作流程

```
编辑 .py 文件 → Claude Edit → 自动运行 black → 代码被格式化
```

#### 效果示例

**编辑前：**

```python
# 你手动编辑的代码
def calculate(x,y,z):
    return x+y+z
```

**编辑后（Black 自动格式化）：**

```python
# Black 自动添加空格
def calculate(x, y, z):
    return x + y + z
```

### Ruff（代码检查 + 自动修复）

**Ruff** 是快速的 Python 代码检查工具，可以自动修复许多问题。

#### 配置

```json
{
  "hooks": {
    "postToolUse": {
      "ruff": {
        "command": "ruff",
        "args": ["check", "--fix", "$FILE"],
        "matcher": "\\.py$",
        "delay": 100
      }
    }
  }
}
```

#### 参数说明

- `check`：运行代码检查
- `--fix`：自动修复可修复的问题
- `$FILE`：当前编辑的文件

#### 效果示例

**编辑前：**

```python
import os
import sys
import json  # 未使用的导入

def calculate():
    x = 1
    return x  # 未使用的变量
```

**编辑后（Ruff 自动修复）：**

```python
import json
import os
import sys  # 导入自动排序

def calculate():
    return 1  # 未使用的导入和变量被删除
```

---

## 🔍 类型检查 Hooks

### MyPy（静态类型检查）

**MyPy** 是 Python 的静态类型检查器，可以在运行前发现类型错误。

#### 配置

```json
{
  "hooks": {
    "postToolUse": {
      "mypy": {
        "command": "mypy",
        "args": ["$FILE"],
        "matcher": "\\.py$",
        "delay": 200
      }
    }
  }
}
```

#### 效果示例

**编辑文件后，MyPy 会检查类型：**

```python
def calculate(x: int, y: int) -> int:
    return x + y

# 类型错误示例
result: str = calculate(1, 2)  # ❌ 错误：返回 int 而非 str
```

**Mypy 会输出：**

```
error: Incompatible types in assignment (expression has type "int", variable has type "str")
```

### Pyright（VS Code 类型检查器）

**Pyright** 是微软开发的类型检查器，速度快且准确。

#### 配置

```json
{
  "hooks": {
    "postToolUse": {
      "pyright": {
        "command": "pyright",
        "args": ["$FILE"],
        "matcher": "\\.py$",
        "delay": 200
      }
    }
  }
}
```

---

## ⚠️ 警告 Hooks

### 警告 `print()` 语句

在生产代码中，应该使用 `logging` 模块而非 `print()` 语句。

#### 配置示例

```json
{
  "hooks": {
    "postToolUse": {
      "warn-print": {
        "command": "grep",
        "args": ["-n", "print(", "$FILE"],
        "matcher": "\\.py$",
        "delay": 50,
        "notifyOnly": true
      }
    }
  }
}
```

#### 参数说明

- `grep`：文本搜索工具
- `-n`：显示行号
- `"print("`：搜索 print 语句
- `notifyOnly`：只发送通知，不阻塞执行

#### 效果

当文件中包含 `print()` 时，Claude 会显示警告：

```
⚠️ 警告：文件中检测到 print() 语句
建议：使用 logging 模块替代
```

---

## 📝 完整配置示例

### 推荐配置（组合多个 Hook）

```json
{
  "hooks": {
    "postToolUse": {
      "black": {
        "command": "black",
        "args": ["$FILE"],
        "matcher": "\\.py$",
        "delay": 100
      },
      "ruff": {
        "command": "ruff",
        "args": ["check", "--fix", "$FILE"],
        "matcher": "\\.py$",
        "delay": 150
      },
      "mypy": {
        "command": "mypy",
        "args": ["--ignore-missing-imports", "$FILE"],
        "matcher": "\\.py$",
        "delay": 300
      },
      "warn-print": {
        "command": "grep",
        "args": ["-n", "print(", "$FILE"],
        "matcher": "\\.py$",
        "delay": 50,
        "notifyOnly": true
      }
    }
  }
}
```

### 执行顺序

Hook 的执行顺序由配置中的顺序决定（通常按字母顺序）：

```
编辑文件
    ↓
black (格式化) - 100ms 延迟
    ↓
ruff (检查 + 修复) - 150ms 延迟
    ↓
mypy (类型检查) - 300ms 延迟
    ↓
warn-print (警告检查) - 50ms 延迟
```

---

## 🛠️ 安装所需工具

### 安装命令

```bash
# 格式化工具
pip install black

# 代码检查工具
pip install ruff

# 类型检查工具（二选一）
pip install mypy
# 或
pip install pyright
```

### 验证安装

```bash
# 验证 black
black --version

# 验证 ruff
ruff --version

# 验证 mypy
mypy --version

# 验证 pyright
pyright --version
```

---

## 🎯 Hook 使用场景

| 场景 | 推荐配置 | 说明 |
|------|----------|------|
| **快速开发** | black | 只自动格式化，不阻塞 |
| **严格开发** | black + ruff + mypy | 格式化 + 检查 + 类型检查 |
| **团队协作** | black + ruff | 统一代码风格 |
| **学习阶段** | black | 避免过多干扰 |

---

## 🚫 禁用特定 Hook

### 临时禁用

如果某个 Hook 在特定文件中不需要，可以：

1. 在文件顶部添加注释（工具可能支持）：

```python
# ruff: noqa
# mypy: ignore-errors
```

2. 或者在 `settings.json` 中调整 `matcher` 参数：

```json
{
  "ruff": {
    "command": "ruff",
    "args": ["check", "--fix", "$FILE"],
    "matcher": "^(?!.*_test\\.py$).*\\.py$",  # 排除测试文件
    "delay": 100
  }
}
```

---

## 📚 参考资源

- **通用 Hooks 文档**：[common/hooks.md](../common/hooks.md)
- **Black 官方文档**：https://black.readthedocs.io/
- **Ruff 官方文档**：https://docs.astral.sh/ruff/
- **MyPy 官方文档**：https://mypy.readthedocs.io/
- **Pyright 官方文档**：https://microsoft.github.io/pyright/

---

## 💡 学习提示

**初学者建议：**

1. **从简单开始**：先配置 black，体验自动格式化
2. **逐步增加**：熟悉后再添加 ruff 和 mypy
3. **注意延迟**：调整 `delay` 参数，避免等待时间过长
4. **查看输出**：了解 Hook 的反馈，学习改进代码

**常见问题：**

| 问题 | 原因 | 解决方法 |
|------|------|----------|
| Hook 不执行 | 工具未安装 | `pip install black ruff mypy` |
| Hook 执行太慢 | 延迟设置过短 | 增加 `delay` 值 |
| 类型检查报错太多 | 缺少类型注解 | 先禁用 mypy，逐步添加类型 |
| 不想格式化某文件 | `matcher` 不匹配 | 调整正则表达式 |

---

## ✅ 检查清单

在配置 Hooks 时，确认以下事项：

- [ ] 已安装所需工具（black、ruff、mypy 等）
- [ ] `~/.claude/settings.json` 配置正确
- [ ] `matcher` 参数匹配目标文件
- [ ] `delay` 参数设置合理（避免过快或过慢）
- [ ] 测试 Hook 是否正常工作
- [ ] 了解 Hook 的执行顺序
- [ ] 知道如何临时禁用特定 Hook
