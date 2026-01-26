#!/bin/bash
# SSL Certificate Renewal Script for baseball-now.com

set -e

DOMAIN="baseball-now.com"
EMAIL="info@setaseisakusyo.com"
LOG_FILE="/var/log/ssl-renew.log"

echo "$(date): Starting SSL certificate renewal..." >> "$LOG_FILE"

# Certbot renewal
certbot renew --nginx --quiet

# Reload Nginx to apply new certificate
docker exec nginx_proxy nginx -s reload 2>/dev/null || systemctl reload nginx

echo "$(date): SSL certificate renewal completed" >> "$LOG_FILE"
