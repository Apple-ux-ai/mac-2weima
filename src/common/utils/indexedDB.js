// IndexedDB 工具函数，用于存储大文件
// 迁移至 common/utils/indexedDB.js

const DB_NAME = 'QRCodeStorage'
const DB_VERSION = 1
const STORE_NAME = 'files'

// 打开数据库
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
  })
}

// 存储文件数据
export async function storeFile(id, fileData) {
  try {
    const db = await openDB()
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    
    return new Promise((resolve, reject) => {
      const request = store.put({
        id: id,
        data: fileData,
        timestamp: Date.now()
      })
      
      request.onsuccess = () => {
        console.log('✓ IndexedDB存储成功:', id)
        resolve(true)
      }
      
      request.onerror = () => {
        console.error('✗ IndexedDB存储失败:', request.error)
        reject(request.error)
      }
    })
  } catch (error) {
    console.error('IndexedDB操作失败:', error)
    throw error
  }
}

// 读取文件数据
export async function getFile(id) {
  try {
    const db = await openDB()
    const transaction = db.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    
    return new Promise((resolve, reject) => {
      const request = store.get(id)
      
      request.onsuccess = () => {
        if (request.result) {
          console.log('✓ IndexedDB读取成功:', id)
          resolve(request.result.data)
        } else {
          console.log('IndexedDB中未找到文件:', id)
          resolve(null)
        }
      }
      
      request.onerror = () => {
        console.error('✗ IndexedDB读取失败:', request.error)
        reject(request.error)
      }
    })
  } catch (error) {
    console.error('IndexedDB操作失败:', error)
    throw error
  }
}

// 删除文件数据
export async function deleteFile(id) {
  try {
    const db = await openDB()
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    
    return new Promise((resolve, reject) => {
      const request = store.delete(id)
      
      request.onsuccess = () => {
        console.log('✓ IndexedDB删除成功:', id)
        resolve(true)
      }
      
      request.onerror = () => {
        console.error('✗ IndexedDB删除失败:', request.error)
        reject(request.error)
      }
    })
  } catch (error) {
    console.error('IndexedDB操作失败:', error)
    throw error
  }
}

// 检查 IndexedDB 是否可用
export function isIndexedDBAvailable() {
  return 'indexedDB' in window && indexedDB !== null
}

// 获取所有存储的文件列表
export async function getAllFiles() {
  try {
    const db = await openDB()
    const transaction = db.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    
    return new Promise((resolve, reject) => {
      const request = store.getAll()
      
      request.onsuccess = () => {
        resolve(request.result || [])
      }
      
      request.onerror = () => {
        reject(request.error)
      }
    })
  } catch (error) {
    console.error('获取文件列表失败:', error)
    throw error
  }
}

// 获取存储统计信息
export async function getStorageStats() {
  try {
    const files = await getAllFiles()
    let totalSize = 0
    let fileCount = 0
    const now = Date.now()
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000)
    let oldFileCount = 0
    
    files.forEach(file => {
      if (file.data) {
        // 估算数据大小（JSON字符串长度）
        const dataStr = JSON.stringify(file.data)
        totalSize += new Blob([dataStr]).size
        fileCount++
        
        // 检查是否超过30天
        if (file.timestamp && file.timestamp < thirtyDaysAgo) {
          oldFileCount++
        }
      }
    })
    
    // 获取localStorage使用情况
    let localStorageSize = 0
    let localStorageCount = 0
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && !key.startsWith('_') && key !== 'serverBaseUrl' && key !== 'apiBaseUrl' && key !== 'detectedServerIP') {
          const value = localStorage.getItem(key)
          if (value) {
            localStorageSize += new Blob([value]).size
            localStorageCount++
          }
        }
      }
    } catch (e) {
      console.warn('无法计算localStorage大小:', e)
    }
    
    return {
      indexedDB: {
        fileCount,
        totalSize,
        oldFileCount,
        formattedSize: formatFileSize(totalSize)
      },
      localStorage: {
        itemCount: localStorageCount,
        totalSize: localStorageSize,
        formattedSize: formatFileSize(localStorageSize)
      },
      total: {
        fileCount: fileCount + localStorageCount,
        totalSize: totalSize + localStorageSize,
        formattedSize: formatFileSize(totalSize + localStorageSize)
      }
    }
  } catch (error) {
    console.error('获取存储统计失败:', error)
    return {
      indexedDB: { fileCount: 0, totalSize: 0, oldFileCount: 0, formattedSize: '0 B' },
      localStorage: { itemCount: 0, totalSize: 0, formattedSize: '0 B' },
      total: { fileCount: 0, totalSize: 0, formattedSize: '0 B' }
    }
  }
}

// 格式化文件大小
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

// 清理旧数据（删除30天前的数据）
export async function cleanOldFiles(days = 30) {
  try {
    const files = await getAllFiles()
    const now = Date.now()
    const cutoffTime = now - (days * 24 * 60 * 60 * 1000)
    
    let deletedCount = 0
    const deletePromises = []
    
    files.forEach(file => {
      if (file.timestamp && file.timestamp < cutoffTime) {
        deletePromises.push(deleteFile(file.id))
        deletedCount++
      }
    })
    
    await Promise.all(deletePromises)
    
    // 同时清理localStorage中的旧数据
    let localStorageDeleted = 0
    try {
      const keysToDelete = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && !key.startsWith('_') && key !== 'serverBaseUrl' && key !== 'apiBaseUrl' && key !== 'detectedServerIP') {
          try {
            const value = localStorage.getItem(key)
            if (value) {
              const data = JSON.parse(value)
              // 检查是否有时间戳且超过指定天数
              if (data.timestamp && data.timestamp < cutoffTime) {
                keysToDelete.push(key)
              }
            }
          } catch (e) {
            // 如果不是JSON格式，跳过
          }
        }
      }
      
      keysToDelete.forEach(key => {
        localStorage.removeItem(key)
        localStorageDeleted++
      })
    } catch (e) {
      console.warn('清理localStorage失败:', e)
    }
    
    return {
      indexedDBDeleted: deletedCount,
      localStorageDeleted,
      totalDeleted: deletedCount + localStorageDeleted
    }
  } catch (error) {
    console.error('清理旧文件失败:', error)
    throw error
  }
}

// 清理所有数据（危险操作）
export async function clearAllStorage() {
  try {
    // 清理IndexedDB
    const db = await openDB()
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    
    const clearPromise = new Promise((resolve, reject) => {
      const request = store.clear()
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
    
    await clearPromise
    
    // 清理localStorage（保留配置）
    const keysToKeep = ['serverBaseUrl', 'apiBaseUrl', 'detectedServerIP']
    const keysToDelete = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && !keysToKeep.includes(key)) {
        keysToDelete.push(key)
      }
    }
    
    keysToDelete.forEach(key => {
      localStorage.removeItem(key)
    })
    
    return {
      indexedDBCleared: true,
      localStorageCleared: keysToDelete.length,
      totalCleared: keysToDelete.length
    }
  } catch (error) {
    console.error('清理所有存储失败:', error)
    throw error
  }
}
