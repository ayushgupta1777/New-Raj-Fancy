# New Raj Fancy - Mobile App (ECOM-Display)

This repository contains the **Frontend Mobile Application** (React Native) for New Raj Fancy. 
This is a cleanly separated frontend repository optimized for production, Play Store deployment, and easy CI/CD integration.

## 🏗 Architecture Overview

*   **Frontend (This Repository):** Located in the `mobile/` directory. Built with React Native.
*   **Backend Server:** Managed in a separate repository and hosted externally (Hostinger). This provides a clean microservice architecture.
*   **Design Assets:** Managed locally outside of version control to keep this repository lightweight and fast.

## 🚀 Getting Started

### Prerequisites
*   Node.js (>= 20)
*   React Native CLI environment setup (Android Studio / Xcode)

### Installation
1. Clone this repository.
2. Navigate to the mobile directory:
   ```bash
   cd mobile
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Running the App
**For Android:**
```bash
npm run android
```

**For iOS (Mac only):**
```bash
cd ios
pod install
cd ..
npm run ios
```

## 📦 Production & Deployment

*   **Android Package Name:** `com.newrajfancystore.app`
*   **Version Management:** When preparing a new release, update `versionCode` and `versionName` inside `mobile/android/app/build.gradle`.

> **Note:** Ensure you have created a `.env` file in the `mobile/` directory containing your production API endpoints before building the release APK/AAB.