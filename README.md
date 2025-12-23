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
- **State Management**: React Context (`AuthContext`, `SocketContext`)

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


### 3. Firebase Setup (Required for persistence)
Create a `.env.local` file in the `web` directory with your Firebase project credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Run Development Server

- **Context API**:
    - `AuthContext`: Manages user sessions (mock persisted via LocalStorage).
    - `SocketContext`: Simulates WebSocket connections (latency, message delivery) for Chat.
- **Service Layer**:
    - `services/bookingService`: Abstracts Hall data and booking logic.
    - `services/facultyService`: Handles faculty directory and status logic.
- **Mock Data**: Currently, the application uses sophisticated mock data services (`services/*`) that mimic async API calls, preparing the codebase for easy substitution with a real backend (e.g., Supabase/Firebase) in the future.

## Deployment

This project is optimized for deployment on **Vercel**.

1.  Push code to GitHub.
2.  Import project into Vercel.
3.  **Environment Variables**:
    - Go to "Environment Variables" in the Vercel deployment screen.
    - Copy all keys from your local `.env.local` and add them there (e.g. `NEXT_PUBLIC_FIREBASE_API_KEY`, etc.).
4.  Framework Preset: **Next.js**.
5.  Deploy.

## Future Roadmap

- Integrate Supabase for real PostgreSQL database.
- Replace `SocketContext` simulation with `socket.io` or Supabase Realtime.
- Implementing Admin role for Approval workflows.
