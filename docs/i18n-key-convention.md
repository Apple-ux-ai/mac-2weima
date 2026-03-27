# i18n Key Naming Convention

## Goals
- Keep keys stable and semantic.
- Allow gradual migration without breaking features.
- Make keys searchable by module.

## Key Format
- Pattern: `<module>.<scope>.<name>`
- Examples:
  - `app.footer.productLine`
  - `topNav.tabs.text`
  - `qrGenerator.actions.generate`
  - `loginModal.status.waiting`
  - `errors.network.unreachable`

## Module Prefixes
- `app`: `src/App.vue`
- `topNav`: `src/components/TopNav.vue`
- `qrGenerator`: `src/components/QRGenerator.vue`
- `advancedEditor`: `src/components/AdvancedEditor.vue`
- `dynamicManager`: `src/components/DynamicQRManager.vue`
- `batchGenerator`: `src/components/BatchQRGenerator.vue`
- `folderList`: `src/components/FolderList.vue`
- `loginModal`: `src/components/LoginModal.vue`
- `updateModal`: `src/components/UpdateModal.vue`
- `toast`: `src/utils/toast.js`
- `publicViewer`: `public/viewer.html`
- `publicAdvancedViewer`: `public/advanced-viewer.html`
- `publicLivecode`: `public/livecode.html`
- `publicPlayer`: `public/player.html`
- `publicRedirect`: `public/redirect.html`
- `electron`: `electron/main.cjs`

## Recommended Scopes
- `titles`: headings and dialog titles
- `labels`: field labels
- `placeholders`: input placeholders
- `actions`: button text
- `messages`: normal runtime messages
- `errors`: error messages
- `confirm`: confirmation messages
- `hints`: helper or guide text
- `status`: loading and state text

## Interpolation Rules
- Use named params only.
- Example:
  - key: `qrGenerator.messages.fileTooLarge`
  - message: `"\"{fileName}\" is too large, please choose a file under {limit}"`

## Non-translatable Whitelist
- Route fragments: `#/view/`, `#/folder/`, `#/dynamic/`, `/livecode/`
- Storage keys: `dynamicQRList`, `dynamicQRFolders`, `apiBaseUrl`, `auth_token`
- API fields and params: `has_update`, `download_url`, `soft_number`, `api`
- Internal ids/prefixes: `folder_`, `file_`, `image_`, `dynamic_`
- Technical enums: `L`, `M`, `Q`, `H`, MIME types and file suffixes

## Locale IDs
- Supported ids:
  - `ar`, `bn`, `de`, `en`, `es`, `fa`, `fr`, `he`, `hi`, `id`, `it`, `ja`, `ko`, `ms`, `nl`, `pl`, `pt`, `pt_BR`, `ru`, `sw`, `ta`, `th`, `tl`, `tr`, `uk`, `ur`, `vi`, `zh_CN`, `zh_TW`
- Runtime fallback chain:
  - `selected -> en -> zh_CN`

## Migration Rules
- Replace visible strings first (titles, buttons, placeholders).
- Replace `alert/confirm` text in the same pass.
- Replace `toLocaleString('zh-CN')` with centralized date formatter.
- Keep old logic and data structure unchanged.

