# Ticketing System

A full-stack internal ticketing and communication platform built for branch operations. It handles ticket submissions, multi-role approvals, real-time messaging, notifications, announcements, and reporting — all in one system.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS v4 |
| Backend | Laravel 12, PHP 8.2 |
| Real-time | Laravel Reverb (WebSockets) + Laravel Echo + Pusher JS |
| Auth | Laravel Sanctum (cookie-based SPA auth) |
| Queue | Redis via Predis |
| UI Components | Radix UI, shadcn/ui |
| Containerization | Docker + Nginx |

---

## Project Structure

```
ticketing-sys/
├── client/          # Next.js frontend
└── server/          # Laravel backend
```

---

## Features

### Ticketing
- Submit, edit, revise, approve, and reject tickets
- Ticket categories with group codes and sub-categories
- File attachments with ZIP download support
- Ticket status tracking: `PENDING`, `EDITED`, `REJECTED`
- Audit dashboard with counted/not-counted marking
- Transfer tickets to automation workflow
- Notes editing per ticket

### Role-Based Access Control
The system has 11 distinct roles, each with scoped permissions:

| Role | Description |
|---|---|
| `Admin` | Full system access |
| `Automation Admin` | Manages automation workflows |
| `Automation Manager` | Oversees automation branches |
| `Automation` | Handles automation ticket processing |
| `Accounting Head` | Manages accounting categories and branches |
| `Accounting Staff` | Accounting operations |
| `Branch Head` | Manages branch-level tickets |
| `Staff` | Submits tickets |
| `CAS` | CAS-specific branch operations |
| `Area Manager` | Oversees multiple branches |
| `Audit` | Read-only audit access |

### Real-Time Features
- **Live chat** — private 1-on-1 messaging via WebSockets (`ChatEvent` broadcast on `chats.{user_id}`)
- **Notifications** — real-time push notifications via `UserUpdatedNotification`
- **Unread message badge** — global unread count tracked in `ChatContext`
- **Scroll-to-bottom button** — appears when scrolled 500px+ up in a conversation

### Messaging
- Paginated message history (50 per page, `simplePaginate`)
- Conversations sorted by latest activity
- Unread message records tracked per sender
- Auto-focus textarea after sending
- `Enter` to send, `Shift+Enter` for new line

### Announcements & Social
- Posts with comments and likes
- Like/unlike toggle

### Reports & Exports
- Ticket reports with filter support
- Export to Excel (XLSX via `xlsx` library)
- Automation dashboard data

### User Management
- Register, login, logout
- OTP-based login via email code
- Profile update with picture upload
- Password reset
- Bulk password reset utility (admin-only, key-protected)

---

## Architecture

### Frontend (`/client`)

```
src/
├── app/
│   └── (views)/         # All page routes (tickets, chats, users, reports, etc.)
├── components/          # Reusable UI components
├── context/
│   ├── auth-context      # Auth state, profile, notifications
│   ├── chat-context      # WebSocket chat listener, unread tracking
│   ├── settings-context  # App settings
│   └── is-refresh-context
├── hooks/
│   ├── use-fetch         # Generic paginated fetch
│   ├── use-fetch-cursor  # Cursor-based pagination
│   └── use-simple        # Simple data fetch with pagination
├── lib/
│   ├── api.ts            # Axios instance
│   ├── echo.ts           # Laravel Echo + Pusher client setup
│   ├── sanctum.ts        # Auth helpers (login, logout, profile)
│   └── hoc/
│       └── with-auth-page  # Route guard HOC
├── constants/            # Roles, ticket statuses, sidebar items, etc.
├── types/                # TypeScript type definitions
└── utils/                # Date formatters, storage helpers, etc.
```

### Backend (`/server`)

```
app/
├── Http/Controllers/Api/   # All API controllers
├── Services/               # Business logic layer
│   ├── ChatService          # Conversations + messages
│   ├── TicketService        # Ticket CRUD + workflows
│   ├── LoginService         # Auth
│   ├── ManageUserService    # User management
│   └── ReportsService       # Report generation
├── Events/
│   ├── ChatEvent            # Broadcast new messages
│   └── DeleteTicketEvent    # Broadcast ticket deletions
├── Models/                 # Eloquent models
├── Enums/
│   ├── UserRoles            # All 11 role definitions
│   └── TicketStatus         # PENDING, EDITED, REJECTED
└── Notifications/
    ├── TicketNotification
    └── UserUpdatedNotification
```

### API Routes Overview

All authenticated routes are protected by `auth:sanctum` with a `throttle:100,1` rate limit. Guest routes use `throttle:20,1`.

| Resource | Endpoints |
|---|---|
| Auth | `POST /login`, `POST /logout`, `POST /register`, `POST /send-login-code`, `POST /submit-otp-login` |
| Profile | `GET /profile`, `POST /profile/update`, `POST /password-reset` |
| Tickets | Full CRUD + approve, revise, mark-as-edited, return-to-automation, transfer, download-zip |
| Chats | `GET /chats`, `GET /chats/{id}`, `POST /chats` |
| Users | Full CRUD + branch heads |
| Categories | Full CRUD + show/hide toggle + sub-categories |
| Branches | Full CRUD + top branches + all branch categories |
| Notifications | Mark as read, mark all as read |
| Posts | Full CRUD |
| Comments | Full CRUD per post |
| Reports | `GET /reports`, `POST /export-reports` |
| Suppliers | Full CRUD (admin) |
| Roles | Full CRUD (admin) |

---

## Getting Started

### Prerequisites

- Node.js 20+, pnpm
- PHP 8.2+, Composer
- MySQL
- Redis
- Docker (for production)

---

### Development Setup

#### 1. Clone the repository

```bash
git clone https://github.com/allanjustine/Ticketing-Sys
cd Ticketing-Sys
```

#### 2. Backend setup

```bash
cd server
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
```

Configure your `.env`:

```env
APP_URL=http://localhost:4001
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ticketing_netsuite_v2
DB_USERNAME=root
DB_PASSWORD=

REVERB_APP_ID=your-app-id
REVERB_APP_KEY=your-app-key
REVERB_APP_SECRET=your-app-secret
REVERB_HOST=localhost
REVERB_PORT=8084

QUEUE_CONNECTION=redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=your-smtp-host
MAIL_PORT=587
MAIL_USERNAME=your-email
MAIL_PASSWORD=your-password
```

Run all services concurrently:

```bash
composer run dev
```

This starts:
- `php artisan serve --port=4001`
- `php artisan reverb:start`
- `php artisan queue:listen --tries=1`

#### 3. Frontend setup

```bash
cd client
pnpm install
cp .env.local.example .env.local  # or create manually
```

Configure your `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4001
NEXT_PUBLIC_REVERB_APP_KEY=your-app-key
NEXT_PUBLIC_REVERB_HOST=localhost
NEXT_PUBLIC_REVERB_PORT=8084
```

Start the dev server:

```bash
pnpm dev
```

Frontend runs at `http://localhost:3000`.

---

### Docker (Production)

#### Backend

```bash
cd server
docker compose up -d
```

Services started:
- `ticketing-server` — Laravel app (FrankenPHP)
- `ticketing-server-nginx` — Nginx reverse proxy on port `7040`
- `ticketing-server-reverb` — Reverb WebSocket server on port `8084`
- `ticketing-v2-queue-worker` — Redis queue worker

#### Frontend

```bash
cd client
docker compose up -d
```

Runs on port `7030`.

---

## Database

Migrations are located in `server/database/migrations/`. Key tables:

| Table | Purpose |
|---|---|
| `user_logins` | Auth credentials |
| `user_details` | Profile info |
| `user_roles` | Role definitions |
| `tickets` | Ticket records |
| `ticket_details` | Ticket metadata + attachments |
| `ticket_categories` | Category definitions |
| `sub_categories` | Sub-category items |
| `group_categories` | Category groupings |
| `messages` | Chat messages |
| `posts` / `comments` / `likes` | Announcements feed |
| `notifications` | Laravel notifications |
| `branch_lists` | Branch registry |
| `assigned_branches` | Branch-user assignments |
| `assigned_categories` | Category-user assignments |
| `login_codes` | OTP login codes |

SQL dumps are available in `server/dbs/` for initial seeding.

---

## Real-Time Flow

```
User sends message
      │
      ▼
POST /chats  →  ChatService::sendMessage()
      │
      ▼
ChatEvent::broadcast()  →  PrivateChannel("chats.{receiver_id}")
      │
      ▼
Laravel Reverb (WebSocket server)
      │
      ▼
Laravel Echo (client)  →  ChatContext listens on "chats.{user_id}"
      │
      ▼
setNewMessage()  →  ChatsPage renders new message instantly
```

---

## Key Conventions

- All API responses follow `{ message, data }` structure
- Authenticated routes use Sanctum cookie-based auth (SPA mode)
- Frontend uses a `withAuthPage` HOC to guard all protected routes
- Messages list uses `flex-col-reverse` so newest messages appear at the bottom without manual scroll manipulation
- `useSimple` hook handles paginated API calls with a `next_page_url` cursor
- Business logic is fully extracted into `Services/` — controllers are thin

---

## License

Internal use only...
