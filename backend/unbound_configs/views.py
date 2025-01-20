from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import os
import shutil
import subprocess

# 根据环境确定配置文件路径
if os.getenv("DJANGO_ENV") == "production":
    CUSTOM_CONF_PATH = "/etc/unbound/unbound.conf.d/custom.conf"
    LOCAL_DATA_CONF_PATH = "/etc/unbound/unbound.conf.d/local-data.conf"
else:
    CUSTOM_CONF_PATH = "./custom.conf"  # 用于开发环境
    LOCAL_DATA_CONF_PATH = "./local-data.conf"  # 用于开发环境

# Backup file path
BACKUP_CONF_PATH = CUSTOM_CONF_PATH + ".bak"

# Helper to parse the configuration file
def parse_config():
    if not os.path.exists(CUSTOM_CONF_PATH):
        return []
    zones = []
    with open(CUSTOM_CONF_PATH, 'r') as conf_file:
        lines = conf_file.readlines()
    zone = {}
    for line in lines:
        line = line.strip()
        if line.startswith("name:"):
            zone["domain"] = line.split('"')[1]
        elif line.startswith("forward-addr:"):
            zone["forward_addr"] = line.split()[1]
        elif line == "":
            if zone:
                zones.append(zone)
                zone = {}
    if zone:
        zones.append(zone)
    return zones

def parse_local_data():
    if not os.path.exists(LOCAL_DATA_CONF_PATH):
        return []
    local_data = []
    with open(LOCAL_DATA_CONF_PATH, 'r') as conf_file:
        lines = conf_file.readlines()
    for line in lines:
        line = line.strip()
        if line.startswith("local-data:"):
            data = line.split('"')[1]
            parts = data.split()
            if len(parts) >= 3:
                domain = parts[0]
                if parts[1] == "IN":
                    record_type = parts[2]
                    record_data = " ".join(parts[3:])
                else:
                    record_type = parts[1]
                    record_data = " ".join(parts[2:])
                local_data.append({
                    "domain": domain,
                    "type": record_type,
                    "data": record_data
                })
    return local_data

# Helper to write to the configuration file
def write_config(zones):
    config_lines = []
    for zone in zones:
        config_lines.append(f"forward-zone:\n    name: \"{zone['domain']}\"\n    forward-addr: {zone['forward_addr']}\n")
    with open(CUSTOM_CONF_PATH, 'w') as conf_file:
        conf_file.write('\n'.join(config_lines))

# Helper to write to the local-data configuration file
def write_local_data(local_data):
    config_lines = []
    for data in local_data:
        if data["type"] == "IN":
            config_lines.append(f'local-data: "{data["domain"]} {data["type"]} {data["data"]}"')
        else:
            config_lines.append(f'local-data: "{data["domain"]} {data["type"]} {data["data"]}"')
    with open(LOCAL_DATA_CONF_PATH, 'w') as conf_file:
        conf_file.write('\n'.join(config_lines))

# Helper to validate the configuration file
def validate_config():
    try:
        result = subprocess.run(["unbound-checkconf", CUSTOM_CONF_PATH], capture_output=True, text=True)
        return result.returncode == 0, result.stderr
    except FileNotFoundError:
        return False, "unbound-checkconf command not found"

# Helper to reload Unbound configuration
def reload_unbound_config():
    try:
        reload_result = subprocess.run(["unbound-control", "reload"], capture_output=True, text=True)
        if reload_result.returncode != 0:
            return False, f"Unbound reload failed: {reload_result.stderr}"
        return True, ""
    except FileNotFoundError:
        return False, "unbound-control command not found"

# Helper to start Unbound service
def start_unbound_service():
    try:
        result = subprocess.run(["systemctl", "start", "unbound"], capture_output=True, text=True)
        if result.returncode != 0:
            return False, f"Failed to start Unbound service: {result.stderr}"
        return True, ""
    except FileNotFoundError:
        return False, "systemctl command not found"

# Helper to stop Unbound service
def stop_unbound_service():
    try:
        result = subprocess.run(["systemctl", "stop", "unbound"], capture_output=True, text=True)
        if result.returncode != 0:
            return False, f"Failed to stop Unbound service: {result.stderr}"
        return True, ""
    except FileNotFoundError:
        return False, "systemctl command not found"

# Helper to check Unbound service status
def check_unbound_status():
    try:
        result = subprocess.run(["systemctl", "is-active", "unbound"], capture_output=True, text=True)
        if result.returncode == 0:
            return "active"
        return "inactive"
    except FileNotFoundError:
        return "systemctl command not found"

@api_view(['GET'])
def list_zones(request):
    zones = parse_config()
    return Response(zones, status=status.HTTP_200_OK)

@api_view(['GET'])
def list_local_data(request):
    local_data = parse_local_data()
    return Response(local_data, status=status.HTTP_200_OK)

@api_view(['POST'])
def update_zones(request):
    zones = request.data.get("zones")
    if not zones:
        return Response({"error": "Zones data is required"}, status=status.HTTP_400_BAD_REQUEST)

    # Backup the existing configuration file
    try:
        shutil.copy(CUSTOM_CONF_PATH, BACKUP_CONF_PATH)
    except IOError as e:
        return Response({"error": f"Failed to create backup: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Write the new configuration
    write_config(zones)

    # Validate the new configuration
    if os.getenv("DJANGO_ENV") == "production":
        is_valid, error_message = validate_config()
        if not is_valid:
            # Restore from backup in case of error
            shutil.move(BACKUP_CONF_PATH, CUSTOM_CONF_PATH)
            return Response({"error": f"Configuration validation failed: {error_message}"}, status=status.HTTP_400_BAD_REQUEST)

    # Remove the backup if everything is fine
    os.remove(BACKUP_CONF_PATH)

    # Reload Unbound configuration
    if os.getenv("DJANGO_ENV") == "production":
        success, message = reload_unbound_config()
        if not success:
            return Response({"error": message}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({"message": "Zones updated, validated, and reloaded successfully"}, status=status.HTTP_200_OK)

@api_view(['POST'])
def update_local_data(request):
    local_data = request.data.get("local_data")
    if not local_data:
        return Response({"error": "Local data is required"}, status=status.HTTP_400_BAD_REQUEST)

    # Backup the existing configuration file
    try:
        shutil.copy(LOCAL_DATA_CONF_PATH, LOCAL_DATA_CONF_PATH + ".bak")
    except IOError as e:
        return Response({"error": f"Failed to create backup: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Write the new configuration
    write_local_data(local_data)

    # Validate the new configuration
    if os.getenv("DJANGO_ENV") == "production":
        is_valid, error_message = validate_config()
        if not is_valid:
            # Restore from backup in case of error
            shutil.move(LOCAL_DATA_CONF_PATH + ".bak", LOCAL_DATA_CONF_PATH)
            return Response({"error": f"Configuration validation failed: {error_message}"}, status=status.HTTP_400_BAD_REQUEST)

    # Remove the backup if everything is fine
    os.remove(LOCAL_DATA_CONF_PATH + ".bak")

    # Reload Unbound configuration
    if os.getenv("DJANGO_ENV") == "production":
        success, message = reload_unbound_config()
        if not success:
            return Response({"error": message}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({"message": "Local data updated, validated, and reloaded successfully"}, status=status.HTTP_200_OK)

@api_view(['POST'])
def start_unbound(request):
    success, message = start_unbound_service()
    if not success:
        return Response({"error": message}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    return Response({"message": "Unbound service started successfully"}, status=status.HTTP_200_OK)

@api_view(['POST'])
def stop_unbound(request):
    success, message = stop_unbound_service()
    if not success:
        return Response({"error": message}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    return Response({"message": "Unbound service stopped successfully"}, status=status.HTTP_200_OK)

@api_view(['GET'])
def unbound_status(request):
    service_status = check_unbound_status()
    if "Error" in service_status or "not found" in service_status:
        return Response({"status": service_status}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    return Response({"status": service_status}, status=status.HTTP_200_OK)
