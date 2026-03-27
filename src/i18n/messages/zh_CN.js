export default {
  app: {
    footer: {
      productLine: '二维码生成器 | 鲲穹AI旗下产品',
      checkUpdate: '检查更新(Fix)',
      latest: '当前已是最新版本'
    },
    loading: {
      checkingUpdate: '正在检查更新...'
    },
    update: {
      fail: '检查更新失败: {reason}',
      exception: '检查更新发生异常: {reason}',
      unsupported: '当前环境不支持检查更新'
    }
  },
  topNav: {
    brand: '二维码生成器',
    actions: {
      customSoftware: '我要定制软件',
      feedback: '反馈问题',
      login: '登录',
      logout: '退出登录'
    },
    tabs: {
      text: '文本/网址',
      file: '文档',
      image: '图片',
      media: '音视频',
      batch: '批量二维码',
      advanced: '高级编辑器'
    },
    window: {
      minimize: '最小化',
      maximize: '最大化',
      close: '关闭'
    },
    confirmLogout: '确定要退出登录吗？'
  },
  loginModal: {
    title: '用户登录',
    desc: '点击下方按钮跳转至网页端完成登录认证',
    start: '立即登录',
    waiting: '正在等待网页端登录完成...',
    remaining: '剩余时间: {seconds}s',
    cancel: '取消登录',
    success: '登录成功！',
    retry: '重试',
    timeout: '登录超时，请重试',
    failed: '登录失败，请稍后重试'
  },
  updateModal: {
    title: '发现新版本',
    later: '稍后',
    updateNow: '立即更新',
    releaseTime: '发布时间',
    updateLog: '更新日志'
  },
  qrGenerator: {
    common: {
      settingsPreview: '二维码设置 & 预览',
      generating: '生成中...',
      generate: '生成二维码',
      loadingText: '正在生成二维码，请稍候...',
      mediaHint: '视频文件较大，可能需要一些时间'
    },
    text: {
      title: '输入内容',
      advanced: '高级编辑',
      placeholder: '请输入文字内容或网址链接，然后点击【生成二维码】按钮'
    },
    file: {
      title: '选择文档',
      saveToLiveCode: '保存到活码',
      titleLabel: '标题',
      titlePlaceholder: '标题，默认为文件名',
      allowDownload: '允许下载',
      allowDownloadTip: '开启后，扫码用户可以下载文件',
      addFile: '点击添加文件',
      hint: '仅支持文档类型，图片和视频请使用对应功能'
    },
    image: {
      title: '选择图片',
      addImage: '点击添加图片',
      hint: '支持多图片上传，将生成为可扫描查看的二维码'
    },
    media: {
      title: '音视频二维码',
      online: '在线链接',
      local: '本地文件',
      placeholder: '请输入视频链接，例如：\\nhttps://www.bilibili.com/video/BV1xx411c7XD\\nhttps://www.youtube.com/watch?v=xxxxx\\n或其他视频平台链接',
      onlineHint: '扫码后直接跳转到视频播放页面',
      selectMedia: '点击选择音视频文件',
      support: '支持 MP4、MP3、AVI、WAV 等格式',
      localHint: '将生成播放页面链接，扫码可在线播放'
    },
    quick: {
      file: '文档二维码',
      image: '图片二维码',
      media: '视频二维码'
    }
  },
  batchGenerator: {
    tabs: {
      dynamic: '批量活码',
      static: '批量静态码',
      liveCode: '活码'
    },
    desc: {
      dynamic: '上传Excel文件，自动解析批量生成活码二维码，所有列内容都可展示在活码页面上',
      static: '上传Excel文件，任选一列生成静态二维码，其它列可作为数据显示在二维码下方'
    },
    actions: {
      uploadExcel: '上传Excel',
      settingsAndStart: '二维码设置 & 预览 / 开始生成',
      previewPage: '预览页面'
    },
    messages: {
      rows: '{count} 行数据'
    },
    modal: {
      settingsTitle: '二维码设置 & 预览',
      selectTemplate: '选择二维码模板',
      currentTemplate: '当前选择模板：',
      changeTemplate: '更换模板',
      editStyle: '编辑二维码样式',
      fieldSettings: '字段设置',
      noDataField: '无数据字段',
      displayName: '显示名称',
      noContent: '无内容',
      fontWeightNormal: '正常',
      fontWeightBold: '加粗',
      alignLeft: '左对齐',
      alignCenter: '居中',
      alignRight: '右对齐'
    }
  },
  advancedEditor: {
    title: {
      pageTitle: '页面标题',
      placeholder: '请在这里输入页面标题'
    },
    common: {
      default: '默认',
      transparent: '透明'
    },
    fonts: {
      yahei: '微软雅黑',
      simsun: '宋体',
      simhei: '黑体',
      kaiti: '楷体',
      fangsong: '仿宋'
    },
    toolbar: {
      styleLibrary: '样式库',
      openStyleLibrary: '打开样式库',
      previewSettings: '预览与设置',
      previewAndSettings: '预览 & 设置',
      background: '背景',
      bold: '加粗',
      italic: '斜体',
      underline: '下划线',
      strike: '删除线',
      clearFormat: '清除格式 (CTRL+\\)',
      selectFontSize: '选择字体大小',
      selectFont: '选择字体',
      lineHeight: '行高',
      foreground: '前景色',
      backgroundColor: '背景色',
      customColor: '自定义颜色',
      alignLeft: '左对齐',
      alignCenter: '居中',
      alignRight: '右对齐',
      unorderedList: '无序列表',
      orderedList: '有序列表',
      insertTable: '插入表格'
    },
    element: {
      insertRowAbove: '在上方插入行',
      insertRowBelow: '在下方插入行',
      insertColLeft: '在左侧插入列',
      insertColRight: '在右侧插入列',
      deleteRow: '删除行',
      deleteCol: '删除列',
      moveUp: '上移',
      moveDown: '下移',
      copy: '复制',
      delete: '删除',
      edit: '编辑'
    },
    preview: {
      title: '预览与设置',
      generating: '⌛ 生成中...',
      generate: '🔄 生成二维码',
      editStyle: '修改样式',
      preview: '预览',
      updating: '⌛ 更新中...',
      updateContent: '更新内容(码不变)',
      downloadQr: '下载二维码',
      variableFields: '可变字段',
      addField: '新增字段',
      field: '字段',
      clickInsertField: '点击插入 {name}',
      qrGeneratedSuccess: '二维码生成成功',
      info: {
        type: '类型：',
        advancedEditor: '高级编辑器',
        size: '尺寸：',
        timestamp: '生成时间：',
        content: '显示内容：',
        actualContent: '实际编码：'
      }
    },
    styleModal: {
      title: '修改样式',
      qrColor: '二维码颜色',
      pickQrColor: '选择二维码前景色',
      bgColor: '背景颜色',
      pickBgColor: '选择二维码背景色',
      errorLevel: '容错率',
      pickErrorLevel: '选择容错率',
      levelLow: '低',
      levelMedium: '中',
      levelHigh: '较高',
      levelHigher: '高'
    },
    colorPicker: {
      foregroundTitle: '选择前景色',
      backgroundTitle: '选择背景色',
      previewText: '预览文字颜色',
      previewBg: '预览背景颜色'
    },
    backgroundModal: {
      title: '背景设置',
      pageBgColor: '页面背景色',
      pickPageBgColor: '选择页面背景色',
      pageBgImage: '页面背景图',
      uploadBg: '上传背景图',
      clearBg: '清除背景图',
      preview: '背景预览'
    },
    styleLibrary: {
      title: '样式库',
      color: '颜色',
      selectColor: '选择颜色'
    },
    imageModal: {
      title: '图片设置',
      upload: '图片上传',
      addImage: '添加图片',
      preview: '预览',
      styleSettings: '图片样式设置',
      originalSize: '原始大小',
      fill: '撑满',
      displaySettings: '图片展示设置',
      seamless: '无缝平铺',
      spaced: '留空平铺',
      carousel: '图片轮播',
      carouselInterval: '轮播时间',
      manualCarousel: '手动轮播',
      sec1: '1秒',
      sec2: '2秒',
      sec3: '3秒',
      sec4: '4秒',
      sec5: '5秒',
      tips: '温馨提示',
      tip1: '1. 撑满屏幕宽度图片建议宽度720px',
      tip2Prefix: '2. 上传图片请勿上传收付款码、版权类内容,如发现违规内容将立即封禁账号与二维码,并不予退款。详见',
      auditRules: '内容审核规范'
    },
    tableModal: {
      title: '插入表格',
      selectSize: '选择表格大小',
      selected: '已选择：{rows} 行 × {cols} 列'
    },
    contactModal: {
      title: '联系方式',
      fields: {
        title: '标题',
        phone: '电话号码',
        wechat: '微信号',
        email: '邮箱地址',
        address: '地址',
        remarks: '备注'
      },
      placeholders: {
        title: '例如企业名称、联系方式说明等,不填不显示',
        phone: '请输入电话号码',
        wechat: '请输入微信号',
        email: '请输入邮箱地址',
        address: '请输入地址',
        remarks: '请输入备注信息'
      }
    },
    fieldModal: {
      addVariableField: '添加可变字段',
      description: '每个子码中显示的不同内容,需要添加为可变内容,插入模板中占位。',
      textField: '文本字段',
      imageField: '图片字段',
      editField: '编辑字段',
      fieldName: '字段名称',
      fieldNamePlaceholder: '必填,区分「可变字段」,用于生码时提示填入内容',
      leaveBlank: '留白'
    },
    locationModal: {
      title: '地图位置',
      address: '地址信息',
      placeholder: '不填不显示',
      insert: '插入地图定位'
    },
    formList: {
      title: '表单列表',
      create: '创建表单',
      empty: '当前还未创建表单',
      columns: {
        select: '选择',
        name: '表单名称',
        modifyTime: '修改时间',
        actions: '操作'
      }
    },
    formEditor: {
      create: '创建表单',
      edit: '编辑表单',
      basicStyle: '基础样式',
      emptyHint: '点击"基础样式"按钮添加组件',
      settingTitle: '标题',
      options: '选项',
      optionPlaceholder: '选项{index}',
      deleteOption: '删除选项',
      addOption: '添加选项',
      save: '保存',
      formName: '表单名称*',
      afterSubmit: '提交后页面',
      afterSubmitSuccess: '进入提交成功页',
      afterSubmitQr: '打开二维码页面',
      fillLimit: '填表限制',
      perUserTimes: '每人填写次数',
      noLimit: '不限制',
      perPersonPrefix: '每人可填写',
      timesSuffix: '次',
      perPeriodPrefix: '每人每',
      canFill: '可填写',
      periodDay: '日',
      periodWeek: '周',
      periodMonth: '月',
      todoFill: '待填写',
      placeholders: {
        title: '请输入标题',
        hint: '请输入提示文字',
        formName: '请输入表单名称'
      }
    },
    formComponents: {
      title: '基础样式',
      categories: {
        basic: '基础类',
        personal: '个人信息',
        media: '多媒体类'
      },
      items: {
        singleText: '单行文本',
        multiText: '多行文本',
        radio: '单选框',
        checkbox: '多选框',
        number: '数字',
        date: '日期',
        time: '时间',
        rating: '评分',
        nps: 'NPS量表',
        checklist: '检查项',
        location: '定位',
        address: '地址',
        title: '标题',
        name: '姓名',
        phone: '手机号',
        idCard: '身份证',
        employeeId: '工号',
        gender: '性别',
        age: '年龄',
        licensePlate: '车牌',
        image: '图片',
        component: '组件'
      }
    },
    bgSettings: {
      title: '背景设置',
      tabs: {
        color: '背景颜色',
        image: '背景图片'
      },
      lightColors: '浅色',
      darkColors: '深色',
      customBg: '自定义背景色',
      textColor: '文字颜色',
      pageTopMargin: '页面上边距',
      uploadBg: '上传背景图片',
      clickUploadImage: '点击上传图片',
      removeImage: '移除图片'
    },
    videoModal: {
      title: '视频设置',
      uploadFile: '上传视频文件',
      uploadingWait: '正在上传视频，请稍候...',
      clickUpload: '点击上传视频文件',
      supportTypes: '支持 MP4、AVI、WebM 等格式（不支持 MOV）',
      tipPrefix: '提示：',
      movTip: 'MOV格式在大多数浏览器中无法直接播放，建议下载后使用播放器打开。',
      optionalTitle: '标题（可选）',
      titlePlaceholder: '请输入视频标题',
      uploading: '上传中...'
    },
    audioModal: {
      title: '音频设置',
      uploadFile: '上传音频文件',
      clickUpload: '点击上传音频文件',
      supportTypes: '支持 MP3、WAV、OGG 等格式',
      optionalTitle: '标题（可选）',
      titlePlaceholder: '请输入音频标题'
    },
    fileModal: {
      title: '文件设置',
      uploadFile: '上传文件',
      allowDownload: '允许下载',
      addFile: '添加文件',
      uploading: '正在上传...',
      optionalTitle: '标题（可选）',
      titlePlaceholder: '请输入文件标题',
      processing: '处理中...'
    },
    confirm: {
      deleteForm: '确定要删除这个表单吗？',
      deleteComponent: '确定要删除这个组件吗？',
      deleteImage: '确定要删除这个图片吗？'
    },
    form: {
      required: '请输入表单名称！',
      updated: '表单更新成功！',
      saved: '表单保存成功！'
    },
    messages: {
      mapApiPlaceholder: '地图定位功能需要集成地图API，当前使用占位符'
    },
    errors: {
      imageTooLarge: '图片过大！请选择小于10MB的图片',
      imageReadFailed: '图片读取失败，请重试',
      openImageSettingsFailed: '打开图片设置失败，请重试！',
      tableMinRow: '表格至少需要保留一行',
      tableMinCol: '表格至少需要保留一列',
      generateFirst: '请先生成二维码',
      previewFailed: '预览失败：{reason}',
      qrNotGenerated: '二维码尚未生成，请先生成二维码',
      downloadQrFailed: '下载二维码失败: {reason}',
      fieldNameRequired: '请输入字段名称',
      openFileDialogFailed: '打开文件选择对话框失败，请重试！',
      videoTooLarge: '视频文件大小不能超过100MB！',
      fileReadFailed: '文件读取失败，请重试！',
      uploadVideoFirst: '请先上传视频文件！',
      audioTooLarge: '音频文件大小不能超过50MB！',
      uploadAudioFirst: '请先上传音频文件！',
      saveAudioFailed: '保存音频失败，请重试！',
      uploadFileFirst: '请先上传文件！',
      editorNotReady: '编辑区域未初始化，请刷新页面重试！',
      uploadImageFirst: '请先上传图片！',
      imageDataInvalid: '部分图片数据格式错误，请重新上传图片！',
      contactRequired: '请至少填写一项联系方式！',
      addressRequired: '请先输入地址信息！',
      selectFormFirst: '请先选择一个表单！',
      deleteImageFailed: '删除图片时发生错误，请重试'
    }
  },
  dynamicManager: {
    title: '二维码管理-{name}',
    defaultFolder: '六角星',
    totalCount: '共{count}个二维码',
    filter: {
      all: '全部二维码'
    },
    search: {
      placeholder: '请输入二维码名称'
    },
    status: {
      normal: '正常',
      disabled: '已禁用',
      unknown: '未知'
    },
    table: {
      qrInfo: '二维码信息',
      fileName: '上传文件名称',
      scanCount: '扫码次数',
      status: '状态',
      editData: '编辑数据',
      createTime: '创建时间',
      actions: '操作'
    },
    scan: {
      today: '今日 {count}',
      total: '累计 {count}'
    },
    actions: {
      back: '返回',
      beautify: '美化二维码',
      appendData: '追加数据',
      batchDownload: '批量下载',
      batchDelete: '批量删除',
      editData: '编辑数据',
      download: '下载',
      preview: '预览',
      delete: '删除'
    },
    common: {
      save: '保存',
      close: '关闭',
      apply: '应用',
      sizeSmall: '小',
      sizeMedium: '中',
      sizeLarge: '大',
      unknownError: '未知错误',
      manualCreate: '手动创建',
      qrWithIndex: '二维码{index}',
      qrFileName: '二维码_{id}',
      batchZipName: '活码二维码_{timestamp}.zip',
      qr: '二维码',
      unknownFile: '未知文件'
    },
    preview: {
      modalTitle: '二维码预览 - {title}',
      qrTitle: '二维码预览',
      contentTitle: '内容预览',
      qrAlt: '二维码',
      selectQrHint: '请选择左侧二维码查看',
      selectQrContentHint: '请选择左侧二维码查看内容',
      notGenerated: '二维码未生成',
      imageCount: '共 {count} 张图片'
    },
    editDialog: {
      title: '编辑二维码数据',
      titleHint: '标题可独立修改，不影响数据内容',
      fields: {
        title: '标题'
      },
      placeholders: {
        title: '请输入标题',
        field: '请输入{field}'
      }
    },
    beautifyDialog: {
      title: '美化二维码',
      background: {
        title: '背景设置',
        image: '背景图',
        color: '背景色'
      },
      qr: {
        title: '二维码设置',
        logoSize: 'Logo尺寸',
        logoMargin: 'Logo边距',
        codeMargin: '码边距',
        codeColor: '码颜色',
        codeBgColor: '码背景色',
        errorLevel: '容错率'
      }
    },
    appendDialog: {
      title: '追加数据',
      tabs: {
        single: '单条追加',
        batch: '批量追加'
      },
      singleHint: '使用当前模板创建一条新二维码,展示数据可在列表中编辑',
      qrName: '二维码名称',
      qrNamePlaceholder: '请输入二维码名称',
      uploadText: '点击上传要追加的Excel数据文件',
      uploadHint: '支持上传xlsx、xls、csv文件',
      pendingUpload: '待上传',
      confirmAppend: '确定追加'
    },
    deleteDialog: {
      title: '确认删除',
      single: '确定要删除二维码 "{title}" 吗？',
      batch: '确定要删除 {count} 个二维码吗？',
      warning: '此操作不可恢复，请谨慎操作！'
    },
    messages: {
      selectQrFirst: '请先选择一个二维码',
      beautifyApplied: '✅ 美化已应用！',
      beautifyAppliedSyncFailed: '⚠️ 美化已应用，但同步到服务器失败！\n\n错误：{reason}\n\n其他设备扫描可能无法显示该活码。',
      beautifyAppliedSaveFailed: '⚠️ 美化已应用，但保存失败！请清理存储空间后重试保存。',
      applyBeautifyFailed: '应用美化失败：{reason}',
      selectFolderFirst: '请先选择一个文件夹',
      enterQrName: '请输入二维码名称',
      savedLocalSyncFailed: '⚠️ 二维码已保存到本地，但同步到服务器失败！\n\n错误：{reason}\n\n其他设备扫描可能无法显示该活码。',
      uploadExcelFirst: '请先上传Excel文件',
      appendedWithSyncFailed: '✅ 已成功追加 {count} 个二维码！\n\n⚠️ 其中 {failed} 个同步到服务器失败，其他设备扫描可能无法显示。',
      appendedSuccess: '✅ 已成功追加 {count} 个二维码！',
      selectQrForDownload: '请先选择要下载的二维码',
      batchDownloadSuccess: '✅ 已下载 {count} 个二维码！\n\n文件名：{fileName}',
      selectQrForDelete: '请先选择要删除的二维码',
      qrNotGeneratedYet: '二维码尚未生成，请稍候',
      dataSavedUpdated: '✅ 数据已保存！二维码已更新',
      savedDataSyncFailed: '⚠️ 数据已保存到本地，但同步到服务器失败！\n\n错误：{reason}\n\n其他设备扫描可能无法显示该活码。',
      partialSyncFailed: '⚠️ 本次生成的活码中，有 {failed}/{total} 个同步到服务器失败。\n\n其他设备扫码可能会显示“活码未找到”。\n\n建议检查API服务器状态与地址配置。',
      generatedSuccess: '✅ 已生成 {count} 个活码二维码！\n\n您可以在右侧预览二维码和内容，选择需要的二维码进行下载。'
    },
    errors: {
      missingDynamicId: '缺少活码ID',
      dataTooLarge: '数据过大（{size}MB），无法保存。请删除一些旧的二维码后再试。',
      storageInsufficient: '❌ 存储空间不足！\n\n数据大小：{size}MB\n\n建议：\n1. 删除一些旧的二维码\n2. 清理浏览器缓存\n3. 使用批量下载功能备份数据后删除',
      saveFailedWithReason: '保存失败：{reason}',
      createQrSaveFailed: '❌ 保存失败！二维码未创建，请清理存储空间后重试。',
      fileReadFailed: '文件读取失败，请重试！',
      fileReadEmpty: '文件读取结果为空',
      excelEmpty: 'Excel文件为空！',
      excelNoHeaders: 'Excel文件没有有效的列名！',
      excelNoData: 'Excel文件中没有有效数据！',
      excelParseFailed: 'Excel文件解析失败！\n错误：{reason}',
      importFailed: '导入失败：{reason}\n\n请确保已安装xlsx依赖：npm install xlsx',
      downloadFailed: '下载失败：{reason}\n\n请确保已安装JSZip依赖：npm install jszip',
      dataSaveFailedNoUpdate: '❌ 保存失败！数据未更新，请清理存储空间后重试。',
      deleteFailed: '❌ 删除失败！请清理存储空间后重试。',
      noDataToGenerate: '没有数据可生成二维码',
      finalSaveFailed: '❌ 最终保存失败！部分数据可能未保存，请检查存储空间。',
      verifyCountFailed: '⚠️ 警告：保存的二维码数量验证失败，请检查数据完整性。'
    }
  },
  toast: {
    confirm: '确认',
    ok: '确定',
    cancel: '取消'
  },
  locale: {
    select: '语言'
  }
}

