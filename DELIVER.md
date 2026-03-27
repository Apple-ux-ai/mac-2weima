# 交付清单 (Deliverables)

## 1. 核心产物
| 产物名称 | 路径 | 说明 |
| :--- | :--- | :--- |
| **安装包 (exe)** | `release-builds-v101/二维码生成器 Setup 1.0.0.exe` | Windows 安装程序 |
| **免安装版 (zip)** | `release-builds-v101/二维码生成器-1.0.0-win.zip` | 绿色版 |
| **独立更新程序** | `updater-standalone/updater.exe` | 已集成到主程序中 |

## 2. 更新机制说明 (New)
已切换为 **独立进程更新模式 (Standalone Updater)**：
1. **主程序**：检查更新 -> 下载 ZIP -> 解压 -> 启动 `updater.exe` (带 PID 参数) -> `app.quit()`。
2. **Updater**：读取 PID -> 等待主程序完全退出 (解决文件占用) -> 覆盖文件 -> 重启主程序。

## 3. 常用命令
### 一键打包
双击 `scripts/pack.bat` 或运行：
```bash
npm run electron:build
```
> **注意**：输出目录已调整为 `release-builds-v101` 以避免文件锁定问题。

### 生成测试版本 (1.0.0 & 1.1.0)
双击 `scripts/build-test-versions.bat`
> 此脚本会自动生成 v1.0.0 安装包和 v1.1.0 更新包 (`update_1.1.0.zip`)，方便本地测试更新流程。

## 4. 常见问题排查
### Q: 打包时提示 `resource busy or locked`？
**A**: 这是因为某个文件被资源管理器或杀毒软件占用。
- **解决方案**：脚本已自动将输出目录切换到新路径 `release-builds-v101`。如果仍报错，请重启电脑或手动删除旧的 `release-builds` 目录。

### Q: 更新时提示“文件被占用”？
**A**: 已修复。新的 `updater.exe` 会在覆盖前强制等待主进程结束。
- 如果仍出现，请检查是否有其他软件（如杀毒软件）锁定了 `.exe` 文件。

## 5. 项目结构变更
- `updater-standalone/`: 独立更新程序源码
- `electron/main.cjs`: 移除旧 UI 逻辑，仅保留静默启动逻辑
- `package.json`: 移除 `update-ui` 相关构建配置
