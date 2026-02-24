<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个命令是做什么的：分析本地 git 历史提取编码模式并生成 SKILL.md   ║
║  什么时候用它：想要从项目历史中提取团队实践、创建技能文件时         ║
║  核心能力：解析 git 历史、检测模式、生成 SKILL.md、创建 instincts   ║
║  触发方式：/skill-create                                           ║
╚══════════════════════════════════════════════════════════════════╝
-->

---
name: skill-create
description: Analyze local git history to extract coding patterns and generate SKILL.md files. Local version of the Skill Creator GitHub App.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /skill-create - Local Skill Generation

<!--
【说明】分析你的仓库 git 历史来提取编码模式并生成 SKILL.md 文件，教 Claude 你的团队实践。
-->
Analyze your repository's git history to extract coding patterns and generate SKILL.md files that teach Claude your team's practices.

<!--
【说明】用法：
- 分析当前仓库
- 分析最近 100 个提交
- 自定义输出目录
- 同时为 continuous-learning-v2 生成 instincts
-->
## Usage

```bash
/skill-create                    # Analyze current repo
/skill-create --commits 100      # Analyze last 100 commits
/skill-create --output ./skills  # Custom output directory
/skill-create --instincts        # Also generate instincts for continuous-learning-v2
```

<!--
【说明】它做什么：
1. 解析 Git 历史 - 分析提交、文件变更和模式
2. 检测模式 - 识别重复的工作流和约定
3. 生成 SKILL.md - 创建有效的 Claude Code 技能文件
4. 可选创建 Instincts - 用于 continuous-learning-v2 系统
-->
## What It Does

1. **Parses Git History** - Analyzes commits, file changes, and patterns
2. **Detects Patterns** - Identifies recurring workflows and conventions
3. **Generates SKILL.md** - Creates valid Claude Code skill files
4. **Optionally Creates Instincts** - For the continuous-learning-v2 system

<!--
【说明】分析步骤：
步骤1：收集 Git 数据 - 获取最近带有文件变更的提交、按文件获取提交频率、获取提交消息模式
步骤2：检测模式 - 提交约定、文件共变、工作流序列、架构、测试模式
-->
## Analysis Steps

### Step 1: Gather Git Data

```bash
# Get recent commits with file changes
git log --oneline -n ${COMMITS:-200} --name-only --pretty=format:"%H|%s|%ad" --date=short

# Get commit frequency by file
git log --oneline -n 200 --name-only | grep -v "^$" | grep -v "^[a-f0-9]" | sort | uniq -c | sort -rn | head -20

# Get commit message patterns
git log --oneline -n 200 | cut -d' ' -f2- | head -50
```

### Step 2: Detect Patterns

Look for these pattern types:

| Pattern | Detection Method |
|---------|-----------------|
| **Commit conventions** | Regex on commit messages (feat:, fix:, chore:) |
| **File co-changes** | Files that always change together |
| **Workflow sequences** | Repeated file change patterns |
| **Architecture** | Folder structure and naming conventions |
| **Testing patterns** | Test file locations, naming, coverage |

<!--
【说明】相关命令：
- /instinct-import - 导入生成的 instincts
- /instinct-status - 查看已学习的 instincts
- /evolve - 将 instincts 聚类为技能/代理
-->
## Related Commands

- `/instinct-import` - Import generated instincts
- `/instinct-status` - View learned instincts
- `/evolve` - Cluster instincts into skills/agents
