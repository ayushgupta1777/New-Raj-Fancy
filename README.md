# New Raj Fancy Store - Full Stack Application

Welcome to the New Raj Fancy Store repository. This is a complete, production-ready E-commerce application that powers the Play Store mobile app and its supporting backend infrastructure.

## 🗂 Repository Structure

This repository is organized into a clean monorepo containing both the frontend and backend:

- **`mobile/`**: The React Native frontend application (Android/iOS). Built with Expo/React Native CLI.
- **`Server_ERA/`**: The Node.js (Express) backend API server. Connects to MongoDB and Firebase.
- **`docs/`**: Comprehensive documentation for architecture, APIs, and deployment instructions.

## 📚 Documentation Directory

Because this application is currently running in production, thorough documentation has been created for maintenance and handover purposes. Please refer to the specific markdown files below:

1. **[Architecture Overview](docs/ARCHITECTURE.md)** 
   - Learn about the system design, tech stack, data flow, and how the Mobile app communicates with the Server and MongoDB.
2. **[API Reference](docs/API_REFERENCE.md)**
   - Detailed documentation of the backend API routes, including Authentication (JWT) and Push Notification endpoints.
3. **[Deployment & Server Management](docs/DEPLOYMENT.md)**
   - Instructions on how the backend is deployed on the Hostinger VPS, Docker configurations, and managing the live MongoDB database.

## 🚀 Quick Start

### Backend (Node.js)
```bash
cd Server_ERA
npm install
npm run dev
```

### Frontend (React Native)
```bash
cd mobile
npm install
npm run android
```

## 🔐 Production Note
Do not commit sensitive `.env` files, Firebase `google-services.json` (frontend), or `firebase-service-account.json` (backend) to version control. These must be manually configured on the live server and local testing environments.