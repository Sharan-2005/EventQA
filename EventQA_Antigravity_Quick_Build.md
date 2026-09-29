# EventQA — Quick Build Specification

## Goal

Build a **simple Online Event Registration System** for an STQA capstone.

### Stack

- Frontend: React + Vite + Tailwind CSS
- Backend/Database: Supabase
- Authentication: Supabase Auth
- Hosting: Vercel
- No Node/Express backend
- Keep the project simple and test-friendly
- Target: working MVP in ~2 hours

---

# 1. Core Features

Build only these features.

## Public

### Home `/`
- EventQA logo/name
- Short tagline
- Browse Events button
- Login button
- Register button
- 3 featured events

### Events `/events`
- List events as cards
- Search by event name
- Filter by category
- View Details button

### Event Details `/events/:id`
Show:
- Event name
- Description
- Category
- Date
- Time
- Venue
- Organizer
- Capacity
- Available seats
- Register Now button

---

# 2. Authentication

## Register `/register`

Fields:
- Full Name
- Email
- Phone
- Password
- Confirm Password

Validation:
- Required fields
- Valid email
- Phone = 10 digits
- Password >= 6 characters
- Confirm password must match

Use Supabase Auth.

## Login `/login`

Fields:
- Email
- Password

Successful login -> `/dashboard`

Invalid credentials -> clear error message.

## Logout

Logout using Supabase Auth and redirect to `/`.

---

# 3. User Dashboard

## `/dashboard`

Show:
- User name
- Email
- Registered events
- Registration ID
- Event date
- Venue
- Registration status

Buttons:
- View
- Cancel Registration

---

# 4. Event Registration

When user clicks Register Now:

- Require login
- Show registration form
- Pre-fill name/email from logged-in user
- Phone field
- Confirm Registration button

On success:
- Insert registration into Supabase
- Generate registration ID such as `EVT-2026-0001`
- Show success message
- Redirect to registration details/dashboard

Rules:
- User cannot register twice for same event
- Cannot register when event is full

---

# 5. Registration Details

## `/registrations/:id`

Show:
- Registration ID
- Participant name
- Email
- Phone
- Event
- Date
- Time
- Venue
- Status

Add:
- Print Registration button using `window.print()`

---

# 6. Admin

Use a simple `role` field in `profiles`.

Admin route:

`/admin`

Admin can:

- View events
- Add event
- Edit event
- Delete event
- View registrations
- Search registrations

Do NOT build a complicated admin panel.

---

# 7. Database

Create these 3 tables.

## profiles

```sql
id uuid primary key references auth.users(id) on delete cascade
full_name text
email text
phone text
role text default 'user'
created_at timestamptz default now()
```

Roles:
- `user`
- `admin`

## events

```sql
id uuid primary key default gen_random_uuid()
name text not null
description text
category text
event_date date
event_time time
venue text
organizer text
capacity integer
created_at timestamptz default now()
```

## registrations

```sql
id uuid primary key default gen_random_uuid()
registration_id text unique
user_id uuid references profiles(id)
event_id uuid references events(id)
full_name text
email text
phone text
status text default 'confirmed'
registered_at timestamptz default now()
```

Statuses:
- `confirmed`
- `cancelled`

---

# 8. Important Database Rule

Prevent duplicate registrations.

Recommended unique constraint:

```sql
unique(user_id, event_id)
```

Use Supabase Row Level Security.

Basic requirement:

- Users can read their own registrations
- Users can create their own registrations
- Users can update/cancel their own registrations
- Users can read public events
- Admin can manage events and registrations

Never expose the Supabase service-role key in React.

---

# 9. Sample Events

Insert these into Supabase:

### Event 1

```text
Tech Innovation Summit 2026
Category: Technology
Date: 2026-10-15
Time: 10:00
Venue: Mumbai
Organizer: EventQA Team
Capacity: 100
```

### Event 2

```text
Web Development Workshop
Category: Workshop
Date: 2026-10-20
Time: 11:00
Venue: Navi Mumbai
Organizer: EventQA Team
Capacity: 50
```

### Event 3

```text
AI & Machine Learning Seminar
Category: Seminar
Date: 2026-10-25
Time: 14:00
Venue: Mumbai
Organizer: EventQA Team
Capacity: 75
```

---

# 10. React Structure

Use a simple structure:

```text
src/
├── components/
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   ├── EventCard.jsx
│   └── ProtectedRoute.jsx
│
├── pages/
│   ├── Home.jsx
│   ├── Events.jsx
│   ├── EventDetails.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   ├── RegistrationDetails.jsx
│   └── Admin.jsx
│
├── context/
│   └── AuthContext.jsx
│
├── lib/
│   └── supabase.js
│
├── App.jsx
├── main.jsx
└── index.css
```

---

# 11. Required Packages

Install:

```bash
npm install @supabase/supabase-js react-router-dom
```

If Tailwind is not already configured, configure Tailwind using the current Vite-compatible setup.

---

# 12. Environment Variables

Create `.env`:

```env
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Create `.env.example`:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Add `.env` to `.gitignore`.

---

# 13. Supabase Client

Create:

`src/lib/supabase.js`

Use:

```js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
)
```

---

# 14. Test-Friendly IDs

This is important because this is an STQA project.

Add unique `id` and/or `data-testid` attributes.

Use these:

```text
login-email
login-password
login-button

register-name
register-email
register-phone
register-password
register-confirm-password
register-button

event-search
event-filter
event-details-button
event-register-button

confirm-registration-button
cancel-registration-button
logout-button

admin-add-event
admin-edit-event
admin-delete-event
```

Example:

```jsx
<input
  id="login-email"
  data-testid="login-email"
/>
```

---

# 15. Error Messages

Use simple messages:

```text
Please enter your email.
Please enter a valid email address.
Please enter your phone number.
Phone number must contain 10 digits.
Password must be at least 6 characters.
Passwords do not match.
Invalid email or password.
Please login to continue.
This event is full.
You have already registered for this event.
Registration successful.
Registration cancelled successfully.
Event created successfully.
Event updated successfully.
Event deleted successfully.
Something went wrong. Please try again.
```

Do not show raw Supabase/database errors to users.

---

# 16. UI

Keep it very simple.

Style:

- White/light background
- Blue primary buttons
- Dark text
- Cards
- Rounded corners
- Simple navbar
- Responsive
- Minimal animations

Do not waste time on advanced design.

The goal is a functional testing application.

---

# 17. Important STQA Test Scenarios

Make sure the application supports testing of:

### Registration

1. Valid registration
2. Empty fields
3. Invalid email
4. Invalid phone
5. Password too short
6. Password mismatch
7. Duplicate email

### Login

8. Valid login
9. Invalid password
10. Invalid email
11. Empty fields
12. Logout

### Events

13. View events
14. Search event
15. Filter event
16. View event details
17. Register for event
18. Register for full event
19. Duplicate event registration

### Registration

20. Successful registration
21. View registration
22. Cancel registration
23. Print registration

### Admin

24. Add event
25. Edit event
26. Delete event
27. View registrations
28. Search registrations

These are enough to create your STQA test cases.

---

# 18. Suggested Test Case Format

Use this later in the report:

| ID | Module | Scenario | Input | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|
| TC01 | Login | Valid login | Valid credentials | Login successful | Login successful | Pass |
| TC02 | Login | Invalid password | Wrong password | Error message | Error displayed | Pass |
| TC03 | Registration | Empty email | Blank email | Validation error | Validation shown | Pass |
| TC04 | Events | Search event | AI | Matching event shown | Matching event shown | Pass |
| TC05 | Registration | Valid event registration | Valid data | Registration successful | Registration successful | Pass |

---

# 19. Suggested Defects to Look For During Testing

Do NOT intentionally add bugs.

Build the application normally and document bugs that are actually discovered.

Possible areas to test:

- Incorrect validation
- Duplicate registration
- Full-event registration
- Incorrect available-seat count
- Broken navigation
- Authentication issues
- UI alignment
- Mobile responsiveness
- Incorrect error messages
- Admin authorization
- Database/RLS issues

---

# 20. Vercel

The project must work with:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Preview:

```bash
npm run preview
```

For Vercel:

1. Push project to GitHub
2. Import repository into Vercel
3. Add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy

Make sure React Router works correctly after deployment.

---

# 21. README

Create a README with:

- Project title
- Description
- Features
- Tech stack
- Installation
- Environment variables
- Supabase setup
- Running locally
- Build command
- Vercel deployment

---

# 22. 2-Hour Priority

If time is limited, implement in this order:

## Priority 1 — MUST WORK

1. Supabase connection
2. Database tables
3. Sample events
4. Home page
5. Events page
6. Event details
7. Register
8. Login
9. Logout
10. Event registration
11. Dashboard

## Priority 2

12. Cancel registration
13. Registration details
14. Admin event management

## Priority 3

15. Search
16. Filters
17. Responsive polishing
18. Extra UI improvements

Do NOT spend time on:

- Payment
- OTP
- Email notifications
- Complex animations
- AI
- Advanced analytics
- Complex backend
- Real-time notifications

---

# 23. Final Development Instruction

Build the application now as a **working MVP**, not a tutorial.

Do not stop after creating placeholders.

Implement the actual:

- React pages
- React Router
- Supabase connection
- Supabase Auth
- Database queries
- Registration flow
- Validation
- Protected routes
- Admin role
- Event CRUD
- Responsive UI
- Test IDs

After implementation, run:

```bash
npm install
npm run build
```

Fix all build errors.

Then run:

```bash
npm run dev
```

Verify the complete flow:

```text
Home
 ↓
Events
 ↓
Event Details
 ↓
Register/Login
 ↓
Register for Event
 ↓
Dashboard
 ↓
View Registration
 ↓
Cancel Registration
```

The final project should be small, clean, functional, testable, and ready for GitHub + Vercel.
