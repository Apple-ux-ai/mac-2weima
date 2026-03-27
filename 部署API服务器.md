# 部署 API 服务器解决手机访问问题

## 问题说明

手机显示"文件未找到"的原因是：文件数据存储在浏览器的 localStorage 中，不同设备的浏览器无法共享数据。

## 解决方案

在服务器上部署一个简单的 API 服务器，将文件数据存储到服务器，这样所有设备都能访问。

## 部署步骤

### 第一步：在服务器上安装 API 服务器依赖

```bash
# 进入项目目录
cd /www/wwwroot/qrcode/2weima

# 进入 API 服务器目录
cd api-server

# 安装依赖
npm install
```

### 第二步：启动 API 服务器

#### 使用 PM2（推荐）

```bash
# 安装 PM2（如果还没安装）
npm install -g pm2

# 启动 API 服务器
pm2 start server.js --name qrcode-api

# 设置开机自启
pm2 startup
pm2 save
```

#### 验证服务器运行

```bash
# 查看运行状态
pm2 list

# 应该看到 qrcode-api 在运行

# 查看日志
pm2 logs qrcode-api
```

### 第三步：开放 3000 端口

```bash
# 开放端口
sudo ufw allow 3000
sudo ufw reload
```

**如果使用云服务器（阿里云、腾讯云等）：**
- 进入服务器控制台
- 找到"安全组"设置
- 添加入站规则：端口 3000，协议 TCP，授权对象 0.0.0.0/0

### 第四步：配置前端使用 API

```bash
# 进入项目目录
cd /www/wwwroot/qrcode/2weima

# 获取服务器IP
curl ifconfig.me

# 编辑环境变量文件
nano .env.production
```

添加以下内容（替换为你的服务器IP）：

```env
VITE_API_BASE_URL=http://你的服务器IP:3000
```

例如：
```env
VITE_API_BASE_URL=http://123.456.789.0:3000
```

保存文件（Ctrl+O, Enter, Ctrl+X）

### 第五步：重新构建项目

```bash
# 重新构建
npm run build

# 重启 Nginx
sudo systemctl restart nginx
```

### 第六步：测试

1. 访问网站：`http://你的服务器IP`
2. 生成一个文件二维码
3. 用手机扫描二维码
4. 应该能正常访问文件了！

## 验证 API 服务器

```bash
# 测试健康检查
curl http://你的服务器IP:3000/health

# 应该返回：{"status":"ok","timestamp":...}
```

## 常见问题

### 问题1：PM2 命令不存在

```bash
npm install -g pm2
```

### 问题2：端口被占用

```bash
# 检查端口占用
sudo netstat -tlnp | grep 3000

# 或者修改 server.js 中的端口号
```

### 问题3：API 服务器无法访问

1. 检查防火墙是否开放 3000 端口
2. 检查云服务器安全组规则
3. 检查 PM2 服务是否运行：`pm2 list`

### 问题4：手机还是显示文件未找到

1. 确认 API 服务器正在运行：`pm2 list`
2. 确认环境变量配置正确
3. 确认已重新构建项目：`npm run build`
4. 清除浏览器缓存后重试

## 数据存储位置

API 服务器数据存储在：`/www/wwwroot/qrcode/2weima/api-server/data/`

每个文件对应一个 JSON 文件。

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
```






















