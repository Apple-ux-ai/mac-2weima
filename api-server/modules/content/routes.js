const express = require('express')
const router = express.Router()
const contentController = require('./controller/contentController')

// 定义内容模块路由
router.post('/', contentController.save)
router.get('/:id', contentController.get)
router.delete('/:id', contentController.delete)

module.exports = router
