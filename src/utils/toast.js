// 自定义弹窗工具 - 圆角设计
import { i18n } from '../i18n'

let toastContainer = null
let confirmContainer = null

const t = (key) => {
  try {
    const value = i18n.global.t(key)
    return value === key ? key : value
  } catch (error) {
    return key
  }
}

// 初始化弹窗容器
function initToastContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement('div')
    toastContainer.id = 'toast-container'
    toastContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
    `
    document.body.appendChild(toastContainer)
  }
  return toastContainer
}

function initConfirmContainer() {
  if (!confirmContainer) {
    confirmContainer = document.createElement('div')
    confirmContainer.id = 'confirm-container'
    confirmContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 10001;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
    `
    document.body.appendChild(confirmContainer)
  }
  return confirmContainer
}

// 显示提示弹窗（替代alert）
export function showToast(message, type = 'info', duration = 3000) {
  const container = initToastContainer()
  
  // 根据类型选择图标和颜色
  const typeConfig = {
    success: { icon: '✅', color: '#4CAF50' },
    error: { icon: '❌', color: '#f44336' },
    warning: { icon: '⚠️', color: '#FF9800' },
    info: { icon: 'ℹ️', color: '#2196F3' }
  }
  
  const config = typeConfig[type] || typeConfig.info
  
  // 创建弹窗元素
  const toast = document.createElement('div')
  toast.className = 'custom-toast'
  toast.style.cssText = `
    background: white;
    border-radius: 16px;
    padding: 24px 32px;
    min-width: 300px;
    max-width: 500px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    pointer-events: auto;
    animation: toastSlideUp 0.3s ease-out;
    position: relative;
  `
  
  // 添加动画样式
  if (!document.getElementById('toast-animations')) {
    const style = document.createElement('style')
    style.id = 'toast-animations'
    style.textContent = `
      @keyframes toastSlideUp {
        from {
          transform: translateY(20px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
      @keyframes toastSlideDown {
        from {
          transform: translateY(0);
          opacity: 1;
        }
        to {
          transform: translateY(20px);
          opacity: 0;
        }
      }
      .custom-toast {
        animation: toastSlideUp 0.3s ease-out;
      }
      .custom-toast.closing {
        animation: toastSlideDown 0.3s ease-out;
      }
    `
    document.head.appendChild(style)
  }
  
  // 图标
  const icon = document.createElement('div')
  icon.style.cssText = `
    font-size: 48px;
    line-height: 1;
    animation: scaleIn 0.3s ease-out 0.1s both;
  `
  icon.textContent = config.icon
  
  // 消息内容（支持换行）
  const messageDiv = document.createElement('div')
  messageDiv.style.cssText = `
    font-size: 16px;
    color: #333;
    text-align: center;
    line-height: 1.6;
    font-weight: 500;
    white-space: pre-line;
    word-break: break-word;
  `
  messageDiv.textContent = message
  
  // 按钮
  const button = document.createElement('button')
  button.textContent = t('toast.ok')
  button.style.cssText = `
    background: linear-gradient(135deg, ${config.color} 0%, ${config.color}dd 100%);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 12px 32px;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px ${config.color}40;
    min-width: 120px;
  `
  
  button.onmouseenter = () => {
    button.style.transform = 'translateY(-2px)'
    button.style.boxShadow = `0 6px 16px ${config.color}60`
  }
  
  button.onmouseleave = () => {
    button.style.transform = 'translateY(0)'
    button.style.boxShadow = `0 4px 12px ${config.color}40`
  }
  
  button.onclick = () => {
    closeToast(toast)
  }
  
  toast.appendChild(icon)
  toast.appendChild(messageDiv)
  toast.appendChild(button)
  container.appendChild(toast)
  
  // 添加图标缩放动画
  if (!document.getElementById('toast-icon-animation')) {
    const iconStyle = document.createElement('style')
    iconStyle.id = 'toast-icon-animation'
    iconStyle.textContent = `
      @keyframes scaleIn {
        from {
          transform: scale(0);
        }
        to {
          transform: scale(1);
        }
      }
    `
    document.head.appendChild(iconStyle)
  }
  
  // 自动关闭
  if (duration > 0) {
    setTimeout(() => {
      closeToast(toast)
    }, duration)
  }
  
  return toast
}

// 关闭提示弹窗
function closeToast(toast) {
  if (toast && toast.parentNode) {
    toast.classList.add('closing')
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast)
      }
    }, 300)
  }
}

// 显示确认弹窗（替代confirm）
export function showConfirm(message, title = t('toast.confirm')) {
  return new Promise((resolve) => {
    const container = initConfirmContainer()
    
    // 创建遮罩层
    const overlay = document.createElement('div')
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.4);
      animation: fadeIn 0.2s ease-out;
      display: flex;
      align-items: center;
      justify-content: center;
    `
    
    // 创建弹窗
    const confirm = document.createElement('div')
    confirm.className = 'custom-confirm'
    confirm.style.cssText = `
      background: white;
      border-radius: 16px;
      padding: 32px 40px;
      min-width: 360px;
      max-width: 500px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
      display: flex;
      flex-direction: column;
      gap: 24px;
      pointer-events: auto;
      animation: confirmSlideUp 0.3s ease-out;
      position: relative;
      z-index: 1;
    `
    
    // 添加动画样式
    if (!document.getElementById('confirm-animations')) {
      const style = document.createElement('style')
      style.id = 'confirm-animations'
      style.textContent = `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes confirmSlideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `
      document.head.appendChild(style)
    }
    
    // 标题
    const titleDiv = document.createElement('div')
    titleDiv.style.cssText = `
      font-size: 20px;
      font-weight: 600;
      color: #333;
      text-align: center;
    `
    titleDiv.textContent = title
    
    // 消息内容
    const messageDiv = document.createElement('div')
    messageDiv.style.cssText = `
      font-size: 16px;
      color: #666;
      text-align: center;
      line-height: 1.6;
      white-space: pre-line;
      word-break: break-word;
    `
    messageDiv.textContent = message
    
    // 按钮容器
    const buttonContainer = document.createElement('div')
    buttonContainer.style.cssText = `
      display: flex;
      gap: 12px;
      justify-content: center;
    `
    
    // 取消按钮
    const cancelBtn = document.createElement('button')
    cancelBtn.textContent = t('toast.cancel')
    cancelBtn.style.cssText = `
      background: #f5f5f5;
      color: #666;
      border: none;
      border-radius: 8px;
      padding: 12px 32px;
      font-size: 15px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      min-width: 120px;
    `
    
    cancelBtn.onmouseenter = () => {
      cancelBtn.style.background = '#e0e0e0'
      cancelBtn.style.transform = 'translateY(-2px)'
    }
    
    cancelBtn.onmouseleave = () => {
      cancelBtn.style.background = '#f5f5f5'
      cancelBtn.style.transform = 'translateY(0)'
    }
    
    cancelBtn.onclick = () => {
      closeConfirm(overlay, confirm)
      resolve(false)
    }
    
    // 确定按钮
    const confirmBtn = document.createElement('button')
    confirmBtn.textContent = t('toast.ok')
    confirmBtn.style.cssText = `
      background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      padding: 12px 32px;
      font-size: 15px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
      min-width: 120px;
    `
    
    confirmBtn.onmouseenter = () => {
      confirmBtn.style.background = 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)'
      confirmBtn.style.transform = 'translateY(-2px)'
      confirmBtn.style.boxShadow = '0 6px 16px rgba(33, 150, 243, 0.4)'
    }
    
    confirmBtn.onmouseleave = () => {
      confirmBtn.style.background = 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)'
      confirmBtn.style.transform = 'translateY(0)'
      confirmBtn.style.boxShadow = '0 4px 12px rgba(33, 150, 243, 0.3)'
    }
    
    confirmBtn.onclick = () => {
      closeConfirm(overlay, confirm)
      resolve(true)
    }
    
    buttonContainer.appendChild(cancelBtn)
    buttonContainer.appendChild(confirmBtn)
    
    confirm.appendChild(titleDiv)
    confirm.appendChild(messageDiv)
    confirm.appendChild(buttonContainer)
    
    overlay.appendChild(confirm)
    container.appendChild(overlay)
    // 确保容器可以接收点击事件
    container.style.pointerEvents = 'auto'
    
    // 点击遮罩层关闭
    overlay.onclick = (e) => {
      if (e.target === overlay) {
        closeConfirm(overlay, confirm)
        resolve(false)
      }
    }
  })
}

// 关闭确认弹窗
function closeConfirm(overlay, confirm) {
  if (overlay && overlay.parentNode) {
    overlay.style.animation = 'fadeOut 0.2s ease-out'
    confirm.style.animation = 'confirmSlideDown 0.3s ease-out'
    
    if (!document.getElementById('confirm-close-animations')) {
      const style = document.createElement('style')
      style.id = 'confirm-close-animations'
      style.textContent = `
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes confirmSlideDown {
          from {
            transform: translateY(0);
            opacity: 1;
          }
          to {
            transform: translateY(20px);
            opacity: 0;
          }
        }
      `
      document.head.appendChild(style)
    }
    
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay)
      }
      // 检查容器是否为空，如果为空则禁用点击事件
      if (confirmContainer && confirmContainer.children.length === 0) {
        confirmContainer.style.pointerEvents = 'none'
      }
    }, 300)
  }
}

// 全局替换原生alert和confirm
export function initToastReplacements() {
  // 替换全局alert
  if (typeof window !== 'undefined') {
    window.originalAlert = window.alert
    window.alert = function(message) {
      showToast(message, 'info')
    }
    
    // 替换全局confirm
    window.originalConfirm = window.confirm
    window.confirm = function(message) {
      return showConfirm(message, t('toast.confirm'))
    }
  }
}

// 导出工具对象
export const toast = {
  success: (message, duration) => showToast(message, 'success', duration),
  error: (message, duration) => showToast(message, 'error', duration),
  warning: (message, duration) => showToast(message, 'warning', duration),
  info: (message, duration) => showToast(message, 'info', duration)
}









