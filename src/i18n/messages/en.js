export default {
  app: {
    footer: {
      productLine: 'QR Generator | A KunQiong AI Product',
      checkUpdate: 'Check Update (Fix)',
      latest: 'You are already on the latest version'
    },
    loading: {
      checkingUpdate: 'Checking for updates...'
    },
    update: {
      fail: 'Update check failed: {reason}',
      exception: 'Update check exception: {reason}',
      unsupported: 'Update check is not supported in this environment'
    }
  },
  topNav: {
    brand: 'QR Generator',
    actions: {
      customSoftware: 'Customize Software',
      feedback: 'Feedback',
      login: 'Login',
      logout: 'Logout'
    },
    tabs: {
      text: 'Text / URL',
      file: 'Document',
      image: 'Image',
      media: 'Audio / Video',
      batch: 'Batch QR',
      advanced: 'Advanced Editor'
    },
    window: {
      minimize: 'Minimize',
      maximize: 'Maximize',
      close: 'Close'
    },
    confirmLogout: 'Are you sure you want to log out?'
  },
  loginModal: {
    title: 'User Login',
    desc: 'Click the button below to complete authentication on the web page',
    start: 'Login Now',
    waiting: 'Waiting for web login to complete...',
    remaining: 'Time left: {seconds}s',
    cancel: 'Cancel Login',
    success: 'Login successful!',
    retry: 'Retry',
    timeout: 'Login timeout, please retry',
    failed: 'Login failed, please retry later'
  },
  updateModal: {
    title: 'New Version Available',
    later: 'Later',
    updateNow: 'Update Now',
    releaseTime: 'Release Time',
    updateLog: 'Update Log'
  },
  qrGenerator: {
    common: {
      settingsPreview: 'QR Settings & Preview',
      generating: 'Generating...',
      generate: 'Generate QR Code',
      loadingText: 'Generating QR code, please wait...',
      mediaHint: 'Large video files may take longer'
    },
    text: {
      title: 'Input Content',
      advanced: 'Advanced Edit',
      placeholder: 'Enter text or URL, then click Generate QR Code'
    },
    file: {
      title: 'Select Document',
      saveToLiveCode: 'Save to Live Code',
      titleLabel: 'Title',
      titlePlaceholder: 'Title, defaults to file name',
      allowDownload: 'Allow Download',
      allowDownloadTip: 'When enabled, users can download after scanning',
      addFile: 'Click to add file',
      hint: 'Only document files are supported here. Use image/video tabs for those types.'
    },
    image: {
      title: 'Select Images',
      addImage: 'Click to add images',
      hint: 'Multiple images are supported and will be generated as scannable content'
    },
    media: {
      title: 'Audio/Video QR',
      online: 'Online URL',
      local: 'Local File',
      placeholder: 'Enter a video URL, e.g.\\nhttps://www.bilibili.com/video/BV1xx411c7XD\\nhttps://www.youtube.com/watch?v=xxxxx\\nor other platforms',
      onlineHint: 'After scanning, users jump directly to the playback page',
      selectMedia: 'Click to select media file',
      support: 'Supports MP4, MP3, AVI, WAV and more',
      localHint: 'A playback page link will be generated for online playback'
    },
    quick: {
      file: 'Document QR',
      image: 'Image QR',
      media: 'Video QR'
    }
  },
  batchGenerator: {
    tabs: {
      dynamic: 'Batch Live QR',
      static: 'Batch Static QR',
      liveCode: 'Live Code'
    },
    desc: {
      dynamic: 'Upload an Excel file to parse and generate live QR codes in batch. All columns can be displayed in the live page.',
      static: 'Upload an Excel file and choose one column as static QR content. Other columns can be displayed below the QR.'
    },
    actions: {
      uploadExcel: 'Upload Excel',
      settingsAndStart: 'QR Settings & Preview / Start',
      previewPage: 'Preview Page'
    },
    messages: {
      rows: '{count} rows'
    },
    modal: {
      settingsTitle: 'QR Settings & Preview',
      selectTemplate: 'Select QR Template',
      currentTemplate: 'Current template:',
      changeTemplate: 'Change Template',
      editStyle: 'Edit QR Style',
      fieldSettings: 'Field Settings',
      noDataField: 'No data fields',
      displayName: 'Display name',
      noContent: 'No content',
      fontWeightNormal: 'Normal',
      fontWeightBold: 'Bold',
      alignLeft: 'Align Left',
      alignCenter: 'Center',
      alignRight: 'Align Right'
    }
  },
  advancedEditor: {
    title: {
      pageTitle: 'Page Title',
      placeholder: 'Enter page title here'
    },
    common: {
      default: 'Default',
      transparent: 'Transparent'
    },
    fonts: {
      yahei: 'Microsoft YaHei',
      simsun: 'SimSun',
      simhei: 'SimHei',
      kaiti: 'KaiTi',
      fangsong: 'FangSong'
    },
    toolbar: {
      styleLibrary: 'Style Library',
      openStyleLibrary: 'Open style library',
      previewSettings: 'Preview and settings',
      previewAndSettings: 'Preview & Settings',
      background: 'Background',
      bold: 'Bold',
      italic: 'Italic',
      underline: 'Underline',
      strike: 'Strikethrough',
      clearFormat: 'Clear format (CTRL+\\)',
      selectFontSize: 'Select font size',
      selectFont: 'Select font',
      lineHeight: 'Line height',
      foreground: 'Foreground',
      backgroundColor: 'Background color',
      customColor: 'Custom color',
      alignLeft: 'Align left',
      alignCenter: 'Center',
      alignRight: 'Align right',
      unorderedList: 'Unordered list',
      orderedList: 'Ordered list',
      insertTable: 'Insert table'
    },
    element: {
      insertRowAbove: 'Insert row above',
      insertRowBelow: 'Insert row below',
      insertColLeft: 'Insert column left',
      insertColRight: 'Insert column right',
      deleteRow: 'Delete row',
      deleteCol: 'Delete column',
      moveUp: 'Move up',
      moveDown: 'Move down',
      copy: 'Copy',
      delete: 'Delete',
      edit: 'Edit'
    },
    preview: {
      title: 'Preview & Settings',
      generating: '⌛ Generating...',
      generate: '🔄 Generate QR Code',
      editStyle: 'Edit Style',
      preview: 'Preview',
      updating: '⌛ Updating...',
      updateContent: 'Update Content (same code)',
      downloadQr: 'Download QR',
      variableFields: 'Variable Fields',
      addField: 'Add Field',
      field: 'Field',
      clickInsertField: 'Click to insert {name}',
      qrGeneratedSuccess: 'QR code generated successfully',
      info: {
        type: 'Type:',
        advancedEditor: 'Advanced Editor',
        size: 'Size:',
        timestamp: 'Generated At:',
        content: 'Display Content:',
        actualContent: 'Actual Encoded:'
      }
    },
    styleModal: {
      title: 'Edit Style',
      qrColor: 'QR Color',
      pickQrColor: 'Pick QR foreground color',
      bgColor: 'Background Color',
      pickBgColor: 'Pick background color',
      errorLevel: 'Error Correction',
      pickErrorLevel: 'Pick error correction level',
      levelLow: 'Low',
      levelMedium: 'Medium',
      levelHigh: 'Higher',
      levelHigher: 'High'
    },
    colorPicker: {
      foregroundTitle: 'Select Foreground Color',
      backgroundTitle: 'Select Background Color',
      previewText: 'Preview text color',
      previewBg: 'Preview background color'
    },
    backgroundModal: {
      title: 'Background Settings',
      pageBgColor: 'Page Background Color',
      pickPageBgColor: 'Select page background color',
      pageBgImage: 'Page Background Image',
      uploadBg: 'Upload Background',
      clearBg: 'Clear Background',
      preview: 'Background Preview'
    },
    styleLibrary: {
      title: 'Style Library',
      color: 'Color',
      selectColor: 'Select color'
    },
    imageModal: {
      title: 'Image Settings',
      upload: 'Image Upload',
      addImage: 'Add Image',
      preview: 'Preview',
      styleSettings: 'Image Style Settings',
      originalSize: 'Original Size',
      fill: 'Fill',
      displaySettings: 'Image Display Settings',
      seamless: 'Seamless Tile',
      spaced: 'Spaced Tile',
      carousel: 'Image Carousel',
      carouselInterval: 'Carousel Interval',
      manualCarousel: 'Manual Carousel',
      sec1: '1s',
      sec2: '2s',
      sec3: '3s',
      sec4: '4s',
      sec5: '5s',
      tips: 'Tips',
      tip1: '1. Recommended width is 720px for full-width display.',
      tip2Prefix: '2. Do not upload payment codes or copyrighted content. Violations will lead to account and QR ban without refund. See',
      auditRules: 'Content Review Rules'
    },
    tableModal: {
      title: 'Insert Table',
      selectSize: 'Select table size',
      selected: 'Selected: {rows} rows × {cols} cols'
    },
    contactModal: {
      title: 'Contact Information',
      fields: {
        title: 'Title',
        phone: 'Phone Number',
        wechat: 'WeChat ID',
        email: 'Email Address',
        address: 'Address',
        remarks: 'Remarks'
      },
      placeholders: {
        title: 'For example: company name or contact note (hidden if empty)',
        phone: 'Please enter phone number',
        wechat: 'Please enter WeChat ID',
        email: 'Please enter email address',
        address: 'Please enter address',
        remarks: 'Please enter remarks'
      }
    },
    fieldModal: {
      addVariableField: 'Add Variable Field',
      description: 'Different content shown in each sub-code should be added as variable content and inserted as placeholders.',
      textField: 'Text Field',
      imageField: 'Image Field',
      editField: 'Edit Field',
      fieldName: 'Field Name',
      fieldNamePlaceholder: 'Required. Distinguishes variable fields for code generation prompts.',
      leaveBlank: 'Leave Blank'
    },
    locationModal: {
      title: 'Map Location',
      address: 'Address',
      placeholder: 'Hidden if empty',
      insert: 'Insert Map Location'
    },
    formList: {
      title: 'Form List',
      create: 'Create Form',
      empty: 'No forms created yet',
      columns: {
        select: 'Select',
        name: 'Form Name',
        modifyTime: 'Modified At',
        actions: 'Actions'
      }
    },
    formEditor: {
      create: 'Create Form',
      edit: 'Edit Form',
      basicStyle: 'Basic Style',
      emptyHint: 'Click "Basic Style" to add components',
      settingTitle: 'Title',
      options: 'Options',
      optionPlaceholder: 'Option {index}',
      deleteOption: 'Delete Option',
      addOption: 'Add Option',
      save: 'Save',
      formName: 'Form Name*',
      afterSubmit: 'Post-submit Page',
      afterSubmitSuccess: 'Go to success page',
      afterSubmitQr: 'Open QR code page',
      fillLimit: 'Form Fill Limits',
      perUserTimes: 'Per-user fill count',
      noLimit: 'No limit',
      perPersonPrefix: 'Each user can fill',
      timesSuffix: 'times',
      perPeriodPrefix: 'Each user every',
      canFill: 'can fill',
      periodDay: 'day',
      periodWeek: 'week',
      periodMonth: 'month',
      todoFill: 'To be filled',
      placeholders: {
        title: 'Please enter title',
        hint: 'Please enter hint text',
        formName: 'Please enter form name'
      }
    },
    formComponents: {
      title: 'Basic Style',
      categories: {
        basic: 'Basic',
        personal: 'Personal Info',
        media: 'Media'
      },
      items: {
        singleText: 'Single-line Text',
        multiText: 'Multi-line Text',
        radio: 'Radio',
        checkbox: 'Checkbox',
        number: 'Number',
        date: 'Date',
        time: 'Time',
        rating: 'Rating',
        nps: 'NPS Scale',
        checklist: 'Checklist',
        location: 'Location',
        address: 'Address',
        title: 'Title',
        name: 'Name',
        phone: 'Phone Number',
        idCard: 'ID Card',
        employeeId: 'Employee ID',
        gender: 'Gender',
        age: 'Age',
        licensePlate: 'License Plate',
        image: 'Image',
        component: 'Component'
      }
    },
    bgSettings: {
      title: 'Background Settings',
      tabs: {
        color: 'Background Color',
        image: 'Background Image'
      },
      lightColors: 'Light',
      darkColors: 'Dark',
      customBg: 'Custom Background Color',
      textColor: 'Text Color',
      pageTopMargin: 'Page Top Margin',
      uploadBg: 'Upload Background Image',
      clickUploadImage: 'Click to upload image',
      removeImage: 'Remove Image'
    },
    videoModal: {
      title: 'Video Settings',
      uploadFile: 'Upload Video File',
      uploadingWait: 'Uploading video, please wait...',
      clickUpload: 'Click to upload video file',
      supportTypes: 'Supports MP4, AVI, WebM, etc. (MOV not supported)',
      tipPrefix: 'Tip:',
      movTip: 'MOV format cannot be played directly in most browsers. It is recommended to download and play with a media player.',
      optionalTitle: 'Title (Optional)',
      titlePlaceholder: 'Please enter video title',
      uploading: 'Uploading...'
    },
    audioModal: {
      title: 'Audio Settings',
      uploadFile: 'Upload Audio File',
      clickUpload: 'Click to upload audio file',
      supportTypes: 'Supports MP3, WAV, OGG, etc.',
      optionalTitle: 'Title (Optional)',
      titlePlaceholder: 'Please enter audio title'
    },
    fileModal: {
      title: 'File Settings',
      uploadFile: 'Upload File',
      allowDownload: 'Allow Download',
      addFile: 'Add File',
      uploading: 'Uploading...',
      optionalTitle: 'Title (Optional)',
      titlePlaceholder: 'Please enter file title',
      processing: 'Processing...'
    },
    confirm: {
      deleteForm: 'Are you sure you want to delete this form?',
      deleteComponent: 'Are you sure you want to delete this component?',
      deleteImage: 'Are you sure you want to delete this image?'
    },
    form: {
      required: 'Please enter a form name.',
      updated: 'Form updated successfully.',
      saved: 'Form saved successfully.'
    },
    messages: {
      mapApiPlaceholder: 'Map location requires map API integration. A placeholder is currently used.'
    },
    errors: {
      imageTooLarge: 'Image is too large. Please choose an image smaller than 10MB.',
      imageReadFailed: 'Failed to read image, please retry.',
      openImageSettingsFailed: 'Failed to open image settings, please retry.',
      tableMinRow: 'At least one row must be kept in the table.',
      tableMinCol: 'At least one column must be kept in the table.',
      generateFirst: 'Please generate a QR code first.',
      previewFailed: 'Preview failed: {reason}',
      qrNotGenerated: 'QR code has not been generated yet. Please generate it first.',
      downloadQrFailed: 'Failed to download QR code: {reason}',
      fieldNameRequired: 'Please enter a field name.',
      openFileDialogFailed: 'Failed to open file dialog, please retry.',
      videoTooLarge: 'Video file size cannot exceed 100MB.',
      fileReadFailed: 'Failed to read file, please retry.',
      uploadVideoFirst: 'Please upload a video file first.',
      audioTooLarge: 'Audio file size cannot exceed 50MB.',
      uploadAudioFirst: 'Please upload an audio file first.',
      saveAudioFailed: 'Failed to save audio, please retry.',
      uploadFileFirst: 'Please upload a file first.',
      editorNotReady: 'Editor is not initialized yet. Please refresh and retry.',
      uploadImageFirst: 'Please upload an image first.',
      imageDataInvalid: 'Some image data is invalid. Please re-upload images.',
      contactRequired: 'Please fill in at least one contact method.',
      addressRequired: 'Please enter address information first.',
      selectFormFirst: 'Please select a form first.',
      deleteImageFailed: 'An error occurred while deleting the image. Please retry.'
    }
  },
  dynamicManager: {
    title: 'QR Manager - {name}',
    defaultFolder: 'Hexagram',
    totalCount: 'Total {count} QR codes',
    filter: {
      all: 'All QR Codes'
    },
    search: {
      placeholder: 'Enter QR name'
    },
    status: {
      normal: 'Normal',
      disabled: 'Disabled',
      unknown: 'Unknown'
    },
    table: {
      qrInfo: 'QR Info',
      fileName: 'Uploaded File Name',
      scanCount: 'Scans',
      status: 'Status',
      editData: 'Edit Data',
      createTime: 'Created At',
      actions: 'Actions'
    },
    scan: {
      today: 'Today {count}',
      total: 'Total {count}'
    },
    actions: {
      back: 'Back',
      beautify: 'Beautify QR',
      appendData: 'Append Data',
      batchDownload: 'Batch Download',
      batchDelete: 'Batch Delete',
      editData: 'Edit Data',
      download: 'Download',
      preview: 'Preview',
      delete: 'Delete'
    },
    common: {
      save: 'Save',
      close: 'Close',
      apply: 'Apply',
      sizeSmall: 'Small',
      sizeMedium: 'Medium',
      sizeLarge: 'Large',
      unknownError: 'Unknown error',
      manualCreate: 'Created manually',
      qrWithIndex: 'QR Code {index}',
      qrFileName: 'QR_{id}',
      batchZipName: 'dynamic-qr-{timestamp}.zip',
      qr: 'QR Code',
      unknownFile: 'Unknown file'
    },
    preview: {
      modalTitle: 'QR Preview - {title}',
      qrTitle: 'QR Preview',
      contentTitle: 'Content Preview',
      qrAlt: 'QR code',
      selectQrHint: 'Please select a QR code on the left',
      selectQrContentHint: 'Please select a QR code on the left to view content',
      notGenerated: 'QR code not generated',
      imageCount: '{count} images'
    },
    editDialog: {
      title: 'Edit QR Data',
      titleHint: 'The title can be edited independently without affecting data content',
      fields: {
        title: 'Title'
      },
      placeholders: {
        title: 'Please enter title',
        field: 'Please enter {field}'
      }
    },
    beautifyDialog: {
      title: 'Beautify QR',
      background: {
        title: 'Background Settings',
        image: 'Background Image',
        color: 'Background Color'
      },
      qr: {
        title: 'QR Settings',
        logoSize: 'Logo Size',
        logoMargin: 'Logo Margin',
        codeMargin: 'Code Margin',
        codeColor: 'Code Color',
        codeBgColor: 'Code Background Color',
        errorLevel: 'Error Correction Level'
      }
    },
    appendDialog: {
      title: 'Append Data',
      tabs: {
        single: 'Single Append',
        batch: 'Batch Append'
      },
      singleHint: 'Create one new QR code with current template; display data can be edited in the list',
      qrName: 'QR Name',
      qrNamePlaceholder: 'Please enter QR name',
      uploadText: 'Click to upload Excel data file to append',
      uploadHint: 'Supports xlsx, xls, csv files',
      pendingUpload: 'Pending Upload',
      confirmAppend: 'Confirm Append'
    },
    deleteDialog: {
      title: 'Confirm Deletion',
      single: 'Are you sure you want to delete QR code "{title}"?',
      batch: 'Are you sure you want to delete {count} QR codes?',
      warning: 'This action cannot be undone. Please proceed carefully.'
    },
    messages: {
      selectQrFirst: 'Please select a QR code first',
      beautifyApplied: '✅ Beautification applied!',
      beautifyAppliedSyncFailed: '⚠️ Beautification applied, but sync to server failed!\n\nError: {reason}\n\nScanning from other devices may fail to display this dynamic code.',
      beautifyAppliedSaveFailed: '⚠️ Beautification applied, but saving failed! Please clear storage and retry.',
      applyBeautifyFailed: 'Failed to apply beautification: {reason}',
      selectFolderFirst: 'Please select a folder first',
      enterQrName: 'Please enter QR name',
      savedLocalSyncFailed: '⚠️ QR code has been saved locally, but sync to server failed!\n\nError: {reason}\n\nScanning from other devices may fail to display this dynamic code.',
      uploadExcelFirst: 'Please upload an Excel file first',
      appendedWithSyncFailed: '✅ Successfully appended {count} QR codes!\n\n⚠️ {failed} failed to sync to server, and may not display when scanned on other devices.',
      appendedSuccess: '✅ Successfully appended {count} QR codes!',
      selectQrForDownload: 'Please select QR codes to download first',
      batchDownloadSuccess: '✅ Downloaded {count} QR codes!\n\nFilename: {fileName}',
      selectQrForDelete: 'Please select QR codes to delete first',
      qrNotGeneratedYet: 'QR code has not been generated yet, please wait',
      dataSavedUpdated: '✅ Data saved! QR code updated.',
      savedDataSyncFailed: '⚠️ Data saved locally, but sync to server failed!\n\nError: {reason}\n\nScanning from other devices may fail to display this dynamic code.',
      partialSyncFailed: '⚠️ In this batch, {failed}/{total} dynamic codes failed to sync to server.\n\nScanning from other devices may show "dynamic code not found".\n\nPlease check API server status and address configuration.',
      generatedSuccess: '✅ Generated {count} dynamic QR codes!\n\nYou can preview QR code and content on the right, then download as needed.'
    },
    errors: {
      missingDynamicId: 'Missing dynamic QR ID',
      dataTooLarge: 'Data is too large ({size}MB) and cannot be saved. Please delete some old QR codes and try again.',
      storageInsufficient: '❌ Insufficient storage!\n\nData size: {size}MB\n\nSuggestions:\n1. Delete some old QR codes\n2. Clear browser cache\n3. Backup via batch download then delete',
      saveFailedWithReason: 'Save failed: {reason}',
      createQrSaveFailed: '❌ Save failed! QR code was not created. Please clear storage and try again.',
      fileReadFailed: 'File read failed, please retry!',
      fileReadEmpty: 'File read result is empty',
      excelEmpty: 'Excel file is empty!',
      excelNoHeaders: 'Excel file has no valid headers!',
      excelNoData: 'Excel file has no valid data!',
      excelParseFailed: 'Excel parse failed!\nError: {reason}',
      importFailed: 'Import failed: {reason}\n\nPlease make sure xlsx dependency is installed: npm install xlsx',
      downloadFailed: 'Download failed: {reason}\n\nPlease make sure JSZip dependency is installed: npm install jszip',
      dataSaveFailedNoUpdate: '❌ Save failed! Data not updated. Please clear storage and retry.',
      deleteFailed: '❌ Delete failed! Please clear storage and retry.',
      noDataToGenerate: 'No data available to generate QR codes',
      finalSaveFailed: '❌ Final save failed! Some data may not have been saved. Please check storage.',
      verifyCountFailed: '⚠️ Warning: Saved QR count verification failed. Please check data integrity.'
    }
  },
  toast: {
    confirm: 'Confirm',
    ok: 'OK',
    cancel: 'Cancel'
  },
  locale: {
    select: 'Language'
  }
}

