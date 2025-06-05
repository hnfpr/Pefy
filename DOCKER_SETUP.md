# Docker Setup Guide for Personal Financial Dashboard

This guide will help you set up and run the Personal Financial Dashboard using Docker for self-hosting.

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)
- Git (for cloning the repository)

### Installing Docker

#### On Ubuntu/Debian:
```bash
sudo apt update
sudo apt install docker.io docker-compose-plugin
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

#### On CentOS/RHEL:
```bash
sudo yum install docker docker-compose
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

#### On macOS:
- Download and install [Docker Desktop for Mac](https://docs.docker.com/desktop/mac/install/)

#### On Windows:
- Download and install [Docker Desktop for Windows](https://docs.docker.com/desktop/windows/install/)

## Quick Start

### Method 1: Using Docker Compose (Recommended)

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd Personal\ Financial\ Dashboard
   ```

2. **Build and start the application:**
   ```bash
   docker-compose up -d
   ```

3. **Access the application:**
   Open your browser and navigate to `http://localhost:3000`

### Method 2: Using Docker directly

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd Personal\ Financial\ Dashboard
   ```

2. **Build the Docker image:**
   ```bash
   docker build -t personal-finance-dashboard .
   ```

3. **Run the container:**
   ```bash
   docker run -d \
     --name personal-finance-dashboard \
     -p 3000:80 \
     --restart unless-stopped \
     personal-finance-dashboard
   ```

4. **Access the application:**
   Open your browser and navigate to `http://localhost:3000`

## Configuration

### Port Configuration

By default, the application runs on port 3000. To change this:

**Docker Compose:**
Edit `docker-compose.yml` and change the ports mapping:
```yaml
ports:
  - "8080:80"  # Change 3000 to your desired port
```

**Docker CLI:**
```bash
docker run -d -p 8080:80 personal-finance-dashboard
```

### Environment Variables

Currently, the application doesn't require environment variables, but you can add them in the future by modifying the `docker-compose.yml` file:

```yaml
environment:
  - NODE_ENV=production
  - CUSTOM_VARIABLE=value
```

## Data Persistence

The application currently uses browser localStorage for data storage. In the future, if you want to add persistent storage:

1. **Create a data directory on your host:**
   ```bash
   mkdir -p ./data
   ```

2. **Mount it in docker-compose.yml:**
   ```yaml
   volumes:
     - ./data:/app/data
   ```

## Management Commands

### View logs:
```bash
# Docker Compose
docker-compose logs -f

# Docker CLI
docker logs -f personal-finance-dashboard
```

### Stop the application:
```bash
# Docker Compose
docker-compose down

# Docker CLI
docker stop personal-finance-dashboard
```

### Restart the application:
```bash
# Docker Compose
docker-compose restart

# Docker CLI
docker restart personal-finance-dashboard
```

### Update the application:
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

### Remove everything:
```bash
# Docker Compose (removes containers, networks, and volumes)
docker-compose down -v

# Docker CLI
docker stop personal-finance-dashboard
docker rm personal-finance-dashboard
docker rmi personal-finance-dashboard
```

## Production Deployment

### Using a Reverse Proxy (Recommended)

For production deployments, it's recommended to use a reverse proxy like Nginx or Traefik:

#### Example Nginx configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### SSL/HTTPS Setup

For HTTPS, you can use Let's Encrypt with Certbot:

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

### Resource Requirements

**Minimum Requirements:**
- CPU: 1 core
- RAM: 512MB
- Storage: 1GB

**Recommended for Production:**
- CPU: 2 cores
- RAM: 1GB
- Storage: 5GB

## Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   # Check what's using the port
   sudo lsof -i :3000
   
   # Kill the process or use a different port
   docker-compose down
   # Edit docker-compose.yml to use different port
   docker-compose up -d
   ```

2. **Permission denied:**
   ```bash
   # Add your user to docker group
   sudo usermod -aG docker $USER
   # Log out and log back in
   ```

3. **Build fails:**
   ```bash
   # Clean Docker cache
   docker system prune -a
   
   # Rebuild from scratch
   docker-compose build --no-cache
   ```

4. **Application not accessible:**
   ```bash
   # Check if container is running
   docker ps
   
   # Check container logs
   docker logs personal-finance-dashboard
   
   # Check if port is properly mapped
   docker port personal-finance-dashboard
   ```

### Health Checks

The application includes health checks. You can verify the health status:

```bash
# Check health status
docker inspect personal-finance-dashboard | grep Health -A 10

# Manual health check
curl http://localhost:3000/health
```

## Security Considerations

1. **Firewall:** Ensure only necessary ports are open
2. **Updates:** Regularly update the Docker image
3. **Backup:** Backup your data directory regularly
4. **HTTPS:** Use HTTPS in production
5. **Access Control:** Consider adding authentication if needed

## Support

If you encounter any issues:

1. Check the logs: `docker-compose logs -f`
2. Verify your Docker installation: `docker --version`
3. Check system resources: `docker system df`
4. Review this documentation
5. Open an issue on the GitHub repository

## Development

For development purposes, you can run the application in development mode:

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

The development server will be available at `http://localhost:5173` with hot reloading enabled.