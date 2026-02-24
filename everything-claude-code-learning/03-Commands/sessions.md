# Sessions 会话管理命令

管理 Claude Code 会话历史 - 列出、加载、别名和编辑存储在 `~/.claude/sessions/` 的会话。

## 用法

`/sessions [list|load|alias|info|help] [选项]`

## 动作

### 列出会话

显示所有会话，包含元数据、过滤和分页。

```bash
/sessions                              # 列出所有会话（默认）
/sessions list                         # 同上
/sessions list --limit 10              # 显示 10 个会话
/sessions list --date 2026-02-01       # 按日期过滤
/sessions list --search abc            # 按会话 ID 搜索
```

### 加载会话

加载并显示会话内容（通过 ID 或别名）。

```bash
/sessions load <id|别名>               # 加载会话
/sessions load 2026-02-01              # 按日期（无 ID 会话）
/sessions load a1b2c3d4                # 按短 ID
/sessions load my-alias                # 按别名名称
```

### 创建别名

为会话创建易记的别名。

```bash
/sessions alias <id> <名称>            # 创建别名
/sessions alias 2026-02-01 today-work  # 创建名为 "today-work" 的别名
```

### 删除别名

删除现有别名。

```bash
/sessions alias --remove <名称>        # 删除别名
/sessions unalias <名称>               # 同上
```

## 参数

$ARGUMENTS:
- `list [选项]` - 列出会话
  - `--limit <n>` - 最大显示会话数（默认：50）
  - `--date <YYYY-MM-DD>` - 按日期过滤
  - `--search <模式>` - 在会话 ID 中搜索
- `load <id|别名>` - 加载会话内容
- `alias <id> <名称>` - 为会话创建别名
- `alias --remove <名称>` - 删除别名
- `info <id|别名>` - 显示会话统计
- `aliases` - 列出所有别名
- `help` - 显示帮助

## 示例

```bash
# 列出所有会话
/sessions list

# 为今天的会话创建别名
/sessions alias 2026-02-01 today

# 通过别名加载会话
/sessions load today

# 显示会话信息
/sessions info today

# 删除别名
/sessions alias --remove today
```

## 注意事项

- 会话以 markdown 文件形式存储在 `~/.claude/sessions/`
- 别名存储在 `~/.claude/session-aliases.json`
- 会话 ID 可以缩短（通常前 4-8 个字符足够唯一）
- 为经常引用的会话使用别名
