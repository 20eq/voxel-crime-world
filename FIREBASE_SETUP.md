# Firebase Setup Guide for VoxelCrime World

## Step 1: Create Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click "Add project"
3. Name your project (e.g., "voxel-crime-world")
4. Disable Google Analytics (optional, for simpler setup)
5. Click "Create project"

## Step 2: Enable Authentication

1. In your project dashboard, go to **Build → Authentication**
2. Click "Get started"
3. In the "Sign-in method" tab, click on "Google"
4. Enable it and select your email
5. Click "Save"

## Step 3: Enable Firestore Database

1. Go to **Build → Firestore Database**
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location close to your users
5. Click "Enable"

## Step 4: Get Your Firebase Config

1. Go to **Project Settings** (gear icon)
2. Scroll to "Your apps" section
3. Click the web icon (</>) to add a web app
4. Register your app (give it a nickname)
5. Copy the `firebaseConfig` object

It will look like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

## Step 5: Update Your Code

Replace the placeholder config in `src/firebase/config.js`:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## Step 6: Set Firestore Rules (Important!)

For development/testing, use these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null;
    }
    match /gameStates/{userId} {
      allow read, write: if request.auth != null;
    }
    match /leaderboard/{type}/scores/{scoreId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

To update rules:
1. Go to **Firestore → Rules**
2. Paste the rules above
3. Click "Publish"

## Features Enabled with Firebase

### ✅ Already Working
- Google Sign-in
- Player data saved to cloud
- Cash/inventory persistence
- Stats tracking

### 🔜 Ready for Implementation
- Multiplayer (using gameStates collection)
- Global leaderboards
- Friend system
- Cloud saves

## Troubleshooting

### "Permission denied" errors
- Make sure Firestore rules allow authenticated users
- Check that user is actually signed in (check console)

### "Sign-in failed" errors
- Verify your Firebase config is correct
- Make sure Google sign-in is enabled
- Check browser console for detailed errors

### Data not saving
- Check Firestore dashboard to see if documents are being created
- Verify user is authenticated before saving

## Need Help?

Check the Firebase documentation: https://firebase.google.com/docs