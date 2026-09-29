# EventQA — Online Event Registration System

EventQA is an online event registration and management web application built for Software Testing and Quality Assurance (STQA) capstone demonstrations. It features live capacity tracking, Supabase authentication, role-based access control, ticket generation with print preview, and test-friendly HTML identifiers for automated testing suites (Selenium, Cypress, Playwright).

---

## Features

### Public Features
- **Landing Page (`/`)**: Hero banner, quick navigation, and 3 featured events.
- **Events Directory (`/events`)**: Grid of upcoming events with real-time seat availability, live search by event name, and category filter.
- **Event Details (`/events/:id`)**: Comprehensive event overview (organizer, venue, date/time, total capacity, remaining seats) and instant modal registration.

### Authentication
- **User Registration (`/register`)**: Full name, email format validation, 10-digit phone validation, password strength (>=6 chars), and password confirmation match.
- **User Login (`/login`)**: Email and password authentication with clear error alerts.
- **Session Management**: Persistent Supabase Auth session with secure logout (`/`).

### Participant Features
- **User Dashboard (`/dashboard`)**: Overview of user profile and registered events list with status badges (`confirmed` / `cancelled`).
- **Registration Cancellation**: One-click cancellation with immediate seat capacity restoration.
- **Registration Details (`/registrations/:id`)**: Official event entry pass with unique reference code (`EVT-2026-XXXX`) and one-click browser print ticket (`window.print()`).

### Administration
- **Admin Console (`/admin`)**: Protected role-based dashboard for administrators.
- **Event Management**: Create new events, update details/capacities, and delete events.
- **Attendee Review**: Search and filter all registered participants across all events.

### STQA Test-Friendly Architecture
- Standardized element IDs and `data-testid` attributes on all inputs, search boxes, and actionable buttons.
- Consistent user feedback messages (no raw database errors leaked to the UI).

---

## Tech Stack

- **Frontend**: React 18, Vite, React Router v6, Tailwind CSS v4, Lucide React icons
- **Backend / Database**: Supabase (PostgreSQL 15+)
- **Authentication**: Supabase Auth (Email & Password)
- **Deployment Target**: Vercel

---

## Getting Started

### 1. Prerequisites
- Node.js (v18.x or v20.x+)
- npm (v9.x or v10.x+)
- A Supabase project

### 2. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory:
```env
# Supabase API Configuration
VITE_SUPABASE_URL=https://pjvsocwqqqscngqnsyww.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

# Optional: Direct PostgreSQL connection for automated DB setup script
DATABASE_URL=postgresql://postgres.pjvsocwqqqscngqnsyww:[YOUR-PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres
```

An `.env.example` file is included in the project for reference.

---

## Supabase Database Setup

### Option A: Using the Supabase Web Dashboard (Recommended)
1. Open your Supabase project dashboard at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** tab from the left sidebar.
3. Open `supabase_schema.sql` from this repository, copy its entire contents, and paste them into the SQL Editor.
4. Click **Run**. This will:
   - Create `profiles`, `events`, and `registrations` tables.
   - Configure Row Level Security (RLS) policies and triggers.
   - Seed the 3 default sample events:
     1. *Tech Innovation Summit 2026* (Mumbai)
     2. *Web Development Workshop* (Navi Mumbai)
     3. *AI & Machine Learning Seminar* (Mumbai)

### Option B: Automated Script
If you replace `[YOUR-PASSWORD]` in your `.env` file with your database password:
```bash
npm run db:setup
```

---

## Running Locally

To start the development server:
```bash
npm run dev
```

The application will be accessible at:
```
http://localhost:5173
```

---

## Build for Production

To create an optimized production build:
```bash
npm run build
```

To preview the built production bundle locally:
```bash
npm run preview
```

---

## Vercel Deployment

1. Push your repository to GitHub.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL` = `https://pjvsocwqqqscngqnsyww.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = *your Supabase anon key*
5. Click **Deploy**.

> Note: The included `vercel.json` ensures client-side routing works seamlessly on reload.

---

## STQA Test Scenarios & IDs

| Module | Test Element ID | Selector / Attribute |
|---|---|---|
| Login Email | `login-email` | `data-testid="login-email"` |
| Login Password | `login-password` | `data-testid="login-password"` |
| Login Button | `login-button` | `data-testid="login-button"` |
| Register Name | `register-name` | `data-testid="register-name"` |
| Register Email | `register-email` | `data-testid="register-email"` |
| Register Phone | `register-phone` | `data-testid="register-phone"` |
| Register Password | `register-password` | `data-testid="register-password"` |
| Register Confirm Password | `register-confirm-password` | `data-testid="register-confirm-password"` |
| Register Button | `register-button` | `data-testid="register-button"` |
| Event Search | `event-search` | `data-testid="event-search"` |
| Event Filter | `event-filter` | `data-testid="event-filter"` |
| View Event Details | `event-details-button` | `data-testid="event-details-button"` |
| Register Event CTA | `event-register-button` | `data-testid="event-register-button"` |
| Confirm Registration | `confirm-registration-button` | `data-testid="confirm-registration-button"` |
| Cancel Registration | `cancel-registration-button` | `data-testid="cancel-registration-button"` |
| Logout Button | `logout-button` | `data-testid="logout-button"` |
| Admin Add Event | `admin-add-event` | `data-testid="admin-add-event"` |
| Admin Edit Event | `admin-edit-event` | `data-testid="admin-edit-event"` |
| Admin Delete Event | `admin-delete-event` | `data-testid="admin-delete-event"` |
| Print Ticket | `print-registration-button` | `data-testid="print-registration-button"` |
