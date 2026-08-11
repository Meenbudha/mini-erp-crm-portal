# Deployment Guide — Mini ERP/CRM

This project supports multiple deployment targets. Choose one:

- **Option A** — Railway.app (Recommended — free tier, managed PostgreSQL)
- **Option B** — Render.com (Free tier backend + static frontend)
- **Option C** — VPS / Ubuntu Server (Self-hosted)

---

## Option A: Railway.app (Recommended)

### 1. Deploy PostgreSQL
1. Go to [railway.app](https://railway.app) → New Project → Add Service → PostgreSQL
2. Copy the `DATABASE_URL` from the PostgreSQL service Variables tab

### 2. Deploy Backend
1. New Service → GitHub Repo → select `mini-erp-crm` → Set Root Directory to `backend`
2. Add Variables:
   ```
   DATABASE_URL=<paste from step 1>
   JWT_SECRET=<any long random string, min 32 chars>
   PORT=5000
   NODE_ENV=production
   ```
3. Start Command: `npm start`
4. Build Command: `npm install && npm run build && npx prisma migrate deploy && npx prisma db seed`
5. Copy the backend public URL (e.g. `https://backend-xxx.railway.app`)

### 3. Deploy Frontend
1. New Service → GitHub Repo → Root Directory `frontend`
2. Add Variables:
   ```
   VITE_API_URL=https://backend-xxx.railway.app/api
   ```
3. Build Command: `npm install && npm run build`
4. Output Directory: `dist`

---

## Option B: Render.com

### Backend (Web Service)
- Environment: **Node**
- Root Directory: `backend`
- Build: `npm install && npm run build && npx prisma migrate deploy`
- Start: `node dist/server.js`
- Environment Variables:
  ```
  DATABASE_URL=postgresql://...
  JWT_SECRET=your-secret
  PORT=10000
  NODE_ENV=production
  ```

### Frontend (Static Site)
- Root Directory: `frontend`
- Build: `npm install && npm run build`
- Publish: `dist`
- Environment Variables:
  ```
  VITE_API_URL=https://your-backend.onrender.com/api
  ```

---

## Option C: VPS / Ubuntu Self-Hosted

### 1. Server Setup
```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx
```

### 2. PostgreSQL Setup
```bash
sudo -u postgres psql
CREATE DATABASE mini_erp;
CREATE USER erp_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE mini_erp TO erp_user;
\q
```

### 3. Clone & Configure Backend
```bash
git clone https://github.com/your-repo/mini-erp-crm.git
cd mini-erp-crm/backend

# Create .env
cat > .env << EOF
DATABASE_URL="postgresql://erp_user:your_password@localhost:5432/mini_erp"
JWT_SECRET="your-long-secret-key-here"
PORT=5000
NODE_ENV=production
EOF

npm install
npm run build
npx prisma migrate deploy
npx prisma db seed

# Start with PM2
pm2 start dist/server.js --name mini-erp-backend
pm2 save
pm2 startup
```

### 4. Build & Serve Frontend
```bash
cd ../frontend

cat > .env.production << EOF
VITE_API_URL=https://yourdomain.com/api
EOF

npm install
npm run build

# Copy dist to nginx
sudo cp -r dist/* /var/www/html/
```

### 5. Nginx Config
```bash
sudo nano /etc/nginx/sites-available/mini-erp
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend (React SPA)
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API proxy
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/mini-erp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# SSL with Let's Encrypt
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## Environment Variables Reference

### Backend `.env`
| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Secret for signing JWT tokens (min 32 chars) |
| `PORT` | ✅ | Server port (default: 5000) |
| `NODE_ENV` | Optional | Set to `production` for prod builds |

### Frontend `.env.production`
| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | ✅ | Full URL to backend API (e.g. `https://api.yourdomain.com/api`) |

---

## Pre-Deployment Checklist

```
[ ] Strong JWT_SECRET set (not default/dev key)
[ ] DATABASE_URL points to production DB
[ ] NODE_ENV=production set on backend
[ ] VITE_API_URL set to production backend URL
[ ] npx prisma migrate deploy run on prod DB
[ ] npx prisma db seed run to create initial admin users
[ ] Backend tsc --noEmit → 0 errors
[ ] Frontend tsc --noEmit → 0 errors
[ ] All API endpoints returning correct status codes
[ ] CORS configured to allow frontend domain
[ ] HTTPS enabled (SSL cert applied)
```

---

## Post-Deployment Verification

```bash
# Test backend health
curl https://api.yourdomain.com/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@erp.com","password":"Password@123"}'
# Expected: {"success":true,"data":{"token":"...",...}}

# Run automated test suite against production
BASE_URL=https://api.yourdomain.com/api npx tsx src/tests/system_test.ts
```
