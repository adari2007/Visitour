# 📱 Mobile App Deployment Guide (Android & iOS)

## Overview
Visitour mobile uses **Expo** with **EAS Build** (Expo Application Services) to build and deploy to Android and iOS.

---

## Step 1 — One-Time Setup

### 1.1 Install EAS CLI
```bash
npm install -g eas-cli
```

### 1.2 Create an Expo Account
Go to https://expo.dev and create a free account.

### 1.3 Log in
```bash
eas login
```

### 1.4 Link your project to EAS
Run this from the `apps/mobile` directory:
```bash
cd apps/mobile
eas init
```
This will generate a real `projectId` and update your `app.json` automatically.
Replace `YOUR_EAS_PROJECT_ID` in `app.json` with the generated ID.

---

## Step 2 — Build the App

Navigate to the mobile directory first:
```bash
cd apps/mobile
npm install
```

### Option A: Preview Build (APK for Android, Ad-hoc for iOS)
Test on real devices without going through the app store.

```bash
# Android APK (easiest - no store account needed)
eas build --platform android --profile preview

# iOS (requires Apple Developer account - $99/year)
eas build --platform ios --profile preview
```

### Option B: Production Build (for App Stores)
```bash
# Android AAB (for Google Play)
eas build --platform android --profile production

# iOS IPA (for App Store)
eas build --platform ios --profile production

# Both platforms at once
eas build --platform all --profile production
```

> Builds run in the cloud — no Xcode or Android Studio required for cloud builds.

---

## Step 3 — Submit to App Stores

### Android — Google Play Store

**Requirements:**
- Google Play Developer account ($25 one-time fee) at https://play.google.com/console
- Service account key (JSON file)

**Steps:**
1. Create a Google Play Developer account
2. Create a new app in Play Console
3. Go to Setup → API access → Create a service account
4. Download the JSON key → save as `apps/mobile/google-service-account.json`
5. Update `eas.json`:
   ```json
   "android": {
     "serviceAccountKeyPath": "./google-service-account.json",
     "track": "internal"
   }
   ```
6. Submit:
   ```bash
   eas submit --platform android --profile production
   ```

**Track options:**
- `internal` — Share with up to 100 testers
- `alpha` — Closed testing
- `beta` — Open testing
- `production` — Public release

---

### iOS — Apple App Store

**Requirements:**
- Apple Developer account ($99/year) at https://developer.apple.com
- App Store Connect app created

**Steps:**
1. Create an Apple Developer account
2. Go to https://appstoreconnect.apple.com → Create a new app
3. Get your credentials:
   - **Apple ID**: your Apple login email
   - **ASC App ID**: Found in App Store Connect → App → App Information → Apple ID number
   - **Apple Team ID**: Found at https://developer.apple.com/account/ → Membership
4. Update `eas.json`:
   ```json
   "ios": {
     "appleId": "you@email.com",
     "ascAppId": "1234567890",
     "appleTeamId": "XXXXXXXXXX"
   }
   ```
5. Submit:
   ```bash
   eas submit --platform ios --profile production
   ```

---

## Step 4 — Testing Before Release

### On Android (easiest)
1. Build a preview APK:
   ```bash
   eas build --platform android --profile preview
   ```
2. Download the APK from the EAS dashboard link
3. Install directly on your Android device

### On iOS (requires Apple Developer account)
1. Build with internal distribution:
   ```bash
   eas build --platform ios --profile preview
   ```
2. EAS will provide a TestFlight link or ad-hoc install link
3. Install via TestFlight or direct link

### Using Expo Go (quickest for development)
Test without building:
```bash
cd apps/mobile
npx expo start
```
Scan the QR code with the **Expo Go** app on your phone.
> Note: Some native features may not work in Expo Go.

---

## Environment Variables

The API URL is baked in at build time via `eas.json`:
```json
"env": {
  "EXPO_PUBLIC_API_URL": "https://visitourapi-production.up.railway.app/api"
}
```

The `.env` file is used for local development only:
```
EXPO_PUBLIC_API_URL=https://visitourapi-production.up.railway.app/api
```

---

## Quick Command Reference

| Action | Command |
|--------|---------|
| Local dev (Expo Go) | `cd apps/mobile && npx expo start` |
| Android preview APK | `eas build --platform android --profile preview` |
| iOS preview | `eas build --platform ios --profile preview` |
| Production Android | `eas build --platform android --profile production` |
| Production iOS | `eas build --platform ios --profile production` |
| Submit Android | `eas submit --platform android` |
| Submit iOS | `eas submit --platform ios` |
| Check build status | `eas build:list` |

---

## Files Created/Modified

| File | Purpose |
|------|---------|
| `apps/mobile/eas.json` | EAS build profiles and env vars |
| `apps/mobile/.env` | Local development env vars |
| `apps/mobile/app.json` | App metadata (bundle ID, version, etc.) |

---

## Cost Summary

| Platform | Account Cost | Notes |
|----------|-------------|-------|
| EAS Build | Free (30 builds/month) | Paid plans for more |
| Google Play | $25 one-time | Per developer account |
| Apple App Store | $99/year | Per developer account |

