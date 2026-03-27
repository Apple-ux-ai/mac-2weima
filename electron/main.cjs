const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron')
const path = require('path')
const fs = require('fs')
const os = require('os')
const { execSync, spawn } = require('child_process')
const crypto = require('crypto')

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

// 获取机器码逻辑
function getMachineCode() {
  try {
    let hardwareInfos = []

    // 1. CPU序列号 (Windows)
    try {
      const cpuResult = execSync('wmic cpu get ProcessorId', { encoding: 'utf8' })
      const cpuLines = cpuResult.trim().split('\n')
      if (cpuLines.length >= 2) {
        hardwareInfos.push(cpuLines[1].trim())
      }
    } catch (e) {}

    // 2. MAC地址
    try {
      const interfaces = os.networkInterfaces()
      for (const name of Object.keys(interfaces)) {
        for (const net of interfaces[name]) {
          if (!net.internal && net.mac !== '00:00:00:00:00:00') {
            hardwareInfos.push(net.mac)
            break
          }
        }
        if (hardwareInfos.length > 1) break
      }
    } catch (e) {}

    // 3. 主板序列号 (Windows)
    try {
      const boardResult = execSync('wmic baseboard get SerialNumber', { encoding: 'utf8' })
      const boardLines = boardResult.trim().split('\n')
      if (boardLines.length >= 2) {
        hardwareInfos.push(boardLines[1].trim())
      }
    } catch (e) {}

    // 组合并哈希
    const combined = hardwareInfos.join('|')
    return crypto.createHash('sha256').update(combined).digest('hex')
  } catch (error) {
    console.error('获取机器码失败:', error)
    return crypto.createHash('sha256').update(os.hostname()).digest('hex')
  }
}

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,          // 设置最小宽度
    minHeight: 800,          // 设置最小高度
    title: '二维码生成器',
    autoHideMenuBar: true,  // 隐藏菜单栏
    frame: false,           // 去掉默认标题栏
    webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
        webSecurity: false
      },
    icon: path.join(__dirname, '../public/二维码生成器.png')
  })

  if (isDev) {
    // 清除缓存
    mainWindow.webContents.session.clearCache()
    // 等待一下再加载，确保Vite服务器已启动
    setTimeout(() => {
      mainWindow.loadURL('http://localhost:5173')
      mainWindow.webContents.openDevTools()
    }, 1000)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }
  
  // 存储预览窗口的引用
  let previewWindow = null
  
  // 拦截新窗口的创建（用于预览窗口等），确保新窗口也隐藏菜单栏
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // 拦截所有通过window.open()打开的窗口，确保都隐藏菜单栏
    previewWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      autoHideMenuBar: true,  // 隐藏菜单栏
      title: '高级编辑器内容',
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        webSecurity: false,
        preload: path.join(__dirname, 'preload.js')  // 添加preload脚本
      },
      icon: path.join(__dirname, '../public/二维码生成器.png')
    })
    
    // 加载URL
    previewWindow.loadURL(url)
    
    // 窗口关闭时清除引用
    previewWindow.on('closed', () => {
      previewWindow = null
    })
    
    // 返回deny表示我们已经处理了窗口创建，阻止默认行为
    return { action: 'deny' }
  })
}

 

app.whenReady().then(() => {
  // 创建窗口
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// 保存二维码
ipcMain.handle('save-qrcode', async (event, dataURL) => {
  try {
    const { filePath, canceled } = await dialog.showSaveDialog(mainWindow, {
      title: '保存二维码',
      defaultPath: `qrcode_${Date.now()}.png`,
      filters: [
        { name: 'PNG图片', extensions: ['png'] },
        { name: '所有文件', extensions: ['*'] }
      ]
    })

    if (canceled || !filePath) {
      return { success: false }
    }

    // 将base64转换为buffer并保存
    const base64Data = dataURL.replace(/^data:image\/png;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')
    fs.writeFileSync(filePath, buffer)

    return { success: true, filePath }
  } catch (error) {
    console.error('保存失败:', error)
    return { success: false, error: error.message }
  }
})

// 选择文件
ipcMain.handle('select-file', async () => {
  try {
    const { filePaths, canceled } = await dialog.showOpenDialog(mainWindow, {
      title: '选择文件',
      properties: ['openFile'],
      filters: [
        { name: '所有文件', extensions: ['*'] }
      ]
    })

    if (canceled || filePaths.length === 0) {
      return { success: false }
    }

    const filePath = filePaths[0]
    const fileData = fs.readFileSync(filePath)
    const fileName = path.basename(filePath)
    const fileSize = fs.statSync(filePath).size

    return {
      success: true,
      fileName,
      fileSize,
      fileData: fileData.toString('base64')
    }
  } catch (error) {
    console.error('选择文件失败:', error)
    return { success: false, error: error.message }
  }
})

// 选择图片
ipcMain.handle('select-image', async () => {
  try {
    const { filePaths, canceled } = await dialog.showOpenDialog(mainWindow, {
      title: '选择图片',
      properties: ['openFile'],
      filters: [
        { name: '图片', extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'] }
      ]
    })

    if (canceled || filePaths.length === 0) {
      return { success: false }
    }

    const filePath = filePaths[0]
    const fileData = fs.readFileSync(filePath)
    const fileName = path.basename(filePath)

    return {
      success: true,
      fileName,
      dataURL: `data:image/${path.extname(filePath).substring(1)};base64,${fileData.toString('base64')}`
    }
  } catch (error) {
    console.error('选择图片失败:', error)
    return { success: false, error: error.message }
  }
})

// 关闭窗口
ipcMain.handle('close-window', async (event) => {
  try {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (window) {
      window.close()
      return { success: true }
    }
    return { success: false, error: '窗口不存在' }
  } catch (error) {
    console.error('关闭窗口失败:', error)
    return { success: false, error: error.message }
  }
})

// 最小化窗口
ipcMain.handle('minimize-window', async (event) => {
  try {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (window) {
      window.minimize()
      return { success: true }
    }
    return { success: false, error: '窗口不存在' }
  } catch (error) {
    console.error('最小化窗口失败:', error)
    return { success: false, error: error.message }
  }
})

// 最大化/恢复窗口
ipcMain.handle('maximize-window', async (event) => {
  try {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (window) {
      if (window.isMaximized()) {
        window.unmaximize()
      } else {
        window.maximize()
      }
      return { success: true }
    }
    return { success: false, error: '窗口不存在' }
  } catch (error) {
    console.error('最大化窗口失败:', error)
    return { success: false, error: error.message }
  }
})

// 打开外部浏览器
ipcMain.handle('open-external', async (event, url) => {
  try {
    await shell.openExternal(url)
    return { success: true }
  } catch (error) {
    console.error('打开外部浏览器失败:', error)
    return { success: false, error: error.message }
  }
})

// 获取机器码
ipcMain.handle('get-machine-code', async () => {
  try {
    const machineCode = getMachineCode()
    return { success: true, machineCode }
  } catch (error) {
    console.error('获取机器码失败:', error)
    return { success: false, error: error.message }
  }
})

// 打印二维码
ipcMain.handle('print-qrcode', async (event, dataURL) => {
  try {
    const printWindow = new BrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    })

    const htmlContent = `
      <html>
        <head>
          <style>
            @page { margin: 0; }
            body { 
              margin: 0; 
              display: flex; 
              justify-content: center; 
              align-items: center; 
              height: 100vh;
            }
            img { 
              max-width: 100%; 
              max-height: 100%; 
              object-fit: contain;
            }
          </style>
        </head>
        <body>
          <img src="${dataURL}" />
          <script>
            window.onload = () => {
              // 给一点时间确保图片渲染
              setTimeout(() => {
                window.print();
                // 打印完成后通知主进程或直接关闭
                setTimeout(() => {
                  window.close();
                }, 1000);
              }, 500);
            };
          </script>
        </body>
      </html>
    `

    printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`)
    
    return { success: true }
  } catch (error) {
    console.error('打印失败:', error)
    return { success: false, error: error.message }
  }
})


// 检查更新
ipcMain.handle('check-update', async () => {
  try {
    const SOFTWARE_ID = '10008';
    const UPDATE_API = 'http://software.kunqiongai.com:8000/api/v1/updates/check/';
    const version = app.getVersion();
    const url = `${UPDATE_API}?software=${SOFTWARE_ID}&version=${version}`;
    console.log('[CheckUpdate] Request URL:', url);
    
    // Node.js 18+ supports fetch
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('[CheckUpdate] Response:', data);
    return { success: true, data, requestUrl: url };
  } catch (error) {
    console.error('检查更新失败:', error);
    return { success: false, error: error.message };
  }
});

// 启动更新
ipcMain.handle('start-update', async (event, { url, hash }) => {
  try {
    // 生产环境: updater.exe 在 exe 同级目录
    // 开发环境: 可能需要特殊处理，但通常更新只在打包后测试
    let updaterPath = path.join(path.dirname(app.getPath('exe')), 'updater.exe');
    
    // 如果是开发环境，可能需要调整路径
    if (isDev) {
        updaterPath = path.join(__dirname, '../resources/updater.exe');
    }

    if (!fs.existsSync(updaterPath)) {
        return { success: false, error: '未找到更新程序 (updater.exe)' };
    }

    const installDir = path.dirname(app.getPath('exe'));
    const exeName = path.basename(app.getPath('exe'));
    const pid = process.pid;

    const args = [
      '--url', url,
      '--hash', hash,
      '--dir', installDir,
      '--exe', exeName,
      '--pid', pid
    ];

    const subprocess = spawn(updaterPath, args, {
      detached: true,
      stdio: 'ignore'
    });

    subprocess.unref();
    app.quit();
    return { success: true };
  } catch (error) {
    console.error('启动更新失败:', error);
    return { success: false, error: error.message };
  }
});

// 获取当前版本号
ipcMain.handle('get-current-version', async () => {
  try {
    const version = app.getVersion()
    return { success: true, version }
  } catch (error) {
    return { success: false, error: error.message }
  }
})




