# Go Hooks 配置指南

> 本文件扩展了 [common/hooks.md](../common/hooks.md)，添加了 Go 语言特定的内容。

## 适用范围

本规则适用于以下文件：
- 所有 `.go` 源文件
- `go.mod` 模块配置文件
- `go.sum` 依赖锁定文件

---

## 一、什么是 Hooks？

### Hooks 的概念

Hooks（钩子）是一种自动化机制，可以在特定事件发生时自动执行预定义的命令。

在 Claude Code 中，**PostToolUse Hooks** 会在你使用工具（如编辑文件）后自动运行命令，帮助你：
- 自动格式化代码
- 运行代码检查
- 执行安全扫描
- 显示实时反馈

### 为什么需要 Hooks？

| 好处 | 说明 |
|------|------|
| **自动化** | 不用手动运行格式化和检查命令 |
| **即时反馈** | 编辑后立即看到问题 |
| **保持代码质量** | 确保代码始终符合规范 |
| **节省时间** | 减少重复性工作 |

---

## 二、配置方法

### 配置文件位置

Hooks 需要在 Claude Code 的设置文件中配置：

**Windows:** `C:\Users\你的用户名\.claude\settings.json`
**Linux/macOS:** `~/.claude/settings.json`

### 配置文件结构

```json
{
  "postToolUse": {
    "Edit": [
      {
        "pattern": "\\.go$",
        "command": "gofmt -w {file}"
      }
    ]
  }
}
```

### 配置项说明

| 字段 | 说明 | 示例 |
|------|------|------|
| **pattern** | 文件匹配模式（正则表达式） | `"\\.go$"`（匹配 .go 文件） |
| **command** | 要执行的命令 | `"gofmt -w {file}"` |
| **{file}** | 当前文件的路径 | 自动替换为实际文件路径 |

---

## 三、Go 语言推荐配置

### 完整配置示例

将以下配置添加到 `~/.claude/settings.json`：

```json
{
  "postToolUse": {
    "Edit": [
      {
        "pattern": "\\.go$",
        "command": "gofmt -w {file}"
      },
      {
        "pattern": "\\.go$",
        "command": "goimports -w {file}"
      },
      {
        "pattern": "\\.go$",
        "command": "go vet {file}"
      },
      {
        "pattern": "\\.go$",
        "command": "staticcheck {file}"
      }
    ]
  }
}
```

### 各个 Hook 的作用

| Hook | 命令 | 作用 |
|------|------|------|
| **gofmt** | `gofmt -w {file}` | 自动格式化 Go 代码 |
| **goimports** | `goimports -w {file}` | 自动整理 import 导入 |
| **go vet** | `go vet {file}` | 静态代码分析 |
| **staticcheck** | `staticcheck {file}` | 扩展静态检查 |

---

## 四、各个 Hook 详解

### 1. gofmt - 代码格式化

#### 功能
`gofmt` 是 Go 语言官方的代码格式化工具，自动调整：
- 缩进和空格
- 换行位置
- 大括号位置
- 对齐方式

#### 使用示例

```bash
# 格式化单个文件
gofmt -w main.go

# 格式化整个项目
gofmt -w ./...

# 查看格式化前后的差异（不修改文件）
gofmt -d main.go
```

#### Hook 配置
```json
{
  "pattern": "\\.go$",
  "command": "gofmt -w {file}"
}
```

#### 效果

格式化前：
```go
package main
func main(){
    if true{
    println("hello")
    }
}
```

格式化后：
```go
package main

func main() {
    if true {
        println("hello")
    }
}
```

---

### 2. goimports - 导入管理

#### 功能
`goimports` 除了格式化代码，还会：
- 自动添加缺失的导入
- 删除未使用的导入
- 对导入进行分组（标准库、第三方、本地）

#### 安装
```bash
go install golang.org/x/tools/cmd/goimports@latest
```

#### Hook 配置
```json
{
  "pattern": "\\.go$",
  "command": "goimports -w {file}"
}
```

#### 效果

处理前：
```go
package main

import "fmt"
import "encoding/json"  // 未使用

func main() {
    fmt.Println("hello")
}
```

处理后：
```go
package main

import "fmt"

func main() {
    fmt.Println("hello")
}
// encoding/json 被自动删除
```

---

### 3. go vet - 静态代码分析

#### 功能
`go vet` 是 Go 官方的静态分析工具，检测：
- 可疑的代码构造
- 常见的编程错误
- 不符合规范的用法

#### 检测的问题类型

| 问题类型 | 示例 |
|---------|------|
| **格式化字符串错误** | `fmt.Printf("%d", "string")` |
| **未使用的赋值** | `x = f(); x 未被使用` |
| ** unreachable 代码** | `return` 之后的代码 |
| **循环变量闭包问题** | goroutine 中的循环变量 |

#### Hook 配置
```json
{
  "pattern": "\\.go$",
  "command": "go vet {file}"
}
```

#### 输出示例

```bash
$ go vet main.go
# command-line-arguments
./main.go:10:2: Printf format %d has arg "hello" of wrong type string
```

---

### 4. staticcheck - 扩展静态检查

#### 功能
`staticcheck` 是第三方工具，提供了比 `go vet` 更深入的检查：
- 性能问题
- 代码简洁性
- 错误处理问题
- 并发问题

#### 安装
```bash
go install honnef.co/go/tools/cmd/staticcheck@latest
```

#### Hook 配置
```json
{
  "pattern": "\\.go$",
  "command": "staticcheck {file}"
}
```

#### 检测的问题类型

| 问题类型 | 说明 |
|---------|------|
| **性能问题** | 低效的字符串拼接、不必要的转换 |
| **错误处理** | 遗漏的错误检查 |
| **并发问题** | 潜在的竞态条件 |
| **代码质量** | 可以简化的代码 |

#### 输出示例

```bash
$ staticcheck ./...
main.go:15:2: this value of err is never used (SA9003)
main.go:20:14: should use time.Since instead of time.Now().Sub (SA9002)
```

---

## 五、配置步骤

### 步骤 1：找到配置文件

```bash
# Windows (PowerShell)
notepad $env:USERPROFILE\.claude\settings.json

# Linux/macOS
nano ~/.claude/settings.json
```

### 步骤 2：检查是否已存在配置

如果文件已存在，检查是否有 `postToolUse` 部分：

```json
{
  "postToolUse": {
    "Edit": [...]
  }
}
```

### 步骤 3：添加 Go Hooks

如果已有配置，在 `"Edit"` 数组中添加新的 Hook；如果不存在，创建新的配置：

```json
{
  "postToolUse": {
    "Edit": [
      {
        "pattern": "\\.go$",
        "command": "gofmt -w {file}"
      },
      {
        "pattern": "\\.go$",
        "command": "goimports -w {file}"
      },
      {
        "pattern": "\\.go$",
        "command": "go vet {file}"
      },
      {
        "pattern": "\\.go$",
        "command": "staticcheck {file}"
      }
    ]
  }
}
```

### 步骤 4：保存并重启 Claude Code

保存文件后，重启 Claude Code 使配置生效。

---

## 六、验证配置

### 测试方法

1. 打开一个 `.go` 文件
2. 进行一些编辑（添加或修改代码）
3. 观察 Claude Code 的输出

### 预期结果

你应该看到类似这样的输出：

```
[PostToolUse] Running: gofmt -w E:/path/to/file.go
[PostToolUse] Running: goimports -w E:/path/to/file.go
[PostToolUse] Running: go vet E:/path/to/file.go
[PostToolUse] Running: staticcheck E:/path/to/file.go
```

### 常见问题排查

| 问题 | 原因 | 解决方法 |
|------|------|---------|
| **Hook 未运行** | 配置文件路径错误 | 确认配置文件在正确位置 |
| **命令未找到** | 工具未安装或不在 PATH 中 | 安装工具或添加到 PATH |
| **Hook 运行但无效果** | 命令参数错误 | 检查命令语法 |

---

## 七、高级配置

### 1. 条件性执行

只在特定条件下运行 Hook：

```json
{
  "postToolUse": {
    "Edit": [
      {
        "pattern": "\\.go$",
        "command": "gofmt -w {file}",
        "when": "onSave"
      }
    ]
  }
}
```

### 2. 多文件类型支持

为不同文件类型配置不同的 Hook：

```json
{
  "postToolUse": {
    "Edit": [
      {
        "pattern": "\\.go$",
        "command": "gofmt -w {file}"
      },
      {
        "pattern": "\\.(js|ts)$",
        "command": "prettier --write {file}"
      },
      {
        "pattern": "\\.py$",
        "command": "black {file}"
      }
    ]
  }
}
```

### 3. 组合命令

使用 `&&` 组合多个命令：

```json
{
  "postToolUse": {
    "Edit": [
      {
        "pattern": "\\.go$",
        "command": "gofmt -w {file} && goimports -w {file}"
      }
    ]
  }
}
```

---

## 八、最佳实践

### 推荐配置优先级

根据你的需求选择：

| 级别 | 配置 | 适用场景 |
|------|------|---------|
| **最小** | gofmt | 快速格式化 |
| **标准** | gofmt + goimports | 日常开发 |
| **推荐** | gofmt + goimports + go vet | 确保代码质量 |
| **完整** | 全部 | 严格的项目规范 |

### 性能考虑

- **gofmt** 非常快（<100ms）
- **goimports** 稍慢（100-500ms）
- **go vet** 中等（500ms-2s）
- **staticcheck** 较慢（1-5s）

建议：
- 小项目：启用所有 Hook
- 大项目：只启用 gofmt 和 goimports，手动运行其他工具

---

## 九、快速检查清单

配置 Go Hooks 前，确保：

- [ ] 已安装 gofmt（随 Go 一起安装）
- [ ] 已安装 goimports（`go install golang.org/x/tools/cmd/goimports@latest`）
- [ ] 已安装 staticcheck（`go install honnef.co/go/tools/cmd/staticcheck@latest`）
- [ ] 找到 Claude Code 配置文件位置
- [ ] 理解 JSON 配置格式
- [ ] 备份原配置文件（如果存在）

---

## 常见问题（FAQ）

**Q: Hook 会影响性能吗？**

A: 会有轻微影响。gofmt 和 goimports 很快，go vet 和 staticcheck 需要更多时间。如果感觉慢，可以只保留 gofmt 和 goimports。

**Q: 如何禁用某个 Hook？**

A: 从配置文件中删除对应的 Hook 条目，或注释掉（JSON 不支持注释，需要删除）。

**Q: Hook 运行失败会怎样？**

A: Claude Code 会显示错误信息，但不会阻止你继续工作。

**Q: 可以为不同项目配置不同的 Hook 吗？**

A: 可以在项目级别的配置文件中设置，具体参考 Claude Code 文档。

**Q: gofmt 和 goimports 有什么区别？**

A: gofmt 只格式化代码，goimports 除了格式化还会管理导入。通常使用 goimports 即可（它内部调用 gofmt）。

**Q: 如何查看 Hook 的输出？**

A: Hook 运行时，Claude Code 会在终端显示命令和输出。如果没有看到，检查配置是否正确。
