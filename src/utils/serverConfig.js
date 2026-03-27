// 服务器地址配置工具
// 用于获取正确的服务器地址，确保生成的二维码可以被其他设备访问

import { i18n } from '../i18n'

/**
 * 获取服务器基础URL
 * 优先级：手动配置 > 环境变量 > 自动检测 > 默认值
 */
export function getServerBaseUrl() {
  // 方式0: 检查是否是Electron打包后的file://协议环境
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol
    const isElectron = window.electron !== undefined
    
    // 如果是file://协议（Electron打包后），使用默认服务器地址
    if (protocol === 'file:' || isElectron) {
      // 优先使用手动配置的服务器地址
      const manualConfig = localStorage.getItem('serverBaseUrl')
      if (manualConfig) {
        console.log('[Electron] 使用手动配置的服务器地址:', manualConfig)
        return manualConfig
      }
      
      // 使用环境变量或默认服务器地址
      const viewerEnvUrl = import.meta.env.VITE_VIEWER_BASE_URL
      const serverEnvUrl = import.meta.env.VITE_SERVER_BASE_URL
      const defaultUrl = viewerEnvUrl || serverEnvUrl || 'http://111.229.158.50'
      console.log('[Electron] 使用默认服务器地址:', defaultUrl)
      return defaultUrl
    }
  }
  
  // 方式1: 从localStorage获取手动配置的地址（最高优先级）
  const manualConfig = localStorage.getItem('serverBaseUrl')
  if (manualConfig) {
    console.log('使用手动配置的服务器地址:', manualConfig)
    return manualConfig
  }

  // 方式2: 使用环境变量
  if (import.meta.env.VITE_VIEWER_BASE_URL || import.meta.env.VITE_SERVER_BASE_URL) {
    const viewerEnvUrl = import.meta.env.VITE_VIEWER_BASE_URL
    const serverEnvUrl = import.meta.env.VITE_SERVER_BASE_URL
    const envUrl = viewerEnvUrl || serverEnvUrl
    console.log('使用环境变量配置的服务器地址:', envUrl)
    return envUrl
  }

  // 方式3: 自动检测当前访问地址
  if (typeof window !== 'undefined') {
    const currentOrigin = window.location.origin
    
    // 如果是localhost或127.0.0.1，尝试获取局域网IP
    if (currentOrigin.includes('localhost') || currentOrigin.includes('127.0.0.1')) {
      // 在开发环境，尝试获取局域网IP
      // 注意：这需要服务器已经配置为监听所有接口（--host）
      const port = window.location.port || '5173'
      
      // 尝试从localStorage获取之前检测到的IP
      const cachedIP = localStorage.getItem('detectedServerIP')
      if (cachedIP) {
        const cachedUrl = `http://${cachedIP}:${port}`
        console.log('使用缓存的服务器IP地址:', cachedUrl)
        return cachedUrl
      }
      
      // 如果无法获取IP，返回当前地址（用户需要手动配置）
      console.warn('检测到localhost，建议手动配置服务器地址')
      return currentOrigin
    }
    
    // 如果是公网地址或局域网IP，直接使用
    console.log('使用当前访问地址:', currentOrigin)
    return currentOrigin
  }

  // 方式4: 默认值（需要手动修改）
  console.warn('使用默认服务器地址，建议手动配置')
  return 'http://111.229.158.50'
}

/**
 * 设置服务器基础URL（手动配置）
 */
export function setServerBaseUrl(url) {
  // 验证URL格式
  try {
    new URL(url)
    localStorage.setItem('serverBaseUrl', url)
    console.log('服务器地址已保存:', url)
    return true
  } catch (error) {
    console.error('无效的URL格式:', error)
    return false
  }
}

/**
 * 清除手动配置的服务器地址
 */
export function clearServerBaseUrl() {
  localStorage.removeItem('serverBaseUrl')
  console.log('已清除手动配置的服务器地址')
}

/**
 * 检测并返回可用的服务器地址列表
 * 返回格式: { current: '当前地址', localIP: '局域网IP', manual: '手动配置' }
 */
export async function detectServerAddresses() {
  const addresses = {
    current: window.location.origin,
    localIP: null,
    manual: localStorage.getItem('serverBaseUrl') || null
  }

  // 尝试获取局域网IP（仅在前端，通过WebRTC或其他方式）
  // 注意：由于浏览器安全限制，无法直接获取本机IP
  // 这里提供一个提示，让用户手动输入
  
  return addresses
}

/**
 * 获取服务器地址显示信息
 */
export function getServerAddressInfo() {
  const baseUrl = getServerBaseUrl()
  const isLocalhost = baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')
  
  return {
    url: baseUrl,
    isLocalhost,
    isConfigured: !!localStorage.getItem('serverBaseUrl'),
    warning: isLocalhost ? i18n.global.t('serverConfigExtra.localhostWarning') : null
  }
}




