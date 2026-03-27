# 二维码生成器

一个功能强大的二维码生成工具，支持Web端和桌面端（Electron）。

## 功能特性

✨ **多种类型支持**
- 📝 文本/网址二维码
- 📁 文件二维码
- 🖼️ 图片二维码
- 🎬 音视频二维码
- 📦 批量生成二维码

🎨 **自定义选项**
- 自定义尺寸（200px - 800px）
- 自定义前景色和背景色
- 可调节容错率（L/M/Q/H）

💾 **多种导出方式**
- 保存为PNG图片
- 复制到剪贴板
- 直接打印

🖥️ **双端支持**
- Web版：浏览器直接访问
- 桌面版：独立的Electron应用

## 技术栈

- **前端框架**: Vue 3
- **构建工具**: Vite
- **桌面端**: Electron
- **二维码生成**: qrcode.js

## 安装依赖

\`\`\`bash
npm install
\`\`\`

## 开发运行

### Web端开发
\`\`\`bash
npm run dev
\`\`\`
访问 http://localhost:5173

### 桌面端开发
\`\`\`bash
npm run electron:dev
\`\`\`

### 单独运行Electron（需要先运行Web端）
\`\`\`bash
# 终端1
npm run dev

# 终端2
npm run electron
\`\`\`

## 构建打包

### Web端构建
\`\`\`bash
npm run build
\`\`\`
构建产物在 `dist/` 目录

### 桌面端打包
\`\`\`bash
npm run electron:build
\`\`\`
安装包在 `dist-electron/` 目录

## 项目结构

\`\`\`
2weima/
├── electron/                # Electron相关
│   ├── main.js             # 主进程
│   └── preload.js          # 预加载脚本
├── src/                     # 前端源码
│   ├── components/         # 组件
│   │   ├── TopNav.vue      # 顶部导航
│   │   ├── QRGenerator.vue # 二维码生成器
│   │   └── QRPreview.vue   # 预览面板
│   ├── App.vue             # 主应用
│   ├── main.js             # 入口文件
│   └── style.css           # 全局样式
├── public/                  # 静态资源
├── index.html              # HTML模板
├── package.json            # 项目配置
├── vite.config.js          # Vite配置
└── README.md               # 说明文档
\`\`\`

## 使用说明

### 1. 文本/网址二维码
- 在输入框中输入文本或网址
- 调整二维码样式（可选）
- 点击"生成二维码"按钮
- 扫描或保存生成的二维码

### 2. 文件二维码
- 切换到"文件"标签
- 点击上传区域选择文件
- 调整样式后生成二维码
- 文件内容会被编码到二维码中

### 3. 图片二维码
- 切换到"图片"标签
- 选择要生成的图片文件
- 生成后可扫码查看图片

### 4. 音视频二维码
- 切换到"音视频"标签
- 输入音视频链接地址
- 生成二维码供他人扫描观看

### 5. 批量生成
- 切换到"批量二维码"标签
- 每行输入一个内容
- 将为每行生成独立二维码

## Web端部署

### 静态部署
构建后将 `dist/` 目录部署到任何静态服务器即可。

### Vercel部署
\`\`\`bash
npm install -g vercel
vercel --prod
\`\`\`

### Nginx部署
\`\`\`nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /path/to/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
\`\`\`

## 常见问题

### Q: 如何修改默认端口？
A: 修改 `vite.config.js` 中的 `server.port` 配置。

### Q: 桌面端无法保存文件？
A: 确保Electron的文件权限设置正确，检查 `electron/main.js` 中的保存逻辑。

### Q: 生成的二维码无法扫描？
A: 尝试增加容错率或减少内容长度，确保二维码清晰可见。

### Q: 如何添加图标？
A: 将图标文件放在 `public/` 目录下，并修改 `electron/main.js` 中的icon路径。

## 开发注意事项

1. Electron主进程使用CommonJS，前端代码使用ES Module
2. 开发时Electron会加载 http://localhost:5173
3. 生产环境Electron会加载打包后的 `dist/index.html`
4. Web端和Electron端通过 `window.electron` 判断环境

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request！

































