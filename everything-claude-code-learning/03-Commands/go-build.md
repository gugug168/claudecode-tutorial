# Go Build Go 构建修复命令

增量式修复 Go 构建错误、go vet 警告和 linter 问题。调用 go-build-resolver agent 进行最小、精确的修复。

## 此命令做什么

1. **运行诊断**：执行 `go build`、`go vet`、`staticcheck`
2. **解析错误**：按文件分组并按严重程度排序
3. **增量修复**：一次修复一个错误
4. **验证每个修复**：每次变更后重新运行构建
5. **报告摘要**：显示已修复和剩余的内容

## 什么时候使用

使用 `/go-build` 当：
- `go build ./...` 失败并有错误
- `go vet ./...` 报告问题
- `golangci-lint run` 显示警告
- 模块依赖损坏
- 拉取破坏构建的变更后

## 常见错误修复

| 错误 | 典型修复 |
|------|----------|
| `undefined: X` | 添加导入或修复拼写错误 |
| `cannot use X as Y` | 类型转换或修复赋值 |
| `missing return` | 添加返回语句 |
| `X does not implement Y` | 添加缺失的方法 |
| `import cycle` | 重构包结构 |
| `declared but not used` | 删除或使用变量 |
| `cannot find package` | `go get` 或 `go mod tidy` |

## 修复策略

1. **先修复构建错误** - 代码必须能编译
2. **再修复 vet 警告** - 修复可疑构造
3. **最后修复 lint 警告** - 风格和最佳实践
4. **一次修复一个** - 验证每个变更
5. **最小化变更** - 不要重构，只修复

## 相关命令

- `/go-test` - 构建成功后运行测试
- `/go-review` - 审查代码质量
- `/verify` - 完整验证循环
