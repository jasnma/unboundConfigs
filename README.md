# Unbound Configs

## 项目简介

该项目用于管理 Unbound DNS 服务器的配置，包括自定义转发区域和本地域名。

## 功能

### 自定义转发区域

- 列出所有自定义转发区域
- 添加新的转发区域
- 编辑现有的转发区域
- 删除转发区域

### 本地域名

- 列出所有本地域名
- 添加新的本地域名
- 编辑现有的本地域名
- 删除本地域名

### 系统管理

- 启动 Unbound 服务
- 停止 Unbound 服务

## API 端点

### 自定义转发区域

- `GET /api/zones/` - 列出所有自定义转发区域
- `POST /api/zones/update/` - 更新自定义转发区域

### 本地域名

- `GET /api/local-data/` - 列出所有本地域名
- `POST /api/local-data/update/` - 更新本地域名

### 系统管理

- `POST /api/unbound/start/` - 启动 Unbound 服务
- `POST /api/unbound/stop/` - 停止 Unbound 服务

## 本地域名功能描述

本地域名功能允许用户管理 Unbound DNS 服务器中的本地域名记录。用户可以通过前端界面添加、编辑和删除本地域名记录。

### 本地域名数据结构

每个本地域名记录包含以下字段：

- `domain` - 域名
- `type` - 记录类型（例如：A、AAAA、CNAME 等）
- `data` - 记录数据（例如：IP 地址）

### 示例

以下是一个示例的本地域名记录：

```plaintext
local-data: "example.com. IN A 192.0.2.1"
```

在前端界面中，用户可以通过输入域名、记录类型和记录数据来添加新的本地域名记录。

## 安装和运行

### 后端

1. 安装依赖项：
    ```bash
    pip install -r requirements.txt
    ```

2. 运行 Django 开发服务器：
    ```bash
    python manage.py runserver
    ```

### 前端

1. 安装依赖项：
    ```bash
    yarn install
    ```

2. 运行 React 开发服务器：
    ```bash
    yarn start
    ```

## 贡献

欢迎贡献代码！请提交 Pull Request 或报告问题。

## 许可证

该项目使用 MIT 许可证。
