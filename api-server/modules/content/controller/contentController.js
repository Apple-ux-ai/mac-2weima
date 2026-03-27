const contentService = require('../service/contentService')

/**
 * 内容控制器层 - 处理路由请求
 */
class ContentController {
  /**
   * 保存内容
   */
  async save(req, res) {
    try {
      const result = await contentService.saveContent(req.body)
      console.log(`✓ [Modular] 保存内容: ${result.id}`)
      res.json({ success: true, id: result.id, message: '内容保存成功' })
    } catch (error) {
      console.error('保存失败:', error)
      res.status(error.message === '内容ID不能为空' ? 400 : 500).json({ 
        success: false, 
        message: error.message 
      })
    }
  }

  /**
   * 获取内容
   */
  async get(req, res) {
    try {
      const data = await contentService.getContent(req.params.id)
      console.log(`✓ [Modular] 获取内容: ${req.params.id}`)
      res.json({ success: true, data })
    } catch (error) {
      console.error('获取失败:', error)
      res.status(error.message === '内容未找到' ? 404 : 500).json({ 
        success: false, 
        message: error.message 
      })
    }
  }

  /**
   * 删除内容
   */
  async delete(req, res) {
    try {
      await contentService.deleteContent(req.params.id)
      console.log(`✓ [Modular] 删除内容: ${req.params.id}`)
      res.json({ success: true, message: '内容已删除' })
    } catch (error) {
      console.error('删除失败:', error)
      res.status(error.message === '内容未找到' ? 404 : 500).json({ 
        success: false, 
        message: error.message 
      })
    }
  }
}

module.exports = new ContentController()
