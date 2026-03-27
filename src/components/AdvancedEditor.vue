<template>
  <div class="advanced-editor">
    <div class="editor-layout">
      <!-- 左侧样式库（已移动到模态框） -->
      
      <!-- 中央编辑区域 -->
      <div class="editor-content">
        <!-- 样式库按钮 -->
        <div class="toolbar-actions">
          <button 
            class="style-library-toggle-btn" 
            @click="showStyleLibraryModal = true"
            :title="tt('advancedEditor.toolbar.openStyleLibrary')"
          >
            📚 {{ tt('advancedEditor.toolbar.styleLibrary') }}
          </button>
          
          <button 
            class="preview-toggle-btn" 
            @click="openPreviewModal"
            :title="tt('advancedEditor.toolbar.previewSettings')"
          >
            ⚙️ {{ tt('advancedEditor.toolbar.previewAndSettings') }}
          </button>
        </div>
        
        <!-- 页面标题输入 -->
        <div class="page-title-input">
          <input
            v-model="pageTitle"
            type="text"
            :title="tt('advancedEditor.title.pageTitle')"
            :aria-label="tt('advancedEditor.title.pageTitle')"
            :placeholder="tt('advancedEditor.title.placeholder')"
            class="title-input-field"
          />
          <span class="edit-icon">✏️</span>
        </div>
        
        <!-- 内容类型图标 -->
        <div class="content-type-icons">
          <button
            v-for="type in contentTypes"
            :key="type.id"
            class="content-type-btn"
            :title="type.label"
            @click="handleContentTypeClick(type, $event)"
          >
            {{ type.icon }}
          </button>
          <button
            class="content-type-btn background-type-btn"
            :title="tt('advancedEditor.toolbar.background')"
            @click="showBackgroundModal = true"
          >
            🎨
          </button>
        </div>
        
        <!-- 富文本编辑器工具栏 -->
        <div class="toolbar">
          <button @click="execCommand('bold')" class="toolbar-btn" :title="tt('advancedEditor.toolbar.bold')">
            <strong>B</strong>
          </button>
          <button @click="execCommand('italic')" class="toolbar-btn" :title="tt('advancedEditor.toolbar.italic')">
            <em>I</em>
          </button>
          <button @click="execCommand('underline')" class="toolbar-btn" :title="tt('advancedEditor.toolbar.underline')">
            <u>U</u>
          </button>
          <button @click="execCommand('strikeThrough')" class="toolbar-btn" :title="tt('advancedEditor.toolbar.strike')">
            <s>S</s>
          </button>
          <button @click="clearFormat" class="toolbar-btn" :title="tt('advancedEditor.toolbar.clearFormat')">
            🧹
          </button>
          <div class="toolbar-separator"></div>
          
          <!-- 字体大小 -->
          <select v-model="fontSize" @change="execCommand('fontSize', fontSize)" class="toolbar-select" :title="tt('advancedEditor.toolbar.selectFontSize')" :aria-label="tt('advancedEditor.toolbar.selectFontSize')">
            <option value="1">12px</option>
            <option value="2">14px</option>
            <option value="3">16px</option>
            <option value="4">18px</option>
            <option value="5">20px</option>
            <option value="6">24px</option>
            <option value="7">28px</option>
          </select>
          
          <!-- 字体选择 -->
          <select v-model="fontFamily" @change="applyFontFamily" class="toolbar-select" :title="tt('advancedEditor.toolbar.selectFont')" :aria-label="tt('advancedEditor.toolbar.selectFont')">
            <option value="Arial">Arial</option>
            <option value="Times New Roman">Times</option>
            <option value="Courier New">Courier</option>
            <option value="Microsoft YaHei">{{ tt('advancedEditor.fonts.yahei') }}</option>
            <option value="SimSun">{{ tt('advancedEditor.fonts.simsun') }}</option>
            <option value="SimHei">{{ tt('advancedEditor.fonts.simhei') }}</option>
            <option value="KaiTi">{{ tt('advancedEditor.fonts.kaiti') }}</option>
            <option value="FangSong">{{ tt('advancedEditor.fonts.fangsong') }}</option>
            <option value="Verdana">Verdana</option>
            <option value="Georgia">Georgia</option>
            <option value="Comic Sans MS">Comic Sans MS</option>
            <option value="Impact">Impact</option>
            <option value="Trebuchet MS">Trebuchet MS</option>
            <option value="Lucida Console">Lucida Console</option>
          </select>
          
          <!-- 行高按钮 -->
          <div class="toolbar-dropdown" @click="console.log('[工具栏日志] toolbar-dropdown 被点击')">
            <button class="toolbar-btn dropdown-btn" @click.stop.prevent="console.log('[工具栏日志] 行高按钮被点击'); toggleLineHeightDropdown()" :title="tt('advancedEditor.toolbar.lineHeight')">
              T↓
            </button>
            <div v-if="showLineHeightDropdown" class="dropdown-menu" @click.stop>
              <div class="dropdown-title">{{ tt('advancedEditor.toolbar.lineHeight') }}</div>
              <div 
                v-for="height in lineHeights" 
                :key="height"
                class="dropdown-item"
                :class="{ active: currentLineHeight === height }"
                @click="applyLineHeight(height)"
              >
                <span v-if="currentLineHeight === height" class="checkmark">✓</span>
                {{ height }}
              </div>
            </div>
          </div>
          
          <!-- 前景色（文字颜色） -->
          <div class="toolbar-dropdown" @click="console.log('[工具栏日志] toolbar-dropdown 被点击')">
            <button class="toolbar-btn dropdown-btn" @click.stop.prevent="console.log('[工具栏日志] 前景色按钮被点击'); toggleForegroundColorDropdown()" :title="tt('advancedEditor.toolbar.foreground')">
              <span style="color: #000; pointer-events: none;">A</span>
            </button>
            <div v-if="showForegroundColorDropdown" class="color-dropdown-menu" @click.stop>
              <div class="color-dropdown-title">{{ tt('advancedEditor.toolbar.foreground') }}</div>
              <div class="color-dropdown-label">{{ tt('advancedEditor.common.default') }}</div>
              <div class="color-swatches-row">
                <div 
                  v-for="color in defaultColors" 
                  :key="color"
                  class="color-swatch-small"
                  :style="{ backgroundColor: color }"
                  @click="applyForegroundColor(color)"
                ></div>
              </div>
              <div class="color-grid">
                <div 
                  v-for="color in colorPalette" 
                  :key="color"
                  class="color-swatch-grid"
                  :style="{ backgroundColor: color }"
                  @click="applyForegroundColor(color)"
                ></div>
              </div>
              <button class="custom-color-btn" @click="showForegroundColorPicker = true">{{ tt('advancedEditor.toolbar.customColor') }}</button>
            </div>
          </div>
          
          <!-- 背景色 -->
          <div class="toolbar-dropdown" @click="console.log('[工具栏日志] toolbar-dropdown 被点击')">
            <button class="toolbar-btn dropdown-btn" @click.stop.prevent="console.log('[工具栏日志] 背景色按钮被点击'); toggleBackgroundColorDropdown()" :title="tt('advancedEditor.toolbar.backgroundColor')">
              <span style="background: #fff; color: #000; pointer-events: none;">A</span>
            </button>
            <div v-if="showBackgroundColorDropdown" class="color-dropdown-menu" @click.stop>
              <div class="color-dropdown-title">{{ tt('advancedEditor.toolbar.backgroundColor') }}</div>
              <div class="color-dropdown-label">{{ tt('advancedEditor.common.transparent') }}</div>
              <div class="color-swatches-row">
                <div 
                  v-for="color in defaultColors" 
                  :key="color"
                  class="color-swatch-small"
                  :style="{ backgroundColor: color }"
                  @click="applyBackgroundColor(color)"
                ></div>
              </div>
              <div class="color-grid">
                <div 
                  v-for="color in colorPalette" 
                  :key="color"
                  class="color-swatch-grid"
                  :style="{ backgroundColor: color }"
                  @click="applyBackgroundColor(color)"
                ></div>
              </div>
              <button class="custom-color-btn" @click="showBackgroundColorPicker = true">{{ tt('advancedEditor.toolbar.customColor') }}</button>
            </div>
          </div>
          
          <div class="toolbar-separator"></div>
          <button @click="execCommand('justifyLeft')" class="toolbar-btn" :title="tt('advancedEditor.toolbar.alignLeft')">⬅</button>
          <button @click="execCommand('justifyCenter')" class="toolbar-btn" :title="tt('advancedEditor.toolbar.alignCenter')">⬌</button>
          <button @click="execCommand('justifyRight')" class="toolbar-btn" :title="tt('advancedEditor.toolbar.alignRight')">➡</button>
          <button @click="execCommand('insertUnorderedList')" class="toolbar-btn" :title="tt('advancedEditor.toolbar.unorderedList')">•</button>
          <button @click="execCommand('insertOrderedList')" class="toolbar-btn" :title="tt('advancedEditor.toolbar.orderedList')">1.</button>
          <div class="toolbar-separator"></div>
          <button @click="showTableModal = true" class="toolbar-btn" :title="tt('advancedEditor.toolbar.insertTable')">📊</button>
        </div>
        
        
        <!-- 编辑区域 -->
        <div
          class="editable-area"
          ref="editableArea"
          contenteditable="true"
          @drop="handleDrop"
          @dragover.prevent="handleDragOver"
          @dragenter.prevent="handleDragEnter"
          @dragleave.prevent="handleDragLeave"
          @input="handleContentChange"
          @paste="handlePaste"
          @focus="handleFocus"
          @blur="handleBlur"
          @focusin="handleFocusIn"
          @focusout="handleFocusOut"
          @click="handleEditableAreaClick"
          @mouseover="handleEditableAreaMouseOver"
          @mouseout="handleEditableAreaMouseOut"
          @keydown="handleKeyDown"
        >
        </div>
        
        <!-- 元素操作按钮 -->
        <div 
          v-if="selectedElement && showElementActions"
          class="element-actions"
          :style="elementActionsStyle"
        >
          <!-- 表格专用操作按钮 -->
          <template v-if="isTableElement">
            <button 
              class="action-btn-table-insert-row-above" 
              @click="insertTableRowAbove"
              :title="tt('advancedEditor.element.insertRowAbove')"
            >
              ⬆️
            </button>
            <button 
              class="action-btn-table-insert-row-below" 
              @click="insertTableRowBelow"
              :title="tt('advancedEditor.element.insertRowBelow')"
            >
              ⬇️
            </button>
            <button 
              v-if="!isKeyValueTable"
              class="action-btn-table-insert-col-left" 
              @click="insertTableColumnLeft"
              :title="tt('advancedEditor.element.insertColLeft')"
            >
              ⬅️
            </button>
            <button 
              v-if="!isKeyValueTable"
              class="action-btn-table-insert-col-right" 
              @click="insertTableColumnRight"
              :title="tt('advancedEditor.element.insertColRight')"
            >
              ➡️
            </button>
            <button 
              class="action-btn-table-delete-row" 
              @click="deleteTableRow"
              :title="tt('advancedEditor.element.deleteRow')"
            >
              🗑️
            </button>
            <button 
              v-if="!isKeyValueTable"
              class="action-btn-table-delete-col" 
              @click="deleteTableColumn"
              :title="tt('advancedEditor.element.deleteCol')"
            >
              ❌
            </button>
          </template>
          <!-- 通用操作按钮 -->
          <button 
            class="action-btn-move-up" 
            :disabled="!canMoveUp"
            @click="moveElementUp"
            :title="tt('advancedEditor.element.moveUp')"
          >
            {{ tt('advancedEditor.element.moveUp') }}
          </button>
          <button 
            class="action-btn-move-down" 
            :disabled="!canMoveDown"
            @click="moveElementDown"
            :title="tt('advancedEditor.element.moveDown')"
          >
            {{ tt('advancedEditor.element.moveDown') }}
          </button>
          <button 
            class="action-btn-copy" 
            @click="copyElement"
            :title="tt('advancedEditor.element.copy')"
          >
            {{ tt('advancedEditor.element.copy') }}
          </button>
          <button 
            class="action-btn-delete" 
            @click="deleteElement"
            :title="tt('advancedEditor.element.delete')"
          >
            {{ tt('advancedEditor.element.delete') }}
          </button>
        </div>
        
      </div>
      
      <!-- 二维码预览（已移动到模态框） -->
      
    </div>
    
    <!-- 预览与设置模态框 -->
    <div v-if="showPreviewModal" class="modal preview-settings-modal" @click.self="showPreviewModal = false">
      <div class="modal-content preview-settings-modal-content">
        <div class="modal-header">
          <h3>{{ tt('advancedEditor.preview.title') }}</h3>
          <button class="close-btn" @click="showPreviewModal = false">×</button>
        </div>
        <div class="preview-settings-body">
          <div class="qr-preview-sidebar preview-modal-inner">
            <div class="qr-code-display">
              <canvas ref="qrCanvas" class="qr-canvas"></canvas>
            </div>
            
            <div class="action-buttons">
              <button class="action-btn generate-btn" @click="generateQR" :disabled="generating">
                {{ generating ? tt('advancedEditor.preview.generating') : tt('advancedEditor.preview.generate') }}
              </button>
              <button class="action-btn" @click="showStyleModal = true">{{ tt('advancedEditor.preview.editStyle') }}</button>
              <button class="action-btn" @click="previewPage">{{ tt('advancedEditor.preview.preview') }}</button>
              <button class="action-btn primary" @click="updateContent" :disabled="generating">
                {{ generating ? tt('advancedEditor.preview.updating') : tt('advancedEditor.preview.updateContent') }}
              </button>
              <button class="action-btn" @click="downloadQR">{{ tt('advancedEditor.preview.downloadQr') }}</button>
            </div>
            
            <!-- 可变字段 -->
            <div class="variable-fields">
              <div class="variable-header">
                <span>{{ tt('advancedEditor.preview.variableFields') }}</span>
                <button class="add-field-btn" @click="showFieldTypeModal = true">+ {{ tt('advancedEditor.preview.addField') }}</button>
              </div>
              <div v-for="(field, index) in variableFields" :key="index" class="variable-field-item">
                <button 
                  class="field-button" 
                  @click="insertFieldPlaceholder(index)"
                  :title="tt('advancedEditor.preview.clickInsertField', { name: field.name || (tt('advancedEditor.preview.field') + (index + 1)) })"
                >
                  <div class="field-icon">
                    <span v-if="field.type === 'text'">T</span>
                    <span v-else-if="field.type === 'image'">🖼️</span>
                    <span v-else-if="field.type === 'file'">📄</span>
                  </div>
                  <span class="field-number">{{ index + 1 }}</span>
                </button>
                <div class="field-actions">
                  <button @click.stop="editImageField(index)" class="edit-btn">{{ tt('advancedEditor.element.edit') }}</button>
                  <button @click.stop="removeVariableField(index)" class="delete-btn">{{ tt('advancedEditor.element.delete') }}</button>
                </div>
              </div>
            </div>
            
            <!-- 二维码信息面板 -->
            <div v-if="qrInfo" class="qr-info-panel">
              <div class="info-header">
                <span class="success-icon">✅</span>
                <span>{{ tt('advancedEditor.preview.qrGeneratedSuccess') }}</span>
              </div>
              
              <div class="info-details">
                <div class="info-row">
                  <span class="info-label">{{ tt('advancedEditor.preview.info.type') }}</span>
                  <span class="info-value">{{ tt('advancedEditor.preview.info.advancedEditor') }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">{{ tt('advancedEditor.preview.info.size') }}</span>
                  <span class="info-value">{{ qrInfo.size }} × {{ qrInfo.size }}px</span>
                </div>
                <div class="info-row">
                  <span class="info-label">{{ tt('advancedEditor.preview.info.timestamp') }}</span>
                  <span class="info-value">{{ qrInfo.timestamp }}</span>
                </div>
                <div class="info-row content-row">
                  <span class="info-label">{{ tt('advancedEditor.preview.info.content') }}</span>
                  <span class="info-value">{{ qrInfo.content }}</span>
                </div>
                <div v-if="qrInfo.actualContent" class="info-row content-row">
                  <span class="info-label">{{ tt('advancedEditor.preview.info.actualContent') }}</span>
                  <span class="info-value actual-content">{{ qrInfo.actualContent }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 样式库模态框（小屏幕时显示） -->
    <div v-if="showStyleLibraryModal" class="modal style-library-modal" @click.self="showStyleLibraryModal = false">
      <div class="modal-content style-library-modal-content">
        <div class="modal-header">
          <h3>{{ tt('advancedEditor.styleLibrary.title') }}</h3>
          <button class="close-btn" @click="showStyleLibraryModal = false">×</button>
        </div>
        <div class="style-library-content">
          <!-- 颜色选择器 -->
          <div class="color-selector">
            <label>{{ tt('advancedEditor.styleLibrary.color') }}</label>
            <div class="color-picker-wrapper">
              <input 
                type="color" 
                v-model="selectedColor" 
                class="color-input"
                :title="tt('advancedEditor.styleLibrary.selectColor')"
                :aria-label="tt('advancedEditor.styleLibrary.selectColor')"
              />
              <div 
                class="color-preview" 
                :style="{ backgroundColor: selectedColor }"
              ></div>
            </div>
          </div>
          
          <!-- 内容元素标签 -->
          <div class="element-tabs">
            <button
              v-for="tab in elementTabs"
              :key="tab.id"
              :class="['element-tab', { active: activeElementTab === tab.id }]"
              @click="activeElementTab = tab.id"
            >
              {{ tab.label }}
            </button>
          </div>
          
          <!-- 根据选中的标签显示对应的模板 -->
          <div class="template-examples">
            <!-- 标题模板 -->
            <template v-if="activeElementTab === 'title'">
              <div 
                v-for="template in titleTemplatesDisplay"
                :key="template.id"
                class="template-item"
                draggable="true"
                @click="addElementTemplateToEditor(template); showStyleLibraryModal = false"
                @dragstart="handleDragStart($event, template)"
                @dragend="handleDragEnd($event)"
                :title="templateName(template.id)"
              >
                <div class="template-content title-template-preview" :class="`title-${template.style}`">
                  <!-- 两侧短线 -->
                  <template v-if="template.style === 'center-lines-short'">
                    <div style="display: flex; align-items: center; justify-content: center;">
                      <div :style="{ width: '20px', height: '2px', background: selectedColor, marginRight: '8px' }"></div>
                      <span style="font-size: 14px; font-weight: bold;">{{ template.text }}</span>
                      <div :style="{ width: '20px', height: '2px', background: selectedColor, marginLeft: '8px' }"></div>
                    </div>
                  </template>
                  <!-- 两侧长线 -->
                  <template v-else-if="template.style === 'center-lines-long'">
                    <div style="display: flex; align-items: center; justify-content: center;">
                      <div :style="{ width: '40px', height: '2px', background: selectedColor, marginRight: '8px' }"></div>
                      <span style="font-size: 14px; font-weight: bold;">{{ template.text }}</span>
                      <div :style="{ width: '40px', height: '2px', background: selectedColor, marginLeft: '8px' }"></div>
                    </div>
                  </template>
                  <!-- 进度条样式 -->
                  <template v-else-if="template.style === 'progress-bar'">
                    <div style="display: flex;">
                      <div :style="{ background: selectedColor, color: 'white', padding: '6px 12px', fontSize: '11px', fontWeight: 'bold', borderRadius: '3px 0 0 3px' }">{{ template.text }}</div>
                      <div :style="{ background: getLightColor(selectedColor), flex: 1, borderRadius: '0 3px 3px 0' }"></div>
                    </div>
                  </template>
                  <!-- 圆角标签 -->
                  <template v-else-if="template.style === 'tag-rounded'">
                    <div :style="{ background: selectedColor, color: 'white', padding: '6px 14px', borderRadius: '15px 3px 15px 3px', display: 'inline-block', fontSize: '12px', fontWeight: 'bold' }">{{ template.text }}</div>
                  </template>
                  <!-- 边框矩形 -->
                  <template v-else-if="template.style === 'bordered-rect'">
                    <div :style="{ background: selectedColor, color: 'white', padding: '8px 16px', border: '2px solid white', borderRadius: '3px', display: 'inline-block', fontSize: '12px', fontWeight: 'bold' }">{{ template.text }}</div>
                  </template>
                  <!-- 层叠效果 -->
                  <template v-else-if="template.style === 'layered'">
                    <div style="position: relative;">
                      <div :style="{ position: 'absolute', top: '-2px', left: '-2px', width: '100%', height: '100%', background: selectedColor, borderRadius: '3px', zIndex: 0 }"></div>
                      <div :style="{ position: 'relative', background: 'white', color: selectedColor, padding: '6px 14px', borderRadius: '3px', fontSize: '12px', fontWeight: 'bold', zIndex: 1, border: `1px solid ${selectedColor}` }">{{ template.text }}</div>
                    </div>
                  </template>
                  <!-- 椭圆虚线 -->
                  <template v-else-if="template.style === 'oval-dashed'">
                    <div :style="{ background: selectedColor, color: 'white', padding: '6px 20px', borderRadius: '20px', border: '1px dashed white', display: 'inline-block', fontSize: '12px', fontWeight: 'bold' }">{{ template.text }}</div>
                  </template>
                  <!-- 平行四边形 -->
                  <template v-else-if="template.style === 'parallelogram'">
                    <div :style="{ background: selectedColor, color: 'white', padding: '6px 20px', transform: 'skewX(-8deg)', display: 'inline-block', fontSize: '12px', fontWeight: 'bold', position: 'relative' }">
                      <span style="transform: skewX(8deg); display: inline-block;">{{ template.text }}</span>
                    </div>
                  </template>
                  <!-- 编号样式 -->
                  <template v-else-if="template.style === 'numbered'">
                    <div style="display: flex; align-items: center;">
                      <div :style="{ background: selectedColor, color: 'white', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', borderRadius: '3px', marginRight: '6px' }">{{ template.number || '01' }}</div>
                      <div :style="{ flex: 1, border: `1px solid ${selectedColor}`, padding: '6px 10px', borderRadius: '3px', color: selectedColor, fontSize: '12px', fontWeight: 'bold' }">{{ template.text }}</div>
                    </div>
                  </template>
                  <template v-else>
                    <span style="font-size: 14px; font-weight: bold;">{{ template.text }}</span>
                  </template>
                </div>
              </div>
            </template>
            
            <!-- 正文模板 -->
            <template v-else-if="activeElementTab === 'body'">
              <div 
                v-for="template in bodyTemplatesDisplay"
                :key="template.id"
                class="template-item"
                draggable="true"
                @click="addElementTemplateToEditor(template); showStyleLibraryModal = false"
                @dragstart="handleDragStart($event, template)"
                @dragend="handleDragEnd($event)"
                :title="templateName(template.id)"
              >
                <div class="template-content body-template-preview" :class="`body-${template.style}`">
                  <!-- 纯文本 -->
                  <template v-if="template.style === 'plain'">
                    <p style="font-size: 11px; line-height: 1.6; color: #333; margin: 4px 0; text-align: left;">{{ template.text.substring(0, 25) }}...</p>
                  </template>
                  <!-- 蓝色边框框 -->
                  <template v-else-if="template.style === 'bordered-box'">
                    <div :style="{ border: `1px solid ${selectedColor}`, borderRadius: '4px', padding: '8px', margin: '4px 0' }">
                      <p style="font-size: 11px; line-height: 1.6; color: #333; margin: 0;">{{ template.text.substring(0, 20) }}...</p>
                    </div>
                  </template>
                  <!-- 左侧竖条 -->
                  <template v-else-if="template.style === 'left-vertical-bar'">
                    <div style="display: flex; margin: 4px 0;">
                      <div :style="{ width: '3px', background: selectedColor, marginRight: '8px', flexShrink: 0 }"></div>
                      <p style="font-size: 11px; line-height: 1.6; color: #333; margin: 0; flex: 1;">{{ template.text.substring(0, 20) }}...</p>
                    </div>
                  </template>
                  <!-- 上下双线 -->
                  <template v-else-if="template.style === 'double-horizontal-lines'">
                    <div style="margin: 4px 0;">
                      <div :style="{ height: '1px', background: selectedColor, marginBottom: '6px' }"></div>
                      <p style="font-size: 11px; line-height: 1.6; color: #333; margin: 0;">{{ template.text.substring(0, 20) }}...</p>
                      <div :style="{ height: '1px', background: selectedColor, marginTop: '6px' }"></div>
                    </div>
                  </template>
                  <!-- 气泡标题 -->
                  <template v-else-if="template.style === 'bubble-title'">
                    <div style="margin: 4px 0;">
                      <div :style="{ background: selectedColor, color: 'white', padding: '4px 10px', borderRadius: '10px 10px 10px 2px', display: 'inline-block', fontSize: '10px', fontWeight: 'bold', marginBottom: '4px' }">{{ template.title || tt('advancedEditor.placeholderTitleText') }}</div>
                      <div :style="{ background: getLightColor(selectedColor), borderRadius: '4px', padding: '6px', marginTop: '4px' }">
                        <p style="font-size: 11px; line-height: 1.6; color: #333; margin: 0;">{{ template.text.substring(0, 18) }}...</p>
                      </div>
                    </div>
                  </template>
                  <!-- 虚线框标题 -->
                  <template v-else-if="template.style === 'dashed-box-title'">
                    <div :style="{ border: `1px dashed ${selectedColor}`, borderRadius: '4px', padding: '8px', margin: '4px 0' }">
                      <div :style="{ color: selectedColor, fontWeight: 'bold', marginBottom: '4px', fontSize: '10px' }">{{ template.title || tt('advancedEditor.placeholderTitleText') }}</div>
                      <p style="font-size: 11px; line-height: 1.6; color: #333; margin: 0;">{{ template.text.substring(0, 20) }}...</p>
                    </div>
                  </template>
                  <template v-else>
                    <p style="font-size: 11px; line-height: 1.6; color: #333; margin: 4px 0; text-align: left;">{{ template.text.substring(0, 25) }}...</p>
                  </template>
                </div>
              </div>
            </template>
            
            <!-- 图片模板 -->
            <template v-else-if="activeElementTab === 'image'">
              <div 
                v-for="template in imageTemplatesDisplay"
                :key="template.id"
                class="template-item"
                draggable="true"
                @click.stop="addElementTemplateToEditor(template); showStyleLibraryModal = false"
                @dragstart="handleDragStart($event, template)"
                @dragend="handleDragEnd($event)"
                :title="templateName(template.id)"
              >
                <div class="template-content image-template-preview">
                  <template v-if="template.style === 'icon-group'">
                    <div style="display: flex; gap: 8px; justify-content: space-around;">
                      <div v-for="(item, idx) in template.icons" :key="idx" style="text-align: center; flex: 1;">
                        <div :style="{ width: '40px', height: '40px', background: item.bgColor, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', margin: '0 auto 4px' }">
                          {{ item.icon }}
                        </div>
                        <div style="font-size: 9px; color: #333;">{{ item.label }}</div>
                      </div>
                    </div>
                  </template>
                  <template v-else-if="template.style === 'photo-card'">
                    <div :style="getPhotoCardStyle(template)">
                      <div style="color: white; font-weight: bold; font-size: 10px; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">{{ template.label || tt('advancedEditor.imageTitle') }}</div>
                    </div>
                  </template>
                  <template v-else-if="template.style === 'photo-group-2'">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; width: 100%; height: 50px;">
                      <div :style="{ backgroundImage: `url(${getImagePath(template.images[0])})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '4px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '4px', position: 'relative' }">
                        <div style="color: white; font-size: 7px; font-weight: bold; text-shadow: 0 1px 2px rgba(0,0,0,0.5);">{{ template.images[0] }}</div>
                      </div>
                      <div :style="{ backgroundImage: `url(${getImagePath(template.images[1])})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '4px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '4px', position: 'relative' }">
                        <div style="color: white; font-size: 7px; font-weight: bold; text-shadow: 0 1px 2px rgba(0,0,0,0.5);">{{ template.images[1] }}</div>
                      </div>
                    </div>
                  </template>
                  <template v-else-if="template.style === 'photo-group-3'">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: auto auto; gap: 4px; width: 100%; height: 80px;">
                      <div :style="{ gridRow: '1 / 3', backgroundImage: `url(${getImagePath(template.images[0])})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '4px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '4px', position: 'relative' }">
                        <div style="color: white; font-size: 7px; font-weight: bold; text-shadow: 0 1px 2px rgba(0,0,0,0.5);">{{ template.images[0] }}</div>
                      </div>
                      <div :style="{ backgroundImage: `url(${getImagePath(template.images[1])})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '4px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '3px', position: 'relative' }">
                        <div style="color: white; font-size: 6px; font-weight: bold; text-shadow: 0 1px 2px rgba(0,0,0,0.5);">{{ template.images[1] }}</div>
                      </div>
                      <div :style="{ backgroundImage: `url(${getImagePath(template.images[2])})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '4px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '3px', position: 'relative' }">
                        <div style="color: white; font-size: 6px; font-weight: bold; text-shadow: 0 1px 2px rgba(0,0,0,0.5);">{{ template.images[2] }}</div>
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <div style="width: 100%; height: 60px; background: #f0f0f0; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #999; font-size: 12px;">{{ tt('advancedEditor.imageTemplate') }}</div>
                  </template>
                </div>
              </div>
            </template>
            
            <!-- 分隔线模板 -->
            <template v-else-if="activeElementTab === 'divider'">
              <div 
                v-for="template in dividerTemplatesDisplay"
                :key="template.id"
                class="template-item"
                draggable="true"
                @click="addElementTemplateToEditor(template); showStyleLibraryModal = false"
                @dragstart="handleDragStart($event, template)"
                @dragend="handleDragEnd($event)"
                :title="templateName(template.id)"
              >
                <div class="template-content divider-template-preview">
                  <template v-if="template.style === 'dotted'">
                    <div style="display: flex; align-items: center; margin: 8px 0;">
                      <span :style="{ color: selectedColor, fontSize: '14px', marginRight: '6px', lineHeight: '1' }">⋯</span>
                      <div :style="{ flex: 1, borderTop: `1px dotted ${selectedColor}` }"></div>
                    </div>
                  </template>
                  <template v-else-if="template.style === 'dashed'">
                    <div style="display: flex; align-items: center; margin: 8px 0;">
                      <span :style="{ color: selectedColor, fontSize: '14px', marginRight: '6px', lineHeight: '1' }">┅</span>
                      <div :style="{ flex: 1, borderTop: `1px dashed ${selectedColor}` }"></div>
                    </div>
                  </template>
                  <template v-else-if="template.style === 'solid'">
                    <div style="display: flex; align-items: center; margin: 8px 0;">
                      <span :style="{ color: selectedColor, fontSize: '14px', marginRight: '6px', lineHeight: '1' }">━</span>
                      <div :style="{ flex: 1, borderTop: `1px solid ${selectedColor}` }"></div>
                    </div>
                  </template>
                  <template v-else-if="template.style === 'double'">
                    <div style="display: flex; align-items: center; margin: 8px 0;">
                      <span :style="{ color: selectedColor, fontSize: '14px', marginRight: '6px', lineHeight: '1' }">═</span>
                      <div :style="{ flex: 1, borderTop: `2px double ${selectedColor}` }"></div>
                    </div>
                  </template>
                  <template v-else-if="template.style === 'wavy'">
                    <div style="display: flex; align-items: center; margin: 8px 0;">
                      <span :style="{ color: selectedColor, fontSize: '14px', marginRight: '6px', lineHeight: '1' }">〰️</span>
                      <div :style="{ flex: 1, height: '2px', background: `repeating-linear-gradient(90deg, ${selectedColor} 0, ${selectedColor} 4px, transparent 4px, transparent 8px)` }"></div>
                    </div>
                  </template>
                  <template v-else-if="template.style === 'end-lines'">
                    <div style="display: flex; align-items: center; margin: 8px 0;">
                      <span :style="{ color: selectedColor, fontSize: '14px', marginRight: '6px', lineHeight: '1' }">📏</span>
                      <div :style="{ flex: 1, height: '1px', background: selectedColor }"></div>
                      <div :style="{ padding: '0 6px', color: selectedColor, fontWeight: 'bold', fontSize: '10px' }">END</div>
                      <div :style="{ flex: 1, height: '1px', background: selectedColor }"></div>
                    </div>
                  </template>
                  <template v-else-if="template.style === 'end-dots'">
                    <div style="display: flex; align-items: center; justify-content: center; margin: 8px 0;">
                      <span :style="{ color: selectedColor, fontSize: '14px', marginRight: '6px', lineHeight: '1' }">⚫</span>
                      <div :style="{ width: '4px', height: '4px', background: selectedColor, borderRadius: '50%', marginRight: '4px' }"></div>
                      <div :style="{ color: selectedColor, fontWeight: 'bold', fontSize: '10px' }">END</div>
                      <div :style="{ width: '4px', height: '4px', background: selectedColor, borderRadius: '50%', marginLeft: '4px' }"></div>
                    </div>
                  </template>
                  <template v-else>
                    <div :style="{ height: template.height || '1px', background: selectedColor, width: '100%' }"></div>
                  </template>
                </div>
              </div>
            </template>
            
            <!-- 导航模板 -->
            <template v-else-if="activeElementTab === 'nav'">
              <div 
                v-for="template in navTemplatesDisplay"
                :key="template.id"
                class="template-item"
                draggable="true"
                @click="addElementTemplateToEditor(template); showStyleLibraryModal = false"
                @dragstart="handleDragStart($event, template)"
                @dragend="handleDragEnd($event)"
                :title="templateName(template.id)"
              >
                <div class="template-content nav-template-preview">
                  <template v-if="template.style === 'list-simple'">
                    <div v-for="(item, idx) in template.items.slice(0, 2)" :key="idx" style="display: flex; align-items: center; padding: 6px; border-bottom: 1px solid #f0f0f0; margin-bottom: 4px;">
                      <div :style="{ width: '30px', height: '30px', backgroundImage: `url(${getImagePath(item.image || item.title)})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '4px', marginRight: '6px', flexShrink: 0 }"></div>
                      <div style="flex: 1; font-weight: bold; color: #333; font-size: 11px;">{{ item.title || item }}</div>
                      <div style="color: #2196F3; font-size: 14px;">→</div>
                    </div>
                  </template>
                  <template v-else-if="template.style === 'list-detail'">
                    <div v-for="(item, idx) in template.items.slice(0, 2)" :key="idx" style="display: flex; align-items: center; padding: 6px; border-bottom: 1px solid #f0f0f0; margin-bottom: 4px;">
                      <div :style="{ width: '30px', height: '30px', backgroundImage: `url(${getImagePath(item.image || item.title)})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '4px', marginRight: '6px', flexShrink: 0 }"></div>
                      <div style="flex: 1;">
                        <div style="font-weight: bold; color: #333; margin-bottom: 2px; font-size: 11px;">{{ item.title || item }}</div>
                        <div style="font-size: 9px; color: #999;">{{ (item.subtitle || '').substring(0, 10) }}...</div>
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <div style="display: flex; gap: 8px; justify-content: space-around;">
                      <div v-for="(item, idx) in (template.items || []).slice(0, 4)" :key="idx" style="text-align: center; flex: 1;">
                        <div :style="{ width: '30px', height: '30px', background: selectedColor, borderRadius: '6px', margin: '0 auto 4px' }"></div>
                        <div style="font-size: 9px; color: #333;">{{ item.label || tt('advancedEditor.navLabel') }}</div>
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </template>
            
            <!-- 表格模板 -->
            <template v-else-if="activeElementTab === 'table'">
              <div 
                v-for="template in tableTemplatesDisplay"
                :key="template.id"
                class="template-item"
                draggable="true"
                @click="addElementTemplateToEditor(template); showStyleLibraryModal = false"
                @dragstart="handleDragStart($event, template)"
                @dragend="handleDragEnd($event)"
                :title="templateName(template.id)"
              >
                <div class="template-content table-template-preview">
                  <!-- 无边框键值对 -->
                  <template v-if="template.style === 'key-value'">
                    <div v-for="(field, idx) in template.fields.slice(0, 2)" :key="idx" style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f0f0f0; font-size: 10px;">
                      <span style="color: #666;">{{ field.label }}</span>
                      <span style="color: #333; font-weight: 500;">{{ field.value }}</span>
                    </div>
                  </template>
                  <!-- 带边框 -->
                  <template v-else-if="template.style === 'bordered'">
                    <div style="border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden; font-size: 10px;">
                      <div v-for="(field, idx) in template.fields.slice(0, 2)" :key="idx" style="display: flex; border-bottom: 1px solid #e0e0e0; padding: 6px;">
                        <div style="flex: 1; color: #666; border-right: 1px solid #e0e0e0; padding-right: 8px;">{{ field.label }}</div>
                        <div style="flex: 1; color: #333; padding-left: 8px;">{{ field.value }}</div>
                      </div>
                    </div>
                  </template>
                  <!-- 交替行灰色 -->
                  <template v-else-if="template.style === 'alternating'">
                    <div style="font-size: 10px;">
                      <div v-for="(field, idx) in template.fields.slice(0, 2)" :key="idx" :style="{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', background: idx % 2 === 0 ? '#f9f9f9' : 'white' }">
                        <span style="color: #666;">{{ field.label }}</span>
                        <span style="color: #333; font-weight: 500;">{{ field.value }}</span>
                      </div>
                    </div>
                  </template>
                  <!-- 带表头 -->
                  <template v-else-if="template.style === 'with-header'">
                    <div style="border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden; font-size: 10px;">
                      <div style="background: #f5f5f5; padding: 6px; font-weight: bold; color: #333; border-bottom: 1px solid #e0e0e0;">{{ template.fields[0]?.value || tt('advancedEditor.tableHeaderPlaceholder') }}</div>
                      <div v-for="(field, idx) in template.fields.slice(1, 3)" :key="idx" style="display: flex; border-bottom: 1px solid #e0e0e0; padding: 6px;">
                        <div style="flex: 1; color: #666; border-right: 1px solid #e0e0e0; padding-right: 8px;">{{ field.label }}</div>
                        <div style="flex: 1; color: #333; padding-left: 8px;">{{ field.value }}</div>
                      </div>
                    </div>
                  </template>
                  <!-- 内联键值对 -->
                  <template v-else-if="template.style === 'inline'">
                    <div style="font-size: 10px;">
                      <div v-for="(field, idx) in template.fields.slice(0, 2)" :key="idx" style="padding: 4px 0;">
                        <span style="color: #666;">{{ field.label }}：</span>
                        <span style="color: #333; font-weight: 500;">{{ field.value }}</span>
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <div style="font-size: 10px; color: #666;">{{ tt('advancedEditor.tableTemplate') }}</div>
                  </template>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 样式修改模态框 -->
    <div v-if="showStyleModal" class="modal" @click.self="showStyleModal = false">
      <div class="modal-content">
        <h3>{{ tt('advancedEditor.styleModal.title') }}</h3>
        <div class="style-options">
          <label>{{ tt('advancedEditor.styleModal.qrColor') }}</label>
          <input type="color" v-model="qrStyle.foregroundColor" :title="tt('advancedEditor.styleModal.pickQrColor')" :aria-label="tt('advancedEditor.styleModal.pickQrColor')" />
          <label>{{ tt('advancedEditor.styleModal.bgColor') }}</label>
          <input type="color" v-model="qrStyle.backgroundColor" :title="tt('advancedEditor.styleModal.pickBgColor')" :aria-label="tt('advancedEditor.styleModal.pickBgColor')" />
          <label>{{ tt('advancedEditor.styleModal.errorLevel') }}</label>
          <select v-model="qrStyle.errorLevel" :title="tt('advancedEditor.styleModal.pickErrorLevel')" :aria-label="tt('advancedEditor.styleModal.pickErrorLevel')">
            <option value="L">{{ tt('advancedEditor.styleModal.levelLow') }}</option>
            <option value="M">{{ tt('advancedEditor.styleModal.levelMedium') }}</option>
            <option value="Q">{{ tt('advancedEditor.styleModal.levelHigh') }}</option>
            <option value="H">{{ tt('advancedEditor.styleModal.levelHigher') }}</option>
          </select>
        </div>
        <button @click="showStyleModal = false">{{ tt('toast.ok') }}</button>
      </div>
    </div>
    
    <!-- 前景色选择器 -->
    <div v-if="showForegroundColorPicker" class="modal" @click.self="showForegroundColorPicker = false">
      <div class="modal-content">
        <h3>{{ tt('advancedEditor.colorPicker.foregroundTitle') }}</h3>
        <div class="color-picker-container">
          <input type="color" v-model="customForegroundColor" class="custom-color-picker" :title="tt('advancedEditor.colorPicker.foregroundTitle')" :aria-label="tt('advancedEditor.colorPicker.foregroundTitle')" />
          <div class="color-preview" :style="{ color: customForegroundColor }">{{ tt('advancedEditor.colorPicker.previewText') }}</div>
        </div>
        <div class="modal-actions">
          <button @click="applyForegroundColor(customForegroundColor); showForegroundColorPicker = false">{{ tt('toast.ok') }}</button>
          <button @click="showForegroundColorPicker = false">{{ tt('toast.cancel') }}</button>
        </div>
      </div>
    </div>
    
    <!-- 背景色选择器 -->
    <div v-if="showBackgroundColorPicker" class="modal" @click.self="showBackgroundColorPicker = false">
      <div class="modal-content">
        <h3>{{ tt('advancedEditor.colorPicker.backgroundTitle') }}</h3>
        <div class="color-picker-container">
          <input type="color" v-model="customBackgroundColor" class="custom-color-picker" :title="tt('advancedEditor.colorPicker.backgroundTitle')" :aria-label="tt('advancedEditor.colorPicker.backgroundTitle')" />
          <div class="color-preview" :style="{ backgroundColor: customBackgroundColor, color: '#000', padding: '10px', marginTop: '10px' }">{{ tt('advancedEditor.colorPicker.previewBg') }}</div>
        </div>
        <div class="modal-actions">
          <button @click="applyBackgroundColor(customBackgroundColor); showBackgroundColorPicker = false">{{ tt('toast.ok') }}</button>
          <button @click="showBackgroundColorPicker = false">{{ tt('toast.cancel') }}</button>
        </div>
      </div>
    </div>
    
    <!-- 背景设置模态框 -->
    <div v-if="showBackgroundModal" class="modal" @click.self="showBackgroundModal = false">
      <div class="modal-content">
        <h3>{{ tt('advancedEditor.backgroundModal.title') }}</h3>
        <div class="style-options">
          <label>{{ tt('advancedEditor.backgroundModal.pageBgColor') }}</label>
          <input type="color" v-model="pageBackgroundColor" :title="tt('advancedEditor.backgroundModal.pickPageBgColor')" :aria-label="tt('advancedEditor.backgroundModal.pickPageBgColor')" />
          
          <label style="margin-top: 15px;">{{ tt('advancedEditor.backgroundModal.pageBgImage') }}</label>
          <div class="background-image-upload">
            <input type="file" ref="backgroundImageInput" accept="image/*" @change="handleBackgroundImageUpload" style="display: none;" />
            <button class="upload-btn" @click="$refs.backgroundImageInput.click()">{{ tt('advancedEditor.backgroundModal.uploadBg') }}</button>
            <button v-if="pageBackgroundImage" class="clear-btn" @click="pageBackgroundImage = ''" style="margin-left: 10px;">{{ tt('advancedEditor.backgroundModal.clearBg') }}</button>
          </div>
          <div v-if="pageBackgroundImage" class="background-preview" style="margin-top: 10px; max-height: 150px; overflow: hidden; border-radius: 4px;">
            <img :src="pageBackgroundImage" :alt="tt('advancedEditor.backgroundModal.preview')" style="width: 100%; object-fit: cover;" />
          </div>
        </div>
        <div class="modal-actions">
          <button @click="showBackgroundModal = false">{{ tt('toast.ok') }}</button>
        </div>
      </div>
    </div>

    <!-- 图片设置模态框 -->
    <div v-if="showImageModal" class="modal" @click.self="showImageModal = false">
      <div class="modal-content-large image-settings-modal">
        <div class="modal-header">
          <h3>{{ tt('advancedEditor.imageModal.title') }}</h3>
          <button class="close-btn" @click="showImageModal = false">✕</button>
        </div>
        <div class="modal-body-image">
          <div class="image-upload-section">
            <label>{{ tt('advancedEditor.imageModal.upload') }}</label>
            <div class="images-upload-container">
              <div 
                v-for="(image, index) in imageUploadData" 
                :key="index"
                :class="['uploaded-image-item', { 'selected': selectedImageIndex === index }]"
                @click="selectImageForPreview(index)"
              >
                <img :src="image" :alt="tt('advancedEditor.imageModal.preview')" class="uploaded-image-preview" />
                <button class="remove-image-btn" @click.stop="removeImage(index)" :title="tt('advancedEditor.element.delete')">✕</button>
              </div>
              <div class="image-upload-area" @click="selectImageFile">
                <div class="upload-placeholder">
                  <div class="upload-icon">+</div>
                  <span class="upload-text">{{ tt('advancedEditor.imageModal.addImage') }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="image-preview-section" v-if="imageUploadData.length > 0">
            <label>{{ tt('advancedEditor.imageModal.preview') }}</label>
            <div class="preview-area">
              <img 
                :src="imageUploadData[selectedImageIndex]" 
                :alt="tt('advancedEditor.imageModal.preview')" 
                class="preview-image"
                :style="imageStyle.size === 'original' ? 'width: auto; height: auto; max-width: 100%; max-height: 200px; object-fit: contain;' : 'width: 100%; max-width: 100%; height: auto; max-height: 200px; object-fit: contain;'"
              />
            </div>
          </div>
        </div>
        <div class="image-style-settings">
          <label>{{ tt('advancedEditor.imageModal.styleSettings') }}</label>
          <div class="radio-group">
            <label class="radio-label">
              <input type="radio" v-model="imageStyle.size" value="original" :title="tt('advancedEditor.imageModal.originalSize')" :aria-label="tt('advancedEditor.imageModal.originalSize')" />
              <span>{{ tt('advancedEditor.imageModal.originalSize') }}</span>
            </label>
            <label class="radio-label">
              <input type="radio" v-model="imageStyle.size" value="fill" :title="tt('advancedEditor.imageModal.fill')" :aria-label="tt('advancedEditor.imageModal.fill')" />
              <span>{{ tt('advancedEditor.imageModal.fill') }}</span>
            </label>
          </div>
        </div>
        <div class="image-display-settings">
          <label>{{ tt('advancedEditor.imageModal.displaySettings') }}</label>
          <div class="radio-group">
            <label class="radio-label">
              <input type="radio" v-model="imageStyle.display" value="seamless" :title="tt('advancedEditor.imageModal.seamless')" :aria-label="tt('advancedEditor.imageModal.seamless')" />
              <span>{{ tt('advancedEditor.imageModal.seamless') }}</span>
            </label>
            <label class="radio-label">
              <input type="radio" v-model="imageStyle.display" value="spaced" :title="tt('advancedEditor.imageModal.spaced')" :aria-label="tt('advancedEditor.imageModal.spaced')" />
              <span>{{ tt('advancedEditor.imageModal.spaced') }}</span>
            </label>
            <label class="radio-label">
              <input type="radio" v-model="imageStyle.display" value="carousel" :title="tt('advancedEditor.imageModal.carousel')" :aria-label="tt('advancedEditor.imageModal.carousel')" />
              <span>{{ tt('advancedEditor.imageModal.carousel') }}</span>
            </label>
          </div>
          <!-- 轮播时间选择（仅在选择图片轮播时显示） -->
          <div v-if="imageStyle.display === 'carousel'" class="carousel-interval-selector" style="margin-top: 12px;">
            <label style="display: block; margin-bottom: 8px; font-size: 0.9rem; color: #666;">{{ tt('advancedEditor.imageModal.carouselInterval') }}</label>
            <select v-model="imageStyle.carouselInterval" style="width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 0.9rem; background: white; cursor: pointer;">
              <option value="manual">{{ tt('advancedEditor.imageModal.manualCarousel') }}</option>
              <option value="1000">{{ tt('advancedEditor.imageModal.sec1') }}</option>
              <option value="2000">{{ tt('advancedEditor.imageModal.sec2') }}</option>
              <option value="3000">{{ tt('advancedEditor.imageModal.sec3') }}</option>
              <option value="4000">{{ tt('advancedEditor.imageModal.sec4') }}</option>
              <option value="5000">{{ tt('advancedEditor.imageModal.sec5') }}</option>
            </select>
          </div>
        </div>
        <div class="warm-tips">
          <label>{{ tt('advancedEditor.imageModal.tips') }}</label>
          <div class="tips-content">
            <p>{{ tt('advancedEditor.imageModal.tip1') }}</p>
            <p>{{ tt('advancedEditor.imageModal.tip2Prefix') }}<a href="#" class="link">{{ tt('advancedEditor.imageModal.auditRules') }}</a></p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="confirm-btn" @click="handleConfirmImageSettings">{{ tt('toast.ok') }}</button>
        </div>
      </div>
    </div>
    
    <!-- 表格选择器模态框 -->
    <div v-if="showTableModal" class="modal" @click.self="showTableModal = false">
      <div class="modal-content-medium">
        <div class="modal-header">
          <h3>{{ tt('advancedEditor.tableModal.title') }}</h3>
          <button class="close-btn" @click="showTableModal = false">✕</button>
        </div>
        <div class="modal-body-form">
          <div class="form-row">
            <label>{{ tt('advancedEditor.tableModal.selectSize') }}</label>
            <div class="table-grid-selector" @mouseleave="hoveredTableRows = 0; hoveredTableCols = 0">
              <div 
                v-for="row in 10" 
                :key="row"
                class="table-grid-row"
              >
                <div 
                  v-for="col in 10" 
                  :key="col"
                  :class="['table-grid-cell', { 
                    'selected': selectedTableRows >= row && selectedTableCols >= col,
                    'hovered': hoveredTableRows >= row && hoveredTableCols >= col && (selectedTableRows !== row || selectedTableCols !== col)
                  }]"
                  @mouseenter="hoverTableGrid(row, col)"
                  @click="selectTableSize(row, col)"
                  :title="`${row} x ${col}`"
                ></div>
              </div>
            </div>
            <div class="table-size-display" v-if="selectedTableRows > 0 && selectedTableCols > 0">
              {{ tt('advancedEditor.tableModal.selected', { rows: selectedTableRows, cols: selectedTableCols }) }}
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="showTableModal = false">{{ tt('toast.cancel') }}</button>
          <button class="confirm-btn" @click="insertTable" :disabled="selectedTableRows === 0 || selectedTableCols === 0">{{ tt('toast.ok') }}</button>
        </div>
      </div>
    </div>
    
    <!-- 联系方式模态框 -->
    <div v-if="showContactModal" class="modal" @click.self="showContactModal = false">
      <div class="modal-content-medium">
        <div class="modal-header">
          <h3>{{ tt('advancedEditor.contactModal.title') }}</h3>
          <button class="close-btn" @click="showContactModal = false">✕</button>
        </div>
        <div class="modal-body-form">
          <div class="form-row">
            <label>{{ tt('advancedEditor.contactModal.fields.title') }}</label>
            <input type="text" v-model="contactData.title" :placeholder="tt('advancedEditor.contactModal.placeholders.title')" />
          </div>
          <div class="form-row">
            <label>{{ tt('advancedEditor.contactModal.fields.phone') }}</label>
            <input type="text" v-model="contactData.phone" :placeholder="tt('advancedEditor.contactModal.placeholders.phone')" :title="tt('advancedEditor.contactModal.fields.phone')" :aria-label="tt('advancedEditor.contactModal.fields.phone')" />
          </div>
          <div class="form-row">
            <label>{{ tt('advancedEditor.contactModal.fields.wechat') }}</label>
            <input type="text" v-model="contactData.wechat" :placeholder="tt('advancedEditor.contactModal.placeholders.wechat')" :title="tt('advancedEditor.contactModal.fields.wechat')" :aria-label="tt('advancedEditor.contactModal.fields.wechat')" />
          </div>
          <div class="form-row">
            <label>{{ tt('advancedEditor.contactModal.fields.email') }}</label>
            <input type="email" v-model="contactData.email" :placeholder="tt('advancedEditor.contactModal.placeholders.email')" :title="tt('advancedEditor.contactModal.fields.email')" :aria-label="tt('advancedEditor.contactModal.fields.email')" />
          </div>
          <div class="form-row">
            <label>{{ tt('advancedEditor.contactModal.fields.address') }}</label>
            <input type="text" v-model="contactData.address" :placeholder="tt('advancedEditor.contactModal.placeholders.address')" :title="tt('advancedEditor.contactModal.fields.address')" :aria-label="tt('advancedEditor.contactModal.fields.address')" />
          </div>
          <div class="form-row">
            <label>{{ tt('advancedEditor.contactModal.fields.remarks') }}</label>
            <input type="text" v-model="contactData.remarks" :placeholder="tt('advancedEditor.contactModal.placeholders.remarks')" :title="tt('advancedEditor.contactModal.fields.remarks')" :aria-label="tt('advancedEditor.contactModal.fields.remarks')" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="confirm-btn" @click="confirmContact">{{ tt('toast.ok') }}</button>
        </div>
      </div>
    </div>
    
    <!-- 字段类型选择模态框 -->
    <div v-if="showFieldTypeModal" class="modal" @click.self="showFieldTypeModal = false">
      <div class="modal-content-medium">
        <div class="modal-header">
          <h3>{{ tt('advancedEditor.fieldModal.addVariableField') }}</h3>
          <button class="close-btn" @click="showFieldTypeModal = false">✕</button>
        </div>
        <div class="modal-body">
          <p class="field-description">{{ tt('advancedEditor.fieldModal.description') }}</p>
          <div class="field-type-buttons">
            <button class="field-type-btn" @click="addFieldByType('text')">
              <div class="field-type-icon">T</div>
              <span>{{ tt('advancedEditor.fieldModal.textField') }}</span>
            </button>
            <button class="field-type-btn" @click="addFieldByType('image')">
              <div class="field-type-icon">🖼️</div>
              <span>{{ tt('advancedEditor.fieldModal.imageField') }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 字段编辑模态框（文本、图片、文件字段共用） -->
    <div v-if="showImageFieldEditModal" class="modal" @click.self="showImageFieldEditModal = false">
      <div class="modal-content-medium">
        <div class="modal-header">
          <h3>{{ tt('advancedEditor.fieldModal.editField') }}</h3>
          <button class="close-btn" @click="showImageFieldEditModal = false">✕</button>
        </div>
        <div class="modal-body-form">
          <div class="form-row">
            <label>{{ tt('advancedEditor.fieldModal.fieldName') }}</label>
            <input 
              type="text" 
              v-model="editingImageField.name" 
              :placeholder="tt('advancedEditor.fieldModal.fieldNamePlaceholder')" 
              :title="tt('advancedEditor.fieldModal.fieldName')" 
              :aria-label="tt('advancedEditor.fieldModal.fieldName')" 
            />
          </div>
          <!-- 图片字段特有的设置 -->
          <div v-if="editingImageField.type === 'image'" class="form-row">
            <label>{{ tt('advancedEditor.imageModal.styleSettings') }}</label>
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" v-model="editingImageField.config.size" value="original" />
                <span>{{ tt('advancedEditor.fieldModal.leaveBlank') }}</span>
              </label>
              <label class="radio-label">
                <input type="radio" v-model="editingImageField.config.size" value="fill" />
                <span>{{ tt('advancedEditor.imageModal.fill') }}</span>
              </label>
            </div>
          </div>
          <div v-if="editingImageField.type === 'image'" class="form-row">
            <label>{{ tt('advancedEditor.imageModal.displaySettings') }}</label>
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" v-model="editingImageField.config.display" value="seamless" />
                <span>{{ tt('advancedEditor.imageModal.seamless') }}</span>
              </label>
              <label class="radio-label">
                <input type="radio" v-model="editingImageField.config.display" value="spaced" />
                <span>{{ tt('advancedEditor.imageModal.spaced') }}</span>
              </label>
              <label class="radio-label">
                <input type="radio" v-model="editingImageField.config.display" value="carousel" />
                <span>{{ tt('advancedEditor.imageModal.carousel') }}</span>
              </label>
            </div>
            <!-- 轮播时间选择（仅在选择图片轮播时显示） -->
            <div v-if="editingImageField.config.display === 'carousel'" class="carousel-interval-selector" style="margin-top: 12px;">
              <label style="display: block; margin-bottom: 8px; font-size: 0.9rem; color: #666;">{{ tt('advancedEditor.imageModal.carouselInterval') }}</label>
              <select v-model="editingImageField.config.carouselInterval" style="width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 0.9rem; background: white; cursor: pointer;">
                <option value="manual">{{ tt('advancedEditor.imageModal.manualCarousel') }}</option>
                <option value="1000">{{ tt('advancedEditor.imageModal.sec1') }}</option>
                <option value="2000">{{ tt('advancedEditor.imageModal.sec2') }}</option>
                <option value="3000">{{ tt('advancedEditor.imageModal.sec3') }}</option>
                <option value="4000">{{ tt('advancedEditor.imageModal.sec4') }}</option>
                <option value="5000">{{ tt('advancedEditor.imageModal.sec5') }}</option>
              </select>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="confirm-btn" @click="confirmImageFieldEdit">{{ tt('toast.ok') }}</button>
        </div>
      </div>
    </div>
    
    <!-- 地图位置模态框 -->
    <div v-if="showLocationModal" class="modal" @click.self="showLocationModal = false">
      <div class="modal-content-medium">
        <div class="modal-header">
          <h3>{{ tt('advancedEditor.locationModal.title') }}</h3>
          <button class="close-btn" @click="showLocationModal = false">✕</button>
        </div>
        <div class="modal-body-form">
          <div class="form-row">
            <label>{{ tt('advancedEditor.locationModal.address') }}</label>
            <input type="text" v-model="locationData.address" :placeholder="tt('advancedEditor.locationModal.placeholder')" />
          </div>
          <div class="form-row">
            <button class="map-location-btn" @click="insertMapLocation">{{ tt('advancedEditor.locationModal.insert') }}</button>
          </div>
        </div>
        <div class="modal-footer">
          <button class="confirm-btn" @click="confirmLocation">{{ tt('toast.ok') }}</button>
        </div>
      </div>
    </div>
    
    <!-- 自定义提示弹窗 -->
    <div v-if="showToast" class="toast-modal" @click.self="closeToast">
      <div class="toast-content">
        <div class="toast-icon">✅</div>
        <div class="toast-message">{{ toastMessage }}</div>
        <button class="toast-button" @click="closeToast">{{ tt('toast.ok') }}</button>
      </div>
    </div>
    
    <!-- 表单列表模态框 -->
    <div v-if="showFormListModal" class="modal" @click.self="showFormListModal = false">
      <div class="modal-content-large">
        <div class="modal-header">
          <h3>{{ tt('advancedEditor.formList.title') }}</h3>
          <button class="close-btn" @click="showFormListModal = false">✕</button>
        </div>
        <div class="form-list-body">
          <div class="form-list-header">
            <button class="create-form-btn" @click="createNewForm">
              <span>+</span> {{ tt('advancedEditor.formList.create') }}
            </button>
          </div>
          <table class="form-list-table">
            <thead>
              <tr>
                <th>{{ tt('advancedEditor.formList.columns.select') }}</th>
                <th>{{ tt('advancedEditor.formList.columns.name') }}</th>
                <th>{{ tt('advancedEditor.formList.columns.modifyTime') }}</th>
                <th>{{ tt('advancedEditor.formList.columns.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="formList.length === 0">
                <td colspan="4" class="empty-state">{{ tt('advancedEditor.formList.empty') }}</td>
              </tr>
              <tr v-for="(form, index) in formList" :key="index">
                <td><input type="checkbox" v-model="form.selected" /></td>
                <td>{{ form.name }}</td>
                <td>{{ form.modifyTime }}</td>
                <td>
                  <button @click="editForm(index)">{{ tt('advancedEditor.element.edit') }}</button>
                  <button @click="deleteForm(index)">{{ tt('advancedEditor.element.delete') }}</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="modal-footer">
          <button class="confirm-btn" @click="confirmFormList">{{ tt('toast.ok') }}</button>
        </div>
      </div>
    </div>
    
    <!-- 创建表单模态框 -->
    <div v-if="showCreateForm" class="modal modal-full" @click.self="closeFormModal">
      <div class="create-form-modal">
        <div class="create-form-header">
          <h3>{{ editingFormIndex >= 0 ? tt('advancedEditor.formEditor.edit') : tt('advancedEditor.formEditor.create') }}</h3>
          <button class="close-btn" @click="closeFormModal">✕</button>
        </div>
        <div class="create-form-body">
          <div class="form-canvas-wrapper">
            <div class="form-canvas">
              <div class="form-toolbar">
                <button 
                  class="components-toggle-btn" 
                  @click="showFormComponentsModal = true"
                >
                  📦 {{ tt('advancedEditor.formEditor.basicStyle') }}
                </button>
              </div>
              <input type="text" class="form-title-input" :placeholder="tt('advancedEditor.formEditor.placeholders.title')" />
              <input type="text" class="form-hint-input" :placeholder="tt('advancedEditor.formEditor.placeholders.hint')" />
              <div class="form-editable-area" @drop="handleFormDrop" @dragover.prevent>
                <div v-if="formComponents.length === 0" class="empty-form-hint">
                  {{ tt('advancedEditor.formEditor.emptyHint') }}
                </div>
                <div 
                  v-for="(component, index) in formComponents" 
                  :key="`${component.id}-${formComponentsRenderKey}-${component.imageUrl || ''}-${component.label || ''}-${component.placeholder || ''}-${component.content || ''}-${component.npsValue || ''}`" 
                  class="form-component-item" 
                  v-html="formComponentsHtml[index] || renderFormComponent(component)"
                ></div>
              </div>
              
              <!-- 表单设置面板 -->
              <div class="form-settings-panel">
                <!-- 组件编辑面板 -->
                <div v-if="editingComponent" class="component-edit-panel">
                  <div class="setting-section">
                    <label class="component-type-label">
                      <input type="checkbox" />
                      <span>{{ getComponentLabel(editingComponent.type) }}</span>
                    </label>
                  </div>
                  
                  <div class="setting-section">
                    <div class="setting-row">
                      <label class="setting-label">{{ tt('advancedEditor.formEditor.settingTitle') }}</label>
                      <input type="text" v-model="editingComponent.label" :placeholder="tt('advancedEditor.formEditor.placeholders.title')" class="setting-input" />
                    </div>
                  </div>
                  
                  <!-- 选项管理（仅单选框、多选框和检查项显示） -->
                  <div v-if="editingComponent && (editingComponent.type === 'radio' || editingComponent.type === 'checkbox' || editingComponent.type === 'checklist')" class="setting-section">
                    <label class="setting-label">{{ tt('advancedEditor.formEditor.options') }}</label>
                    <div class="options-manager">
                      <div 
                        v-for="(option, index) in (editingComponent.options || [])" 
                        :key="index" 
                        class="option-item-wrapper"
                      >
                        <div class="option-item">
                          <input 
                            type="text" 
                            v-model="editingComponent.options[index]" 
                            @input="updateOptionInPreview(index)"
                            :placeholder="tt('advancedEditor.formEditor.optionPlaceholder', { index: index + 1 })"
                            class="option-input"
                          />
                          <button 
                            @click.stop="removeOption(index)" 
                            class="remove-option-btn"
                            :disabled="(editingComponent.options || []).length <= 1"
                            :title="tt('advancedEditor.formEditor.deleteOption')"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              <line x1="10" y1="11" x2="10" y2="17"></line>
                              <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                          </button>
                        </div>
                        <div v-if="index < (editingComponent.options || []).length - 1" class="option-divider"></div>
                      </div>
                      <button @click="addOption" class="add-option-btn">+ {{ tt('advancedEditor.formEditor.addOption') }}</button>
                    </div>
                  </div>
                  
                  <button class="save-form-btn" @click.stop="saveComponentEdit">{{ tt('advancedEditor.formEditor.save') }}</button>
                </div>
                
                <!-- 表单设置面板 -->
                <div v-else>
                  <div class="setting-section">
                    <label>{{ tt('advancedEditor.formEditor.formName') }}</label>
                    <input type="text" class="form-name-input" v-model="currentForm.name" :placeholder="tt('advancedEditor.formEditor.placeholders.formName')" />
                  </div>
                  <div class="setting-section">
                    <label>{{ tt('advancedEditor.formEditor.afterSubmit') }}</label>
                    <div class="radio-group">
                      <label class="radio-label">
                        <input type="radio" v-model="currentForm.afterSubmit" value="success" />
                        <span>{{ tt('advancedEditor.formEditor.afterSubmitSuccess') }}</span>
                      </label>
                      <label class="radio-label">
                        <input type="radio" v-model="currentForm.afterSubmit" value="qrcode" />
                        <span>{{ tt('advancedEditor.formEditor.afterSubmitQr') }}</span>
                      </label>
                    </div>
                  </div>
                  <div class="setting-section">
                    <label>{{ tt('advancedEditor.formEditor.fillLimit') }}</label>
                    <div class="setting-subsection">
                      <label class="subsection-title">{{ tt('advancedEditor.formEditor.perUserTimes') }}</label>
                      <div class="radio-group">
                        <label class="radio-label">
                          <input type="radio" v-model="currentForm.fillLimit.type" value="none" />
                          <span>{{ tt('advancedEditor.formEditor.noLimit') }}</span>
                        </label>
                        <label class="radio-label">
                          <input type="radio" v-model="currentForm.fillLimit.type" value="per-person" />
                          <span>{{ tt('advancedEditor.formEditor.perPersonPrefix') }} <input type="number" v-model="currentForm.fillLimit.times" style="width: 60px;" /> {{ tt('advancedEditor.formEditor.timesSuffix') }}</span>
                        </label>
                        <label class="radio-label">
                          <input type="radio" v-model="currentForm.fillLimit.type" value="per-day" />
                          <span>{{ tt('advancedEditor.formEditor.perPeriodPrefix') }} <select v-model="currentForm.fillLimit.period" style="width: 60px;"><option value="日">{{ tt('advancedEditor.formEditor.periodDay') }}</option><option value="周">{{ tt('advancedEditor.formEditor.periodWeek') }}</option><option value="月">{{ tt('advancedEditor.formEditor.periodMonth') }}</option></select> {{ tt('advancedEditor.formEditor.canFill') }} <input type="number" v-model="currentForm.fillLimit.times" style="width: 60px;" /> {{ tt('advancedEditor.formEditor.timesSuffix') }}</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <button class="save-form-btn" @click="saveForm">{{ tt('advancedEditor.formEditor.save') }}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 组件选择模态框 -->
    <div v-if="showFormComponentsModal" class="modal form-components-modal" @click.self="showFormComponentsModal = false">
      <div class="modal-content form-components-modal-content">
        <div class="modal-header">
          <h3>{{ tt('advancedEditor.formComponents.title') }}</h3>
          <button class="close-btn" @click="showFormComponentsModal = false">✕</button>
        </div>
        <div class="form-components-modal-body">
          <!-- 组件选择面板 -->
          <div class="form-components-panel">
            <h4>{{ tt('advancedEditor.formComponents.categories.basic') }}</h4>
            <div class="components-grid">
              <div class="component-item" @click="addFormComponent('single-text'); showFormComponentsModal = false">
                <div class="component-icon">📝</div>
                <span>{{ tt('advancedEditor.formComponents.items.singleText') }}</span>
              </div>
              <div class="component-item" @click="addFormComponent('multi-text'); showFormComponentsModal = false">
                <div class="component-icon">📄</div>
                <span>{{ tt('advancedEditor.formComponents.items.multiText') }}</span>
              </div>
              <div class="component-item" @click="addFormComponent('radio'); showFormComponentsModal = false">
                <div class="component-icon">○</div>
                <span>{{ tt('advancedEditor.formComponents.items.radio') }}</span>
              </div>
              <div class="component-item" @click="addFormComponent('checkbox'); showFormComponentsModal = false">
                <div class="component-icon">☑</div>
                <span>{{ tt('advancedEditor.formComponents.items.checkbox') }}</span>
              </div>
              <div class="component-item" @click="addFormComponent('number'); showFormComponentsModal = false">
                <div class="component-icon">123</div>
                <span>{{ tt('advancedEditor.formComponents.items.number') }}</span>
              </div>
              <div class="component-item" @click="addFormComponent('date'); showFormComponentsModal = false">
                <div class="component-icon">📅</div>
                <span>{{ tt('advancedEditor.formComponents.items.date') }}</span>
              </div>
              <div class="component-item" @click="addFormComponent('time'); showFormComponentsModal = false">
                <div class="component-icon">🕐</div>
                <span>{{ tt('advancedEditor.formComponents.items.time') }}</span>
              </div>
              <div class="component-item" @click="addFormComponent('nps'); showFormComponentsModal = false">
                <div class="component-icon">N</div>
                <span>{{ tt('advancedEditor.formComponents.items.nps') }}</span>
              </div>
              <div class="component-item" @click="addFormComponent('checklist'); showFormComponentsModal = false">
                <div class="component-icon">✓</div>
                <span>{{ tt('advancedEditor.formComponents.items.checklist') }}</span>
              </div>
              <div class="component-item" @click="addFormComponent('location'); showFormComponentsModal = false">
                <div class="component-icon">📍</div>
                <span>{{ tt('advancedEditor.formComponents.items.location') }}</span>
              </div>
              <div class="component-item" @click="addFormComponent('address'); showFormComponentsModal = false">
                <div class="component-icon">🏠</div>
                <span>{{ tt('advancedEditor.formComponents.items.address') }}</span>
              </div>
              <div class="component-item" @click="addFormComponent('title'); showFormComponentsModal = false">
                <div class="component-icon">T</div>
                <span>{{ tt('advancedEditor.formComponents.items.title') }}</span>
              </div>
            </div>
            <h4>{{ tt('advancedEditor.formComponents.categories.personal') }}</h4>
            <div class="components-grid">
              <div class="component-item" @click="addFormComponent('name'); showFormComponentsModal = false">
                <div class="component-icon">👤</div>
                <span>{{ tt('advancedEditor.formComponents.items.name') }}</span>
              </div>
              <div class="component-item" @click="addFormComponent('phone'); showFormComponentsModal = false">
                <div class="component-icon">📱</div>
                <span>{{ tt('advancedEditor.formComponents.items.phone') }}</span>
              </div>
              <div class="component-item" @click="addFormComponent('id-card'); showFormComponentsModal = false">
                <div class="component-icon">🆔</div>
                <span>{{ tt('advancedEditor.formComponents.items.idCard') }}</span>
              </div>
              <div class="component-item" @click="addFormComponent('employee-id'); showFormComponentsModal = false">
                <div class="component-icon">💼</div>
                <span>{{ tt('advancedEditor.formComponents.items.employeeId') }}</span>
              </div>
              <div class="component-item" @click="addFormComponent('gender'); showFormComponentsModal = false">
                <div class="component-icon">⚧</div>
                <span>{{ tt('advancedEditor.formComponents.items.gender') }}</span>
              </div>
              <div class="component-item" @click="addFormComponent('age'); showFormComponentsModal = false">
                <div class="component-icon">🎂</div>
                <span>{{ tt('advancedEditor.formComponents.items.age') }}</span>
              </div>
              <div class="component-item" @click="addFormComponent('license-plate'); showFormComponentsModal = false">
                <div class="component-icon">🚗</div>
                <span>{{ tt('advancedEditor.formComponents.items.licensePlate') }}</span>
              </div>
            </div>
            <h4>{{ tt('advancedEditor.formComponents.categories.media') }}</h4>
            <div class="components-grid">
              <div class="component-item" @click="addFormComponent('form-image'); showFormComponentsModal = false">
                <div class="component-icon">🖼️</div>
                <span>{{ tt('advancedEditor.formComponents.items.image') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 背景设置模态框 -->
    <div v-if="showBackgroundModal" class="modal" @click.self="showBackgroundModal = false">
      <div class="modal-content-medium">
        <div class="modal-header">
          <h3>{{ tt('advancedEditor.bgSettings.title') }}</h3>
          <button class="close-btn" @click="showBackgroundModal = false">✕</button>
        </div>
        <div class="background-tabs">
          <button 
            :class="['background-tab', { active: backgroundSettings.tab === 'color' }]"
            @click="backgroundSettings.tab = 'color'"
          >
            {{ tt('advancedEditor.bgSettings.tabs.color') }}
          </button>
          <button 
            :class="['background-tab', { active: backgroundSettings.tab === 'image' }]"
            @click="backgroundSettings.tab = 'image'"
          >
            {{ tt('advancedEditor.bgSettings.tabs.image') }}
          </button>
        </div>
        <div class="background-tab-content">
          <!-- 背景颜色标签页 -->
          <div v-if="backgroundSettings.tab === 'color'" class="background-color-tab">
            <div class="color-section">
              <label>{{ tt('advancedEditor.bgSettings.lightColors') }}</label>
              <div class="color-swatches">
                <div
                  v-for="(color, index) in lightColors"
                  :key="index"
                  class="color-swatch"
                  :style="{ backgroundColor: color }"
                  :class="{ selected: backgroundSettings.backgroundColor === color }"
                  @click="backgroundSettings.backgroundColor = color; backgroundSettings.customBackgroundColor = color"
                ></div>
              </div>
            </div>
            <div class="color-section">
              <label>{{ tt('advancedEditor.bgSettings.darkColors') }}</label>
              <div class="color-swatches">
                <div
                  v-for="(color, index) in darkColors"
                  :key="index"
                  class="color-swatch"
                  :style="{ backgroundColor: color }"
                  :class="{ selected: backgroundSettings.backgroundColor === color }"
                  @click="backgroundSettings.backgroundColor = color; backgroundSettings.customBackgroundColor = color"
                ></div>
              </div>
            </div>
            <div class="custom-color-section">
              <label>{{ tt('advancedEditor.bgSettings.customBg') }}</label>
              <input
                type="color"
                v-model="backgroundSettings.customBackgroundColor"
                @change="backgroundSettings.backgroundColor = backgroundSettings.customBackgroundColor"
                class="custom-color-picker"
              />
            </div>
            <div class="text-color-section">
              <label>{{ tt('advancedEditor.bgSettings.textColor') }}</label>
              <input
                type="color"
                v-model="backgroundSettings.textColor"
                class="custom-color-picker"
              />
            </div>
            <div class="margin-section">
              <label>{{ tt('advancedEditor.bgSettings.pageTopMargin') }}</label>
              <div class="margin-input-group">
                <input
                  type="number"
                  v-model.number="backgroundSettings.pageTopMargin"
                  min="0"
                  max="100"
                  class="margin-input"
                />
                <span>px</span>
              </div>
            </div>
          </div>
          
          <!-- 背景图片标签页 -->
          <div v-if="backgroundSettings.tab === 'image'" class="background-image-tab">
            <div class="image-upload-section">
              <label>{{ tt('advancedEditor.bgSettings.uploadBg') }}</label>
              <div class="background-image-upload" @click="selectBackgroundImageFile">
                <div v-if="!backgroundSettings.backgroundImage" class="upload-placeholder">
                  <div class="upload-icon">+</div>
                  <span>{{ tt('advancedEditor.bgSettings.clickUploadImage') }}</span>
                </div>
                <img v-else :src="backgroundSettings.backgroundImage" :alt="tt('advancedEditor.backgroundModal.imageAlt')" class="background-image-preview" />
              </div>
              <button v-if="backgroundSettings.backgroundImage" class="remove-image-btn" @click="removeBackgroundImage">{{ tt('advancedEditor.bgSettings.removeImage') }}</button>
            </div>
            <div class="text-color-section">
              <label>{{ tt('advancedEditor.bgSettings.textColor') }}</label>
              <input
                type="color"
                v-model="backgroundSettings.textColor"
                class="custom-color-picker"
              />
            </div>
            <div class="margin-section">
              <label>{{ tt('advancedEditor.bgSettings.pageTopMargin') }}</label>
              <div class="margin-input-group">
                <input
                  type="number"
                  v-model.number="backgroundSettings.pageTopMargin"
                  min="0"
                  max="100"
                  class="margin-input"
                />
                <span>px</span>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="confirm-btn" @click="confirmBackgroundSettings">{{ tt('toast.ok') }}</button>
        </div>
      </div>
    </div>
    
    <!-- 视频设置模态框 -->
    <div v-if="showVideoModal" class="modal" @click.self="showVideoModal = false">
      <div class="modal-content-medium">
        <div class="modal-header">
          <h3>{{ tt('advancedEditor.videoModal.title') }}</h3>
          <button class="close-btn" @click="showVideoModal = false">✕</button>
        </div>
        <div class="modal-body-form">
          <div class="form-row">
            <label>{{ tt('advancedEditor.videoModal.uploadFile') }}</label>
            <div class="file-upload-area-large" @click="!videoUploading && selectVideoFile()" :class="{ 'uploading': videoUploading }">
              <div v-if="videoUploading" class="upload-loading">
                <div class="spinner"></div>
                <span>{{ tt('advancedEditor.videoModal.uploadingWait') }}</span>
              </div>
              <div v-else-if="!videoUploadData" class="upload-placeholder">
                <div class="upload-icon">🎬</div>
                <span>{{ tt('advancedEditor.videoModal.clickUpload') }}</span>
                <p style="font-size: 0.85rem; color: #999; margin-top: 8px;">{{ tt('advancedEditor.videoModal.supportTypes') }}</p>
              </div>
              <div v-else class="uploaded-file-info">
                <div class="file-icon-large">🎬</div>
                <div class="file-name">{{ videoFileName }}</div>
                <button class="remove-file-btn" @click.stop="removeVideoFile">✕</button>
              </div>
            </div>
            <!-- MOV格式提示 -->
            <div v-if="videoFileName && videoFileName.toLowerCase().endsWith('.mov')" style="margin-top: 12px; padding: 12px; background: #fff3cd; border: 1px solid #ffc107; border-radius: 6px;">
              <p style="margin: 0; color: #856404; font-size: 0.9rem; line-height: 1.5;">
                <strong>⚠️ {{ tt('advancedEditor.videoModal.tipPrefix') }}</strong>{{ tt('advancedEditor.videoModal.movTip') }}
              </p>
            </div>
          </div>
          <div class="form-row">
            <label>{{ tt('advancedEditor.videoModal.optionalTitle') }}</label>
            <input type="text" v-model="videoTitle" :placeholder="tt('advancedEditor.videoModal.titlePlaceholder')" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="confirm-btn" @click="confirmVideo" :disabled="videoUploading || !videoUploadData">
            {{ videoUploading ? tt('advancedEditor.videoModal.uploading') : tt('toast.ok') }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- 音频设置模态框 -->
    <div v-if="showAudioModal" class="modal" @click.self="showAudioModal = false">
      <div class="modal-content-medium">
        <div class="modal-header">
          <h3>{{ tt('advancedEditor.audioModal.title') }}</h3>
          <button class="close-btn" @click="showAudioModal = false">✕</button>
        </div>
        <div class="modal-body-form">
          <div class="form-row">
            <label>{{ tt('advancedEditor.audioModal.uploadFile') }}</label>
            <div class="file-upload-area-large" @click="selectAudioFile">
              <div v-if="!audioUploadData" class="upload-placeholder">
                <div class="upload-icon">🎵</div>
                <span>{{ tt('advancedEditor.audioModal.clickUpload') }}</span>
                <p style="font-size: 0.85rem; color: #999; margin-top: 8px;">{{ tt('advancedEditor.audioModal.supportTypes') }}</p>
              </div>
              <div v-else class="uploaded-file-info">
                <div class="file-icon-large">🎵</div>
                <div class="file-name">{{ audioFileName }}</div>
                <button class="remove-file-btn" @click.stop="removeAudioFile">✕</button>
              </div>
            </div>
          </div>
          <div class="form-row">
            <label>{{ tt('advancedEditor.audioModal.optionalTitle') }}</label>
            <input type="text" v-model="audioTitle" :placeholder="tt('advancedEditor.audioModal.titlePlaceholder')" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="confirm-btn" @click="confirmAudio">{{ tt('toast.ok') }}</button>
        </div>
      </div>
    </div>
    
    <!-- 文件设置模态框 -->
    <div v-if="showFileModal" class="modal" @click.self="showFileModal = false">
      <div class="modal-content-medium">
        <div class="modal-header">
          <h3>{{ tt('advancedEditor.fileModal.title') }}</h3>
          <button class="close-btn" @click="showFileModal = false">✕</button>
        </div>
        <div class="modal-body-form">
          <div class="form-row">
            <label>{{ tt('advancedEditor.fileModal.uploadFile') }}</label>
            <!-- 文件列表 -->
            <div v-if="fileUploadDataList.length > 0" class="file-list-container">
              <div 
                v-for="(file, index) in fileUploadDataList" 
                :key="index"
                class="file-item"
              >
                <div class="file-icon-large">{{ getDocumentIcon(file.fileName) }}</div>
                <div class="file-info">
                  <div class="file-name">{{ file.fileName }}</div>
                  <div class="file-size">{{ file.fileSize }}</div>
                </div>
                <label class="checkbox-label-inline">
                  <input type="checkbox" v-model="file.allowDownload" />
                  <span>{{ tt('advancedEditor.fileModal.allowDownload') }}</span>
                </label>
                <button class="remove-file-btn" @click.stop="removeFileByIndex(index)">✕</button>
              </div>
            </div>
            <!-- 添加文件按钮 -->
            <button class="add-file-btn" @click="selectFileUpload" :disabled="fileUploading">
              <span v-if="fileUploading">⏳</span>
              <span v-else>+</span>
              <span>{{ fileUploading ? tt('advancedEditor.fileModal.uploading') : tt('advancedEditor.fileModal.addFile') }}</span>
            </button>
          </div>
          <div class="form-row">
            <label>{{ tt('advancedEditor.fileModal.optionalTitle') }}</label>
            <input type="text" v-model="fileUploadTitle" :placeholder="tt('advancedEditor.fileModal.titlePlaceholder')" />
          </div>
          <div class="form-row">
            <label class="checkbox-label">
              <input type="checkbox" v-model="allowFileDownload" @change="updateAllFilesDownloadPermission" />
              <span>{{ tt('advancedEditor.fileModal.allowDownload') }}</span>
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button class="confirm-btn" @click="confirmFile" :disabled="fileUploading">
            {{ fileUploading ? tt('advancedEditor.fileModal.processing') : tt('toast.ok') }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- 选项操作按钮组 -->
    <div 
      v-if="showOptionActions" 
      class="option-actions-toolbar"
      :style="optionActionsStyle"
      @click.stop
    >
      <button 
        class="option-action-btn move-up-btn"
        :disabled="!canOptionMoveUp"
        @click="handleOptionMoveUp"
        :title="tt('advancedEditor.element.moveUp')"
      >
        {{ tt('advancedEditor.element.moveUp') }}
      </button>
      <button 
        class="option-action-btn move-down-btn"
        :disabled="!canOptionMoveDown"
        @click="handleOptionMoveDown"
        :title="tt('advancedEditor.element.moveDown')"
      >
        {{ tt('advancedEditor.element.moveDown') }}
      </button>
      <button 
        class="option-action-btn copy-btn"
        @click="handleOptionCopy"
        :title="tt('advancedEditor.element.copy')"
      >
        {{ tt('advancedEditor.element.copy') }}
      </button>
      <button 
        class="option-action-btn delete-btn"
        :disabled="!canOptionDelete"
        @click="handleOptionDelete"
        :title="tt('advancedEditor.element.delete')"
      >
        {{ tt('advancedEditor.element.delete') }}
      </button>
    </div>
    
    <!-- 自定义确认对话框 -->
    <div v-if="showConfirmDialog" class="confirm-dialog-overlay" @click.self="cancelConfirm">
      <div class="confirm-dialog">
        <div class="confirm-dialog-title">{{ confirmDialogTitle }}</div>
        <div class="confirm-dialog-message">{{ confirmDialogMessage }}</div>
        <div class="confirm-dialog-buttons">
          <button class="confirm-btn cancel-btn" @click="cancelConfirm">{{ tt('toast.cancel') }}</button>
          <button class="confirm-btn ok-btn" @click="confirmAction">{{ tt('toast.ok') }}</button>
        </div>
      </div>
    </div>

    <!-- 授权验证弹窗 -->
    <LicenseModal 
      v-model:visible="showLicenseModal"
      @success="onLicenseSuccess"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import QRCode from 'qrcode'
import { saveContentToServer, checkApiServer } from '../utils/api.js'
import { getServerBaseUrl } from '../utils/serverConfig.js'
import { storeFile as storeFileInIndexedDB, isIndexedDBAvailable } from '../utils/indexedDB.js'
import LicenseModal from './LicenseModal.vue'
import { licenseService } from '../utils/license.js'
import { formatDateTime } from '../i18n/datetime'
const { t, locale } = useI18n()
const tt = (key, fallbackOrParams, maybeParams) => {
  const isParamsOnly = fallbackOrParams && typeof fallbackOrParams === 'object' && !Array.isArray(fallbackOrParams) && maybeParams === undefined
  const params = isParamsOnly ? fallbackOrParams : (maybeParams || {})
  const fallback = isParamsOnly ? undefined : fallbackOrParams
  const value = t(key, params)
  return value === key ? (fallback || key) : value
}

const emit = defineEmits(['qr-generated'])

// 授权相关
const showLicenseModal = ref(false)
const onLicenseSuccess = () => {
  generateQR()
}

// 确认对话框
const showConfirmDialog = ref(false)
const confirmDialogTitle = ref(tt('toast.confirm'))
const confirmDialogMessage = ref('')
const confirmDialogCallback = ref(null)

// 显示确认对话框
const showConfirm = (message, title = tt('toast.confirm')) => {
  return new Promise((resolve) => {
    confirmDialogTitle.value = title
    confirmDialogMessage.value = message
    confirmDialogCallback.value = resolve
    showConfirmDialog.value = true
  })
}

// 确认操作
const confirmAction = () => {
  showConfirmDialog.value = false
  if (confirmDialogCallback.value) {
    confirmDialogCallback.value(true)
    confirmDialogCallback.value = null
  }
}

// 取消操作
const cancelConfirm = () => {
  showConfirmDialog.value = false
  if (confirmDialogCallback.value) {
    confirmDialogCallback.value(false)
    confirmDialogCallback.value = null
  }
}

// 样式库
const selectedColor = ref('#2196F3')
const showStyleLibraryModal = ref(false) // 控制样式库模态框显示

// 生成浅色版本（用于背景等）
const getLightColor = (color) => {
  // 如果是十六进制颜色
  if (color.startsWith('#')) {
    const hex = color.slice(1)
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    // 生成浅色版本（约15%透明度）
    return `rgba(${r}, ${g}, ${b}, 0.15)`
  }
  // 如果是rgb/rgba颜色，转换为浅色
  const match = color.match(/\d+/g)
  if (match && match.length >= 3) {
    return `rgba(${match[0]}, ${match[1]}, ${match[2]}, 0.15)`
  }
  return color
}

// 图片 key -> 文件名（无中文硬编码，展示文案走 i18n）
const imageKeyToFile = {
  placeDali: 's1.jpg',
  placeLijiang: 's2.jpg',
  placeMeili: 's3.jpg',
  placeXishuang: 's4.jpg',
  placeYuanyang: 's5.jpg',
  placeYulong: 's6.jpg',
  placeTengchong: 's7.jpg',
  placeShangrila: 's3.jpg'
}
// 根据图片 key 或兼容旧名称获取图片路径
const getImagePath = (imageKeyOrName) => {
  const isElectron = typeof window !== 'undefined' && (
    window.location.protocol === 'file:' ||
    window.electron !== undefined ||
    navigator.userAgent.toLowerCase().includes('electron')
  )
  const basePath = isElectron ? './' : '/'
  const file = imageKeyToFile[imageKeyOrName]
  return file ? basePath + file : basePath + 's1.jpg'
}

// 获取图片卡片样式（template 使用 imageKey / labelKey）
const getPhotoCardStyle = (template) => {
  const imagePath = getImagePath(template.imageKey || template.image || template.label)
  return {
    width: '100%',
    height: '80px',
    backgroundImage: `url(${imagePath})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    borderRadius: '4px',
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-end',
    padding: '6px'
  }
}

const pageBackgroundImage = ref('')
const pageBackgroundColor = ref('#ffffff')
const showBackgroundModal = ref(false)

const handleBackgroundImageUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    pageBackgroundImage.value = e.target.result
  }
  reader.readAsDataURL(file)
}

watch(pageBackgroundColor, (newColor) => {
  // 这里可以添加更新页面背景色的逻辑，如果需要实时预览
})

// 监听背景图变化
watch(pageBackgroundImage, (newImage) => {
  // 这里可以添加更新页面背景图的逻辑
})

// 暴露给父组件或模态框使用
defineExpose({
  showBackgroundModal
})

const showPreviewModal = ref(false) // 控制预览与设置模态框显示
const generating = ref(false) // 生成中状态

const activeElementTab = ref('title')
const elementTabs = computed(() => [
  { id: 'title', label: t('advancedEditor.contentTypes.title') },
  { id: 'body', label: t('advancedEditor.contentTypes.body') },
  { id: 'image', label: t('advancedEditor.contentTypes.image') },
  { id: 'divider', label: t('advancedEditor.contentTypes.divider') },
  { id: 'nav', label: t('advancedEditor.contentTypes.nav') },
  { id: 'table', label: t('advancedEditor.contentTypes.table') }
])

const templateName = (id) => {
  const key = `advancedEditor.templateNames.${id}`
  const v = t(key)
  return v !== key ? v : id
}
const productTemplateName = (id) => {
  const key = `advancedEditor.productTemplateNames.${id}`
  const v = t(key)
  return v !== key ? v : id
}

// 产品信息模板示例（名称与字段走 i18n）
const templates = ref([
  {
    id: 'plain-text',
    type: 'plain',
    fields: [
      { labelKey: 'advancedEditor.templateText.tableProductName', valueKey: 'advancedEditor.templateText.tableProductValue' },
      { labelKey: 'advancedEditor.templateText.tableDeveloper', valueKey: 'advancedEditor.templateText.tableDeveloperValue' },
      { labelKey: 'advancedEditor.templateText.tableVersion', valueKey: 'advancedEditor.templateText.tableVersionValue' }
    ]
  },
  {
    id: 'table-bordered',
    type: 'table',
    style: 'bordered',
    fields: [
      { labelKey: 'advancedEditor.templateText.tableProductName', valueKey: 'advancedEditor.templateText.tableProductValue' },
      { labelKey: 'advancedEditor.templateText.tableDeveloper', valueKey: 'advancedEditor.templateText.tableDeveloperValue' },
      { labelKey: 'advancedEditor.templateText.tableVersion', valueKey: 'advancedEditor.templateText.tableVersionValue' }
    ]
  },
  {
    id: 'table-shaded',
    type: 'table',
    style: 'alternating',
    shaded: true,
    fields: [
      { labelKey: 'advancedEditor.templateText.tableProductName', valueKey: 'advancedEditor.templateText.tableProductValue' },
      { labelKey: 'advancedEditor.templateText.tableDeveloper', valueKey: 'advancedEditor.templateText.tableDeveloperValue' },
      { labelKey: 'advancedEditor.templateText.tableVersion', valueKey: 'advancedEditor.templateText.tableVersionValue' }
    ]
  },
  {
    id: 'table-equal-width',
    type: 'table',
    style: 'with-header',
    equalWidth: true,
    fields: [
      { labelKey: 'advancedEditor.templateText.tableEqualWidth', valueKey: 'advancedEditor.templateText.tableEqualWidth', isHeader: true },
      { labelKey: 'advancedEditor.templateText.tableDeveloper', valueKey: 'advancedEditor.templateText.tableDeveloperValue' },
      { labelKey: 'advancedEditor.templateText.tableVersion', valueKey: 'advancedEditor.templateText.tableVersionValue' }
    ]
  },
  {
    id: 'text-colon',
    type: 'colon',
    fields: [
      { labelKey: 'advancedEditor.templateText.tableProductName', valueKey: 'advancedEditor.templateText.tableProductValue' },
      { labelKey: 'advancedEditor.templateText.tableDeveloper', valueKey: 'advancedEditor.templateText.tableDeveloperValue' },
      { labelKey: 'advancedEditor.templateText.tableVersion', valueKey: 'advancedEditor.templateText.tableVersionValue' }
    ]
  }
])
const productTemplatesDisplay = computed(() => templates.value.map(t => ({
  ...t,
  name: productTemplateName(t.id),
  fields: (t.fields || []).map(f => ({
    ...f,
    label: f.labelKey ? tt(f.labelKey) : (f.label || ''),
    value: f.valueKey ? tt(f.valueKey) : (f.value || '')
  }))
})))

// 标题模板（9种样式）- 展示与插入均通过 i18n 解析
const titleTemplates = ref([
  { id: 'title-lines-short', textKey: 'advancedEditor.templateText.titleShort', style: 'center-lines-short' },
  { id: 'title-lines-long', textKey: 'advancedEditor.templateText.titleShort', style: 'center-lines-long' },
  { id: 'title-progress', textKey: 'advancedEditor.templateText.titleShort', style: 'progress-bar' },
  { id: 'title-tag-rounded', textKey: 'advancedEditor.templateText.titleLong', style: 'tag-rounded' },
  { id: 'title-bordered', textKey: 'advancedEditor.templateText.titleLong', style: 'bordered-rect' },
  { id: 'title-layered', textKey: 'advancedEditor.templateText.titleLong', style: 'layered' },
  { id: 'title-oval', textKey: 'advancedEditor.templateText.titleLong', style: 'oval-dashed' },
  { id: 'title-parallelogram', textKey: 'advancedEditor.templateText.titleLong', style: 'parallelogram' },
  { id: 'title-numbered', textKey: 'advancedEditor.templateText.titleLong', number: '01', style: 'numbered' }
])

// 正文模板（6种样式）- 展示与插入均通过 i18n 解析
const bodyTemplates = ref([
  { id: 'body-plain', textKey: 'advancedEditor.templateText.bodySample', style: 'plain' },
  { id: 'body-bordered', textKey: 'advancedEditor.templateText.bodySample', style: 'bordered-box' },
  { id: 'body-left-bar', textKey: 'advancedEditor.templateText.bodySample', style: 'left-vertical-bar' },
  { id: 'body-double-lines', textKey: 'advancedEditor.templateText.bodySample', style: 'double-horizontal-lines' },
  { id: 'body-bubble', textKey: 'advancedEditor.templateText.bodySample', titleKey: 'advancedEditor.templateText.bodyTitle', style: 'bubble-title' },
  { id: 'body-dashed-title', textKey: 'advancedEditor.templateText.bodySample', titleKey: 'advancedEditor.templateText.bodyTitle', style: 'dashed-box-title' }
])

// 图片模板（展示与路径均通过 key + i18n）
const imageTemplates = ref([
  {
    id: 'image-icon-group',
    style: 'icon-group',
    icon: '📱',
    bgColor: '#FFF3E0',
    iconColor: '#00695C',
    icons: [
      { icon: '📱', labelKey: 'advancedEditor.templateText.iconPhone', bgColor: '#FFF3E0', iconColor: '#00695C' },
      { icon: '💻', labelKey: 'advancedEditor.templateText.iconComputer', bgColor: '#E0F2F1', iconColor: '#004D40' },
      { icon: '📷', labelKey: 'advancedEditor.templateText.iconCamera', bgColor: '#FFFDE7', iconColor: '#00695C' }
    ]
  },
  { id: 'image-photo-card', imageKey: 'placeDali', labelKey: 'advancedEditor.templateText.placeDali', style: 'photo-card' },
  { id: 'image-photo-card-2', imageKey: 'placeLijiang', labelKey: 'advancedEditor.templateText.placeLijiang', style: 'photo-card' },
  { id: 'image-photo-card-3', imageKey: 'placeMeili', labelKey: 'advancedEditor.templateText.placeMeili', style: 'photo-card' },
  { id: 'image-photo-card-4', imageKey: 'placeXishuang', labelKey: 'advancedEditor.templateText.placeXishuang', style: 'photo-card' },
  { id: 'image-photo-card-5', imageKey: 'placeYuanyang', labelKey: 'advancedEditor.templateText.placeYuanyang', style: 'photo-card' },
  { id: 'image-group-1', style: 'photo-group-2', images: ['placeDali', 'placeLijiang'] },
  { id: 'image-group-2', style: 'photo-group-2', images: ['placeMeili', 'placeXishuang'] },
  { id: 'image-group-3', style: 'photo-group-3', images: ['placeYuanyang', 'placeYulong', 'placeTengchong'] },
  { id: 'image-photo-card-6', imageKey: 'placeYulong', labelKey: 'advancedEditor.templateText.placeYulong', style: 'photo-card' },
  { id: 'image-photo-card-7', imageKey: 'placeTengchong', labelKey: 'advancedEditor.templateText.placeTengchong', style: 'photo-card' }
])

// 样式库展示用：解析标题/正文的 name、text、title
const titleTemplatesDisplay = computed(() => titleTemplates.value.map(t => ({
  ...t,
  name: templateName(t.id),
  text: t.textKey ? tt(t.textKey) : (t.text || ''),
  number: t.number
})))
const bodyTemplatesDisplay = computed(() => bodyTemplates.value.map(t => ({
  ...t,
  name: templateName(t.id),
  text: t.textKey ? tt(t.textKey) : (t.text || ''),
  title: t.titleKey ? tt(t.titleKey) : (t.title || '')
})))

const imageTemplatesDisplay = computed(() => imageTemplates.value.map(t => ({
  ...t,
  name: templateName(t.id),
  label: t.labelKey ? tt(t.labelKey) : (t.label || ''),
  icons: t.icons?.map(i => ({ ...i, label: i.labelKey ? tt(i.labelKey) : (i.label || '') })) || t.icons
})))

// 分隔线模板（7种样式）- 名称由 templateNames 解析
const dividerTemplates = ref([
  { id: 'divider-dotted', style: 'dotted' },
  { id: 'divider-dashed', style: 'dashed' },
  { id: 'divider-solid', style: 'solid' },
  { id: 'divider-double', style: 'double' },
  { id: 'divider-wavy', style: 'wavy' },
  { id: 'divider-end-lines', style: 'end-lines' },
  { id: 'divider-end-dots', style: 'end-dots' }
])
const dividerTemplatesDisplay = computed(() => dividerTemplates.value.map(t => ({ ...t, name: templateName(t.id) })))

// 导航模板（2种样式）- 使用 key，展示用 computed 解析
const navTemplates = ref([
  {
    id: 'nav-list-simple',
    style: 'list-simple',
    items: [
      { imageKey: 'placeDali', titleKey: 'advancedEditor.templateText.placeDali' },
      { imageKey: 'placeLijiang', titleKey: 'advancedEditor.templateText.placeLijiang' },
      { imageKey: 'placeShangrila', titleKey: 'advancedEditor.templateText.placeShangrila' }
    ]
  },
  {
    id: 'nav-list-detail',
    style: 'list-detail',
    items: [
      { imageKey: 'placeDali', titleKey: 'advancedEditor.templateText.placeDali', subtitleKey: 'advancedEditor.templateText.navSubtitleDali' },
      { imageKey: 'placeLijiang', titleKey: 'advancedEditor.templateText.placeLijiang', subtitleKey: 'advancedEditor.templateText.navSubtitleLijiang' },
      { imageKey: 'placeShangrila', titleKey: 'advancedEditor.templateText.placeShangrila', subtitleKey: 'advancedEditor.templateText.navSubtitleShangrila' }
    ]
  }
])

// 表格模板（5种样式）- 使用 labelKey/valueKey，展示与插入用 T.fields 解析
const tableTemplates = ref([
  {
    id: 'table-key-value',
    type: 'table',
    style: 'key-value',
    fields: [
      { labelKey: 'advancedEditor.templateText.tableProductName', valueKey: 'advancedEditor.templateText.tableProductValue' },
      { labelKey: 'advancedEditor.templateText.tableDeveloper', valueKey: 'advancedEditor.templateText.tableDeveloperValue' },
      { labelKey: 'advancedEditor.templateText.tableVersion', valueKey: 'advancedEditor.templateText.tableVersionValue' }
    ]
  },
  {
    id: 'table-bordered',
    type: 'table',
    style: 'bordered',
    fields: [
      { labelKey: 'advancedEditor.templateText.tableProductName', valueKey: 'advancedEditor.templateText.tableProductValue' },
      { labelKey: 'advancedEditor.templateText.tableDeveloper', valueKey: 'advancedEditor.templateText.tableDeveloperValue' },
      { labelKey: 'advancedEditor.templateText.tableVersion', valueKey: 'advancedEditor.templateText.tableVersionValue' }
    ]
  },
  {
    id: 'table-alternating',
    type: 'table',
    style: 'alternating',
    fields: [
      { labelKey: 'advancedEditor.templateText.tableProductName', valueKey: 'advancedEditor.templateText.tableProductValue' },
      { labelKey: 'advancedEditor.templateText.tableDeveloper', valueKey: 'advancedEditor.templateText.tableDeveloperValue' },
      { labelKey: 'advancedEditor.templateText.tableVersion', valueKey: 'advancedEditor.templateText.tableVersionValue' }
    ]
  },
  {
    id: 'table-header',
    type: 'table',
    style: 'with-header',
    fields: [
      { labelKey: 'advancedEditor.templateText.tableEqualWidth', valueKey: 'advancedEditor.templateText.tableEqualWidth', isHeader: true },
      { labelKey: 'advancedEditor.templateText.tableDeveloper', valueKey: 'advancedEditor.templateText.tableDeveloperValue' },
      { labelKey: 'advancedEditor.templateText.tableVersion', valueKey: 'advancedEditor.templateText.tableVersionValue' }
    ]
  },
  {
    id: 'table-inline',
    type: 'table',
    style: 'inline',
    fields: [
      { labelKey: 'advancedEditor.templateText.tableProductName', valueKey: 'advancedEditor.templateText.tableProductValue' },
      { labelKey: 'advancedEditor.templateText.tableDeveloper', valueKey: 'advancedEditor.templateText.tableDeveloperValue' },
      { labelKey: 'advancedEditor.templateText.tableVersion', valueKey: 'advancedEditor.templateText.tableVersionValue' }
    ]
  }
])

const navTemplatesDisplay = computed(() => navTemplates.value.map(t => ({
  ...t,
  name: templateName(t.id),
  items: (t.items || []).map(it => ({
    ...it,
    title: it.titleKey ? tt(it.titleKey) : (it.title || ''),
    subtitle: it.subtitleKey ? tt(it.subtitleKey) : (it.subtitle || ''),
    image: it.imageKey
  }))
})))
const tableTemplatesDisplay = computed(() => tableTemplates.value.map(t => ({
  ...t,
  name: templateName(t.id),
  fields: (t.fields || []).map(f => ({
    ...f,
    label: f.labelKey ? tt(f.labelKey) : (f.label || ''),
    value: f.valueKey ? tt(f.valueKey) : (f.value || '')
  }))
})))

// 页面标题
const pageTitle = ref('')

// 内容类型（用户可见标签走 i18n）
const contentTypes = computed(() => [
  { id: 'image', label: tt('advancedEditor.contentTypes.image'), icon: '🖼️' },
  { id: 'video', label: tt('advancedEditor.contentTypes.video'), icon: '🎬' },
  { id: 'audio', label: tt('advancedEditor.contentTypes.audio'), icon: '🎵' },
  { id: 'file', label: tt('advancedEditor.contentTypes.file'), icon: '📄' },
  { id: 'contact', label: tt('advancedEditor.contentTypes.contact'), icon: '📞' },
  { id: 'location', label: tt('advancedEditor.contentTypes.location'), icon: '📍' },
  { id: 'form', label: tt('advancedEditor.contentTypes.form'), icon: '📋' }
])

// 富文本编辑器
const editableArea = ref(null)
const textColor = ref('#000000')
const fontSize = ref('3')
const fontFamily = ref('Arial')
const highlightColor = ref('#ffffff')
const editorContent = ref([])

// 元素操作相关
const selectedElement = ref(null)
const showElementActions = ref(false)
const elementActionsStyle = ref({})
const hoveredElement = ref(null)
const selectedTableCell = ref(null) // 当前选中的表格单元格

// 选项操作按钮相关
const showOptionActions = ref(false)
const optionActionsStyle = ref({})
const activeOptionComponentId = ref(null)
const activeOptionIndex = ref(null)

// 下拉菜单状态
const showLineHeightDropdown = ref(false)
const showForegroundColorDropdown = ref(false)
const showBackgroundColorDropdown = ref(false)
const showForegroundColorPicker = ref(false)
const showBackgroundColorPicker = ref(false)
const customForegroundColor = ref('#000000')
const customBackgroundColor = ref('#ffffff')

// 保存选中状态，用于颜色应用
const savedSelectionRange = ref(null)

// 行高选项
const lineHeights = ['1.0', '1.2', '1.4', '1.5', '1.6', '1.8', '2.0', '3.0']
const currentLineHeight = ref('1.5')

// 标题样式配置（名称走 i18n）
const headingConfig = computed(() => [
  { level: 1, name: t('advancedEditor.headings.h1'), className: 'heading-1', fontSize: '36px', previewText: 'H1' },
  { level: 2, name: t('advancedEditor.headings.h2'), className: 'heading-2', fontSize: '28px', previewText: 'H2' },
  { level: 3, name: t('advancedEditor.headings.h3'), className: 'heading-3', fontSize: '22px', previewText: 'H3' },
  { level: 4, name: t('advancedEditor.headings.h4'), className: 'heading-4', fontSize: '18px', previewText: 'H4' }
])

// 当前行的标题样式
const currentHeadingStyle = ref('heading-1')
const showHeadingStyleDropdown = ref(false)

// 默认颜色（顶部一行）
const defaultColors = [
  '#000000', '#808080', '#C0C0C0', '#FFFFFF', '#FF0000', 
  '#FFA500', '#FFFF00', '#008000', '#00FFFF', '#0000FF', 
  '#800080', '#FF00FF'
]

// 颜色调色板（8x10网格）
const colorPalette = ref([])

// 格式状态
const isBold = ref(false)
const isItalic = ref(false)
const isUnderline = ref(false)
const isStrikethrough = ref(false)

// 检查当前格式状态
const checkFormatState = () => {
  if (!editableArea.value) return
  
  const selection = window.getSelection()
  if (selection.rangeCount === 0) return
  
  const range = selection.getRangeAt(0)
  let container = range.commonAncestorContainer
  if (container.nodeType === Node.TEXT_NODE) {
    container = container.parentElement
  }
  
  // 向上查找格式标签
  let parent = container
  while (parent && parent !== editableArea.value) {
    const tagName = parent.tagName ? parent.tagName.toLowerCase() : ''
    if (tagName === 'strong' || tagName === 'b') {
      isBold.value = true
      break
    }
    parent = parent.parentElement
  }
  if (!parent || parent === editableArea.value) {
    isBold.value = false
  }
  
  parent = container
  while (parent && parent !== editableArea.value) {
    const tagName = parent.tagName ? parent.tagName.toLowerCase() : ''
    if (tagName === 'em' || tagName === 'i') {
      isItalic.value = true
      break
    }
    parent = parent.parentElement
  }
  if (!parent || parent === editableArea.value) {
    isItalic.value = false
  }
  
  parent = container
  while (parent && parent !== editableArea.value) {
    const tagName = parent.tagName ? parent.tagName.toLowerCase() : ''
    if (tagName === 'u') {
      isUnderline.value = true
      break
    }
    parent = parent.parentElement
  }
  if (!parent || parent === editableArea.value) {
    isUnderline.value = false
  }
  
  parent = container
  while (parent && parent !== editableArea.value) {
    const tagName = parent.tagName ? parent.tagName.toLowerCase() : ''
    if (tagName === 's' || tagName === 'strike') {
      isStrikethrough.value = true
      break
    }
    parent = parent.parentElement
  }
  if (!parent || parent === editableArea.value) {
    isStrikethrough.value = false
  }
}

// 切换加粗
const toggleBold = () => {
  execCommand('bold')
  setTimeout(checkFormatState, 10)
}

// 切换斜体
const toggleItalic = () => {
  execCommand('italic')
  setTimeout(checkFormatState, 10)
}

// 切换下划线
const toggleUnderline = () => {
  execCommand('underline')
  setTimeout(checkFormatState, 10)
}

// 切换删除线
const toggleStrikethrough = () => {
  execCommand('strikeThrough')
  setTimeout(checkFormatState, 10)
}

// 可拖拽元素（已移除，不再需要）
const draggableElements = ref([])

// 二维码相关
const qrCanvas = ref(null)
const qrStyle = ref({
  foregroundColor: '#000000',
  backgroundColor: '#ffffff',
  errorLevel: 'M'
})
const showStyleModal = ref(false)
const showPageSettings = ref(false)

// 模态框状态
const showImageModal = ref(false)
const showTableModal = ref(false)
const showContactModal = ref(false)
const showLocationModal = ref(false)
const showFormListModal = ref(false)
const showCreateForm = ref(false)
const showFormComponentsModal = ref(false) // 控制组件选择模态框显示
const showVideoModal = ref(false)
const showAudioModal = ref(false)
const showFileModal = ref(false)

// 提示弹窗
const showToast = ref(false)
const toastMessage = ref('')

// 图片设置数据（改为数组支持多图片）
const imageUploadData = ref([])
const selectedImageIndex = ref(0) // 当前选中的图片索引，用于预览

// 表格选择器状态
const selectedTableRows = ref(0)
const selectedTableCols = ref(0)
const hoveredTableRows = ref(0)
const hoveredTableCols = ref(0)
const imageStyle = ref({
  size: 'original', // 'original' | 'fill'
  display: 'seamless', // 'seamless' | 'spaced' | 'carousel'
  carouselInterval: 'manual' // 'manual' | '1000' | '2000' | '3000' | '4000' | '5000' (毫秒)
})

// 视频、音频、文件数据
const videoUploadData = ref(null)
const videoFileName = ref('')
const videoTitle = ref('')
const videoUploading = ref(false) // 视频上传中状态
const hasShownApiWarning = ref(false) // 是否已显示过API连接失败的警告
const hasShownStorageWarning = ref(false) // 是否已显示过存储空间不足的警告
const hasShownQRError = ref(false) // 是否已显示过二维码生成失败的警告
const audioUploadData = ref(null)
const audioFileName = ref('')
const audioTitle = ref('')
// 文件数据改为数组支持多文件
const fileUploadDataList = ref([])
const fileUploadTitle = ref('')
const allowFileDownload = ref(true)
const fileUploading = ref(false) // 文件上传加载状态

// 背景设置数据
const backgroundSettings = ref({
  tab: 'color', // 'color' | 'image'
  backgroundColor: '#ffffff',
  customBackgroundColor: '#ffffff',
  textColor: '#000000',
  pageTopMargin: 10,
  backgroundImage: null
})

// 预设颜色
const lightColors = [
  '#ffffff', '#f5f5f5', '#fff9e6', '#e8f5e9', '#e3f2fd', 
  '#f3e5f5', '#fce4ec', '#e0f2f1', '#fff3e0', '#f1f8e9'
]

const darkColors = [
  '#1976d2', '#1565c0', '#0d47a1', '#0277bd', '#00695c',
  '#00796b', '#c62828', '#d32f2f', '#6a1b9a', '#c2185b',
  '#f57c00', '#000000'
]

// 联系方式数据
const contactData = ref({
  title: '',
  phone: '',
  wechat: '',
  email: '',
  address: '',
  remarks: ''
})

// 位置数据
const locationData = ref({
  address: ''
})

// 表单列表数据
const formList = ref([])
const formComponents = ref([])
const selectedComponentId = ref(null) // 当前选中的组件ID
const editingFormIndex = ref(-1) // 正在编辑的表单索引，-1 表示创建新表单
const editingComponent = ref(null) // 当前正在编辑的组件数据
const formComponentsRenderKey = ref(0) // 用于强制重新渲染的键
const currentForm = ref({
  name: '',
  afterSubmit: 'success',
  fillLimit: {
    type: 'none',
    times: 1,
    period: '日'
  }
})

// 可变字段
const variableFields = ref([])
const showFieldTypeModal = ref(false)
const showImageFieldEditModal = ref(false)
const editingImageFieldIndex = ref(-1)
const editingImageField = ref({
  name: '',
  type: 'image',
  config: {
    size: 'original', // 'original' | 'fill'
    display: 'seamless', // 'seamless' | 'spaced' | 'carousel'
    carouselInterval: 'manual' // 'manual' | '1000' | '2000' | '3000' | '4000' | '5000'
  }
})

// 处理表单中的图片上传 - 使用document级别的事件委托，确保动态添加的元素也能响应
const handleFormImageUpload = (e) => {
  // 添加调试日志
  console.log('[图片上传] change 事件触发', e.target, e.target?.tagName, e.target?.classList?.toString(), e.target?.files?.length)
  
  // 检查是否是图片输入框（包括表单编辑区域和主编辑区域）
  const isFormImageInput = e.target && e.target.classList && e.target.classList.contains('form-image-input')
  
  if (isFormImageInput) {
    // 阻止事件继续传播，避免被其他处理函数处理
    e.stopPropagation()
    console.log('[图片上传] 检测到图片上传事件', e.target)
    const componentId = parseInt(e.target.getAttribute('data-component-id'))
    console.log('[图片上传] 组件ID:', componentId)
    if (!componentId || isNaN(componentId)) {
      console.warn('[图片上传] 无效的组件ID')
      return
    }
    
    const file = e.target.files[0]
    if (file) {
      console.log('[图片上传] 选择的文件:', file.name, '大小:', file.size)
      // 检查文件大小（限制10MB）
      if (file.size > 10 * 1024 * 1024) {
        alert(tt('advancedEditor.errors.imageTooLarge'))
        e.target.value = '' // 清空文件选择
        return
      }
      
      const reader = new FileReader()
      reader.onload = (event) => {
        const imageUrl = event.target.result
        console.log('图片读取成功，开始更新组件')
        // 更新组件数据
        const componentIndex = formComponents.value.findIndex(c => c.id === componentId)
        if (componentIndex !== -1) {
          // 更新组件数据，触发响应式更新
          formComponents.value[componentIndex].imageUrl = imageUrl
          console.log('图片上传成功，组件ID:', componentId, '图片URL长度:', imageUrl.length)
          
          // 更新编辑区域（editable-area）中的图片显示
          nextTick(() => {
            // 在编辑区域中查找对应的图片上传区域
            if (editableArea.value) {
              const imageUploadDiv = editableArea.value.querySelector(`.form-image-upload[data-component-id="${componentId}"]`)
              if (imageUploadDiv) {
                // 检查是否已有图片
                const existingImg = imageUploadDiv.querySelector('img')
                if (existingImg) {
                  // 更新现有图片
                  existingImg.src = imageUrl
                  const textDiv = imageUploadDiv.querySelector('div[style*="color: #2196F3"]')
                  if (textDiv) {
                    textDiv.textContent = tt('advancedEditor.clickReplaceImage')
                  }
                } else {
                  // 查找并移除占位符内容
                  const placeholder = imageUploadDiv.querySelector('div[style*="font-size: 48px"]')
                  const placeholderText = imageUploadDiv.querySelector('div[style*="color: #666"]')
                  const placeholderHint = imageUploadDiv.querySelector('div[style*="color: #999"]')
                  
                  if (placeholder) placeholder.remove()
                  if (placeholderText) placeholderText.remove()
                  if (placeholderHint) placeholderHint.remove()
                  
                  // 创建图片元素
                  const img = document.createElement('img')
                  img.src = imageUrl
                  img.alt = tt('advancedEditorExtra.uploadedImageAlt')
                  img.style.cssText = 'max-width: 100%; max-height: 300px; border-radius: 4px; margin-bottom: 8px; pointer-events: none;'
                  
                  // 创建提示文字
                  const textDiv = document.createElement('div')
                  textDiv.textContent = tt('advancedEditor.clickReplaceImage')
                  textDiv.style.cssText = 'color: #2196F3; font-size: 14px; margin-top: 8px; pointer-events: none;'
                  
                  // 插入到输入框之前
                  const input = imageUploadDiv.querySelector('input.form-image-input')
                  if (input && input.parentNode) {
                    input.parentNode.insertBefore(img, input)
                    input.parentNode.insertBefore(textDiv, input)
                  } else {
                    imageUploadDiv.appendChild(img)
                    imageUploadDiv.appendChild(textDiv)
                  }
                }
                
                // 触发内容变化事件，更新二维码
                if (editableArea.value) {
                  editableArea.value.dispatchEvent(new Event('input', { bubbles: true }))
                }
              }
            }
            
            // 查找重新渲染后的输入框并重置
            const newInput = document.querySelector(`.form-image-input[data-component-id="${componentId}"]`)
            if (newInput) {
              newInput.value = ''
            }
          })
            
          // 立即重置当前输入框的值
          e.target.value = ''
          
          // 使用双重 nextTick 确保在组件完全重新渲染后重置输入框
          nextTick(() => {
            // 第一次 nextTick：等待 Vue 响应式更新
            // 查找所有相关的输入框并重置（包括表单编辑区域和主编辑区域）
            const allInputs = document.querySelectorAll(`.form-image-input[data-component-id="${componentId}"]`)
            allInputs.forEach(input => {
              input.value = ''
            })
            
            // 第二次 nextTick：确保 DOM 完全更新后再次重置
            nextTick(() => {
              const allInputs2 = document.querySelectorAll(`.form-image-input[data-component-id="${componentId}"]`)
              allInputs2.forEach(input => {
                input.value = ''
              })
            })
          })
        } else {
          console.warn('未找到对应的组件，ID:', componentId, '当前组件列表:', formComponents.value.map(c => c.id))
          // 即使找不到组件，也要重置输入框
          e.target.value = ''
        }
      }
      reader.onerror = (error) => {
        console.error('图片读取失败:', error)
        alert(tt('advancedEditor.errors.imageReadFailed'))
        // 读取失败时也要重置输入框
        e.target.value = ''
      }
      reader.readAsDataURL(file)
    } else {
      console.warn('未选择文件')
    }
  }
}

// 监听 formComponents 的变化，在组件重新渲染后绑定图片输入框的事件
watch(formComponents, (newComponents, oldComponents) => {
  // 在组件重新渲染后，为所有图片输入框绑定 change 事件
  nextTick(() => {
    const allImageInputs = document.querySelectorAll('.form-image-input')
    allImageInputs.forEach(input => {
      // 检查是否已经绑定过事件（通过检查是否有 data-bound 属性）
      if (!input.hasAttribute('data-bound')) {
        // 绑定 change 事件
        input.addEventListener('change', handleFormImageUpload, false)
        input.setAttribute('data-bound', 'true')
        console.log('[图片上传] 为输入框绑定 change 事件', input, input.getAttribute('data-component-id'))
      }
    })
    
    // 为所有表单输入框绑定事件（保存输入值）
    const allFormInputs = document.querySelectorAll('.form-input-value, .form-textarea-value')
    allFormInputs.forEach(input => {
      if (!input.hasAttribute('data-input-bound')) {
        // 使用 blur 事件保存值，避免输入时触发重新渲染
        input.addEventListener('blur', (e) => {
          const componentId = parseInt(e.target.getAttribute('data-component-id'))
          if (componentId) {
            const componentIndex = formComponents.value.findIndex(c => c.id === componentId)
            if (componentIndex !== -1) {
              // 保存输入框的值
              formComponents.value[componentIndex].value = e.target.value
              // 同步更新右侧预览区域的对应输入框
              if (editableArea.value) {
                const previewInput = editableArea.value.querySelector(`.preview-textarea-value[data-component-id="${componentId}"], .preview-input-value[data-component-id="${componentId}"]`)
                if (previewInput) {
                  previewInput.value = e.target.value
                }
              }
              // 更新二维码
              nextTick(() => {
                generateQR()
              })
            }
          }
        }, false)
        
        // 使用 input 事件仅同步右侧预览区域，不更新 formComponents（避免重新渲染）
        input.addEventListener('input', (e) => {
          const componentId = parseInt(e.target.getAttribute('data-component-id'))
          if (componentId) {
            // 仅同步更新右侧预览区域的对应输入框，不更新 formComponents
            if (editableArea.value) {
              const previewInput = editableArea.value.querySelector(`.preview-textarea-value[data-component-id="${componentId}"], .preview-input-value[data-component-id="${componentId}"]`)
              if (previewInput && previewInput !== e.target) {
                previewInput.value = e.target.value
              }
            }
          }
        }, false)
        
        input.setAttribute('data-input-bound', 'true')
      }
    })
    
    // 为右侧预览区域的输入框绑定 input 事件（实现双向同步）
    if (editableArea.value) {
      const previewInputs = editableArea.value.querySelectorAll('.preview-input-value, .preview-textarea-value')
      previewInputs.forEach(input => {
        if (!input.hasAttribute('data-preview-input-bound')) {
          input.addEventListener('input', (e) => {
            const componentId = parseInt(e.target.getAttribute('data-component-id'))
            if (componentId) {
              const componentIndex = formComponents.value.findIndex(c => c.id === componentId)
              if (componentIndex !== -1) {
                // 实时保存输入框的值
                formComponents.value[componentIndex].value = e.target.value
                // 同步更新左侧编辑面板的对应输入框
                const formInput = document.querySelector(`.form-input-value[data-component-id="${componentId}"], .form-textarea-value[data-component-id="${componentId}"]`)
                if (formInput) {
                  formInput.value = e.target.value
                }
                // 实时更新二维码
                nextTick(() => {
                  generateQR()
                })
              }
            }
          }, false)
          input.setAttribute('data-preview-input-bound', 'true')
        }
      })
    }
    
    // 为选项 label 绑定点击事件（显示操作按钮）
    const optionLabels = document.querySelectorAll('.option-label')
    optionLabels.forEach(label => {
      if (!label.hasAttribute('data-option-label-bound')) {
        label.addEventListener('click', (e) => {
          // 阻止事件冒泡，避免触发其他点击事件
          e.stopPropagation()
          
          const componentId = parseInt(label.getAttribute('data-component-id'))
          const optionIndex = parseInt(label.getAttribute('data-option-index'))
          
          if (componentId && optionIndex !== null) {
            // 获取 label 的位置
            const rect = label.getBoundingClientRect()
            
            // 计算按钮组的宽度（大约200px）
            const toolbarWidth = 200
            const toolbarHeight = 40
            
            // 设置操作按钮的位置（在 label 的右上角，不遮挡元素）
            let top = rect.top - toolbarHeight - 8 // 在元素上方，留8px间距
            let left = rect.right - toolbarWidth // 按钮组右边缘对齐label右边缘
            
            // 如果按钮组会超出屏幕右边界，则左对齐label右边缘
            if (left + toolbarWidth > window.innerWidth) {
              left = rect.right
            }
            
            // 如果按钮组会超出屏幕左边界，则右对齐label左边缘
            if (left < 0) {
              left = rect.left - toolbarWidth
            }
            
            // 如果按钮组会超出屏幕上边界，则显示在元素下方
            if (top < 0) {
              top = rect.bottom + 8
            }
            
            optionActionsStyle.value = {
              position: 'fixed',
              top: `${top}px`,
              left: `${left}px`,
              zIndex: 10000
            }
            
            activeOptionComponentId.value = componentId
            activeOptionIndex.value = optionIndex
            showOptionActions.value = true
          }
          
          label.setAttribute('data-option-label-bound', 'true')
        })
      }
    })
    
    // 为性别 radio 绑定 change 事件（左侧编辑面板）
    const formGenderRadios = document.querySelectorAll('.form-gender-radio input[type="radio"]')
    formGenderRadios.forEach(radio => {
      if (!radio.hasAttribute('data-gender-radio-bound')) {
        radio.addEventListener('change', (e) => {
          const componentId = parseInt(e.target.closest('.form-gender-radio')?.getAttribute('data-component-id'))
          if (componentId) {
            const componentIndex = formComponents.value.findIndex(c => c.id === componentId)
            if (componentIndex !== -1) {
              // 保存选中的性别值
              formComponents.value[componentIndex].value = e.target.value
              // 同步更新右侧预览区域的性别选择
              if (editableArea.value) {
                const previewGenderRadio = editableArea.value.querySelector(`.preview-gender-radio[data-component-id="${componentId}"]`)
                if (previewGenderRadio) {
                  const previewRadio = previewGenderRadio.querySelector(`input[type="radio"][value="${e.target.value}"]`)
                  if (previewRadio) {
                    previewRadio.checked = true
                  }
                }
              }
              // 实时更新二维码
              nextTick(() => {
                generateQR()
              })
            }
          }
        }, false)
        radio.setAttribute('data-gender-radio-bound', 'true')
      }
    })
    
    // 为性别 radio 绑定 change 事件（右侧预览区域）
    if (editableArea.value) {
      const previewGenderRadios = editableArea.value.querySelectorAll('.preview-gender-radio input[type="radio"]')
      previewGenderRadios.forEach(radio => {
        if (!radio.hasAttribute('data-preview-gender-radio-bound')) {
          radio.addEventListener('change', (e) => {
            const componentId = parseInt(e.target.closest('.preview-gender-radio')?.getAttribute('data-component-id'))
            if (componentId) {
              const componentIndex = formComponents.value.findIndex(c => c.id === componentId)
              if (componentIndex !== -1) {
                // 保存选中的性别值
                formComponents.value[componentIndex].value = e.target.value
                // 同步更新左侧编辑面板的性别选择
                const formGenderRadio = document.querySelector(`.form-gender-radio[data-component-id="${componentId}"]`)
                if (formGenderRadio) {
                  const formRadio = formGenderRadio.querySelector(`input[type="radio"][value="${e.target.value}"]`)
                  if (formRadio) {
                    formRadio.checked = true
                  }
                }
                // 实时更新二维码
                nextTick(() => {
                  generateQR()
                })
              }
            }
          }, false)
          radio.setAttribute('data-preview-gender-radio-bound', 'true')
        }
      })
    }
  })
  
  // 只在图片组件的 imageUrl 变化时重置对应的输入框（避免在用户选择文件时重置）
  if (oldComponents) {
    newComponents.forEach((comp, index) => {
      if (comp.type === 'form-image') {
        const oldComp = oldComponents[index]
        // 如果图片URL发生了变化（上传成功），重置对应的输入框
        if (oldComp && oldComp.imageUrl !== comp.imageUrl) {
          nextTick(() => {
            const inputs = document.querySelectorAll(`.form-image-input[data-component-id="${comp.id}"]`)
            inputs.forEach(input => {
              input.value = ''
              // 移除 data-bound 属性，以便重新绑定事件
              input.removeAttribute('data-bound')
            })
          })
        }
      }
    })
  }
  
  // 如果组件数量发生变化（添加或删除组件），重置所有输入框并重新绑定事件
  if (!oldComponents || newComponents.length !== oldComponents.length) {
    nextTick(() => {
      const allImageInputs = document.querySelectorAll('.form-image-input')
      allImageInputs.forEach(input => {
        input.value = ''
        // 移除 data-bound 属性，以便重新绑定事件
        input.removeAttribute('data-bound')
      })
      
      // 移除选项 label 的绑定标记，以便重新绑定事件
      const allOptionLabels = document.querySelectorAll('.option-label')
      allOptionLabels.forEach(label => {
        label.removeAttribute('data-option-label-bound')
      })
    })
  }
}, { deep: true })

// 当前活码ID（用于更新内容）
const currentLiveCodeId = ref(null)

// 二维码信息
const qrInfo = ref(null)

// 执行命令（改进版，更可靠）
const execCommand = (command, value = null) => {
  console.log('[工具栏日志] 执行命令:', command, value)
  editableArea.value?.focus()
  
  // 确保有选中内容
  const selection = window.getSelection()
  if (selection.rangeCount === 0) {
    // 如果没有选中内容，创建一个范围
    const range = document.createRange()
    range.selectNodeContents(editableArea.value)
    range.collapse(false)
    selection.removeAllRanges()
    selection.addRange(range)
  }
  
  try {
    // 执行命令
    const success = document.execCommand(command, false, value)
    console.log('[工具栏日志] 命令执行结果:', success)
    
    if (!success) {
      console.warn(`[工具栏日志] 命令执行失败: ${command}`, value)
      // 如果execCommand失败，使用备用方法
      applyFormatManually(command, value)
    }
  } catch (error) {
    console.error(`[工具栏日志] 执行命令时出错: ${command}`, error)
    applyFormatManually(command, value)
  }
  
  handleContentChange()
}

// 手动应用格式（备用方法）
const applyFormatManually = (command, value) => {
  const selection = window.getSelection()
  if (selection.rangeCount === 0) return
  
  const range = selection.getRangeAt(0)
  
  switch (command) {
    case 'bold':
      wrapWithTag(range, 'strong')
      break
    case 'italic':
      wrapWithTag(range, 'em')
      break
    case 'underline':
      wrapWithTag(range, 'u')
      break
    case 'strikeThrough':
      wrapWithTag(range, 's')
      break
    case 'fontName':
      if (value) {
        wrapWithStyle(range, 'font-family', value)
      }
      break
    case 'fontSize':
      if (value) {
        const sizeMap = { '1': '12px', '2': '14px', '3': '16px', '4': '18px', '5': '20px', '6': '24px', '7': '28px' }
        wrapWithStyle(range, 'font-size', sizeMap[value] || '16px')
      }
      break
    case 'foreColor':
      if (value) {
        wrapWithStyle(range, 'color', value)
      }
      break
    case 'backColor':
      if (value) {
        wrapWithStyle(range, 'background-color', value)
      }
      break
  }
}

// 用标签包装选中内容（改进版，支持切换）
const wrapWithTag = (range, tagName) => {
  try {
    // 检查是否已经在相同标签中
    let container = range.commonAncestorContainer
    if (container.nodeType === Node.TEXT_NODE) {
      container = container.parentElement
    }
    
    // 向上查找是否已经有相同标签
    let parent = container
    let foundTag = null
    while (parent && parent !== editableArea.value) {
      const tag = parent.tagName ? parent.tagName.toLowerCase() : ''
      if (tag === tagName || (tagName === 'strong' && tag === 'b') || (tagName === 'em' && tag === 'i')) {
        foundTag = parent
        break
      }
      parent = parent.parentElement
    }
    
    if (foundTag) {
      // 如果已经在相同标签中，移除标签（切换关闭）
      const parentNode = foundTag.parentNode
      const fragment = document.createDocumentFragment()
      while (foundTag.firstChild) {
        fragment.appendChild(foundTag.firstChild)
      }
      parentNode.replaceChild(fragment, foundTag)
      // 规范化DOM，合并相邻的文本节点
      parentNode.normalize()
      return
    }
    
    // 创建新标签并包装内容
    const element = document.createElement(tagName)
    try {
      const contents = range.extractContents()
      element.appendChild(contents)
      range.insertNode(element)
    } catch (e) {
      // 如果extractContents失败，使用surroundContents
      try {
        range.surroundContents(element)
      } catch (e2) {
        // 如果surroundContents也失败，手动处理
        const contents = range.cloneContents()
        element.appendChild(contents)
        range.deleteContents()
        range.insertNode(element)
      }
    }
  } catch (error) {
    console.error('包装标签失败:', error)
  }
}

// 用样式包装选中内容（改进版，支持字体切换）
const wrapWithStyle = (range, styleProperty, styleValue) => {
  try {
    // 检查是否已经在有相同样式的span中
    let container = range.commonAncestorContainer
    if (container.nodeType === Node.TEXT_NODE) {
      container = container.parentElement
    }
    
    let parent = container
    let foundSpan = null
    while (parent && parent !== editableArea.value) {
      if (parent.tagName && parent.tagName.toLowerCase() === 'span') {
        const currentValue = parent.style[styleProperty]
        // 对于font-family，需要比较实际值（可能包含引号）
        if (styleProperty === 'font-family') {
          const normalizedValue = styleValue.replace(/['"]/g, '')
          const normalizedCurrent = currentValue.replace(/['"]/g, '')
          if (normalizedCurrent === normalizedValue || normalizedCurrent.includes(normalizedValue)) {
            foundSpan = parent
            break
          }
        } else if (currentValue === styleValue) {
          foundSpan = parent
          break
        }
      }
      parent = parent.parentElement
    }
    
    if (foundSpan && foundSpan.style[styleProperty] === styleValue) {
      // 如果已经有相同样式，更新它（对于字体，可能需要更新）
      if (styleProperty === 'font-family') {
        foundSpan.style[styleProperty] = styleValue
      }
      return
    }
    
    // 创建新的span并应用样式
    const span = document.createElement('span')
    span.style[styleProperty] = styleValue
    
    try {
      const contents = range.extractContents()
      span.appendChild(contents)
      range.insertNode(span)
    } catch (e) {
      try {
        range.surroundContents(span)
      } catch (e2) {
        // 如果都失败，手动处理
        const contents = range.cloneContents()
        span.appendChild(contents)
        range.deleteContents()
        range.insertNode(span)
      }
    }
  } catch (error) {
    console.error('应用样式失败:', error)
  }
}

// 清除格式
const clearFormat = () => {
  document.execCommand('removeFormat', false, null)
  editableArea.value?.focus()
  handleContentChange()
}

// 获取当前光标所在的行元素
const getCurrentLineElement = () => {
  if (!editableArea.value) return null
  
  const selection = window.getSelection()
  if (selection.rangeCount === 0) return null
  
  const range = selection.getRangeAt(0)
  let container = range.startContainer
  
  // 如果光标在文本节点中，获取父元素
  if (container.nodeType === Node.TEXT_NODE) {
    container = container.parentElement
  }
  
  // 向上查找，找到 editableArea 的直接子元素（行元素）
  let parent = container
  while (parent && parent !== editableArea.value) {
    // 如果是 editableArea 的直接子元素，返回它
    if (parent.parentElement === editableArea.value) {
      return parent
    }
    parent = parent.parentElement
  }
  
  // 如果没找到，返回 editableArea 本身
  return editableArea.value
}

// 更新当前行的样式状态（用于高亮按钮）- 检查光标位置的字体大小
const updateCurrentHeadingStyle = () => {
  if (!editableArea.value) {
    currentHeadingStyle.value = 'heading-1'
    return
  }
  
  const selection = window.getSelection()
  if (selection.rangeCount === 0) {
    currentHeadingStyle.value = 'heading-1'
    return
  }
  
  const range = selection.getRangeAt(0)
  let container = range.startContainer
  
  // 如果光标在文本节点中，获取父元素
  if (container.nodeType === Node.TEXT_NODE) {
    container = container.parentElement
  }
  
  // 向上查找，检查字体大小
  let parent = container
  let foundFontSize = null
  while (parent && parent !== editableArea.value) {
    if (parent.style && parent.style.fontSize) {
      foundFontSize = parent.style.fontSize
      break
    }
    // 也检查计算样式
    if (parent.nodeType === Node.ELEMENT_NODE) {
      const computedStyle = window.getComputedStyle(parent)
      if (computedStyle.fontSize && computedStyle.fontSize !== '16px') {
        foundFontSize = computedStyle.fontSize
        break
      }
    }
    parent = parent.parentElement
  }
  
  // 根据字体大小匹配对应的标题样式
  if (foundFontSize) {
    for (const heading of headingConfig.value) {
      if (foundFontSize === heading.fontSize || foundFontSize.replace('px', '') === heading.fontSize.replace('px', '')) {
        currentHeadingStyle.value = heading.className
        return
      }
    }
  }
  
  // 如果没有找到匹配的字体大小，默认为标题一
  currentHeadingStyle.value = 'heading-1'
}

// 应用标题样式（类似字体大小选择器，只改变文字大小，不改变整行样式）
const applyHeadingStyle = (className) => {
  if (!editableArea.value) return
  
  editableArea.value.focus()
  
  const selection = window.getSelection()
  if (selection.rangeCount === 0) {
    // 如果没有选择，创建一个范围在光标位置
    const range = document.createRange()
    if (editableArea.value.lastChild) {
      range.setStartAfter(editableArea.value.lastChild)
      range.collapse(true)
    } else {
      range.selectNodeContents(editableArea.value)
      range.collapse(false)
    }
    selection.removeAllRanges()
    selection.addRange(range)
  }
  
  const range = selection.getRangeAt(0)
  
  // 获取对应的标题配置
  const heading = headingConfig.value.find(h => h.className === className)
  if (!heading) return
  
  // 如果选中内容为空（光标位置），直接应用样式到后续输入
  if (range.collapsed) {
    // 检查光标位置的父元素是否已有字体样式
    let container = range.startContainer
    if (container.nodeType === Node.TEXT_NODE) {
      container = container.parentElement
    }
    
    // 向上查找是否有span包含字体大小样式
    let parent = container
    let hasFontSizeStyle = false
    while (parent && parent !== editableArea.value) {
      if (parent.tagName && parent.tagName.toLowerCase() === 'span' && parent.style.fontSize) {
        // 更新现有span的字体大小和粗细
        parent.style.fontSize = heading.fontSize
        if (className !== 'normal') {
          parent.style.fontWeight = 'bold'
        } else {
          parent.style.fontWeight = 'normal'
        }
        hasFontSizeStyle = true
        break
      }
      parent = parent.parentElement
    }
    
    // 如果没有找到现有的span，创建一个新的span用于后续输入
    if (!hasFontSizeStyle) {
      const span = document.createElement('span')
      span.style.fontSize = heading.fontSize
      if (className !== 'normal') {
        span.style.fontWeight = 'bold'
      }
      
      // 在光标位置插入一个零宽度的span
      try {
        range.insertNode(span)
        // 移动光标到span内部
        range.setStartAfter(span)
        range.collapse(true)
        selection.removeAllRanges()
        selection.addRange(range)
      } catch (e) {
        console.error('插入标题样式span失败:', e)
      }
    }
  } else {
    // 有选中内容，使用wrapWithStyle应用字体大小
    wrapWithStyle(range, 'font-size', heading.fontSize)
    
    // 如果是标题（非正文），同时应用粗体
    if (className !== 'normal') {
      // 检查是否已经在bold标签中
      let container = range.commonAncestorContainer
      if (container.nodeType === Node.TEXT_NODE) {
        container = container.parentElement
      }
      
      let parent = container
      let foundBold = null
      while (parent && parent !== editableArea.value) {
        const tag = parent.tagName ? parent.tagName.toLowerCase() : ''
        if (tag === 'strong' || tag === 'b') {
          foundBold = parent
          break
        }
        parent = parent.parentElement
      }
      
      if (!foundBold) {
        // 如果没有bold标签，创建一个
        const strong = document.createElement('strong')
        try {
          const contents = range.extractContents()
          strong.appendChild(contents)
          range.insertNode(strong)
        } catch (e) {
          try {
            range.surroundContents(strong)
          } catch (e2) {
            const contents = range.cloneContents()
            strong.appendChild(contents)
            range.deleteContents()
            range.insertNode(strong)
          }
        }
      }
    } else {
      // 正文：移除粗体
      let container = range.commonAncestorContainer
      if (container.nodeType === Node.TEXT_NODE) {
        container = container.parentElement
      }
      
      let parent = container
      while (parent && parent !== editableArea.value) {
        const tag = parent.tagName ? parent.tagName.toLowerCase() : ''
        if (tag === 'strong' || tag === 'b') {
          const parentNode = parent.parentNode
          const fragment = document.createDocumentFragment()
          while (parent.firstChild) {
            fragment.appendChild(parent.firstChild)
          }
          parentNode.replaceChild(fragment, parent)
          parentNode.normalize()
          break
        }
        parent = parent.parentElement
      }
    }
  }
  
  // 更新当前样式状态（用于按钮显示）
  currentHeadingStyle.value = className
  showHeadingStyleDropdown.value = false
  handleContentChange()
  editableArea.value.focus()
}

// 切换标题样式下拉菜单
const toggleHeadingStyleDropdown = () => {
  showHeadingStyleDropdown.value = !showHeadingStyleDropdown.value
  // 关闭其他下拉菜单
  if (showHeadingStyleDropdown.value) {
    showLineHeightDropdown.value = false
    showForegroundColorDropdown.value = false
    showBackgroundColorDropdown.value = false
  }
}

// 获取当前标题样式的名称
const getCurrentHeadingName = () => {
  const heading = headingConfig.value.find(h => h.className === currentHeadingStyle.value)
  return heading ? heading.name : '标题一'
}

// 获取当前标题样式的预览文字
const getCurrentHeadingPreview = () => {
  const heading = headingConfig.value.find(h => h.className === currentHeadingStyle.value)
  return heading ? heading.previewText : 'H1'
}

// 处理键盘事件（确保按回车时创建新的独立div行）
const handleKeyDown = (event) => {
  // 处理回车键
  if (event.key === 'Enter' || event.keyCode === 13) {
    const selection = window.getSelection()
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      let container = range.startContainer
      
      // 如果光标在文本节点中，获取父元素
      if (container.nodeType === Node.TEXT_NODE) {
        container = container.parentElement
      }

      // 在 content-block-wrapper 内按回车：只插入换行，不要把整个块拆成普通 div（否则会丢失块样式/结构）
      // 这类块往往包含模板/表格/复杂结构，走“拆分 div 行”会把结构降级成纯文本
      const inContentBlock = !!(container?.closest && container.closest('.content-block-wrapper'))

      // 如果光标在表格内部，禁止走“拆分 div 行”的自定义 Enter 逻辑
      // 否则可能会把包含 <table> 的外层块(textContent) 拆成纯文本，导致表格消失
      let isInTable = false
      let tableCursorEl = container
      while (tableCursorEl && tableCursorEl !== editableArea.value) {
        const tag = tableCursorEl.tagName ? tableCursorEl.tagName.toLowerCase() : ''
        if (tag === 'table' || tag === 'td' || tag === 'th') {
          isInTable = true
          break
        }
        tableCursorEl = tableCursorEl.parentElement
      }
      // key-value 表格（div行结构）也算“表格内部”
      if (!isInTable && container?.closest && container.closest('.editor-kv-row')) {
        isInTable = true
      }
      // 内联表格（inline 行结构）也算“表格内部”
      if (!isInTable && container?.closest && (container.closest('.editor-inline-row') || container.closest('.editor-inline-value'))) {
        isInTable = true
      }
      if (isInTable || inContentBlock) {
        // 在单元格内按回车：插入换行，不破坏表格结构
        event.preventDefault()
        try {
          // 兼容多数浏览器
          document.execCommand('insertLineBreak')
        } catch (e) {
          // fallback：手动插入 <br>
          const br = document.createElement('br')
          range.insertNode(br)
          range.setStartAfter(br)
          range.collapse(true)
          selection.removeAllRanges()
          selection.addRange(range)
        }
        handleContentChange()
        return
      }
      
      // 检查是否在列表项中（ul或ol的li元素）
      let isInListItem = false
      let currentElement = container
      while (currentElement && currentElement !== editableArea.value) {
        if (currentElement.tagName && (currentElement.tagName.toLowerCase() === 'li')) {
          isInListItem = true
          break
        }
        currentElement = currentElement.parentElement
      }
      
      // 如果在列表项中，让浏览器默认处理，不阻止默认行为
      if (isInListItem) {
        // 不执行 preventDefault，让浏览器正常处理列表换行
        return
      }
      
      // 获取当前行元素
      const currentLine = getCurrentLineElement()
      
      // 如果当前行是 editableArea 的直接子元素（div行），处理换行
      if (currentLine && currentLine !== editableArea.value && currentLine.parentElement === editableArea.value) {
        event.preventDefault()
        
        // 获取光标在当前行中的位置
        const textOffset = range.startOffset
        const lineText = currentLine.textContent || ''
        const textBefore = lineText.substring(0, textOffset)
        const textAfter = lineText.substring(textOffset)
        
        // 更新当前行的内容（保留光标前的文本）
        if (textBefore.trim()) {
          currentLine.textContent = textBefore
        } else {
          currentLine.innerHTML = '&nbsp;'
        }
        
        // 创建新的 div 元素作为新行（默认使用正文样式）
        const newDiv = document.createElement('div')
        newDiv.className = 'normal'
        if (textAfter.trim()) {
          newDiv.textContent = textAfter
        } else {
          newDiv.innerHTML = '&nbsp;'
        }
        
        // 在当前行后插入新行
        if (currentLine.nextSibling) {
          editableArea.value.insertBefore(newDiv, currentLine.nextSibling)
        } else {
          editableArea.value.appendChild(newDiv)
        }
        
        // 移动光标到新行的开头
        const newRange = document.createRange()
        if (newDiv.firstChild && newDiv.firstChild.nodeType === Node.TEXT_NODE) {
          newRange.setStart(newDiv.firstChild, 0)
          newRange.setEnd(newDiv.firstChild, 0)
        } else {
          newRange.selectNodeContents(newDiv)
          newRange.collapse(true)
        }
        selection.removeAllRanges()
        selection.addRange(newRange)
        
        // 更新样式状态
        updateCurrentHeadingStyle()
        
        // 触发内容变化
        handleContentChange()
      }
    }
  }
}

// 表格/单元格占位符处理：保证单元格为空时仍保持行高一致（使用 &nbsp;）
const normalizeCellPlaceholder = (el) => {
  if (!el) return
  // 只处理：table td/th 以及 key-value 表格行内的 span
  const tag = el.tagName ? el.tagName.toLowerCase() : ''
  const isTableCell = tag === 'td' || tag === 'th'
  const isKVSpan = tag === 'span' && el.closest?.('.editor-kv-row')
  const isInlineValueSpan = tag === 'span' && el.classList?.contains('editor-inline-value')
  if (!isTableCell && !isKVSpan && !isInlineValueSpan) return

  // 把 nbsp 当作空
  const text = (el.textContent || '').replace(/\u00A0/g, '').trim()
  // 如果只剩下 <br> 或空白，也视为空
  const hasMeaningfulContent = text.length > 0
  if (!hasMeaningfulContent) {
    el.innerHTML = '&nbsp;'
  }
}

const clearCellPlaceholderIfNeeded = (el) => {
  if (!el) return
  const tag = el.tagName ? el.tagName.toLowerCase() : ''
  const isTableCell = tag === 'td' || tag === 'th'
  const isKVSpan = tag === 'span' && el.closest?.('.editor-kv-row')
  const isInlineValueSpan = tag === 'span' && el.classList?.contains('editor-inline-value')
  if (!isTableCell && !isKVSpan && !isInlineValueSpan) return

  // 只有一个 nbsp 时，清空以便输入
  const onlyNbsp = (el.innerHTML || '').trim() === '&nbsp;' || (el.textContent || '') === '\u00A0'
  if (!onlyNbsp) return

  el.innerHTML = ''
  // 把光标放回元素内部开头
  try {
    const sel = window.getSelection()
    const r = document.createRange()
    r.selectNodeContents(el)
    r.collapse(true)
    sel.removeAllRanges()
    sel.addRange(r)
  } catch (e) {
    // ignore
  }
}

// 使用 focusin/out 做事件委托（focus/blur 不冒泡）
const handleFocusIn = (event) => {
  const target = event?.target
  if (!target) return
  // 如果是 td/th 直接聚焦，或在 td/th 内部聚焦（如 span），找到最近的单元格
  if (target.closest) {
    const td = target.closest('td,th')
    if (td) return clearCellPlaceholderIfNeeded(td)
  }
  // key-value 表格 span（注意：closest 不支持“后代选择器”定位到 span 本身）
  const tag = target.tagName ? target.tagName.toLowerCase() : ''
  if (tag === 'span' && target.closest?.('.editor-kv-row')) {
    return clearCellPlaceholderIfNeeded(target)
  }
  // 内联表格 value span
  if (tag === 'span' && target.classList?.contains('editor-inline-value')) {
    return clearCellPlaceholderIfNeeded(target)
  }
}

const handleFocusOut = (event) => {
  const target = event?.target
  if (!target) return
  if (target.closest) {
    const td = target.closest('td,th')
    if (td) return normalizeCellPlaceholder(td)
  }
  const tag = target.tagName ? target.tagName.toLowerCase() : ''
  if (tag === 'span' && target.closest?.('.editor-kv-row')) {
    return normalizeCellPlaceholder(target)
  }
  if (tag === 'span' && target.classList?.contains('editor-inline-value')) {
    return normalizeCellPlaceholder(target)
  }
}


// 应用字体（改进版，直接使用样式）
const applyFontFamily = () => {
  editableArea.value?.focus()
  
  const selection = window.getSelection()
  if (selection.rangeCount === 0) {
    // 如果没有选择，创建一个范围
    const range = document.createRange()
    range.selectNodeContents(editableArea.value)
    range.collapse(false)
    selection.removeAllRanges()
    selection.addRange(range)
  }
  
  const range = selection.getRangeAt(0)
  
  // 如果选中内容为空，在光标位置应用字体
  if (range.collapsed) {
    // 检查光标位置的父元素是否已有字体样式
    let container = range.startContainer
    if (container.nodeType === Node.TEXT_NODE) {
      container = container.parentElement
    }
    
    // 向上查找是否有span包含字体样式
    let parent = container
    let hasFontStyle = false
    while (parent && parent !== editableArea.value) {
      if (parent.tagName && parent.tagName.toLowerCase() === 'span' && parent.style.fontFamily) {
        // 更新现有span的字体
        parent.style.fontFamily = fontFamily.value
        hasFontStyle = true
        break
      }
      parent = parent.parentElement
    }
    
    if (!hasFontStyle) {
      // 创建新的span来应用字体
      const span = document.createElement('span')
      span.style.fontFamily = fontFamily.value
      span.innerHTML = '&nbsp;'
      range.insertNode(span)
      
      // 移动光标到span内
      const newRange = document.createRange()
      newRange.selectNodeContents(span)
      newRange.collapse(false)
      selection.removeAllRanges()
      selection.addRange(newRange)
    }
  } else {
    // 有选中内容，直接使用wrapWithStyle应用字体
    wrapWithStyle(range, 'font-family', fontFamily.value)
  }
  
  handleContentChange()
}

// 应用行高
const applyLineHeight = (height) => {
  console.log('[工具栏日志] 应用行高:', height)
  editableArea.value?.focus()
  
  const selection = window.getSelection()
  console.log('[工具栏日志] 选择范围数量:', selection.rangeCount)
  
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0)
    const container = range.commonAncestorContainer
    console.log('[工具栏日志] 容器类型:', container.nodeType, '容器:', container)
    
    // 找到包含选中内容的元素
    let element = container.nodeType === Node.TEXT_NODE ? container.parentElement : container
    while (element && element !== editableArea.value && !element.style) {
      element = element.parentElement
    }
    
    console.log('[工具栏日志] 找到的元素:', element, '是否有样式:', element?.style)
    
    if (element && element !== editableArea.value) {
      element.style.lineHeight = height
      currentLineHeight.value = height
      console.log('[工具栏日志] 行高已应用到元素，新行高:', element.style.lineHeight)
    } else {
      // 如果没有选中元素，检查是否有选中内容
      if (!range.collapsed) {
        // 有选中内容，创建span包装
        const span = document.createElement('span')
        span.style.lineHeight = height
        try {
          range.surroundContents(span)
          currentLineHeight.value = height
          console.log('[工具栏日志] 行高已应用到选中内容（surroundContents）')
        } catch (e) {
          // 如果surroundContents失败，使用insertNode
          const contents = range.extractContents()
          span.appendChild(contents)
          range.insertNode(span)
          currentLineHeight.value = height
          console.log('[工具栏日志] 行高已应用到选中内容（insertNode）')
        }
      } else {
        // 没有选中内容，在光标位置插入带行高的span
        const span = document.createElement('span')
        span.style.lineHeight = height
        span.innerHTML = '&nbsp;'
        range.insertNode(span)
        // 移动光标到span内
        const newRange = document.createRange()
        newRange.selectNodeContents(span)
        newRange.collapse(false)
        selection.removeAllRanges()
        selection.addRange(newRange)
        currentLineHeight.value = height
        console.log('[工具栏日志] 行高已应用到光标位置')
      }
    }
  } else {
    console.log('[工具栏日志] 没有选择范围，尝试应用到整个编辑区域')
    // 如果没有选择，应用到整个编辑区域
    if (editableArea.value) {
      editableArea.value.style.lineHeight = height
      currentLineHeight.value = height
      console.log('[工具栏日志] 行高已应用到整个编辑区域')
    }
  }
  
  showLineHeightDropdown.value = false
  editableArea.value?.focus()
  handleContentChange()
}

// 切换下拉菜单

const toggleLineHeightDropdown = () => {
  console.log('[工具栏日志] 点击行高按钮，当前状态:', showLineHeightDropdown.value)
  showLineHeightDropdown.value = !showLineHeightDropdown.value
  console.log('[工具栏日志] 行高下拉菜单新状态:', showLineHeightDropdown.value)
  // 关闭其他下拉菜单
  if (showLineHeightDropdown.value) {
    showForegroundColorDropdown.value = false
    showBackgroundColorDropdown.value = false
  }
}

const toggleForegroundColorDropdown = () => {
  console.log('[工具栏日志] 点击前景色按钮，当前状态:', showForegroundColorDropdown.value)
  
  // 在打开下拉菜单时保存当前选中状态
  if (!showForegroundColorDropdown.value) {
    const selection = window.getSelection()
    if (selection.rangeCount > 0) {
      savedSelectionRange.value = selection.getRangeAt(0).cloneRange()
      console.log('[前景色] 已保存选中状态:', savedSelectionRange.value.toString())
    } else {
      savedSelectionRange.value = null
      console.log('[前景色] 没有选中内容')
    }
  }
  
  showForegroundColorDropdown.value = !showForegroundColorDropdown.value
  console.log('[工具栏日志] 前景色下拉菜单新状态:', showForegroundColorDropdown.value)
  // 关闭其他下拉菜单
  if (showForegroundColorDropdown.value) {
    showLineHeightDropdown.value = false
    showBackgroundColorDropdown.value = false
  }
}

const toggleBackgroundColorDropdown = () => {
  console.log('[工具栏日志] 点击背景色按钮，当前状态:', showBackgroundColorDropdown.value)
  
  // 在打开下拉菜单时保存当前选中状态
  if (!showBackgroundColorDropdown.value) {
    const selection = window.getSelection()
    if (selection.rangeCount > 0) {
      savedSelectionRange.value = selection.getRangeAt(0).cloneRange()
      console.log('[背景色] 已保存选中状态:', savedSelectionRange.value.toString())
    } else {
      savedSelectionRange.value = null
      console.log('[背景色] 没有选中内容')
    }
  }
  
  showBackgroundColorDropdown.value = !showBackgroundColorDropdown.value
  console.log('[工具栏日志] 背景色下拉菜单新状态:', showBackgroundColorDropdown.value)
  // 关闭其他下拉菜单
  if (showBackgroundColorDropdown.value) {
    showLineHeightDropdown.value = false
    showForegroundColorDropdown.value = false
  }
}

// 应用前景色（文字颜色）- 优化版，确保应用到所有选中文字
const applyForegroundColor = (color) => {
  console.log('[工具栏日志] 应用前景色:', color)
  editableArea.value?.focus()
  
  // 优先使用保存的选中状态
  let range = null
  const selection = window.getSelection()
  
  if (savedSelectionRange.value) {
    console.log('[前景色] 使用保存的选中状态:', savedSelectionRange.value.toString())
    range = savedSelectionRange.value
    // 恢复选中状态
    selection.removeAllRanges()
    selection.addRange(range.cloneRange())
  } else if (selection.rangeCount > 0) {
    range = selection.getRangeAt(0)
    console.log('[前景色] 使用当前选中状态')
  } else {
    console.warn('[前景色] 没有选中范围')
    return
  }
  
  console.log('[前景色] selection.rangeCount:', selection.rangeCount)
  console.log('[前景色] range.collapsed:', range.collapsed)
  console.log('[前景色] range.toString():', range.toString())
  console.log('[前景色] range.startContainer:', range.startContainer)
  console.log('[前景色] range.endContainer:', range.endContainer)
  
  if (range.collapsed) {
    console.log('[前景色] 没有选中内容，在光标位置插入带颜色的span')
    // 没有选中内容，在光标位置插入带颜色的span
    const span = document.createElement('span')
    span.style.color = color
    span.innerHTML = '&nbsp;'
    range.insertNode(span)
    // 移动光标到span内
    const newRange = document.createRange()
    newRange.selectNodeContents(span)
    newRange.collapse(false)
    selection.removeAllRanges()
    selection.addRange(newRange)
  } else {
    console.log('[前景色] 有选中内容，开始应用颜色')
    // 有选中内容，确保应用到所有选中的文字
    try {
      // 创建span包装选中内容
      const span = document.createElement('span')
      span.style.color = color
      
      // 提取选中内容并包装
      const contents = range.extractContents()
      console.log('[前景色] extractContents成功，内容:', contents.textContent)
      span.appendChild(contents)
      range.insertNode(span)
      console.log('[前景色] span已插入，颜色:', span.style.color)
      
      // 移动光标到span末尾
      const newRange = document.createRange()
      newRange.setStartAfter(span)
      newRange.collapse(true)
      selection.removeAllRanges()
      selection.addRange(newRange)
    } catch (e) {
      console.error('[前景色] extractContents失败，尝试surroundContents:', e)
      // 如果extractContents失败，尝试使用surroundContents
      try {
        const span = document.createElement('span')
        span.style.color = color
        range.surroundContents(span)
        console.log('[前景色] surroundContents成功')
      } catch (e2) {
        console.error('[前景色] surroundContents也失败，使用cloneContents:', e2)
        // 如果都失败，使用cloneContents
        try {
          const span = document.createElement('span')
          span.style.color = color
          const contents = range.cloneContents()
          span.appendChild(contents)
          range.deleteContents()
          range.insertNode(span)
          console.log('[前景色] cloneContents成功')
        } catch (e3) {
          console.error('[前景色] 所有方法都失败:', e3)
        }
      }
    }
  }
  
  textColor.value = color
  showForegroundColorDropdown.value = false
  editableArea.value?.focus()
  handleContentChange()
}

// 应用背景色 - 优化版，确保应用到所有选中文字
const applyBackgroundColor = (color) => {
  console.log('[工具栏日志] 应用背景色:', color)
  editableArea.value?.focus()
  
  // 优先使用保存的选中状态
  let range = null
  const selection = window.getSelection()
  
  if (savedSelectionRange.value) {
    console.log('[背景色] 使用保存的选中状态:', savedSelectionRange.value.toString())
    range = savedSelectionRange.value
    // 恢复选中状态
    selection.removeAllRanges()
    selection.addRange(range.cloneRange())
  } else if (selection.rangeCount > 0) {
    range = selection.getRangeAt(0)
    console.log('[背景色] 使用当前选中状态')
  } else {
    console.warn('[背景色] 没有选中范围')
    return
  }
  
  console.log('[背景色] selection.rangeCount:', selection.rangeCount)
  const bgColor = (color === 'transparent' || color === 'rgba(0,0,0,0)') ? 'transparent' : color
  console.log('[背景色] range.collapsed:', range.collapsed)
  console.log('[背景色] range.toString():', range.toString())
  console.log('[背景色] range.startContainer:', range.startContainer)
  console.log('[背景色] range.endContainer:', range.endContainer)
  
  if (range.collapsed) {
    console.log('[背景色] 没有选中内容，在光标位置插入带背景色的span')
    // 没有选中内容，在光标位置插入带背景色的span
    const span = document.createElement('span')
    span.style.backgroundColor = bgColor
    span.innerHTML = '&nbsp;'
    range.insertNode(span)
    // 移动光标到span内
    const newRange = document.createRange()
    newRange.selectNodeContents(span)
    newRange.collapse(false)
    selection.removeAllRanges()
    selection.addRange(newRange)
  } else {
    console.log('[背景色] 有选中内容，开始应用背景色')
    // 有选中内容，确保应用到所有选中的文字
    try {
      // 创建span包装选中内容
      const span = document.createElement('span')
      span.style.backgroundColor = bgColor
      
      // 提取选中内容并包装
      const contents = range.extractContents()
      console.log('[背景色] extractContents成功，内容:', contents.textContent)
      span.appendChild(contents)
      range.insertNode(span)
      console.log('[背景色] span已插入，背景色:', span.style.backgroundColor)
      
      // 移动光标到span末尾
      const newRange = document.createRange()
      newRange.setStartAfter(span)
      newRange.collapse(true)
      selection.removeAllRanges()
      selection.addRange(newRange)
    } catch (e) {
      console.error('[背景色] extractContents失败，尝试surroundContents:', e)
      // 如果extractContents失败，尝试使用surroundContents
      try {
        const span = document.createElement('span')
        span.style.backgroundColor = bgColor
        range.surroundContents(span)
        console.log('[背景色] surroundContents成功')
      } catch (e2) {
        console.error('[背景色] surroundContents也失败，使用cloneContents:', e2)
        // 如果都失败，使用cloneContents
        try {
          const span = document.createElement('span')
          span.style.backgroundColor = bgColor
          const contents = range.cloneContents()
          span.appendChild(contents)
          range.deleteContents()
          range.insertNode(span)
          console.log('[背景色] cloneContents成功')
        } catch (e3) {
          console.error('[背景色] 所有方法都失败:', e3)
        }
      }
    }
  }
  
  highlightColor.value = color
  showBackgroundColorDropdown.value = false
  editableArea.value?.focus()
  handleContentChange()
}

// 生成颜色调色板
const generateColorPalette = () => {
  const colors = []
  const hues = [0, 15, 30, 45, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330]
  const saturations = [100, 80, 60, 40]
  const lightnesses = [50, 60, 70, 80, 90]
  
  // 生成基础颜色网格
  for (let s = 0; s < saturations.length; s++) {
    for (let l = 0; l < lightnesses.length; l++) {
      for (let h = 0; h < hues.length; h++) {
        const hsl = `hsl(${hues[h]}, ${saturations[s]}%, ${lightnesses[l]}%)`
        colors.push(hsl)
      }
    }
  }
  
  return colors.slice(0, 80) // 限制为80个颜色
}

// 处理内容类型按钮点击（统一入口，支持事件传递）
const handleContentTypeClick = (type, event) => {
  // 阻止事件冒泡，避免被全局点击事件处理干扰
  if (event) {
    event.stopPropagation()
    event.preventDefault()
  }
  
  // 图片类型使用专门的处理函数
  if (type.id === 'image') {
    handleImageButtonClick(event)
    return
  }
  
  // 其他类型使用原来的逻辑
  addContentTypeToEditor(type)
}

// 处理图片按钮点击（重构版本，更直接可靠）
const handleImageButtonClick = (event) => {
  console.log('[图片按钮] 点击图片按钮，准备打开图片设置')
  
  try {
    // 重置图片上传数据（如果之前有数据）
    // imageUploadData.value = null // 注释掉，保留之前的选择
    
    // 如果有图片，默认选中第一张
    if (imageUploadData.value.length > 0) {
      selectedImageIndex.value = 0
    }
    
    // 打开图片设置模态框
    showImageModal.value = true
    
    console.log('[图片按钮] 图片设置模态框已打开')
    
    // 使用 nextTick 确保模态框已经渲染完成
    nextTick(() => {
      console.log('[图片按钮] 模态框已渲染完成')
      // 可以在这里添加其他初始化逻辑
    })
  } catch (error) {
    console.error('[图片按钮] 打开图片设置模态框失败:', error)
    alert(tt('advancedEditor.errors.openImageSettingsFailed'))
  }
}

// 添加内容类型到编辑区域
const addContentTypeToEditor = (type) => {
  switch (type.id) {
    case 'image':
      // 图片类型已经在 handleContentTypeClick 中处理，这里不会被执行
      // 但保留作为备用
      handleImageButtonClick()
      break
    case 'video':
      // 打开视频设置模态框
      showVideoModal.value = true
      break
    case 'audio':
      // 打开音频设置模态框
      showAudioModal.value = true
      break
    case 'file':
      // 打开文件设置模态框
      showFileModal.value = true
      break
    case 'contact':
      // 打开联系方式模态框
      showContactModal.value = true
      break
    case 'location':
      // 打开地图位置模态框
      showLocationModal.value = true
      break
    case 'form':
      // 打开表单列表模态框
      showFormListModal.value = true
      break
    default:
      if (!editableArea.value) return
      insertHTMLToEditor('<div class="content-item" style="padding: 12px;">' + tt('advancedEditorExtra.newContent') + '</div>')
  }
}

// 添加模板到编辑区域（支持 labelKey/valueKey 解析）
const addTemplateToEditor = (template) => {
  if (!editableArea.value) return
  const fields = (template.fields || []).map(f => ({
    ...f,
    label: f.labelKey ? tt(f.labelKey) : (f.label || ''),
    value: f.valueKey ? tt(f.valueKey) : (f.value || '')
  }))
  const T = { ...template, fields }
  
  let html = ''
  
  // 根据模板类型和样式生成不同的HTML
  if (T.type === 'plain') {
    T.fields.forEach((field, index) => {
      const marginBottom = index < T.fields.length - 1 ? '16px' : '0'
      html += `
        <div class="template-plain-item" style="margin-bottom: ${marginBottom}; font-size: 14px; line-height: 1.6; color: #333;">
          <span style="color: #666;">${field.label}</span>
          <span style="margin-left: 8px;">${field.value}</span>
        </div>
      `
    })
  } else if (T.type === 'table') {
    if (T.style === 'key-value') {
      T.fields.forEach((field, index) => {
        const labelHtml = (field.label && String(field.label).trim()) ? field.label : '&nbsp;'
        const valueHtml = (field.value && String(field.value).trim()) ? field.value : '&nbsp;'
        html += `
          <div class="editor-kv-row" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; line-height: 20px; min-height: 44px;">
            <span contenteditable="true" style="color: #666; display: inline-block; line-height: 20px; min-height: 20px; outline: none;">${labelHtml}</span>
            <span contenteditable="true" style="color: #333; font-weight: 500; display: inline-block; line-height: 20px; min-height: 20px; outline: none;">${valueHtml}</span>
          </div>
        `
      })
    } else if (T.style === 'bordered') {
      html += '<table class="editor-table" style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px; border: 1px solid #e0e0e0;">'
      T.fields.forEach((field, index) => {
        const labelHtml = (field.label && String(field.label).trim()) ? field.label : '&nbsp;'
        const valueHtml = (field.value && String(field.value).trim()) ? field.value : '&nbsp;'
        html += `
          <tr>
            <td contenteditable="true" style="padding: 10px 12px; border: 1px solid #e0e0e0; color: #666; font-weight: 500; background: white; line-height: 20px; min-height: 44px; vertical-align: middle;">${labelHtml}</td>
            <td contenteditable="true" style="padding: 10px 12px; border: 1px solid #e0e0e0; color: #333; background: white; line-height: 20px; min-height: 44px; vertical-align: middle;">${valueHtml}</td>
          </tr>
        `
      })
      html += '</table>'
    } else if (T.style === 'alternating') {
      html += '<table class="editor-table" style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px; border: 1px solid #e0e0e0;">'
      T.fields.forEach((field, index) => {
        const bgColor = index % 2 === 0 ? '#f5f5f5' : 'white'
        const labelHtml = (field.label && String(field.label).trim()) ? field.label : '&nbsp;'
        const valueHtml = (field.value && String(field.value).trim()) ? field.value : '&nbsp;'
        html += `
          <tr>
            <td contenteditable="true" style="padding: 10px 12px; border: 1px solid #e0e0e0; color: #666; font-weight: 500; background: ${bgColor}; line-height: 20px; min-height: 44px; vertical-align: middle;">${labelHtml}</td>
            <td contenteditable="true" style="padding: 10px 12px; border: 1px solid #e0e0e0; color: #333; background: ${bgColor}; line-height: 20px; min-height: 44px; vertical-align: middle;">${valueHtml}</td>
          </tr>
        `
      })
      html += '</table>'
    } else if (T.style === 'with-header') {
      html += '<table class="editor-table" style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px; border: 1px solid #e0e0e0;">'
      T.fields.forEach((field, index) => {
        if (field.isHeader) {
          const headerLabelHtml = (field.label && String(field.label).trim()) ? field.label : '&nbsp;'
          const headerValueHtml = (field.value && String(field.value).trim()) ? field.value : '&nbsp;'
          html += `
            <tr>
              <td colspan="2" contenteditable="true" style="padding: 10px 12px; border: 1px solid #e0e0e0; color: #333; background: white; text-align: center; font-weight: bold; line-height: 20px; min-height: 44px; vertical-align: middle;">${headerLabelHtml}</td>
            </tr>
            <tr>
              <td colspan="2" contenteditable="true" style="padding: 10px 12px; border: 1px solid #e0e0e0; color: #333; background: white; text-align: center; font-weight: bold; line-height: 20px; min-height: 44px; vertical-align: middle;">${headerValueHtml}</td>
            </tr>
          `
        } else {
          const labelHtml = (field.label && String(field.label).trim()) ? field.label : '&nbsp;'
          const valueHtml = (field.value && String(field.value).trim()) ? field.value : '&nbsp;'
          html += `
            <tr>
              <td contenteditable="true" style="padding: 10px 12px; border: 1px solid #e0e0e0; color: #666; font-weight: 500; background: white; line-height: 20px; min-height: 44px; vertical-align: middle;">${labelHtml}</td>
              <td contenteditable="true" style="padding: 10px 12px; border: 1px solid #e0e0e0; color: #333; background: white; line-height: 20px; min-height: 44px; vertical-align: middle;">${valueHtml}</td>
            </tr>
          `
        }
      })
      html += '</table>'
    } else if (T.style === 'inline') {
      T.fields.forEach((field, index) => {
        const marginBottom = index < T.fields.length - 1 ? '12px' : '0'
        const valueHtml = (field.value && String(field.value).trim()) ? field.value : '&nbsp;'
        const labelHtml = (field.label && String(field.label).trim()) ? field.label : '&nbsp;'
        html += `
          <div class="editor-inline-row" style="margin-bottom: ${marginBottom}; font-size: 14px; line-height: 1.6; color: #333;">
            <span class="editor-inline-label" contenteditable="true" style="color: #666; display: inline-block; line-height: 20px; min-height: 20px; outline: none;">${labelHtml}</span><span style="color: #666;">：</span>
            <span class="editor-inline-value" contenteditable="true" style="color: ${selectedColor.value}; display: inline-block; line-height: 20px; min-height: 20px; outline: none;">${valueHtml}</span>
          </div>
        `
      })
    } else {
      // 默认表格格式（带边框或左侧灰色）
      html += '<table class="editor-table" style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">'
      T.fields.forEach((field, index) => {
        const labelStyle = T.shaded 
          ? 'background: #f5f5f5; padding: 10px 12px; border: 1px solid #e0e0e0; color: #666; font-weight: 500;'
          : 'padding: 10px 12px; border: 1px solid #e0e0e0; color: #666; font-weight: 500;'
        
        const valueStyle = T.equalWidth && index === 0
          ? 'padding: 10px 12px; border: 1px solid #e0e0e0; color: #333; width: 50%;'
          : 'padding: 10px 12px; border: 1px solid #e0e0e0; color: #333;'
        
        const labelHtml = (field.label && String(field.label).trim()) ? field.label : '&nbsp;'
        const valueHtml = (field.value && String(field.value).trim()) ? field.value : '&nbsp;'
        
        html += `
          <tr>
            <td contenteditable="true" style="${labelStyle} line-height: 20px; min-height: 44px; vertical-align: middle;">${labelHtml}</td>
            <td contenteditable="true" style="${valueStyle} line-height: 20px; min-height: 44px; vertical-align: middle;">${valueHtml}</td>
          </tr>
        `
      })
      html += '</table>'
    }
  } else if (T.type === 'colon') {
    T.fields.forEach((field, index) => {
      const marginBottom = index < T.fields.length - 1 ? '12px' : '0'
      html += `
        <div class="template-colon-item" style="margin-bottom: ${marginBottom}; font-size: 14px; line-height: 1.6; color: #333;">
          ${field.label}: <span style="color: ${selectedColor.value};">${field.value}</span>
        </div>
      `
    })
  }
  
  // 添加分隔线
  html += '<div style="height: 1px; background: #e0e0e0; margin: 20px 0; border: none;"></div>'
  
  insertHTMLToEditor(html)
}

// 添加元素到编辑区域
const addElementToEditor = (element) => {
  if (!editableArea.value) return
  
  let html = ''
  
  if (element.type === 'title') {
    html = `<div class="title-element" style="font-size: 24px; font-weight: bold; padding: 16px; background: ${selectedColor.value}15; color: ${selectedColor.value}; border-left: 4px solid ${selectedColor.value}; margin: 16px 0;">${element.label}</div>`
  } else {
    html = `<div class="element-item" style="padding: 12px; margin: 12px 0;">${element.label}</div>`
  }
  
  insertHTMLToEditor(html)
}

// 添加元素模板到编辑区域
// 检查图片是否已存在于编辑区域（优化版本，只检查相关元素）
const checkImageExists = (imageSrc) => {
  if (!editableArea.value) return false
  
  // 标准化图片路径，移除可能的引号和多余字符
  const normalizePath = (path) => {
    if (!path) return ''
    // 移除 data:image 前缀（如果是base64）
    if (path.startsWith('data:')) {
      return path
    }
    // 移除引号和url()包装
    return path.replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '').replace(/['"]/g, '')
  }
  
  const normalizedSrc = normalizePath(imageSrc)
  
  // 只检查图片相关的元素，而不是所有元素（性能优化）
  // 1. 检查所有img标签的src
  const images = editableArea.value.querySelectorAll('img')
  for (let img of images) {
    const imgSrc = normalizePath(img.src || img.getAttribute('src') || '')
    if (imgSrc === normalizedSrc || (imgSrc && normalizedSrc && (imgSrc.includes(normalizedSrc) || normalizedSrc.includes(imgSrc)))) {
      return true
    }
  }
  
  // 2. 只检查photo-card-item和editor-image-content元素，而不是所有元素
  const photoCards = editableArea.value.querySelectorAll('.photo-card-item, .editor-image-content')
  for (let el of photoCards) {
    // 只检查内联样式，避免计算样式（性能优化）
    const inlineBg = el.style.backgroundImage
    if (inlineBg && inlineBg !== 'none') {
      const inlinePath = normalizePath(inlineBg)
      if (inlinePath === normalizedSrc || (inlinePath && normalizedSrc && (inlinePath.includes(normalizedSrc) || normalizedSrc.includes(inlinePath)))) {
        return true
      }
    }
    // 检查子元素的内联样式
    const childWithBg = el.querySelector('[style*="background-image"]')
    if (childWithBg) {
      const childBg = childWithBg.style.backgroundImage
      if (childBg && childBg !== 'none') {
        const childPath = normalizePath(childBg)
        if (childPath === normalizedSrc || (childPath && normalizedSrc && (childPath.includes(normalizedSrc) || normalizedSrc.includes(childPath)))) {
          return true
        }
      }
    }
  }
  
  return false
}

const addElementTemplateToEditor = (template) => {
  if (!editableArea.value) return
  const resolvedText = template.textKey ? tt(template.textKey) : (template.text || '')
  const resolvedTitle = template.titleKey ? tt(template.titleKey) : (template.title || '')
  const resolvedLabel = template.labelKey ? tt(template.labelKey) : (template.label || '')
  const resolvedIcons = template.icons?.map(i => ({ ...i, label: i.labelKey ? tt(i.labelKey) : (i.label || '') }))
  const resolvedFields = template.fields?.map(f => ({
    ...f,
    label: f.labelKey ? tt(f.labelKey) : (f.label || ''),
    value: f.valueKey ? tt(f.valueKey) : (f.value || '')
  }))
  const resolvedItems = template.items?.map(it => ({
    ...it,
    title: it.titleKey ? tt(it.titleKey) : (it.title || ''),
    subtitle: it.subtitleKey ? tt(it.subtitleKey) : (it.subtitle || '')
  }))
  const T = {
    ...template,
    text: resolvedText,
    title: resolvedTitle,
    label: resolvedLabel,
    icons: resolvedIcons || template.icons,
    fields: resolvedFields || template.fields,
    items: resolvedItems || template.items
  }
  
  let html = ''
  
  // 从模板数据中判断类型，如果模板没有type，则使用activeElementTab
  let templateType = template.type || activeElementTab.value
  
  // 如果没有type，尝试根据模板的id或样式判断类型
  if (!templateType) {
    // 检查是否在titleTemplates中
    if (titleTemplates.value.some(t => t.id === template.id || t.style === template.style)) {
      templateType = 'title'
    }
    // 检查是否在bodyTemplates中
    else if (bodyTemplates.value.some(t => t.id === template.id || t.style === template.style)) {
      templateType = 'body'
    }
    // 检查是否在imageTemplates中
    else if (imageTemplates.value.some(t => t.id === template.id || t.style === template.style)) {
      templateType = 'image'
    }
    // 检查是否在dividerTemplates中
    else if (dividerTemplates.value.some(t => t.id === template.id || t.style === template.style)) {
      templateType = 'divider'
    }
    // 检查是否在navTemplates中
    else if (navTemplates.value.some(t => t.id === template.id || t.style === template.style)) {
      templateType = 'nav'
    }
    // 检查是否在tableTemplates中
    else if (tableTemplates.value.some(t => t.id === template.id || t.style === template.style)) {
      templateType = 'table'
    }
  }
  
  if (templateType === 'title') {
    // 标题样式
    const color = selectedColor.value
    const lightColor = getLightColor(color)
    switch (template.style) {
      case 'center-lines-short':
        html = `<div style="display: flex; align-items: center; justify-content: center; margin: 20px 0;">
          <div style="width: 30px; height: 2px; background: ${color}; margin-right: 12px;"></div>
          <h2 style="font-size: 20px; font-weight: bold; color: #333; margin: 0;">${T.text}</h2>
          <div style="width: 30px; height: 2px; background: ${color}; margin-left: 12px;"></div>
        </div>`
        break
      case 'center-lines-long':
        html = `<div style="display: flex; align-items: center; justify-content: center; margin: 20px 0;">
          <div style="width: 80px; height: 2px; background: ${color}; margin-right: 12px;"></div>
          <h2 style="font-size: 20px; font-weight: bold; color: #333; margin: 0;">${T.text}</h2>
          <div style="width: 80px; height: 2px; background: ${color}; margin-left: 12px;"></div>
        </div>`
        break
      case 'progress-bar':
        html = `<div style="display: flex; margin: 20px 0;">
          <div style="background: ${color}; color: white; padding: 12px 20px; font-weight: bold; border-radius: 4px 0 0 4px;">${T.text}</div>
          <div style="background: ${lightColor}; flex: 1; border-radius: 0 4px 4px 0;"></div>
        </div>`
        break
      case 'tag-rounded':
        html = `<div style="background: ${color}; color: white; padding: 10px 20px; border-radius: 20px 4px 20px 4px; display: inline-block; font-weight: bold; margin: 16px 0;">${T.text}</div>`
        break
      case 'bordered-rect':
        html = `<div style="background: ${color}; color: white; padding: 12px 24px; border: 3px solid white; border-radius: 4px; display: inline-block; font-weight: bold; margin: 16px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">${T.text}</div>`
        break
      case 'layered':
        html = `<div style="position: relative; margin: 20px 0;">
          <div style="position: absolute; top: -4px; left: -4px; width: 100%; height: 100%; background: ${color}; border-radius: 4px; z-index: 0;"></div>
          <div style="position: relative; background: white; color: ${color}; padding: 12px 24px; border-radius: 4px; font-weight: bold; z-index: 1; border: 2px solid ${color};">${T.text}</div>
        </div>`
        break
      case 'oval-dashed':
        html = `<div style="background: ${color}; color: white; padding: 12px 32px; border-radius: 50px; border: 2px dashed white; display: inline-block; font-weight: bold; margin: 16px 0;">${T.text}</div>`
        break
      case 'parallelogram':
        html = `<div style="background: ${color}; color: white; padding: 12px 32px; transform: skewX(-10deg); display: inline-block; font-weight: bold; margin: 16px 0; position: relative;">
          <div style="position: absolute; left: 8px; top: 50%; transform: translateY(-50%) skewX(10deg); width: 2px; height: 60%; background: white;"></div>
          <div style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%) skewX(10deg); width: 2px; height: 60%; background: white;"></div>
          <span style="transform: skewX(10deg); display: inline-block;">${T.text}</span>
        </div>`
        break
      case 'numbered':
        html = `<div style="display: flex; align-items: center; margin: 20px 0;">
          <div style="background: ${color}; color: white; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; font-weight: bold; border-radius: 4px; margin-right: 12px;">${template.number || '01'}</div>
          <div style="flex: 1; border: 1px solid ${color}; padding: 12px 16px; border-radius: 4px; color: ${color}; font-weight: bold;">${T.text}</div>
        </div>`
        break
      default:
        html = `<h2 style="font-size: 20px; font-weight: bold; margin: 16px 0;">${T.text}</h2>`
    }
  } else if (templateType === 'body') {
    // 正文样式
    const color = selectedColor.value
    const lightColor = getLightColor(color)
    switch (template.style) {
      case 'plain':
        html = `<p style="font-size: 14px; line-height: 1.8; color: #333; margin: 16px 0;">${T.text}</p>`
        break
      case 'bordered-box':
        html = `<div style="border: 1px solid ${color}; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="font-size: 14px; line-height: 1.8; color: #333; margin: 0;">${T.text}</p>
        </div>`
        break
      case 'left-vertical-bar':
        html = `<div style="display: flex; margin: 16px 0;">
          <div style="width: 4px; background: ${color}; margin-right: 16px; flex-shrink: 0;"></div>
          <p style="font-size: 14px; line-height: 1.8; color: #333; margin: 0; flex: 1;">${T.text}</p>
        </div>`
        break
      case 'double-horizontal-lines':
        html = `<div style="margin: 20px 0;">
          <div style="height: 2px; background: ${color}; margin-bottom: 12px;"></div>
          <p style="font-size: 14px; line-height: 1.8; color: #333; margin: 0;">${T.text}</p>
          <div style="height: 2px; background: ${color}; margin-top: 12px;"></div>
        </div>`
        break
      case 'bubble-title':
        html = `<div style="margin: 20px 0;">
          <div style="background: ${color}; color: white; padding: 8px 16px; border-radius: 16px 16px 16px 4px; display: inline-block; font-weight: bold; margin-bottom: 8px;">${T.title || tt('advancedEditor.placeholderTitleText')}</div>
          <div style="background: ${lightColor}; border-radius: 8px; padding: 16px; margin-top: 8px;">
            <p style="font-size: 14px; line-height: 1.8; color: #333; margin: 0;">${T.text}</p>
          </div>
        </div>`
        break
      case 'dashed-box-title':
        html = `<div style="border: 1px dashed ${color}; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <div style="color: ${color}; font-weight: bold; margin-bottom: 8px; font-size: 14px;">${T.title || tt('advancedEditor.placeholderTitleText')}</div>
          <p style="font-size: 14px; line-height: 1.8; color: #333; margin: 0;">${T.text}</p>
        </div>`
        break
      default:
        html = `<p style="font-size: 14px; line-height: 1.8; color: #333; margin: 16px 0;">${T.text}</p>`
    }
  } else if (templateType === 'image') {
    // 图片样式（路径用 getImagePath(key)，文案用 T.label / T.icons）
    if (template.style === 'icon-group') {
      const iconsHtml = (T.icons || template.icons || []).map(item => `
        <div style="flex: 1; text-align: center; padding: 0 8px; min-width: 0;">
          <div style="width: 80px; height: 80px; background: ${item.bgColor || '#f5f5f5'}; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 40px; margin: 0 auto 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            ${item.icon}
          </div>
          <div style="font-size: 14px; color: #333; font-weight: 500;">${(item && item.label) || ''}</div>
        </div>
      `).join('')
      
      html = `<div class="editor-image-group" style="display: flex; justify-content: space-around; align-items: center; padding: 20px 0; margin: 16px 0; width: 100%; box-sizing: border-box; flex-wrap: wrap;">
        ${iconsHtml}
      </div>`
    } else if (template.style === 'photo-group-2') {
      // 2列图片组合布局
      if (template.images && template.images.length >= 2) {
        const image1Path = getImagePath(template.images[0])
        const image2Path = getImagePath(template.images[1])
        
        html = `<div class="editor-photo-group-2" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 16px 0; width: 100%; box-sizing: border-box;">
          <div class="image-container editor-image-content" data-replaceable-image="true" style="width: 100%; height: 200px; background-image: url(${image1Path}); background-size: cover; background-position: center; border-radius: 8px; position: relative; overflow: hidden; display: flex; align-items: flex-end; padding: 16px; box-sizing: border-box;">
            <button class="replace-image-btn" onclick="window.replaceImage(this)" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #2196F3; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; opacity: 0; transition: opacity 0.3s; z-index: 1000; pointer-events: none; user-select: none;">${tt('advancedEditor.replaceImage')}</button>
            <div style="color: white; font-weight: bold; font-size: 16px; text-shadow: 0 1px 3px rgba(0,0,0,0.5);">${tt('advancedEditor.templateText.' + template.images[0])}</div>
          </div>
          <div class="image-container editor-image-content" data-replaceable-image="true" style="width: 100%; height: 200px; background-image: url(${image2Path}); background-size: cover; background-position: center; border-radius: 8px; position: relative; overflow: hidden; display: flex; align-items: flex-end; padding: 16px; box-sizing: border-box;">
            <button class="replace-image-btn" onclick="window.replaceImage(this)" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #2196F3; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; opacity: 0; transition: opacity 0.3s; z-index: 1000; pointer-events: none; user-select: none;">${tt('advancedEditor.replaceImage')}</button>
            <div style="color: white; font-weight: bold; font-size: 16px; text-shadow: 0 1px 3px rgba(0,0,0,0.5);">${tt('advancedEditor.templateText.' + template.images[1])}</div>
          </div>
        </div>`
      }
    } else if (template.style === 'photo-group-3') {
      // 3列图片组合布局（左侧大图，右侧上下两个小图）
      if (template.images && template.images.length >= 3) {
        const image1Path = getImagePath(template.images[0])
        const image2Path = getImagePath(template.images[1])
        const image3Path = getImagePath(template.images[2])
        
        html = `<div class="editor-photo-group-3" style="display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: auto auto; gap: 8px; margin: 16px 0; width: 100%; box-sizing: border-box;">
          <div class="image-container editor-image-content" style="grid-row: 1 / 3; width: 100%; height: 100%; min-height: 400px; background-image: url(${image1Path}); background-size: cover; background-position: center; border-radius: 8px; position: relative; overflow: hidden; display: flex; align-items: flex-end; padding: 16px; box-sizing: border-box;">
            <button class="replace-image-btn" onclick="window.replaceImage(this)" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #2196F3; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; opacity: 0; transition: opacity 0.3s; z-index: 1000; pointer-events: none;">${tt('advancedEditor.replaceImage')}</button>
            <div style="color: white; font-weight: bold; font-size: 16px; text-shadow: 0 1px 3px rgba(0,0,0,0.5);">${tt('advancedEditor.templateText.' + template.images[0])}</div>
          </div>
          <div class="image-container editor-image-content" style="width: 100%; height: 196px; background-image: url(${image2Path}); background-size: cover; background-position: center; border-radius: 8px; position: relative; overflow: hidden; display: flex; align-items: flex-end; padding: 12px; box-sizing: border-box;">
            <button class="replace-image-btn" onclick="window.replaceImage(this)" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #2196F3; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; opacity: 0; transition: opacity 0.3s; z-index: 1000; pointer-events: none;">${tt('advancedEditor.replaceImage')}</button>
            <div style="color: white; font-weight: bold; font-size: 14px; text-shadow: 0 1px 3px rgba(0,0,0,0.5);">${tt('advancedEditor.templateText.' + template.images[1])}</div>
          </div>
          <div class="image-container editor-image-content" style="width: 100%; height: 196px; background-image: url(${image3Path}); background-size: cover; background-position: center; border-radius: 8px; position: relative; overflow: hidden; display: flex; align-items: flex-end; padding: 12px; box-sizing: border-box;">
            <button class="replace-image-btn" onclick="window.replaceImage(this)" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #2196F3; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; opacity: 0; transition: opacity 0.3s; z-index: 1000; pointer-events: none;">${tt('advancedEditor.replaceImage')}</button>
            <div style="color: white; font-weight: bold; font-size: 14px; text-shadow: 0 1px 3px rgba(0,0,0,0.5);">${tt('advancedEditor.templateText.' + template.images[2])}</div>
          </div>
        </div>`
      }
    } else if (template.style === 'photo-card') {
      const imagePath = getImagePath(template.imageKey || template.image || template.label)
      
      // 允许图片重复添加，移除重复检查
      
      html = `<div class="photo-card-item" style="display: inline-block; width: calc(50% - 4px); margin: 4px 2px; vertical-align: top; box-sizing: border-box;">
        <div class="image-container" style="width: 100%; height: 200px; background-image: url(${imagePath}); background-size: cover; background-position: center; border-radius: 8px; position: relative; overflow: hidden; display: flex; align-items: flex-end; padding: 16px; box-sizing: border-box;">
          <button class="replace-image-btn" onclick="window.replaceImage(this)" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #2196F3; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; opacity: 0; transition: opacity 0.3s; z-index: 10000; pointer-events: none;">${tt('advancedEditor.replaceImage')}</button>
          <div style="color: white; font-weight: bold; font-size: 16px; text-shadow: 0 1px 3px rgba(0,0,0,0.3);">${T.label || tt('advancedEditor.imageTitle')}</div>
        </div>
      </div>`
    } else if (template.style === 'photo-grid-6') {
      // 6宫格图片组合布局：2行3列，某些位置包含2-3张图片并排
      // 6宫格布局：每个图片都是独立的，第三行右边两个图片上下分开排列
      html = `<div class="editor-image-grid-6" style="display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: auto auto auto; gap: 8px; margin: 16px 0; width: 100%; box-sizing: border-box;">
        <!-- 第一行：两个独立的图片并排 -->
        <div class="image-container editor-image-content editor-image-fullwidth image-with-toolbar" data-image-id="image_${Date.now()}_${Math.random().toString(36).substr(2, 9)}" style="width: 100%; height: 200px; background-image: url(${getImagePath('placeDali')}); background-size: cover; background-position: center; border-radius: 8px; position: relative; overflow: hidden; display: flex; align-items: flex-end; padding: 16px; box-sizing: border-box;">
          <div class="image-toolbar" style="position: absolute; top: 8px; right: 8px; background: white; border: 1px solid #e0e0e0; border-radius: 4px; padding: 4px; display: none; flex; gap: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); z-index: 10000;">
            <button class="image-toolbar-btn" data-action="move-up" style="padding: 4px 12px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">${tt('advancedEditor.element.moveUp')}</button>
            <button class="image-toolbar-btn" data-action="move-down" style="padding: 4px 12px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">${tt('advancedEditor.element.moveDown')}</button>
            <button class="image-toolbar-btn" data-action="copy" style="padding: 4px 12px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">${tt('advancedEditor.element.copy')}</button>
            <button class="image-toolbar-btn" data-action="delete" style="padding: 4px 12px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">${tt('advancedEditor.element.delete')}</button>
          </div>
          <button class="replace-image-btn" onclick="window.replaceImage(this)" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #2196F3; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; opacity: 0; transition: opacity 0.3s; z-index: 1000; pointer-events: none;">${tt('advancedEditor.replaceImage')}</button>
          <div style="color: white; font-weight: bold; font-size: 16px; text-shadow: 0 1px 3px rgba(0,0,0,0.5);">${tt('advancedEditor.templateText.placeDali')}</div>
        </div>
        <div class="image-container editor-image-content editor-image-fullwidth" style="width: 100%; height: 200px; background-image: url(${getImagePath('placeLijiang')}); background-size: cover; background-position: center; border-radius: 8px; position: relative; overflow: hidden; display: flex; align-items: flex-end; padding: 16px; box-sizing: border-box;">
          <button class="replace-image-btn" onclick="window.replaceImage(this)" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #2196F3; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; opacity: 0; transition: opacity 0.3s; z-index: 1000; pointer-events: none;">${tt('advancedEditor.replaceImage')}</button>
          <div style="color: white; font-weight: bold; font-size: 16px; text-shadow: 0 1px 3px rgba(0,0,0,0.5);">${tt('advancedEditor.templateText.placeLijiang')}</div>
        </div>
        <!-- 第二行：两个独立的图片并排 -->
        <div class="image-container editor-image-content editor-image-fullwidth" style="width: 100%; height: 200px; background-image: url(${getImagePath('placeMeili')}); background-size: cover; background-position: center; border-radius: 8px; position: relative; overflow: hidden; display: flex; align-items: flex-end; padding: 16px; box-sizing: border-box;">
          <button class="replace-image-btn" onclick="window.replaceImage(this)" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #2196F3; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; opacity: 0; transition: opacity 0.3s; z-index: 1000; pointer-events: none;">${tt('advancedEditor.replaceImage')}</button>
          <div style="color: white; font-weight: bold; font-size: 16px; text-shadow: 0 1px 3px rgba(0,0,0,0.5);">${tt('advancedEditor.templateText.placeMeili')}</div>
        </div>
        <div class="image-container editor-image-content editor-image-fullwidth" style="width: 100%; height: 200px; background-image: url(${getImagePath('placeXishuang')}); background-size: cover; background-position: center; border-radius: 8px; position: relative; overflow: hidden; display: flex; align-items: flex-end; padding: 16px; box-sizing: border-box;">
          <button class="replace-image-btn" onclick="window.replaceImage(this)" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #2196F3; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; opacity: 0; transition: opacity 0.3s; z-index: 1000; pointer-events: none;">${tt('advancedEditor.replaceImage')}</button>
          <div style="color: white; font-weight: bold; font-size: 16px; text-shadow: 0 1px 3px rgba(0,0,0,0.5);">${tt('advancedEditor.templateText.placeXishuang')}</div>
        </div>
        <!-- 第三行：左边一个独立图片，右边两个独立的图片上下分开排列 -->
        <div class="image-container editor-image-content editor-image-fullwidth" style="width: 100%; height: 200px; background-image: url(${getImagePath('placeYuanyang')}); background-size: cover; background-position: center; border-radius: 8px; position: relative; overflow: hidden; display: flex; align-items: flex-end; padding: 16px; box-sizing: border-box;">
          <button class="replace-image-btn" onclick="window.replaceImage(this)" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #2196F3; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; opacity: 0; transition: opacity 0.3s; z-index: 1000; pointer-events: none;">${tt('advancedEditor.replaceImage')}</button>
          <div style="color: white; font-weight: bold; font-size: 16px; text-shadow: 0 1px 3px rgba(0,0,0,0.5);">${tt('advancedEditor.templateText.placeYuanyang')}</div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px; width: 100%;">
          <div class="image-container editor-image-content editor-image-fullwidth" style="width: 100%; height: 96px; background-image: url(${getImagePath('placeYulong')}); background-size: cover; background-position: center; border-radius: 8px; position: relative; overflow: hidden; display: flex; align-items: flex-end; padding: 12px; box-sizing: border-box;">
            <button class="replace-image-btn" onclick="window.replaceImage(this)" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #2196F3; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; opacity: 0; transition: opacity 0.3s; z-index: 1000; pointer-events: none;">${tt('advancedEditor.replaceImage')}</button>
            <div style="color: white; font-weight: bold; font-size: 14px; text-shadow: 0 1px 3px rgba(0,0,0,0.5);">${tt('advancedEditor.templateText.placeYulong')}</div>
          </div>
          <div class="image-container editor-image-content editor-image-fullwidth" style="width: 100%; height: 96px; background-image: url(${getImagePath('placeTengchong')}); background-size: cover; background-position: center; border-radius: 8px; position: relative; overflow: hidden; display: flex; align-items: flex-end; padding: 12px; box-sizing: border-box;">
            <button class="replace-image-btn" onclick="window.replaceImage(this)" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #2196F3; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; opacity: 0; transition: opacity 0.3s; z-index: 1000; pointer-events: none;">${tt('advancedEditor.replaceImage')}</button>
            <div style="color: white; font-weight: bold; font-size: 14px; text-shadow: 0 1px 3px rgba(0,0,0,0.5);">${tt('advancedEditor.templateText.placeTengchong')}</div>
          </div>
        </div>
      </div>`
    }
  } else if (templateType === 'divider') {
    // 分隔线样式 - 为每种样式添加对应的图标
    const dividerIcons = {
      'dotted': '⋯',      // 点线图标
      'dashed': '┅',      // 虚线图标
      'solid': '━',       // 实线图标
      'double': '═',      // 双实线图标
      'wavy': '〰️',      // 波浪线图标
      'end-lines': 'END', // END线条（已有文字）
      'end-dots': 'END'   // END点线（已有文字）
    }
    
    const icon = dividerIcons[template.style] || '━'
    
    switch (template.style) {
      case 'dotted':
        html = `<div style="display: flex; align-items: center; margin: 20px 0;">
          <span style="color: #2196F3; font-size: 18px; margin-right: 8px; line-height: 1;">${icon}</span>
          <div style="flex: 1; border-top: 1px dotted #2196F3;"></div>
        </div>`
        break
      case 'dashed':
        html = `<div style="display: flex; align-items: center; margin: 20px 0;">
          <span style="color: #2196F3; font-size: 18px; margin-right: 8px; line-height: 1;">${icon}</span>
          <div style="flex: 1; border-top: 1px dashed #2196F3;"></div>
        </div>`
        break
      case 'solid':
        html = `<div style="display: flex; align-items: center; margin: 20px 0;">
          <span style="color: #2196F3; font-size: 18px; margin-right: 8px; line-height: 1;">${icon}</span>
          <div style="flex: 1; border-top: 1px solid #2196F3;"></div>
        </div>`
        break
      case 'double':
        html = `<div style="display: flex; align-items: center; margin: 20px 0;">
          <span style="color: #2196F3; font-size: 18px; margin-right: 8px; line-height: 1;">${icon}</span>
          <div style="flex: 1; border-top: 3px double #2196F3;"></div>
        </div>`
        break
      case 'wavy':
        html = `<div style="display: flex; align-items: center; margin: 20px 0;">
          <span style="color: #2196F3; font-size: 18px; margin-right: 8px; line-height: 1;">${icon}</span>
          <div style="flex: 1; height: 2px; background: repeating-linear-gradient(90deg, #2196F3 0, #2196F3 8px, transparent 8px, transparent 16px);"></div>
        </div>`
        break
      case 'end-lines':
        html = `<div style="display: flex; align-items: center; margin: 20px 0;">
          <span style="color: #2196F3; font-size: 18px; margin-right: 8px; line-height: 1;">📏</span>
          <div style="flex: 1; height: 1px; background: #2196F3;"></div>
          <div style="padding: 0 12px; color: #2196F3; font-weight: bold;">END</div>
          <div style="flex: 1; height: 1px; background: #2196F3;"></div>
        </div>`
        break
      case 'end-dots':
        html = `<div style="display: flex; align-items: center; justify-content: center; margin: 20px 0;">
          <span style="color: #2196F3; font-size: 18px; margin-right: 8px; line-height: 1;">⚫</span>
          <div style="width: 8px; height: 8px; background: #2196F3; border-radius: 50%; margin-right: 8px;"></div>
          <div style="color: #2196F3; font-weight: bold;">END</div>
          <div style="width: 8px; height: 8px; background: #2196F3; border-radius: 50%; margin-left: 8px;"></div>
        </div>`
        break
      default:
        html = `<div style="display: flex; align-items: center; margin: 20px 0;">
          <span style="color: #2196F3; font-size: 18px; margin-right: 8px; line-height: 1;">━</span>
          <div style="flex: 1; border-top: 1px solid #e0e0e0;"></div>
        </div>`
    }
  } else if (templateType === 'nav') {
    const items = T.items || template.items || []
    if (template.style === 'list-simple') {
      html = items.map((item) => {
        const imagePath = getImagePath(item.imageKey || item.image)
        return `
        <div style="display: flex; align-items: center; padding: 12px; border-bottom: 1px solid #f0f0f0; margin-bottom: 8px;">
          <div style="width: 60px; height: 60px; background-image: url(${imagePath}); background-size: cover; background-position: center; border-radius: 8px; margin-right: 12px; flex-shrink: 0;"></div>
          <div style="flex: 1; font-weight: bold; color: #333;">${item.title || ''}</div>
          <div style="color: #2196F3; font-size: 20px;">→</div>
        </div>
      `
      }).join('')
    } else if (template.style === 'list-detail') {
      html = items.map((item) => {
        const imagePath = getImagePath(item.imageKey || item.image)
        return `
        <div style="display: flex; align-items: center; padding: 12px; border-bottom: 1px solid #f0f0f0; margin-bottom: 8px;">
          <div style="width: 60px; height: 60px; background-image: url(${imagePath}); background-size: cover; background-position: center; border-radius: 8px; margin-right: 12px; flex-shrink: 0;"></div>
          <div style="flex: 1;">
            <div style="font-weight: bold; color: #333; margin-bottom: 4px;">${item.title || ''}</div>
            <div style="font-size: 12px; color: #999;">${item.subtitle || ''}</div>
          </div>
        </div>
      `
      }).join('')
    }
  } else if (templateType === 'table') {
    addTemplateToEditor(T)
    return
  }
  
  // 确保有HTML内容
  if (!html || html.trim() === '') {
    console.error('模板HTML为空:', template, 'templateType:', templateType)
    return
  }
  
  insertHTMLToEditor(html)
}

// 插入HTML到编辑区域
const insertHTMLToEditor = (html) => {
  if (!editableArea.value) {
    console.error('[插入HTML] 错误：编辑区域不存在')
    throw new Error(tt('advancedEditorExtra.editorNotInitialized'))
  }
  
  if (!html || typeof html !== 'string') {
    console.error('[插入HTML] 错误：HTML内容无效')
    throw new Error(tt('advancedEditorExtra.htmlInvalid'))
  }
  
  // 移除空占位符
  removeEmptyPlaceholder()
  
  const selection = window.getSelection()
  let range
  
  // 获取当前光标位置，如果没有则移动到末尾
  if (selection.rangeCount > 0) {
    range = selection.getRangeAt(0)
    
    // 验证 range 是否在 editableArea 内
    const rangeContainer = range.commonAncestorContainer
    const isInEditableArea = editableArea.value.contains(
      rangeContainer.nodeType === Node.TEXT_NODE ? rangeContainer.parentElement : rangeContainer
    )
    
    if (!isInEditableArea) {
      console.warn('[插入HTML] range 不在 editableArea 内，重新创建 range')
      range = document.createRange()
      range.selectNodeContents(editableArea.value)
      range.collapse(false) // 移动到末尾
      selection.removeAllRanges()
      selection.addRange(range)
    }
  } else {
    range = document.createRange()
    range.selectNodeContents(editableArea.value)
    range.collapse(false) // 移动到末尾
    selection.addRange(range)
  }
  
  // 再次验证 range 在 editableArea 内
  const finalContainer = range.commonAncestorContainer
  const finalIsInEditableArea = editableArea.value.contains(
    finalContainer.nodeType === Node.TEXT_NODE ? finalContainer.parentElement : finalContainer
  )
  
  if (!finalIsInEditableArea) {
    console.error('[插入HTML] 错误：range 仍然不在 editableArea 内')
    // 强制创建在 editableArea 内的 range
    range = document.createRange()
    range.selectNodeContents(editableArea.value)
    range.collapse(false)
    selection.removeAllRanges()
    selection.addRange(range)
  }
  
  console.log('[插入HTML] range 验证通过，准备插入内容')
  
  // 删除选中的内容（如果有）
  if (!range.collapsed) {
    range.deleteContents()
  }
  
  // 检查光标前面是否有内容，如果有，需要先换行
  const beforeRange = document.createRange()
  beforeRange.selectNodeContents(editableArea.value)
  beforeRange.setEnd(range.startContainer, range.startOffset)
  const beforeText = beforeRange.toString().trim()
  const hasContentBefore = beforeText.length > 0
  
  // 如果前面有内容，需要先插入换行，确保新内容在下一行
  if (hasContentBefore) {
    const container = range.startContainer
    
    // 如果光标在文本节点中间，需要分割文本节点
    if (container.nodeType === Node.TEXT_NODE && range.startOffset > 0 && range.startOffset < container.textContent.length) {
      // 分割文本节点
      const textNode = container
      const parent = textNode.parentElement
      const afterText = textNode.splitText(range.startOffset)
      
      // 在分割点插入换行
      const br = document.createElement('br')
      parent.insertBefore(br, afterText)
      range.setStartAfter(br)
      range.collapse(true)
    } else {
      // 直接插入换行
      const br = document.createElement('br')
      range.insertNode(br)
      range.setStartAfter(br)
      range.collapse(true)
    }
  }
  
  // 包装HTML内容，确保每个内容块都有适当的容器和间距
  const wrappedHtml = wrapContentBlock(html)
  
  // 如果包装后的HTML为空，使用原始HTML
  const htmlToInsert = wrappedHtml.trim() || html.trim()
  
  if (!htmlToInsert) {
    console.error('HTML内容为空:', { html, wrappedHtml, template })
    return
  }
  
  // 创建临时div来解析HTML
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = htmlToInsert
  
  // 如果解析后没有内容，直接返回
  if (!tempDiv.innerHTML || tempDiv.innerHTML.trim() === '') {
    console.error('[插入HTML] 解析后的HTML为空:', htmlToInsert)
    throw new Error(tt('advancedEditorExtra.parsedHtmlEmpty'))
  }
  
  // 检查是否是图片元素（photo-card-item 或 editor-image-content）
  const isImageElement = tempDiv.querySelector('.photo-card-item') || 
                         tempDiv.querySelector('.editor-image-content') ||
                         tempDiv.firstElementChild?.classList.contains('photo-card-item') ||
                         tempDiv.firstElementChild?.classList.contains('editor-image-content')
  
  // 如果是图片元素，检查图片是否已存在，避免重复
  if (isImageElement) {
    try {
      // 检查所有图片路径
      const images = tempDiv.querySelectorAll('img, [style*="background-image"]')
      let hasDuplicate = false
      
      for (let img of images) {
        let imageSrc = ''
        if (img.tagName === 'IMG') {
          imageSrc = img.src || img.getAttribute('src') || ''
        } else {
          const bgImage = img.style.backgroundImage || window.getComputedStyle(img).backgroundImage
          if (bgImage && bgImage !== 'none') {
            imageSrc = bgImage.replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '')
          }
        }
        
        // 允许图片重复添加，移除重复检查
      }
      
      // 允许图片重复添加，移除重复检查
      
      // 图片元素直接插入，不使用content-block-wrapper包裹
      // 使用更安全的方式收集节点：直接使用 childNodes 的副本
      const nodesToInsert = Array.from(tempDiv.childNodes)
      
      if (nodesToInsert.length === 0) {
        console.error('[插入HTML] 错误：tempDiv 没有子节点')
        throw new Error(tt('advancedEditorExtra.noNodeToInsert'))
      }
      
      console.log('[插入HTML] 准备插入节点数:', nodesToInsert.length, '节点类型:', nodesToInsert.map(n => n.nodeName))
      
      // 验证所有节点都是有效的
      const validNodes = nodesToInsert.filter(node => {
        if (!node) {
          console.warn('[插入HTML] 发现空节点')
          return false
        }
        if (node.nodeType !== Node.ELEMENT_NODE && node.nodeType !== Node.TEXT_NODE) {
          console.warn('[插入HTML] 发现无效节点类型:', node.nodeType)
          return false
        }
        return true
      })
      
      if (validNodes.length === 0) {
        throw new Error(tt('advancedEditorExtra.noValidNodeToInsert'))
      }
      
      // 插入所有有效节点
      const insertedNodes = []
      validNodes.forEach((node, index) => {
        try {
          // 如果节点还在 tempDiv 中，需要先移除（insertNode 会自动处理）
          range.insertNode(node)
          insertedNodes.push(node)
          console.log('[插入HTML] 成功插入节点', index + 1, '/', validNodes.length, ':', node.nodeName)
          
          // 立即验证节点是否在 editableArea 中
          if (editableArea.value && editableArea.value.contains(node)) {
            console.log('[插入HTML] ✅ 节点已确认在 editableArea 中')
            console.log('[插入HTML] 节点父元素:', node.parentElement?.className || '无')
            console.log('[插入HTML] editableArea 内容长度:', editableArea.value.innerHTML.length)
          } else {
            console.error('[插入HTML] ❌ 错误：节点不在 editableArea 中！')
            console.log('[插入HTML] 节点:', node)
            console.log('[插入HTML] 节点父元素:', node.parentElement)
            console.log('[插入HTML] editableArea:', editableArea.value)
            console.log('[插入HTML] editableArea 内容:', editableArea.value?.innerHTML.substring(0, 200))
            
            // 尝试将节点移动到 editableArea
            if (editableArea.value && node.parentElement !== editableArea.value) {
              console.log('[插入HTML] 尝试将节点移动到 editableArea')
              editableArea.value.appendChild(node)
              console.log('[插入HTML] 节点已移动到 editableArea')
            }
          }
        } catch (error) {
          console.error('[插入HTML] 插入节点失败，索引:', index, '节点:', node, '错误:', error)
          throw new Error(tt('advancedEditorExtra.insertNodeFailed', { msg: error.message }))
        }
      })
      
      // 验证插入的节点
      if (insertedNodes.length > 0) {
        const firstInserted = insertedNodes[0]
        if (firstInserted.nodeType === Node.ELEMENT_NODE) {
          const imgElement = firstInserted.querySelector('img')
          if (imgElement) {
            console.log('[插入HTML] ✅ 确认：插入的节点包含 img 元素')
            console.log('[插入HTML] img src 前50字符:', (imgElement.src || '').substring(0, 50))
          } else {
            console.warn('[插入HTML] ⚠️ 警告：插入的节点不包含 img 元素')
            console.log('[插入HTML] 节点内容:', firstInserted.outerHTML.substring(0, 200))
          }
        }
      }
      
      // 移动光标到插入内容之后
      if (validNodes.length > 0) {
        const lastNode = validNodes[validNodes.length - 1]
        try {
          range.setStartAfter(lastNode)
          range.collapse(true)
        } catch (error) {
          console.warn('[插入HTML] 设置光标位置失败，使用默认位置:', error)
          // 如果设置失败，使用默认位置
          range.selectNodeContents(editableArea.value)
          range.collapse(false)
        }
      }
      
      // 在插入的内容后添加换行，确保后续内容不会重叠
      const br = document.createElement('br')
      try {
        range.insertNode(br)
        range.setStartAfter(br)
        range.collapse(true)
      } catch (error) {
        console.warn('[插入HTML] 插入换行失败:', error)
      }
      
      selection.removeAllRanges()
      selection.addRange(range)
      
      // 设置标志位，防止触发内容变化导致重复生成图片
      isImageToolbarUpdating = true
      lastImageClickTime = Date.now()
      
      // 触发内容变化（但会被标志位拦截）
      handleContentChange()
      
      // 延迟重置标志位
      setTimeout(() => {
        isImageToolbarUpdating = false
        lastImageClickTime = Date.now()
      }, 1000)
      
      console.log('[插入HTML] 图片插入成功，有效节点数:', validNodes.length)
      return true
    } catch (error) {
      console.error('插入图片时出错:', error)
      // 如果出错，继续执行非图片元素的逻辑
    }
  }
  
  // 非图片元素，使用content-block-wrapper包裹
  // 创建包装容器
  const wrapper = document.createElement('div')
  wrapper.className = 'content-block-wrapper'
  wrapper.style.cssText = 'margin-bottom: 0; padding: 12px; border-radius: 8px; background: #fafafa; position: relative; overflow: hidden; word-wrap: break-word; width: 100%; box-sizing: border-box;'
  
  // 将解析后的所有子节点移动到包装器中
  while (tempDiv.firstChild) {
    wrapper.appendChild(tempDiv.firstChild)
  }
  
  // 再次检查：如果包装器仍然为空，尝试直接使用innerHTML
  if (wrapper.children.length === 0 && wrapper.textContent.trim() === '') {
    console.warn('包装器内容为空，尝试直接设置innerHTML')
    wrapper.innerHTML = htmlToInsert
    if (!wrapper.innerHTML || wrapper.innerHTML.trim() === '') {
      console.error('仍然无法插入内容:', htmlToInsert)
      return
    }
  }
  
  // 插入包装器
  range.insertNode(wrapper)
  
  // 移动光标到插入内容之后
  range.setStartAfter(wrapper)
  range.collapse(true)
  
  // 在插入的内容后添加换行，确保后续内容不会重叠
  const br = document.createElement('br')
  range.insertNode(br)
  range.setStartAfter(br)
  range.collapse(true)
  
  selection.removeAllRanges()
  selection.addRange(range)
  
  // 触发内容变化
  handleContentChange()
  
  console.log('[插入HTML] 内容插入成功')
  return true
}

// 包装内容块，确保每个内容都有独立的容器和适当的样式
const wrapContentBlock = (html) => {
  // 如果HTML已经包含content-block-wrapper，直接返回
  if (html.includes('content-block-wrapper')) {
    return html
  }
  
  // 检查HTML是否已经是一个完整的块级元素
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html.trim()
  
  // 如果只有一个顶级元素且是块级元素，不需要额外包装（外层会处理）
  if (tempDiv.children.length === 1) {
    const child = tempDiv.firstElementChild
    if (child && ['DIV', 'P', 'TABLE', 'H1', 'H2', 'H3', 'UL', 'OL'].includes(child.tagName)) {
      // 确保有适当的样式
      if (!child.style.width) {
        child.style.width = '100%'
      }
      if (!child.style.boxSizing) {
        child.style.boxSizing = 'border-box'
      }
      return html
    }
  }
  
  // 默认情况：返回原始HTML（外层会包装）
  return html
}

// 移除空占位符
const removeEmptyPlaceholder = () => {
  if (!editableArea.value) return
  
  const placeholder = editableArea.value.querySelector('.empty-placeholder')
  if (placeholder) {
    placeholder.remove()
  }
}

// 处理焦点事件
const handleFocus = () => {
  removeEmptyPlaceholder()
  
  // 如果编辑器为空，创建一个默认的div行
  if (editableArea.value && (!editableArea.value.firstChild || editableArea.value.innerHTML.trim() === '')) {
    const defaultDiv = document.createElement('div')
    defaultDiv.className = 'normal'
    defaultDiv.innerHTML = '&nbsp;'
    editableArea.value.appendChild(defaultDiv)
    
    // 移动光标到新行
    const selection = window.getSelection()
    const range = document.createRange()
    range.selectNodeContents(defaultDiv)
    range.collapse(true)
    selection.removeAllRanges()
    selection.addRange(range)
  }
  
  updateCurrentHeadingStyle()
}

// 将文本中的图片名称转换为图片卡片
const convertTextToImageCards = () => {
  if (!editableArea.value) return
  
  // 如果正在更新图片工具栏，不执行自动转换，避免重复生成图片
  if (isImageToolbarUpdating) {
    console.log('[convertTextToImageCards] 检测到 isImageToolbarUpdating = true，跳过自动转换，避免重复生成图片')
    return
  }
  
  // 检查是否在点击图片后的短时间内（防止点击图片后触发自动转换）
  const timeSinceLastImageClick = Date.now() - lastImageClickTime
  if (timeSinceLastImageClick < 10000) { // 10秒内不执行自动转换
    console.log('[convertTextToImageCards] 检测到最近点击了图片（' + timeSinceLastImageClick + 'ms前），跳过自动转换，避免重复生成图片')
    return
  }
  
  // 检查编辑区域中是否有图片处于选中状态
  const selectedImages = editableArea.value.querySelectorAll('.image-selected')
  if (selectedImages.length > 0) {
    console.log('[convertTextToImageCards] 检测到有图片处于选中状态，跳过自动转换，避免重复生成图片')
    return
  }
  
  const imageNameMap = {
    '大理三塔': '/s1.jpg',
    '丽江古城': '/s2.jpg',
    '梅里雪山': '/s3.jpg',
    '西双版纳': '/s4.jpg',
    '元阳梯田': '/s5.jpg',
    '玉龙雪山': '/s6.jpg',
    '腾冲银杏': '/s7.jpg',
    '香格里拉': '/s3.jpg'
  }
  
  const imageNames = Object.keys(imageNameMap)
  
  // 获取编辑区域的文本内容
  const textContent = editableArea.value.textContent || editableArea.value.innerText || ''
  
  // 检查是否包含图片名称
  const foundImages = imageNames.filter(name => textContent.includes(name))
  
  if (foundImages.length === 0) return
  
  // 检查编辑区域是否只包含文本节点或简单的div（没有图片卡片）
  const hasImageCards = editableArea.value.querySelector('.photo-card-item') || 
                        editableArea.value.querySelector('.editor-image-content')
  
  // 如果编辑区域为空或只有占位符，直接转换
  const isEmpty = !editableArea.value.innerHTML.trim() || 
                  editableArea.value.innerHTML.includes('empty-placeholder') ||
                  editableArea.value.innerHTML.includes('在此处编辑内容')
  
  // 如果主要是纯文本内容（没有复杂的HTML结构），则转换
  const children = Array.from(editableArea.value.children)
  const hasComplexElements = children.some(child => {
    // 如果包含图片、表格、列表等复杂元素，不转换
    return child.querySelector('img') || 
           child.querySelector('table') || 
           child.querySelector('ul') || 
           child.querySelector('ol') ||
           child.classList.contains('photo-card-item') ||
           child.classList.contains('editor-image-content') ||
           child.classList.contains('editor-video') ||
           child.classList.contains('editor-audio') ||
           child.classList.contains('editor-file')
  })
  
  // 检查是否有content-block-wrapper包裹的纯文本（需要转换）
  const hasContentBlockWrapper = children.some(child => {
    if (child.classList.contains('content-block-wrapper')) {
      // 检查content-block-wrapper内是否有图片或其他复杂元素
      return child.querySelector('img') || 
             child.querySelector('table') || 
             child.querySelector('.photo-card-item') ||
             child.querySelector('.editor-image-content')
    }
    return false
  })
  
  // 如果已经有图片卡片且不是空内容，检查是否需要添加新的
  if (hasImageCards && !isEmpty) {
    // 允许图片重复添加，移除重复检查
    const imagesToAdd = foundImages
    
    if (imagesToAdd.length > 0) {
      // 在末尾添加新图片
      imagesToAdd.forEach((imageName) => {
        const imagePath = imageNameMap[imageName]
        const html = `<div class="photo-card-item" style="display: inline-block; width: calc(50% - 4px); margin: 4px 2px; vertical-align: top; box-sizing: border-box;">
          <div style="width: 100%; height: 200px; background-image: url(${imagePath}); background-size: cover; background-position: center; border-radius: 8px; position: relative; overflow: hidden; display: flex; align-items: flex-end; padding: 16px; box-sizing: border-box;">
            <div style="color: white; font-weight: bold; font-size: 16px; text-shadow: 0 1px 3px rgba(0,0,0,0.3);">${imageName}</div>
          </div>
        </div>`
        
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = html
        editableArea.value.appendChild(tempDiv.firstElementChild)
      })
      
      handleContentChange()
    }
    return
  }
  
  // 如果是空内容或只有简单文本，完全替换
  // 或者有content-block-wrapper包裹的纯文本，也需要转换
  if (isEmpty || (!hasComplexElements && !hasImageCards) || hasContentBlockWrapper) {
    // 清空编辑区域
    editableArea.value.innerHTML = ''
    
    // 为每个找到的图片创建卡片（允许重复添加）
    foundImages.forEach((imageName) => {
      const imagePath = imageNameMap[imageName]
      
      // 允许图片重复添加，移除重复检查
      const html = `<div class="photo-card-item" style="display: inline-block; width: calc(50% - 4px); margin: 4px 2px; vertical-align: top; box-sizing: border-box;">
        <div style="width: 100%; height: 200px; background-image: url(${imagePath}); background-size: cover; background-position: center; border-radius: 8px; position: relative; overflow: hidden; display: flex; align-items: flex-end; padding: 16px; box-sizing: border-box;">
          <div style="color: white; font-weight: bold; font-size: 16px; text-shadow: 0 1px 3px rgba(0,0,0,0.3);">${imageName}</div>
        </div>
      </div>`
      
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = html
      editableArea.value.appendChild(tempDiv.firstElementChild)
    })
    
    // 触发内容变化
    handleContentChange()
  }
}

// 处理失焦事件
const handleBlur = (event) => {
  // 检查失去焦点的原因，如果是点击按钮，不执行转换
  const relatedTarget = event.relatedTarget
  if (relatedTarget) {
    // 如果焦点转移到按钮或其他交互元素，不执行转换
    if (relatedTarget.tagName === 'BUTTON' || 
        relatedTarget.closest('.action-btn') || 
        relatedTarget.closest('.modal') ||
        relatedTarget.closest('button') ||
        relatedTarget.closest('.element-actions')) {
      return
    }
  }
  
  // 延迟执行，避免干扰按钮点击
  setTimeout(() => {
    // 再次检查焦点是否真的在编辑区域外
    if (editableArea.value && document.activeElement !== editableArea.value) {
      // 尝试将文本转换为图片卡片
      convertTextToImageCards()
      
      // 如果编辑区域为空，添加占位符
      nextTick(() => {
        if (editableArea.value && !editableArea.value.innerHTML.trim()) {
          editableArea.value.innerHTML = '<div class="empty-placeholder" style="color: #999; text-align: center; padding: 60px 20px; font-size: 1.1rem; pointer-events: none;">' + tt('advancedEditorExtra.editContentPlaceholder') + '</div>'
        }
      })
    }
  }, 200)
}

// 处理编辑区域点击事件
const handleEditableAreaClick = (event) => {
  // 如果点击的是操作按钮，不处理
  if (event.target.closest('.element-actions')) {
    return
  }
  
  // 如果点击的是图片工具栏按钮或工具栏本身，不处理（让按钮正常工作）
  // 优先检查，确保工具栏功能正常
  if (event.target.closest('.image-toolbar-btn') || 
      event.target.closest('.image-toolbar') ||
      event.target.classList.contains('image-toolbar-btn')) {
    event.stopPropagation()
    return
  }
  
  // 如果点击的是图片容器，显示工具栏和选中状态
  // 优先检查 image-with-toolbar 类，确保能正确识别
  // 使用更精确的查找，避免选中包含其他内容的父容器
  let imageContainer = null
  
  // 如果点击的是img标签，直接查找其父容器
  if (event.target.tagName === 'IMG' || event.target.tagName === 'img') {
    const img = event.target
    // 优先查找直接父容器
    imageContainer = img.parentElement
    if (imageContainer && (
        imageContainer.classList.contains('image-container') ||
        imageContainer.classList.contains('editor-image-content') ||
        imageContainer.classList.contains('image-with-toolbar')
    )) {
      // 找到直接父容器，使用它
    } else {
      // 否则向上查找
      imageContainer = img.closest('.image-container.image-with-toolbar') ||
                      img.closest('.editor-image-content.image-with-toolbar') ||
                      img.closest('.image-container') ||
                      img.closest('.editor-image-content')
    }
  } else {
    // 如果点击的不是img，检查是否点击在图片容器上
    // 优先检查是否有 image-with-toolbar 类
    imageContainer = event.target.closest('.image-container.image-with-toolbar') ||
                    event.target.closest('.editor-image-content.image-with-toolbar')
    
    if (!imageContainer) {
      // 检查当前元素本身是否是图片容器
      if (event.target.classList.contains('image-container') ||
          event.target.classList.contains('editor-image-content') ||
          event.target.classList.contains('image-with-toolbar')) {
        imageContainer = event.target
      } else {
        // 向上查找
        imageContainer = event.target.closest('.image-container') || 
                        event.target.closest('.editor-image-content') ||
                        event.target.closest('.photo-card-item')
      }
    }
  }
  
  // 确保选中的是真正的图片容器，而不是包含文本等其他内容的父容器
  if (imageContainer) {
    // 检查容器是否真的包含图片（img标签或background-image）
    const hasImage = imageContainer.querySelector('img') || 
                    imageContainer.style.backgroundImage ||
                    window.getComputedStyle(imageContainer).backgroundImage !== 'none'
    
    // 如果容器包含大量文本内容，可能不是纯图片容器，需要进一步检查
    const textContent = imageContainer.textContent || ''
    const imageElements = imageContainer.querySelectorAll('img')
    
    // 如果文本内容过多（超过50字符）且没有img标签，可能不是图片容器
    if (textContent.trim().length > 50 && imageElements.length === 0 && 
        !imageContainer.style.backgroundImage && 
        window.getComputedStyle(imageContainer).backgroundImage === 'none') {
      imageContainer = null
    }
  }
  
  if (imageContainer && !event.target.closest('.replace-image-btn') && !event.target.closest('.image-toolbar')) {
    console.log('[handleEditableAreaClick] 检测到图片点击，显示工具栏')
    
    // 阻止事件冒泡，防止进入编辑状态
    event.stopPropagation()
    event.preventDefault()
    
    // 隐藏所有其他图片的工具栏和选中状态
    const allImageContainers = editableArea.value.querySelectorAll('.image-container, .editor-image-content, .photo-card-item, [class*="image-container"], [class*="editor-image-content"]')
    allImageContainers.forEach(container => {
      container.classList.remove('image-selected')
      const toolbar = container.querySelector('.image-toolbar')
      if (toolbar) {
        toolbar.style.display = 'none'
      }
    })
    
    // 显示当前图片的工具栏和选中状态
    imageContainer.classList.add('image-selected')
    const toolbar = imageContainer.querySelector('.image-toolbar')
    if (toolbar) {
      toolbar.style.display = 'flex'
    }
    
    // 确保不会设置 selectedElement 为图片元素
    if (selectedElement.value && (
        selectedElement.value.classList.contains('image-container') ||
        selectedElement.value.classList.contains('editor-image-content') ||
        selectedElement.value.closest('.image-container') ||
        selectedElement.value.closest('.editor-image-content')
    )) {
      selectedElement.value = null
      showElementActions.value = false
    }
    return
  }
  
  // 如果点击的不是图片，隐藏所有图片工具栏和选中状态
  if (!event.target.closest('.image-container') && 
      !event.target.closest('.editor-image-content') &&
      !event.target.closest('.photo-card-item') &&
      !event.target.closest('.image-toolbar') &&
      !event.target.closest('[class*="image-container"]') &&
      !event.target.closest('[class*="editor-image-content"]')) {
    const allImageContainers = editableArea.value.querySelectorAll('.image-container, .editor-image-content, .photo-card-item, [class*="image-container"], [class*="editor-image-content"]')
    allImageContainers.forEach(container => {
      container.classList.remove('image-selected')
      const toolbar = container.querySelector('.image-toolbar')
      if (toolbar) {
        toolbar.style.display = 'none'
      }
    })
  }
  
  const target = event.target
  const operableElement = findOperableElement(target)
  
  if (operableElement) {
    selectedElement.value = operableElement
    
    // 检查是否是表格单元格
    const td = target.closest('td') || target.closest('th')
    if (td) {
      selectedTableCell.value = td
    } else {
      // 检查是否是 key-value 表格行（div 结构）
      const keyValueRow = target.closest('div[style*="display: flex"][style*="justify-content: space-between"]')
      if (keyValueRow) {
        const style = window.getComputedStyle(keyValueRow)
        if (style.display === 'flex' && style.justifyContent === 'space-between' && 
            (style.borderBottom !== 'none' && style.borderBottom !== '0px')) {
          selectedTableCell.value = keyValueRow
        } else {
          selectedTableCell.value = null
        }
      } else {
        // 内联表格：优先识别 editor-inline-value，然后定位到所在行
        const inlineValue = target.closest?.('.editor-inline-value')
        if (inlineValue) {
          const inlineRow = inlineValue.closest?.('.editor-inline-row') || inlineValue.parentElement
          selectedTableCell.value = inlineRow || null
        } else {
          // 点击到 label 文本/空白处：向上寻找“包含 editor-inline-value 的行 div”
          let probe = target
          if (probe && probe.nodeType === Node.TEXT_NODE) probe = probe.parentElement
          while (probe && probe !== editableArea.value) {
            if (probe.tagName === 'DIV' && !probe.classList?.contains('content-block-wrapper')) {
              if (probe.classList?.contains('editor-inline-row') || probe.querySelector?.('.editor-inline-value')) {
                selectedTableCell.value = probe
                break
              }
            }
            probe = probe.parentElement
          }
          if (!selectedTableCell.value || selectedTableCell.value === editableArea.value) {
            selectedTableCell.value = null
          }
        }
      }
    }
    
    updateElementActionsPosition(operableElement)
    showElementActions.value = true
  } else {
    // 如果没有找到可操作元素，隐藏操作按钮
    showElementActions.value = false
    selectedElement.value = null
    selectedTableCell.value = null
  }
}

// 更新操作按钮位置
const updateElementActionsPosition = (element) => {
  if (!element || !editableArea.value) return
  
  nextTick(() => {
    const rect = element.getBoundingClientRect()
    const editableRect = editableArea.value.getBoundingClientRect()
    
    // 根据是否是表格元素计算按钮宽度
    const buttonCount = isTableElement.value ? 10 : 4 // 表格有10个按钮（6个表格操作 + 4个通用操作）
    const buttonWidth = isTableElement.value ? 500 : 200 // 表格按钮更宽
    const buttonHeight = 36 // 估算按钮高度
    
    // 计算编辑区域的可见范围（考虑滚动）
    const editableVisibleTop = editableRect.top
    const editableVisibleBottom = editableRect.bottom
    const editableVisibleLeft = editableRect.left
    const editableVisibleRight = editableRect.right
    
    // 使用fixed定位，相对于视口定位，但位置基于元素
    // 按钮显示在元素的右上角
    let top = rect.top
    let left = rect.right - buttonWidth - 10 // 距离元素右边缘10px
    
    // 首先确保按钮在编辑区域的可见范围内（水平方向）
    // 如果按钮超出编辑区域右边界，调整到元素左侧
    if (left < editableVisibleLeft + 10) {
      left = rect.left + 10
    }
    
    // 如果按钮超出编辑区域左边界，调整到元素右侧
    if (left + buttonWidth > editableVisibleRight - 10) {
      left = editableVisibleRight - buttonWidth - 10
    }
    
    // 如果按钮超出编辑区域右边界（即使调整后），调整到元素左侧
    if (left + buttonWidth > editableVisibleRight - 10) {
      left = Math.max(editableVisibleLeft + 10, rect.left - buttonWidth - 10)
    }
    
    // 确保按钮在编辑区域的可见范围内（垂直方向）
    // 如果按钮超出编辑区域上边界，调整到元素下方
    if (top < editableVisibleTop + 10) {
      top = rect.bottom + 10
    }
    
    // 如果按钮超出编辑区域下边界，调整到元素上方
    if (top + buttonHeight > editableVisibleBottom - 10) {
      top = Math.max(editableVisibleTop + 10, rect.top - buttonHeight - 10)
    }
    
    // 如果元素本身不在可见范围内，将按钮放在可见区域的边缘
    if (rect.bottom < editableVisibleTop) {
      // 元素在可见区域上方，按钮放在可见区域顶部
      top = editableVisibleTop + 10
    } else if (rect.top > editableVisibleBottom) {
      // 元素在可见区域下方，按钮放在可见区域底部
      top = editableVisibleBottom - buttonHeight - 10
    }
    
    // 最终边界检查，确保按钮在编辑区域可见范围内
    // 更新当前行的标题样式状态
    updateCurrentHeadingStyle()
    top = Math.max(editableVisibleTop + 10, Math.min(top, editableVisibleBottom - buttonHeight - 10))
    left = Math.max(editableVisibleLeft + 10, Math.min(left, editableVisibleRight - buttonWidth - 10))
    
    elementActionsStyle.value = {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      zIndex: 10000
    }
  })
}

// 计算是否可以上移
const canMoveUp = computed(() => {
  if (!selectedElement.value || !editableArea.value) return false
  
  const parent = selectedElement.value.parentElement
  if (!parent) return false
  
  // 如果元素本身是 content-block-wrapper 且父元素是 editableArea，直接检查在 editableArea 中的位置
  if (selectedElement.value.classList.contains('content-block-wrapper') && parent === editableArea.value) {
    const allElements = Array.from(editableArea.value.children)
    const currentIndex = allElements.indexOf(selectedElement.value)
    return currentIndex > 0
  }
  
  // 检查元素是否在 content-block-wrapper 内部（嵌套情况）
  if (parent.classList.contains('content-block-wrapper')) {
    // 在父容器内查找前一个兄弟元素
    const previousSibling = selectedElement.value.previousElementSibling
    return previousSibling !== null
  }
  
  // 对于 editableArea 的直接子元素，检查是否有前一个兄弟元素
  if (parent === editableArea.value) {
    // 先检查直接的前一个兄弟元素
    const previousSibling = selectedElement.value.previousElementSibling
    if (previousSibling) return true
    
    // 如果没有直接的前一个兄弟元素，检查在 editableArea 的所有子元素中是否有前一个元素
    const allElements = Array.from(editableArea.value.children)
    const currentIndex = allElements.indexOf(selectedElement.value)
    return currentIndex > 0
  }
  
  return false
})

// 计算是否可以下移
const canMoveDown = computed(() => {
  if (!selectedElement.value || !editableArea.value) return false
  
  const parent = selectedElement.value.parentElement
  if (!parent) return false
  
  // 如果元素本身是 content-block-wrapper 且父元素是 editableArea，直接检查在 editableArea 中的位置
  if (selectedElement.value.classList.contains('content-block-wrapper') && parent === editableArea.value) {
    const allElements = Array.from(editableArea.value.children)
    const currentIndex = allElements.indexOf(selectedElement.value)
    return currentIndex < allElements.length - 1
  }
  
  // 检查元素是否在 content-block-wrapper 内部（嵌套情况）
  if (parent.classList.contains('content-block-wrapper')) {
    // 在父容器内查找下一个兄弟元素
    const nextSibling = selectedElement.value.nextElementSibling
    return nextSibling !== null
  }
  
  // 对于 editableArea 的直接子元素，检查是否有下一个兄弟元素
  if (parent === editableArea.value) {
    // 先检查直接的下一个兄弟元素
    const nextSibling = selectedElement.value.nextElementSibling
    if (nextSibling) return true
    
    // 如果没有直接的下一个兄弟元素，检查在 editableArea 的所有子元素中是否有下一个元素
    const allElements = Array.from(editableArea.value.children)
    const currentIndex = allElements.indexOf(selectedElement.value)
    return currentIndex < allElements.length - 1
  }
  
  return false
})

// 检查是否是表格元素
const isTableElement = computed(() => {
  if (!selectedElement.value || !selectedTableCell.value) return false
  
  // 检查选中的单元格是否在表格中
  const table = selectedTableCell.value.closest('table')
  if (table) return true
  
  // 检查是否是 key-value 表格行（div 结构）
  if (selectedTableCell.value.tagName === 'DIV') {
    const style = window.getComputedStyle(selectedTableCell.value)
    if (style.display === 'flex' && style.justifyContent === 'space-between' && 
        (style.borderBottom !== 'none' && style.borderBottom !== '0px')) {
      return true
    }
  }

  // 检查是否是内联表格行（包含 editor-inline-value 的 div）
  if (selectedTableCell.value.tagName === 'DIV') {
    if (selectedTableCell.value.classList?.contains('editor-inline-row')) return true
    const inlineValue = selectedTableCell.value.querySelector?.('.editor-inline-value')
    if (inlineValue) return true
  }
  
  return false
})

// 判断是否是 key-value 表格（用于隐藏列操作按钮）
const isKeyValueTable = computed(() => {
  if (!selectedTableCell.value) return false
  
  // 检查是否是 key-value 表格行（div 结构）
  if (selectedTableCell.value.tagName === 'DIV') {
    const style = window.getComputedStyle(selectedTableCell.value)
    if (style.display === 'flex' && style.justifyContent === 'space-between' && 
        (style.borderBottom !== 'none' && style.borderBottom !== '0px')) {
      return true
    }
  }

  // 内联表格也需要隐藏列操作按钮
  if (selectedTableCell.value.tagName === 'DIV') {
    if (selectedTableCell.value.classList?.contains('editor-inline-row')) return true
    if (selectedTableCell.value.querySelector?.('.editor-inline-value')) return true
  }
  
  return false
})

// 上移元素
const moveElementUp = () => {
  if (!selectedElement.value || !canMoveUp.value) return
  
  // 移除高亮
  if (hoveredElement.value === selectedElement.value) {
    selectedElement.value.classList.remove('element-hover-highlight')
    hoveredElement.value = null
  }
  
  // 获取父容器（可能是 editableArea 或 content-block-wrapper）
  const parent = selectedElement.value.parentElement
  
  if (!parent) return
  
  // 检查是否在 content-block-wrapper 内部
  if (parent.classList.contains('content-block-wrapper')) {
    // 在父容器内查找前一个兄弟元素
    const previousSibling = selectedElement.value.previousElementSibling
    if (previousSibling) {
      const movedElement = selectedElement.value
      parent.insertBefore(movedElement, previousSibling)
      // 移动后，强制触发computed重新计算
      selectedElement.value = null
      nextTick(() => {
        selectedElement.value = movedElement
        handleContentChange()
        updateElementActionsPosition(selectedElement.value)
      })
    }
    return
  }
  
  // 查找前一个兄弟元素（跳过文本节点和空白节点）
  let previousSibling = selectedElement.value.previousElementSibling
  
  // 如果没有直接的前一个兄弟元素，尝试查找前一个块级元素
  if (!previousSibling) {
    // 在 editableArea 中查找前一个块级元素
    const allElements = Array.from(editableArea.value.children)
    const currentIndex = allElements.indexOf(selectedElement.value)
    if (currentIndex > 0) {
      previousSibling = allElements[currentIndex - 1]
    }
  }
  
  if (previousSibling && parent) {
    parent.insertBefore(selectedElement.value, previousSibling)
    // 移动后，确保selectedElement仍然指向移动后的元素（虽然引用没变，但位置变了）
    // 强制触发computed重新计算
    const movedElement = selectedElement.value
    selectedElement.value = null
    nextTick(() => {
      selectedElement.value = movedElement
      handleContentChange()
      updateElementActionsPosition(selectedElement.value)
    })
  }
}

// 下移元素
const moveElementDown = () => {
  if (!selectedElement.value || !canMoveDown.value) return
  
  // 移除高亮
  if (hoveredElement.value === selectedElement.value) {
    selectedElement.value.classList.remove('element-hover-highlight')
    hoveredElement.value = null
  }
  
  // 获取父容器（可能是 editableArea 或 content-block-wrapper）
  const parent = selectedElement.value.parentElement
  
  if (!parent) return
  
  // 检查是否在 content-block-wrapper 内部
  if (parent.classList.contains('content-block-wrapper')) {
    // 在父容器内查找下一个兄弟元素
    const nextSibling = selectedElement.value.nextElementSibling
    if (nextSibling) {
      const movedElement = selectedElement.value
      // 将元素移动到下一个兄弟元素之后
      if (nextSibling.nextElementSibling) {
        parent.insertBefore(movedElement, nextSibling.nextElementSibling)
      } else {
        // 如果没有下一个兄弟元素，直接追加到父容器末尾
        parent.appendChild(movedElement)
      }
      // 移动后，强制触发computed重新计算
      selectedElement.value = null
      nextTick(() => {
        selectedElement.value = movedElement
        handleContentChange()
        updateElementActionsPosition(selectedElement.value)
      })
    }
    return
  }
  
  // 查找下一个兄弟元素
  let nextSibling = selectedElement.value.nextElementSibling
  
  // 如果没有直接的下一个兄弟元素，尝试查找下一个块级元素
  if (!nextSibling) {
    // 在 editableArea 中查找下一个块级元素
    const allElements = Array.from(editableArea.value.children)
    const currentIndex = allElements.indexOf(selectedElement.value)
    if (currentIndex < allElements.length - 1) {
      nextSibling = allElements[currentIndex + 1]
    }
  }
  
  if (nextSibling && parent) {
    // 将元素移动到下一个兄弟元素之后
    const movedElement = selectedElement.value
    if (nextSibling.nextElementSibling) {
      parent.insertBefore(movedElement, nextSibling.nextElementSibling)
    } else {
      // 如果没有下一个兄弟元素，直接追加到父容器末尾
      parent.appendChild(movedElement)
    }
    // 移动后，确保selectedElement仍然指向移动后的元素（虽然引用没变，但位置变了）
    // 强制触发computed重新计算
    selectedElement.value = null
    nextTick(() => {
      selectedElement.value = movedElement
      handleContentChange()
      updateElementActionsPosition(selectedElement.value)
    })
  }
}

// 复制元素
const copyElement = () => {
  if (!selectedElement.value) return
  
  const clonedElement = selectedElement.value.cloneNode(true)
  editableArea.value.insertBefore(clonedElement, selectedElement.value.nextElementSibling)
  handleContentChange()
  
  // 选中新复制的元素
  nextTick(() => {
    selectedElement.value = clonedElement
    updateElementActionsPosition(clonedElement)
  })
}

// 删除元素
const deleteElement = () => {
  if (!selectedElement.value) return
  
  // 移除高亮
  if (hoveredElement.value === selectedElement.value) {
    hoveredElement.value = null
  }
  
  selectedElement.value.remove()
  selectedElement.value = null
  showElementActions.value = false
  handleContentChange()
}

// 表格操作函数
// 获取当前表格和行
const getTableInfo = () => {
  if (!selectedTableCell.value) return null
  
  const table = selectedTableCell.value.closest('table')
  if (!table) return null
  
  const row = selectedTableCell.value.closest('tr')
  if (!row) return null
  
  const rowIndex = Array.from(table.rows).indexOf(row)
  const cellIndex = Array.from(row.cells).indexOf(selectedTableCell.value)
  
  return { table, row, rowIndex, cellIndex, type: 'table' }
}

// 获取 key-value 表格信息
const getKeyValueTableInfo = () => {
  if (!selectedTableCell.value || selectedTableCell.value.tagName !== 'DIV') return null
  
  const row = selectedTableCell.value
  const style = window.getComputedStyle(row)
  
  // 检查是否是 key-value 表格行
  if (!(style.display === 'flex' && style.justifyContent === 'space-between' && 
        (style.borderBottom !== 'none' && style.borderBottom !== '0px'))) {
    return null
  }
  
  // 查找所有同类型的行（在同一容器中）
  const container = row.parentElement
  if (!container) return null
  
  const allRows = Array.from(container.children).filter(child => {
    if (child === row) return true
    const childStyle = window.getComputedStyle(child)
    return childStyle.display === 'flex' && 
           childStyle.justifyContent === 'space-between' && 
           (childStyle.borderBottom !== 'none' && childStyle.borderBottom !== '0px')
  })
  
  const rowIndex = allRows.indexOf(row)
  
  return { container, row, rowIndex, type: 'key-value' }
}

// 创建一个与现有 key-value 行完全一致的新空行（保持 class/样式结构一致，保证可编辑）
const createEmptyKeyValueRowLike = (sourceRow) => {
  // 优先：深克隆当前行，确保 class 与内联样式完全一致
  const newRow = sourceRow.cloneNode(true)

  // 清理可能残留的高亮类（避免新行一插入就带蓝框）
  if (newRow.classList?.contains('element-hover-highlight')) {
    newRow.classList.remove('element-hover-highlight')
  }
  newRow.querySelectorAll?.('.element-hover-highlight')?.forEach(el => el.classList.remove('element-hover-highlight'))

  // 清空所有可编辑区域内容，使用 &nbsp; 作为占位，保证行高与可点击/可聚焦
  const editables = newRow.querySelectorAll?.('[contenteditable="true"], [contenteditable="plaintext-only"]') || []
  if (editables.length > 0) {
    editables.forEach(el => {
      el.innerHTML = '&nbsp;'
      // 保险：确保仍然是可编辑（克隆一般会保留，但这里避免被外层逻辑改写）
      el.setAttribute('contenteditable', 'true')
    })
  } else {
    // 兜底：如果结构异常，至少保证两个 span 存在且可编辑
    newRow.innerHTML = ''
    const labelSpan = document.createElement('span')
    labelSpan.style.color = '#666'
    labelSpan.style.display = 'inline-block'
    labelSpan.style.lineHeight = '20px'
    labelSpan.style.minHeight = '20px'
    labelSpan.style.outline = 'none'
    labelSpan.innerHTML = '&nbsp;'
    labelSpan.setAttribute('contenteditable', 'true')

    const valueSpan = document.createElement('span')
    valueSpan.style.color = '#333'
    valueSpan.style.fontWeight = '500'
    valueSpan.style.display = 'inline-block'
    valueSpan.style.lineHeight = '20px'
    valueSpan.style.minHeight = '20px'
    valueSpan.style.outline = 'none'
    valueSpan.innerHTML = '&nbsp;'
    valueSpan.setAttribute('contenteditable', 'true')

    // 保持常用 class（供键盘逻辑/样式识别）
    newRow.classList?.add('editor-kv-row')
    newRow.style.display = 'flex'
    newRow.style.justifyContent = 'space-between'
    newRow.style.alignItems = 'center'
    newRow.style.padding = '12px 0'
    newRow.style.borderBottom = '1px solid #f0f0f0'
    newRow.style.fontSize = '14px'
    newRow.style.lineHeight = '20px'
    newRow.style.minHeight = '44px'

    newRow.appendChild(labelSpan)
    newRow.appendChild(valueSpan)
  }

  return newRow
}

// 获取内联表格（inline 行结构）信息：行以 div 为单位，内部包含 .editor-inline-value
const getInlineTableInfo = () => {
  if (!selectedTableCell.value) return null

  let row = selectedTableCell.value
  // 如果误传入 span，则提升到所在行
  if (row.tagName === 'SPAN' && row.classList?.contains('editor-inline-value')) {
    row = row.closest?.('.editor-inline-row') || row.parentElement
  }
  if (!row || row.tagName !== 'DIV') return null

  const hasInlineValue = !!row.querySelector?.('.editor-inline-value')
  if (!hasInlineValue) return null

  const container = row.parentElement
  if (!container) return null

  const allRows = Array.from(container.children).filter(child => {
    return child?.tagName === 'DIV' && !!child.querySelector?.('.editor-inline-value')
  })
  const rowIndex = allRows.indexOf(row)
  if (rowIndex < 0) return null

  return { container, row, rowIndex, type: 'inline' }
}

// 创建一个与现有 inline 行尽量一致的新空行（保证可编辑）
const createEmptyInlineRowLike = (sourceRow) => {
  const newRow = sourceRow.cloneNode(true)

  // 清理可能残留的高亮类
  if (newRow.classList?.contains('element-hover-highlight')) {
    newRow.classList.remove('element-hover-highlight')
  }
  newRow.querySelectorAll?.('.element-hover-highlight')?.forEach(el => el.classList.remove('element-hover-highlight'))

  // 让行可被识别（即使原始行没有 class）
  newRow.classList?.add('editor-inline-row')

  // 确保存在 value span
  const valueSpan = newRow.querySelector?.('.editor-inline-value')
  if (!valueSpan) {
    // 兜底：构造一个标准行
    newRow.innerHTML = ''
    const labelSpan = document.createElement('span')
    labelSpan.className = 'editor-inline-label'
    labelSpan.setAttribute('contenteditable', 'true')
    labelSpan.style.color = '#666'
    labelSpan.style.display = 'inline-block'
    labelSpan.style.lineHeight = '20px'
    labelSpan.style.minHeight = '20px'
    labelSpan.style.outline = 'none'
    labelSpan.innerHTML = '&nbsp;'

    const sep = document.createElement('span')
    sep.textContent = '：'
    sep.style.color = '#666'

    const newValue = document.createElement('span')
    newValue.className = 'editor-inline-value'
    newValue.setAttribute('contenteditable', 'true')
    newValue.style.color = '#333'
    newValue.style.display = 'inline-block'
    newValue.style.lineHeight = '20px'
    newValue.style.minHeight = '20px'
    newValue.style.outline = 'none'
    newValue.innerHTML = '&nbsp;'

    newRow.appendChild(labelSpan)
    newRow.appendChild(sep)
    newRow.appendChild(newValue)
    return newRow
  }

  // 旧结构可能没有 label span，只有 “label：” 文本 + value span；将其升级为可编辑 label span
  let labelSpan = newRow.querySelector?.('.editor-inline-label')
  if (!labelSpan) {
    let labelText = ''
    const nodes = Array.from(newRow.childNodes || [])
    for (const n of nodes) {
      if (n === valueSpan) break
      if (n.nodeType === Node.TEXT_NODE) {
        labelText += n.textContent || ''
      } else if (n.nodeType === Node.ELEMENT_NODE) {
        labelText += (n.textContent || '')
      }
    }
    labelText = (labelText || '').trim().replace(/[:：]\s*$/, '').trim()

    const clonedValue = valueSpan.cloneNode(true)
    newRow.innerHTML = ''

    labelSpan = document.createElement('span')
    labelSpan.className = 'editor-inline-label'
    labelSpan.setAttribute('contenteditable', 'true')
    labelSpan.style.color = '#666'
    labelSpan.style.display = 'inline-block'
    labelSpan.style.lineHeight = '20px'
    labelSpan.style.minHeight = '20px'
    labelSpan.style.outline = 'none'
    labelSpan.innerHTML = labelText ? labelText : '&nbsp;'

    const sep = document.createElement('span')
    sep.textContent = '：'
    sep.style.color = '#666'

    if (!clonedValue.getAttribute('contenteditable')) clonedValue.setAttribute('contenteditable', 'true')
    clonedValue.classList?.add('editor-inline-value')

    newRow.appendChild(labelSpan)
    newRow.appendChild(sep)
    newRow.appendChild(clonedValue)
  }

  // 清空 label/value 内容，用 &nbsp; 占位保证可点击与行高稳定
  const label = newRow.querySelector?.('.editor-inline-label')
  const value = newRow.querySelector?.('.editor-inline-value')
  if (label) {
    label.setAttribute('contenteditable', 'true')
    label.innerHTML = '&nbsp;'
  }
  if (value) {
    value.setAttribute('contenteditable', 'true')
    value.innerHTML = '&nbsp;'
  }

  return newRow
}

// 在上方插入行
const insertTableRowAbove = () => {
  // 先尝试获取真正的表格信息
  let info = getTableInfo()
  
  // 如果不是真正的表格，尝试获取 key-value 表格信息
  if (!info) {
    info = getKeyValueTableInfo()
    if (!info) info = getInlineTableInfo()
    if (!info) return
    
    // 处理 key-value 表格
    if (info.type === 'key-value') {
      const { container, row, rowIndex } = info
      
      // 创建新行：克隆当前行结构并清空可编辑内容，确保与原行完全一致且可编辑
      const newRow = createEmptyKeyValueRowLike(row)
      
      // 插入到指定位置（在当前行之前）
      container.insertBefore(newRow, row)
      
      // 确保原行仍然有边框（如果它之前是最后一行，现在不是了）
      row.style.borderBottom = '1px solid #f0f0f0'
      
      handleContentChange()
      nextTick(() => {
        selectedTableCell.value = newRow
        updateElementActionsPosition(selectedElement.value)
      })
      return
    }

    // 处理 inline 表格
    if (info.type === 'inline') {
      const { container, row } = info
      const newRow = createEmptyInlineRowLike(row)
      container.insertBefore(newRow, row)
      handleContentChange()
      nextTick(() => {
        selectedTableCell.value = newRow
        updateElementActionsPosition(selectedElement.value)
      })
      return
    }
  }
  
  // 处理真正的表格
  const { table, row, rowIndex } = info
  const newRow = table.insertRow(rowIndex)
  
  // 复制当前行的单元格数量和样式
  const cellCount = row.cells.length
  for (let i = 0; i < cellCount; i++) {
    const newCell = newRow.insertCell(i)
    const oldCell = row.cells[i]
    
    // 复制样式
    newCell.style.cssText = oldCell.style.cssText
    newCell.className = oldCell.className
    
    // 复制colspan
    if (oldCell.colSpan > 1) {
      newCell.colSpan = oldCell.colSpan
    }
    
    // 设置默认内容
    // 使用&nbsp;占位，保证新行高度与其他行一致（空字符串会导致行高明显变小）
    newCell.innerHTML = '&nbsp;'
    // td 在外层 contenteditable 区域内已可编辑，这里保持显式可编辑不影响其他功能
    newCell.contentEditable = 'true'
  }
  
  handleContentChange()
  nextTick(() => {
    selectedTableCell.value = newRow.cells[0]
    updateElementActionsPosition(selectedElement.value)
  })
}

// 在下方插入行
const insertTableRowBelow = () => {
  // 先尝试获取真正的表格信息
  let info = getTableInfo()
  
  // 如果不是真正的表格，尝试获取 key-value 表格信息
  if (!info) {
    info = getKeyValueTableInfo()
    if (!info) info = getInlineTableInfo()
    if (!info) return
    
    // 处理 key-value 表格
    if (info.type === 'key-value') {
      const { container, row, rowIndex } = info
      
      // 创建新行：克隆当前行结构并清空可编辑内容，确保与原行完全一致且可编辑
      const newRow = createEmptyKeyValueRowLike(row)
      
      // 插入到指定位置（在当前行之后）
      const nextRow = row.nextElementSibling
      if (nextRow) {
        container.insertBefore(newRow, nextRow)
      } else {
        container.appendChild(newRow)
      }
      
      // 确保新行有边框（如果它是最后一行，可能需要移除边框，但通常保持边框更美观）
      // 这里保持边框，因为模板中所有行都有边框
      
      handleContentChange()
      nextTick(() => {
        selectedTableCell.value = newRow
        updateElementActionsPosition(selectedElement.value)
      })
      return
    }

    // 处理 inline 表格
    if (info.type === 'inline') {
      const { container, row } = info
      const newRow = createEmptyInlineRowLike(row)
      const nextRow = row.nextElementSibling
      if (nextRow) {
        container.insertBefore(newRow, nextRow)
      } else {
        container.appendChild(newRow)
      }
      handleContentChange()
      nextTick(() => {
        selectedTableCell.value = newRow
        updateElementActionsPosition(selectedElement.value)
      })
      return
    }
  }
  
  // 处理真正的表格
  const { table, row, rowIndex } = info
  const newRow = table.insertRow(rowIndex + 1)
  
  // 复制当前行的单元格数量和样式
  const cellCount = row.cells.length
  for (let i = 0; i < cellCount; i++) {
    const newCell = newRow.insertCell(i)
    const oldCell = row.cells[i]
    
    // 复制样式
    newCell.style.cssText = oldCell.style.cssText
    newCell.className = oldCell.className
    
    // 复制colspan
    if (oldCell.colSpan > 1) {
      newCell.colSpan = oldCell.colSpan
    }
    
    // 设置默认内容
    // 使用&nbsp;占位，保证新行高度与其他行一致
    newCell.innerHTML = '&nbsp;'
    newCell.contentEditable = 'true'
  }
  
  handleContentChange()
  nextTick(() => {
    selectedTableCell.value = newRow.cells[0]
    updateElementActionsPosition(selectedElement.value)
  })
}

// 在左侧插入列
const insertTableColumnLeft = () => {
  const info = getTableInfo()
  if (!info) return
  
  const { table, cellIndex } = info
  
  // 遍历所有行，在指定位置插入新单元格
  Array.from(table.rows).forEach(row => {
    const newCell = row.insertCell(cellIndex)
    
    // 如果有参考单元格，复制样式
    if (row.cells[cellIndex + 1]) {
      const refCell = row.cells[cellIndex + 1]
      newCell.style.cssText = refCell.style.cssText
      newCell.className = refCell.className
    }
    
    // 设置默认内容
    newCell.innerHTML = '&nbsp;'
    newCell.contentEditable = 'true'
  })
  
  handleContentChange()
  nextTick(() => {
    const row = selectedTableCell.value.closest('tr')
    if (row) {
      selectedTableCell.value = row.cells[cellIndex]
      updateElementActionsPosition(selectedElement.value)
    }
  })
}

// 在右侧插入列
const insertTableColumnRight = () => {
  const info = getTableInfo()
  if (!info) return
  
  const { table, cellIndex } = info
  
  // 遍历所有行，在指定位置之后插入新单元格
  Array.from(table.rows).forEach(row => {
    const newCell = row.insertCell(cellIndex + 1)
    
    // 如果有参考单元格，复制样式
    if (row.cells[cellIndex]) {
      const refCell = row.cells[cellIndex]
      newCell.style.cssText = refCell.style.cssText
      newCell.className = refCell.className
    }
    
    // 设置默认内容
    newCell.innerHTML = '&nbsp;'
    newCell.contentEditable = 'true'
  })
  
  handleContentChange()
  nextTick(() => {
    const row = selectedTableCell.value.closest('tr')
    if (row) {
      selectedTableCell.value = row.cells[cellIndex + 1]
      updateElementActionsPosition(selectedElement.value)
    }
  })
}

// 删除行
const deleteTableRow = () => {
  // 先尝试获取真正的表格信息
  let info = getTableInfo()
  
  // 如果不是真正的表格，尝试获取 key-value 表格信息
  if (!info) {
    info = getKeyValueTableInfo()
    if (!info) info = getInlineTableInfo()
    if (!info) return
    
    // 处理 key-value 表格
    if (info.type === 'key-value') {
      const { container, row, rowIndex } = info
      
      // 获取所有同类型的行
      const allRows = Array.from(container.children).filter(child => {
        if (child === row) return true
        const childStyle = window.getComputedStyle(child)
        return childStyle.display === 'flex' && 
               childStyle.justifyContent === 'space-between' && 
               (childStyle.borderBottom !== 'none' && childStyle.borderBottom !== '0px')
      })
      
      // 如果只有一行，不能删除
      if (allRows.length <= 1) {
        alert(tt('advancedEditor.errors.tableMinRow'))
        return
      }
      
      // 删除当前行
      row.remove()
      handleContentChange()
      
      // 选中相邻行
      nextTick(() => {
        const remainingRows = Array.from(container.children).filter(child => {
          const childStyle = window.getComputedStyle(child)
          return childStyle.display === 'flex' && 
                 childStyle.justifyContent === 'space-between' && 
                 (childStyle.borderBottom !== 'none' && childStyle.borderBottom !== '0px')
        })
        
        if (remainingRows.length > 0) {
          const newRowIndex = Math.min(rowIndex, remainingRows.length - 1)
          selectedTableCell.value = remainingRows[newRowIndex]
          updateElementActionsPosition(selectedElement.value)
        } else {
          showElementActions.value = false
          selectedElement.value = null
          selectedTableCell.value = null
        }
      })
      return
    }

    // 处理 inline 表格
    if (info.type === 'inline') {
      const { container, row, rowIndex } = info
      const allRows = Array.from(container.children).filter(child => {
        return child?.tagName === 'DIV' && !!child.querySelector?.('.editor-inline-value')
      })
      if (allRows.length <= 1) {
        alert(tt('advancedEditor.errors.tableMinRow'))
        return
      }

      row.remove()
      handleContentChange()

      nextTick(() => {
        const remainingRows = Array.from(container.children).filter(child => {
          return child?.tagName === 'DIV' && !!child.querySelector?.('.editor-inline-value')
        })
        if (remainingRows.length > 0) {
          const newRowIndex = Math.min(rowIndex, remainingRows.length - 1)
          selectedTableCell.value = remainingRows[newRowIndex]
          updateElementActionsPosition(selectedElement.value)
        } else {
          showElementActions.value = false
          selectedElement.value = null
          selectedTableCell.value = null
        }
      })
      return
    }
  }
  
  // 处理真正的表格
  const { table, row } = info
  
  // 如果只有一行，不能删除
  if (table.rows.length <= 1) {
    alert(tt('advancedEditor.errors.tableMinRow'))
    return
  }
  
  row.remove()
  handleContentChange()
  
  // 选中相邻行
  nextTick(() => {
    const newRow = table.rows[Math.min(info.rowIndex, table.rows.length - 1)]
    if (newRow && newRow.cells.length > 0) {
      selectedTableCell.value = newRow.cells[0]
      updateElementActionsPosition(selectedElement.value)
    } else {
      showElementActions.value = false
      selectedElement.value = null
      selectedTableCell.value = null
    }
  })
}

// 删除列
const deleteTableColumn = () => {
  const info = getTableInfo()
  if (!info) return
  
  const { table, cellIndex } = info
  
  // 检查所有行的列数
  const minCols = Math.min(...Array.from(table.rows).map(row => row.cells.length))
  
  // 如果只有一列，不能删除
  if (minCols <= 1) {
    alert(tt('advancedEditor.errors.tableMinCol'))
    return
  }
  
  // 遍历所有行，删除指定位置的单元格
  Array.from(table.rows).forEach(row => {
    if (row.cells[cellIndex]) {
      row.deleteCell(cellIndex)
    }
  })
  
  handleContentChange()
  
  // 选中相邻列
  nextTick(() => {
    const row = table.rows[0]
    if (row && row.cells.length > 0) {
      const newCellIndex = Math.min(cellIndex, row.cells.length - 1)
      selectedTableCell.value = row.cells[newCellIndex]
      updateElementActionsPosition(selectedElement.value)
    } else {
      showElementActions.value = false
      selectedElement.value = null
      selectedTableCell.value = null
    }
  })
}

// 查找可操作的元素（用于悬停和点击）
const findOperableElement = (target) => {
  if (!target || !editableArea.value) return null
  
  // 如果是文本节点，获取其父元素
  let element = target
  if (element.nodeType === Node.TEXT_NODE) {
    element = element.parentElement
  }
  
  // 优先查找最外层的content-block-wrapper
  const wrapper = element.closest('.content-block-wrapper')
  if (wrapper) {
    return wrapper
  }
  
  // 如果没有content-block-wrapper，查找表格元素
  while (element && element !== editableArea.value) {
    // 检查是否是表格元素
    if (element.tagName === 'TABLE' || element.classList?.contains('editor-table')) {
      return element
    }
    
    // 检查是否是表格单元格，返回包含它的表格
    if (element.tagName === 'TD' || element.tagName === 'TH') {
      const table = element.closest('table')
      if (table) {
        return table
      }
    }
    
    element = element.parentElement
  }
  
  // 如果都没找到，返回null（不显示蓝色边框）
  return null
}

// 处理编辑区域鼠标悬停事件
const handleEditableAreaMouseOver = (event) => {
  // 如果悬停的是操作按钮，不处理
  if (event.target.closest('.element-actions')) {
    return
  }
  
  const target = event.target
  const operableElement = findOperableElement(target)
  
  if (operableElement) {
    // 移除之前悬停元素的高亮
    if (hoveredElement.value && hoveredElement.value !== operableElement) {
      hoveredElement.value.classList.remove('element-hover-highlight')
    }
    
    // 为当前悬停元素添加高亮
    if (hoveredElement.value !== operableElement) {
      hoveredElement.value = operableElement
      // 直接添加类名
      operableElement.classList.add('element-hover-highlight')
      // 强制应用样式
      operableElement.style.setProperty('box-shadow', '0 0 0 2px #2196F3', 'important')
      // 使用nextTick确保DOM更新
      nextTick(() => {
        // 双重检查，确保类名已添加
        if (operableElement && !operableElement.classList.contains('element-hover-highlight')) {
          operableElement.classList.add('element-hover-highlight')
          operableElement.style.setProperty('box-shadow', '0 0 0 2px #2196F3', 'important')
        }
      })
    }
  } else {
    // 如果没有找到可操作元素，清除之前的高亮
    if (hoveredElement.value) {
      hoveredElement.value.classList.remove('element-hover-highlight')
      hoveredElement.value.style.removeProperty('box-shadow')
      hoveredElement.value = null
    }
  }
}

// 处理编辑区域鼠标移出事件
const handleEditableAreaMouseOut = (event) => {
  // 如果移出到操作按钮，不处理
  if (event.relatedTarget && event.relatedTarget.closest('.element-actions')) {
    return
  }
  
  const target = event.target
  const operableElement = findOperableElement(target)
  
  // 如果鼠标移出到可操作元素外部，移除高亮
  if (operableElement && hoveredElement.value === operableElement) {
    // 检查鼠标是否移到了该元素的子元素或其他可操作元素上
    if (event.relatedTarget) {
      const relatedOperableElement = findOperableElement(event.relatedTarget)
      // 如果移到了同一个元素或其子元素上，不移除高亮
      if (relatedOperableElement === operableElement || operableElement.contains(event.relatedTarget)) {
        return
      }
    }
    
    operableElement.classList.remove('element-hover-highlight')
    operableElement.style.removeProperty('box-shadow')
    hoveredElement.value = null
  } else if (hoveredElement.value) {
    // 如果当前有悬停元素，但鼠标移出了，检查是否需要移除高亮
    if (!event.relatedTarget || !hoveredElement.value.contains(event.relatedTarget)) {
      const relatedOperableElement = event.relatedTarget ? findOperableElement(event.relatedTarget) : null
      if (relatedOperableElement !== hoveredElement.value) {
        hoveredElement.value.classList.remove('element-hover-highlight')
        hoveredElement.value.style.removeProperty('box-shadow')
        hoveredElement.value = null
      }
    }
  }
}

// 处理拖拽开始
const handleDragStart = (event, template) => {
  // 确定模板类型（根据当前活动的标签页）
  const templateWithType = {
    ...template,
    type: activeElementTab.value || 'title' // 默认为title，但会根据实际标签页更新
  }
  
  // 将模板数据存储到拖拽数据中
  event.dataTransfer.setData('application/json', JSON.stringify(templateWithType))
  event.dataTransfer.effectAllowed = 'copy'
  
  // 添加拖拽时的视觉效果
  if (event.target) {
    event.target.style.opacity = '0.5'
    event.target.classList.add('dragging')
  }
}

// 处理拖拽结束（恢复样式）
const handleDragEnd = (event) => {
  if (event.target) {
    event.target.style.opacity = '1'
    event.target.classList.remove('dragging')
  }
}

// 处理拖拽进入编辑区域
const handleDragEnter = (event) => {
  event.preventDefault()
  if (editableArea.value) {
    editableArea.value.classList.add('drag-over')
  }
}

// 处理拖拽离开编辑区域
const handleDragLeave = (event) => {
  event.preventDefault()
  // 只有当离开编辑区域本身时才移除样式（不是子元素）
  if (editableArea.value && event.target === editableArea.value) {
    editableArea.value.classList.remove('drag-over')
  }
}

// 处理拖拽悬停
const handleDragOver = (event) => {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'copy'
  if (editableArea.value && !editableArea.value.classList.contains('drag-over')) {
    editableArea.value.classList.add('drag-over')
  }
}

const handleDrop = (event) => {
  event.preventDefault()
  event.stopPropagation()
  
  // 移除拖拽悬停样式
  if (editableArea.value) {
    editableArea.value.classList.remove('drag-over')
  }
  
  // 获取拖拽数据
  let templateData
  try {
    const jsonData = event.dataTransfer.getData('application/json')
    if (jsonData) {
      templateData = JSON.parse(jsonData)
    }
  } catch (e) {
    console.error('解析拖拽数据失败:', e)
    return
  }
  
  if (!templateData) {
    // 尝试从 text/plain 获取（兼容性）
    const textData = event.dataTransfer.getData('text/plain')
    if (textData) {
      try {
        templateData = JSON.parse(textData)
      } catch (e) {
        console.error('解析文本数据失败:', e)
        return
      }
    }
  }
  
  if (templateData) {
    // 移除空占位符
    removeEmptyPlaceholder()
    
    // 获取光标位置
    const selection = window.getSelection()
    let range
    
    if (selection.rangeCount > 0) {
      range = selection.getRangeAt(0)
    } else {
      // 如果没有选择，在末尾插入
      range = document.createRange()
      range.selectNodeContents(editableArea.value)
      range.collapse(false)
      selection.addRange(range)
    }
    
    // 如果模板有 type 属性，根据类型处理
    if (templateData.type === 'title' || templateData.type === 'body' || 
        templateData.type === 'image' || templateData.type === 'divider' || 
        templateData.type === 'nav' || templateData.type === 'table') {
      // 使用 addElementTemplateToEditor，它会处理HTML生成和插入
      addElementTemplateToEditor(templateData)
    } else {
      // 其他类型的模板
      addTemplateToEditor(templateData)
    }
    
    // 触发内容变化
    handleContentChange()
  }
}

// 内容变化处理（优化：防抖处理，减少频繁生成二维码）
let contentChangeTimer = null
let isImageToolbarUpdating = false // 标志位：是否正在更新图片工具栏
let lastImageClickTime = 0 // 记录上次点击图片的时间
const handleContentChange = () => {
  // 如果正在更新图片工具栏，不触发内容变化处理
  if (isImageToolbarUpdating) {
    console.log('[内容变化] 检测到 isImageToolbarUpdating = true，跳过处理')
    return
  }
  
  // 检查是否在点击图片后的短时间内（防止点击图片后触发内容变化）
  const timeSinceLastImageClick = Date.now() - lastImageClickTime
  if (timeSinceLastImageClick < 5000) { // 5秒内不处理内容变化（延长到5秒，确保完全避免重复生成）
    console.log('[内容变化] 检测到最近点击了图片（' + timeSinceLastImageClick + 'ms前），跳过处理')
    return
  }
  
  // 检查当前选中的元素是否是图片容器（防止点击图片后触发内容变化）
  if (editableArea.value) {
    const selection = window.getSelection()
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const container = range.commonAncestorContainer
      const element = container.nodeType === Node.TEXT_NODE ? container.parentElement : container
      if (element) {
        const imageContainer = element.closest('.image-container, .editor-image-content, .image-with-toolbar, .image-selected')
        if (imageContainer) {
          console.log('[内容变化] 检测到选中了图片容器，跳过处理')
          return
        }
      }
    }
    
    // 额外检查：如果编辑区域中有图片处于选中状态，跳过处理
    const selectedImages = editableArea.value.querySelectorAll('.image-selected')
    if (selectedImages.length > 0) {
      console.log('[内容变化] 检测到有图片处于选中状态，跳过处理')
      return
    }
  }
  
  console.log('[内容变化] handleContentChange 被触发')
  
  // 检查是否是因为图片操作导致的内容变化（如果是，完全跳过处理，避免重复生成图片）
  if (editableArea.value) {
    const html = editableArea.value.innerHTML
    // 检查HTML中是否有图片处于选中状态
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = html
    const selectedImages = tempDiv.querySelectorAll('.image-selected')
    if (selectedImages.length > 0) {
      console.log('[内容变化] 检测到HTML中有图片处于选中状态，完全跳过处理，避免重复生成')
      return
    }
    
    // 额外检查：检查HTML中是否有图片容器（即使没有选中状态，也可能是图片操作导致的变化）
    const imageContainers = tempDiv.querySelectorAll('.image-container, .editor-image-content, .image-with-toolbar, .photo-card-item')
    if (imageContainers.length > 0) {
      // 检查最近是否点击了图片（更严格的检查）
      const timeSinceLastImageClick = Date.now() - lastImageClickTime
      if (timeSinceLastImageClick < 10000) { // 10秒内不处理内容变化（更长的保护期）
        console.log('[内容变化] 检测到HTML中有图片容器且最近点击了图片（' + timeSinceLastImageClick + 'ms前），完全跳过处理，避免重复生成')
        return
      }
    }
  }
  
  // 保存内容到editorContent
  if (editableArea.value) {
    const html = editableArea.value.innerHTML
    // 解析HTML内容为块
    parseContentFromHTML(html)
  }
  
  // 更新当前行的标题样式状态
  updateCurrentHeadingStyle()
  
  // 防抖处理：延迟生成二维码，避免频繁触发
  if (contentChangeTimer) {
    clearTimeout(contentChangeTimer)
  }
  contentChangeTimer = setTimeout(() => {
    generateQR()
  }, 300) // 300ms防抖
}

// 从HTML解析内容
const parseContentFromHTML = (html) => {
  if (!html || html.trim() === '') {
    editorContent.value = []
    return
  }
  
  // 简单的HTML解析，将内容转换为块
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html
  
  editorContent.value = []
  Array.from(tempDiv.children).forEach((el, index) => {
    const style = {}
    if (el.style.color) style.color = el.style.color
    if (el.style.fontSize) style.fontSize = el.style.fontSize
    if (el.style.fontWeight) style.fontWeight = el.style.fontWeight
    if (el.style.textAlign) style.textAlign = el.style.textAlign
    
    editorContent.value.push({
      type: el.tagName.toLowerCase() === 'h1' || el.tagName.toLowerCase() === 'h2' ? 'title' : 'text',
      content: el.textContent || el.innerHTML,
      style: style
    })
  })
}

// 粘贴处理
const handlePaste = (event) => {
  event.preventDefault()
  const text = (event.clipboardData || window.clipboardData).getData('text')
  document.execCommand('insertText', false, text)
}


// 生成二维码
const generateQR = async () => {
  if (!qrCanvas.value || generating.value) return
  
  generating.value = true
  // 授权检查
  const isLicensed = await licenseService.checkCurrentLicense()
  if (!isLicensed) {
    showLicenseModal.value = true
    generating.value = false
    return
  }
  
  try {
    // 获取编辑区域的内容
    let htmlContent = ''
    if (editableArea.value) {
      htmlContent = editableArea.value.innerHTML
    }
    
    // 生成页面内容数据
    const contentData = {
      title: pageTitle.value,
      html: htmlContent,
      content: editorContent.value,
      timestamp: Date.now()
    }
    
    // 生成唯一ID
    const liveCodeId = currentLiveCodeId.value || `advanced_${Date.now()}`
    currentLiveCodeId.value = liveCodeId
    
    // 公网API地址（用于生成二维码URL）
    // 优先使用环境变量，否则使用配置的服务器地址
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || getServerBaseUrl()
    
    // 保存到公网API服务器
    try {
      await saveContentToServer(liveCodeId, {
        ...contentData,
        type: 'advanced'
      })
      
      // API连接成功，重置警告标记（如果之前失败过）
      hasShownApiWarning.value = false
      hasShownStorageWarning.value = false // 重置存储警告标记
      hasShownQRError.value = false // 重置二维码错误标记
      
      // 确保canvas存在
      if (!qrCanvas.value) {
        console.warn('二维码画布不存在，尝试重新获取')
        await nextTick()
        if (!qrCanvas.value) {
          console.error('无法获取二维码画布，预览功能可能不可用')
          return
        }
      }
      
      // 生成二维码URL - 使用公网地址
      // 注意：viewer页面在前端服务器，不是API服务器，所以使用getServerBaseUrl()而不是API_BASE_URL
      const VIEWER_BASE_URL = import.meta.env.VITE_VIEWER_BASE_URL || getServerBaseUrl()
      const qrUrl = `${VIEWER_BASE_URL}/advanced-viewer.html#/view/${liveCodeId}`
      
      try {
        // 生成二维码
        await QRCode.toCanvas(qrCanvas.value, qrUrl, {
          width: 300,
          margin: 2,
          errorCorrectionLevel: qrStyle.value.errorLevel,
          color: {
            dark: qrStyle.value.foregroundColor,
            light: qrStyle.value.backgroundColor
          }
        })
        
        // 再次检查 canvas 是否仍然存在
        if (!qrCanvas.value) {
          console.error('二维码生成后画布不存在')
          return
        }
        
        // 发送事件
        const dataURL = qrCanvas.value.toDataURL('image/png')
        const info = {
          type: 'advanced',
          size: 300,
          timestamp: formatDateTime(Date.now(), locale.value),
          content: pageTitle.value || '高级编辑器内容',
          actualContent: qrUrl
        }
        qrInfo.value = info
        emit('qr-generated', {
          dataURL,
          info
        })
        
        console.log('✓ 二维码已生成并显示在预览区域')
      } catch (qrError) {
        console.error('生成二维码到canvas失败:', qrError)
        // 即使二维码生成失败，也不影响其他功能
        if (!hasShownQRError.value) {
          hasShownQRError.value = true
          console.warn('二维码生成失败，但其他功能正常:', qrError.message)
        }
      }
      
    } catch (serverError) {
      console.error('公网API保存失败:', serverError)
      
      // 降级处理：保存到本地存储（但其他设备无法访问）
      // 检查数据大小，优先使用IndexedDB存储大文件
      const contentDataStr = JSON.stringify(contentData)
      const dataSize = contentDataStr.length
      
      try {
        // 如果数据较大（>5MB），优先使用IndexedDB
        if (dataSize > 5 * 1024 * 1024 && isIndexedDBAvailable()) {
          try {
            await storeFileInIndexedDB(liveCodeId, contentData)
            localStorage.setItem(liveCodeId, JSON.stringify({ _indexedDB: true }))
            console.log(`✓ 高级编辑器内容 ${liveCodeId} 已保存到IndexedDB`)
          } catch (indexedDBError) {
            console.warn('IndexedDB存储失败，尝试localStorage:', indexedDBError)
            // 降级到localStorage
            try {
              localStorage.setItem(liveCodeId, contentDataStr)
              console.log(`✓ 高级编辑器内容 ${liveCodeId} 已保存到localStorage`)
            } catch (localStorageError) {
              if (localStorageError.name === 'QuotaExceededError') {
                throw new Error(tt('advancedEditorExtra.storageInsufficientContent'))
              }
              throw localStorageError
            }
          }
        } else {
          // 数据较小，直接使用localStorage
          try {
            localStorage.setItem(liveCodeId, contentDataStr)
            console.log(`✓ 高级编辑器内容 ${liveCodeId} 已保存到localStorage`)
          } catch (localStorageError) {
            if (localStorageError.name === 'QuotaExceededError') {
              // localStorage空间不足，尝试使用IndexedDB
              if (isIndexedDBAvailable()) {
                try {
                  await storeFileInIndexedDB(liveCodeId, contentData)
                  localStorage.setItem(liveCodeId, JSON.stringify({ _indexedDB: true }))
                  console.log(`✓ 高级编辑器内容 ${liveCodeId} 已保存到IndexedDB（localStorage空间不足）`)
                } catch (indexedDBError) {
                  throw new Error(tt('advancedEditorExtra.storageInsufficientContent'))
                }
              } else {
                throw new Error(tt('advancedEditorExtra.storageInsufficientContent'))
              }
            } else {
              throw localStorageError
            }
          }
        }
      } catch (storageError) {
        console.error('本地存储失败:', storageError)
        
        // 只在第一次失败时显示警告，避免重复弹出
        if (!hasShownStorageWarning.value) {
          hasShownStorageWarning.value = true
          alert(tt('advancedEditorExtra.saveToLocalFailed', { msg: storageError.message }))
        } else {
          console.warn('存储失败（警告已显示过，不再重复弹出）:', storageError.message)
        }
        
        // 不抛出错误，允许继续执行（生成二维码仍然可以继续，只是无法保存到本地）
        // 即使存储失败，也要生成二维码供预览使用
      }
      
      // 确保canvas存在，如果不存在则尝试重新获取
      if (!qrCanvas.value) {
        console.warn('二维码画布不存在，尝试重新获取')
        await nextTick()
        if (!qrCanvas.value) {
          console.error('无法获取二维码画布，预览功能可能不可用')
          // 即使canvas不存在，也不阻止其他功能运行
          return
        }
      }
      
      // 获取所有可用的网络地址（降级方案）
      const allAddresses = await getAllNetworkAddresses()
      
      // 生成URL
      let qrUrl = ''
      if (allAddresses.length === 1) {
        qrUrl = `${allAddresses[0]}/advanced-viewer.html#/view/${liveCodeId}`
      } else if (allAddresses.length > 1) {
        // 使用重定向页面
        const liveCodeUrls = allAddresses.map(addr => `${addr}/advanced-viewer.html#/view/${liveCodeId}`)
        qrUrl = `${allAddresses[0]}/redirect.html?id=${encodeURIComponent(liveCodeId)}&addrs=${encodeURIComponent(liveCodeUrls.join(','))}&type=advanced`
      } else {
        // 如果没有可用地址，使用当前页面地址
        const currentUrl = window.location.origin
        qrUrl = `${currentUrl}/advanced-viewer.html#/view/${liveCodeId}`
        console.warn('无法获取网络地址，使用当前页面地址:', qrUrl)
      }
      
      try {
        // 生成二维码到canvas
        await QRCode.toCanvas(qrCanvas.value, qrUrl, {
          width: 300,
          margin: 2,
          errorCorrectionLevel: qrStyle.value.errorLevel,
          color: {
            dark: qrStyle.value.foregroundColor,
            light: qrStyle.value.backgroundColor
          }
        })
        
        // 再次检查 canvas 是否仍然存在
        if (!qrCanvas.value) {
          console.error('二维码生成后画布不存在')
          return
        }
        
        // 生成二维码数据URL
        const dataURL = qrCanvas.value.toDataURL('image/png')
        const info = {
          type: 'advanced',
          size: 300,
          timestamp: formatDateTime(Date.now(), locale.value),
          content: pageTitle.value || '高级编辑器内容',
          actualContent: qrUrl
        }
        qrInfo.value = info
        emit('qr-generated', {
          dataURL,
          info
        })
        
        console.log('✓ 二维码已生成并显示在预览区域')
      } catch (qrError) {
        console.error('生成二维码到canvas失败:', qrError)
        // 即使二维码生成失败，也不影响其他功能
        // 可以尝试使用备用方案或显示错误提示
        if (!hasShownQRError.value) {
          hasShownQRError.value = true
          console.warn('二维码生成失败，但其他功能正常:', qrError.message)
        }
      }
      
      // API连接失败，使用本地存储（仅记录日志，不显示弹窗）
      console.warn('API连接失败，已使用本地存储或生成预览二维码')
    }
  } catch (error) {
    console.error('生成二维码失败:', error)
    console.warn('二维码生成失败:', error.message)
    
    // 确保错误不会影响其他功能
    // 尝试显示错误信息，但不阻止用户继续使用编辑器
    if (!hasShownQRError.value) {
      hasShownQRError.value = true
      // 只在控制台记录，不弹出错误提示，避免影响用户体验
      console.warn('二维码生成遇到问题，但编辑器功能正常，您可以继续编辑内容')
    }
  } finally {
    generating.value = false
  }
}

// 获取所有可用的网络地址（复用批量二维码的逻辑）
const getAllNetworkAddresses = async () => {
  const addresses = []
  const port = window.location.port || '5173'
  
  const currentHost = window.location.hostname
  if (currentHost && currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
    addresses.push(`http://${currentHost}:${port}`)
  }
  
  addresses.push(`http://localhost:${port}`)
  addresses.push(`http://127.0.0.1:${port}`)
  
  try {
    const localIPs = await getLocalIPs()
    localIPs.forEach(ip => {
      if (ip && ip !== '127.0.0.1' && !addresses.some(addr => addr.includes(ip))) {
        addresses.push(`http://${ip}:${port}`)
      }
    })
  } catch (error) {
    console.warn('获取本地IP地址失败:', error)
  }
  
  return [...new Set(addresses)]
}

const getLocalIPs = () => {
  return new Promise((resolve) => {
    const ips = []
    const RTCPeerConnection = window.RTCPeerConnection || 
                             window.mozRTCPeerConnection || 
                             window.webkitRTCPeerConnection
    
    if (!RTCPeerConnection) {
      resolve([])
      return
    }
    
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    })
    
    pc.createDataChannel('')
    
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        const candidate = event.candidate.candidate
        const match = candidate.match(/([0-9]{1,3}(\.[0-9]{1,3}){3})/)
        if (match) {
          const ip = match[1]
          if (isPrivateIP(ip) && !ips.includes(ip)) {
            ips.push(ip)
          }
        }
      }
    }
    
    pc.createOffer()
      .then(offer => pc.setLocalDescription(offer))
      .catch(() => resolve([]))
    
    setTimeout(() => {
      pc.close()
      resolve(ips)
    }, 2000)
  })
}

const isPrivateIP = (ip) => {
  const parts = ip.split('.').map(Number)
  return (
    parts[0] === 10 ||
    (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
    (parts[0] === 192 && parts[1] === 168) ||
    (parts[0] === 169 && parts[1] === 254)
  )
}

// 更新内容
// 显示提示弹窗
const showToastMessage = (message) => {
  toastMessage.value = message
  showToast.value = true
  // 3秒后自动关闭
  setTimeout(() => {
    closeToast()
  }, 3000)
}

// 关闭提示弹窗
const closeToast = () => {
  showToast.value = false
  toastMessage.value = ''
}

// 更新内容
const updateContent = () => {
  if (currentLiveCodeId.value) {
    generateQR()
    showToastMessage('内容已更新！二维码保持不变。')
  }
}

// 打开预览弹窗并自动生成二维码
const openPreviewModal = async () => {
  showPreviewModal.value = true
  // 等待DOM更新后再生成二维码
  await nextTick()
  // 再等待一次确保canvas完全渲染
  await nextTick()
  // 延迟一点确保canvas已挂载
  setTimeout(() => {
    if (qrCanvas.value) {
      generateQR()
    } else {
      console.error('Canvas 仍未找到，请手动点击生成按钮')
    }
  }, 50)
}

// 预览页面
const previewPage = () => {
  if (!currentLiveCodeId.value) {
    alert(tt('advancedEditor.errors.generateFirst'))
    return
  }
  
  try {
    // 检查是否是Electron环境
    const isElectron = typeof window !== 'undefined' && window.electron !== undefined
    
    // 如果是Electron环境，优先使用本地地址预览，避免由于远程服务器未部署viewer导致的白屏
    const baseUrl = isElectron ? window.location.origin : getServerBaseUrl()
    
    // 如果是本地 file:// 协议，baseUrl 可能不包含文件名，需要确保路径指向 correct 的 html
    let finalBaseUrl = baseUrl
    if (isElectron && baseUrl.startsWith('file://')) {
      // 在生产环境下，window.location.origin 可能是 file://
      // 我们需要确保它能找到同级目录下的 advanced-viewer.html
      const currentPath = window.location.pathname
      const dirPath = currentPath.substring(0, currentPath.lastIndexOf('/'))
      finalBaseUrl = `file://${dirPath}`
    }

    // 添加返回来源参数，标识从高级编辑器打开
    const returnUrl = encodeURIComponent(window.location.href)
    const previewUrl = `${finalBaseUrl}/advanced-viewer.html?from=advanced-editor&returnUrl=${returnUrl}#/view/${currentLiveCodeId.value}`
    
    console.log('预览URL:', previewUrl)
    
    if (isElectron) {
      // Electron环境：直接打开，Electron的setWindowOpenHandler会处理
      // 在Electron中，window.open可能返回null，但窗口实际上已经打开
      window.open(previewUrl, '_blank')
      console.log('Electron环境：预览窗口已打开')
    } else {
      // Web环境：检测窗口是否被阻止
      const previewWindow = window.open(previewUrl, '_blank')
      
      // 延迟检测，给窗口一些时间加载
      setTimeout(() => {
        // 检查窗口是否被阻止
        // 注意：如果窗口被阻止，previewWindow为null
        // 如果窗口正常打开，previewWindow是一个Window对象
        if (!previewWindow) {
          // 窗口被阻止
          alert(tt('advancedEditorExtra.previewBlocked', { url: previewUrl }))
        } else {
          // 检查窗口是否被关闭（可能用户立即关闭了）
          try {
            if (previewWindow.closed) {
              console.log('预览窗口已被关闭')
            } else {
              console.log('预览窗口已成功打开')
            }
          } catch (e) {
            // 跨域检查可能失败，但这不影响窗口已打开的事实
            console.log('预览窗口已打开（无法检查状态，可能是跨域限制）')
          }
        }
      }, 500) // 延迟500ms检测
    }
  } catch (error) {
    console.error('预览失败:', error)
    alert(tt('advancedEditor.errors.previewFailed', { reason: error.message }))
  }
}

// 下载二维码
const downloadQR = async () => {
  // 如果canvas不存在，尝试等待一下再检查
  if (!qrCanvas.value) {
    await nextTick()
    if (!qrCanvas.value) {
      console.warn('二维码画布不存在，无法下载')
      alert(tt('advancedEditor.errors.qrNotGenerated'))
      return
    }
  }
  
  try {
    const link = document.createElement('a')
    link.download = `qrcode_${Date.now()}.png`
    link.href = qrCanvas.value.toDataURL('image/png')
    link.click()
  } catch (error) {
    console.error('下载二维码失败:', error)
    alert(tt('advancedEditor.errors.downloadQrFailed', { reason: error.message }))
  }
}

// 添加可变字段（显示类型选择模态框）
const addVariableField = () => {
  showFieldTypeModal.value = true
}

// 根据类型添加字段
const addFieldByType = (type) => {
  if (type === 'text' || type === 'file') {
    // 文本字段和文件字段显示编辑对话框
    editingImageFieldIndex.value = variableFields.value.length
    editingImageField.value = {
      name: '',
      type: type,
      config: {}
    }
    showFieldTypeModal.value = false
    showImageFieldEditModal.value = true
  } else if (type === 'image') {
    // 图片字段需要打开编辑对话框
    editingImageFieldIndex.value = variableFields.value.length
    editingImageField.value = {
      name: '',
      type: 'image',
      config: {
        size: 'original',
        display: 'seamless',
        carouselInterval: 'manual'
      }
    }
    showFieldTypeModal.value = false
    showImageFieldEditModal.value = true
  }
}

// 编辑字段（支持所有类型）
const editImageField = (index) => {
  const field = variableFields.value[index]
  if (field) {
    editingImageFieldIndex.value = index
    if (field.type === 'image') {
      editingImageField.value = {
        name: field.name || '',
        type: 'image',
        config: {
          size: field.config?.size || 'original',
          display: field.config?.display || 'seamless',
          carouselInterval: field.config?.carouselInterval || 'manual'
        }
      }
    } else {
      // 文本字段或文件字段
      editingImageField.value = {
        name: field.name || '',
        type: field.type,
        config: {}
      }
    }
    showImageFieldEditModal.value = true
  }
}

// 确认字段编辑（支持所有类型）
const confirmImageFieldEdit = () => {
  if (!editingImageField.value.name || !editingImageField.value.name.trim()) {
    alert(tt('advancedEditor.errors.fieldNameRequired'))
    return
  }
  
  const fieldData = {
    name: editingImageField.value.name.trim(),
    type: editingImageField.value.type,
    config: editingImageField.value.type === 'image' ? {
      size: editingImageField.value.config.size,
      display: editingImageField.value.config.display,
      carouselInterval: editingImageField.value.config.carouselInterval
    } : {}
  }
  
  if (editingImageFieldIndex.value >= 0 && editingImageFieldIndex.value < variableFields.value.length) {
    // 编辑现有字段
    variableFields.value[editingImageFieldIndex.value] = fieldData
  } else {
    // 添加新字段
    variableFields.value.push(fieldData)
  }
  
  showImageFieldEditModal.value = false
  editingImageFieldIndex.value = -1
}

// 删除可变字段
const removeVariableField = (index) => {
  variableFields.value.splice(index, 1)
}

// 生成默认图片（抽象风景图）
const generateDefaultImage = () => {
  const canvas = document.createElement('canvas')
  canvas.width = 400
  canvas.height = 300
  const ctx = canvas.getContext('2d')
  
  // 绘制浅色背景
  ctx.fillStyle = '#f5f5f0'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  
  // 绘制底部波浪形状（抽象风景）
  const gradient1 = ctx.createLinearGradient(0, 200, 0, 300)
  gradient1.addColorStop(0, '#b3d9ff')
  gradient1.addColorStop(1, '#8cc4ff')
  ctx.fillStyle = gradient1
  ctx.beginPath()
  ctx.moveTo(0, 300)
  ctx.quadraticCurveTo(100, 250, 200, 260)
  ctx.quadraticCurveTo(300, 270, 400, 250)
  ctx.lineTo(400, 300)
  ctx.lineTo(0, 300)
  ctx.fill()
  
  const gradient2 = ctx.createLinearGradient(0, 220, 0, 300)
  gradient2.addColorStop(0, '#a8c5d9')
  gradient2.addColorStop(1, '#7aa8c4')
  ctx.fillStyle = gradient2
  ctx.beginPath()
  ctx.moveTo(0, 300)
  ctx.quadraticCurveTo(150, 240, 300, 250)
  ctx.quadraticCurveTo(350, 255, 400, 240)
  ctx.lineTo(400, 300)
  ctx.lineTo(0, 300)
  ctx.fill()
  
  const gradient3 = ctx.createLinearGradient(0, 230, 0, 300)
  gradient3.addColorStop(0, '#d4c5a9')
  gradient3.addColorStop(1, '#c4b599')
  ctx.fillStyle = gradient3
  ctx.beginPath()
  ctx.moveTo(0, 300)
  ctx.quadraticCurveTo(200, 245, 400, 255)
  ctx.lineTo(400, 300)
  ctx.lineTo(0, 300)
  ctx.fill()
  
  const gradient4 = ctx.createLinearGradient(0, 240, 0, 300)
  gradient4.addColorStop(0, '#c9d4a8')
  gradient4.addColorStop(1, '#b8c497')
  ctx.fillStyle = gradient4
  ctx.beginPath()
  ctx.moveTo(0, 300)
  ctx.quadraticCurveTo(250, 250, 400, 260)
  ctx.lineTo(400, 300)
  ctx.lineTo(0, 300)
  ctx.fill()
  
  const gradient5 = ctx.createLinearGradient(0, 250, 0, 300)
  gradient5.addColorStop(0, '#e8d4b8')
  gradient5.addColorStop(1, '#d8c4a8')
  ctx.fillStyle = gradient5
  ctx.beginPath()
  ctx.moveTo(0, 300)
  ctx.quadraticCurveTo(300, 255, 400, 265)
  ctx.lineTo(400, 300)
  ctx.lineTo(0, 300)
  ctx.fill()
  
  return canvas.toDataURL('image/png')
}

// 插入字段占位符到编辑区域
const insertFieldPlaceholder = (index) => {
  if (!editableArea.value) {
    console.warn('编辑区域不存在')
    return
  }
  
  const field = variableFields.value[index]
  if (!field) {
    console.warn('字段不存在')
    return
  }
  
  // 确保编辑区域获得焦点
  editableArea.value.focus()
  
  try {
    const selection = window.getSelection()
    let range
    
    if (selection.rangeCount > 0) {
      range = selection.getRangeAt(0)
    } else {
      range = document.createRange()
      range.selectNodeContents(editableArea.value)
      range.collapse(false) // 移动到末尾
    }
    
    // 删除选中内容（如果有）
    range.deleteContents()
    
    let placeholderElement
    
    if (field.type === 'file') {
      // 文档字段：显示Word图标卡片
      const div = document.createElement('div')
      div.className = 'field-placeholder field-file-card'
      div.setAttribute('data-field-index', index)
      div.setAttribute('data-field-type', 'file')
      div.contentEditable = 'false'
      div.style.margin = '8px 0'
      div.style.display = 'block'
      div.style.width = '100%'
      div.innerHTML = `
        <div class="field-file-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="2" fill="#2B579A"/>
            <path d="M7 8h10M7 12h10M7 16h6" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="field-file-info">
          <div class="field-file-name">${field.name || '文档名'}</div>
          <div class="field-file-size">0 KB</div>
        </div>
        <span class="field-number-badge">[[${index + 1}]]</span>
      `
      placeholderElement = div
    } else if (field.type === 'image') {
      // 图片字段：插入默认图片（撑满）
      const defaultImageDataURL = generateDefaultImage()
      const imageId = `image_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const div = document.createElement('div')
      div.className = 'field-placeholder field-image-card field-image-fullwidth image-container editor-image-content image-with-toolbar'
      div.setAttribute('data-field-index', index)
      div.setAttribute('data-field-type', 'image')
      div.setAttribute('data-image-id', imageId)
      div.contentEditable = 'false'
      // 使用负margin突破编辑区域的padding限制，实现撑满效果
      div.style.margin = '8px -20px'
      div.style.width = 'calc(100% + 40px)'
      div.style.display = 'block'
      div.style.position = 'relative'
      div.style.boxSizing = 'border-box'
      div.innerHTML = `
        <div class="image-toolbar" style="position: absolute; top: 8px; right: 8px; background: white; border: 1px solid #e0e0e0; border-radius: 4px; padding: 4px; display: none; flex; gap: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); z-index: 10000;">
          <button class="image-toolbar-btn" data-action="move-up" data-image-id="${imageId}" style="padding: 4px 12px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">${tt('advancedEditor.element.moveUp')}</button>
          <button class="image-toolbar-btn" data-action="move-down" data-image-id="${imageId}" style="padding: 4px 12px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">${tt('advancedEditor.element.moveDown')}</button>
          <button class="image-toolbar-btn" data-action="copy" data-image-id="${imageId}" style="padding: 4px 12px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">${tt('advancedEditor.element.copy')}</button>
          <button class="image-toolbar-btn" data-action="delete" data-image-id="${imageId}" style="padding: 4px 12px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">${tt('advancedEditor.element.delete')}</button>
        </div>
        <img src="${defaultImageDataURL}" alt="${tt('advancedEditorExtra.defaultImageAlt')}" style="width: 100%; height: auto; display: block; border-radius: 0;" />
        <span class="field-number-badge" style="position: absolute; top: 4px; right: 4px; background: #fffacd; color: #333; padding: 2px 6px; border-radius: 3px; font-size: 0.75rem; font-weight: 600; line-height: 1.2; z-index: 1;">[[${index + 1}]]</span>
      `
      placeholderElement = div
    } else {
      // 文本字段：保持原来的文本占位符
      const span = document.createElement('span')
      span.className = 'field-placeholder field-text-placeholder'
      span.setAttribute('data-field-index', index)
      span.setAttribute('data-field-type', 'text')
      span.textContent = `[[${index + 1}]]`
      span.contentEditable = 'false'
      placeholderElement = span
    }
    
    // 插入占位符
    range.insertNode(placeholderElement)
    
    // 将光标移到占位符后面
    const newRange = document.createRange()
    newRange.setStartAfter(placeholderElement)
    newRange.collapse(true)
    selection.removeAllRanges()
    selection.addRange(newRange)
    
    // 触发内容变化事件
    handleContentChange()
  } catch (error) {
    console.error('插入占位符失败:', error)
    // 降级方案：使用文本占位符
    try {
      const placeholder = `[[${index + 1}]]`
      document.execCommand('insertText', false, placeholder)
    } catch (e) {
      console.error('降级插入也失败:', e)
    }
  }
}

// 选择图片文件
// 选择图片文件（支持多文件选择）
const selectImageFile = (event) => {
  // 阻止事件冒泡，避免被全局点击事件处理干扰
  if (event) {
    event.stopPropagation()
    event.preventDefault()
  }
  
  try {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = true // 支持多文件选择
    
    input.onchange = (e) => {
      const files = Array.from(e.target.files || [])
      
      if (files.length === 0) {
        console.log('[图片上传] 未选择文件')
        return
      }
      
      // 验证文件类型并读取所有文件
      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp']
      const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp']
      
      let validFiles = []
      let invalidFiles = []
      
      files.forEach(file => {
        const fileType = file.type.toLowerCase()
        const fileName = file.name.toLowerCase()
        const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext))
        
        if (validImageTypes.includes(fileType) || hasValidExtension) {
          validFiles.push(file)
        } else {
          invalidFiles.push(file.name)
        }
      })
      
      if (invalidFiles.length > 0) {
        alert(tt('advancedEditorExtra.invalidImageFormat', { list: invalidFiles.join('\n') }))
      }
      
      if (validFiles.length === 0) {
        return
      }
      
      // 读取所有有效文件
      let loadedCount = 0
      validFiles.forEach((file, index) => {
        console.log('[图片上传] 开始读取文件:', file.name, '大小:', (file.size / 1024).toFixed(2), 'KB')
        
        const reader = new FileReader()
        
        reader.onload = (event) => {
          try {
            const result = event.target?.result
            if (result) {
              imageUploadData.value.push(result)
              loadedCount++
              console.log('[图片上传] 图片读取成功，数据长度:', result.length)
              
              // 自动选中新上传的图片（最后一张）
              selectedImageIndex.value = imageUploadData.value.length - 1
              
              // 所有文件读取完成
              if (loadedCount === validFiles.length) {
                console.log(`[图片上传] 所有图片读取完成，共 ${loadedCount} 张`)
              }
            } else {
              throw new Error(tt('advancedEditorExtra.readResultEmpty'))
            }
          } catch (error) {
            console.error('[图片上传] 处理读取结果失败:', error)
            alert(tt('advancedEditorExtra.imageReadFailedRetry', { name: file.name }))
          }
        }
        
        reader.onerror = (error) => {
          console.error('[图片上传] 文件读取错误:', error)
          alert(tt('advancedEditorExtra.imageReadFailedCorrupt', { name: file.name }))
        }
        
        reader.onabort = () => {
          console.log('[图片上传] 文件读取被取消')
        }
        
        // 开始读取文件
        reader.readAsDataURL(file)
      })
    }
    
    input.oncancel = () => {
      console.log('[图片上传] 用户取消了文件选择')
    }
    
    // 触发文件选择对话框
    input.click()
    
  } catch (error) {
    console.error('[图片上传] 选择文件时发生错误:', error)
    alert(tt('advancedEditor.errors.openFileDialogFailed'))
  }
}

// 选择图片用于预览
const selectImageForPreview = (index) => {
  if (index >= 0 && index < imageUploadData.value.length) {
    selectedImageIndex.value = index
    console.log('[图片预览] 选中图片，索引:', index)
  }
}

// 删除图片
const removeImage = (index) => {
  if (index >= 0 && index < imageUploadData.value.length) {
    imageUploadData.value.splice(index, 1)
    console.log('[图片上传] 删除图片，索引:', index, '剩余图片数:', imageUploadData.value.length)
    
    // 调整选中索引
    if (imageUploadData.value.length === 0) {
      // 如果没有图片了，重置选中索引
      selectedImageIndex.value = 0
    } else if (selectedImageIndex.value >= imageUploadData.value.length) {
      // 如果删除的是最后一张或之后的图片，选中最后一张
      selectedImageIndex.value = imageUploadData.value.length - 1
    } else if (selectedImageIndex.value > index) {
      // 如果删除的图片在当前选中图片之前，索引需要减1
      selectedImageIndex.value--
    }
    // 如果删除的图片就是当前选中的，且不是最后一张，索引保持不变（会自动指向下一张）
    // 如果删除的是最后一张且是当前选中的，上面已经处理了
  }
}

// 选择视频文件
const selectVideoFile = () => {
  if (videoUploading.value) return // 如果正在上传，不允许重复操作
  
  const input = document.createElement('input')
  input.type = 'file'
  // 排除MOV格式，只接受其他视频格式
  input.accept = 'video/mp4,video/avi,video/webm,video/ogg,video/wmv,video/flv,video/mkv,video/m4v'
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // 检查文件扩展名，拒绝MOV格式
      const fileName = file.name.toLowerCase()
      if (fileName.endsWith('.mov')) {
        alert(tt('advancedEditorExtra.movNotSupported'))
        return
      }
      
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        alert(tt('advancedEditor.errors.videoTooLarge'))
        return
      }
      
      // 开始上传，显示加载状态
      videoUploading.value = true
      
      const reader = new FileReader()
      reader.onload = (event) => {
        videoUploadData.value = event.target.result
        videoFileName.value = file.name
        videoUploading.value = false // 上传完成，隐藏加载状态
      }
      reader.onerror = (error) => {
        console.error('文件读取失败:', error)
        alert(tt('advancedEditor.errors.fileReadFailed'))
        videoUploading.value = false // 上传失败，隐藏加载状态
      }
      reader.readAsDataURL(file)
    }
  }
  input.click()
}

// 移除视频文件
const removeVideoFile = () => {
  if (videoUploading.value) return // 如果正在上传，不允许删除
  videoUploadData.value = null
  videoFileName.value = ''
  videoTitle.value = ''
  videoUploading.value = false
}

// 确认视频
const confirmVideo = async () => {
  if (!videoUploadData.value) {
    alert(tt('advancedEditor.errors.uploadVideoFirst'))
    return
  }
  
  if (videoUploading.value) {
    return // 如果正在上传，不允许重复操作
  }
  
  // 开始保存，显示加载状态
  videoUploading.value = true
  
  const videoId = `video_${Date.now()}`
  
  // 获取正确的视频MIME类型
  const getVideoMimeType = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase()
    const mimeTypes = {
      'mp4': 'video/mp4',
      'mov': 'video/quicktime',
      'avi': 'video/x-msvideo',
      'wmv': 'video/x-ms-wmv',
      'flv': 'video/x-flv',
      'webm': 'video/webm',
      'mkv': 'video/x-matroska',
      'm4v': 'video/x-m4v'
    }
    return mimeTypes[ext] || 'video/mp4'
  }
  
  const videoData = {
    type: 'video',
    dataURL: videoUploadData.value, // viewer.html需要dataURL字段
    data: videoUploadData.value,
    fileName: videoFileName.value,
    fileType: getVideoMimeType(videoFileName.value),
    title: videoTitle.value || videoFileName.value,
    timestamp: Date.now()
  }
  
  try {
    console.log('========== 开始保存视频 ==========')
    console.log('视频ID:', videoId)
    console.log('文件名:', videoData.fileName)
    console.log('数据大小:', videoUploadData.value.length, '字符')
    
    // 优先保存到服务器（确保跨设备访问）
    try {
      console.log('步骤1: 检查API服务器可用性...')
      const apiAvailable = await checkApiServer()
      console.log('API服务器检查结果:', apiAvailable ? '✓ 可用' : '✗ 不可用')
      
      if (apiAvailable) {
        console.log('步骤2: API服务器可用，开始保存到服务器...')
        await saveContentToServer(videoId, videoData)
        console.log('步骤3: ✓ 视频已成功保存到服务器')
        
        // 服务器保存成功，同时保存到本地存储作为备份
        try {
          const videoDataStr = JSON.stringify(videoData)
          const dataSize = videoDataStr.length
          
          // 如果数据较大（>5MB），尝试使用IndexedDB
          if (dataSize > 5 * 1024 * 1024 && isIndexedDBAvailable()) {
            try {
              await storeFileInIndexedDB(videoId, videoData)
              localStorage.setItem(videoId, JSON.stringify({ _indexedDB: true }))
              console.log(`✓ 视频 ${videoId} 已同时保存到IndexedDB作为备份`)
            } catch (indexedDBError) {
              console.warn('IndexedDB备份保存失败，使用localStorage:', indexedDBError)
              localStorage.setItem(videoId, videoDataStr)
              console.log(`✓ 视频 ${videoId} 已同时保存到localStorage作为备份`)
            }
          } else {
            localStorage.setItem(videoId, videoDataStr)
            console.log(`✓ 视频 ${videoId} 已同时保存到localStorage作为备份`)
          }
        } catch (backupError) {
          console.warn('本地存储备份失败，但不影响服务器保存:', backupError)
        }
      } else {
        console.warn('API服务器不可用，使用本地存储')
        throw new Error(tt('advancedEditorExtra.apiUnavailableLocalStorage'))
      }
    } catch (serverError) {
      console.warn('保存到服务器失败，降级到本地存储:', serverError)
      
      // 降级到本地存储
      const videoDataStr = JSON.stringify(videoData)
      const dataSize = videoDataStr.length
      
      // 如果数据较大（>5MB），尝试使用IndexedDB
      if (dataSize > 5 * 1024 * 1024 && isIndexedDBAvailable()) {
        try {
          await storeFileInIndexedDB(videoId, videoData)
          localStorage.setItem(videoId, JSON.stringify({ _indexedDB: true }))
          console.log(`✓ 视频 ${videoId} 已保存到IndexedDB`)
        } catch (indexedDBError) {
          console.warn('IndexedDB存储失败，尝试localStorage:', indexedDBError)
          // 继续尝试localStorage
          try {
            localStorage.setItem(videoId, videoDataStr)
            console.log(`✓ 视频 ${videoId} 已保存到localStorage`)
          } catch (localStorageError) {
            if (localStorageError.name === 'QuotaExceededError') {
              throw new Error(tt('advancedEditorExtra.storageInsufficientVideo'))
            }
            throw localStorageError
          }
        }
      } else {
        // 使用localStorage存储
        try {
          localStorage.setItem(videoId, videoDataStr)
          console.log(`✓ 视频 ${videoId} 已保存到localStorage`)
        } catch (localStorageError) {
          if (localStorageError.name === 'QuotaExceededError') {
            throw new Error(tt('advancedEditorExtra.storageInsufficientVideo'))
          }
          throw localStorageError
        }
      }
    }
    
    // 将视频数据保存到当前编辑器内容中，而不是单独保存
    // 这样预览时就能找到视频数据了
    const baseUrl = getServerBaseUrl()
    
    // 检查是否为MOV格式
    const isMOV = videoFileName.value.toLowerCase().endsWith('.mov')
    
    // 根据视频格式生成不同的HTML，并将视频数据嵌入到HTML中
    // 使用data属性保存视频数据，这样预览时可以直接使用
    let html = ''
    if (isMOV) {
      // MOV格式：显示文件下载链接，不显示video标签（避免黑屏）
      html = `<div class="editor-video" data-video-id="${videoId}" style="margin: 16px 0; padding: 20px; background: #f9f9f9; border-radius: 8px; text-align: center;">
        <div style="font-size: 16px; font-weight: bold; color: #333; margin-bottom: 12px;">🎬 ${videoData.title}</div>
        <div style="padding: 20px; background: #fff; border: 2px dashed #ddd; border-radius: 8px; margin-bottom: 12px;">
          <div style="font-size: 48px; margin-bottom: 12px;">📹</div>
          <div style="font-size: 14px; color: #666; margin-bottom: 16px;">${videoFileName.value}</div>
          <a href="${videoUploadData.value}" download="${videoFileName.value}" style="display: inline-block; padding: 10px 24px; background: #2196F3; color: white; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500;">
            ⬇️ 下载视频
          </a>
        </div>
        <div style="padding: 12px; background: #fff3cd; border: 1px solid #ffc107; border-radius: 6px; text-align: left;">
          <p style="margin: 0; color: #856404; font-size: 0.9rem; line-height: 1.5;">
            <strong>⚠️ 提示：</strong>MOV格式在大多数浏览器中无法直接播放，建议下载后使用播放器打开。
          </p>
        </div>
      </div>`
    } else {
      // 其他格式：正常显示video标签，视频数据直接嵌入在src中
      html = `<div class="editor-video" data-video-id="${videoId}" style="margin: 16px 0; padding: 20px; background: #f9f9f9; border-radius: 8px; text-align: center;">
        <div style="font-size: 16px; font-weight: bold; color: #333; margin-bottom: 12px;">🎬 ${videoData.title}</div>
        <video controls style="max-width: 100%; border-radius: 8px;" src="${videoUploadData.value}">
          您的浏览器不支持视频播放。
        </video>
      </div>`
    }
    
    insertHTMLToEditor(html)
    showVideoModal.value = false
    removeVideoFile()
    
    // 生成二维码时，会将整个编辑器内容（包括视频的HTML）保存到currentLiveCodeId
    // 视频数据已经嵌入在HTML的src属性中，所以预览时可以直接使用
    generateQR()
    console.log('========== 视频保存完成 ==========')
  } catch (error) {
    console.error('========== 保存视频失败 ==========')
    console.error('错误类型:', error.name)
    console.error('错误消息:', error.message)
    console.error('错误堆栈:', error.stack)
    
    const errorMessage = error.message || tt('advancedEditorExtra.saveVideoFailedDefault')
    alert(errorMessage)
  } finally {
    // 无论成功或失败，都要隐藏加载状态
    videoUploading.value = false
  }
}

// 选择音频文件
const selectAudioFile = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'audio/*'
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        alert(tt('advancedEditor.errors.audioTooLarge'))
        return
      }
      const reader = new FileReader()
      reader.onload = (event) => {
        audioUploadData.value = event.target.result
        audioFileName.value = file.name
      }
      reader.readAsDataURL(file)
    }
  }
  input.click()
}

// 移除音频文件
const removeAudioFile = () => {
  audioUploadData.value = null
  audioFileName.value = ''
  audioTitle.value = ''
}

// 确认音频
const confirmAudio = async () => {
  if (!audioUploadData.value) {
    alert(tt('advancedEditor.errors.uploadAudioFirst'))
    return
  }
  
  // 保存音频到localStorage
  const audioId = `audio_${Date.now()}`
  const audioData = {
    type: 'audio',
    data: audioUploadData.value,
    fileName: audioFileName.value,
    title: audioTitle.value || audioFileName.value,
    timestamp: Date.now()
  }
  
  try {
    localStorage.setItem(audioId, JSON.stringify(audioData))
    
    const baseUrl = getServerBaseUrl()
    const audioUrl = `${baseUrl}/viewer.html#/view/${audioId}`
    
    let html = `<div class="editor-audio" style="margin: 16px 0; padding: 20px; background: #f9f9f9; border-radius: 8px; text-align: center;">
      <div style="font-size: 16px; font-weight: bold; color: #333; margin-bottom: 12px;">🎵 ${audioData.title}</div>
      <audio controls style="width: 100%; max-width: 500px;">
        <source src="${audioUploadData.value}" type="audio/mpeg">
        您的浏览器不支持音频播放。
      </audio>
    </div>`
    
    insertHTMLToEditor(html)
    showAudioModal.value = false
    removeAudioFile()
    generateQR()
  } catch (error) {
    console.error('保存音频失败:', error)
    alert(tt('advancedEditor.errors.saveAudioFailed'))
  }
}

// 选择文件上传
// 获取文档图标
const getDocumentIcon = (fileName) => {
  if (!fileName) return '📄'
  const ext = fileName.split('.').pop().toLowerCase()
  if (['doc', 'docx'].includes(ext)) return '📘'
  if (['xls', 'xlsx'].includes(ext)) return '📗'
  if (['ppt', 'pptx'].includes(ext)) return '📙'
  if (ext === 'pdf') return '📕'
  return '📄'
}

// 格式化文件大小
const formatFileSizeForDisplay = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

const selectFileUpload = () => {
  // 如果正在上传，禁止重复添加
  if (fileUploading.value) {
    return
  }
  
  const input = document.createElement('input')
  input.type = 'file'
  input.multiple = true // 支持多文件选择
  input.accept = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx'
  input.onchange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) {
      return
    }
    
    // 设置加载状态
    fileUploading.value = true
    
    let loadedCount = 0
    const totalFiles = files.length
    
    files.forEach((file, index) => {
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        alert(tt('advancedEditorExtra.fileTooLarge50mb', { name: file.name }))
        loadedCount++
        if (loadedCount === totalFiles) {
          fileUploading.value = false
        }
        return
      }
      const reader = new FileReader()
      reader.onload = (event) => {
        fileUploadDataList.value.push({
          dataURL: event.target.result,
          fileName: file.name,
          fileSize: formatFileSizeForDisplay(file.size),
          fileSizeBytes: file.size,
          allowDownload: allowFileDownload.value // 使用全局设置
        })
        loadedCount++
        // 所有文件加载完成后，取消加载状态
        if (loadedCount === totalFiles) {
          fileUploading.value = false
        }
      }
      reader.onerror = () => {
        console.error('文件读取失败:', file.name)
        loadedCount++
        if (loadedCount === totalFiles) {
          fileUploading.value = false
        }
      }
      reader.readAsDataURL(file)
    })
  }
  input.click()
}

// 移除指定索引的文件
const removeFileByIndex = (index) => {
  fileUploadDataList.value.splice(index, 1)
}

// 更新所有文件的下载权限
const updateAllFilesDownloadPermission = () => {
  fileUploadDataList.value.forEach(file => {
    file.allowDownload = allowFileDownload.value
  })
}

// 移除所有文件上传
const removeFileUpload = () => {
  fileUploadDataList.value = []
  fileUploadTitle.value = ''
  allowFileDownload.value = true
}

// 确认文件
const confirmFile = async () => {
  if (fileUploadDataList.value.length === 0) {
    alert(tt('advancedEditor.errors.uploadFileFirst'))
    return
  }
  
  // 如果正在上传，禁止重复提交
  if (fileUploading.value) {
    return
  }
  
  // 设置加载状态
  fileUploading.value = true
  
  try {
    // 所有文件作为一个整体元素
    let filesHtml = ''
    const baseTimestamp = Date.now()
    
    // 为每个文件生成HTML并保存
    for (let i = 0; i < fileUploadDataList.value.length; i++) {
      const fileItem = fileUploadDataList.value[i]
      
      // 保存文件到localStorage和服务器
      const fileId = `file_${baseTimestamp}_${i}`
      const fileData = {
        type: 'file',
        data: fileItem.dataURL,
        dataURL: fileItem.dataURL, // viewer.html需要dataURL字段
        fileName: fileItem.fileName,
        fileType: fileItem.fileName.split('.').pop() || 'application/octet-stream', // 添加文件类型
        title: fileUploadTitle.value || fileItem.fileName,
        allowDownload: fileItem.allowDownload !== undefined ? fileItem.allowDownload : allowFileDownload.value,
        timestamp: Date.now()
      }
      
      // 检查数据大小，优先使用IndexedDB存储大文件
      const fileDataStr = JSON.stringify(fileData)
      const dataSize = fileDataStr.length
      
      try {
        // 如果数据较大（>5MB），优先使用IndexedDB
        if (dataSize > 5 * 1024 * 1024 && isIndexedDBAvailable()) {
          try {
            await storeFileInIndexedDB(fileId, fileData)
            localStorage.setItem(fileId, JSON.stringify({ _indexedDB: true }))
            console.log(`✓ 文件 ${fileId} 已保存到IndexedDB`)
          } catch (indexedDBError) {
            console.warn('IndexedDB存储失败，尝试localStorage:', indexedDBError)
            // 降级到localStorage
            try {
              localStorage.setItem(fileId, fileDataStr)
              console.log(`✓ 文件 ${fileId} 已保存到localStorage`)
            } catch (localStorageError) {
              if (localStorageError.name === 'QuotaExceededError') {
                throw new Error(tt('advancedEditorExtra.fileStorageInsufficientName', { name: fileItem.fileName }))
              }
              throw localStorageError
            }
          }
        } else {
          // 数据较小，直接使用localStorage
          try {
            localStorage.setItem(fileId, fileDataStr)
            console.log(`✓ 文件 ${fileId} 已保存到localStorage`)
          } catch (localStorageError) {
            if (localStorageError.name === 'QuotaExceededError') {
              // localStorage空间不足，尝试使用IndexedDB
              if (isIndexedDBAvailable()) {
                try {
                  await storeFileInIndexedDB(fileId, fileData)
                  localStorage.setItem(fileId, JSON.stringify({ _indexedDB: true }))
                  console.log(`✓ 文件 ${fileId} 已保存到IndexedDB（localStorage空间不足）`)
                } catch (indexedDBError) {
                  throw new Error(tt('advancedEditorExtra.fileStorageFailedName', { name: fileItem.fileName }))
                }
              } else {
                throw new Error(tt('advancedEditorExtra.fileStorageInsufficientName2', { name: fileItem.fileName }))
              }
            } else {
              throw localStorageError
            }
          }
        }
      } catch (storageError) {
        console.error('本地存储失败:', storageError)
        throw storageError
      }
      
      // 尝试保存到服务器（确保跨设备访问）
      try {
        await saveContentToServer(fileId, fileData)
        console.log('✓ 文件已保存到服务器:', fileItem.fileName)
      } catch (serverError) {
        console.warn('保存到服务器失败，使用本地存储:', serverError)
        // 服务器保存失败不影响，继续使用本地存储
        // 只在第一个文件失败时在控制台提示一次（不弹窗，避免打断用户）
        if (i === 0) {
          const apiBaseUrl = getServerBaseUrl().replace('/viewer.html', '').replace('/player.html', '')
          console.warn('⚠️ API服务器不可用，文件已保存到本地浏览器存储')
          console.warn('如需跨设备访问，请启动API服务器：')
          console.warn('1. 进入 api-server 目录')
          console.warn('2. 运行: npm start')
          console.warn('   或双击: start.bat (Windows)')
          console.warn('   或运行: start.ps1 (PowerShell)')
          console.warn(`3. 服务器将在 ${apiBaseUrl.replace(/\/$/, '')}:3000 运行`)
        }
      }
      
      const baseUrl = getServerBaseUrl()
      const fileUrl = `${baseUrl}/viewer.html#/view/${fileId}`
      
      // 生成单个文件HTML（标题只在第一个文件显示）
      if (i === 0 && fileUploadTitle.value) {
        filesHtml += `<div style="font-size: 16px; font-weight: bold; color: rgb(51, 51, 51); margin-bottom: 12px; box-shadow: rgb(33, 150, 243) 0px 0px 0px 2px !important;" class="element-hover-highlight">${getDocumentIcon(fileItem.fileName)} ${fileData.title}</div>`
      }
      filesHtml += `<div style="font-size: 14px; color: rgb(102, 102, 102); margin-bottom: 16px; box-shadow: rgb(33, 150, 243) 0px 0px 0px 2px !important;" class="element-hover-highlight">${getDocumentIcon(fileItem.fileName)} ${fileItem.fileName} (${fileItem.fileSize})</div>`
      filesHtml += `<a href="${fileUrl}" target="_blank" style="display: inline-block; padding: 10px 20px; background: #2196F3; color: white; text-decoration: none; border-radius: 4px; font-size: 14px;">${fileData.allowDownload ? '查看并下载' : '查看文件'}</a>`
    }
    
    // 将所有文件包装在一个不可编辑的容器中
    const html = `<div class="editor-file-group" contenteditable="false" style="margin: 16px 0; padding: 20px; background: #f9f9f9; border-radius: 8px; text-align: center; box-shadow: rgb(33, 150, 243) 0px 0px 0px 2px !important;">${filesHtml}</div>`
    
    insertHTMLToEditor(html)
    showFileModal.value = false
    removeFileUpload()
    generateQR()
  } catch (error) {
    console.error('保存文件失败:', error)
    const errorMessage = error.message || (error.name === 'QuotaExceededError' ? tt('advancedEditorExtra.storageInsufficientFileDefault') : tt('advancedEditorExtra.saveFileFailedDefault'))
    alert(errorMessage)
  } finally {
    // 取消加载状态
    fileUploading.value = false
  }
}

// 选择背景图片文件
const selectBackgroundImageFile = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        backgroundSettings.value.backgroundImage = event.target.result
      }
      reader.readAsDataURL(file)
    }
  }
  input.click()
}

// 移除背景图片
const removeBackgroundImage = () => {
  backgroundSettings.value.backgroundImage = null
}

// 确认背景设置
const confirmBackgroundSettings = () => {
  // 应用背景设置到编辑区域
  if (editableArea.value) {
    const bgColor = backgroundSettings.value.backgroundColor || '#ffffff'
    const textColor = backgroundSettings.value.textColor || '#000000'
    const topMargin = backgroundSettings.value.pageTopMargin || 10
    
    editableArea.value.style.backgroundColor = bgColor
    editableArea.value.style.color = textColor
    editableArea.value.style.paddingTop = `${topMargin}px`
    
    if (backgroundSettings.value.backgroundImage) {
      editableArea.value.style.backgroundImage = `url(${backgroundSettings.value.backgroundImage})`
      editableArea.value.style.backgroundSize = 'cover'
      editableArea.value.style.backgroundPosition = 'center'
      editableArea.value.style.backgroundRepeat = 'no-repeat'
    } else {
      editableArea.value.style.backgroundImage = 'none'
    }
  }
  
  showBackgroundModal.value = false
}

// 处理图片设置确定按钮点击（确保事件正确处理）
const handleConfirmImageSettings = (event) => {
  console.log('[确定按钮] ========== handleConfirmImageSettings 被调用 ==========')
  console.log('[确定按钮] 事件对象:', event)
  
  // 立即阻止事件冒泡和默认行为，防止被全局点击事件处理干扰
  if (event) {
    event.stopPropagation()
    event.preventDefault()
    event.stopImmediatePropagation() // 阻止同一元素上的其他监听器
  }
  
  // 使用 setTimeout 确保在全局点击事件之后执行
  setTimeout(() => {
    console.log('[确定按钮] 开始执行 confirmImageSettings')
    confirmImageSettings(event)
  }, 0)
}

// 确认图片设置（优化版本，减少延迟）
const confirmImageSettings = (event) => {
  console.log('[图片设置] ========== 开始执行 confirmImageSettings ==========')
  console.log('[图片设置] 事件对象:', event)
  console.log('[图片设置] imageUploadData.value:', imageUploadData.value ? '有数据，长度: ' + imageUploadData.value.length : '无数据')
  console.log('[图片设置] showImageModal.value:', showImageModal.value)
  console.log('[图片设置] editableArea.value:', editableArea.value ? '存在' : '不存在')
  
  // 检查 editableArea 是否存在
  if (!editableArea.value) {
    console.error('[图片设置] 错误：编辑区域不存在')
    alert(tt('advancedEditor.errors.editorNotReady'))
    return
  }
  
  // 检查是否有图片数据（改为数组）
  if (!imageUploadData.value || imageUploadData.value.length === 0) {
    console.log('[图片设置] 错误：没有上传图片数据')
    alert(tt('advancedEditor.errors.uploadImageFirst'))
    return
  }
  
  // 验证图片数据格式（数组中的每个元素）
  const invalidImages = imageUploadData.value.filter(img => 
    typeof img !== 'string' || !img.startsWith('data:image')
  )
  if (invalidImages.length > 0) {
    console.error('[图片设置] 错误：部分图片数据格式不正确')
    alert(tt('advancedEditor.errors.imageDataInvalid'))
    return
  }
  
  // 允许图片重复添加，移除重复检查
  
  console.log('[图片设置] 开始检查当前行是否已有图片...')
  // 快速检查当前行是否已有图片（优化：只检查直接兄弟元素）
  const selection = window.getSelection()
  let currentLineHasImage = false
  
  if (selection.rangeCount > 0 && editableArea.value) {
    const range = selection.getRangeAt(0)
    const container = range.commonAncestorContainer
    const parentElement = container.nodeType === Node.TEXT_NODE ? container.parentElement : container
    
    if (parentElement && parentElement.parentElement) {
      // 只检查直接兄弟元素，不向上递归（性能优化）
      const siblings = Array.from(parentElement.parentElement.children)
      currentLineHasImage = siblings.some(sibling => {
        return sibling.classList.contains('editor-image-content') || 
               sibling.classList.contains('photo-card-item') ||
               sibling.querySelector('img')
      })
    }
  }
  console.log('[图片设置] 当前行是否已有图片:', currentLineHasImage)
  
  // 生成图片HTML - 根据图片样式设置应用不同的显示方式
  // 获取图片样式设置
  const imageSizeStyle = imageStyle.value.size || 'original' // 'original' | 'fill'
  const imageDisplayStyle = imageStyle.value.display || 'seamless' // 'seamless' | 'spaced' | 'carousel'
  const carouselInterval = imageStyle.value.carouselInterval || 'manual' // 轮播时间
  console.log('[图片设置] 图片样式设置:', imageSizeStyle, '显示方式:', imageDisplayStyle, '轮播时间:', carouselInterval)
  
  let html = ''
  
  // 如果是轮播模式，生成轮播容器
  if (imageDisplayStyle === 'carousel' && imageUploadData.value.length > 1) {
    // 将所有图片数据保存到data属性中
    const imagesData = JSON.stringify(imageUploadData.value.map((src, idx) => ({
      src: src,
      index: idx
    })))
    const carouselData = JSON.stringify({
      images: imageUploadData.value,
      interval: carouselInterval,
      size: imageSizeStyle
    })
    
    // 生成轮播容器HTML
    const containerStyle = imageSizeStyle === 'fill' 
      ? 'margin: 8px -20px; width: calc(100% + 40px); box-sizing: border-box; position: relative;'
      : 'margin: 8px 0; width: 100%; box-sizing: border-box; position: relative;'
    
    // 转义JSON字符串中的特殊字符，用于HTML属性
    const escapedCarouselData = carouselData.replace(/"/g, '&quot;').replace(/'/g, '&#39;')
    
    html += `<div class="image-carousel-container" data-carousel="${escapedCarouselData}" style="${containerStyle}">
      <div class="carousel-image-wrapper" style="position: relative; width: 100%; min-height: 200px; background: #f5f5f5; border-radius: ${imageSizeStyle === 'fill' ? '0' : '8px'}; overflow: hidden;">
        <img class="carousel-image active" src="${imageUploadData.value[0]}" alt="${tt('advancedEditorExtra.carouselImageAlt')}" style="width: 100%; height: auto; display: block; ${imageSizeStyle === 'fill' ? 'border-radius: 0;' : 'border-radius: 8px;'}" />
      </div>
    </div>`
  } else {
    // 非轮播模式，使用原有逻辑
    // 为每个图片生成HTML
    imageUploadData.value.forEach((imageSrc, index) => {
    // 根据图片样式设置决定图片的CSS样式和容器样式
    let imgStyle = ''
    let containerStyle = ''
    
    if (imageSizeStyle === 'original') {
      // 原始大小：保持图片原始尺寸，不强制拉伸，最大宽度100%以适配容器
      imgStyle = 'width: auto; height: auto; max-width: 100%; max-height: 400px; border-radius: 8px; display: block; background: #f5f5f5;'
      containerStyle = 'display: inline-block; margin: 8px 4px; text-align: center; vertical-align: top; box-sizing: border-box; position: relative; max-width: 100%;'
    } else if (imageSizeStyle === 'fill') {
      // 撑满：图片撑满屏幕宽度，突破编辑区域的padding限制
      // 使用负margin来抵消编辑区域的padding(20px)，让图片真正撑满屏幕
      imgStyle = 'width: 100%; max-width: 100%; height: auto; border-radius: 0; display: block; background: #f5f5f5;'
      containerStyle = 'margin: 8px -20px; text-align: left; width: calc(100% + 40px); box-sizing: border-box; position: relative;'
    } else {
      // 默认使用原始大小
      imgStyle = 'width: auto; height: auto; max-width: 100%; max-height: 400px; border-radius: 8px; display: block; background: #f5f5f5;'
      containerStyle = 'display: inline-block; margin: 8px 4px; text-align: center; vertical-align: top; box-sizing: border-box; position: relative; max-width: 100%;'
    }
    
    // 如果当前行已有图片，使用并排样式；否则使用全宽自适应样式
    if (currentLineHasImage || index > 0) {
      console.log('[图片设置] 使用并排显示样式')
      // 并排显示时，撑满模式也需要特殊处理
      if (imageSizeStyle === 'fill') {
        // 并排时，每个图片占50%，但也要突破padding
        containerStyle = 'display: inline-block; width: calc(50% - 4px); margin: 4px 2px; vertical-align: top; box-sizing: border-box; text-align: left; position: relative;'
        imgStyle = 'width: 100%; max-width: 100%; height: auto; border-radius: 8px; display: block; background: #f5f5f5;'
      } else {
        containerStyle = 'display: inline-block; width: calc(50% - 4px); margin: 4px 2px; vertical-align: top; box-sizing: border-box; text-align: center; position: relative;'
      }
      // 并排显示
      const imageId = `image_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      html += `<div class="image-container editor-image-content editor-image-side-by-side image-with-toolbar" data-image-id="${imageId}" style="${containerStyle}">
        <div class="image-toolbar" style="position: absolute; top: 8px; right: 8px; background: white; border: 1px solid #e0e0e0; border-radius: 4px; padding: 4px; display: none; flex; gap: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); z-index: 10000;">
          <button class="image-toolbar-btn" data-action="move-up" data-image-id="${imageId}" style="padding: 4px 12px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">${tt('advancedEditor.element.moveUp')}</button>
          <button class="image-toolbar-btn" data-action="move-down" data-image-id="${imageId}" style="padding: 4px 12px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">${tt('advancedEditor.element.moveDown')}</button>
          <button class="image-toolbar-btn" data-action="copy" data-image-id="${imageId}" style="padding: 4px 12px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">${tt('advancedEditor.element.copy')}</button>
          <button class="image-toolbar-btn" data-action="delete" data-image-id="${imageId}" style="padding: 4px 12px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">${tt('advancedEditor.element.delete')}</button>
        </div>
        <button class="replace-image-btn" onclick="window.replaceImage(this)" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #2196F3; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; opacity: 0; transition: opacity 0.3s; z-index: 10; pointer-events: none;">${tt('advancedEditor.replaceImage')}</button>
        <img src="${imageSrc}" alt="${tt('advancedEditorExtra.imageAltShort')}" style="${imgStyle}" />
      </div>`
    } else {
      console.log('[图片设置] 使用全宽显示样式')
      // 单独显示，为撑满模式添加特殊class以便在viewer中也能正确显示
      const fillClass = imageSizeStyle === 'fill' ? ' image-fill-screen' : ''
      const imageId = `image_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      html += `<div class="image-container editor-image-content editor-image-fullwidth${fillClass} image-with-toolbar" data-image-id="${imageId}" style="${containerStyle}">
        <div class="image-toolbar" style="position: absolute; top: 8px; right: 8px; background: white; border: 1px solid #e0e0e0; border-radius: 4px; padding: 4px; display: none; flex; gap: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); z-index: 10000;">
          <button class="image-toolbar-btn" data-action="move-up" data-image-id="${imageId}" style="padding: 4px 12px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">${tt('advancedEditor.element.moveUp')}</button>
          <button class="image-toolbar-btn" data-action="move-down" data-image-id="${imageId}" style="padding: 4px 12px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">${tt('advancedEditor.element.moveDown')}</button>
          <button class="image-toolbar-btn" data-action="copy" data-image-id="${imageId}" style="padding: 4px 12px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">${tt('advancedEditor.element.copy')}</button>
          <button class="image-toolbar-btn" data-action="delete" data-image-id="${imageId}" style="padding: 4px 12px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">${tt('advancedEditor.element.delete')}</button>
        </div>
        <button class="replace-image-btn" onclick="window.replaceImage(this)" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #2196F3; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; opacity: 0; transition: opacity 0.3s; z-index: 10; pointer-events: none;">${tt('advancedEditor.replaceImage')}</button>
        <img src="${imageSrc}" alt="${tt('advancedEditorExtra.imageAltShort')}" style="${imgStyle}" />
      </div>`
    }
    })
  }
  
  console.log('[图片设置] 生成的HTML长度:', html.length)
  console.log('[图片设置] 开始插入HTML到编辑区域...')
  
  // 再次检查 editableArea 是否存在
  if (!editableArea.value) {
    console.error('[图片设置] 错误：编辑区域在插入时不存在')
    alert(tt('advancedEditor.errors.editorNotReady'))
    return
  }
  
  // 插入HTML到编辑器
  try {
    const result = insertHTMLToEditor(html)
    console.log('[图片设置] HTML插入成功，结果:', result)
    
    // 验证图片是否真的被插入
    setTimeout(() => {
      try {
        if (!editableArea.value) {
          console.error('[图片设置] 验证失败：editableArea 不存在')
          return
        }
        
        // 多种方式查找图片元素
        const insertedImages = editableArea.value.querySelectorAll('.editor-image-content img')
        const allImages = editableArea.value.querySelectorAll('img')
        const imageContainers = editableArea.value.querySelectorAll('.editor-image-content')
        
        console.log('[图片设置] 验证详情：')
        console.log('  - .editor-image-content img 数量:', insertedImages.length)
        console.log('  - 所有 img 元素数量:', allImages.length)
        console.log('  - .editor-image-content 容器数量:', imageContainers.length)
        console.log('  - editableArea 内容长度:', editableArea.value.innerHTML.length)
        
        // 检查最后插入的图片容器
        if (imageContainers.length > 0) {
          const lastContainer = imageContainers[imageContainers.length - 1]
          const imgInContainer = lastContainer.querySelector('img')
          
          if (imgInContainer) {
            const imageSrc = imgInContainer.src || imgInContainer.getAttribute('src') || ''
            const normalizedInserted = imageSrc.trim()
            // 检查是否匹配任意一张上传的图片
            const matchedImage = imageUploadData.value.find(img => {
              const normalizedUploaded = img.trim()
              return normalizedInserted === normalizedUploaded || 
                     normalizedInserted.includes(normalizedUploaded.substring(0, 100)) ||
                     normalizedUploaded.includes(normalizedInserted.substring(0, 100))
            })
            
            console.log('[图片设置] 最后插入的图片容器:', lastContainer.className)
            console.log('[图片设置] 图片源前100字符:', normalizedInserted.substring(0, 100))
            
            if (matchedImage) {
              console.log('[图片设置] ✅ 验证成功：图片已正确插入到编辑器')
            } else {
              console.warn('[图片设置] ⚠️ 图片源不匹配，但图片已插入')
            }
          } else {
            console.warn('[图片设置] ⚠️ 图片容器存在，但内部没有 img 元素')
            console.log('[图片设置] 容器HTML:', lastContainer.outerHTML.substring(0, 200))
          }
        } else if (allImages.length > 0) {
          // 如果找到了图片但没有容器，说明可能插入方式不同
          console.log('[图片设置] ✅ 找到图片元素（', allImages.length, '个），但不在 .editor-image-content 容器中')
          const lastImage = allImages[allImages.length - 1]
          console.log('[图片设置] 最后图片的父元素:', lastImage.parentElement?.className || '无')
        } else {
          console.warn('[图片设置] ❌ 警告：未找到任何图片元素')
          console.log('[图片设置] editableArea 内容预览:', editableArea.value.innerHTML.substring(0, 500))
        }
      } catch (error) {
        console.error('[图片设置] 验证图片插入时出错:', error)
      }
    }, 300)
    
  } catch (error) {
    console.error('[图片设置] HTML插入失败:', error)
    alert(tt('advancedEditorExtra.insertImageFailed', { msg: error.message || tt('dynamicManager.common.unknownError') }))
    return
  }
  
  console.log('[图片设置] 关闭模态框')
  // 延迟关闭模态框，确保插入完成
  setTimeout(() => {
    showImageModal.value = false
    console.log('[图片设置] 模态框已关闭')
  }, 50)
  
  console.log('[图片设置] 异步生成二维码...')
  // 异步生成二维码，不阻塞UI
  nextTick(() => {
    console.log('[图片设置] 开始生成二维码')
    try {
      generateQR()
      console.log('[图片设置] 二维码生成成功')
    } catch (error) {
      console.error('[图片设置] 二维码生成失败:', error)
      // 不阻止流程，二维码生成失败不影响图片插入
    }
    console.log('[图片设置] ========== confirmImageSettings 执行完成 ==========')
  })
}

// 表格选择器函数
const hoverTableGrid = (rows, cols) => {
  hoveredTableRows.value = rows
  hoveredTableCols.value = cols
}

const selectTableSize = (rows, cols) => {
  selectedTableRows.value = rows
  selectedTableCols.value = cols
}

const insertTable = () => {
  if (selectedTableRows.value === 0 || selectedTableCols.value === 0) {
    return
  }
  
  if (!editableArea.value) {
    alert(tt('advancedEditor.errors.editorNotReady'))
    return
  }
  
  // 生成表格HTML，宽度填满编辑区域
  let html = '<table class="editor-table" style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px; border: 1px solid #e0e0e0; table-layout: fixed;">'
  
  // 生成表头（第一行）
  html += '<thead><tr>'
  for (let col = 0; col < selectedTableCols.value; col++) {
    html += `<th contenteditable="true" style="padding: 10px 12px; border: 1px solid #e0e0e0; background: #f5f5f5; font-weight: 500; text-align: left; line-height: 20px; min-height: 44px; vertical-align: middle;">${tt('advancedEditor.tableModal.defaultHeader', { n: col + 1 })}</th>`
  }
  html += '</tr></thead>'
  
  // 生成表体
  html += '<tbody>'
  for (let row = 0; row < selectedTableRows.value - 1; row++) {
    html += '<tr>'
    for (let col = 0; col < selectedTableCols.value; col++) {
      html += `<td contenteditable="true" style="padding: 10px 12px; border: 1px solid #e0e0e0; background: white; line-height: 20px; min-height: 44px; vertical-align: middle;">${tt('advancedEditor.tableModal.defaultCell', { row: row + 1, col: col + 1 })}</td>`
    }
    html += '</tr>'
  }
  html += '</tbody></table>'
  
  // 插入表格到编辑区域
  insertHTMLToEditor(html)
  
  // 关闭模态框并重置选择
  showTableModal.value = false
  selectedTableRows.value = 0
  selectedTableCols.value = 0
  hoveredTableRows.value = 0
  hoveredTableCols.value = 0
}

// 确认联系方式
const confirmContact = () => {
  // 检查是否有内容
  const hasContent = Object.values(contactData.value).some(val => val && val.trim())
  if (!hasContent && !contactData.value.title) {
    alert(tt('advancedEditor.errors.contactRequired'))
    return
  }
  
  let html = '<div class="editor-contact" style="margin: 16px 0; padding: 20px; background: #f9f9f9; border-radius: 8px;">'
  
  if (contactData.value.title) {
    html += `<h3 style="margin-bottom: 16px; font-size: 18px; font-weight: bold; color: #333;">${contactData.value.title}</h3>`
  }
  
  if (contactData.value.phone) {
    html += `<p style="margin: 8px 0; font-size: 14px; color: #666;">📞 电话：<a href="tel:${contactData.value.phone}" style="color: #2196F3;">${contactData.value.phone}</a></p>`
  }
  
  if (contactData.value.wechat) {
    html += `<p style="margin: 8px 0; font-size: 14px; color: #666;">💬 微信：${contactData.value.wechat}</p>`
  }
  
  if (contactData.value.email) {
    html += `<p style="margin: 8px 0; font-size: 14px; color: #666;">📧 邮箱：<a href="mailto:${contactData.value.email}" style="color: #2196F3;">${contactData.value.email}</a></p>`
  }
  
  if (contactData.value.address) {
    html += `<p style="margin: 8px 0; font-size: 14px; color: #666;">📍 地址：${contactData.value.address}</p>`
  }
  
  if (contactData.value.remarks) {
    html += `<p style="margin: 8px 0; font-size: 14px; color: #666;">📝 备注：${contactData.value.remarks}</p>`
  }
  
  html += '</div>'
  
  insertHTMLToEditor(html)
  showContactModal.value = false
  // 清空表单
  contactData.value = { title: '', phone: '', wechat: '', email: '', address: '', remarks: '' }
  generateQR()
}

// 插入地图定位
const insertMapLocation = () => {
  // 这里可以集成地图API，暂时使用占位符
  if (!locationData.value.address) {
    alert(tt('advancedEditor.errors.addressRequired'))
    return
  }
  
  // 使用高德地图或其他地图API生成地图URL
  const mapUrl = `https://uri.amap.com/marker?position=116.397428,39.90923&name=${encodeURIComponent(locationData.value.address)}`
  
  alert(tt('advancedEditor.messages.mapApiPlaceholder'))
}

// 确认位置
const confirmLocation = () => {
  if (!locationData.value.address) {
    alert(tt('advancedEditor.errors.addressRequired'))
    return
  }
  
  let html = `<div class="editor-location" style="margin: 16px 0; padding: 20px; background: #f9f9f9; border-radius: 8px;">
    <div style="font-size: 16px; font-weight: bold; color: #333; margin-bottom: 12px;">📍 位置信息</div>
    <div style="font-size: 14px; color: #666; margin-bottom: 12px;">${locationData.value.address}</div>
    <div style="width: 100%; height: 200px; background: #e0e0e0; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #999;">
      地图加载中...
    </div>
  </div>`
  
  insertHTMLToEditor(html)
  showLocationModal.value = false
  locationData.value.address = ''
  generateQR()
}

// 确认表单列表
const confirmFormList = () => {
  // 检查是否有选中的表单
  const selectedForm = formList.value.find(form => form.selected)
  if (!selectedForm) {
    alert(tt('advancedEditor.errors.selectFormFirst'))
    return
  }
  
  // 清理可能已存在的重复表单组件（基于相同的 component.id）
  if (selectedForm.components && selectedForm.components.length > 0 && editableArea.value) {
    selectedForm.components.forEach(component => {
      // 查找编辑区域中已存在的相同 component.id 的元素
      const existingElements = editableArea.value.querySelectorAll(`[data-component-id="${component.id}"]`)
      existingElements.forEach(el => {
        // 只删除不在 editor-form 容器内的元素（避免删除刚插入的表单内容）
        const formContainer = el.closest('.editor-form')
        if (!formContainer) {
          // 删除整个 form-component-display 容器或包含该元素的父容器
          let elementToRemove = el.closest('.form-component-display')
          if (!elementToRemove) {
            // 如果没有找到 form-component-display，尝试找到包含 data-component-id 的直接父元素
            elementToRemove = el.parentElement
            // 确保不是 editable-area 本身
            while (elementToRemove && elementToRemove !== editableArea.value && !elementToRemove.hasAttribute('data-component-id')) {
              elementToRemove = elementToRemove.parentElement
            }
          }
          if (elementToRemove && elementToRemove.parentNode && elementToRemove !== editableArea.value) {
            elementToRemove.parentNode.removeChild(elementToRemove)
          }
        }
      })
    })
  }
  
  // 渲染表单的所有组件
  let componentsHtml = ''
  if (selectedForm.components && selectedForm.components.length > 0) {
    // 使用临时变量保存当前的selectedComponentId，避免影响渲染
    const originalSelectedId = selectedComponentId.value
    selectedComponentId.value = null // 插入时不需要选中状态
    
    // 渲染每个组件
    selectedForm.components.forEach(component => {
      componentsHtml += renderFormComponentForInsert(component)
    })
    
    selectedComponentId.value = originalSelectedId // 恢复
  } else {
    componentsHtml = '<div style="font-size: 14px; color: #666;">' + tt('advancedEditorExtra.formEmptyHint') + '</div>'
  }
  
  // 添加表单到编辑区域
  let html = `<div class="editor-form" style="margin: 16px 0; padding: 20px; background: #f9f9f9; border-radius: 8px;">
    <div style="font-size: 16px; font-weight: bold; color: #333; margin-bottom: 16px;">📋 ${selectedForm.name}</div>
    ${componentsHtml}
  </div>`
  
  insertHTMLToEditor(html)
  showFormListModal.value = false
  generateQR()
}

// 渲染表单组件（用于插入到编辑区域，不包含选中状态和工具栏）
const renderFormComponentForInsert = (component) => {
  let html = `<div class="form-component-display" data-component-id="${component.id}" style="margin-bottom: 12px; position: relative;">`
  
  html += `<label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 500; color: #333;">${component.label}</label>`
  
  switch (component.type) {
    case 'single-text':
      html += `<input type="text" class="form-input-value" data-component-id="${component.id}" value="${(component.value || '').replace(/"/g, '&quot;')}" placeholder="${component.placeholder || '请输入'}" style="width: 100%; padding: 8px 12px; border: 1px solid #e0e0e0; border-radius: 4px;" />`
      break
    case 'multi-text':
      html += `<textarea class="form-textarea-value" data-component-id="${component.id}" placeholder="${component.placeholder || '请输入'}" style="width: 100%; padding: 8px 12px; border: 1px solid #e0e0e0; border-radius: 4px; min-height: 80px; resize: vertical;">${component.value || ''}</textarea>`
      break
    case 'radio':
      const radioOptions = (component.options || ['选项1', '选项2']).map((opt, idx) => 
        `<label style="display: flex; align-items: center; gap: 4px;"><input type="radio" name="radio_${component.id}" value="${idx}" /> ${opt}</label>`
      ).join('')
      html += `<div style="display: flex; flex-direction: column; gap: 8px;">${radioOptions}</div>`
      break
    case 'checkbox':
      const checkboxOptions = (component.options || ['选项1', '选项2']).map((opt, idx) => 
        `<label style="display: flex; align-items: center; gap: 4px;"><input type="checkbox" value="${idx}" /> ${opt}</label>`
      ).join('')
      html += `<div style="display: flex; flex-direction: column; gap: 8px;">${checkboxOptions}</div>`
      break
    case 'checklist':
      const checklistOptions = (component.options || ['选项1', '选项2']).map((opt, idx) => 
        `<label style="display: flex; align-items: center; gap: 4px;"><input type="checkbox" value="${idx}" /> ${opt}</label>`
      ).join('')
      html += `<div style="display: flex; flex-direction: column; gap: 8px;">${checklistOptions}</div>`
      if (component.placeholder) {
        html += `<div style="margin-top: 8px; font-size: 12px; color: #999;">${component.placeholder}</div>`
      }
      break
    case 'number':
      html += `<input type="number" class="form-input-value" data-component-id="${component.id}" value="${(component.value || '').replace(/"/g, '&quot;')}" placeholder="${component.placeholder || '请输入数字'}" style="width: 100%; padding: 8px 12px; border: 1px solid #e0e0e0; border-radius: 4px;" />`
      break
    case 'date':
      html += `<input type="date" class="form-input-value" data-component-id="${component.id}" value="${(component.value || '').replace(/"/g, '&quot;')}" style="width: 100%; padding: 8px 12px; border: 1px solid #e0e0e0; border-radius: 4px;" />`
      break
    case 'time':
      html += `<input type="time" class="form-input-value" data-component-id="${component.id}" value="${(component.value || '').replace(/"/g, '&quot;')}" style="width: 100%; padding: 8px 12px; border: 1px solid #e0e0e0; border-radius: 4px;" />`
      break
    case 'rating':
      const ratingValue = component.ratingValue !== null ? component.ratingValue : 0
      html += `<div class="rating-stars" data-component-id="${component.id}" style="display: flex; gap: 4px; align-items: center;">
        ${Array(5).fill(0).map((_, i) => {
          const starValue = i + 1
          const isSelected = ratingValue >= starValue
          const starColor = isSelected ? '#FFD700' : '#e0e0e0'
          return `<span class="rating-star" data-rating-value="${starValue}" data-component-id="${component.id}" style="font-size: 24px; color: ${starColor}; cursor: pointer; transition: all 0.2s; user-select: none;">⭐</span>`
        }).join('')}
      </div>`
      break
    case 'nps':
      const npsValue = component.npsValue !== null ? component.npsValue : -1
      html += `<div class="nps-scale" data-component-id="${component.id}" style="display: flex; justify-content: space-between; align-items: center; gap: 4px;">
        <span style="font-size: 14px; color: #666;">0</span>
        ${Array(11).fill(0).map((_, i) => {
          const isSelected = npsValue >= i
          const bgColor = isSelected ? '#2196F3' : '#f5f5f5'
          const textColor = isSelected ? '#ffffff' : '#666666'
          return `<span class="nps-number" data-nps-value="${i}" data-component-id="${component.id}" style="padding: 6px 12px; border: 1px solid ${isSelected ? '#2196F3' : '#e0e0e0'}; border-radius: 4px; cursor: pointer; background-color: ${bgColor}; color: ${textColor}; font-weight: ${isSelected ? 'bold' : 'normal'}; transition: all 0.2s;">${i}</span>`
        }).join('')}
        <span style="font-size: 14px; color: #666;">10</span>
      </div>`
      break
    case 'name':
      html += `<input type="text" class="form-input-value" data-component-id="${component.id}" value="${(component.value || '').replace(/"/g, '&quot;')}" placeholder="${component.placeholder || '请输入姓名'}" style="width: 100%; padding: 8px 12px; border: 1px solid #e0e0e0; border-radius: 4px;" />`
      break
    case 'phone':
      html += `<input type="tel" class="form-input-value" data-component-id="${component.id}" value="${(component.value || '').replace(/"/g, '&quot;')}" placeholder="${component.placeholder || '请输入手机号'}" pattern="[0-9]{11}" maxlength="11" style="width: 100%; padding: 8px 12px; border: 1px solid #e0e0e0; border-radius: 4px;" />`
      break
    case 'id-card':
      html += `<input type="text" class="form-input-value" data-component-id="${component.id}" value="${(component.value || '').replace(/"/g, '&quot;')}" placeholder="${component.placeholder || '请输入身份证号'}" pattern="[0-9Xx]{18}" maxlength="18" style="width: 100%; padding: 8px 12px; border: 1px solid #e0e0e0; border-radius: 4px;" />`
      break
    case 'employee-id':
      html += `<input type="text" class="form-input-value" data-component-id="${component.id}" value="${(component.value || '').replace(/"/g, '&quot;')}" placeholder="${component.placeholder || '请输入工号'}" style="width: 100%; padding: 8px 12px; border: 1px solid #e0e0e0; border-radius: 4px;" />`
      break
    case 'gender':
      const genderValue = component.value || ''
      html += `<div class="form-gender-radio" data-component-id="${component.id}" style="display: flex; gap: 16px;"><label style="display: flex; align-items: center; gap: 4px;"><input type="radio" name="gender_${component.id}" value="male" ${genderValue === 'male' ? 'checked' : ''} /> ${tt('advancedEditorExtra.male')}</label><label style="display: flex; align-items: center; gap: 4px;"><input type="radio" name="gender_${component.id}" value="female" ${genderValue === 'female' ? 'checked' : ''} /> ${tt('advancedEditorExtra.female')}</label></div>`
      break
    case 'address':
      html += `<input type="text" class="form-input-value" data-component-id="${component.id}" value="${(component.value || '').replace(/"/g, '&quot;')}" placeholder="${component.placeholder || '请输入地址'}" style="width: 100%; padding: 8px 12px; border: 1px solid #e0e0e0; border-radius: 4px;" />`
      break
    case 'location':
      html += `<div class="form-location-display" data-component-id="${component.id}" style="padding: 12px; background: #f5f5f5; border-radius: 4px; font-size: 14px; color: #666;">📍 定位信息</div>`
      break
    case 'title':
      html += `<div class="form-title-display" data-component-id="${component.id}" style="font-size: 18px; font-weight: bold; color: #333; padding: 8px 0;">${component.label}</div>`
      break
    case 'age':
      html += `<input type="number" class="form-input-value" data-component-id="${component.id}" value="${(component.value || '').replace(/"/g, '&quot;')}" placeholder="${component.placeholder || '请输入年龄'}" min="0" max="150" style="width: 100%; padding: 8px 12px; border: 1px solid #e0e0e0; border-radius: 4px;" />`
      break
    case 'license-plate':
      html += `<input type="text" class="form-input-value" data-component-id="${component.id}" value="${(component.value || '').replace(/"/g, '&quot;')}" placeholder="${component.placeholder || '请输入车牌号'}" style="width: 100%; padding: 8px 12px; border: 1px solid #e0e0e0; border-radius: 4px;" />`
      break
    case 'form-image':
      const imageUrl = component.imageUrl || ''
      if (imageUrl) {
        html += `<div class="form-image-display" data-component-id="${component.id}" style="text-align: center; margin: 10px 0;">
          <img src="${imageUrl}" alt="图片" style="max-width: 100%; border-radius: 4px; display: block; margin: 0 auto;" />
        </div>`
      } else {
        html += `<div style="padding: 20px; border: 1px dashed #ccc; text-align: center; color: #999; border-radius: 4px;">${tt('advancedEditorExtra.noImageYet')}</div>`
      }
      break
    default:
      html += `<div style="font-size: 14px; color: #999;">${tt('advancedEditorExtra.unknownComponentType')}</div>`
  }
  
  html += `</div>`
  return html
}

// 创建表单相关函数
const addFormComponent = (type) => {
  const component = {
    type: type,
    id: Date.now(),
    label: getComponentLabel(type),
    required: false,
    placeholder: '',
    content: '', // 附加内容
    autoFill: false, // 自动填充上次填写的内容
    imageUrl: '', // 为图片组件添加imageUrl属性
    npsValue: null, // NPS量表选中的值
    ratingValue: null, // 评分选中的值（1-5）
    value: '', // 输入框的值
    options: type === 'radio' || type === 'checkbox' || type === 'checklist'
      ? [
          tt('advancedEditor.formEditor.optionPlaceholder', { index: 1 }),
          tt('advancedEditor.formEditor.optionPlaceholder', { index: 2 })
        ]
      : [] // 单选框、多选框和检查项的选项数组
  }
  formComponents.value.push(component)
  
  // 自动将组件模板加载到编辑区域
  nextTick(() => {
    // 生成组件的 HTML 模板（不包含工具栏和选中状态）
    let templateHtml = `<div style="margin-bottom: 12px;">`
    templateHtml += `<label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 500; color: #333;">${component.label}</label>`
    
    // 根据组件类型生成对应的输入元素
    switch (component.type) {
      case 'single-text':
        templateHtml += `<input type="text" class="preview-input-value" data-component-id="${component.id}" value="${(component.value || '').replace(/"/g, '&quot;')}" placeholder="${component.placeholder || tt('advancedEditor.formEditor.todoFill')}" style="width: 100%; padding: 8px 12px; border: 1px solid #e0e0e0; border-radius: 4px;" />`
        break
      case 'multi-text':
        templateHtml += `<textarea class="preview-textarea-value" data-component-id="${component.id}" placeholder="${component.placeholder || tt('advancedEditor.formEditor.todoFill')}" style="width: 100%; padding: 8px 12px; border: 1px solid #e0e0e0; border-radius: 4px; min-height: 80px; resize: vertical;">${component.value || ''}</textarea>`
        break
      case 'radio':
        const radioOptions = (component.options || ['选项1', '选项2']).map((opt, idx) => 
          `<label><input type="radio" name="radio_${component.id}" value="${idx}" /> ${opt}</label>`
        ).join('')
        templateHtml += `<div style="display: flex; flex-direction: column; gap: 8px;">${radioOptions}</div>`
        break
      case 'checkbox':
        const checkboxOptions = (component.options || ['选项1', '选项2']).map((opt, idx) => 
          `<label><input type="checkbox" value="${idx}" /> ${opt}</label>`
        ).join('')
        templateHtml += `<div style="display: flex; flex-direction: column; gap: 8px;">${checkboxOptions}</div>`
        break
      case 'checklist':
        const checklistOptions = (component.options || ['选项1', '选项2']).map((opt, idx) => 
          `<label><input type="checkbox" value="${idx}" /> ${opt}</label>`
        ).join('')
        templateHtml += `<div style="display: flex; flex-direction: column; gap: 8px;">${checklistOptions}</div>`
        if (component.placeholder) {
          templateHtml += `<div style="margin-top: 8px; font-size: 12px; color: #999;">${component.placeholder}</div>`
        }
        break
      case 'number':
        templateHtml += `<input type="number" class="preview-input-value" data-component-id="${component.id}" value="${(component.value || '').replace(/"/g, '&quot;')}" placeholder="${component.placeholder || tt('advancedEditorExtra.todoFillPlaceholder')}" style="width: 100%; padding: 8px 12px; border: 1px solid #e0e0e0; border-radius: 4px;" />`
        break
      case 'date':
        templateHtml += `<input type="date" class="preview-input-value" data-component-id="${component.id}" value="${(component.value || '').replace(/"/g, '&quot;')}" style="width: 100%; padding: 8px 12px; border: 1px solid #e0e0e0; border-radius: 4px;" />`
        break
      case 'time':
        templateHtml += `<input type="time" class="preview-input-value" data-component-id="${component.id}" value="${(component.value || '').replace(/"/g, '&quot;')}" style="width: 100%; padding: 8px 12px; border: 1px solid #e0e0e0; border-radius: 4px;" />`
        break
      case 'rating':
        const ratingValue = component.ratingValue !== null ? component.ratingValue : 0
        templateHtml += `<div class="editable-rating-wrapper" data-component-id="${component.id}" data-component-type="rating" style="position: relative; margin-bottom: 12px; padding: 8px; border: 1px solid transparent; border-radius: 4px;">
          <div class="editable-rating-toolbar" style="position: absolute; top: -40px; right: 0; background: white; border: 1px solid #e0e0e0; border-radius: 4px; padding: 4px; display: none; flex; gap: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); z-index: 100;">
            <button class="editable-toolbar-btn" data-action="move-up" data-component-id="${component.id}" style="padding: 4px 12px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">${tt('advancedEditor.element.moveUp')}</button>
            <button class="editable-toolbar-btn" data-action="move-down" data-component-id="${component.id}" style="padding: 4px 12px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">${tt('advancedEditor.element.moveDown')}</button>
            <button class="editable-toolbar-btn" data-action="copy" data-component-id="${component.id}" style="padding: 4px 12px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">${tt('advancedEditor.element.copy')}</button>
            <button class="editable-toolbar-btn" data-action="delete" data-component-id="${component.id}" style="padding: 4px 12px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">${tt('advancedEditor.element.delete')}</button>
          </div>
          <div class="rating-stars" data-component-id="${component.id}" style="display: flex; gap: 4px; align-items: center;">
            ${Array(5).fill(0).map((_, i) => {
              const starValue = i + 1
              const isSelected = ratingValue >= starValue
              const starColor = isSelected ? '#FFD700' : '#e0e0e0'
              return `<span class="rating-star" data-rating-value="${starValue}" data-component-id="${component.id}" style="font-size: 24px; color: ${starColor}; cursor: pointer; transition: all 0.2s; user-select: none;">⭐</span>`
            }).join('')}
          </div>
        </div>`
        break
      case 'nps':
        const npsValue = component.npsValue !== null ? component.npsValue : -1
        templateHtml += `<div class="nps-scale" data-component-id="${component.id}" style="display: flex; justify-content: space-between; align-items: center; gap: 4px;">
          <span style="font-size: 14px; color: #666;">0</span>
          ${Array(11).fill(0).map((_, i) => {
            const isSelected = npsValue >= i
            const bgColor = isSelected ? '#2196F3' : '#f5f5f5'
            const textColor = isSelected ? '#ffffff' : '#666666'
            return `<span class="nps-number" data-nps-value="${i}" data-component-id="${component.id}" style="padding: 6px 12px; border: 1px solid ${isSelected ? '#2196F3' : '#e0e0e0'}; border-radius: 4px; cursor: pointer; background-color: ${bgColor}; color: ${textColor}; font-weight: ${isSelected ? 'bold' : 'normal'}; transition: all 0.2s;">${i}</span>`
          }).join('')}
          <span style="font-size: 14px; color: #666;">10</span>
        </div>`
        break
      case 'name':
        templateHtml += `<input type="text" class="preview-input-value" data-component-id="${component.id}" value="${(component.value || '').replace(/"/g, '&quot;')}" placeholder="${component.placeholder || tt('advancedEditorExtra.todoFillPlaceholder')}" style="width: 100%; padding: 8px 12px; border: 1px solid #e0e0e0; border-radius: 4px;" />`
        break
      case 'phone':
        templateHtml += `<input type="tel" class="preview-input-value" data-component-id="${component.id}" value="${(component.value || '').replace(/"/g, '&quot;')}" placeholder="${component.placeholder || tt('advancedEditorExtra.todoFillPlaceholder')}" pattern="[0-9]{11}" maxlength="11" style="width: 100%; padding: 8px 12px; border: 1px solid #e0e0e0; border-radius: 4px;" />`
        break
      case 'id-card':
        templateHtml += `<input type="text" class="preview-input-value" data-component-id="${component.id}" value="${(component.value || '').replace(/"/g, '&quot;')}" placeholder="${component.placeholder || tt('advancedEditorExtra.todoFillPlaceholder')}" pattern="[0-9Xx]{18}" maxlength="18" style="width: 100%; padding: 8px 12px; border: 1px solid #e0e0e0; border-radius: 4px;" />`
        break
      case 'employee-id':
        templateHtml += `<input type="text" class="preview-input-value" data-component-id="${component.id}" value="${(component.value || '').replace(/"/g, '&quot;')}" placeholder="${component.placeholder || tt('advancedEditorExtra.todoFillPlaceholder')}" style="width: 100%; padding: 8px 12px; border: 1px solid #e0e0e0; border-radius: 4px;" />`
        break
      case 'gender':
        const genderValue = component.value || ''
        templateHtml += `<div class="preview-gender-radio" data-component-id="${component.id}" style="display: flex; gap: 16px;"><label style="display: flex; align-items: center; gap: 4px;"><input type="radio" name="gender_${component.id}" value="male" ${genderValue === 'male' ? 'checked' : ''} /> ${tt('advancedEditorExtra.male')}</label><label style="display: flex; align-items: center; gap: 4px;"><input type="radio" name="gender_${component.id}" value="female" ${genderValue === 'female' ? 'checked' : ''} /> ${tt('advancedEditorExtra.female')}</label></div>`
        break
      case 'age':
        templateHtml += `<input type="number" class="preview-input-value" data-component-id="${component.id}" value="${(component.value || '').replace(/"/g, '&quot;')}" placeholder="${component.placeholder || tt('advancedEditorExtra.todoFillPlaceholder')}" min="0" max="150" style="width: 100%; padding: 8px 12px; border: 1px solid #e0e0e0; border-radius: 4px;" />`
        break
      case 'license-plate':
        templateHtml += `<input type="text" class="preview-input-value" data-component-id="${component.id}" value="${(component.value || '').replace(/"/g, '&quot;')}" placeholder="${component.placeholder || tt('advancedEditorExtra.todoFillPlaceholder')}" style="width: 100%; padding: 8px 12px; border: 1px solid #e0e0e0; border-radius: 4px;" />`
        break
      case 'address':
        templateHtml += `<input type="text" class="preview-input-value" data-component-id="${component.id}" value="${(component.value || '').replace(/"/g, '&quot;')}" placeholder="${component.placeholder || '请输入地址'}" style="width: 100%; padding: 8px 12px; border: 1px solid #e0e0e0; border-radius: 4px;" />`
        break
      case 'title':
        templateHtml += `<input type="text" class="preview-input-value" data-component-id="${component.id}" value="${(component.value || '').replace(/"/g, '&quot;')}" placeholder="${component.placeholder || tt('advancedEditor.formEditor.placeholders.title')}" style="width: 100%; padding: 8px 12px; border: 1px solid #e0e0e0; border-radius: 4px;" />`
        break
      case 'location':
        templateHtml += `<input type="text" class="preview-input-value" data-component-id="${component.id}" value="${(component.value || '').replace(/"/g, '&quot;')}" placeholder="${component.placeholder || '请输入定位地址'}" style="width: 100%; padding: 8px 12px; border: 1px solid #e0e0e0; border-radius: 4px;" />`
        break
      case 'form-image':
        const imageUrl = component.imageUrl || ''
        templateHtml += `<div class="form-image-upload" data-component-id="${component.id}" style="border: 2px dashed #e0e0e0; border-radius: 8px; padding: 20px; text-align: center; background: #fafafa; cursor: pointer; position: relative; min-height: 150px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
          ${imageUrl ? `
            <img src="${imageUrl}" alt="${tt('advancedEditorExtra.uploadedImageAlt')}" style="max-width: 100%; max-height: 300px; border-radius: 4px; margin-bottom: 8px; pointer-events: none;" />
            <div style="color: #2196F3; font-size: 14px; margin-top: 8px; pointer-events: none;">${tt('advancedEditor.clickReplaceImage')}</div>
          ` : `
            <div style="font-size: 48px; margin-bottom: 12px; pointer-events: none;">🖼️</div>
            <div style="color: #666; font-size: 14px; margin-bottom: 4px; pointer-events: none;">${tt('advancedEditorExtra.clickUploadImageHint')}</div>
            <div style="color: #999; font-size: 12px; pointer-events: none;">${tt('advancedEditorExtra.imageFormatHint')}</div>
          `}
          <input type="file" accept="image/*" value="" style="position: absolute; opacity: 0; width: 100%; height: 100%; top: 0; left: 0; cursor: pointer; z-index: 10;" class="form-image-input" data-component-id="${component.id}" />
        </div>`
        break
      default:
        templateHtml += `<div style="padding: 8px; background: #f5f5f5; border-radius: 4px; color: #999;">${component.label}</div>`
    }
    
    templateHtml += `</div>`
    
    // 注意：表单组件不应该插入到主编辑区域，只显示在表单编辑器的预览区域
    // 表单内容只有在用户点击"确定"插入表单时才会被插入到主编辑区域
    // insertHTMLToEditor(templateHtml) // 已移除，避免重复插入
    // generateQR() // 已移除，表单编辑时不需要生成二维码
  })
}

const getComponentLabel = (type) => {
  const labels = {
    'single-text': tt('advancedEditor.formComponents.items.singleText'),
    'multi-text': tt('advancedEditor.formComponents.items.multiText'),
    'radio': tt('advancedEditor.formComponents.items.radio'),
    'checkbox': tt('advancedEditor.formComponents.items.checkbox'),
    'number': tt('advancedEditor.formComponents.items.number'),
    'date': tt('advancedEditor.formComponents.items.date'),
    'time': tt('advancedEditor.formComponents.items.time'),
    'rating': tt('advancedEditor.formComponents.items.rating'),
    'nps': tt('advancedEditor.formComponents.items.nps'),
    'checklist': tt('advancedEditor.formComponents.items.checklist'),
    'location': tt('advancedEditor.formComponents.items.location'),
    'address': tt('advancedEditor.formComponents.items.address'),
    'title': tt('advancedEditor.formComponents.items.title'),
    'name': tt('advancedEditor.formComponents.items.name'),
    'phone': tt('advancedEditor.formComponents.items.phone'),
    'id-card': tt('advancedEditor.formComponents.items.idCard'),
    'employee-id': tt('advancedEditor.formComponents.items.employeeId'),
    'gender': tt('advancedEditor.formComponents.items.gender'),
    'age': tt('advancedEditor.formComponents.items.age'),
    'license-plate': tt('advancedEditor.formComponents.items.licensePlate'),
    'form-image': tt('advancedEditor.formComponents.items.image')
  }
  return labels[type] || tt('advancedEditor.formComponents.items.component')
}

// 表单组件 HTML 计算属性（确保响应式更新）
const formComponentsHtml = computed(() => {
  return formComponents.value.map(component => renderFormComponent(component))
})

// 表单组件显示（使用函数返回HTML字符串）
const renderFormComponent = (component) => {
  const isSelected = selectedComponentId.value === component.id
  let html = `<div class="form-component-display" data-component-id="${component.id}" style="margin-bottom: 12px; position: relative; ${isSelected ? 'border: 2px solid #2196F3; border-radius: 8px; padding: 8px; padding-top: 48px;' : ''}">`
  
  // 工具栏（仅在选中时显示）
  if (isSelected) {
    const componentIndex = formComponents.value.findIndex(c => c.id === component.id)
    const isFirst = componentIndex === 0
    const isLast = componentIndex === formComponents.value.length - 1
    
    html += `<div class="form-component-toolbar" style="position: absolute; top: 8px; right: 8px; background: white; border: 1px solid #e0e0e0; border-radius: 4px; padding: 4px; display: flex; gap: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); z-index: 100;">
      <button class="form-toolbar-btn" data-action="move-up" data-component-id="${component.id}" ${isFirst ? 'disabled' : ''} style="padding: 4px 12px; background: ${isFirst ? '#ccc' : '#4CAF50'}; color: white; border: none; border-radius: 4px; cursor: ${isFirst ? 'not-allowed' : 'pointer'}; font-size: 12px; opacity: ${isFirst ? '0.6' : '1'};">${tt('advancedEditor.element.moveUp')}</button>
      <button class="form-toolbar-btn" data-action="move-down" data-component-id="${component.id}" ${isLast ? 'disabled' : ''} style="padding: 4px 12px; background: ${isLast ? '#ccc' : '#4CAF50'}; color: white; border: none; border-radius: 4px; cursor: ${isLast ? 'not-allowed' : 'pointer'}; font-size: 12px; opacity: ${isLast ? '0.6' : '1'};">${tt('advancedEditor.element.moveDown')}</button>
      <button class="form-toolbar-btn" data-action="copy" data-component-id="${component.id}" style="padding: 4px 12px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">${tt('advancedEditor.element.copy')}</button>
      <button class="form-toolbar-btn" data-action="delete" data-component-id="${component.id}" style="padding: 4px 12px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">${tt('advancedEditor.element.delete')}</button>
    </div>`
  }
  
  html += `<label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 500; color: #333;">${component.label}</label>`
  
  switch (component.type) {
    case 'single-text':
      html += `<input type="text" class="form-input-value" data-component-id="${component.id}" value="${(component.value || '').replace(/"/g, '&quot;')}" placeholder="${component.placeholder || '请输入'}" style="width: 100%; padding: 8px 12px; border: 1px solid #e0e0e0; border-radius: 4px;" />`
      break
    case 'multi-text':
      html += `<textarea class="form-textarea-value" data-component-id="${component.id}" placeholder="${component.placeholder || '请输入'}" style="width: 100%; padding: 8px 12px; border: 1px solid #e0e0e0; border-radius: 4px; min-height: 80px; resize: vertical;">${component.value || ''}</textarea>`
      break
    case 'radio':
      const radioOptions = (component.options || ['选项1', '选项2']).map((opt, idx) => 
        `<label class="option-label" style="display: flex; align-items: center; gap: 4px; position: relative; cursor: pointer;" data-component-id="${component.id}" data-option-index="${idx}"><input type="radio" name="radio_${component.id}" value="${idx}" /> ${opt}</label>`
      ).join('')
      html += `<div style="display: flex; flex-direction: column; gap: 8px;">${radioOptions}</div>`
      break
    case 'checkbox':
      const checkboxOptions = (component.options || ['选项1', '选项2']).map((opt, idx) => 
        `<label class="option-label" style="display: flex; align-items: center; gap: 4px; position: relative; cursor: pointer;" data-component-id="${component.id}" data-option-index="${idx}"><input type="checkbox" value="${idx}" /> ${opt}</label>`
      ).join('')
      html += `<div style="display: flex; flex-direction: column; gap: 8px;">${checkboxOptions}</div>`
      break
    case 'checklist':
      const checklistOptions = (component.options || ['选项1', '选项2']).map((opt, idx) => 
        `<label class="option-label" style="display: flex; align-items: center; gap: 4px; position: relative; cursor: pointer;" data-component-id="${component.id}" data-option-index="${idx}"><input type="checkbox" value="${idx}" /> ${opt}</label>`
      ).join('')
      html += `<div style="display: flex; flex-direction: column; gap: 8px;">${checklistOptions}</div>`
      if (component.placeholder) {
        html += `<div style="margin-top: 8px; font-size: 12px; color: #999;">${component.placeholder}</div>`
      }
      break
    case 'number':
      html += `<input type="number" class="form-input-value" data-component-id="${component.id}" value="${(component.value || '').replace(/"/g, '&quot;')}" placeholder="${component.placeholder || '请输入数字'}" style="width: 100%; padding: 8px 12px; border: 1px solid #e0e0e0; border-radius: 4px;" />`
      break
    case 'date':
      html += `<input type="date" class="form-input-value" data-component-id="${component.id}" value="${(component.value || '').replace(/"/g, '&quot;')}" style="width: 100%; padding: 8px 12px; border: 1px solid #e0e0e0; border-radius: 4px;" />`
      break
    case 'time':
      html += `<input type="time" class="form-input-value" data-component-id="${component.id}" value="${(component.value || '').replace(/"/g, '&quot;')}" style="width: 100%; padding: 8px 12px; border: 1px solid #e0e0e0; border-radius: 4px;" />`
      break
    case 'rating':
      const ratingValue = component.ratingValue !== null ? component.ratingValue : 0
      html += `<div class="rating-stars" data-component-id="${component.id}" style="display: flex; gap: 4px; align-items: center;">
        ${Array(5).fill(0).map((_, i) => {
          const starValue = i + 1
          const isSelected = ratingValue >= starValue
          const starColor = isSelected ? '#FFD700' : '#e0e0e0'
          return `<span class="rating-star" data-rating-value="${starValue}" data-component-id="${component.id}" style="font-size: 24px; color: ${starColor}; cursor: pointer; transition: all 0.2s; user-select: none;">⭐</span>`
        }).join('')}
      </div>`
      break
    case 'nps':
      const npsValue = component.npsValue !== null ? component.npsValue : -1
      html += `<div class="nps-scale" data-component-id="${component.id}" style="display: flex; justify-content: space-between; align-items: center; gap: 4px;">
        <span style="font-size: 14px; color: #666;">0</span>
        ${Array(11).fill(0).map((_, i) => {
          const isSelected = npsValue >= i
          const bgColor = isSelected ? '#2196F3' : '#f5f5f5'
          const textColor = isSelected ? '#ffffff' : '#666666'
          return `<span class="nps-number" data-nps-value="${i}" data-component-id="${component.id}" style="padding: 6px 12px; border: 1px solid ${isSelected ? '#2196F3' : '#e0e0e0'}; border-radius: 4px; cursor: pointer; background-color: ${bgColor}; color: ${textColor}; font-weight: ${isSelected ? 'bold' : 'normal'}; transition: all 0.2s;">${i}</span>`
        }).join('')}
        <span style="font-size: 14px; color: #666;">10</span>
      </div>`
      break
    case 'name':
      html += `<input type="text" class="form-input-value" data-component-id="${component.id}" value="${(component.value || '').replace(/"/g, '&quot;')}" placeholder="${component.placeholder || '请输入姓名'}" style="width: 100%; padding: 8px 12px; border: 1px solid #e0e0e0; border-radius: 4px;" />`
      break
    case 'phone':
      html += `<input type="tel" class="form-input-value" data-component-id="${component.id}" value="${(component.value || '').replace(/"/g, '&quot;')}" placeholder="${component.placeholder || '请输入手机号'}" pattern="[0-9]{11}" maxlength="11" style="width: 100%; padding: 8px 12px; border: 1px solid #e0e0e0; border-radius: 4px;" />`
      break
    case 'id-card':
      html += `<input type="text" class="form-input-value" data-component-id="${component.id}" value="${(component.value || '').replace(/"/g, '&quot;')}" placeholder="${component.placeholder || '请输入身份证号'}" pattern="[0-9Xx]{18}" maxlength="18" style="width: 100%; padding: 8px 12px; border: 1px solid #e0e0e0; border-radius: 4px;" />`
      break
    case 'employee-id':
      html += `<input type="text" class="form-input-value" data-component-id="${component.id}" value="${(component.value || '').replace(/"/g, '&quot;')}" placeholder="${component.placeholder || '请输入工号'}" style="width: 100%; padding: 8px 12px; border: 1px solid #e0e0e0; border-radius: 4px;" />`
      break
    case 'gender':
      const genderValue = component.value || ''
      html += `<div class="form-gender-radio" data-component-id="${component.id}" style="display: flex; gap: 16px;"><label style="display: flex; align-items: center; gap: 4px;"><input type="radio" name="gender_${component.id}" value="male" ${genderValue === 'male' ? 'checked' : ''} /> ${tt('advancedEditorExtra.male')}</label><label style="display: flex; align-items: center; gap: 4px;"><input type="radio" name="gender_${component.id}" value="female" ${genderValue === 'female' ? 'checked' : ''} /> ${tt('advancedEditorExtra.female')}</label></div>`
      break
    case 'age':
      html += `<input type="number" class="form-input-value" data-component-id="${component.id}" value="${(component.value || '').replace(/"/g, '&quot;')}" placeholder="${component.placeholder || '请输入年龄'}" min="0" max="150" style="width: 100%; padding: 8px 12px; border: 1px solid #e0e0e0; border-radius: 4px;" />`
      break
    case 'license-plate':
      html += `<input type="text" class="form-input-value" data-component-id="${component.id}" value="${(component.value || '').replace(/"/g, '&quot;')}" placeholder="${component.placeholder || '请输入车牌号'}" style="width: 100%; padding: 8px 12px; border: 1px solid #e0e0e0; border-radius: 4px;" />`
      break
    case 'address':
      html += `<input type="text" class="form-input-value" data-component-id="${component.id}" value="${(component.value || '').replace(/"/g, '&quot;')}" placeholder="${component.placeholder || '请输入地址'}" style="width: 100%; padding: 8px 12px; border: 1px solid #e0e0e0; border-radius: 4px;" />`
      break
    case 'title':
      html += `<input type="text" class="form-input-value" data-component-id="${component.id}" value="${(component.value || '').replace(/"/g, '&quot;')}" placeholder="${component.placeholder || tt('advancedEditor.formEditor.placeholders.title')}" style="width: 100%; padding: 8px 12px; border: 1px solid #e0e0e0; border-radius: 4px;" />`
      break
    case 'location':
      html += `<input type="text" class="form-input-value" data-component-id="${component.id}" value="${(component.value || '').replace(/"/g, '&quot;')}" placeholder="${component.placeholder || '请输入定位地址'}" style="width: 100%; padding: 8px 12px; border: 1px solid #e0e0e0; border-radius: 4px;" />`
      break
    case 'form-image':
      const imageUrl = component.imageUrl || ''
      html += `<div class="form-image-upload" data-component-id="${component.id}" style="border: 2px dashed #e0e0e0; border-radius: 8px; padding: 20px; text-align: center; background: #fafafa; cursor: pointer; position: relative; min-height: 150px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        ${imageUrl ? `
          <img src="${imageUrl}" alt="${tt('advancedEditorExtra.uploadedImageAlt')}" style="max-width: 100%; max-height: 300px; border-radius: 4px; margin-bottom: 8px; pointer-events: none;" />
          <div style="color: #2196F3; font-size: 14px; margin-top: 8px; pointer-events: none;">${tt('advancedEditor.clickReplaceImage')}</div>
        ` : `
          <div style="font-size: 48px; margin-bottom: 12px; pointer-events: none;">🖼️</div>
          <div style="color: #666; font-size: 14px; margin-bottom: 4px; pointer-events: none;">${tt('advancedEditorExtra.clickUploadImageHint')}</div>
          <div style="color: #999; font-size: 12px; pointer-events: none;">${tt('advancedEditorExtra.imageFormatHint')}</div>
        `}
        <input type="file" accept="image/*" value="" style="position: absolute; opacity: 0; width: 100%; height: 100%; top: 0; left: 0; cursor: pointer; z-index: 10;" class="form-image-input" data-component-id="${component.id}" />
      </div>`
      break
    default:
      html += `<div style="padding: 8px; background: #f5f5f5; border-radius: 4px; color: #999;">${component.label}</div>`
  }
  
  html += '</div>'
  return html
}

// 获取组件 HTML（确保使用最新数据）
const getComponentHtml = (component, index) => {
  // 从 formComponents 数组中获取最新的组件数据
  const latestComponent = formComponents.value[index]
  if (!latestComponent || latestComponent.id !== component.id) {
    // 如果索引不匹配，通过 ID 查找
    const found = formComponents.value.find(c => c.id === component.id)
    if (found) {
      return renderFormComponent(found)
    }
  }
  // 使用最新的组件数据渲染
  return renderFormComponent(latestComponent || component)
}

const getFormComponent = (type) => {
  return 'div' // 返回一个简单的div组件
}

const updateFormComponent = (index, data) => {
  formComponents.value[index] = { ...formComponents.value[index], ...data }
}

// 实时同步编辑面板的变化到组件显示区域（使用防抖优化性能）
let syncTimer = null
watch(editingComponent, (newVal, oldVal) => {
  if (!newVal) return
  
  // 清除之前的定时器
  if (syncTimer) {
    clearTimeout(syncTimer)
  }
  
  // 使用防抖，避免频繁更新
  syncTimer = setTimeout(() => {
    const componentIndex = formComponents.value.findIndex(c => c.id === newVal.id)
    if (componentIndex !== -1) {
      // 实时更新组件数据
      const updatedComponent = {
        ...formComponents.value[componentIndex],
        label: newVal.label || '',
        placeholder: newVal.placeholder || '',
        required: newVal.required || false,
        content: newVal.content || '',
        autoFill: newVal.autoFill || false,
        imageUrl: newVal.imageUrl || formComponents.value[componentIndex].imageUrl,
        npsValue: newVal.npsValue !== undefined ? newVal.npsValue : formComponents.value[componentIndex].npsValue,
        value: newVal.value !== undefined ? newVal.value : formComponents.value[componentIndex].value
      }
      
      // 直接替换整个对象，确保 Vue 检测到变化
      formComponents.value.splice(componentIndex, 1, updatedComponent)
      
      // 强制触发重新渲染
      formComponentsRenderKey.value++
      
      // 实时更新二维码
      nextTick(() => {
        generateQR()
      })
    }
  }, 100) // 100ms防抖延迟
}, { deep: true, immediate: false })

// 更新选项到预览（实时更新）
const updateOptionInPreview = (index) => {
  if (!editingComponent.value || !editingComponent.value.options) return
  
  // 实时更新到formComponents中，但不关闭编辑面板
  const componentIndex = formComponents.value.findIndex(c => c.id === editingComponent.value.id)
  if (componentIndex !== -1) {
    formComponents.value[componentIndex].options = [...editingComponent.value.options]
    // 强制触发重新渲染
    formComponentsRenderKey.value++
  }
}

// 添加选项
const addOption = () => {
  if (!editingComponent.value) return
  if (!editingComponent.value.options) {
    editingComponent.value.options = []
  }
  const optionCount = editingComponent.value.options.length
  editingComponent.value.options.push(`选项${optionCount + 1}`)
  
  // 实时更新到formComponents中，但不关闭编辑面板
  const componentIndex = formComponents.value.findIndex(c => c.id === editingComponent.value.id)
  if (componentIndex !== -1) {
    formComponents.value[componentIndex].options = [...editingComponent.value.options]
    // 强制触发重新渲染
    formComponentsRenderKey.value++
  }
  
  // 确保编辑面板保持打开
  // editingComponent.value 保持不变，不设置为 null
}

// 删除选项
const removeOption = (index) => {
  if (!editingComponent.value || !editingComponent.value.options) return
  if (editingComponent.value.options.length <= 1) return // 至少保留一个选项
  
  // 删除选项
  editingComponent.value.options.splice(index, 1)
  
  // 实时更新到formComponents中，但不关闭编辑面板
  const componentIndex = formComponents.value.findIndex(c => c.id === editingComponent.value.id)
  if (componentIndex !== -1) {
    formComponents.value[componentIndex].options = [...editingComponent.value.options]
    // 强制触发重新渲染
    formComponentsRenderKey.value++
  }
  
  // 确保编辑面板保持打开
  // editingComponent.value 保持不变，不设置为 null
}

// 选项操作相关的计算属性
const activeOptionComponent = computed(() => {
  if (activeOptionComponentId.value === null) return null
  return formComponents.value.find(c => c.id === activeOptionComponentId.value)
})

const canOptionMoveUp = computed(() => {
  return activeOptionIndex.value !== null && activeOptionIndex.value > 0
})

const canOptionMoveDown = computed(() => {
  if (activeOptionIndex.value === null || !activeOptionComponent.value) return false
  return activeOptionIndex.value < (activeOptionComponent.value.options?.length || 0) - 1
})

const canOptionDelete = computed(() => {
  if (!activeOptionComponent.value) return false
  return (activeOptionComponent.value.options?.length || 0) > 1
})

// 选项操作功能
const handleOptionMoveUp = () => {
  if (activeOptionComponentId.value === null || activeOptionIndex.value === null) return
  if (activeOptionIndex.value === 0) return // 已经是第一个，不能上移
  
  const componentIndex = formComponents.value.findIndex(c => c.id === activeOptionComponentId.value)
  if (componentIndex !== -1) {
    const component = formComponents.value[componentIndex]
    if (component.options && component.options.length > activeOptionIndex.value) {
      // 交换选项位置
      const temp = component.options[activeOptionIndex.value]
      component.options[activeOptionIndex.value] = component.options[activeOptionIndex.value - 1]
      component.options[activeOptionIndex.value - 1] = temp
      
      // 更新 activeOptionIndex
      activeOptionIndex.value = activeOptionIndex.value - 1
      
      // 如果正在编辑该组件，同步更新
      if (editingComponent.value && editingComponent.value.id === activeOptionComponentId.value) {
        editingComponent.value.options = [...component.options]
      }
      
      // 强制触发重新渲染
      formComponentsRenderKey.value++
      generateQR()
    }
  }
}

const handleOptionMoveDown = () => {
  if (activeOptionComponentId.value === null || activeOptionIndex.value === null) return
  
  const componentIndex = formComponents.value.findIndex(c => c.id === activeOptionComponentId.value)
  if (componentIndex !== -1) {
    const component = formComponents.value[componentIndex]
    if (component.options && activeOptionIndex.value < component.options.length - 1) {
      // 交换选项位置
      const temp = component.options[activeOptionIndex.value]
      component.options[activeOptionIndex.value] = component.options[activeOptionIndex.value + 1]
      component.options[activeOptionIndex.value + 1] = temp
      
      // 更新 activeOptionIndex
      activeOptionIndex.value = activeOptionIndex.value + 1
      
      // 如果正在编辑该组件，同步更新
      if (editingComponent.value && editingComponent.value.id === activeOptionComponentId.value) {
        editingComponent.value.options = [...component.options]
      }
      
      // 强制触发重新渲染
      formComponentsRenderKey.value++
      generateQR()
    }
  }
}

const handleOptionCopy = () => {
  if (activeOptionComponentId.value === null || activeOptionIndex.value === null) return
  
  const componentIndex = formComponents.value.findIndex(c => c.id === activeOptionComponentId.value)
  if (componentIndex !== -1) {
    const component = formComponents.value[componentIndex]
    if (component.options && component.options.length > activeOptionIndex.value) {
      // 复制选项
      const optionText = component.options[activeOptionIndex.value]
      component.options.splice(activeOptionIndex.value + 1, 0, optionText)
      
      // 如果正在编辑该组件，同步更新
      if (editingComponent.value && editingComponent.value.id === activeOptionComponentId.value) {
        editingComponent.value.options = [...component.options]
      }
      
      // 强制触发重新渲染
      formComponentsRenderKey.value++
      generateQR()
    }
  }
}

const handleOptionDelete = () => {
  if (activeOptionComponentId.value === null || activeOptionIndex.value === null) return
  
  const componentIndex = formComponents.value.findIndex(c => c.id === activeOptionComponentId.value)
  if (componentIndex !== -1) {
    const component = formComponents.value[componentIndex]
    if (component.options && component.options.length > 1 && component.options.length > activeOptionIndex.value) {
      // 删除选项
      component.options.splice(activeOptionIndex.value, 1)
      
      // 如果正在编辑该组件，同步更新
      if (editingComponent.value && editingComponent.value.id === activeOptionComponentId.value) {
        editingComponent.value.options = [...component.options]
      }
      
      // 关闭操作按钮
      showOptionActions.value = false
      activeOptionComponentId.value = null
      activeOptionIndex.value = null
      
      // 强制触发重新渲染
      formComponentsRenderKey.value++
      generateQR()
    }
  }
}

// 保存组件编辑
const saveComponentEdit = () => {
  if (!editingComponent.value) return
  
  const componentIndex = formComponents.value.findIndex(c => c.id === editingComponent.value.id)
  if (componentIndex !== -1) {
    // 更新组件数据，使用 Vue.set 或直接赋值确保响应式更新
    const updatedComponent = {
      ...formComponents.value[componentIndex],
      label: editingComponent.value.label,
      placeholder: editingComponent.value.placeholder,
      required: editingComponent.value.required,
      content: editingComponent.value.content,
      autoFill: editingComponent.value.autoFill,
      options: editingComponent.value.options ? [...editingComponent.value.options] : undefined
    }
    
    console.log('[保存组件编辑] 更新前:', formComponents.value[componentIndex])
    console.log('[保存组件编辑] 更新后:', updatedComponent)
    
    // 直接替换整个对象，确保 Vue 检测到变化
    formComponents.value.splice(componentIndex, 1, updatedComponent)
    
    // 强制触发重新渲染
    formComponentsRenderKey.value++
    
    console.log('[保存组件编辑] 渲染键已更新:', formComponentsRenderKey.value)
    console.log('[保存组件编辑] 当前组件列表:', formComponents.value.map(c => ({ id: c.id, label: c.label, placeholder: c.placeholder })))
    
    // 使用 nextTick 确保 DOM 更新完成
    nextTick(() => {
      // 确保组件已重新渲染
      console.log('[保存组件编辑] DOM 更新完成')
    })
    
    // 关闭编辑面板
    editingComponent.value = null
  } else {
    console.warn('[保存组件编辑] 未找到组件，ID:', editingComponent.value.id)
  }
}

// 复制表单组件
const copyFormComponent = (componentId) => {
  const componentIndex = formComponents.value.findIndex(c => c.id === componentId)
  if (componentIndex !== -1) {
    const component = formComponents.value[componentIndex]
    const newComponent = {
      ...component,
      id: Date.now(),
      imageUrl: component.imageUrl || '', // 复制图片URL
      options: component.options ? [...component.options] : (component.type === 'radio' || component.type === 'checkbox' ? ['选项1', '选项2'] : [])
    }
    formComponents.value.splice(componentIndex + 1, 0, newComponent)
    selectedComponentId.value = newComponent.id
  }
}

// 上移表单组件
const moveComponentUp = (componentId) => {
  const componentIndex = formComponents.value.findIndex(c => c.id === componentId)
  if (componentIndex > 0) {
    // 交换位置
    const temp = formComponents.value[componentIndex]
    formComponents.value[componentIndex] = formComponents.value[componentIndex - 1]
    formComponents.value[componentIndex - 1] = temp
    // 强制触发重新渲染
    formComponentsRenderKey.value++
    // 保持选中状态
    selectedComponentId.value = componentId
    // 实时更新二维码
    nextTick(() => {
      generateQR()
    })
  }
}

// 下移表单组件
const moveComponentDown = (componentId) => {
  const componentIndex = formComponents.value.findIndex(c => c.id === componentId)
  if (componentIndex >= 0 && componentIndex < formComponents.value.length - 1) {
    // 交换位置
    const temp = formComponents.value[componentIndex]
    formComponents.value[componentIndex] = formComponents.value[componentIndex + 1]
    formComponents.value[componentIndex + 1] = temp
    // 强制触发重新渲染
    formComponentsRenderKey.value++
    // 保持选中状态
    selectedComponentId.value = componentId
    // 实时更新二维码
    nextTick(() => {
      generateQR()
    })
  }
}

// 删除表单组件
const deleteFormComponent = (componentId) => {
  const componentIndex = formComponents.value.findIndex(c => c.id === componentId)
  if (componentIndex !== -1) {
    formComponents.value.splice(componentIndex, 1)
    selectedComponentId.value = null
  }
}

const handleFormDrop = (event) => {
  event.preventDefault()
}

// 关闭表单模态框
const closeFormModal = () => {
  showCreateForm.value = false
  // 延迟重置，避免关闭动画时闪烁
  setTimeout(() => {
    editingFormIndex.value = -1
    formComponents.value = []
    currentForm.value = {
      name: '',
      afterSubmit: 'success',
      fillLimit: {
        type: 'none',
        times: 1,
        period: '日'
      }
    }
  }, 300)
}

// 创建新表单
const createNewForm = () => {
  // 重置编辑索引
  editingFormIndex.value = -1
  // 清空表单组件和设置
  formComponents.value = []
  currentForm.value = {
    name: '',
    afterSubmit: 'success',
    fillLimit: {
      type: 'none',
      times: 1,
      period: '日'
    }
  }
  // 打开创建窗口
  showCreateForm.value = true
}

const editForm = (index) => {
  // 编辑表单
  if (index >= 0 && index < formList.value.length) {
    const form = formList.value[index]
    // 设置编辑索引
    editingFormIndex.value = index
    // 加载表单组件数据（深拷贝）
    formComponents.value = JSON.parse(JSON.stringify(form.components || []))
    // 加载表单设置数据（深拷贝）
    currentForm.value = JSON.parse(JSON.stringify(form.settings || {
      name: form.name || '',
      afterSubmit: 'success',
      fillLimit: {
        type: 'none',
        times: 1,
        period: '日'
      }
    }))
    // 打开编辑窗口
    showCreateForm.value = true
  }
}

const deleteForm = (index) => {
  if (confirm(tt('advancedEditor.confirm.deleteForm'))) {
    formList.value.splice(index, 1)
  }
}

const saveForm = () => {
  // 验证表单名称
  if (!currentForm.value.name || !currentForm.value.name.trim()) {
    // 先聚焦到输入框，添加视觉提示，不阻塞界面
    nextTick(() => {
      const nameInput = document.querySelector('.create-form-modal .form-name-input')
      if (nameInput) {
        // 只聚焦，不选中文本，让用户可以继续输入
        nameInput.focus()
        // 添加红色边框提示
        nameInput.style.borderColor = '#f44336'
        nameInput.style.borderWidth = '2px'
        // 添加提示文本（在输入框下方显示）
        let hintElement = nameInput.parentElement.querySelector('.form-name-hint')
        if (!hintElement) {
          hintElement = document.createElement('div')
          hintElement.className = 'form-name-hint'
          hintElement.style.cssText = 'color: #f44336; font-size: 12px; margin-top: 4px;'
          hintElement.textContent = tt('advancedEditor.form.required')
          nameInput.parentElement.appendChild(hintElement)
        } else {
          hintElement.style.display = 'block'
        }
        // 3秒后恢复
        setTimeout(() => {
          nameInput.style.borderColor = ''
          nameInput.style.borderWidth = ''
          if (hintElement) {
            hintElement.style.display = 'none'
          }
        }, 3000)
      }
    })
    // 不显示alert，避免阻塞界面，让用户可以继续输入
    // 确保模态框保持打开状态，用户可以继续编辑
    // showCreateForm.value 保持为 true，不关闭模态框
    return
  }
  
  if (editingFormIndex.value >= 0) {
    // 编辑模式：更新现有表单
    const form = formList.value[editingFormIndex.value]
    form.name = currentForm.value.name
    form.modifyTime = formatDateTime(Date.now(), locale.value)
    form.components = JSON.parse(JSON.stringify(formComponents.value))
    form.settings = JSON.parse(JSON.stringify(currentForm.value))
    
    alert(tt('advancedEditor.form.updated'))
  } else {
    // 创建模式：添加新表单
    const form = {
      id: Date.now(),
      name: currentForm.value.name,
      modifyTime: formatDateTime(Date.now(), locale.value),
      selected: false,
      components: JSON.parse(JSON.stringify(formComponents.value)),
      settings: JSON.parse(JSON.stringify(currentForm.value))
    }
    
    formList.value.push(form)
    alert(tt('advancedEditor.form.saved'))
  }
  
  // 关闭并重置
  closeFormModal()
}

// 监听样式变化
watch([() => qrStyle.value.foregroundColor, () => qrStyle.value.backgroundColor, () => qrStyle.value.errorLevel], () => {
  generateQR()
})

// 全局函数：更换图片（支持通过元素或事件触发）
window.replaceImage = function(element) {
  const container = element.closest('.image-container') || 
                    element.closest('[data-replaceable-image="true"]') ||
                    (element.hasAttribute('data-replaceable-image') ? element : element.parentElement)
  if (!container) return
  
  // 创建文件选择输入
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    // 移除文件大小限制，允许上传任意大小的图片
    
    const reader = new FileReader()
    reader.onload = (event) => {
      const imageUrl = event.target.result
      
      // 更新背景图片
      if (container.style.backgroundImage || container.classList.contains('editor-image-content')) {
        container.style.backgroundImage = `url(${imageUrl})`
      }
      
      // 更新img标签的src
      const img = container.querySelector('img')
      if (img) {
        img.src = imageUrl
      }
      
      // 触发内容变化（通过事件或直接调用）
      setTimeout(() => {
        const editableArea = document.querySelector('.editable-area')
        if (editableArea) {
          // 触发input事件以通知Vue内容已变化
          editableArea.dispatchEvent(new Event('input', { bubbles: true }))
        }
      }, 100)
    }
    reader.readAsDataURL(file)
  }
  input.click()
}

onMounted(async () => {
  // 确保DOM完全渲染后再生成二维码
  await nextTick()
  
  // 检查canvas是否已准备好
  if (qrCanvas.value) {
    generateQR()
  } else {
    // 如果canvas还未准备好，等待一下再尝试
    setTimeout(() => {
      if (qrCanvas.value) {
        generateQR()
      } else {
        console.warn('二维码画布未找到，将在用户操作时生成')
      }
    }, 100)
  }
  
  // 初始化颜色调色板
  colorPalette.value = generateColorPalette()
  
  // 初始化编辑区域的空占位符提示
  if (editableArea.value && !editableArea.value.innerHTML.trim()) {
    editableArea.value.innerHTML = '<div class="empty-placeholder" style="color: #999; text-align: center; padding: 60px 20px; font-size: 1.1rem; pointer-events: none;">' + tt('advancedEditorExtra.editContentPlaceholder') + '</div>'
  }
  
  // 点击外部区域关闭选项操作按钮
  document.addEventListener('click', (e) => {
    if (showOptionActions.value) {
      const toolbar = document.querySelector('.option-actions-toolbar')
      const optionLabel = e.target.closest('.option-label')
      if (!toolbar?.contains(e.target) && !optionLabel) {
        showOptionActions.value = false
        activeOptionComponentId.value = null
        activeOptionIndex.value = null
      }
    }
  })
  
  // 添加滚动和resize监听，更新操作按钮位置
  if (editableArea.value) {
    const updatePosition = () => {
      if (selectedElement.value && showElementActions.value) {
        updateElementActionsPosition(selectedElement.value)
      }
    }
    
    editableArea.value.addEventListener('scroll', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
  }
  
  // 使用事件委托处理图片容器的hover效果
  if (editableArea.value) {
    // 使用mouseover和mouseout来处理hover效果
    editableArea.value.addEventListener('mouseover', (e) => {
      const container = e.target.closest('.image-container') || 
                       e.target.closest('[style*="background-image"]')
      if (container && !container.contains(e.relatedTarget)) {
        const btn = container.querySelector('.replace-image-btn')
        if (btn) {
          btn.style.setProperty('opacity', '1', 'important')
          btn.style.setProperty('pointer-events', 'auto', 'important')
        }
      }
    })
    
    editableArea.value.addEventListener('mouseout', (e) => {
      const container = e.target.closest('.image-container') || 
                       e.target.closest('[style*="background-image"]')
      if (container && !container.contains(e.relatedTarget)) {
        const btn = container.querySelector('.replace-image-btn')
        if (btn) {
          btn.style.setProperty('opacity', '0', 'important')
          btn.style.setProperty('pointer-events', 'none', 'important')
        }
      }
    })
  }
  
  // 使用 nextTick 确保 DOM 渲染完成后再绑定事件
  nextTick(() => {
    // 在document上绑定事件，确保动态生成的元素也能响应
    // 使用 once: false 确保可以多次触发，但避免重复绑定
    if (!document.hasFormImageUploadListener) {
      // 使用事件委托在 document 上监听 change 事件
      document.addEventListener('change', handleFormImageUpload, true) // 使用捕获阶段
      document.hasFormImageUploadListener = true
      console.log('表单图片上传事件监听器已绑定')
      
      // 添加点击事件监听器，当点击图片上传区域时触发输入框点击
      document.addEventListener('click', (e) => {
        if (e.target && e.target.classList && e.target.classList.contains('form-image-input')) {
          console.log('[图片上传] 输入框被点击', e.target)
        } else if (e.target && e.target.closest('.form-image-upload')) {
          const uploadDiv = e.target.closest('.form-image-upload')
          const input = uploadDiv.querySelector('.form-image-input')
          if (input && e.target !== input) {
            console.log('[图片上传] 图片上传区域被点击，触发输入框点击', input)
            // 如果点击的是上传区域而不是输入框本身，触发输入框点击
            // 不阻止事件传播，让输入框的点击事件正常触发
            setTimeout(() => {
              input.click()
            }, 0)
          }
        }
      }, true) // 使用捕获阶段
    }
    
    // 为所有现有的图片输入框绑定 change 事件（直接绑定，不依赖事件委托）
    const allImageInputs = document.querySelectorAll('.form-image-input')
    allImageInputs.forEach(input => {
      // 检查是否已经绑定过事件（通过检查是否有 data-bound 属性）
      if (!input.hasAttribute('data-bound')) {
        // 绑定 change 事件
        input.addEventListener('change', handleFormImageUpload, false)
        input.setAttribute('data-bound', 'true')
        console.log('[图片上传] 为输入框绑定 change 事件', input, input.getAttribute('data-component-id'))
      }
    })
    
    // 处理表单输入框的值变化（仅同步预览，不更新 formComponents 避免重新渲染）
    if (!document.hasFormInputListener) {
      // input 事件：仅同步预览，不更新 formComponents
      document.addEventListener('input', (e) => {
        // 处理左侧编辑面板的输入框
        if (e.target.classList && (e.target.classList.contains('form-input-value') || e.target.classList.contains('form-textarea-value'))) {
          const componentId = parseInt(e.target.getAttribute('data-component-id'))
          if (componentId) {
            // 仅同步更新右侧预览区域的对应输入框，不更新 formComponents
            if (editableArea.value) {
              const previewInput = editableArea.value.querySelector(`.preview-textarea-value[data-component-id="${componentId}"], .preview-input-value[data-component-id="${componentId}"]`)
              if (previewInput && previewInput !== e.target) {
                previewInput.value = e.target.value
              }
            }
          }
        }
        // 处理右侧预览区域的输入框
        else if (e.target.classList && (e.target.classList.contains('preview-input-value') || e.target.classList.contains('preview-textarea-value'))) {
          const componentId = parseInt(e.target.getAttribute('data-component-id'))
          if (componentId) {
            // 仅同步更新左侧编辑面板的对应输入框，不更新 formComponents
            const formInput = document.querySelector(`.form-input-value[data-component-id="${componentId}"], .form-textarea-value[data-component-id="${componentId}"]`)
            if (formInput && formInput !== e.target) {
              formInput.value = e.target.value
            }
          }
        }
      }, true)
      
      // blur 事件：保存值到 formComponents 并更新二维码
      document.addEventListener('blur', (e) => {
        // 处理左侧编辑面板的输入框
        if (e.target.classList && (e.target.classList.contains('form-input-value') || e.target.classList.contains('form-textarea-value'))) {
          const componentId = parseInt(e.target.getAttribute('data-component-id'))
          if (componentId) {
            const componentIndex = formComponents.value.findIndex(c => c.id === componentId)
            if (componentIndex !== -1) {
              // 保存输入框的值
              formComponents.value[componentIndex].value = e.target.value
              // 更新二维码
              nextTick(() => {
                generateQR()
              })
            }
          }
        }
        // 处理右侧预览区域的输入框
        else if (e.target.classList && (e.target.classList.contains('preview-input-value') || e.target.classList.contains('preview-textarea-value'))) {
          const componentId = parseInt(e.target.getAttribute('data-component-id'))
          if (componentId) {
            const componentIndex = formComponents.value.findIndex(c => c.id === componentId)
            if (componentIndex !== -1) {
              // 保存输入框的值
              formComponents.value[componentIndex].value = e.target.value
              // 更新二维码
              nextTick(() => {
                generateQR()
              })
            }
          }
        }
      }, true)
      
      document.hasFormInputListener = true
    }
    
    // 为所有现有的表单输入框绑定 input 事件（左侧编辑面板）
    const allFormInputs = document.querySelectorAll('.form-input-value, .form-textarea-value')
    allFormInputs.forEach(input => {
      if (!input.hasAttribute('data-input-bound')) {
        input.addEventListener('input', (e) => {
          const componentId = parseInt(e.target.getAttribute('data-component-id'))
          if (componentId) {
            const componentIndex = formComponents.value.findIndex(c => c.id === componentId)
            if (componentIndex !== -1) {
              // 保存光标位置（仅对 textarea）
              let selectionStart = null
              let selectionEnd = null
              if (e.target.tagName === 'TEXTAREA') {
                selectionStart = e.target.selectionStart
                selectionEnd = e.target.selectionEnd
              }
              
              // 实时保存输入框的值（直接修改，不触发重新渲染）
              const component = formComponents.value[componentIndex]
              if (component.value !== e.target.value) {
                component.value = e.target.value
              }
              
              // 同步更新右侧预览区域的对应输入框
              if (editableArea.value) {
                const previewInput = editableArea.value.querySelector(`.preview-textarea-value[data-component-id="${componentId}"], .preview-input-value[data-component-id="${componentId}"]`)
                if (previewInput && previewInput !== e.target) {
                  previewInput.value = e.target.value
                  // 如果是 textarea，也恢复光标位置
                  if (previewInput.tagName === 'TEXTAREA' && selectionStart !== null) {
                    previewInput.setSelectionRange(selectionStart, selectionEnd)
                  }
                }
              }
              
              // 恢复光标位置（如果存在）
              if (e.target.tagName === 'TEXTAREA' && selectionStart !== null) {
                nextTick(() => {
                  e.target.setSelectionRange(selectionStart, selectionEnd)
                })
              }
              
              // 实时更新二维码（使用防抖，避免频繁更新）
              if (!e.target._qrUpdateTimer) {
                e.target._qrUpdateTimer = setTimeout(() => {
                  generateQR()
                  e.target._qrUpdateTimer = null
                }, 300)
              }
            }
          }
        }, false)
        input.setAttribute('data-input-bound', 'true')
      }
    })
    
    // 为所有现有的预览区域输入框绑定事件（右侧预览区域，实现双向同步）
    if (editableArea.value) {
      const previewInputs = editableArea.value.querySelectorAll('.preview-input-value, .preview-textarea-value')
      previewInputs.forEach(input => {
        if (!input.hasAttribute('data-preview-input-bound')) {
          // 使用 blur 事件保存值，避免输入时触发重新渲染
          input.addEventListener('blur', (e) => {
            const componentId = parseInt(e.target.getAttribute('data-component-id'))
            if (componentId) {
              const componentIndex = formComponents.value.findIndex(c => c.id === componentId)
              if (componentIndex !== -1) {
                // 保存输入框的值
                formComponents.value[componentIndex].value = e.target.value
                // 同步更新左侧编辑面板的对应输入框
                const formInput = document.querySelector(`.form-input-value[data-component-id="${componentId}"], .form-textarea-value[data-component-id="${componentId}"]`)
                if (formInput) {
                  formInput.value = e.target.value
                }
                // 更新二维码
                nextTick(() => {
                  generateQR()
                })
              }
            }
          }, false)
          
          // 使用 input 事件仅同步左侧编辑面板，不更新 formComponents（避免重新渲染）
          input.addEventListener('input', (e) => {
            const componentId = parseInt(e.target.getAttribute('data-component-id'))
            if (componentId) {
              // 仅同步更新左侧编辑面板的对应输入框，不更新 formComponents
              const formInput = document.querySelector(`.form-input-value[data-component-id="${componentId}"], .form-textarea-value[data-component-id="${componentId}"]`)
              if (formInput && formInput !== e.target) {
                formInput.value = e.target.value
              }
            }
          }, false)
          
          input.setAttribute('data-preview-input-bound', 'true')
        }
      })
    }
    
    // 处理性别选择（radio change 事件）
    if (!document.hasGenderRadioListener) {
      document.addEventListener('change', (e) => {
        if (e.target.type === 'radio' && e.target.name && e.target.name.startsWith('gender_')) {
          const componentId = parseInt(e.target.name.replace('gender_', ''))
          if (componentId) {
            const componentIndex = formComponents.value.findIndex(c => c.id === componentId)
            if (componentIndex !== -1) {
              // 保存选中的性别值
              formComponents.value[componentIndex].value = e.target.value
              // 同步更新另一侧的性别选择
              // 更新左侧编辑面板
              const formGenderRadio = document.querySelector(`.form-gender-radio[data-component-id="${componentId}"]`)
              if (formGenderRadio) {
                const formRadio = formGenderRadio.querySelector(`input[type="radio"][value="${e.target.value}"]`)
                if (formRadio) {
                  formRadio.checked = true
                }
              }
              // 更新右侧预览区域
              if (editableArea.value) {
                const previewGenderRadio = editableArea.value.querySelector(`.preview-gender-radio[data-component-id="${componentId}"]`)
                if (previewGenderRadio) {
                  const previewRadio = previewGenderRadio.querySelector(`input[type="radio"][value="${e.target.value}"]`)
                  if (previewRadio) {
                    previewRadio.checked = true
                  }
                }
              }
              // 实时更新二维码
              nextTick(() => {
                generateQR()
              })
            }
          }
        }
      }, true)
      document.hasGenderRadioListener = true
    }
    
    // 处理NPS量表数字点击
    if (!document.hasNpsListener) {
      document.addEventListener('click', (e) => {
        // 使用 closest 来查找包含 nps-number 类的元素，支持事件委托
        const npsElement = e.target.closest('.nps-number')
        if (npsElement) {
          e.stopPropagation() // 阻止事件冒泡，避免触发组件选中
          e.preventDefault() // 阻止默认行为
          const npsValue = parseInt(npsElement.getAttribute('data-nps-value'))
          const componentId = parseInt(npsElement.getAttribute('data-component-id'))
          
          if (!isNaN(npsValue) && componentId) {
            const componentIndex = formComponents.value.findIndex(c => c.id === componentId)
            if (componentIndex !== -1) {
              // 更新NPS值
              formComponents.value[componentIndex].npsValue = npsValue
              // 强制触发重新渲染
              formComponentsRenderKey.value++
              // 实时更新二维码
              nextTick(() => {
                generateQR()
              })
            }
          }
          return
        }
      }, true) // 使用捕获阶段，确保优先处理
      document.hasNpsListener = true
    }
    
    // 处理评分星星点击（必须在其他点击事件之前处理）
    if (!document.hasRatingStarListener) {
      const handleRatingClick = (e) => {
        // 处理文本节点的情况：如果点击的是文本节点，获取其父元素
        let target = e.target
        if (target.nodeType === Node.TEXT_NODE) {
          target = target.parentElement
        }
        
        // 如果目标元素包含星星字符，查找包含 rating-star 类的父元素
        if (target && target.textContent && target.textContent.includes('⭐')) {
          // 向上查找包含 rating-star 类的元素
          let current = target
          while (current && current !== document.body) {
            if (current.classList && current.classList.contains('rating-star')) {
              const ratingValue = parseInt(current.getAttribute('data-rating-value'))
              const componentId = parseInt(current.getAttribute('data-component-id'))
              
              if (!isNaN(ratingValue) && componentId && ratingValue >= 1 && ratingValue <= 5) {
                e.stopPropagation()
                e.preventDefault()
                
                const componentIndex = formComponents.value.findIndex(c => c.id === componentId)
                if (componentIndex !== -1) {
                  // 更新评分值（1-5）
                  formComponents.value[componentIndex].ratingValue = ratingValue
                  // 强制触发重新渲染
                  formComponentsRenderKey.value++
                  // 实时更新二维码
                  nextTick(() => {
                    generateQR()
                  })
                  return true
                }
              }
              break
            }
            current = current.parentElement
          }
        }
        
        // 查找包含 rating-star 类的元素或包含 data-rating-value 属性的元素
        let ratingElement = target.closest ? target.closest('.rating-star') : null
        
        // 如果没找到，向上遍历DOM树查找
        if (!ratingElement && target) {
          let current = target
          while (current && current !== document.body) {
            // 检查是否有 rating-star 类
            if (current.classList && current.classList.contains('rating-star')) {
              ratingElement = current
              break
            }
            // 检查是否有 data-rating-value 属性
            if (current.getAttribute && current.getAttribute('data-rating-value')) {
              ratingElement = current
              break
            }
            // 检查父元素是否是评分星星容器
            if (current.parentElement) {
              const parent = current.parentElement
              if (parent.classList && parent.classList.contains('rating-star')) {
                ratingElement = parent
                break
              }
              if (parent.getAttribute && parent.getAttribute('data-rating-value')) {
                ratingElement = parent
                break
              }
            }
            current = current.parentElement
          }
        }
        
        // 如果找到了评分元素
        if (ratingElement) {
          e.stopPropagation() // 阻止事件冒泡，避免触发组件选中
          e.preventDefault() // 阻止默认行为
          
          const ratingValue = parseInt(ratingElement.getAttribute('data-rating-value'))
          const componentId = parseInt(ratingElement.getAttribute('data-component-id'))
          
          if (!isNaN(ratingValue) && componentId && ratingValue >= 1 && ratingValue <= 5) {
            const componentIndex = formComponents.value.findIndex(c => c.id === componentId)
            if (componentIndex !== -1) {
              // 更新评分值（1-5）
              formComponents.value[componentIndex].ratingValue = ratingValue
              // 强制触发重新渲染
              formComponentsRenderKey.value++
              // 实时更新二维码
              nextTick(() => {
                generateQR()
              })
              return true
            }
          }
        }
        return false
      }
      
      // 使用捕获阶段，并且确保在其他事件之前处理（通过先绑定）
      document.addEventListener('click', handleRatingClick, true)
      document.hasRatingStarListener = true
      console.log('评分星星点击事件监听器已绑定')
    }
    
    // 处理编辑区域中评分组件工具栏按钮点击
    if (!document.hasEditableRatingToolbarListener) {
      document.addEventListener('click', (e) => {
        if (e.target.classList && e.target.classList.contains('editable-toolbar-btn')) {
          e.stopPropagation()
          e.preventDefault()
          
          const action = e.target.getAttribute('data-action')
          const componentId = e.target.getAttribute('data-component-id')
          const wrapper = e.target.closest('.editable-rating-wrapper')
          
          if (!wrapper) return
          
          if (action === 'move-up') {
            // 上移：找到前一个兄弟节点并交换位置
            const prevSibling = wrapper.previousElementSibling
            if (prevSibling && editableArea.value) {
              editableArea.value.insertBefore(wrapper, prevSibling)
              generateQR()
            }
          } else if (action === 'move-down') {
            // 下移：找到下一个兄弟节点并交换位置
            const nextSibling = wrapper.nextElementSibling
            if (nextSibling && editableArea.value) {
              editableArea.value.insertBefore(nextSibling, wrapper)
              generateQR()
            }
          } else if (action === 'copy') {
            // 复制：克隆当前组件并插入到后面
            const cloned = wrapper.cloneNode(true)
            const newId = `rating_${Date.now()}`
            cloned.setAttribute('data-component-id', newId)
            // 更新所有子元素的 data-component-id
            cloned.querySelectorAll('[data-component-id]').forEach(el => {
              if (el.getAttribute('data-component-id') === componentId) {
                el.setAttribute('data-component-id', newId)
              }
            })
            // 重置工具栏显示状态
            const toolbar = cloned.querySelector('.editable-rating-toolbar')
            if (toolbar) {
              toolbar.style.display = 'none'
            }
            if (editableArea.value) {
              editableArea.value.insertBefore(cloned, wrapper.nextSibling)
              generateQR()
            }
          } else if (action === 'delete') {
            // 删除：移除当前组件
            if (confirm(tt('advancedEditor.confirm.deleteComponent'))) {
              wrapper.remove()
              generateQR()
            }
          }
        }
      }, true)
      document.hasEditableRatingToolbarListener = true
    }
    
    // 处理编辑区域中评分组件的点击，显示/隐藏工具栏
    if (!document.hasEditableRatingClickListener) {
      document.addEventListener('click', (e) => {
        // 如果点击的是评分星星，不显示工具栏
        if (e.target.closest('.rating-star') || e.target.closest('.rating-stars')) {
          return
        }
        
        // 检查是否点击了评分组件（但不是工具栏按钮和星星）
        const ratingWrapper = e.target.closest('.editable-rating-wrapper')
        if (ratingWrapper && !e.target.closest('.editable-toolbar-btn')) {
          // 隐藏所有工具栏
          document.querySelectorAll('.editable-rating-toolbar').forEach(toolbar => {
            toolbar.style.display = 'none'
          })
          // 显示当前组件的工具栏
          const toolbar = ratingWrapper.querySelector('.editable-rating-toolbar')
          if (toolbar) {
            toolbar.style.display = 'flex'
          }
        } else if (!e.target.closest('.editable-rating-wrapper')) {
          // 点击其他地方，隐藏所有工具栏
          document.querySelectorAll('.editable-rating-toolbar').forEach(toolbar => {
            toolbar.style.display = 'none'
          })
        }
      }, true)
      document.hasEditableRatingClickListener = true
    }
    
    // 处理图片元素工具栏功能
    if (!document.hasImageToolbarListener) {
      // 处理图片工具栏按钮点击（使用捕获阶段，确保优先执行）
      document.addEventListener('click', (e) => {
        // 检查是否是工具栏按钮或工具栏内的任何元素
        const toolbarBtn = e.target.closest('.image-toolbar-btn')
        const toolbar = e.target.closest('.image-toolbar')
        
        if (toolbarBtn || toolbar) {
          // 如果点击的是工具栏但不是按钮，阻止事件传播但不处理
          if (toolbar && !toolbarBtn) {
            e.stopPropagation()
            return
          }
          
          if (!toolbarBtn) return
          
          e.stopPropagation()
          e.preventDefault()
          
          const action = e.target.getAttribute('data-action')
          // 更宽泛的选择器来找到图片容器
          let imageContainer = e.target.closest('.image-container.image-with-toolbar')
          if (!imageContainer) {
            imageContainer = e.target.closest('.editor-image-content')
          }
          if (!imageContainer) {
            imageContainer = e.target.closest('.image-container')
          }
          
          if (!imageContainer || !editableArea.value) {
            console.warn('[图片工具栏] 未找到图片容器或编辑区域')
            return
          }
          
          console.log('[图片工具栏] 执行操作:', action, imageContainer)
          
          if (action === 'move-up') {
            // 设置标志位，防止触发内容变化事件
            isImageToolbarUpdating = true
            try {
              // 上移：找到所有可移动的图片元素（排除组合图片内的）
              const allImages = []
              const walker = document.createTreeWalker(
                editableArea.value,
                NodeFilter.SHOW_ELEMENT,
                {
                  acceptNode: (node) => {
                    // 如果是图片容器，且不在组合图片内
                    if ((node.classList.contains('image-container') || 
                         node.classList.contains('editor-image-content')) &&
                        !node.closest('.editor-photo-group-2, .editor-photo-group-3, .editor-image-grid-6')) {
                      return NodeFilter.FILTER_ACCEPT
                    }
                    return NodeFilter.FILTER_SKIP
                  }
                }
              )
              
              let node
              while (node = walker.nextNode()) {
                allImages.push(node)
              }
              
              const currentIndex = allImages.indexOf(imageContainer)
              console.log('[图片移动] 当前索引:', currentIndex, '总图片数:', allImages.length)
              
              if (currentIndex > 0) {
                const prevImage = allImages[currentIndex - 1]
                const prevParent = prevImage.parentNode
                
                // 移除当前图片
                imageContainer.remove()
                // 插入到前一个图片之前
                prevParent.insertBefore(imageContainer, prevImage)
                
                console.log('[图片移动] 上移成功')
                // 直接调用 generateQR，因为已经设置了标志位
                generateQR()
              } else {
                console.log('[图片移动] 已经是第一个，无法上移')
              }
            } finally {
              setTimeout(() => {
                isImageToolbarUpdating = false
              }, 100)
            }
          } else if (action === 'move-down') {
            // 设置标志位，防止触发内容变化事件
            isImageToolbarUpdating = true
            try {
              // 下移：找到所有可移动的图片元素（排除组合图片内的）
              const allImages = []
              const walker = document.createTreeWalker(
                editableArea.value,
                NodeFilter.SHOW_ELEMENT,
                {
                  acceptNode: (node) => {
                    // 如果是图片容器，且不在组合图片内
                    if ((node.classList.contains('image-container') || 
                         node.classList.contains('editor-image-content')) &&
                        !node.closest('.editor-photo-group-2, .editor-photo-group-3, .editor-image-grid-6')) {
                      return NodeFilter.FILTER_ACCEPT
                    }
                    return NodeFilter.FILTER_SKIP
                  }
                }
              )
              
              let node
              while (node = walker.nextNode()) {
                allImages.push(node)
              }
              
              const currentIndex = allImages.indexOf(imageContainer)
              console.log('[图片移动] 当前索引:', currentIndex, '总图片数:', allImages.length)
              
              if (currentIndex >= 0 && currentIndex < allImages.length - 1) {
                const nextImage = allImages[currentIndex + 1]
                const nextParent = nextImage.parentNode
                
                // 移除当前图片
                imageContainer.remove()
                // 插入到下一个图片之后
                if (nextImage.nextSibling) {
                  nextParent.insertBefore(imageContainer, nextImage.nextSibling)
                } else {
                  nextParent.appendChild(imageContainer)
                }
                
                console.log('[图片移动] 下移成功')
                // 直接调用 generateQR，因为已经设置了标志位
                generateQR()
              } else {
                console.log('[图片移动] 已经是最后一个，无法下移')
              }
            } finally {
              setTimeout(() => {
                isImageToolbarUpdating = false
              }, 100)
            }
          } else if (action === 'copy') {
            // 设置标志位，防止触发内容变化事件
            isImageToolbarUpdating = true
            try {
              // 复制：克隆当前图片并插入到后面
              const cloned = imageContainer.cloneNode(true)
              // 更新工具栏中的data-image-id
              const newId = `image_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
              cloned.setAttribute('data-image-id', newId)
              // 移除选中状态
              cloned.classList.remove('image-selected')
              // 更新工具栏按钮的data-image-id
              cloned.querySelectorAll('.image-toolbar-btn').forEach(btn => {
                btn.setAttribute('data-image-id', newId)
              })
              // 重置工具栏显示状态
              const toolbar = cloned.querySelector('.image-toolbar')
              if (toolbar) {
                toolbar.style.display = 'none'
              }
              editableArea.value.insertBefore(cloned, imageContainer.nextSibling)
              // 直接调用 generateQR，因为已经设置了标志位
              generateQR()
            } finally {
              setTimeout(() => {
                isImageToolbarUpdating = false
              }, 100)
            }
          } else if (action === 'delete') {
            // 删除：移除当前图片
            showConfirm(tt('advancedEditor.confirm.deleteImage')).then((confirmed) => {
              if (confirmed) {
                try {
                  // 使用 nextTick 确保 DOM 更新完成
                  nextTick(() => {
                    imageContainer.remove()
                    // 使用 setTimeout 延迟调用 generateQR，避免阻塞UI
                    setTimeout(() => {
                      generateQR().catch(err => {
                        console.error('删除图片后生成二维码失败:', err)
                        // 即使生成二维码失败，也不影响删除操作
                      })
                    }, 100)
                  })
                } catch (error) {
                  console.error('删除图片失败:', error)
                  alert(tt('advancedEditor.errors.deleteImageFailed'))
                }
              }
            })
          }
        }
      }, true)
      
      // 确保所有图片容器不可编辑
      const makeImagesNonEditable = () => {
        if (editableArea.value) {
          const allImages = editableArea.value.querySelectorAll('.image-container, .editor-image-content')
          allImages.forEach(img => {
            img.setAttribute('contenteditable', 'false')
            img.style.userSelect = 'none'
            // 确保内部所有元素也不可编辑
            img.querySelectorAll('*').forEach(child => {
              if (child.tagName !== 'BUTTON') { // 按钮保持可点击
                child.setAttribute('contenteditable', 'false')
                child.style.userSelect = 'none'
              }
            })
          })
        }
      }
      
      // 监听编辑区域内容变化，确保新添加的图片不可编辑
      if (editableArea.value) {
        const observer = new MutationObserver(() => {
          makeImagesNonEditable()
        })
        observer.observe(editableArea.value, {
          childList: true,
          subtree: true
        })
        // 初始执行一次
        makeImagesNonEditable()
      }
      
      // 处理图片点击，显示蓝色边框选中状态和工具栏按钮
      // 使用 capture 阶段，确保在其他事件监听器之前执行，优先级最高
      document.addEventListener('click', (e) => {
        // 如果点击的是工具栏按钮或更换图片按钮，不处理
        if (e.target.closest('.image-toolbar-btn') || e.target.closest('.replace-image-btn')) {
          return
        }
        
        // 检查是否点击了图片容器（更宽泛的选择器，包括所有可能的图片容器）
        let imageContainer = e.target.closest('.image-container.image-with-toolbar')
        if (!imageContainer) {
          imageContainer = e.target.closest('.editor-image-content')
        }
        if (!imageContainer) {
          imageContainer = e.target.closest('.image-container')
        }
        if (!imageContainer) {
          // 检查是否是带有背景图片的div（photo-card-item内的图片）
          const target = e.target
          if (target) {
            const computedStyle = window.getComputedStyle(target)
            const bgImage = target.style.backgroundImage || computedStyle.backgroundImage
            if (bgImage && bgImage !== 'none') {
              // 如果点击的元素本身有背景图片，使用它作为容器
              if (target.tagName === 'DIV' && (bgImage.includes('url') || bgImage.includes('background-image'))) {
                imageContainer = target
              } else {
                imageContainer = target.closest('[style*="background-image"], [class*="image"]')
              }
            }
          }
        }
        if (!imageContainer) {
          // 检查是否在photo-card-item内
          const photoCardItem = e.target.closest('.photo-card-item')
          if (photoCardItem) {
            // 优先查找image-container
            imageContainer = photoCardItem.querySelector('.image-container')
            // 如果没有，查找带有背景图片的div
            if (!imageContainer) {
              const divs = photoCardItem.querySelectorAll('div')
              for (let div of divs) {
                const style = window.getComputedStyle(div)
                if (style.backgroundImage && style.backgroundImage !== 'none') {
                  imageContainer = div
                  break
                }
              }
            }
            // 如果还是没有，使用第一个div
            if (!imageContainer) {
              imageContainer = photoCardItem.querySelector('div')
            }
          }
        }
        
        if (imageContainer) {
          // 确保图片容器在编辑区域内，如果不在编辑区域内（比如在样式库中），不显示工具栏
          if (!editableArea.value || !editableArea.value.contains(imageContainer)) {
            return
          }
          
          // 立即设置标志位，防止触发内容变化事件（在事件处理之前就设置）
          isImageToolbarUpdating = true
          lastImageClickTime = Date.now() // 记录点击图片的时间
          console.log('[图片点击] 设置 isImageToolbarUpdating = true，防止触发内容变化')
          
          // 阻止事件冒泡和默认行为，避免触发编辑区域的点击处理和焦点
          // 必须在所有操作之前阻止事件，防止其他监听器处理
          e.stopImmediatePropagation() // 先阻止同一元素上的其他事件监听器
          e.stopPropagation() // 阻止事件冒泡
          e.preventDefault() // 阻止默认行为
          
          // 确保 selectedElement 不会被设置为图片元素，防止误触发复制
          if (selectedElement.value === imageContainer || 
              selectedElement.value?.closest('.image-container') === imageContainer ||
              selectedElement.value?.closest('.editor-image-content') === imageContainer) {
            selectedElement.value = null
            showElementActions.value = false
            console.log('[图片点击] 清空 selectedElement，防止误触发复制')
          }
          
          // 使用 requestAnimationFrame 确保所有DOM修改都在下一个事件循环中进行
          // 这样可以确保标志位已经设置，并且所有input事件都会被拦截
          requestAnimationFrame(() => {
          try {
            // 确保容器有相对定位
            if (imageContainer.style.position !== 'relative' && !imageContainer.style.position) {
              imageContainer.style.position = 'relative'
            }
            
            // 设置图片容器不可编辑
            imageContainer.setAttribute('contenteditable', 'false')
            // 确保图片容器内的所有元素都不可编辑
            imageContainer.querySelectorAll('*').forEach(child => {
              child.setAttribute('contenteditable', 'false')
            })
            
            // 如果图片还没有工具栏，动态添加
            if (!imageContainer.querySelector('.image-toolbar')) {
              console.log('[图片点击] 准备添加工具栏')
              const imageId = imageContainer.getAttribute('data-image-id') || `image_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
              imageContainer.setAttribute('data-image-id', imageId)
              imageContainer.classList.add('image-with-toolbar')
              
              const toolbar = document.createElement('div')
              toolbar.className = 'image-toolbar'
                // 确保工具栏在小图片上也能正常显示，使用更高的z-index和更小的尺寸
                toolbar.style.cssText = 'position: absolute; top: 4px; right: 4px; background: white; border: 1px solid #e0e0e0; border-radius: 4px; padding: 2px; display: flex; flex-direction: row; gap: 2px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); z-index: 10001; flex-wrap: wrap; max-width: calc(100% - 8px);'
              toolbar.setAttribute('contenteditable', 'false')
              
              const actions = [
                { action: 'move-up', text: tt('advancedEditor.element.moveUp'), bg: '#4CAF50' },
                { action: 'move-down', text: tt('advancedEditor.element.moveDown'), bg: '#4CAF50' },
                { action: 'copy', text: tt('advancedEditor.element.copy'), bg: '#2196F3' },
                { action: 'delete', text: tt('advancedEditor.element.delete'), bg: '#f44336' }
              ]
              
              actions.forEach(({ action, text, bg }) => {
                const btn = document.createElement('button')
                btn.className = 'image-toolbar-btn'
                btn.setAttribute('data-action', action)
                btn.setAttribute('data-image-id', imageId)
                btn.setAttribute('contenteditable', 'false')
                btn.setAttribute('type', 'button') // 确保按钮不会提交表单
                  // 优化按钮样式，确保在小图片上也能正常显示
                  btn.style.cssText = `padding: 3px 8px; background: ${bg}; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 11px; white-space: nowrap; line-height: 1.2; min-width: auto;`
                btn.textContent = text
                toolbar.appendChild(btn)
              })
              
              // 在添加工具栏之前，确保标志位已设置，防止触发内容变化
              // 直接添加工具栏，因为 isImageToolbarUpdating 已经在前面设置了
              console.log('[图片点击] 添加工具栏到图片容器，isImageToolbarUpdating =', isImageToolbarUpdating)
              imageContainer.appendChild(toolbar)
              console.log('[图片点击] 工具栏已添加')
            }
            
            // 隐藏所有工具栏
            document.querySelectorAll('.image-toolbar').forEach(toolbar => {
              toolbar.style.display = 'none'
            })
            
            // 移除所有图片的选中状态
            document.querySelectorAll('.image-selected').forEach(img => {
              img.classList.remove('image-selected')
            })
            
            // 添加当前图片的选中状态（蓝色边框）
            imageContainer.classList.add('image-selected')
            
            // 显示当前图片的工具栏
            const toolbar = imageContainer.querySelector('.image-toolbar')
            if (toolbar) {
              toolbar.style.display = 'flex'
              console.log('[图片选中] 显示蓝色边框和工具栏', imageContainer)
            } else {
              console.warn('[图片选中] 未找到工具栏', imageContainer)
            }
            
            // 阻止编辑区域获得焦点
            if (editableArea.value) {
              editableArea.value.blur()
            }
            } catch (error) {
              console.error('[图片点击] 处理图片点击时出错:', error)
          } finally {
            // 延迟重置标志位，确保所有DOM操作完成，并且确保不会触发内容变化事件
            // 使用较长的延迟时间，确保所有异步操作和事件处理完成
              // 使用一个变量来跟踪是否已经设置了重置定时器，避免重复设置
              if (!imageContainer.hasAttribute('data-reset-scheduled')) {
                imageContainer.setAttribute('data-reset-scheduled', 'true')
            setTimeout(() => {
              console.log('[图片点击] 重置 isImageToolbarUpdating = false')
              isImageToolbarUpdating = false
                  // 更新点击时间，确保在标志位重置后仍然有保护期
                  lastImageClickTime = Date.now()
                  imageContainer.removeAttribute('data-reset-scheduled')
                }, 5000) // 延迟5秒，确保所有事件处理完成，防止内容变化事件触发
          }
            }
          })
        } else {
          // 点击其他地方，隐藏所有工具栏并移除选中状态
          document.querySelectorAll('.image-toolbar').forEach(toolbar => {
            toolbar.style.display = 'none'
          })
          document.querySelectorAll('.image-selected').forEach(img => {
            img.classList.remove('image-selected')
          })
        }
      }, true)
      
      document.hasImageToolbarListener = true
    }
    
    // 处理表单组件工具栏按钮点击
    document.addEventListener('click', (e) => {
      if (e.target.classList && e.target.classList.contains('form-toolbar-btn')) {
        e.stopPropagation() // 阻止事件冒泡，避免触发组件选中
        const action = e.target.getAttribute('data-action')
        const componentId = parseInt(e.target.getAttribute('data-component-id'))
        
        // 如果按钮被禁用，不执行操作
        if (e.target.disabled) {
          return
        }
        
        if (action === 'move-up') {
          moveComponentUp(componentId)
        } else if (action === 'move-down') {
          moveComponentDown(componentId)
        } else if (action === 'copy') {
          copyFormComponent(componentId)
        } else if (action === 'delete') {
          if (confirm(tt('advancedEditor.confirm.deleteComponent'))) {
            deleteFormComponent(componentId)
          }
        }
      } else if (e.target.classList && e.target.classList.contains('delete-image-btn')) {
        e.stopPropagation()
        const componentId = parseInt(e.target.getAttribute('data-component-id'))
        if (componentId) {
          const index = formComponents.value.findIndex(c => c.id === componentId)
          if (index !== -1) {
            formComponents.value[index].imageUrl = ''
            formComponentsRenderKey.value++
            generateQR()
          }
        }
      } else if (e.target.closest('.form-component-display')) {
        // 点击组件本身，选中该组件并打开编辑面板
        // 排除输入框、文本域等交互元素，但允许点击标签等元素
        const targetInput = e.target.tagName === 'INPUT' ? e.target : e.target.closest('input')
        const inputType = targetInput ? targetInput.type : null
        
        // 检查是否是评分或NPS组件内的交互元素
        // NPS组件内的数字选项是span元素，有cursor: pointer样式
        // 评分组件内的星星是文本字符，但点击时也不应该显示编辑面板
        const componentDisplay = e.target.closest('.form-component-display')
        let isRatingOrNpsInteractive = false
        
        if (componentDisplay) {
          // 检查NPS组件内的数字选项span（有cursor: pointer样式）
          if (e.target.tagName === 'SPAN') {
            const style = getComputedStyle(e.target)
            const inlineStyle = e.target.getAttribute('style') || ''
            if (style.cursor === 'pointer' || inlineStyle.includes('cursor: pointer')) {
              isRatingOrNpsInteractive = true
            }
          }
          
          // 检查评分组件内的星星（包含星星的div或其子元素）
          const parentDiv = e.target.closest('div')
          if (parentDiv && parentDiv.textContent && parentDiv.textContent.includes('⭐')) {
            const parentStyle = getComputedStyle(parentDiv)
            if (parentStyle.display === 'flex' && parentDiv.textContent.trim().match(/^⭐+$/)) {
              isRatingOrNpsInteractive = true
            }
          }
        }
        
        const isInteractiveElement = (e.target.tagName === 'INPUT' && inputType !== 'radio' && inputType !== 'checkbox') || 
                                     e.target.tagName === 'TEXTAREA' || 
                                     e.target.tagName === 'SELECT' ||
                                     (e.target.tagName === 'BUTTON' && !e.target.closest('.form-component-display')) ||
                                     (targetInput && inputType !== 'radio' && inputType !== 'checkbox') ||
                                     e.target.closest('textarea') ||
                                     e.target.closest('select') ||
                                     (e.target.closest('button') && !e.target.closest('.form-component-display')) ||
                                     e.target.closest('.form-image-input') ||
                                     e.target.classList.contains('nps-number') ||
                                     e.target.classList.contains('rating-star') ||
                                     inputType === 'date' ||
                                     inputType === 'time' ||
                                     isRatingOrNpsInteractive
        
        if (!isInteractiveElement) {
          const componentElement = e.target.closest('.form-component-display')
          const componentId = parseInt(componentElement.getAttribute('data-component-id'))
          if (componentId) {
            const component = formComponents.value.find(c => c.id === componentId)
            // 这些组件类型点击时不显示编辑面板
            const noEditPanelTypes = ['time', 'rating', 'nps', 'date', 'location', 'gender']
            if (component && noEditPanelTypes.includes(component.type)) {
              // 这些组件点击时不显示编辑面板，只选中组件
              selectedComponentId.value = componentId
              return
            }
            
            selectedComponentId.value = componentId
            // 打开编辑面板
            if (component) {
              // 创建编辑副本，确保响应式更新
              editingComponent.value = {
                id: component.id,
                type: component.type,
                label: component.label || '',
                placeholder: component.placeholder || '',
                required: component.required || false,
                content: component.content || '',
                autoFill: component.autoFill || false,
                imageUrl: component.imageUrl || '',
                value: component.value || '',
                npsValue: component.npsValue !== null ? component.npsValue : null,
                ratingValue: component.ratingValue !== null ? component.ratingValue : null,
                options: component.options ? [...component.options] : (component.type === 'radio' || component.type === 'checkbox' || component.type === 'checklist' ? ['选项1', '选项2'] : [])
              }
            }
          }
        }
      } else if (!e.target.closest('.form-component-toolbar') && 
                 !e.target.closest('.form-component-display') &&
                 !e.target.closest('.component-edit-panel') &&
                 !e.target.closest('.form-settings-sidebar')) {
        // 点击外部区域，取消选中和编辑面板
        selectedComponentId.value = null
        editingComponent.value = null
      }
    })
  })
  
  // 点击外部关闭下拉菜单（使用捕获阶段，但延迟执行，确保 Vue 事件处理先执行）
  document.addEventListener('click', (e) => {
    const target = e.target
    
    // 优先检查是否是评分或NPS组件的交互元素，如果是则直接返回，不处理
    if (target.closest('.rating-star') || 
        target.closest('.rating-stars') ||
        target.closest('.nps-number') ||
        target.closest('.nps-scale')) {
      return
    }
    
    // 排除所有不应该被处理的元素，避免干扰正常交互
    // 1. 模态框内的所有元素（优先检查，避免其他逻辑干扰）
    // 特别注意：检查按钮及其所有父元素，确保按钮点击不被干扰
    const isInModal = target.closest('.modal') || 
                      target.closest('.modal-content-large') || 
                      target.closest('.modal-content-medium') ||
                      target.closest('.modal-content') ||
                      target.closest('.image-settings-modal') ||
                      target.classList.contains('confirm-btn') ||
                      target.closest('.confirm-btn') ||
                      target.closest('.modal-footer') ||
                      target.closest('.modal-header') ||
                      target.closest('.modal-body') ||
                      target.closest('.component-edit-panel') ||
                      target.closest('.form-settings-sidebar')
    
    if (isInModal) {
      // 如果在模态框内或编辑面板内，直接返回，不处理
      console.log('[全局点击] 在模态框内，忽略点击事件')
      return
    }
    
    console.log('[全局点击] ========== 全局点击事件触发 ==========')
    console.log('[全局点击] 点击目标:', target.tagName, target.className, target)
    console.log('[全局点击] 是否在模态框内:', target.closest('.modal'))
    console.log('[全局点击] 是否在确认按钮:', target.classList.contains('confirm-btn') || target.closest('.confirm-btn'))
    
    console.log('[全局点击] 不在模态框内，继续处理...')
    
    // 2. 所有按钮（除了工具栏下拉菜单按钮）
    if (target.tagName === 'BUTTON' || target.closest('button')) {
      // 只处理工具栏的下拉菜单按钮，其他按钮直接返回
      if (!target.closest('.toolbar-dropdown') && 
          !target.closest('.toolbar') &&
          !target.classList.contains('dropdown-btn')) {
        return
      }
    }
    
    // 3. 图片上传区域（包括模态框内的上传区域）
    if (target.closest('.image-upload-area') || 
        target.closest('.image-upload-section') ||
        target.classList.contains('upload-icon') ||
        target.closest('.upload-placeholder')) {
      return
    }
    
    // 4. 编辑区域（editable-area）
    if (target.closest('.editable-area')) {
      return
    }
    
    // 5. 右侧预览区域的按钮和交互元素
    if (target.closest('.qr-preview-sidebar') || 
        target.closest('.action-buttons') ||
        target.closest('.variable-fields')) {
      return
    }
    
    // 6. 内容类型按钮
    if (target.classList.contains('content-type-btn') || 
        target.closest('.content-type-btn')) {
      return
    }
    
    // 7. 编辑器内容区域（editor-content）
    if (target.closest('.editor-content')) {
      return
    }
    
    setTimeout(() => {
      // 检查点击目标是否在下拉菜单或按钮内部
      const isInsideDropdown = target.closest('.toolbar-dropdown') || 
                              target.closest('.dropdown-menu') || 
                              target.closest('.color-dropdown-menu') ||
                              target.closest('.dropdown-btn') ||
                              target.closest('.dropdown-item') ||
                              target.closest('.color-swatch-small') ||
                              target.closest('.color-swatch-grid') ||
                              target.closest('.custom-color-btn')
      
      console.log('[工具栏日志] 全局点击事件触发')
      console.log('[工具栏日志] 点击目标:', target.tagName, target.className, target)
      console.log('[工具栏日志] 是否在下拉菜单内:', isInsideDropdown)
      console.log('[工具栏日志] 当前下拉菜单状态 - 行高:', showLineHeightDropdown.value, '前景色:', showForegroundColorDropdown.value, '背景色:', showBackgroundColorDropdown.value)
      
      if (!isInsideDropdown) {
        console.log('[工具栏日志] 点击外部，关闭所有下拉菜单')
        showLineHeightDropdown.value = false
        showForegroundColorDropdown.value = false
        showBackgroundColorDropdown.value = false
        showHeadingStyleDropdown.value = false
      } else {
        console.log('[工具栏日志] 点击在下拉菜单内，保持打开状态')
      }
    }, 10)
  })
  
  // 键盘快捷键：清除格式 (Ctrl+\)
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === '\\') {
      e.preventDefault()
      clearFormat()
    }
  })
  
  // 监听选择变化（检查格式状态）
  const handleSelectionChange = () => {
    checkFormatState()
  }
  document.addEventListener('selectionchange', handleSelectionChange)
})
</script>

<style scoped>
.advanced-editor {
  width: 100%;
  background: #f5f5f5;
  box-sizing: border-box;
}

.editor-layout {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
  box-sizing: border-box;
}

/* 编辑器主界面中隐藏侧边栏（已移到模态框） */
.editor-layout > .style-library,
.editor-layout > .qr-preview-sidebar {
  display: none !important;
}

/* 预览弹窗中显示内容 */
.preview-settings-modal .qr-preview-sidebar {
  display: flex !important;
  flex-direction: column;
}

.editor-content {
  background: white;
  padding: 5px 15px;
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
  box-sizing: border-box;
  min-width: 0;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.toolbar-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-bottom: 4px;
  flex-wrap: wrap;
  position: sticky;
  top: 0;
  z-index: 10;
  background: white;
  padding: 0;
  margin-top: 0;
}

.style-library-toggle-btn,
.preview-toggle-btn {
  padding: 6px 15px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  border: 1px solid #e0e0e0;
  background: white;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #333;
  flex-shrink: 0;
}

.style-library-toggle-btn:hover,
.preview-toggle-btn:hover {
  background: #f5f5f5;
  border-color: #2196F3;
  color: #2196F3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.1);
}

.generate-btn {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%) !important;
  color: white !important;
  border: none !important;
  font-weight: 600;
}

.generate-btn:hover {
  background: linear-gradient(135deg, #45a049 0%, #3d8b40 100%) !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.preview-settings-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.preview-settings-modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 800px;
  max-height: 95vh;
  min-height: 600px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.preview-settings-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: visible;
  padding: 16px;
  background: #f5f5f5;
  min-height: 500px;
}

.preview-modal-inner {
  width: 100%;
  border: none;
  background: transparent;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-sizing: border-box;
  overflow: visible;
}

.preview-modal-inner .qr-code-display {
  flex-shrink: 0;
}

.preview-modal-inner .action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  flex-shrink: 0;
}

.preview-modal-inner .action-btn {
  flex: 1;
  min-width: 120px;
  padding: 8px 12px;
  font-size: 0.85rem;
}

.preview-modal-inner .variable-fields {
  flex-shrink: 0;
}

.preview-modal-inner .qr-info-panel {
  flex-shrink: 0;
  font-size: 0.85rem;
}

.preview-modal-inner .qr-info-panel .info-row {
  margin-bottom: 6px;
  font-size: 0.85rem;
}

.preview-modal-inner .variable-field-item {
  margin-bottom: 8px;
}

.toolbar-actions {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  gap: 15px;
}

.preview-toggle-btn {
  padding: 10px 20px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s;
}

.preview-toggle-btn:hover {
  background: #45a049;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.style-library-toggle-btn {
  flex: 1;
  margin-bottom: 0 !important;
}

@media (max-width: 1400px) {
  .editor-layout {
    grid-template-columns: 240px 1fr 280px;
  }
}

@media (max-width: 1200px) {
  .editor-layout {
    grid-template-columns: 200px 1fr 260px;
  }
}

@media (max-width: 1024px) {
  .editor-layout {
    grid-template-columns: 180px 1fr 240px;
  }
}

@media (max-width: 900px) {
  .editor-layout {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: calc(100vh - 60px);
    overflow-y: auto;
  }
  
  .style-library {
    display: none; /* 小屏幕时隐藏左侧样式库 */
  }
  
  .editor-content {
    display: flex;
    flex-direction: column;
    overflow: visible;
    flex: 0 0 auto;
    min-height: auto;
    padding-bottom: 0;
  }
  
  .editable-area {
    flex: 1;
    min-height: 300px;
  }
  
  .style-library-toggle-btn {
    display: block !important;
    margin-bottom: 15px;
    padding: 10px 20px;
    background: #2196F3;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    width: 100%;
    max-width: 200px;
    flex-shrink: 0;
  }
  
  /* 小屏幕时，将二维码预览内容移到编辑区域下方，作为同一滚动模块的一部分 */
  .qr-preview-sidebar {
    display: flex;
    flex-direction: column;
    background: white;
    border-top: 1px solid #e0e0e0;
    padding: 20px;
    overflow: visible;
    flex-shrink: 0;
    margin-top: 0;
  }
}

@media (max-width: 768px) {
  .advanced-editor {
    height: calc(100vh - 80px);
  }
  
  .editor-layout {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    height: 100%;
  }
  
  .style-library {
    display: none; /* 小屏幕时隐藏左侧样式库 */
  }
  
  .editor-content {
    padding: 15px;
    display: flex;
    flex-direction: column;
    overflow: visible;
    flex: 0 0 auto;
    min-height: auto;
    padding-bottom: 0;
  }
  
  .editable-area {
    flex: 1;
    min-height: 300px;
  }
  
  .style-library-toggle-btn {
    display: block !important;
    margin-bottom: 15px;
    padding: 10px 20px;
    background: #2196F3;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    width: 100%;
    max-width: 200px;
    flex-shrink: 0;
  }
  
  /* 小屏幕时，将二维码预览内容移到编辑区域下方，作为同一滚动模块的一部分 */
  .qr-preview-sidebar {
    display: flex;
    flex-direction: column;
    background: white;
    border-top: 1px solid #e0e0e0;
    padding: 20px;
    overflow: visible;
    flex-shrink: 0;
    margin-top: 0;
  }

.toolbar {
  padding: 2px 8px;
  gap: 4px;
}

.toolbar-btn {
  padding: 2px 6px;
  font-size: 0.8rem;
}

.editable-area {
  padding: 5px 15px;
  min-height: 450px;
  flex: 1;
}
  
.page-title-input {
  margin-bottom: 4px;
}

.title-input-field {
  padding: 4px 35px 4px 12px;
  font-size: 1rem;
}

.content-type-icons {
  gap: 8px;
  margin-bottom: 4px;
  padding-bottom: 4px;
}
  
  .content-type-btn {
  width: 34px;
  height: 34px;
  font-size: 1.1rem;
}
}

@media (max-width: 480px) {
  .advanced-editor {
    height: calc(100vh - 100px);
  }
  
  .editor-layout {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    height: 100%;
  }
  
  .style-library {
    display: none; /* 小屏幕时隐藏左侧样式库 */
  }
  
  .style-library-modal .modal-content {
    width: 95vw;
    max-width: 95vw;
  }
  
  .editor-content {
    padding: 10px;
    display: flex;
    flex-direction: column;
    overflow: visible;
    flex: 0 0 auto;
    min-height: auto;
    padding-bottom: 0;
  }
  
  .editable-area {
    padding: 10px;
    min-height: 250px;
    font-size: 13px;
    flex: 1;
  }
  
  /* 小屏幕时，将二维码预览内容移到编辑区域下方，作为同一滚动模块的一部分 */
  .qr-preview-sidebar {
    display: flex;
    flex-direction: column;
    background: white;
    border-top: 1px solid #e0e0e0;
    padding: 15px;
    overflow: visible;
    flex-shrink: 0;
    margin-top: 0;
  }
  
  .style-library-toggle-btn {
    display: block !important;
    margin-bottom: 15px;
    padding: 10px 20px;
    background: #2196F3;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    width: 100%;
    max-width: 200px;
    flex-shrink: 0;
  }
  
  .toolbar {
    padding: 8px;
    gap: 4px;
    flex-wrap: wrap;
  }
  
  .toolbar-btn {
    padding: 4px 6px;
    font-size: 0.75rem;
  }
  
  .library-title {
    font-size: 1rem;
    margin-bottom: 15px;
  }
  
  .element-tabs {
    gap: 6px;
    margin-bottom: 15px;
  }
  
  .element-tab {
    padding: 4px 8px;
    font-size: 0.8rem;
    border-width: 2px;
  }
  
  .element-tab.active {
    font-weight: 600;
    box-shadow: 0 3px 8px rgba(33, 150, 243, 0.4);
  }
  
  .element-tab.active::before {
    margin-right: 4px;
    font-size: 0.75rem;
  }
  
  .template-item {
    padding: 10px;
  }
  
  .confirm-dialog {
    min-width: 90%;
    max-width: 90%;
    padding: 20px;
  }
}

/* 左侧样式库 */
.style-library {
  background: white;
  border-right: 1px solid #e0e0e0;
  padding: 20px;
  overflow-y: auto;
}

.library-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
}

.color-selector {
  margin-bottom: 20px;
}

.color-selector label {
  display: block;
  margin-bottom: 8px;
  font-size: 0.9rem;
  color: #666;
}

.background-image-upload {
  display: flex;
  align-items: center;
}

.upload-btn {
  padding: 8px 16px;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.upload-btn:hover {
  background-color: #1976D2;
}

.clear-btn {
  padding: 8px 16px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.clear-btn:hover {
  background-color: #d32f2f;
}

/* 样式库模态框内容样式 */
.style-library-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.style-library-content .library-title {
  display: none; /* 在模态框中隐藏标题，因为模态框已有标题 */
}

/* 颜色选择器样式优化 */
.color-selector {
  background: white;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.color-selector label {
  display: block;
  margin-bottom: 10px;
  font-weight: 500;
  color: #333;
}

.color-picker-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.color-input {
  width: 50px;
  height: 50px;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  padding: 0;
  overflow: hidden;
}

.color-preview {
  width: 36px;
  height: 36px;
  border: 1px solid #ddd;
  border-radius: 50%;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

/* 元素标签页样式优化 */
.element-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
}

.element-tab {
  padding: 8px 16px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
  color: #666;
  position: relative;
}

.element-tab:hover {
  background: #f5f5f5;
  color: #333;
  border-color: #bdbdbd;
  transform: translateY(-1px);
}

.element-tab.active {
  background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
  color: white;
  border-color: #1976D2;
  border-width: 2px;
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.4);
  font-weight: 600;
  transform: translateY(-2px);
}

.element-tab.active::before {
  content: '✓';
  display: inline-block;
  margin-right: 6px;
  font-size: 0.85rem;
  font-weight: bold;
}

/* 模板列表样式优化 */
.template-examples {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100%, 1fr));
  gap: 15px;
}

.template-item {
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  background: white;
}

.template-item:hover {
  border-color: #2196F3;
  background: #f0f7ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.template-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.template-field {
  font-size: 0.85rem;
  color: #666;
  padding: 4px 0;
}

/* 模板预览样式 */
.template-plain-item {
  margin-bottom: 8px;
}

.template-plain-item .field-label {
  color: #666;
  margin-right: 8px;
}

.template-plain-item .field-value {
  color: #333;
}

.template-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
}

.template-table td {
  padding: 6px 8px;
  border: 1px solid #e0e0e0;
}

.template-table .table-label {
  color: #666;
  background: #fafafa;
  font-weight: 500;
}

.template-table.shaded-table .table-label {
  background: #f5f5f5;
}

.template-table .table-value {
  color: #333;
}

.template-colon-item {
  font-size: 0.85rem;
  color: #333;
}

/* 标题模板样式 */
.title-template {
  padding: 8px 0;
  border-bottom: 2px solid #e0e0e0;
}

.title-template-preview {
  padding: 8px;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 正文模板样式 */
.body-template {
  padding: 6px 0;
}

.body-template-preview {
  padding: 8px;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 图片模板样式 */
.image-template .image-placeholder {
  border: 2px dashed #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  color: #999;
  font-size: 0.75rem;
  margin: 0 auto;
}

.image-template-preview {
  padding: 8px;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 图标组样式 */
.editor-image-group {
  display: flex !important;
  justify-content: space-around !important;
  align-items: center !important;
  width: 100% !important;
  box-sizing: border-box !important;
  flex-wrap: wrap !important;
  gap: 16px !important;
}

.editor-image-group > div {
  flex: 1 !important;
  min-width: 100px !important;
  max-width: 200px !important;
  text-align: center !important;
}

/* 分隔线模板样式 */
.divider-template-preview {
  padding: 8px;
  min-height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 导航模板样式 */
.nav-template .nav-items {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.nav-template .nav-item {
  padding: 4px 8px;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 0.75rem;
  color: #333;
}

.nav-template-preview {
  padding: 8px;
  min-height: 60px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  flex-direction: column;
}

/* 表格模板预览样式 */
.table-template-preview {
  padding: 8px;
  min-height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 中央编辑区域 */
.editor-content {
  background: white;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
  box-sizing: border-box;
  min-width: 0;
}

.page-title-input {
  position: relative;
  margin-bottom: 20px;
}

.title-input-field {
  width: 100%;
  padding: 12px 40px 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1.1rem;
  transition: border-color 0.3s;
}

.title-input-field:focus {
  outline: none;
  border-color: #2196F3;
}

.edit-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.2rem;
}

.content-type-icons {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.content-type-btn {
  width: 48px;
  height: 48px;
  border: 1px solid #e0e0e0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.5rem;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.content-type-btn:hover {
  border-color: #2196F3;
  background: #f0f7ff;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.toolbar-btn {
  padding: 6px 12px;
  border: 1px solid #e0e0e0;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.toolbar-btn:hover {
  background: #f5f5f5;
  border-color: #2196F3;
}

.toolbar-separator {
  width: 1px;
  height: 24px;
  background: #e0e0e0;
}

.toolbar-color {
  width: 32px;
  height: 32px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
}

.toolbar-select {
  padding: 6px 8px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 0.85rem;
}

.toolbar-dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-btn {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  min-width: 150px;
  z-index: 1000;
  margin-top: 4px;
}

.dropdown-title {
  padding: 8px 12px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #666;
  border-bottom: 1px solid #e0e0e0;
  background: #f5f5f5;
}

.dropdown-item {
  padding: 8px 12px;
  font-size: 0.9rem;
  cursor: pointer;
  color: #333;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.dropdown-item:hover {
  background: #f0f0f0;
}

.dropdown-item.active {
  background: #e3f2fd;
  color: #2196F3;
}

/* 标题样式下拉菜单 */
.heading-style-menu {
  min-width: 180px;
}

.heading-style-display {
  font-weight: 600;
  display: inline-block;
  min-width: 50px;
  text-align: center;
}

/* 按钮中显示的标题样式预览 */
.heading-style-display.normal {
  font-size: 14px;
}

.heading-style-display.heading-1 {
  font-size: 20px;
}

.heading-style-display.heading-2 {
  font-size: 18px;
}

.heading-style-display.heading-3 {
  font-size: 16px;
}

.heading-style-display.heading-4 {
  font-size: 15px;
}

/* 下拉菜单中的标题样式选项 */
.heading-style-item {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.heading-option-preview {
  font-weight: 600;
  flex: 1;
}

/* 下拉菜单中每个选项的字体大小（与编辑区域中的实际大小一致） */
.heading-option-preview.normal {
  font-size: 16px;
}

.heading-option-preview.heading-1 {
  font-size: 36px;
}

.heading-option-preview.heading-2 {
  font-size: 28px;
}

.heading-option-preview.heading-3 {
  font-size: 22px;
}

.heading-option-preview.heading-4 {
  font-size: 18px;
}

/* 编辑器中的标题样式（字体大小差距明显） */
.editable-area .heading-1 {
  font-size: 36px;
  font-weight: bold;
  line-height: 1.4;
  margin: 20px 0;
}

.editable-area .heading-2 {
  font-size: 28px;
  font-weight: bold;
  line-height: 1.4;
  margin: 16px 0;
}

.editable-area .heading-3 {
  font-size: 22px;
  font-weight: bold;
  line-height: 1.5;
  margin: 14px 0;
}

.editable-area .heading-4 {
  font-size: 18px;
  font-weight: bold;
  line-height: 1.5;
  margin: 12px 0;
}

.editable-area .normal {
  font-size: 16px;
  line-height: 1.6;
  margin: 8px 0;
}


.checkmark {
  color: #2196F3;
  font-weight: bold;
}

/* 颜色下拉菜单 */
.color-dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  width: 320px;
  z-index: 1000;
  margin-top: 4px;
  padding: 12px;
}

.color-dropdown-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.color-dropdown-label {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 8px;
}

.color-swatches-row {
  display: flex;
  gap: 4px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.color-swatch-small {
  width: 24px;
  height: 24px;
  border: 1px solid #e0e0e0;
  border-radius: 3px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.color-swatch-small:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 2px;
  margin-bottom: 12px;
}

.color-swatch-grid {
  width: 100%;
  padding-bottom: 100%;
  border: 1px solid #e0e0e0;
  border-radius: 2px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
}

.color-swatch-grid::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 2px;
}

.color-swatch-grid:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  z-index: 1;
}

.custom-color-btn {
  width: 100%;
  padding: 8px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  color: #666;
  transition: background 0.2s;
}

.custom-color-btn:hover {
  background: #f5f5f5;
}

.editable-area {
  flex: 1;
  min-height: 400px;
  position: relative;
}

.editable-area {
  padding: 20px;
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  background: #fafafa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  overflow-y: auto;
  word-wrap: break-word;
  transition: all 0.3s ease;
}

.editable-area.drag-over {
  background-color: rgba(33, 150, 243, 0.08);
  border: 2px dashed #2196F3;
  border-color: #2196F3;
}

.editable-area:empty::before {
  content: "在此处编辑内容，或从左侧拖拽元素";
  color: #999;
  pointer-events: none;
}

.editable-area:focus {
  border-color: #2196F3;
  outline: none;
}

/* 元素操作按钮容器 */
.element-actions {
  position: fixed;
  display: flex;
  gap: 4px;
  z-index: 10000;
  background: white;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  padding: 4px;
  pointer-events: auto;
}

/* 操作按钮通用样式 */
.element-actions button {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  color: white;
  transition: all 0.2s;
  white-space: nowrap;
}

.element-actions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.element-actions button:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* 上移按钮 */
.action-btn-move-up {
  background: #9e9e9e;
}

.action-btn-move-up:not(:disabled):hover {
  background: #757575;
}

/* 下移按钮 */
.action-btn-move-down {
  background: #9e9e9e;
}

.action-btn-move-down:not(:disabled):hover {
  background: #757575;
}

/* 复制按钮 */
.action-btn-copy {
  background: #2196F3;
}

.action-btn-copy:hover {
  background: #1976D2;
}

/* 删除按钮 */
.action-btn-delete {
  background: #f44336;
}

.action-btn-delete:hover {
  background: #d32f2f;
}

/* 表格操作按钮样式 */
.action-btn-table-insert-row-above,
.action-btn-table-insert-row-below,
.action-btn-table-insert-col-left,
.action-btn-table-insert-col-right {
  background: #4CAF50;
  color: white;
}

.action-btn-table-insert-row-above:hover,
.action-btn-table-insert-row-below:hover,
.action-btn-table-insert-col-left:hover,
.action-btn-table-insert-col-right:hover {
  background: #45a049;
}

.action-btn-table-delete-row,
.action-btn-table-delete-col {
  background: #f44336;
  color: white;
}

.action-btn-table-delete-row:hover,
.action-btn-table-delete-col:hover {
  background: #d32f2f;
}

/* 统一编辑区域内的字体样式 */
.editable-area * {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  box-sizing: border-box;
}

/* 编辑区域内的标题样式 - 明显的字体大小差异 */
.editable-area h1 {
  font-size: 32px;
  font-weight: bold;
  line-height: 1.2;
  margin: 2px 0 1px 0 !important; /* 最小化间距 */
  color: #333;
}

.editable-area h2 {
  font-size: 28px;
  font-weight: bold;
  line-height: 1.3;
  margin: 2px 0 1px 0 !important; /* 最小化间距 */
  color: #333;
}

.editable-area h3 {
  font-size: 24px;
  font-weight: bold;
  line-height: 1.4;
  margin: 2px 0 1px 0 !important; /* 最小化间距 */
  color: #333;
}

.editable-area h4 {
  font-size: 20px;
  font-weight: 600;
  line-height: 1.5;
  margin: 1px 0 1px 0 !important; /* 最小化间距 */
  color: #333;
}

.editable-area h5 {
  font-size: 18px;
  font-weight: 600;
  line-height: 1.5;
  margin: 1px 0 1px 0 !important; /* 最小化间距 */
  color: #333;
}

.editable-area h6 {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.6;
  margin: 1px 0 1px 0 !important; /* 最小化间距 */
  color: #333;
}

.editable-area table {
  font-size: 14px;
  width: 100%;
  border-collapse: collapse;
  margin: 2px 0 !important; /* 最小化间距 */
}

.editable-area div, .editable-area p {
  font-size: 14px;
  line-height: 1.6;
  margin: 1px 0 !important; /* 最小化间距 */
}

/* 列表元素间距 */
.editable-area ul, .editable-area ol {
  margin: 1px 0 !important;
  padding-left: 20px;
}

.editable-area li {
  margin: 0 !important;
  padding: 0;
}

/* 内容块包装器样式 */
.editable-area .content-block-wrapper {
  margin-bottom: 0 !important; /* 紧贴排列，方便上下移交换位置 */
  padding: 12px !important;
  border-radius: 8px !important;
  background: #fafafa !important;
  position: relative !important;
  overflow: visible !important; /* 改为visible以显示outline */
  word-wrap: break-word !important;
  min-height: auto !important;
  display: block !important;
  width: 100% !important;
  box-sizing: border-box !important;
}

/* 内容块包装器内部内容溢出处理 */
.editable-area .content-block-wrapper > * {
  overflow: hidden;
}

/* 元素悬停高亮效果 - 只对最外层容器（content-block-wrapper）生效 */
.editable-area .content-block-wrapper.element-hover-highlight {
  box-shadow: 0 0 0 2px #2196F3 !important;
  border-radius: 8px !important;
  transition: box-shadow 0.2s ease !important;
  position: relative !important;
}

/* 其他元素（不在content-block-wrapper内的）也可以有高亮，但通常不会用到 */
.editable-area > .element-hover-highlight:not(.content-block-wrapper) {
  box-shadow: 0 0 0 2px #2196F3 !important;
  border-radius: 4px !important;
  transition: box-shadow 0.2s ease !important;
  position: relative !important;
}

/* 只允许最外层容器（content-block-wrapper）显示蓝色边框，内部元素不显示 */
.editable-area .content-block-wrapper.element-hover-highlight {
  box-shadow: 0 0 0 2px #2196F3 !important;
  border-radius: 8px !important;
}

/* 移除内部元素的蓝色边框，即使它们有element-hover-highlight类 */
.editable-area .content-block-wrapper > * {
  box-shadow: none !important;
}

.editable-area .content-block-wrapper div.element-hover-highlight,
.editable-area .content-block-wrapper p.element-hover-highlight,
.editable-area .content-block-wrapper h1.element-hover-highlight,
.editable-area .content-block-wrapper h2.element-hover-highlight,
.editable-area .content-block-wrapper h3.element-hover-highlight,
.editable-area .content-block-wrapper h4.element-hover-highlight,
.editable-area .content-block-wrapper h5.element-hover-highlight,
.editable-area .content-block-wrapper h6.element-hover-highlight,
.editable-area .content-block-wrapper ul.element-hover-highlight,
.editable-area .content-block-wrapper ol.element-hover-highlight,
.editable-area .content-block-wrapper li.element-hover-highlight,
.editable-area .content-block-wrapper table.element-hover-highlight {
  box-shadow: none !important;
}

/* 确保内容块内的元素正确显示 */
.editable-area .content-block-wrapper > * {
  max-width: 100% !important;
  word-wrap: break-word !important;
  overflow-wrap: break-word !important;
}

/* 表格在内容块中的样式 */
.editable-area .content-block-wrapper table {
  width: 100% !important;
  table-layout: auto !important;
  word-wrap: break-word !important;
}

.editable-area .content-block-wrapper table td {
  word-wrap: break-word !important;
  overflow-wrap: break-word !important;
  max-width: 50% !important;
}

/* 确保flex布局正确 */
.editable-area .content-block-wrapper[style*="display: flex"] {
  flex-wrap: wrap !important;
  align-items: flex-start !important;
}

/* 图片和视频占位符 */
.editable-area .content-block-wrapper img,
.editable-area .content-block-wrapper video {
  max-width: 100% !important;
  height: auto !important;
  display: block !important;
}

/* 文件元素统一蓝色边框 */
.editable-area .editor-file,
.editable-area .content-block-wrapper .editor-file,
.editable-area .editor-file.element-hover-highlight {
  box-shadow: rgb(33, 150, 243) 0px 0px 0px 2px !important;
  border-radius: 8px !important;
}

/* 图片卡片容器 - 支持并排显示，减小间隔 */
.editable-area .photo-card-item {
  display: inline-block;
  width: calc(50% - 4px);
  margin: 4px 2px;
  vertical-align: top;
  box-sizing: border-box;
  position: relative;
}

/* 确保图片卡片内的图片完整显示 */
.editable-area .photo-card-item > div {
  width: 100%;
  box-sizing: border-box;
}

/* 图片容器hover效果 - 支持所有图片容器类型 */
.editable-area .image-container:hover .replace-image-btn,
.editable-area .editor-image-content:hover .replace-image-btn,
.editable-area .photo-card-item:hover .replace-image-btn,
.editable-area .editor-photo-group-2:hover .replace-image-btn,
.editable-area .editor-photo-group-3:hover .replace-image-btn,
.editable-area .editor-image-grid-6:hover .replace-image-btn,
.editable-area [class*="image-container"]:hover .replace-image-btn,
.editable-area [class*="editor-image-content"]:hover .replace-image-btn,
.editable-area [style*="background-image"]:hover .replace-image-btn,
.editable-area div[style*="background-image"]:hover .replace-image-btn {
  opacity: 1 !important;
  pointer-events: auto !important;
  display: block !important;
  visibility: visible !important;
}

.editable-area .image-container,
.editable-area .editor-image-content {
  position: relative;
  overflow: visible !important; /* 确保工具栏不被裁剪 */
}

/* 图片选中状态 - 蓝色边框 */
.editable-area .image-selected {
  box-shadow: 0 0 0 2px #2196F3 !important;
  border-radius: 8px !important;
  box-sizing: border-box !important;
  position: relative !important;
  /* 临时允许overflow显示，确保边框完整显示 */
  overflow: visible !important;
}

/* 确保边框精确匹配图片容器，不受padding影响 */
.editable-area .image-selected img {
  border-radius: 8px !important;
  display: block !important;
}

/* 对于使用background-image的容器，确保边框准确 */
.editable-area .image-selected[style*="background-image"] {
  box-shadow: 0 0 0 2px #2196F3 !important;
  overflow: visible !important;
}

/* 确保图片容器选中时，边框能完整显示，即使图片很小或靠左 */
/* box-shadow不会被overflow裁剪，但为了保险起见，选中时临时允许overflow */
.editable-area .image-container.image-selected,
.editable-area .editor-image-content.image-selected {
  overflow: visible !important;
}

/* 确保图片容器不可编辑 */
.editable-area .image-container,
.editable-area .editor-image-content {
  user-select: none !important;
  -webkit-user-select: none !important;
  -moz-user-select: none !important;
  -ms-user-select: none !important;
}

.editable-area .image-container *,
.editable-area .editor-image-content * {
  user-select: none !important;
  -webkit-user-select: none !important;
  -moz-user-select: none !important;
  -ms-user-select: none !important;
}

/* 工具栏按钮可以点击 */
.editable-area .image-toolbar,
.editable-area .image-toolbar * {
  user-select: none !important;
  pointer-events: auto !important;
}

.editable-area .image-toolbar-btn {
  pointer-events: auto !important;
  cursor: pointer !important;
  user-select: none !important;
}

/* 图片工具栏样式 */
.editable-area .image-toolbar {
  position: absolute !important;
  top: 4px !important;
  right: 4px !important;
  background: white !important;
  border: 1px solid #e0e0e0 !important;
  border-radius: 4px !important;
  padding: 2px !important;
  display: none !important;
  flex-direction: row !important;
  flex-wrap: wrap !important;
  gap: 2px !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
  z-index: 10001 !important;
  max-width: calc(100% - 8px) !important;
}

/* 选中图片时显示工具栏 */
.editable-area .image-selected .image-toolbar {
  display: flex !important;
}

.editable-area .image-toolbar-btn {
  padding: 3px 8px !important;
  color: white !important;
  border: none !important;
  border-radius: 3px !important;
  cursor: pointer !important;
  font-size: 11px !important;
  white-space: nowrap !important;
  transition: opacity 0.2s !important;
  line-height: 1.2 !important;
  min-width: auto !important;
}

.editable-area .image-toolbar-btn:hover {
  opacity: 0.9 !important;
}

.editable-area .replace-image-btn {
  position: absolute !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
  background: #2196F3 !important;
  color: white !important;
  border: none !important;
  padding: 6px 12px !important;
  border-radius: 4px !important;
  cursor: pointer !important;
  font-size: 12px !important;
  opacity: 0 !important;
  transition: opacity 0.3s ease !important;
  z-index: 10000 !important;
  pointer-events: none !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3) !important;
  white-space: nowrap !important;
  display: block !important;
  visibility: visible !important;
}

.editable-area .replace-image-btn:hover {
  background: #1976D2 !important;
  transform: translate(-50%, -50%) scale(1.05) !important;
}

/* 确保所有包含背景图片的元素在hover时显示按钮 */
.editable-area div[style*="background-image"]:hover .replace-image-btn,
.editable-area .image-container:hover .replace-image-btn,
.editable-area .editor-image-content:hover .replace-image-btn,
.editable-area [style*="background-image"]:hover .replace-image-btn {
  opacity: 1 !important;
  pointer-events: auto !important;
  display: block !important;
  visibility: visible !important;
}

/* 确保图片容器本身可以触发hover效果 */
.editable-area .image-container,
.editable-area .editor-image-content,
.editable-area [style*="background-image"] {
  cursor: pointer;
  position: relative;
}

.editable-area .image-container:hover,
.editable-area .editor-image-content:hover,
.editable-area [style*="background-image"]:hover {
  opacity: 0.95;
}

/* 更通用的hover选择器，确保所有情况都能触发 */
.editable-area div:hover .replace-image-btn,
.editable-area [style*="background-image"]:hover button.replace-image-btn,
.editable-area [style*="background-image"]:hover .replace-image-btn {
  opacity: 1 !important;
  pointer-events: auto !important;
}

/* 手动添加的图片 - 支持并排显示和全宽显示 */
.editable-area .editor-image-content {
  text-align: center;
  margin: 8px 0;
  box-sizing: border-box;
  position: relative;
}

/* 为所有图片容器添加hover效果 - 已合并到上面的选择器中 */

/* 全宽显示的图片（单独添加时） */
.editable-area .editor-image-content.editor-image-fullwidth {
  display: inline-block !important;
  margin: 8px 4px !important;
  vertical-align: top;
  max-width: 100%;
}

.editable-area .editor-image-content.editor-image-fullwidth img {
  width: auto !important;
  max-width: 100% !important;
  height: auto !important;
  max-height: 400px !important;
  object-fit: contain !important; /* 完整显示图片，不裁剪 */
  border-radius: 8px;
  display: block;
  margin: 0 auto;
  background: #f5f5f5; /* 添加背景色，避免空白区域 */
}

/* 并排显示的图片（当前行已有图片时） */
.editable-area .editor-image-content.editor-image-side-by-side {
  display: inline-block !important;
  width: calc(50% - 4px) !important;
  margin: 4px 2px !important;
  vertical-align: top;
}

.editable-area .editor-image-content.editor-image-side-by-side img {
  width: 100% !important;
  max-width: 100% !important;
  height: 400px !important; /* 适配编辑区域大小 */
  min-height: 300px;
  object-fit: contain !important; /* 完整显示图片，不裁剪 */
  border-radius: 8px;
  display: block;
  background: #f5f5f5; /* 添加背景色，避免空白区域 */
}

/* 兼容旧样式（当editor-image-content是inline-block时） */
.editable-area .editor-image-content[style*="inline-block"] {
  display: inline-block;
  width: calc(50% - 4px);
  margin: 4px 2px;
  vertical-align: top;
}

.editable-area .editor-image-content img {
  display: block;
  margin: 0 auto;
  max-width: 100%;
  height: 400px; /* 适配编辑区域大小 */
  min-height: 300px;
  object-fit: contain; /* 完整显示图片，不裁剪 */
  border-radius: 8px;
  background: #f5f5f5; /* 添加背景色，避免空白区域 */
}

/* 确保图片卡片和手动添加的图片之间有适当间距（减小） */
.editable-area .photo-card-item + .editor-image-content,
.editable-area .editor-image-content + .photo-card-item {
  margin-top: 2px;
}

.content-item {
  margin: 2px 0;
  border: 1px dashed #ddd;
  border-radius: 6px;
  transition: all 0.3s;
}

.content-item:hover {
  border-color: #2196F3;
  background: #f0f7ff;
}

.template-field-item {
  padding: 8px 12px;
  border-left: 3px solid #2196F3;
  background: #f5f5f5;
  margin-bottom: 8px;
  border-radius: 4px;
}

.title-element {
  border-radius: 8px;
  transition: all 0.3s;
}

.title-element:hover {
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.element-item {
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  transition: all 0.3s;
}

.element-item:hover {
  border-color: #2196F3;
  background: #f0f7ff;
}

.content-block {
  margin-bottom: 16px;
  padding: 12px;
  border-radius: 6px;
  background: white;
}

/* 右侧二维码预览 */
.qr-preview-sidebar {
  background: white;
  border-left: 1px solid #e0e0e0;
  padding: 20px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  width: 100%;
  box-sizing: border-box;
  min-width: 0;
}


/* 样式库按钮（默认隐藏，小屏幕时显示） */
/* 样式库按钮始终显示 */

.background-btn {
  align-self: flex-start;
  padding: 6px 12px;
  border: 1px solid #e0e0e0;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  margin-bottom: 20px;
}

.qr-code-display {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  padding: 20px;
  background: #fafafa;
  border-radius: 8px;
}

.qr-canvas {
  max-width: 100%;
  height: auto;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.action-btn {
  padding: 12px;
  border: 1px solid #e0e0e0;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.action-btn:hover {
  background: #f5f5f5;
  border-color: #2196F3;
}

.action-btn.primary {
  background: #2196F3;
  color: white;
  border-color: #2196F3;
}

.action-btn.primary:hover {
  background: #1976D2;
}

/* 二维码信息面板 */
.qr-info-panel {
  background: linear-gradient(135deg, #e0f7fa 0%, #e8f5e9 100%);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  margin-top: 20px;
}

.qr-info-panel .info-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  color: #2e7d32;
  margin-bottom: 15px;
  font-size: 1rem;
}

.qr-info-panel .success-icon {
  font-size: 1.2rem;
}

.qr-info-panel .info-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.qr-info-panel .info-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.qr-info-panel .content-row {
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
}

.qr-info-panel .info-label {
  color: #666;
  font-weight: 500;
}

.qr-info-panel .info-value {
  color: #333;
  font-weight: 400;
}

.qr-info-panel .actual-content {
  font-family: 'Courier New', monospace;
  background: #fff;
  padding: 8px;
  border-radius: 4px;
  word-break: break-all;
  max-height: 150px;
  overflow-y: auto;
  font-size: 0.85rem;
  width: 100%;
  box-sizing: border-box;
}

.variable-fields {
  border-top: 1px solid #e0e0e0;
  padding-top: 12px;
  max-height: none;
  overflow: visible;
  width: 100%;
  box-sizing: border-box;
  min-width: 0;
}

.variable-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 0.85rem;
  font-weight: 500;
}

.add-field-btn {
  padding: 3px 10px;
  border: 1px solid #2196F3;
  background: white;
  color: #2196F3;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.75rem;
  white-space: nowrap;
}

.variable-field-item {
  display: grid;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 6px;
  align-items: flex-start;
  justify-content: flex-start;
  min-width: 0;
  width: auto;
  box-sizing: border-box;
  overflow: visible;
}

.field-button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border: 1px solid #e0e0e0;
  background: #fffacd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  flex: 0 0 auto;
  max-width: 150px;
  min-width: 0;
}

.field-button:hover {
  background: #fff8dc;
  border-color: #2196F3;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.field-button:active {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.field-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 3px;
  font-size: 0.75rem;
  font-weight: bold;
  flex-shrink: 0;
}

.field-number {
  font-size: 0.8rem;
  font-weight: 600;
  color: #333;
}

.field-actions {
  display: flex;
  gap: 4px;
  align-items: center;
  flex-shrink: 0;
  margin-left: auto;
  visibility: visible;
  opacity: 1;
}

.variable-field-item .edit-btn {
  padding: 3px 8px;
  border: 1px solid #2196F3;
  background: white;
  color: #2196F3;
  border-radius: 3px;
  cursor: pointer;
  font-size: 0.7rem;
  white-space: nowrap;
  flex-shrink: 0;
}

.variable-field-item .edit-btn:hover {
  background: #2196F3;
  color: white;
}

.variable-field-item .delete-btn {
  padding: 3px 8px;
  border: 1px solid #f44336;
  background: white;
  color: #f44336;
  border-radius: 3px;
  cursor: pointer;
  font-size: 0.7rem;
  white-space: nowrap;
  flex-shrink: 0;
}

.variable-field-item .delete-btn:hover {
  background: #f44336;
  color: white;
}

/* 模态框 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 12px;
  min-width: 400px;
}

.modal-content h3 {
  margin-bottom: 20px;
}

.style-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

.style-options label {
  font-size: 0.9rem;
  color: #666;
}

.style-options input,
.style-options select {
  padding: 8px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.modal-content button {
  width: 100%;
  padding: 12px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
}

/* 模态框头部 */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
}

.modal-header .close-btn {
  width: 20px;
  height: 32px;
  border: none;
  background-color: rgba(250, 250, 250, 1);
  font-size: 1.5rem;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  border-radius: 5px;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
  border-bottom-left-radius: 5px;
  padding: 0;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  opacity: 1;
}

.modal-header .close-btn:hover {
  background: #f5f5f5;
}

/* 样式库模态框 */
.style-library-modal .modal-content {
  max-width: 90vw;
  max-height: 90vh;
  width: 600px;
  overflow-y: auto;
  padding: 20px;
}

.style-library-modal-content {
  max-height: calc(90vh - 100px);
  overflow-y: auto;
}

.style-library-content {
  padding: 0;
  color: #333;
}

/* 模态框内容 - 大尺寸 */
.modal-content-large {
  background: white;
  border-radius: 12px;
  min-width: 600px;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 24px;
}

/* 模态框内容 - 中等尺寸 */
.modal-content-medium {
  background: white;
  border-radius: 12px;
  min-width: 500px;
  max-width: 600px;
  max-height: 90vh;
  padding: 24px;
  display: flex;
  flex-direction: column;
}

/* 模态框主体 */
.modal-body {
  padding: 20px;
}

.modal-body .field-description {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 20px;
  line-height: 1.6;
}

.field-type-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.field-type-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px 32px;
  border: 1px solid #e0e0e0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 120px;
}

.field-type-btn:hover {
  border-color: #2196F3;
  background: #f0f7ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.2);
}

.field-type-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 24px;
  font-weight: bold;
}

.field-type-btn:hover .field-type-icon {
  background: #e3f2fd;
  border-color: #2196F3;
}

.field-type-btn span {
  font-size: 0.9rem;
  color: #333;
  font-weight: 500;
}

.modal-body-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-row label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
}

.form-row input {
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: border-color 0.3s;
}

.form-row input:focus {
  outline: none;
  border-color: #2196F3;
}

/* 表格选择器样式 */
.table-grid-selector {
  display: inline-block;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 8px;
  background: white;
}

.table-grid-row {
  display: flex;
  gap: 2px;
  margin-bottom: 2px;
}

.table-grid-row:last-child {
  margin-bottom: 0;
}

.table-grid-cell {
  width: 20px;
  height: 20px;
  border: 1px solid #e0e0e0;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.table-grid-cell:hover {
  background: #e3f2fd;
  border-color: #2196F3;
}

.table-grid-cell.selected {
  background: #2196F3;
  border-color: #1976D2;
}

.table-grid-cell.hovered {
  background: #e3f2fd;
  border-color: #2196F3;
}

.table-size-display {
  margin-top: 12px;
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 6px;
  font-size: 0.9rem;
  color: #666;
  text-align: center;
}

/* 模态框底部 */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
}

.confirm-btn {
  padding: 10px 24px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background 0.3s;
}

.confirm-btn:hover:not(:disabled) {
  background: #1976D2;
}

.confirm-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

.cancel-btn {
  width: 100px;
  border-radius: 18px;
  height: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-top: 10px;
  padding-bottom: 10px;
  margin-top: 10px;
  margin-bottom: 10px;
  margin-left: 3px;
  margin-right: 3px;
}

/* 图片设置模态框 */
.image-settings-modal .modal-body-image {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}

.image-upload-section label,
.image-preview-section label {
  display: block;
  margin-bottom: 12px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
}

/* 多图片上传容器 */
.images-upload-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}

.uploaded-image-item {
  position: relative;
  width: 120px;
  height: 120px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  background: #fafafa;
  cursor: pointer;
  transition: all 0.3s;
}

.uploaded-image-item:hover {
  border-color: #2196F3;
  transform: scale(1.02);
}

.uploaded-image-item.selected {
  border-color: #2196F3;
  border-width: 3px;
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
}

.uploaded-image-item img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

/* 图片上传区域的删除按钮 - 使用更具体的选择器确保样式生效 */
.uploaded-image-item .remove-image-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 28px;
  height: 28px;
  background: #1976D2 !important;
  color: white !important;
  border: none !important;
  border-radius: 4px !important;
  cursor: pointer;
  font-size: 16px !important;
  font-weight: 600 !important;
  display: flex !important;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  line-height: 1;
  padding: 0 !important;
  min-width: 28px !important;
}

.uploaded-image-item .remove-image-btn:hover {
  background: #1565C0 !important;
  transform: scale(1.05);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
}

.uploaded-image-item .remove-image-btn:active {
  transform: scale(0.95);
}

.image-upload-area {
  width: 120px;
  height: 120px;
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  background: #fafafa;
}

.image-upload-area:hover {
  border-color: #2196F3;
  background: #f0f7ff;
}

.upload-placeholder {
  text-align: center;
  color: #999;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.upload-icon {
  font-size: 2rem;
  color: #ccc;
}

.upload-text {
  font-size: 0.85rem;
  color: #999;
}

.background-type-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 背景设置模态框样式 */
.background-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  border-bottom: 2px solid #e0e0e0;
}

.background-tab {
  padding: 10px 20px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-size: 0.95rem;
  color: #666;
  transition: all 0.3s;
  margin-bottom: -2px;
}

.background-tab.active {
  color: #2196F3;
  border-bottom-color: #2196F3;
  font-weight: 500;
}

.background-tab-content {
  min-height: 300px;
}

.background-color-tab,
.background-image-tab {
  padding: 10px 0;
}

.color-section {
  margin-bottom: 24px;
}

.color-section label {
  display: block;
  margin-bottom: 12px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
}

.color-swatches {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.color-swatch {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s;
}

.color-swatch:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.color-swatch.selected {
  border-color: #2196F3;
  box-shadow: 0 0 0 2px white, 0 0 0 4px #2196F3;
}

.custom-color-section,
.text-color-section,
.margin-section {
  margin-bottom: 24px;
}

.custom-color-section label,
.text-color-section label,
.margin-section label {
  display: block;
  margin-bottom: 12px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
}

.custom-color-picker {
  width: 100%;
  height: 50px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
}

.margin-input-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.margin-input {
  flex: 1;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 0.9rem;
}

.margin-input-group span {
  font-size: 0.9rem;
  color: #666;
}

.background-image-upload {
  width: 100%;
  min-height: 200px;
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 16px;
  position: relative;
  overflow: hidden;
}

.background-image-upload:hover {
  border-color: #2196F3;
  background: #f5f5f5;
}

.background-image-preview {
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
  border-radius: 6px;
}

/* 背景图片删除按钮（保留原有样式） */
.background-image-upload + .remove-image-btn,
.background-image-tab .remove-image-btn {
  width: 100%;
  padding: 10px;
  background: #ff4444;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.background-image-upload + .remove-image-btn:hover,
.background-image-tab .remove-image-btn:hover {
  background: #cc0000;
}

/* 视频、音频、文件上传区域 */
/* 文件列表容器 */
.file-list-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 12px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  position: relative;
}

.file-item .file-icon-large {
  font-size: 32px;
  flex-shrink: 0;
}

.file-item .file-info {
  flex: 1;
  min-width: 0;
}

.file-item .file-name {
  font-size: 0.95rem;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  word-break: break-word;
}

.file-item .file-size {
  font-size: 0.85rem;
  color: #666;
}

.file-item .checkbox-label-inline {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: #666;
  cursor: pointer;
  white-space: nowrap;
  margin-left: auto;
  margin-right: 40px;
}

.file-item .checkbox-label-inline input[type="checkbox"] {
  margin: 0;
  cursor: pointer;
}

.file-item .remove-file-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  background: #ff4444;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  flex-shrink: 0;
}

.file-item .remove-file-btn:hover {
  background: #cc0000;
  transform: scale(1.1);
}

.add-file-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  background: #f5f5f5;
  border: 1px dashed #d0d0d0;
  border-radius: 8px;
  color: #666;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
  width: 100%;
}

.add-file-btn:hover:not(:disabled) {
  background: #e8f5e9;
  border-color: #4CAF50;
  color: #4CAF50;
}

.add-file-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

.add-file-btn span:first-child {
  font-size: 1.2rem;
  font-weight: bold;
}

.file-upload-area-large {
  width: 100%;
  min-height: 200px;
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.file-upload-area-large:hover:not(.uploading) {
  border-color: #2196F3;
  background: #f5f5f5;
}

.file-upload-area-large.uploading {
  cursor: not-allowed;
  opacity: 0.7;
  border-color: #2196F3;
  background: #f0f7ff;
}

.upload-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 20px;
}

.upload-loading .spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #2196F3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.upload-loading span {
  font-size: 0.95rem;
  color: #2196F3;
  font-weight: 500;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.uploaded-file-info {
  width: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  position: relative;
}

.file-icon-large {
  font-size: 4rem;
}

.file-name {
  font-size: 1rem;
  font-weight: 500;
  color: #333;
  text-align: center;
  word-break: break-all;
}

.file-size {
  font-size: 0.85rem;
  color: #999;
}

.remove-file-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  background: #ff4444;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.remove-file-btn:hover {
  background: #cc0000;
  transform: scale(1.1);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #333;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #2196F3;
}

.uploaded-image-preview {
  max-width: 100%;
  max-height: 200px;
  object-fit: contain;
  border-radius: 8px;
}

.preview-area {
  width: 100%;
  height: 200px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
}

.preview-image {
  max-width: 100%;
  max-height: 200px;
  object-fit: contain;
}

.image-style-settings,
.image-display-settings {
  margin-bottom: 20px;
}

.image-style-settings label,
.image-display-settings label {
  display: block;
  margin-bottom: 12px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
}

.radio-group {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #666;
}

.radio-label input[type="radio"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #2196F3;
}

.warm-tips {
  margin-bottom: 20px;
  padding: 16px;
  background: #fff9e6;
  border-radius: 8px;
  border-left: 4px solid #ffc107;
}

.warm-tips label {
  display: block;
  margin-bottom: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
}

.tips-content {
  font-size: 0.85rem;
  color: #666;
  line-height: 1.6;
}

.tips-content p {
  margin: 4px 0;
}

.tips-content .link {
  color: #2196F3;
  text-decoration: none;
}

.tips-content .link:hover {
  text-decoration: underline;
}

/* 地图位置按钮 */
.map-location-btn {
  width: 100%;
  padding: 12px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #333;
  transition: all 0.3s;
}

.map-location-btn:hover {
  background: #f5f5f5;
  border-color: #2196F3;
}

/* 表单列表模态框 */
.form-list-body {
  margin-bottom: 20px;
}

.form-list-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.create-form-btn {
  padding: 8px 16px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #333;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s;
}

.create-form-btn:hover {
  background: #f5f5f5;
  border-color: #2196F3;
}

.form-list-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.form-list-table th {
  background: #f5f5f5;
  padding: 12px;
  text-align: left;
  font-weight: 500;
  color: #333;
  border-bottom: 1px solid #e0e0e0;
}

.form-list-table td {
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  color: #666;
}

.form-list-table .empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

/* 创建表单模态框 */
.modal-full {
  padding: 20px;
}

.create-form-modal {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 1400px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.create-form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
  height: 100px;
}

.create-form-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
}

.create-form-header .close-btn {
  border-radius: 4px;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
  border-bottom-left-radius: 4px;
  border-color: rgba(244, 240, 240, 0.1);
  font-size: 20px;
  height: 30px;
  width: 30px;
}

.create-form-body {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.form-canvas-wrapper {
  flex: 1;
  display: block;
  overflow-y: auto;
  background: white;
}

.form-canvas {
  width: 100%;
  padding: 24px;
  background: white;
  position: relative;
  min-height: 100%;
  display: block;
}

.form-toolbar {
  margin-bottom: 16px;
}

.components-toggle-btn {
  padding: 10px 20px;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
  transition: all 0.3s;
}

.components-toggle-btn:hover {
  background: #e8f4fd;
  border-color: #2196F3;
  color: #2196F3;
}

/* 组件选择模态框样式 */
.form-components-modal .modal-content {
  max-width: 90vw;
  max-height: 90vh;
  width: 600px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.form-components-modal-body {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.form-components-panel {
  padding: 20px;
  background: #fafafa;
}

.form-components-panel h4 {
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

/* 编辑区域中的表单设置面板 */
.form-canvas .form-settings-panel {
  display: block;
  clear: both;
  margin-top: 30px;
  padding: 24px;
  background: #fafafa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.components-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-bottom: 24px;
}

.component-item {
  padding: 12px 8px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  text-align: center;
  transition: all 0.3s;
  font-size: 0.8rem;
}

.component-item:hover {
  border-color: #2196F3;
  background: #f0f7ff;
}

.component-icon {
  font-size: 1.5rem;
  margin-bottom: 4px;
}

.form-canvas {
  padding: 20px;
  overflow-y: auto;
  background: white;
}

.form-title-input,
.form-hint-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 0.9rem;
  margin-bottom: 16px;
  box-sizing: border-box;
}

.form-editable-area {
  display: block;
  width: 100%;
  height: auto !important;
  min-height: 400px;
  padding: 20px;
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  background: #fafafa;
  margin-bottom: 30px;
  box-sizing: border-box;
  overflow: visible !important;
}

.empty-form-hint {
  text-align: center;
  color: #999;
  padding: 60px 20px;
  font-size: 1rem;
}

.form-component-item {
  margin-bottom: 16px;
  padding: 12px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
}

.form-component-item:hover {
  border-color: #2196F3;
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.1);
}

.form-component-display {
  position: relative;
}

.form-component-toolbar {
  position: absolute;
  top: 8px;
  right: 8px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 4px;
  display: flex;
  gap: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  z-index: 100;
}

.form-toolbar-btn {
  padding: 4px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
}

.form-toolbar-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

/* 保留原有样式用于兼容性，但不再使用 */
.form-settings-sidebar {
  border-left: 1px solid #e0e0e0;
  padding: 20px;
  overflow-y: auto;
  background: #fafafa;
}

.setting-section {
  margin-bottom: 24px;
}

.setting-section label {
  display: block;
  margin-bottom: 12px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
}

.setting-section input[type="text"],
.setting-section input[type="number"] {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 0.9rem;
}

.setting-subsection {
  margin-top: 12px;
}

.subsection-title {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 8px;
}

.save-form-btn {
  width: 100%;
  padding: 12px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  margin-top: 20px;
  transition: background 0.3s;
}

.save-form-btn:hover {
  background: #1976D2;
}

/* 组件编辑面板样式 */
.component-edit-panel {
  width: 100%;
}

.component-type-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  color: #333;
  margin-bottom: 0;
  cursor: default;
}

.component-type-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: default;
  accent-color: #2196F3;
  pointer-events: none;
}

.setting-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  margin-bottom: 0;
}

.setting-label {
  min-width: 80px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
  margin-bottom: 0;
  flex-shrink: 0;
}

.setting-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 0.9rem;
}

.other-section {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 12px;
}

.other-section .setting-label {
  margin-top: 0;
}

.other-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

/* 字段占位符样式 */
.editable-area .field-placeholder {
  background: #fffacd;
  color: #333;
  padding: 2px 4px;
  border-radius: 3px;
  font-weight: 600;
  display: inline-block;
  user-select: all;
}

/* 文本字段占位符 */
.editable-area .field-text-placeholder {
  background: #fffacd;
  color: #333;
  padding: 2px 4px;
  border-radius: 3px;
  font-weight: 600;
  display: inline-block;
  user-select: all;
}

/* 文档字段卡片样式 */
.editable-area .field-file-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f5f5f5;
  border: 2px solid #333;
  border-radius: 6px;
  margin: 8px 0;
  width: 100%;
  box-sizing: border-box;
  position: relative;
  user-select: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.editable-area .field-file-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.editable-area .field-file-icon svg {
  width: 32px;
  height: 32px;
}

.editable-area .field-file-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.editable-area .field-file-name {
  font-size: 0.9rem;
  color: #333;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}

.editable-area .field-file-size {
  font-size: 0.8rem;
  color: #666;
  line-height: 1.3;
}

.editable-area .field-file-card .field-number-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  background: #fffacd;
  color: #333;
  padding: 3px 8px;
  border-radius: 3px;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.2;
  border: 1px solid #e0e0e0;
}

/* 图片字段卡片样式 */
.editable-area .field-image-card {
  display: inline-block;
  position: relative;
  margin: 4px 0;
  user-select: none;
}

.editable-area .field-image-preview {
  width: 200px;
  height: 150px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
  background: #f5f5f5;
  position: relative;
}

.editable-area .field-image-placeholder-bg {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
  position: relative;
}

.editable-area .field-image-placeholder-bg::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.02) 10px, rgba(0,0,0,0.02) 20px);
}

.editable-area .field-image-card .field-number-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  background: #fffacd;
  color: #333;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.2;
  z-index: 1;
}

/* 选项管理样式 */
.options-manager {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-top: 8px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
}

.option-item-wrapper {
  position: relative;
}

.option-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  min-height: 44px;
  background: white;
}

.option-input {
  flex: 1;
  padding: 0;
  border: none;
  background: transparent;
  font-size: 0.9rem;
  color: #333;
  outline: none;
  margin-right: 12px;
}

.option-input::placeholder {
  color: #999;
}

.option-input:focus {
  color: #333;
}

.remove-option-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #666;
  transition: color 0.2s;
  flex-shrink: 0;
}

.remove-option-btn:hover:not(:disabled) {
  color: #f44336;
}

.remove-option-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.remove-option-btn svg {
  width: 16px;
  height: 16px;
  stroke: currentColor;
}

.option-divider {
  height: 1px;
  background: #e0e0e0;
  margin: 0 16px;
}

.add-option-btn {
  margin: 12px;
  padding: 8px 12px;
  border: 1px dashed #2196F3;
  background: transparent;
  color: #2196F3;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
  text-align: center;
}

.add-option-btn:hover {
  background: #f5f5f5;
  border-color: #1976D2;
  color: #1976D2;
}

/* 选项操作按钮组样式 */
.option-actions-toolbar {
  display: flex;
  gap: 4px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.option-action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
  white-space: nowrap;
}

.option-action-btn.move-up-btn {
  background: #9e9e9e;
  color: white;
}

.option-action-btn.move-up-btn:hover:not(:disabled) {
  background: #757575;
}

.option-action-btn.move-up-btn:disabled {
  background: #e0e0e0;
  color: #bdbdbd;
  cursor: not-allowed;
}

.option-action-btn.move-down-btn {
  background: #9e9e9e;
  color: white;
}

.option-action-btn.move-down-btn:hover:not(:disabled) {
  background: #757575;
}

.option-action-btn.move-down-btn:disabled {
  background: #e0e0e0;
  color: #bdbdbd;
  cursor: not-allowed;
}

.option-action-btn.copy-btn {
  background: #2196F3;
  color: white;
}

.option-action-btn.copy-btn:hover {
  background: #1976D2;
}

.option-action-btn.delete-btn {
  background: #f44336;
  color: white;
}

.option-action-btn.delete-btn:hover:not(:disabled) {
  background: #d32f2f;
}

.option-action-btn.delete-btn:disabled {
  background: #e0e0e0;
  color: #bdbdbd;
  cursor: not-allowed;
}

/* 自定义提示弹窗 - 圆角设计 */
.toast-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.toast-content {
  background: white;
  border-radius: 16px;
  padding: 32px 40px;
  min-width: 360px;
  max-width: 500px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.toast-icon {
  font-size: 48px;
  line-height: 1;
  animation: scaleIn 0.3s ease-out 0.1s both;
}

@keyframes scaleIn {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

.toast-message {
  font-size: 16px;
  color: #333;
  text-align: center;
  line-height: 1.6;
  font-weight: 500;
}

.toast-button {
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
}

.toast-button:hover {
  background: linear-gradient(135deg, #1976D2 0%, #1565C0 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(33, 150, 243, 0.4);
}

.toast-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.3);
}

/* 确认对话框样式 */
.confirm-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.confirm-dialog {
  background: white;
  border-radius: 12px;
  padding: 24px;
  min-width: 400px;
  max-width: 500px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.confirm-dialog-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.confirm-dialog-message {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 24px;
}

.confirm-dialog-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.confirm-btn {
  padding: 10px 36px; /* 增大内边距，使按钮更大 */
  border: none;
  border-radius: 20px;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  border-bottom-right-radius: 20px;
  border-bottom-left-radius: 20px;
  font-size: 13px; /* 稍微增大字号 */
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 400; /* 加粗文字 */
  letter-spacing: 1px; /* 增加字间距 */
  /* 默认（确定）按钮样式 */
  background: rgba(33, 150, 243, 1);
  color: white;
  box-shadow: 0px 4px 10px 0px rgba(33, 150, 243, 0.3); /* 增加阴影 */
  min-width: 100px; /* 确保最小宽度 */
  display: flex;
  vertical-align: top;
  justify-content: flex-start;
  align-items: flex-start;
  flex-wrap: wrap;
  margin: 10px;
}

.confirm-btn:hover:not(:disabled) {
  background: #1976D2;
  box-shadow: 0 6px 14px rgba(33, 150, 243, 0.4);
  transform: translateY(-2px);
}

/* 取消按钮 - 与确定按钮相同的蓝色胶囊样式 */
.confirm-btn.cancel-btn {
  background: rgba(33, 150, 243, 1); /* 蓝色背景，与确定按钮一致 */
  color: white; /* 白色文字 */
  border: none;
  box-shadow: 0px 4px 10px 0px rgba(33, 150, 243, 0.3); /* 蓝色阴影 */
}

.confirm-btn.cancel-btn:hover {
  background: #1976D2; /* 悬停时蓝色加深 */
  color: white;
  box-shadow: 0 6px 14px rgba(33, 150, 243, 0.4);
  transform: translateY(-2px);
}

.confirm-btn.ok-btn {
  /* ok-btn 复用默认样式 */
  background: #2196F3;
  color: white;
}

.confirm-btn.ok-btn:hover {
  background: #1976D2;
}
</style>

