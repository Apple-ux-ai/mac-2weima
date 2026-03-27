const contentRepository = require('../repository/contentRepository')

/**
 * 内容业务逻辑层
 */
class ContentService {
  /**
   * 保存内容
   * @param {object} contentData 
   */
  async saveContent(contentData) {
    const { id, ...data } = contentData
    if (!id) throw new Error('内容ID不能为空')
    return contentRepository.save(id, data)
  }

  /**
   * 获取内容
   * @param {string} id 
   */
  async getContent(id) {
    const content = contentRepository.findById(id)
    if (!content) throw new Error('内容未找到')
    return content
  }

  /**
   * 删除内容
   * @param {string} id 
   */
  async deleteContent(id) {
    const success = contentRepository.delete(id)
    if (!success) throw new Error('内容未找到')
    return true
  }
}

module.exports = new ContentService()
