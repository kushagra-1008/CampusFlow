# CampusFlow Verification Walkthrough

## 1. Project Overview
**CampusFlow** is a unified campus utility dashboard tailored for LNMIIT (The LNM Institute of Information Technology). It connects students and faculty through real-time resource booking and academic collaboration tools.

## 2. Features Verified

### ✅ Authentication & Roles
- **Unified Login**: `/auth/login` handles both roles seamlessly.
- **Role Enforcement & Security**:
  - **Login Validation**: Fixed case-sensitivity issue. Users can login with `Faculty@lnmiit.ac.in` or `faculty@lnmiit.ac.in`.
  - **Role Separation**: Faculty emails strictly routed to Faculty Portal; Student emails to Student Portal.
- **Persistence**: User session and role persist across reloads using `localStorage` and `AuthContext`.
- **Firestore Integration**: First-time login saves user data to the `users` collection.

### ✅ LT & Hall Booking (Real-Time)
- **Visual Availability**:
  - **Green**: Available slots.
  - **Red / Translucent**: Booked slots (disabled).
- **Real-Time Sync**: Firestore `onSnapshot` listeners ensure instant updates for all connected users.
- **Auto-Approval**:
  - **Faculty**: Bookings made by faculty are **Auto-Approved** immediately.
  - **Student**: Bookings start as **Pending** and require faculty approval.
- **Booking Flow**: Users select a slot and provide a "Purpose".

### ✅ Dynamic Dashboard
- **Student View**:
  - **My Requests**: Real-time count of active bookings.
  - **History**: List of personal bookings with status (`Pending`, `Approved`, `Rejected`).
- **Faculty View**:
  - **Approvals Queue**: Live feed of student requests (faculty's own bookings are hidden/auto-approved).
  - **Actionable**: Approve/Reject buttons update status instantly.

### ✅ Booking Management
- **Cancellation**:
  - **Students**: Can delete their own bookings (Pending or Approved).
  - **Faculty**: Can delete any booking (Admin capability).
- **Editing**:
  - **Pencil Icon**: Users can click to rename the Event Title (`purpose`).
  - **Security**: "Edit" button only appears for the user who created the booking (Owner Validation).

### ✅ Finale - Hackathon Ready
- **Strict Sorting**: Faculty Approvals now strictly sort by **Date (Asc)** then **Time (Asc)**.
- **Event Navigation**: Students can navigate "Campus Events" day-by-day using a Date Picker.
- **Cleanup**: Codebase free of debug logs and syntax errors.

## 3. Transformations & Migrations
- **Faculty Database**:
  - Replaced hardcoded list with **Firestore Collection**.
  - **Auto-Seeding**: System automatically creates Faculty 1-8 if missing.
  - **Login Restrictions**: Strictly enforced whitelist for Faculty (1-8) and Students (1-20).

## 4. Deployment & Environment
- **Platform**: Vercel (Production)
- **Database**: Firebase Firestore

## 5. Verification Checklists

### Manual Verification Steps
1.  [x] **Login**: Restrict to `student1@lnmiit.ac.in` (Work) vs `random@lnmiit.ac.in` (Block).
2.  [x] **Booking**: Student creates booking -> Status Pending.
3.  [x] **Edit**: Student edits booking title -> Reflects instantly.
4.  [x] **Faculty**: Login -> See booking -> Approve -> Status Approved.
5.  [x] **Security**: Login as Faculty, verify you CANNOT edit Student's title (No pencil icon).
6.  [x] **Cancel**: Student deletes booking -> Removed from both dashboards.
