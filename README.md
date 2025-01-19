# Unbound Configs 项目

该项目是一个全栈应用程序，使用 React 前端和 Django 后端来管理 DNS 区域。它还包括一个 Nginx 配置文件，用于服务前端和代理 API 请求到后端。

## 项目结构

- **frontend**: 包含 React 应用程序。
- **backend**: 包含 Django 应用程序。
- **nginx**: 包含 Nginx 配置文件。
- **install.sh**: 用于设置和部署项目的 Shell 脚本。

## 设置说明

### 前提条件

- Node.js 和 Yarn
- Python 3 和 pip
- Nginx
- Git

### 安装

1. 克隆仓库：
    ```bash
    git clone <repository-url>
    cd unboundConfigs
    ```

2. 运行安装脚本：
    ```bash
    ./install.sh
    ```

### 前端

前端是使用 Create React App 创建的 React 应用程序。

#### 可用脚本

- `yarn start`: 在开发模式下运行应用程序。
- `yarn test`: 启动测试运行器。
- `yarn build`: 为生产环境构建应用程序。
- `yarn eject`: 弹出配置文件。

### 后端

后端是一个 Django 应用程序。

#### 关键文件

- `settings.py`: Django 设置文件。
- `requirements.txt`: Python 依赖项。

### Nginx

Nginx 配置文件位于 `nginx/unbound.conf`。

### 部署

`install.sh` 脚本处理部署过程，包括设置 Python 虚拟环境、安装依赖项、迁移数据库、收集静态文件、构建前端和配置 Nginx。

### Systemd 服务

创建一个 systemd 服务来管理 Django 应用程序。服务文件位于 `/etc/systemd/system/unboundConfigs.service`。

### 自定义 DNS 区域

可以通过前端应用程序管理 DNS 区域。后端 API 处理区域的 CRUD 操作。自定义 DNS 区域配置文件位于 `/etc/unbound/unbound.conf.d/custom.conf`。
可以在‘/etc/unbound/unbound.conf’ 中include它，来应用当前设置

## 许可证

该项目使用 MIT 许可证。
