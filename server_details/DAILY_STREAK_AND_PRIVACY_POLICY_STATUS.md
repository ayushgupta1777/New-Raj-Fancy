# 📌 Critical Status Note: Daily Streak Feature & Privacy Policy Disclosure

> **Last Updated:** October 2026  
> **Status:** Code Implemented (Staging/Repo) &bull; Privacy Policy Disclosure Temporarily Withheld from Production  
> **Purpose:** Read this document if you are returning to this project after months (or if an AI/developer asks why Daily Streak / App Usage is not declared in the live Privacy Policy).

---

## 🎯 Executive Summary (What Happened & Why)

1. **The Code Exists:**
   The **Daily Streak & App Usage Tracker** has already been developed and exists in the codebase:
   - **Frontend (React Native):** Tracks active app time and streak counters.
   - **Backend (Express / Node.js):** Routes, controller, and MongoDB schema to sync and store streak sessions.

2. **Why It Was Removed from the Privacy Policy:**
   - In October 2026, disclosures for *"App Usage and Activity Data"* (active app usage time, streak records) were drafted into both the in-app and server-hosted Privacy Policies.
   - However, the **currently released live build on the Google Play Store** does not yet have this feature actively published to users.
   - Having a Privacy Policy declare that the app collects *"active app usage time and streak data"* while the public Play Store release and Google Play Data Safety form do not match can trigger Google Play Store audit warnings or rejections.
   - Therefore, the disclosure was **temporarily removed** from both the live server HTML and in-app privacy screen to keep everything 100% compliant and consistent with the live released build.

---

## 📂 Where the Daily Streak Code Lives

The underlying code is intact and ready for when the new app version is published:

### 1. Frontend Mobile App Files (`/mobile`)
- **Hook:** [`mobile/src/hooks/useDailyStreakTracker.js`](file:///c:/rnapp/mobile/src/hooks/useDailyStreakTracker.js)  
  *Tracks user app active session duration, stores pending sessions in `@streak_pending_sessions` via AsyncStorage, and syncs via `POST /api/streak/sync`.*
- **UI Screen:** [`mobile/src/screens/profile/PointsScreen.js`](file:///c:/rnapp/mobile/src/screens/profile/PointsScreen.js)  
  *Displays daily streak calendar, streak fire icon 🔥, current streak count, and longest streak.*
- **Navigator:** [`mobile/src/navigation/MainNavigator.js`](file:///c:/rnapp/mobile/src/navigation/MainNavigator.js)  
  *Calls `useDailyStreakTracker()` globally for logged-in sessions.*
- **Profile Navigation:** [`mobile/src/screens/profile/ProfileScreen.js`](file:///c:/rnapp/mobile/src/screens/profile/ProfileScreen.js)  
  *Menu entry for navigating to Points / Streak screen.*

### 2. Backend Server Files (`/Server_ERA` / `HSSE`)
- **Controller:** `Server_ERA/controllers/streakController.js`  
  *Endpoints for `GET /api/streak` and `POST /api/streak/sync`.*
- **Model:** `Server_ERA/models/DailyStreak.js`  
  *Mongoose schema tracking `userId`, `currentStreak`, `longestStreak`, and calendar records.*
- **Routes:** `Server_ERA/routes/streakRoutes.js`  
  *Route mounting for streak endpoints.*
- **Server Mount:** [`Server_ERA/server.js`](file:///c:/rnapp/Server_ERA/server.js)  
  *`app.use('/api/streak', streakRoutes);` (active on port 5001).*

---

## 📝 Exact Disclosure That Was Temporarily Removed

This is the exact section that was removed from both policies:

```text
Title:
2. App Usage and Activity Data

Content:
"We may collect information about your use of the New Raj Fancy app, such as active app usage time, activity dates, and related progress information, to provide features such as daily streaks, activity history, and personalized app functionality."
```

### In-App Policy File:
[`mobile/src/screens/profile/Policies/PrivacyScreen.js`](file:///c:/rnapp/mobile/src/screens/profile/Policies/PrivacyScreen.js)

### Server-Hosted Policy File & URL:
[`Server_ERA/server.js`](file:///c:/rnapp/Server_ERA/server.js) &rarr; Hosted at `https://newrajfancystore.adsngrow.in/privacy-policy`

---

## 🚀 Re-Activation Checklist (When Ready to Release Daily Streak)

When you return (e.g., in ~6 months) and are ready to release the new app version containing the Daily Streak feature to the Google Play Store, follow these steps:

### Step 1: Re-add Section 2 to In-App Privacy Policy
In [`mobile/src/screens/profile/Policies/PrivacyScreen.js`](file:///c:/rnapp/mobile/src/screens/profile/Policies/PrivacyScreen.js), insert the section right after Section 1:
```jsx
<Section
  icon="time"
  iconColor="#10B981"
  title="2. App Usage and Activity Data"
  content="We may collect information about your use of the New Raj Fancy app, such as active app usage time, activity dates, and related progress information, to provide features such as daily streaks, activity history, and personalized app functionality."
/>
```
And renumber subsequent sections:
- `2. Usage of Data` &rarr; `3. Usage of Data`
- `3. Data Sharing` &rarr; `4. Data Sharing`
- `4. Data Security` &rarr; `5. Data Security`
- `5. User Rights & Account Deletion` &rarr; `6. User Rights & Account Deletion`

### Step 2: Re-add Section 2 to Server-Hosted Privacy Policy
In [`Server_ERA/server.js`](file:///c:/rnapp/Server_ERA/server.js), insert the HTML right after Section 1:
```html
<div class="section">
    <h2><span>2</span> App Usage and Activity Data</h2>
    <p>We may collect information about your use of the New Raj Fancy app, such as active app usage time, activity dates, and related progress information, to provide features such as daily streaks, activity history, and personalized app functionality.</p>
</div>
```
And renumber the `<span>` numbers for subsequent `<h2>` titles to `3`, `4`, `5`, `6`.

### Step 3: Deploy Server Policy to Hostinger VPS
```bash
ssh root@srv1105447
cd ~/ecommerce/HSSE
git pull origin main
pm2 restart HSSE
```

### Step 4: Update Google Play Console Data Safety Form
Before submitting the new AAB build:
1. Go to **Google Play Console** &rarr; **App content** &rarr; **Data safety**.
2. Under **App activity**, declare **App interactions** (usage time / streaks for app functionality).
3. Confirm that the privacy policy URL is `https://newrajfancystore.adsngrow.in/privacy-policy`.

### Step 5: Build & Release the Android Bundle (AAB)
Build your release bundle with the daily streak tracker enabled and submit to Google Play Console review.
