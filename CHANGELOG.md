# 更新日志 (CHANGELOG.md)

## [1.1.3] - 2026-02-09

### 新增
- **反馈问题**: 顶部导航栏新增“反馈问题”按钮，点击后跳转至外部浏览器进行反馈。
- **接口对接**: 严格按照接口文档对接了 `get_feedback_url` 接口。

### 优化
- **代码规范**: 为关键文件添加了标准头部注释，并增加了 `TODO-Guardian` 扩展点。

## [1.0.0] - 2026-01-20

### 修复
- **活码加载**: 修复了扫码端由于端口硬编码导致的“活码未找到”错误。增加了 80/3000 端口自动降级机制。
- **静态码布局**: 修复了 [BatchQRGenerator.vue](file:///e:/360MoveData/Users/win10/Desktop/2weima/src/components/BatchQRGenerator.vue) 中文字与二维码重叠的问题。
- **API 推导**: 优化了 `api.js`，在 80 端口环境下不再强制推导 3000 端口。

### 增强
- **扫码端缓存**: 在 `viewer.html` 中增加了 IndexedDB 缓存机制，提升二次访问速度。
- **打包配置**: 统一了打包输出路径为 `dist-package-new3`。
