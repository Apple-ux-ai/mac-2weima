// 更新配置工具
// 用于管理更新服务器地址和软件标识符

/**
 * 获取更新服务器地址
 * 优先级：环境变量 > 默认值
 */
export function getUpdateServerUrl() {
  // 从环境变量获取（如果设置了）
  const envUrl = import.meta.env.VITE_UPDATE_SERVER_URL
  if (envUrl) {
    return envUrl
  }
  
  // 默认地址
  return 'http://software.kunqiongai.com:8000'
}

/**
 * 获取软件标识符
 */
export function getSoftwareId() {
  // 从环境变量获取（如果设置了）
  const envId = import.meta.env.VITE_SOFTWARE_ID
  if (envId) {
    return envId
  }
  
  // 默认标识符
  return '10008'
}

/**
 * 更新配置对象
 */
export const updateConfig = {
  serverUrl: getUpdateServerUrl(),
  softwareId: getSoftwareId(),
  
  // 更新策略
  checkOnStartup: true,      // 启动时检查
  mandatoryUpdate: true,     // 强制更新
  
  // 超时设置（毫秒）
  checkTimeout: 10000,       // 检查更新超时 10秒
  downloadTimeout: 300000,   // 下载超时 5分钟
  
  // 重试设置
  maxRetries: 3,             // 最大重试次数
  retryDelay: 2000           // 重试延迟（毫秒）
}
