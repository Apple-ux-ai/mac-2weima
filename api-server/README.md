# API 服务器部署说明

## 快速部署

### 1. 安装依赖

```bash
cd api-server
npm install
```

### 2. 启动服务器

#### 方式1：使用 PM2（推荐，后台运行）

```bash
# 安装 PM2
npm install -g pm2

# 启动服务器
pm2 start server.js --name qrcode-api

# 设置开机自启
pm2 startup
pm2 save

# 查看状态
pm2 list
pm2 logs qrcode-api
```

#### 方式2：直接运行（测试用）

```bash
node server.js
```

### 3. 开放端口

```bash
# 开放 3000 端口
sudo ufw allow 3000

# 如果使用云服务器，还需要在控制台安全组中开放 3000 端口
```

### 4. 配置前端

在项目根目录创建或编辑 `.env.production` 文件：

```env
VITE_API_BASE_URL=http://你的服务器IP:3000
```

例如：
```env
VITE_API_BASE_URL=http://123.456.789.0:3000
```

然后重新构建：

```bash
npm run build
```

## 数据存储

数据存储在 `api-server/data/` 目录下，每个文件对应一个 JSON 文件。

## 管理命令

```bash
# 查看运行状态
pm2 list

# 查看日志
pm2 logs qrcode-api

# 重启服务
pm2 restart qrcode-api

# 停止服务
pm2 stop qrcode-api

# 删除服务
pm2 delete qrcode-api
```

## 测试 API

```bash
# 健康检查
curl http://你的服务器IP:3000/health

# 应该返回：{"status":"ok","timestamp":...}
```






















