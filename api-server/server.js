const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')
const config = require('./config')

const app = express()
const PORT = process.env.PORT || config.port
const VIEWER_HTML_PATH = path.join(__dirname, '..', 'public', 'viewer.html')

// 数据存储目录
const DATA_DIR = path.join(__dirname, config.dataDir)
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

// 模块化路由加载
const contentModule = require('./modules/content')

// 中间件
app.use(cors(config.cors))
app.use(express.json({ limit: config.bodyLimit })) // 支持大文件
app.use(express.urlencoded({ extended: true, limit: config.bodyLimit }))

// 注册模块路由
app.use('/api/content', contentModule.routes)

app.get('/viewer.html', (req, res) => {
  res.sendFile(VIEWER_HTML_PATH)
})

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() })
})

// 启动服务器
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('')
  console.log('========================================')
  console.log('  API 服务器启动成功！')
  console.log('========================================')
  console.log(`  本地访问: http://localhost:${PORT}`)
  console.log(`  网络访问: http://0.0.0.0:${PORT}`)
  console.log(`  数据存储: ${DATA_DIR}`)
  console.log('========================================')
  console.log('  按 Ctrl+C 停止服务器')
  console.log('')
})

// 错误处理
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`\n❌ 错误: 端口 ${PORT} 已被占用！`)
    console.error(`   请尝试以下解决方案:`)
    console.error(`   1. 关闭占用该端口的程序`)
    console.error(`   2. 修改环境变量 PORT 使用其他端口`)
    console.error(`   3. 或修改 server.js 中的端口号\n`)
  } else {
    console.error('\n❌ 服务器启动失败:', error.message)
    console.error('   错误详情:', error)
    console.error('')
  }
  process.exit(1)
})



