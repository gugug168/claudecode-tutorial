<!--
╔══════════════════════════════════════════════════════════════════╗
║  【中文概述】                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  这个命令是做什么的：管理 Claude Code 会话历史                       ║
║  什么时候用它：需要列出、加载、别名、编辑会话时                      ║
║  核心能力：列出会话、加载会话、创建别名、显示会话信息                ║
║  触发方式：/sessions [list|load|alias|info|help] [options]         ║
╚══════════════════════════════════════════════════════════════════╝
-->

# Sessions Command

<!--
【说明】管理 Claude Code 会话历史 - 列出、加载、别名和编辑存储在 `~/.claude/sessions/` 的会话。
-->
Manage Claude Code session history - list, load, alias, and edit sessions stored in `~/.claude/sessions/`.

<!--
【说明】用法：/sessions [list|load|alias|info|help] [选项]
-->
## Usage

`/sessions [list|load|alias|info|help] [options]`

<!--
【说明】动作：
- 列出会话：显示所有会话，包含元数据、过滤和分页
- 加载会话：加载并显示会话内容（通过 ID 或别名）
- 创建别名：为会话创建易记的别名
- 删除别名：删除现有别名
-->
## Actions

### List Sessions

Display all sessions with metadata, filtering, and pagination.

```bash
/sessions                              # List all sessions (default)
/sessions list                         # Same as above
/sessions list --limit 10              # Show 10 sessions
/sessions list --date 2026-02-01       # Filter by date
/sessions list --search abc            # Search by session ID
```

### Load Session

Load and display a session's content (by ID or alias).

```bash
/sessions load <id|alias>             # Load session
/sessions load 2026-02-01             # By date (for no-id sessions)
/sessions load a1b2c3d4               # By short ID
/sessions load my-alias               # By alias name
```

### Create Alias

Create a memorable alias for a session.

```bash
/sessions alias <id> <name>           # Create alias
/sessions alias 2026-02-01 today-work # Create alias named "today-work"
```

### Remove Alias

Delete an existing alias.

```bash
/sessions alias --remove <name>        # Remove alias
/sessions unalias <name>               # Same as above
```

<!--
【说明】参数：
- list [选项]：--limit <n> 最大显示会话数（默认50）、--date <YYYY-MM-DD> 按日期过滤、--search <模式> 在会话 ID 中搜索
- load <id|别名>：加载会话内容
- alias <id> <名称>：为会话创建别名
- alias --remove <名称>：删除别名
- info <id|别名>：显示会话统计
- aliases：列出所有别名
- help：显示帮助
-->
## Arguments

$ARGUMENTS:
- `list [options]` - List sessions
  - `--limit <n>` - Max sessions to show (default: 50)
  - `--date <YYYY-MM-DD>` - Filter by date
  - `--search <pattern>` - Search in session ID
- `load <id|alias>` - Load session content
- `alias <id> <name>` - Create alias for session
- `alias --remove <name>` - Remove alias
- `info <id|alias>` - Show session statistics
- `aliases` - List all aliases
- `help` - Show this help

<!--
【说明】示例：列出所有会话、为今天的会话创建别名、通过别名加载会话、显示会话信息、删除别名
-->
## Examples

```bash
# List all sessions
/sessions list

# Create an alias for today's session
/sessions alias 2026-02-01 today

# Load session by alias
/sessions load today

# Show session info
/sessions info today

# Remove alias
/sessions alias --remove today
```

<!--
【说明】注意事项：
- 会话以 markdown 文件形式存储在 ~/.claude/sessions/
- 别名存储在 ~/.claude/session-aliases.json
- 会话 ID 可以缩短（通常前 4-8 个字符足够唯一）
- 为经常引用的会话使用别名
-->
## Notes

- Sessions are stored as markdown files in `~/.claude/sessions/`
- Aliases are stored in `~/.claude/session-aliases.json`
- Session IDs can be shortened (first 4-8 characters usually unique enough)
- Use aliases for frequently referenced sessions
