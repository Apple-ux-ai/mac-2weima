# 修复活码跨设备扫描失败计划

## 问题诊断
1. **API地址解析错误**：`src/utils/api.js` 和 `public/viewer.html` 中的 `getApiBaseUrl` 函数在处理包含端口号的 URL 时，错误地使用了 `hostname` 属性，导致生成的 API 请求地址丢失了端口号（如 `http://192.168.1.5:3000/api` 变成了 `http://192.168.1.5/api`）。
2. **同步逻辑失效**：由于 API 地址错误，生成二维码时的服务器健康检查失败，导致活码数据未同步到服务器。
3. **扫描端解析错误**：`viewer.html` 在自动检测 API 地址时也存在相同的端口丢失问题。

## 修复步骤

### 1. 修正 `src/utils/api.js`
- 修改 `getApiBaseUrl` 函数中从 `serverBaseUrl` 推导 `apiUrl` 的逻辑。
- 将 `serverUrl.hostname` 替换为 `serverUrl.host`，以保留端口号。

### 2. 修正 `public/viewer.html`
- 修改 `getApiBaseUrl` 函数中的自动检测逻辑。
- 将 `window.location.hostname` 替换为 `window.location.host`，以确保在非标准端口下也能正确访问 API。
- 优化错误提示信息，当获取失败时显示更具体的 API 地址以便排查。

### 3. 验证与测试
- 在开发环境下模拟非 80 端口配置，验证 API 地址生成是否正确。
- 检查 `checkApiServer` 是否能正确识别带端口的服务器。
- 验证活码生成后是否成功调用 `saveContentToServer`。

## 实施检查清单
1. [ ] 修改 `src/utils/api.js` 中的 `getApiBaseUrl`
2. [ ] 修改 `public/viewer.html` 中的 `getApiBaseUrl`
3. [ ] 检查并更新 `ISSUES.md`
4. [ ] 提醒用户重新打包并测试
