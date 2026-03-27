# 公网API配置说明

## 环境变量配置

### 开发环境 (.env.development)

在项目根目录创建 `.env.development` 文件：

```env
# 开发环境配置
# 公网API地址（开发时可以使用本地服务器）
VITE_API_BASE_URL=http://localhost:3000

# Viewer页面地址（如果和API不在同一域名）
# VITE_VIEWER_BASE_URL=http://localhost:5173
```

### 生产环境 (.env.production)

在项目根目录创建 `.env.production` 文件：

```env
# 生产环境配置
# 公网API地址 - 请修改为你的实际API地址
VITE_API_BASE_URL=https://your-api-domain.com

# Viewer页面地址（如果和API不在同一域名，例如使用CDN）
# VITE_VIEWER_BASE_URL=https://your-cdn-domain.com
```

## 配置步骤

### 1. 修改API地址

编辑 `.env.production` 文件，将 `VITE_API_BASE_URL` 修改为你的公网API地址：

```env
VITE_API_BASE_URL=https://api.example.com
```

### 2. 配置Viewer页面（可选）

如果 viewer 页面部署在CDN或其他域名，设置 `VITE_VIEWER_BASE_URL`：

```env
VITE_VIEWER_BASE_URL=https://cdn.example.com
```

### 3. 在 advanced-viewer.html 中配置（可选）

如果需要固定API地址，可以编辑 `public/advanced-viewer.html`，在 `<head>` 部分取消注释：

```html
<script>
  // 配置公网API地址（可选）
  window.API_BASE_URL = 'https://your-api-domain.com'
</script>
```

### 4. 重新构建

修改环境变量后，需要重新构建前端：

```bash
npm run build
```

## API服务器要求

你的公网API服务器需要提供以下接口：

### 1. 保存内容接口

**POST** `/api/content`

请求体：
```json
{
  "id": "内容ID",
  "title": "标题",
  "html": "HTML内容",
  "content": [],
  "type": "advanced",
  "timestamp": 1234567890
}
```

响应：
```json
{
  "success": true,
  "id": "内容ID",
  "message": "内容保存成功"
}
```

### 2. 获取内容接口

**GET** `/api/content/:id`

响应：
```json
{
  "success": true,
  "data": {
    "id": "内容ID",
    "title": "标题",
    "html": "HTML内容",
    "content": [],
    "type": "advanced",
    "timestamp": 1234567890
  }
}
```

### 3. 健康检查接口（可选）

**GET** `/health`

响应：
```json
{
  "status": "ok",
  "timestamp": 1234567890
}
```

## CORS配置

确保API服务器允许跨域请求，例如使用 Express：

```javascript
const cors = require('cors')
app.use(cors())
```

## 测试

### 1. 测试API连接

在浏览器控制台测试：

```javascript
// 测试保存
fetch('https://your-api-domain.com/api/content', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: 'test123',
    title: '测试',
    html: '<p>测试内容</p>'
  })
}).then(r => r.json()).then(console.log)

// 测试获取
fetch('https://your-api-domain.com/api/content/test123')
  .then(r => r.json())
  .then(console.log)
```

### 2. 测试完整流程

1. 在前端生成二维码
2. 用手机扫码
3. 确认能正常显示内容

## 注意事项

1. **HTTPS**: 生产环境必须使用 HTTPS
2. **CORS**: 确保API服务器配置了正确的CORS策略
3. **错误处理**: 如果API失败，会自动降级到本地存储
4. **安全性**: 建议添加API密钥或认证机制























