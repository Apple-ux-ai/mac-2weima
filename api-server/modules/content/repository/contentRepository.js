const fs = require('fs')
const path = require('path')
const config = require('../../../config')

const DATA_DIR = path.join(__dirname, '../../..', config.dataDir)

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

/**
 * 内容数据访问层
 */
class ContentRepository {
  /**
   * 保存内容到文件
   * @param {string} id 
   * @param {object} data 
   */
  save(id, data) {
    const filePath = path.join(DATA_DIR, `${id}.json`)
    fs.writeFileSync(filePath, JSON.stringify({ id, ...data }, null, 2), 'utf8')
    return { id, ...data }
  }

  /**
   * 从文件获取内容
   * @param {string} id 
   */
  findById(id) {
    const filePath = path.join(DATA_DIR, `${id}.json`)
    if (!fs.existsSync(filePath)) return null
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  }

  /**
   * 删除内容文件
   * @param {string} id 
   */
  delete(id) {
    const filePath = path.join(DATA_DIR, `${id}.json`)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      return true
    }
    return false
  }
}

module.exports = new ContentRepository()
