# Quick Server Update & CLI Cheatsheet

Use these quick commands for fast reference during day-to-day operations.

---

## ⚡ Routine Update Workflow (Copy & Paste)

```bash
# 1. SSH into the server
ssh root@srv1105447

# 2. Go to the HSSE directory
cd ~/ecommerce/HSSE

# 3. Pull latest code
git pull origin main

# 4. Restart server
pm2 restart HSSE

# 5. Check logs
pm2 logs HSSE --lines 40
```

---

## 🔄 If Dependencies or `.env` Changed

```bash
cd ~/ecommerce/HSSE
git pull origin main

# If new npm packages were added:
npm install --production

# Restart and reload environment variables:
pm2 restart HSSE --update-env

# Check logs:
pm2 logs HSSE --lines 40
```

---

## 📊 PM2 Quick Commands

| Action | Command |
| :--- | :--- |
| **Check all processes** | `pm2 status` |
| **View HSSE logs** | `pm2 logs HSSE` |
| **View WhatsApp bot logs** | `pm2 logs aguaone-whatsapp-bot` |
| **View legacy backend logs** | `pm2 logs backend` |
| **Restart HSSE** | `pm2 restart HSSE` |
| **Stop HSSE** | `pm2 stop HSSE` |
| **Start HSSE** | `pm2 start HSSE` |
| **Clear logs** | `pm2 flush` |
| **Save current PM2 state** | `pm2 save` |

---

## 🌐 Quick Health Check URLs

- **API Base:** `https://newrajfancystore.adsngrow.in/api/settings/latest_app_version`
- **Privacy Policy:** `https://newrajfancystore.adsngrow.in/privacy-policy`
- **Account Deletion:** `https://newrajfancystore.adsngrow.in/delete-account`
- **Asset Links:** `https://newrajfancystore.adsngrow.in/.well-known/assetlinks.json`

---

## 📌 Daily Streak & Privacy Status
- See **[`DAILY_STREAK_AND_PRIVACY_POLICY_STATUS.md`](./DAILY_STREAK_AND_PRIVACY_POLICY_STATUS.md)** for details on why the Daily Streak disclosure was temporarily removed from production and how to restore it when releasing the new Play Store update.

