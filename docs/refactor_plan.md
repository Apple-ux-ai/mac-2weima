# 项目模块化重构技术规范

## 1. 总体架构
项目将采用模块化（Modular Monolith）架构，将业务逻辑、接口层和数据访问层解耦。

## 2. 目录结构规范
每个模块（位于 `/modules` 下）必须遵循以下结构：
- `controller/`: 处理 HTTP 请求和响应。
- `service/`: 处理核心业务逻辑。
- `repository/`: 处理数据持久化操作。
- `models/`: 定义数据结构和 Schema。
- `routes.js`: 模块内部路由定义。
- `index.js`: 模块导出入口。
- `README.md`: 模块功能说明。

## 3. 模块划分
### 后端 (api-server/modules)
- **user**: 用户认证、信息管理。
- **qrcode**: 二维码生成、解析逻辑。
- **storage**: 文件存储、目录管理。

### 前端 (src/modules)
- **auth**: 登录、同步认证逻辑。
- **generator**: 二维码生成配置与状态。
- **manager**: 活码管理、文件夹操作。

## 4. 依赖规则
- 模块间禁止循环依赖。
- 公共逻辑必须提取至 `/common`。
- 跨模块调用必须通过 Service 层进行。
