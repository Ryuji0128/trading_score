#!/bin/bash
# Service Health Monitor for trading_score

set -e

SERVICES=("mysql_db" "django_app" "next_app" "nginx_proxy")
ALERT_EMAIL="info@setaseisakusyo.com"
HOSTNAME=$(hostname)

check_container() {
    local container=$1
    if docker ps --format '{{.Names}}' | grep -q "^${container}$"; then
        echo "[OK] $container is running"
        return 0
    else
        echo "[FAIL] $container is not running"
        return 1
    fi
}

check_http() {
    local url=$1
    local name=$2
    if curl -sf -o /dev/null -w "%{http_code}" "$url" | grep -q "200\|301\|302"; then
        echo "[OK] $name is responding"
        return 0
    else
        echo "[FAIL] $name is not responding"
        return 1
    fi
}

echo "=== Service Health Check: $(date) ==="

FAILED=0

# Check Docker containers
for service in "${SERVICES[@]}"; do
    if ! check_container "$service"; then
        FAILED=1
    fi
done

# Check HTTP endpoints
if ! check_http "http://localhost" "Nginx"; then
    FAILED=1
fi

if ! check_http "http://localhost:8000/api/" "Django API"; then
    FAILED=1
fi

# Summary
echo ""
if [ $FAILED -eq 0 ]; then
    echo "All services are healthy"
else
    echo "Some services have issues!"
    # Send alert email (optional)
    # echo "Service alert on $HOSTNAME" | mail -s "Trading Score Alert" "$ALERT_EMAIL"
fi

exit $FAILED
