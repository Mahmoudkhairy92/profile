# Firebase Setup Instructions

## Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Project name: `mahmoud-khairy-portfolio`
4. Disable Google Analytics (optional)
5. Click "Create project"

## Setup Firestore Database

1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Start in **production mode**
4. Choose location closest to your users (e.g., `us-central`)
5. Click "Enable"

## Configure Firestore Rules

Go to "Firestore Database" → "Rules" and update to:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /leaderboard/{document} {
      // Allow anyone to read the leaderboard
      allow read: if true;
      
      // Allow anyone to add scores (write-only)
      allow create: if request.resource.data.keys().hasAll(['playerName', 'score', 'techCollected', 'timestamp', 'duration'])
                    && request.resource.data.playerName is string
                    && request.resource.data.score is number
                    && request.resource.data.techCollected is number
                    && request.resource.data.timestamp is number
                    && request.resource.data.duration is number;
      
      // Prevent updates and deletes
      allow update, delete: if false;
    }
  }
}
```

Click "Publish"

## Get Firebase Configuration

1. Go to Project Settings (gear icon) → "General"
2. Scroll to "Your apps" section
3. Click "Web" icon (</>)
4. Register app name: `Tech Stack Snake`
5. Copy the `firebaseConfig` object

## Update Environment Files

Replace the Firebase config in both:
- `src/environments/environment.ts`
- `src/environments/environment.prod.ts`

With your actual Firebase config values.

## Deploy and Test

```bash
npm run build:gh-pages
node scripts/export-to-docs.js
git add .
git commit -m "Add Firebase Firestore for global leaderboard"
git push origin main
```

## Verify It Works

- Open browser console (F12)
- Play the game and submit a score
- Look for "Score saved to Firestore successfully" in console
- Check Firestore Database in Firebase Console to see the entry
- All users worldwide will now see the same leaderboard!
