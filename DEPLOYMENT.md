# Deployment Guide

This guide covers various deployment options for the Personal Financial Dashboard.

## Table of Contents

1. [Local Docker Deployment](#local-docker-deployment)
2. [VPS/Server Deployment](#vpsserver-deployment)
3. [Cloud Platform Deployment](#cloud-platform-deployment)
4. [Reverse Proxy Setup](#reverse-proxy-setup)
5. [SSL/HTTPS Configuration](#sslhttps-configuration)
6. [Monitoring and Maintenance](#monitoring-and-maintenance)

## Local Docker Deployment

### Prerequisites
- Docker and Docker Compose installed
- 2GB free disk space
- Port 3000 available

### Quick Start
```bash
# Clone and setup
git clone <your-repo-url>
cd "Personal Financial Dashboard"

# Run setup script
./setup.sh

# Or manually with Docker Compose
docker-compose up -d
```

## VPS/Server Deployment

### Ubuntu/Debian Server Setup

1. **Update system:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Install Docker:**
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo usermod -aG docker $USER
   ```

3. **Install Docker Compose:**
   ```bash
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

4. **Deploy application:**
   ```bash
   git clone <your-repo-url>
   cd "Personal Financial Dashboard"
   docker-compose up -d
   ```

### CentOS/RHEL Server Setup

1. **Install Docker:**
   ```bash
   sudo yum install -y yum-utils
   sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
   sudo yum install docker-ce docker-ce-cli containerd.io
   sudo systemctl start docker
   sudo systemctl enable docker
   ```

2. **Follow steps 3-4 from Ubuntu setup**

## Cloud Platform Deployment

### AWS EC2

1. **Launch EC2 instance:**
   - AMI: Ubuntu 22.04 LTS
   - Instance type: t3.micro (free tier) or t3.small
   - Security group: Allow HTTP (80), HTTPS (443), SSH (22)

2. **Connect and setup:**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   # Follow Ubuntu server setup above
   ```

3. **Configure security group:**
   - Add inbound rule for port 3000 (or 80/443 with reverse proxy)

### Google Cloud Platform

1. **Create Compute Engine instance:**
   ```bash
   gcloud compute instances create finance-dashboard \
     --image-family=ubuntu-2204-lts \
     --image-project=ubuntu-os-cloud \
     --machine-type=e2-micro \
     --tags=http-server,https-server
   ```

2. **SSH and setup:**
   ```bash
   gcloud compute ssh finance-dashboard
   # Follow Ubuntu server setup
   ```

### DigitalOcean Droplet

1. **Create droplet:**
   - Image: Ubuntu 22.04
   - Size: Basic $6/month
   - Add your SSH key

2. **Setup application:**
   ```bash
   ssh root@your-droplet-ip
   # Follow Ubuntu server setup
   ```

### Azure Container Instances

```bash
# Create resource group
az group create --name finance-dashboard --location eastus

# Deploy container
az container create \
  --resource-group finance-dashboard \
  --name finance-dashboard \
  --image ghcr.io/yourusername/personal-finance-dashboard:latest \
  --dns-name-label finance-dashboard-unique \
  --ports 80
```

## Reverse Proxy Setup

### Nginx Configuration

1. **Install Nginx:**
   ```bash
   sudo apt install nginx
   ```

2. **Create site configuration:**
   ```bash
   sudo nano /etc/nginx/sites-available/finance-dashboard
   ```

   ```nginx
   server {
       listen 80;
       server_name your-domain.com www.your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

3. **Enable site:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/finance-dashboard /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

### Traefik Configuration

Create `docker-compose.traefik.yml`:

```yaml
version: '3.8'

services:
  traefik:
    image: traefik:v2.10
    command:
      - --api.dashboard=true
      - --providers.docker=true
      - --entrypoints.web.address=:80
      - --entrypoints.websecure.address=:443
      - --certificatesresolvers.letsencrypt.acme.email=your-email@domain.com
      - --certificatesresolvers.letsencrypt.acme.storage=/acme.json
      - --certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./acme.json:/acme.json
    labels:
      - traefik.http.routers.dashboard.rule=Host(`traefik.your-domain.com`)
      - traefik.http.routers.dashboard.tls.certresolver=letsencrypt

  finance-dashboard:
    build: .
    labels:
      - traefik.http.routers.finance.rule=Host(`your-domain.com`)
      - traefik.http.routers.finance.tls.certresolver=letsencrypt
      - traefik.http.services.finance.loadbalancer.server.port=80
```

## SSL/HTTPS Configuration

### Let's Encrypt with Certbot

1. **Install Certbot:**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   ```

2. **Get SSL certificate:**
   ```bash
   sudo certbot --nginx -d your-domain.com -d www.your-domain.com
   ```

3. **Auto-renewal:**
   ```bash
   sudo crontab -e
   # Add: 0 12 * * * /usr/bin/certbot renew --quiet
   ```

### Cloudflare SSL

1. **Add domain to Cloudflare**
2. **Update nameservers**
3. **Enable SSL/TLS encryption mode: Full**
4. **Create origin certificate for your server**

## Monitoring and Maintenance

### Health Monitoring

1. **Create monitoring script:**
   ```bash
   #!/bin/bash
   # monitor.sh
   
   URL="http://localhost:3000/health"
   
   if curl -f $URL > /dev/null 2>&1; then
       echo "$(date): Service is healthy"
   else
       echo "$(date): Service is down, restarting..."
       docker-compose restart
   fi
   ```

2. **Add to crontab:**
   ```bash
   # Check every 5 minutes
   */5 * * * * /path/to/monitor.sh >> /var/log/finance-dashboard.log
   ```

### Log Management

1. **View logs:**
   ```bash
   docker-compose logs -f
   ```

2. **Log rotation:**
   ```bash
   # /etc/logrotate.d/docker-containers
   /var/lib/docker/containers/*/*.log {
       rotate 7
       daily
       compress
       size=1M
       missingok
       delaycompress
       copytruncate
   }
   ```

### Backup Strategy

1. **Application backup:**
   ```bash
   #!/bin/bash
   # backup.sh
   
   BACKUP_DIR="/backups/finance-dashboard"
   DATE=$(date +%Y%m%d_%H%M%S)
   
   mkdir -p $BACKUP_DIR
   
   # Backup application files
   tar -czf $BACKUP_DIR/app_$DATE.tar.gz /path/to/app
   
   # Backup Docker volumes (if any)
   docker run --rm -v dashboard_data:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/data_$DATE.tar.gz /data
   
   # Keep only last 7 backups
   find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
   ```

2. **Schedule backups:**
   ```bash
   # Daily backup at 2 AM
   0 2 * * * /path/to/backup.sh
   ```

### Updates

1. **Update application:**
   ```bash
   git pull origin main
   docker-compose down
   docker-compose up -d --build
   ```

2. **Update system:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   sudo reboot
   ```

## Security Best Practices

1. **Firewall configuration:**
   ```bash
   sudo ufw enable
   sudo ufw allow ssh
   sudo ufw allow 80
   sudo ufw allow 443
   ```

2. **Fail2ban for SSH protection:**
   ```bash
   sudo apt install fail2ban
   sudo systemctl enable fail2ban
   ```

3. **Regular security updates:**
   ```bash
   sudo apt install unattended-upgrades
   sudo dpkg-reconfigure unattended-upgrades
   ```

4. **Docker security:**
   - Run containers as non-root user
   - Use specific image tags, not 'latest'
   - Regularly update base images
   - Scan images for vulnerabilities

## Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   sudo lsof -i :3000
   sudo kill -9 <PID>
   ```

2. **Docker daemon not running:**
   ```bash
   sudo systemctl start docker
   sudo systemctl enable docker
   ```

3. **Permission denied:**
   ```bash
   sudo usermod -aG docker $USER
   # Log out and log back in
   ```

4. **Out of disk space:**
   ```bash
   docker system prune -a
   docker volume prune
   ```

### Performance Optimization

1. **Enable Docker BuildKit:**
   ```bash
   export DOCKER_BUILDKIT=1
   ```

2. **Optimize Nginx:**
   ```nginx
   worker_processes auto;
   worker_connections 1024;
   
   gzip on;
   gzip_types text/css application/javascript application/json;
   
   expires 1y;
   add_header Cache-Control "public, immutable";
   ```

3. **Monitor resources:**
   ```bash
   docker stats
   htop
   df -h
   ```

## Support

For additional help:
- Check the [DOCKER_SETUP.md](./DOCKER_SETUP.md) for detailed Docker instructions
- Review application logs: `docker-compose logs -f`
- Open an issue on the GitHub repository
- Check system resources and requirements