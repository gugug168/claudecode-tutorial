# Skill Create 技能创建命令

分析你的仓库 git 历史来提取编码模式并生成 SKILL.md 文件，教 Claude 你的团队实践。

## 用法

```bash
/skill-create                    # 分析当前仓库
/skill-create --commits 100      # 分析最近 100 个提交
/skill-create --output ./skills  # 自定义输出目录
/skill-create --instincts        # 同时为 continuous-learning-v2 生成 instincts
```

## 它做什么

1. **解析 Git 历史** - 分析提交、文件变更和模式
2. **检测模式** - 识别重复的工作流和约定
3. **生成 SKILL.md** - 创建有效的 Claude Code 技能文件
4. **可选创建 Instincts** - 用于 continuous-learning-v2 系统

## 分析步骤

### 步骤 1：收集 Git 数据

```bash
# 获取最近带有文件变更的提交
git log --oneline -n ${COMMITS:-200} --name-only --pretty=format:"%H|%s|%ad" --date=short

# 按文件获取提交频率
git log --oneline -n 200 --name-only | grep -v "^$" | grep -v "^[a-f0-9]" | sort | uniq -c | sort -rn | head -20

# 获取提交消息模式
git log --oneline -n 200 | cut -d' ' -f2- | head -50
```

### 步骤 2：检测模式

查找这些模式类型：

| 模式 | 检测方法 |
|------|----------|
| **提交约定** | 提交消息的正则匹配（feat:, fix:, chore:） |
| **文件共变** | 总是一起变更的文件 |
| **工作流序列** | 重复的文件变更模式 |
| **架构** | 文件夹结构和命名约定 |
| **测试模式** | 测试文件位置、命名、覆盖率 |

## 相关命令

- `/instinct-import` - 导入生成的 instincts
- `/instinct-status` - 查看已学习的 instincts
- `/evolve` - 将 instincts 聚类为技能/代理
