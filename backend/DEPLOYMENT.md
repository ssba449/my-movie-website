# StreamVault: Oracle Linux / Ubuntu Deployment Guide

This guide details how to deploy your movie website on a Linux server (Oracle Cloud Free Tier, Ubuntu, etc.) using **PM2** for process management and **Nginx** as a reverse proxy.

## 1. Prerequisites
Ensure your Linux server has Node.js (v18+) and Git installed.

```bash
# Update and install Node.js (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git
```

## 2. Install PM2
PM2 will keep your services running in the background and auto-restart them if the server reboots.

```bash
sudo npm install -g pm2
```

## 3. Deployment Steps

### A. Upload the Code
Upload the entire project folder to your server (e.g., to `/home/ubuntu/my-movie-website`).

### B. Install Dependencies
Run the install command in the root directory.

```bash
cd /home/ubuntu/my-movie-website
npm install
```

### C. Build the Frontend
Generate the production-ready Next.js build.

```bash
npm run build
```

### D. Start all Services
Use the provided `ecosystem.config.js` to launch the Frontend, Showbox API, and Stream Server simultaneously.

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 4. Nginx Configuration (Optional but Recommended)
To point your domain (e.g., `yoursite.com`) to the app running on port 3000:

1. Install Nginx: `sudo apt install nginx`
2. Create a config: `sudo nano /etc/nginx/sites-available/streamvault`
3. Paste this:

```nginx
server {
    listen 80;
    server_name yourdomain.com; # Replace with your domain or IP

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

4. Enable it:
```bash
sudo ln -s /etc/nginx/sites-available/streamvault /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 5. Maintenance Commands
- **Check logs**: `pm2 logs`
- **Restart all**: `pm2 restart all`
- **Status dashboard**: `pm2 status`

---
**Note:** Your website now uses **Video.js**, making it fully compatible with Safari (iPhone/iPad) and Android browsers. All traffic is proxied through the main website port, so users will never see FebBox URLs.
