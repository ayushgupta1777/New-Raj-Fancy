# Hostinger VPS (`srv1105447`) Server Operations & Maintenance Guide

This document is a comprehensive reference for managing, updating, and troubleshooting the backend servers hosted on the production Hostinger VPS (`root@srv1105447`).

---

## 📋 Quick Server Profile

| Property | Details |
| :--- | :--- |
| **Server Hostname** | `srv1105447` |
| **Provider / OS** | Hostinger VPS &bull; Ubuntu Linux |
| **Default SSH User** | `root` |
| **Process Manager** | PM2 |
| **Primary Domain** | `https://newrajfancystore.adsngrow.in` |
| **Primary Database** | MongoDB (Local service on port `27017`, DB: `ecommerce_reseller`) |

---

## 🗂️ Server Root Directory Map (`/root`)

When logged in via SSH as `root`, the home directory contains:

```
/root/
├── ecommerce/
│   └── HSSE/                     # 🚀 Active E-Commerce Server (New Raj Fancy Store)
├── aguaonebot/                   # 🤖 WhatsApp Bot Service (AguaOne)
├── GIT_H3/
│   └── ServerX/                  # ⚙️ Legacy / Secondary Backend Service
├── application/                  # 📁 Auxiliary application files
├── uploads/                      # 🖼️ Static media & product upload files
├── uploads-backup.tar.gz         # 💾 Compressed backup archive of uploads
├── snap/                         # 📦 Ubuntu snap packages
└── root/                         # 📁 Internal root subdirectory
```

---

## 🖥️ Running Services (PM2 Process Table)

The server runs three background services managed by PM2:

| PM2 ID | App Name | Directory Path | Port | Purpose / Role |
| :---: | :--- | :--- | :---: | :--- |
| **`1`** | **`HSSE`** | `/root/ecommerce/HSSE` | `5001` | **Main Backend for New Raj Fancy Store App & Web**. Handles authentication, product catalog, cart, orders, wallet, FCM notifications, and hosted legal pages (`/privacy-policy`, `/terms-and-conditions`, `/delete-account`). |
| **`2`** | **`aguaone-whatsapp-bot`** | `/root/aguaonebot` | &mdash; | WhatsApp automation bot (TypeScript/Node.js, Caddy, SQLite, Meta Webhook). |
| **`0`** | **`backend`** | `/root/GIT_H3/ServerX` | &mdash; | Secondary / Legacy backend service. |

---

## 🚀 Step-by-Step: Updating the Main Server (`HSSE`)

Whenever changes are made to the backend codebase and pushed to GitHub:

### 1. SSH into the Server
```bash
ssh root@<YOUR_VPS_IP>
# Or using hostname/alias configured in your SSH config
```

### 2. Navigate to the `HSSE` Directory
```bash
cd ~/ecommerce/HSSE
```

### 3. Check Current Git Status (Optional but recommended)
```bash
git status
```
*Make sure there are no uncommitted dirty files.*

### 4. Pull Latest Changes from GitHub
```bash
git pull origin main
```
*Repository Remote: `https://github.com/ayushgupta1777/hostinger-staging_Server_ERA`*

### 5. Restart the PM2 Service
```bash
# Standard restart
pm2 restart HSSE

# If you modified the .env file or environment variables, use:
pm2 restart HSSE --update-env
```

### 6. Verify Server Logs & Startup
```bash
# View last 50 lines and follow live logs for HSSE
pm2 logs HSSE --lines 50
```

You should see successful startup logs:
- `🔥 Firebase Admin initialized successfully`
- `🚀 Server running on port 5001`
- `✅ MongoDB Connected: localhost`
- `📊 Database: ecommerce_reseller`

Press `Ctrl + C` to exit the log tail.

---

## 🌐 Public Endpoints & Hosted Pages (`HSSE`)

The `HSSE` process handles both API traffic and public web pages:

| Endpoint URL | Description |
| :--- | :--- |
| `https://newrajfancystore.adsngrow.in/` | Root server health check / welcome |
| `https://newrajfancystore.adsngrow.in/privacy-policy` | Official Hosted Privacy Policy HTML |
| `https://newrajfancystore.adsngrow.in/terms-and-conditions` | Hosted Terms & Conditions HTML |
| `https://newrajfancystore.adsngrow.in/delete-account` | Public Account Deletion Request Portal |
| `https://newrajfancystore.adsngrow.in/.well-known/assetlinks.json` | Android App Links & Digital Asset Links Verification |
| `https://newrajfancystore.adsngrow.in/api-docs` | Swagger / OpenAPI Documentation (Local port `5001`) |
| `https://newrajfancystore.adsngrow.in/api/*` | REST API routes (Auth, Products, Cart, Orders, Notifications, etc.) |

---

## 🤖 Updating the WhatsApp Bot (`aguaonebot`)

If you need to update the `aguaonebot`:

```bash
cd ~/aguaonebot
git pull origin main

# If dependencies changed:
npm install

# If build step is required:
npm run build

# Restart in PM2:
pm2 restart aguaone-whatsapp-bot
pm2 logs aguaone-whatsapp-bot --lines 30
```

---

## ⚙️ Updating the Secondary Backend (`backend`)

If updating `/root/GIT_H3/ServerX`:

```bash
cd ~/GIT_H3/ServerX
git pull origin main
pm2 restart backend
pm2 logs backend --lines 30
```

---

## 🛠️ Essential PM2 & System Commands Cheatsheet

### PM2 Process Monitoring
```bash
# View summary table of all running applications
pm2 status
# or
pm2 list

# Detailed metrics (CPU, Memory, uptime, script path) for HSSE
pm2 describe HSSE

# Monitor real-time memory and CPU dashboard in terminal
pm2 monit
```

### PM2 Log Management
```bash
# View logs of all applications simultaneously
pm2 logs

# View logs for a specific application only
pm2 logs HSSE
pm2 logs aguaone-whatsapp-bot
pm2 logs backend

# Clear old accumulated log files to free disk space
pm2 flush
```

### PM2 Persistence Across Reboots
If you add or delete services and want them to survive server reboots:
```bash
pm2 save
```

### Disk Space & Health Checks
```bash
# Check free disk space
df -h

# Check RAM and Swap usage
free -m

# Check running ports
ss -tuln | grep 5001
```

---

## 🗄️ Database Architecture (MongoDB)

- **Engine:** MongoDB running locally as a systemd service (`systemctl status mongod`).
- **Port:** `27017`
- **Database Name:** `ecommerce_reseller`
- **Connection URI (Local Server):**
  ```env
  MONGO_URI=mongodb://localhost:27017/ecommerce_reseller
  ```
- **Connection URI (Remote / Compass with credentials):**
  ```text
  mongodb://HSSE:<PASSWORD>@<VPS_IP>:27017/ecommerce_reseller?authSource=admin
  ```

---

## 📁 HSSE Internal Script Utility Directory

Inside `/root/ecommerce/HSSE/scripts/`, convenient administrative scripts are available:

- `scripts/database/`:
  - `check_live_db.js` &bull; Inspect live MongoDB collections and documents
  - `check_all_fcm.js` & `check_tokens.js` &bull; Inspect registered device notification tokens
  - `list_cols.js` & `list_dbs.js` &bull; List MongoDB collections and databases
- `scripts/maintenance/`:
  - `createDeveloper.js` & `seed-developer.js` &bull; Seed or configure developer accounts
  - `resetAdmin.js` &bull; Reset administrative passwords
- `scripts/testing/`:
  - `test_fcm_endpoint.js` &bull; Validate FCM push notifications without sending live blasts
  - `test_otp.js` &bull; Test OTP SMS delivery flow

To run any script directly on the server:
```bash
cd ~/ecommerce/HSSE
node scripts/database/check_live_db.js
```

---

## 📌 Daily Streak & Privacy Policy Note

For details on why the **Daily Streak & App Usage** disclosure was temporarily removed from the production Privacy Policy (while the code remains fully implemented in both mobile and backend), and instructions on how to re-activate it when releasing a new Google Play Store build, refer to:

👉 **[`DAILY_STREAK_AND_PRIVACY_POLICY_STATUS.md`](./DAILY_STREAK_AND_PRIVACY_POLICY_STATUS.md)**

