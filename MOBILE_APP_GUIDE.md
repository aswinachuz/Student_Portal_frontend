# Student Portal - Mobile App & Deployment Guide

This project is configured as a cross-platform mobile application powered by **Capacitor** and **Vite PWA**, wrapping your existing React frontend while connecting directly to your Express/MongoDB backend.

---

## 📱 Features Configured

1. **Native Android Project (`frontend/android`)**:
   - Ready to run directly in **Android Studio** or compile via Gradle.
   - Package ID: `com.manchester.studentportal`
   - Permissions: Internet access, cleartext traffic enabled for local/remote API communication.
   - Native hardware back-button support on Android (navigates back smoothly or prompts exit at root pages).
   - Native dark/light status bar auto-synchronization.
   - Splash screen support.

2. **Progressive Web App (PWA)**:
   - Built with `vite-plugin-pwa` and Service Worker pre-caching.
   - Any user visiting the web app on Chrome / Safari / Edge on their mobile device or desktop can tap **"Add to Home Screen"** or **"Install App"** to install it with zero app store setup.

---

## 🚀 How to Build & Download the Mobile App

### Option A: Download APK Directly from GitHub Actions (No Android Studio required! ☁️)

1. Open your repository on GitHub:
   👉 **https://github.com/aswinachuz/Student_Portal_frontend/actions**
2. Click on the latest workflow run named **"Build Android APK"**.
3. Under the **Artifacts** section at the bottom of the page, click on **`StudentPortal-Debug-APK`**.
4. A zip file containing `app-debug.apk` will download to your computer or phone!
5. Unzip and transfer `app-debug.apk` to your Android device to install and use the app immediately.

---

### Option B: Open & Run in Android Studio Locally

1. Make sure [Android Studio](https://developer.android.com/studio) is installed on your machine.
2. In your terminal, run:
   ```powershell
   cd "frontend"
   npx cap open android
   ```
   *(Or open Android Studio manually and select the folder: `D:\MERN\Student Portal\frontend\android`)*
3. Wait for Gradle sync to complete in Android Studio.
4. Plug in your Android phone (with USB Debugging turned on) or start an Android Emulator.
5. Click the green **Run (▶)** button at the top of Android Studio.

---

### Option B: Generate an APK directly from Android Studio

1. Open `frontend/android` in Android Studio.
2. Go to the menu: **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
3. Once completed, a pop-up in Android Studio will say **"APK(s) generated successfully"**.
4. Click **Locate** to find the `app-debug.apk` file.
5. Copy this `.apk` to any Android device to install and use the app.

---

### Option C: Live Reloading During Mobile Development

You can test changes on your phone in real time without rebuilding the APK every time:
```powershell
cd "frontend"
npm run dev -- --host
```
Then configure `server.url` in `frontend/capacitor.config.json` to point to your computer's local Wi-Fi IP (e.g. `http://192.168.1.5:5173`) and run `npx cap sync`.

---

### Option D: Install Directly as a PWA (No Android Studio required!)

1. Run the frontend or host it on your production URL (e.g., Vercel, Render, Netlify).
2. Open the URL in Google Chrome on your phone.
3. Tap the **three-dots menu** (⋮) at the top right of Chrome.
4. Tap **"Install app"** or **"Add to Home Screen"**.
5. The Student Portal icon will appear on your phone's home screen and open full-screen like a native app.

---

## 🛠️ Handy Commands

From the root project directory:
| Command | Description |
|---|---|
| `npm run app:build` | Compiles the React frontend & syncs code into native Android |
| `npm run app:sync` | Syncs assets, plugins, and configs into native Android |
| `npm run app:android` | Launches the project directly in Android Studio |
| `npm run dev:frontend` | Starts Vite local development server |
| `npm run dev:backend` | Starts Express backend server |
