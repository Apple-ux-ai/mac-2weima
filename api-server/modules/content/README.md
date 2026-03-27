# Content 模块

## 功能描述
负责系统中所有内容的持久化存储、获取和删除。目前主要用于存储二维码生成的配置数据。

## 目录结构
- `controller/`: 处理 HTTP 请求 (save, get, delete)
- `service/`: 业务逻辑，负责数据验证和处理
- `repository/`: 数据访问层，直接操作文件系统存储 JSON 文件
- `models/`: 数据结构定义 (TODO)

## 接口定义
- `POST /api/content`: 保存内容
- `GET /api/content/:id`: 获取内容
- `DELETE /api/content/:id`: 删除内容
