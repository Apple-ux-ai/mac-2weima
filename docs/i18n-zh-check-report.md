# 中文 i18n 检查报告

## 一、zh_CN.json 遗漏检查结论

- **结论：项目里已使用的 i18n key 在 zh_CN.json 中均有对应，未发现缺失。**
- 项目使用 Vue I18n，组件通过 `t()` / `tt()` 使用 key（如 `topNav.*`、`advancedEditor.*`、`toast.*`、`dynamicManager.*`、`storageManager.*`、`serverConfig.*`、`folderList.*`、`batchGenerator.*`、`qrGenerator.*`、`licenseModal.*`、`loginModal.*`、`updateModal.*` 等），上述 key 在 `src/i18n/messages/zh_CN.json` 中均有完整翻译。
- 本次检查中为 `advancedEditor.backgroundModal` 新增了 `imageAlt`（中文：「背景图」），用于替换模板里的 alt 硬编码，并已在 en.json 中同步添加。

---

## 二、已修复的中文硬编码

| 位置 | 原内容 | 处理方式 |
|------|--------|----------|
| `AdvancedEditor.vue` 表格表头占位 | `'表头'` | 改为 `tt('advancedEditor.tableHeaderPlaceholder')`（zh_CN 中已有该 key） |
| `AdvancedEditor.vue` 背景图 img alt | `alt="背景图"` | 改为 `:alt="tt('advancedEditor.backgroundModal.imageAlt')"`，并在 zh_CN / en 中新增 `imageAlt` |

---

## 三、仍存在的中文硬编码（建议后续改为 i18n）

### 1. 组件内 `alert` / `confirm` / 抛错（用户可见）

| 文件 | 说明与示例 |
|------|------------|
| **AdvancedEditor.vue** | 多处 `alert()`、`throw new Error()` 中文，如：保存到本地存储失败提示、预览窗口被阻止、MOV 格式提示、存储空间不足、编辑区域未初始化、HTML 内容无效等。 |
| **BatchQRGenerator.vue** | `alert('Excel文件中没有数据行！')`、`alert('Excel文件为空！')`、`alert('Excel文件没有有效的列名！')`、`alert('文件读取失败，请重试！')`、`alert('请先上传Excel文件！')`、`alert('请选择生成二维码的列！')` 等。 |
| **QRGenerator.vue** | 大量 `alert()` 与 `throw new Error()` 中文：文件读取失败、保存到服务器失败、API 服务器不可用、存储空间不足、文档/图片已保存到本地警告、请先上传文件、生成二维码失败、请输入文件夹名称、二维码数据丢失等。 |
| **FolderList.vue** | `alert('请输入二维码名称')`。 |
| **QRPreview.vue** | `alert('保存失败！')`、`alert('二维码内容为空，无法复制')`、`alert('已复制二维码编码内容到剪贴板！')`、`alert('复制失败，请手动复制二维码内容')`、`alert('打印启动失败：...')`。 |
| **StorageManager.vue** | `alert('清理失败: ' + ...)`、`alert('清空失败: ' + ...)`。 |
| **ServerConfig.vue** | `alert('请输入服务器地址')`、`alert('URL格式不正确...')`、`alert('服务器地址已保存！')`、`alert('保存失败，请检查URL格式')`、`confirm('确定要清除手动配置的服务器地址吗？')`、`alert('已清除配置')`、`alert('地址已复制到剪贴板')`。 |

建议：为上述文案在 `zh_CN.json`（及 en 等）中新增 key，在组件中通过 `t()` / `tt()` 或 `showToast(t('key'))` 使用；`confirm` 的文案也建议走 i18n。

### 2. 工具层抛错 / 返回消息（用户可见）

| 文件 | 说明与示例 |
|------|------------|
| **utils/api.js** | `throw new Error('文件过大（...')`、`'保存成功'`、`'保存失败'`、`'无法连接到API服务器...'`、`'内容不存在，视为已删除'`、`'删除成功'`、`'删除失败'` 等。需在非 Vue 环境中使用 i18n 时，可从 `i18n.global.t(key)` 取文案。 |
| **utils/serverConfig.js** | `warning: '当前使用localhost，其他设备无法访问。请配置为局域网IP或公网地址。'`。 |
| **utils/license.js** | `msg: '网络错误'`、`msg: '测试授权成功'`。 |
| **utils/authService.js** | `throw new Error('获取登录地址失败：...')`、`throw new Error('轮询已取消')` 等。 |
| **modules/auth/index.js** | `throw new Error('轮询已取消')`。 |

建议：在 zh_CN.json 中增加如 `api.saveSuccess`、`api.saveFail`、`api.networkError`、`license.networkError`、`auth.pollCanceled` 等 key，在工具函数中通过 `i18n.global.t(key)` 获取文案后再 `throw` 或返回。

### 3. 模板/数据中的中文（可选处理）

| 文件 | 说明 |
|------|------|
| **AdvancedEditor.vue** | 样式库、产品信息等模板数据中的中文：如「大理三塔」「丽江古城」「鲲穹AI二维码」「产品名称」「开发者」「版本号」「标题」「标题文字」「手机」「电脑」「相机」「崇圣寺三塔西对苍山,东对洱海」等。若产品需要多语言展示这些示例，可抽到 i18n 或单独示例语料；否则可保留。 |
| **AdvancedEditor.vue** | `console.log` 中的中文（如 `'[工具栏日志] 行高按钮被点击'`）为调试用，可保留或后续统一清理。 |

### 4. 注释中的中文

- `src/utils/*.js`、`src/i18n/index.js`、`src/i18n/localeMap.js` 等文件中的中文注释仅面向开发者，不影响界面语言，可保留。

---

## 四、建议的后续步骤

1. **优先**：将上述「组件内 alert/confirm/抛错」和「工具层抛错/返回消息」中的用户可见中文，逐条在 zh_CN.json（及 en 等）中加 key，并改为 `t()` / `i18n.global.t()`。
2. **可选**：若希望高级编辑器内的示例模板、地名、产品名等也随语言切换，再为 AdvancedEditor.vue 中对应数据增加 i18n key 或从配置/JSON 按 locale 加载。
3. 运行一次全局搜索 `[\u4e00-\u9fa5]`（或等价正则）排除 i18n 与注释后，可再扫一遍是否有新增硬编码。

---

*报告生成自对 `src/i18n/messages/zh_CN.json` 与项目中 `t()`/`tt()` 使用及中文硬编码的检查。*
