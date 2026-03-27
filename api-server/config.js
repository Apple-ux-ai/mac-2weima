// API 服务器配置文件
// 你可以在这里修改服务器设置

module.exports = {
  // 服务器端口（如果环境变量 PORT 未设置，使用此端口）
  port: 3000,
  
  // 数据存储目录（相对于 api-server 目录）
  dataDir: 'data',
  
  // CORS 配置
  cors: {
    // 允许的源，设置为 true 表示允许所有源
    origin: true,
    // 或指定具体域名，例如：
    // origin: ['http://localhost:5173', 'http://localhost:3000']
  },
  
  // 请求体大小限制
  bodyLimit: '100mb',
  
  // 日志级别: 'debug', 'info', 'warn', 'error'
  logLevel: 'info'
}



















