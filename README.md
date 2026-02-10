# Helpdesk Pro

A professional, B2B multi-tenant Helpdesk and Knowledge Base system.

## Stack
- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend:** Supabase (Auth, Postgres, RLS)
- **Architecture:** Multi-tenant (Organizations)

## Core Features
- **Multi-tenant:** Data isolation between organizations via RLS.
- **Support Tickets:** Full CRUD with status, priority, and thread support.
- **Knowledge Base:** Public and private articles.
- **Audit Logging:** Track important actions in the system.
- **RBAC:** Role-based access control (Owner, Admin, Agent, Viewer).

## Getting Started

### 1. Database Setup
Run the SQL from `supabase/migrations/001_init.sql` in your Supabase SQL Editor.

### 2. Environment Variables
Create a `.env.local` file in the root:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Install & Run
```bash
npm install
npm run dev
```

## Security Design
- **RLS Enforced:** Every table has Row Level Security enabled.
- **Helper Functions:** `is_org_member` and `has_org_role` handle complex organizational permissions in the database.
- **Auth Trigger:** Users are automatically linked to their profile metadata.
