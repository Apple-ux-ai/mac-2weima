# 实施计划：修复活码跨设备扫码显示“文件不存在”的问题

## 核心问题分析
1. **加载侧（viewer.html）**：`loadDynamicQR` 函数仅从本地 `localStorage` 读取活码数据。由于 `localStorage` 无法跨设备共享，导致在生成设备以外的手机上扫码时找不到数据。
2. **生成侧（DynamicQRManager.vue）**：批量活码生成逻辑（`initFromBatchData`）仅将数据保存到了本地 `localStorage`，未同步到服务器 API，导致服务器上也无此数据。

## 实施检查清单

### 1. 修改 `src/components/DynamicQRManager.vue`
- 导入 `saveContentToServer` 和 `checkApiServer` 工具函数。
- 在 `initFromBatchData` 函数中，生成每个活码对象后，尝试将其保存到服务器。
- 添加服务器保存失败的容错提示，引导用户检查 API 服务器状态。

### 2. 修改 `public/viewer.html`
- 在 `loadDynamicQR` 函数中，当 `localStorage` 中找不到活码数据时，调用 `getContentFromServer(dynamicId)`。
- 如果从服务器成功获取到数据，则使用该数据进行页面渲染。
- 确保渲染逻辑能够正确处理服务器返回的数据结构（通常与本地结构一致）。

## 最终动作
- [ ] 验证批量生成活码是否成功调用服务器 API。
- [ ] 验证使用不同设备（或清除本地缓存后）扫码是否能正常显示内容。
