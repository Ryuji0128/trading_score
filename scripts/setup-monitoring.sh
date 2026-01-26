#!/bin/bash
# Setup Monitoring Environment for trading_score

set -e

echo "Setting up monitoring environment..."

# Install required packages
sudo apt-get update
sudo apt-get install -y fail2ban logwatch curl

# Setup fail2ban
echo "Configuring fail2ban..."
sudo cp -r ../fail2ban/jail.local /etc/fail2ban/
sudo cp -r ../fail2ban/filter.d/* /etc/fail2ban/filter.d/
sudo systemctl enable fail2ban
sudo systemctl restart fail2ban

# Setup logwatch
echo "Configuring logwatch..."
sudo cp ../logwatch/logwatch.conf /etc/logwatch/conf/

# Make scripts executable
chmod +x renew-ssl.sh backup-db.sh monitor.sh

# Setup cron jobs
echo "Setting up cron jobs..."
(crontab -l 2>/dev/null; echo "0 3 * * * $(pwd)/renew-ssl.sh >> /var/log/ssl-renew.log 2>&1") | crontab -
(crontab -l 2>/dev/null; echo "0 2 * * * $(pwd)/backup-db.sh >> /var/log/backup.log 2>&1") | crontab -
(crontab -l 2>/dev/null; echo "*/5 * * * * $(pwd)/monitor.sh >> /var/log/monitor.log 2>&1") | crontab -

echo "Monitoring setup completed!"
echo ""
echo "Cron jobs added:"
echo "  - SSL renewal: daily at 3:00 AM"
echo "  - DB backup: daily at 2:00 AM"
echo "  - Health check: every 5 minutes"
