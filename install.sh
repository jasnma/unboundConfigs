#!/bin/bash

# 获取脚本所在的目录
SCRIPT_DIR=$(dirname "$(realpath "$0")")
PROJECT_DIR=$SCRIPT_DIR

FRONTEND_DIR="$PROJECT_DIR/frontend"
BACKEND_DIR="$PROJECT_DIR/backend"
NGINX_CONF_DIR="/etc/nginx/sites-available"
NGINX_CONF_LINK_DIR="/etc/nginx/sites-enabled"
FRONTEND_BUILD_DIR="/var/www/unbound_configs/frontend"
FRONTEND_BUILD_BACK_DIR="$FRONTEND_BUILD_DIR.bak"

# 检查命令是否成功运行的函数
check_command_success() {
  if [ $? -ne 0 ]; then
    echo "Error: $1 failed"
    exit 1
  fi
}

# 设置虚拟环境
cd $BACKEND_DIR
python3 -m venv venv
check_command_success "Creating virtual environment"

source venv/bin/activate
$BACKEND_DIR/venv/bin/pip install -r requirements.txt
check_command_success "Installing backend dependencies"

# 迁移数据库
$BACKEND_DIR/venv/bin/python3 manage.py migrate
check_command_success "Migrating database"

# 收集静态文件
$BACKEND_DIR/venv/bin/python3 manage.py collectstatic --noinput
check_command_success "Collecting static files"

# 构建前端
cd $FRONTEND_DIR
yarn install
check_command_success "Installing frontend dependencies"

yarn build
check_command_success "Building frontend"

# 移动前端生成的文件到 /var/www/unbound_configs/frontend
sudo mv $FRONTEND_BUILD_DIR $FRONTEND_BUILD_BACK_DIR
sudo mkdir -p $FRONTEND_BUILD_DIR
sudo mv $FRONTEND_DIR/build/* $FRONTEND_BUILD_DIR
sudo rm -rf $FRONTEND_BUILD_BACK_DIR
check_command_success "Moving frontend build files"

# 配置 Nginx
NGINX_CONF="$NGINX_CONF_DIR/unbound.conf"
sudo cp $PROJECT_DIR/nginx/unbound.conf $NGINX_CONF
check_command_success "Configuring Nginx"
sudo ln -s $NGINX_CONF $NGINX_CONF_LINK_DIR/unbound.conf

# 修改 Nginx 配置文件
sudo sed -i "s|/path/to/your/backend/static|$BACKEND_DIR/backend/static|g" $NGINX_CONF
sudo sed -i "s|/path/to/your/backend/media|$BACKEND_DIR/backend/media|g" $NGINX_CONF
check_command_success "Updating Nginx configuration"

sudo systemctl stop unboundConfigs

# 创建 systemd 服务文件
SERVICE_FILE="/etc/systemd/system/unboundConfigs.service"
sudo bash -c "cat > $SERVICE_FILE" <<EOL
[Unit]
Description=Unbound Configs Django Service
After=network.target

[Service]
WorkingDirectory=$BACKEND_DIR
Environment=DJANGO_ENV=production
ExecStart=$BACKEND_DIR/venv/bin/python3 manage.py runserver 0.0.0.0:8000
Restart=always

[Install]
WantedBy=multi-user.target
EOL
check_command_success "Creating systemd service file"

# 重新加载 systemd 服务
sudo systemctl daemon-reload

# 启动 Nginx
sudo systemctl restart nginx
check_command_success "Restarting Nginx"

# 启动并启用 Django 服务
sudo systemctl start unboundConfigs.service
sudo systemctl enable unboundConfigs.service
check_command_success "Starting and enabling Django service"

echo "Deployment completed successfully!"
