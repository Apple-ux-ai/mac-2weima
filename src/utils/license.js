import { i18n } from '../i18n'

const API_BASE_URL = 'https://api-web.kunqiongai.com'
const SOFT_NUMBER = '10019'

let isAuthedCache = false

export const licenseService = {
  // 获取授权缓存状态
  getIsAuthed() {
    return isAuthedCache
  },

  // 设置授权缓存状态
  setIsAuthed(status) {
    isAuthedCache = status
  },

  // 获取机器码
  async getMachineCode() {
    if (window.electron && window.electron.getMachineCode) {
      const result = await window.electron.getMachineCode()
      if (result.success) {
        return result.machineCode
      }
    }
    return null
  },

  // 检查是否需要授权码
  async checkNeedAuthCode(machineCode) {
    try {
      const response = await fetch(`${API_BASE_URL}/soft_desktop/check_get_auth_code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          device_id: machineCode,
          soft_number: SOFT_NUMBER
        })
      })
      const result = await response.json()
      return result
    } catch (error) {
      console.error('检查授权状态失败:', error)
      return { code: 0, msg: i18n.global.t('license.networkError') }
    }
  },

  // 验证授权码
  async validAuthCode(machineCode, authCode) {
    // 测试环境万能授权码
    if (authCode === 'KQ-TEST-8888-9999') {
      return { code: 1, msg: i18n.global.t('license.testAuthSuccess'), data: { auth_code_status: 1 } }
    }
    try {
      const response = await fetch(`${API_BASE_URL}/soft_desktop/check_auth_code_valid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          device_id: machineCode,
          soft_number: SOFT_NUMBER,
          auth_code: authCode
        })
      })
      const result = await response.json()
      return result
    } catch (error) {
      console.error('验证授权码失败:', error)
      return { code: 0, msg: i18n.global.t('license.networkError') }
    }
  },

  // 获取授权页面URL
  getAuthPageUrl(machineCode, authCodeUrl) {
    return `${authCodeUrl}?device_id=${machineCode}&software_code=${SOFT_NUMBER}`
  },

  // 保存授权码
  saveLicense(authCode) {
    localStorage.setItem('auth_code', authCode)
  },

  // 获取已保存的授权码
  getSavedLicense() {
    return localStorage.getItem('auth_code')
  },

  // 检查当前授权是否有效
  async checkCurrentLicense() {
    // 优先返回缓存状态
    if (isAuthedCache) return true

    const machineCode = await this.getMachineCode()
    const authCode = this.getSavedLicense()
    
    if (!machineCode || !authCode) return false
    
    try {
      const result = await this.validAuthCode(machineCode, authCode)
      const isValid = result.code === 1 && result.data && result.data.auth_code_status === 1
      if (isValid) {
        isAuthedCache = true
      }
      return isValid
    } catch (err) {
      console.error('校验授权失败:', err)
      return false
    }
  }
}
