# CampusFlow - LNMIIT Resource Hub

CampusFlow is the official (prototype) resource management and communication platform for The LNM Institute of Information Technology (LNMIIT). It bridges the gap between students and faculty with features like Hall Booking, Faculty Availability Matrix, and Academic Chat.

## Features

- **Authentication**: Role-based access for Students (`@lnmiit.ac.in`) and Faculty.
- **The Flow Dashboard**: Centralized view of pending requests and upcoming schedules.
- **LT & Hall Booking**: Visual booking engine for Lecture Theaters (LT-1 to LT-19), OAT, and Seminar Halls.
- **Faculty Availability Matrix**: Real-time status tracking (Available, Busy, In Class) for professors.
- **Direct Academic Chat**: Real-time messaging simulation for academic queries.

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (Alpha/PostCSS)
- **Icons**: Lucide React
- **Animations**: Framer Motion

- **State Management**: React Context (`AuthContext`) + Firebase Realtime Listeners
- **Backend / Services**: Firebase (Authentication, Firestore, Storage)

## Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.


### 3. Firebase Setup (Required)
Create a `.env.local` file in the `web` directory with your Firebase project credentials.
This application relies on Firebase for:
*   **Authentication**: Handling access for Students (`@lnmiit.ac.in`) and Faculty.
*   **Firestore**: Storing Bookings, Users, and Events.

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Deployment

This project is optimized for deployment on **Vercel**.

1.  Push code to GitHub.
2.  Import project into Vercel.
3.  **Environment Variables**:
    - Go to "Environment Variables" in the Vercel deployment screen.
    - Copy all keys from your local `.env.local` and add them there.
4.  Framework Preset: **Next.js**.
5.  Deploy.

## Future Roadmap

- **Admin Role**: Enhanced permissions for detailed audit logs and system-wide overrides.
- **Push Notifications**: Integration with FCM for real-time alerts on booking status changes.
- **Mobile Native**: React Native port for iOS/Android.
- **Advanced Analytics**: Usage heatmaps for Lecture Theaters to optimize scheduling.
