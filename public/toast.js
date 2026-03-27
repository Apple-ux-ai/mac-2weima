// 自定义弹窗工具 - 圆角设计（用于HTML文件）
(function() {
  'use strict'
  
  let toastContainer = null
  let confirmContainer = null
  const t = (key, fallback) => {
    const value = window.PublicI18n?.t?.(key)
    return value && value !== key ? value : fallback
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
      `
      document.body.appendChild(confirmContainer)
    }
    return confirmContainer
  }

  // 添加动画样式
  function addToastStyles() {
    if (document.getElementById('toast-styles')) return
    
    const style = document.createElement('style')
    style.id = 'toast-styles'
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
      @keyframes scaleIn {
        from {
          transform: scale(0);
        }
        to {
          transform: scale(1);
        }
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
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
      .custom-toast {
        animation: toastSlideUp 0.3s ease-out;
      }
      .custom-toast.closing {
        animation: toastSlideDown 0.3s ease-out;
      }
    `
    document.head.appendChild(style)
  }

  // 显示提示弹窗（替代alert）
  function showToast(message, type = 'info', duration = 3000) {
    addToastStyles()
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
      position: relative;
    `
    
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
    button.textContent = t('common.ok', '确定')
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
    
    function closeToast() {
      toast.classList.add('closing')
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast)
        }
      }, 300)
    }
    
    button.onclick = closeToast
    
    toast.appendChild(icon)
    toast.appendChild(messageDiv)
    toast.appendChild(button)
    container.appendChild(toast)
    
    // 自动关闭
    if (duration > 0) {
      setTimeout(closeToast, duration)
    }
  }

  // 显示确认弹窗（替代confirm）
  function showConfirm(message, title = t('toast.confirm', '确认')) {
    return new Promise((resolve) => {
      addToastStyles()
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
      cancelBtn.textContent = t('toast.cancel', '取消')
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
      
      // 确定按钮
      const confirmBtn = document.createElement('button')
      confirmBtn.textContent = t('toast.ok', '确定')
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
      
      function closeConfirm() {
        overlay.style.animation = 'fadeOut 0.2s ease-out'
        confirm.style.animation = 'confirmSlideDown 0.3s ease-out'
        setTimeout(() => {
          if (overlay.parentNode) {
            overlay.parentNode.removeChild(overlay)
          }
        }, 300)
      }
      
      cancelBtn.onclick = () => {
        closeConfirm()
        resolve(false)
      }
      
      confirmBtn.onclick = () => {
        closeConfirm()
        resolve(true)
      }
      
      buttonContainer.appendChild(cancelBtn)
      buttonContainer.appendChild(confirmBtn)
      
      confirm.appendChild(titleDiv)
      confirm.appendChild(messageDiv)
      confirm.appendChild(buttonContainer)
      
      overlay.appendChild(confirm)
      container.appendChild(overlay)
      
      // 点击遮罩层关闭
      overlay.onclick = (e) => {
        if (e.target === overlay) {
          closeConfirm()
          resolve(false)
        }
      }
    })
  }

  // 替换原生alert和confirm
  window.originalAlert = window.alert
  window.alert = function(message) {
    showToast(message, 'info')
  }
  
  window.originalConfirm = window.confirm
  window.confirm = function(message) {
    return showConfirm(message, t('toast.confirm', '确认'))
  }
  
  // 导出函数供外部使用
  window.showToast = showToast
  window.showConfirm = showConfirm
})()













