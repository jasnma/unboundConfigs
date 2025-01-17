from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import os
import shutil
import subprocess

# Determine the configuration file path based on the environment
if os.getenv("DJANGO_ENV") == "production":
    CUSTOM_CONF_PATH = "/etc/unbound/unbound.conf.d/custom.conf"
else:
    CUSTOM_CONF_PATH = "./custom.conf"  # For development use

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

# Helper to write to the configuration file
def write_config(zones):
    config_lines = []
    for zone in zones:
        config_lines.append(f"forward-zone:\n    name: \"{zone['domain']}\"\n    forward-addr: {zone['forward_addr']}\n")
    with open(CUSTOM_CONF_PATH, 'w') as conf_file:
        conf_file.write('\n'.join(config_lines))

# Helper to validate the configuration file
def validate_config():
    try:
        result = subprocess.run(["unbound-checkconf", CUSTOM_CONF_PATH], capture_output=True, text=True)
        return result.returncode == 0, result.stderr
    except FileNotFoundError:
        return False, "unbound-checkconf command not found"

@api_view(['GET'])
def list_zones(request):
    zones = parse_config()
    return Response(zones, status=status.HTTP_200_OK)

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
        try:
            reload_result = subprocess.run(["unbound-control", "reload"], capture_output=True, text=True)
            if reload_result.returncode != 0:
                return Response({
                    "error": f"Unbound reload failed: {reload_result.stderr}"
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except FileNotFoundError:
            return Response({"error": "unbound-control command not found"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({"message": "Zones updated, validated, and reloaded successfully"}, status=status.HTTP_200_OK)
