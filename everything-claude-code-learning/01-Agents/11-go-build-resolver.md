# Go-Build-Resolver（Go构建错误解决代理）

## 一句话总结
Go-Build-Resolver 是一个Go构建错误修复专家，当你的Go项目编译失败、go vet报错、linter警告时，它会用最小的改动快速修复问题。

---

## 它是什么？（小白视角）

### 用一个比喻来理解

想象你在组装宜家家具：

- **没有 Go-Build-Resolver**：说明书说"缺少零件A"，你不知道怎么办，到处乱找
- **有 Go-Build-Resolver**：有位组装专家告诉你"零件A在第2步就应该装上去"，精准定位问题

**Go-Build-Resolver 就是那位"组装专家"**，它精准定位Go编译错误，用最小改动修复。

### Go编译错误的常见类型

| 类型 | 说明 |
|------|------|
| 编译错误 | 语法错误、类型不匹配 |
| go vet警告 | 可疑代码模式 |
| 模块问题 | 依赖缺失、版本冲突 |
| 类型错误 | 接口不匹配、类型断言失败 |

---

## 工作原理

```
go build失败 ──→ Go-Build-Resolver ──→ 解析错误信息
    │                                    │
    │                                    ↓
    │                               读取受影响文件
    │                                    │
    │                                    ↓
    │                               应用最小修复
    │                                    │
    │                                    ↓
    └─────────────────←────────────── 验证构建通过
```

---

## 配置详解

```yaml
---
name: go-build-resolver                              # 代理名称
description: Go build, vet, and compilation error... # 描述
tools: ["Read", "Write", "Edit", "Bash", "Grep", "Glob"]  # 可读写执行
model: sonnet                                        # 使用Sonnet模型
---
```

---

## 核心职责

1. 诊断Go编译错误
2. 修复 `go vet` 警告
3. 解决 `staticcheck` / `golangci-lint` 问题
4. 处理模块依赖问题
5. 修复类型错误和接口不匹配

---

## 诊断命令

按顺序运行：

```bash
# 1. 尝试构建
go build ./...

# 2. 运行go vet
go vet ./...

# 3. 静态检查
staticcheck ./... 2>/dev/null || echo "staticcheck未安装"

# 4. 综合linter
golangci-lint run 2>/dev/null || echo "golangci-lint未安装"

# 5. 验证模块
go mod verify

# 6. 整理依赖
go mod tidy -v
```

---

## 解决流程

```
1. go build ./...     → 解析错误信息
2. 读取受影响文件      → 理解上下文
3. 应用最小修复        → 只做必要的修改
4. go build ./...     → 验证修复
5. go vet ./...       → 检查警告
6. go test ./...      → 确保没有破坏
```

---

## 常见修复模式

| 错误 | 原因 | 修复方法 |
|------|------|----------|
| `undefined: X` | 缺少导入、拼写错误、未导出 | 添加导入或修正大小写 |
| `cannot use X as type Y` | 类型不匹配、指针/值 | 类型转换或解引用 |
| `X does not implement Y` | 缺少方法 | 实现正确接收者的方法 |
| `import cycle not allowed` | 循环依赖 | 提取共享类型到新包 |
| `cannot find package` | 缺少依赖 | `go get pkg@version` 或 `go mod tidy` |
| `missing return` | 控制流不完整 | 添加return语句 |
| `declared but not used` | 未使用的变量/导入 | 删除或使用空白标识符 |
| `multiple-value in single-value context` | 未处理返回值 | `result, err := func()` |
| `cannot assign to struct field in map` | map值可变性问题 | 使用指针map或复制-修改-重赋值 |
| `invalid type assertion` | 对非接口断言 | 只从 `interface{}` 断言 |

---

## 常见错误示例

### undefined

```go
// ❌ 错误
func main() {
    fmt.Println("Hello")  // undefined: fmt
}

// ✅ 修复: 添加导入
import "fmt"
func main() {
    fmt.Println("Hello")
}
```

### 类型不匹配

```go
// ❌ 错误
var s string = 123  // cannot use 123 (type int) as type string

// ✅ 修复: 类型转换
var s string = strconv.Itoa(123)

// ✅ 或
var s string = "123"
```

### 接口不匹配

```go
// ❌ 错误
type Reader interface {
    Read([]byte) (int, error)
}

type MyReader struct{}

func (r MyReader) Read(p []byte, n int) (int, error) { ... }  // 签名不匹配

// ✅ 修复: 正确实现接口
func (r MyReader) Read(p []byte) (int, error) { ... }
```

### 循环导入

```
包A → 包B → 包A  (循环!)
```

```go
// ❌ 错误: 循环导入
// packageA/a.go
import "project/packageB"

// packageB/b.go
import "project/packageA"

// ✅ 修复: 提取共享类型到新包
// packageCommon/types.go  (新包)
// packageA/a.go
import "project/packageCommon"
// packageB/b.go
import "project/packageCommon"
```

### 未处理返回值

```go
// ❌ 错误
result := doSomething()  // multiple-value in single-value context

// ✅ 修复: 处理所有返回值
result, err := doSomething()
if err != nil {
    return err
}
```

### map值修改

```go
// ❌ 错误
m := map[string]Point{"a": {1, 2}}
m["a"].X = 3  // cannot assign to struct field in map

// ✅ 修复1: 使用指针map
m := map[string]*Point{"a": {1, 2}}
m["a"].X = 3

// ✅ 修复2: 复制-修改-重赋值
p := m["a"]
p.X = 3
m["a"] = p
```

---

## 模块故障排除

```bash
# 检查本地替换
grep "replace" go.mod

# 查询为什么选择某版本
go mod why -m package

# 固定特定版本
go get package@v1.2.3

# 修复校验和问题
go clean -modcache && go mod download
```

---

## 关键原则

1. **只做手术式修复** - 不重构，只修复错误
2. **永远不要** 添加 `//nolint` 除非明确批准
3. **永远不要** 改变函数签名除非必要
4. **总是** 在添加/删除导入后运行 `go mod tidy`
5. 修复根本原因，不要掩盖症状

---

## 停止条件

如果遇到以下情况，停止并报告：

- 同一错误在3次修复尝试后仍然存在
- 修复引入的错误比解决的更多
- 错误需要超出范围的架构变更

---

## 输出格式

```text
[已修复] internal/handler/user.go:42
错误: undefined: UserService
修复: 添加导入 "project/internal/service"
剩余错误: 3
```

最终: `构建状态: 成功/失败 | 已修复错误: N | 已修改文件: 列表`

---

## 使用方法

### 通过命令调用
```bash
/go-build
```

### 或者描述问题
```
go build ./... 失败了，帮我修复
```

---

## 工作流配合

```
[写Go代码...]
go build ./...        ← 构建失败!
/go-build             ← go-build-resolver快速修复
go build ./...        ← 构建通过!
/go-review            ← go-reviewer审查代码
```

---

## 注意事项

1. **最小改动** - 只修复错误，不做额外修改
2. **验证每步** - 每次修复后重新构建
3. **不要压制** - 不用 //nolint 掩盖问题
4. **保持签名** - 尽量不改函数签名
5. **整理依赖** - 修改导入后运行 go mod tidy

---

## 相关代理

- **go-reviewer** - Go代码审查
- **build-error-resolver** - TypeScript构建错误
- **tdd-guide** - Go测试

## 相关技能

- `skill: golang-patterns` - 详细Go模式和代码示例
