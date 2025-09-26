# VS Code 配置说明

## Biome 格式化配置

本项目已配置 Biome 作为默认的代码格式化工具。

### 自动配置

当你打开这个项目时，VS Code 会自动：

1. **推荐安装 Biome 扩展** - 如果你还没有安装，VS Code 会提示你安装
2. **设置 Biome 为默认格式化程序** - 对于 TypeScript、JavaScript、JSX、TSX 和 JSON 文件
3. **启用保存时自动格式化** - 每次保存文件时自动格式化代码
4. **启用保存时自动修复** - 自动修复可修复的 lint 问题和组织导入

### 手动操作

如果自动配置没有生效，你可以：

1. **安装 Biome 扩展**：
   - 打开 VS Code 扩展面板 (Ctrl+Shift+X)
   - 搜索 "Biome"
   - 安装 "Biome" 扩展

2. **设置默认格式化程序**：
   - 打开任意 TypeScript 文件
   - 右键选择 "格式化文档方式..."
   - 选择 "Biome" 作为默认格式化程序

3. **启用保存时格式化**：
   - 打开 VS Code 设置 (Ctrl+,)
   - 搜索 "format on save"
   - 勾选 "Editor: Format On Save"

### 可用的命令

在项目根目录运行以下命令：

```bash
# 格式化所有文件
npm run format

# 检查格式化（不修改文件）
npm run format:check

# 运行 linter
npm run lint:biome

# 运行 linter 并自动修复
npm run lint:biome:fix

# 运行完整检查（格式化 + linting）
npm run check

# 运行完整检查并自动修复
npm run check:fix
```

### 故障排除

如果遇到 "多个格式化程序" 的错误：

1. 确保已安装 Biome 扩展
2. 禁用其他格式化扩展（如 Prettier）
3. 重新加载 VS Code 窗口 (Ctrl+Shift+P -> "Developer: Reload Window")

### 配置文件

- `biome.json` - Biome 的主配置文件
- `.vscode/settings.json` - VS Code 工作区设置
- `.vscode/extensions.json` - 推荐的扩展列表