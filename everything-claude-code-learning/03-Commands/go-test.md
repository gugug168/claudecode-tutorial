# Go Test Go 测试驱动开发命令

为 Go 代码强制执行 TDD 工作流程。先编写表驱动测试，然后实现。使用 go test -cover 验证 80%+ 覆盖率。

此命令为 Go 代码强制执行测试驱动开发方法论，使用惯用的 Go 测试模式。

## 此命令做什么

1. **定义类型/接口**：先脚手架函数签名
2. **编写表驱动测试**：创建全面的测试用例（红色）
3. **运行测试**：验证测试因正确原因失败
4. **实现代码**：编写最小代码通过（绿色）
5. **重构**：在保持测试通过的同时改进
6. **检查覆盖率**：确保 80%+ 覆盖率

## TDD 循环

```
RED     → 编写失败的表驱动测试
GREEN   → 实现最小代码通过
REFACTOR → 改进代码，测试保持通过
REPEAT  → 下一个测试用例
```

## 测试模式

### 表驱动测试

```go
tests := []struct {
    name     string
    input    InputType
    want     OutputType
    wantErr  bool
}{
    {"case 1", input1, want1, false},
    {"case 2", input2, want2, true},
}

for _, tt := range tests {
    t.Run(tt.name, func(t *testing.T) {
        got, err := Function(tt.input)
        // 断言
    })
}
```

## 覆盖率命令

```bash
# 基本覆盖率
go test -cover ./...

# 覆盖率配置文件
go test -coverprofile=coverage.out ./...

# 在浏览器中查看
go tool cover -html=coverage.out

# 带竞态检测
go test -race -cover ./...
```

## 覆盖率目标

| 代码类型 | 目标 |
|----------|------|
| 关键业务逻辑 | 100% |
| 公共 API | 90%+ |
| 一般代码 | 80%+ |
| 生成的代码 | 排除 |

## TDD 最佳实践

**应该做：**
- 在任何实现之前**先写测试**
- 每次更改后运行测试
- 使用表驱动测试实现全面覆盖
- 测试行为，而不是实现细节

**不应该做：**
- 在测试之前写实现
- 跳过红色阶段
- 直接测试私有函数
- 在测试中使用 `time.Sleep`
