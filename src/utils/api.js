/**
 * 功能：API 接口封装层
 * 作者：FullStack-Guardian
 * 更新时间：2026-02-09
 */

import { i18n } from '../i18n'

// API 配置 - 公网API地址
// 优先级：环境变量 > 手动配置的API地址 > 从serverBaseUrl推导 > 当前域名+端口3000 > 默认值
// 如果环境变量未设置，会尝试使用当前域名+端口3000（API服务器默认在3000端口）
export const getApiBaseUrl = () => {
  console.log('[getApiBaseUrl] 开始获取API地址...')

  const defaultApiUrl = 'http://111.229.158.50/api'
  
  // 方式0: 检查当前环境
  if (typeof window !== 'undefined') {
    const currentOrigin = window.location.origin
    const hostname = window.location.hostname
    const protocol = window.location.protocol
    console.log('[getApiBaseUrl] 当前环境 - origin:', currentOrigin, 'hostname:', hostname, 'protocol:', protocol)
    
    // 如果是file://协议（Electron打包后），优先使用环境变量或默认服务器地址
    if (protocol === 'file:') {
      // 优先使用环境变量
      if (import.meta.env.VITE_API_BASE_URL && !import.meta.env.VITE_API_BASE_URL.includes('localhost')) {
        console.log('[getApiBaseUrl] ✓ Electron环境，使用环境变量:', import.meta.env.VITE_API_BASE_URL)
        return import.meta.env.VITE_API_BASE_URL
      }
      // 否则使用默认服务器地址
      console.log('[getApiBaseUrl] ✓ Electron环境，使用默认服务器地址:', defaultApiUrl)
      return defaultApiUrl
    }
    
    // 如果是localhost或127.0.0.1，直接使用服务器地址（忽略环境变量和localStorage中的旧配置）
    if (currentOrigin.includes('localhost') || currentOrigin.includes('127.0.0.1')) {
      console.log('[getApiBaseUrl] ✓ 检测到localhost环境，强制使用服务器地址（忽略环境变量）:', defaultApiUrl)
      return defaultApiUrl
    }
  }
  
  // 方式1: 使用环境变量（推荐，但仅在非localhost环境）
  if (import.meta.env.VITE_API_BASE_URL) {
    const envUrl = import.meta.env.VITE_API_BASE_URL
    // 如果环境变量指向localhost，也忽略它
    if (!envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
      console.log('[getApiBaseUrl] ✓ 使用环境变量:', envUrl)
      return envUrl
    } else {
      console.log('[getApiBaseUrl] ⚠ 环境变量指向localhost，忽略:', envUrl)
    }
  }
  
  // 方式2: 检查当前环境（非localhost情况）
  if (typeof window !== 'undefined') {
    const currentOrigin = window.location.origin
    const hostname = window.location.hostname
    
    // 方式2.5: 从localStorage获取手动配置的API地址（仅在非localhost环境）
    const manualApiUrl = localStorage.getItem('apiBaseUrl')
    console.log('[getApiBaseUrl] localStorage中的apiBaseUrl:', manualApiUrl)
    if (manualApiUrl && !manualApiUrl.includes('localhost') && !manualApiUrl.includes('127.0.0.1')) {
      console.log('[getApiBaseUrl] ✓ 使用手动配置的API地址:', manualApiUrl)
      return manualApiUrl
    }
    
    // 方式2.6: 从serverBaseUrl推导API地址（如果用户配置了前端地址，自动推导API地址）
    const serverBaseUrl = localStorage.getItem('serverBaseUrl')
    console.log('[getApiBaseUrl] localStorage中的serverBaseUrl:', serverBaseUrl)
    if (serverBaseUrl) {
      try {
        const serverUrl = new URL(serverBaseUrl)
        const protocol = serverUrl.protocol || 'http:'
        const normalizedProtocol = protocol === 'https:' ? 'https:' : 'http:'
        const isDefaultPort = !serverUrl.port || serverUrl.port === '80' || serverUrl.port === '443'

        if (isDefaultPort) {
          // 如果是默认端口，API地址也使用默认端口（通过Nginx代理）
          const apiUrl = `${normalizedProtocol}//${serverUrl.hostname}/api`
          console.log('[getApiBaseUrl] ✓ serverBaseUrl为默认端口，推导API(使用默认端口):', serverBaseUrl, '->', apiUrl)
          return apiUrl
        }

        const apiUrl = `${normalizedProtocol}//${serverUrl.host}/api`
        console.log('[getApiBaseUrl] ✓ 从serverBaseUrl推导API地址:', serverBaseUrl, '->', apiUrl)
        return apiUrl
      } catch (e) {
        console.warn('[getApiBaseUrl] 解析serverBaseUrl失败:', e)
      }
    }
    
    // 如果是公网地址或局域网IP，使用/api路径（通过Nginx代理）
    if (hostname && !hostname.includes('localhost') && !hostname.includes('127.0.0.1')) {
      const apiUrl = `http://${window.location.host}/api`
      console.log('[getApiBaseUrl] ✓ 自动检测API地址:', apiUrl)
      return apiUrl
    }
  }
  
  // 方式4: 默认值
  console.log('[getApiBaseUrl] ✓ 使用默认值:', defaultApiUrl)
  return defaultApiUrl
}

const API_BASE_URL = getApiBaseUrl()

// 如果需要在代码中直接配置，取消下面的注释并修改
// const API_BASE_URL = 'https://your-api-domain.com'

/**
 * 保存内容到公网API服务器
 * 支持任意类型的数据（文件、图片、音视频等）
 */
export async function saveContentToServer(id, data) {
  const apiBaseUrl = getApiBaseUrl()
  console.log('保存到服务器，API地址:', apiBaseUrl, '文件ID:', id)
  
  try {
    // 检查数据大小（JSON序列化后）
    const dataSize = JSON.stringify({ id, ...data }).length
    const sizeInMB = (dataSize / (1024 * 1024)).toFixed(2)
    console.log('数据大小:', sizeInMB, 'MB')
    
    if (dataSize > 100 * 1024 * 1024) {
      throw new Error(i18n.global.t('api.fileTooLarge', { size: sizeInMB }))
    }
    
    // 确保apiBaseUrl已经包含/api路径，所以直接使用/content
    const endpoint = apiBaseUrl.endsWith('/api') ? `${apiBaseUrl}/content` : `${apiBaseUrl}/api/content`
    console.log('[saveContentToServer] 请求URL:', endpoint)
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id,
        ...data, // 保存所有数据字段
        timestamp: data.timestamp || Date.now()
      })
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('服务器响应错误:', response.status, errorText)
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
    }
    
    const result = await response.json()
    
    if (result.success) {
      console.log('✓ 文件已成功保存到服务器:', id)
      // 返回完整的保存信息，包括服务器返回的ID
      return { success: true, id: result.id || id, message: result.message || i18n.global.t('api.saveSuccess') }
    } else {
      throw new Error(result.message || i18n.global.t('api.saveFail'))
    }
  } catch (error) {
    console.error('保存内容到服务器失败:', error)
    // 提供更详细的错误信息
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.message.includes(i18n.global.t('api.requestTimeout'))) {
      const apiBaseUrl = getApiBaseUrl()
      throw new Error(i18n.global.t('api.cannotConnectApiServer', { url: apiBaseUrl }))
    }
    throw error
  }
}

/**
 * 从公网API服务器获取内容
 */
export async function getContentFromServer(id) {
  const apiBaseUrl = getApiBaseUrl()
  console.log('从服务器获取，API地址:', apiBaseUrl, '文件ID:', id)
  
  try {
    // 确保apiBaseUrl已经包含/api路径，所以直接使用/content
    const endpoint = apiBaseUrl.endsWith('/api') ? `${apiBaseUrl}/content/${id}` : `${apiBaseUrl}/api/content/${id}`
    console.log('[getContentFromServer] 请求URL:', endpoint)
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log('服务器返回404，文件未找到:', id)
        return null
      }
      const errorText = await response.text()
      console.error('服务器响应错误:', response.status, errorText)
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
    }
    
    const result = await response.json()
    
    if (result.success) {
      console.log('✓ 从服务器获取文件成功:', id)
      return result.data
    } else {
      console.log('服务器返回失败:', result.message)
      return null
    }
  } catch (error) {
    console.warn('从服务器获取内容失败:', error.message)
    // 网络错误不抛出异常，返回null让调用者降级到本地存储
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      console.warn('网络错误，将尝试从本地存储获取')
      return null
    }
    return null
  }
}

export async function deleteContentFromServer(id) {
  const apiBaseUrl = getApiBaseUrl()
  console.log('从服务器删除，API地址:', apiBaseUrl, '文件ID:', id)
  try {
    const endpoint = apiBaseUrl.endsWith('/api') ? `${apiBaseUrl}/content/${id}` : `${apiBaseUrl}/api/content/${id}`
    console.log('[deleteContentFromServer] 请求URL:', endpoint)
    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      if (response.status === 404) {
        console.log('服务器返回404，内容不存在:', id)
        return { success: true, id, message: i18n.global.t('api.contentNotExistDeleted') }
      }
      const errorText = await response.text()
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
    }

    const result = await response.json()
    if (result.success) {
      return { success: true, id, message: result.message || i18n.global.t('api.deleteSuccess') }
    }
    throw new Error(result.message || i18n.global.t('api.deleteFail'))
  } catch (error) {
    console.warn('从服务器删除内容失败:', error.message)
    return { success: false, id, message: error.message }
  }
}

/**
 * 获取广告位信息
 * @param {string} softNumber 软件编号
 * @param {string} advPosition 广告位置
 */
export async function getAdvertisement(softNumber = '10019', advPosition = 'adv_position_01') {
  try {
    const response = await fetch('https://api-web.kunqiongai.com/soft_desktop/get_adv', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        soft_number: softNumber,
        adv_position: advPosition
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    if (result.code === 1 && result.data && result.data.length > 0) {
      // 返回整个列表以支持轮播，如果只需要一个则由调用者处理
      return result.data
    }
    return []
  } catch (error) {
    console.error('获取广告失败:', error)
    return []
  }
}

/**
 * 获取需求定制页面链接
 * 参考鲲穹软件集接口定义
 */
export async function getCustomUrl() {
  try {
    const response = await fetch('https://api-web.kunqiongai.com/soft_desktop/get_custom_url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    const result = await response.json()
    if (result.code === 1 && result.data && result.data.url) {
      return result.data.url
    }
    return 'http://111.229.158.50:1388/link' // 兜底地址
  } catch (error) {
    console.error('获取定制链接失败:', error)
    return 'http://111.229.158.50:1388/link'
  }
}

/**
 * 获取软件问题反馈页面链接
 * 参考鲲穹软件集接口定义
 */
export async function getFeedbackUrl() {
  try {
    const response = await fetch('https://api-web.kunqiongai.com/soft_desktop/get_feedback_url', {
      method: 'POST'
    })
    const result = await response.json()
    if (result.code === 1 && result.data && result.data.url) {
      return result.data.url
    }
    // TODO-Guardian: 未来可根据不同错误码返回更具体的提示
    return 'https://www.kunqiongai.com/feedback?soft_number=' // 兜底地址
  } catch (error) {
    console.error('获取反馈链接失败:', error)
    return 'https://www.kunqiongai.com/feedback?soft_number='
  }
}

/**
 * 检查API服务器是否可用
 */
export async function checkApiServer() {
  const apiBaseUrl = getApiBaseUrl()
  console.log('检查API服务器，地址:', apiBaseUrl)
  
  try {
    // 使用Promise.race实现超时
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error(i18n.global.t('api.requestTimeout'))), 5000)
    })
    
    // 健康检查接口不通过/api路径，直接访问/health
    const healthUrl = apiBaseUrl.replace('/api', '') + '/health'
    const fetchPromise = fetch(healthUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    const response = await Promise.race([fetchPromise, timeoutPromise])
    const isOk = response.ok
    console.log('API服务器检查结果:', isOk ? '✓ 可用' : '✗ 不可用', apiBaseUrl, '状态码:', response.status)
    return isOk
  } catch (error) {
    console.error('API服务器检查失败:', apiBaseUrl, '错误:', error.message)
    console.error('错误类型:', error.name)
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      console.error('网络错误，可能原因：')
      console.error('1. API服务器未运行')
      console.error('2. API地址不正确（应该是 ' + apiBaseUrl + '）')
      console.error('3. CORS跨域问题')
      console.error('4. 防火墙阻止连接')
    }
    return false
  }
}
