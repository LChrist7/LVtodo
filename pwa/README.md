# LVTodo PWA - Gamified Task Management

A Progressive Web App for gamified task management designed for couples, families, and groups.

## Features

- **Task Management**: Create, assign, and track tasks with deadlines
- **Game Mechanics**:
  - Earn points (10 for easy, 25 for hard tasks)
  - Level up with XP system
  - Unlock 9 different achievements
  - Late task penalties (50% points reduction)
- **Groups**: Create and join groups with invite codes
- **Wishes**: Spend earned points on rewards
- **Statistics**: Track progress and performance
- **Push Notifications**: Get notified at 80%, 50%, 30%, and 5% of time remaining
- **PWA Features**: Install on mobile/desktop, works offline

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Backend**: Firebase (Auth, Firestore, Storage, Cloud Messaging)
- **PWA**: vite-plugin-pwa + Workbox
- **Icons**: Lucide React
- **Routing**: React Router v6

## Prerequisites

- Node.js 18+ and npm/yarn
- Firebase project (free tier works)

## Setup

### 1. Install Dependencies

```bash
cd pwa
npm install
```

### 2. Configure Firebase

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Enable Cloud Storage
5. Enable Cloud Messaging
6. Copy your Firebase config

### 3. Environment Variables

Create a `.env` file in the `pwa/` directory:

```bash
cp .env.example .env
```

Edit `.env` and add your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### 4. Firestore Security Rules

In Firebase Console → Firestore → Rules, add:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    // Groups
    match /groups/{groupId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth.uid in resource.data.memberIds;
      allow delete: if request.auth.uid == resource.data.createdBy;
    }

    // Tasks
    match /tasks/{taskId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth.uid == resource.data.assignedTo
                    || request.auth.uid == resource.data.assignedBy;
      allow delete: if request.auth.uid == resource.data.assignedBy;
    }

    // Wishes
    match /wishes/{wishId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.createdBy;
    }

    // Task History
    match /taskHistory/{historyId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
  }
}
```

## Development

```bash
npm run dev
```

Open http://localhost:5173

## Build for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

## Deploy

### Option 1: Firebase Hosting (Recommended)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize hosting
firebase init hosting

# Deploy
firebase deploy --only hosting
```

### Option 2: Vercel

```bash
npm install -g vercel
vercel
```

### Option 3: Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
```

## Project Structure

```
pwa/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── common/      # Shared components
│   │   ├── layouts/     # Layout components
│   │   ├── navigation/  # Navigation components
│   │   └── tasks/       # Task-specific components
│   ├── config/          # Configuration files
│   │   ├── constants.ts # App constants
│   │   └── firebase.ts  # Firebase initialization
│   ├── pages/           # Page components
│   │   ├── auth/        # Authentication pages
│   │   ├── groups/      # Group pages
│   │   ├── tasks/       # Task pages
│   │   └── wishes/      # Wish pages
│   ├── services/        # API services
│   │   ├── authService.ts
│   │   ├── groupService.ts
│   │   └── taskService.ts
│   ├── store/           # Zustand stores
│   │   ├── authStore.ts
│   │   └── gameStore.ts
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── .env.example         # Environment variables template
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Game Mechanics

### Points System
- **Easy Task**: 10 points, 15 XP
- **Hard Task**: 25 points, 40 XP
- **Late Penalty**: 50% points reduction (XP remains)

### Leveling
- 100 XP per level
- Max level: 100

### Achievements
1. First Task (1 task) - 50 XP, 10 points
2. Task Master (10 tasks) - 100 XP, 25 points
3. Task Expert (50 tasks) - 300 XP, 75 points
4. Novice (Level 5) - 50 points
5. Professional (Level 10) - 100 points
6. Rich (1000 points) - 200 XP
7. Weekly Streak (7 days) - 150 XP, 50 points
8. Monthly Streak (30 days) - 500 XP, 200 points
9. Wish Fulfiller (1 wish) - 100 XP

### Notifications
Tasks send notifications at:
- 80% time remaining
- 50% time remaining
- 30% time remaining
- 5% time remaining

## User Flow

1. **Registration**: Email + password + display name
2. **Create/Join Group**: Get/enter 6-character invite code
3. **Create Tasks**: Assign to group members with deadline
4. **Complete Tasks**: Earn points and XP
5. **Unlock Achievements**: Get bonus rewards
6. **Spend Points**: Purchase wishes from the wish shop
7. **Level Up**: Unlock titles and prestige

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android 90+)

## PWA Features

- **Install to Home Screen**: Works like a native app
- **Offline Support**: Service Worker caches assets
- **Push Notifications**: Stay updated on task deadlines
- **Background Sync**: Syncs data when back online

## Contributing

This is a private project. For issues or suggestions, contact the developer.

## License

Proprietary - All rights reserved

## Support

For support, email: support@lvtodo.app (placeholder)

---

**Built with ❤️ using React + Firebase**
