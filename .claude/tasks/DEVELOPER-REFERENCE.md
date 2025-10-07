# Developer Reference: Backend Infrastructure Setup

**Audience:** Production Backend Developers (Future)
**Purpose:** Reference guide for building production system
**Timeline:** 18-22 weeks (complete production build)
**Status:** Reference Documentation Only

---

## 🎯 IMPORTANT: This is Reference Documentation

**This guide is for PRODUCTION DEVELOPERS who will build the real system.**

### Current Project (UI/UX Prototype):
- ❌ **DO NOT** implement this checklist now
- ✅ We're building prototype with localStorage (see IMPLEMENTATION-STATUS.md)
- ✅ This document is reference for future production build

### Future Production Build:
- ✅ Backend developers will follow this guide
- ✅ Implement real database, authentication, email services
- ✅ Build on top of our prototype UI/UX

---

# Phase 0: Backend Infrastructure Setup Checklist

**Timeline:** Weeks 1-3 (of production build)
**Status:** Reference for Future Implementation
**Priority:** CRITICAL for production - Must complete before feature development

---

## Week 1: Database & Authentication Setup

### 0.1 Database Configuration (Days 1-3)

**Decision: Choose Your Database**
- [ ] **Option A: Supabase** (Recommended - faster setup)
  - [ ] Create account at [supabase.com](https://supabase.com)
  - [ ] Create new project
  - [ ] Copy Project URL
  - [ ] Copy anon/public key
  - [ ] Copy service role key (keep secret!)

- [ ] **Option B: Prisma + PostgreSQL** (More control - longer setup)
  - [ ] Set up PostgreSQL database
  - [ ] Install Prisma: `npm install prisma @prisma/client`
  - [ ] Initialize Prisma: `npx prisma init`
  - [ ] Configure database connection string

**For Supabase (if chosen):**
```bash
# Install Supabase client
npm install @supabase/supabase-js

# Create/update .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Replace Mock Client:**
- [ ] Open `lib/supabase.ts`
- [ ] Delete current mock implementation
- [ ] Add real Supabase client:
```typescript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

**Test Connection:**
- [ ] Create test file: `lib/__tests__/supabase.test.ts`
- [ ] Run simple query to verify connection
- [ ] Confirm no errors in console

---

### 0.2 Authentication System (Days 4-7)

**Install Dependencies:**
```bash
# Already installed if using Supabase
# Or install next-auth if using alternative
npm install next-auth # (if not using Supabase Auth)
```

**Create Auth Helper Functions:**
- [ ] Create file: `lib/auth/supabase-auth.ts`
- [ ] Implement functions:
  - [ ] `signUp(email, password, metadata)`
  - [ ] `signIn(email, password)`
  - [ ] `signOut()`
  - [ ] `getSession()`
  - [ ] `requireAuth(request)` (middleware)

**Update Partner Login Page:**
- [ ] Open `app/partner/login/page.tsx`
- [ ] Import real auth functions
- [ ] Replace localStorage logic with actual auth
- [ ] Test login flow
- [ ] Handle error states (wrong password, etc.)

**Update Partner Registration:**
- [ ] Open `app/partner/onboarding-improved/page.tsx`
- [ ] Call `signUp()` on form submission
- [ ] Create user record in `partner_users` table
- [ ] Redirect to dashboard after successful registration

**Create Auth Middleware:**
- [ ] Create file: `middleware.ts` (root of project)
- [ ] Add route protection for `/partner/*` routes
- [ ] Redirect unauthenticated users to `/partner/login`
- [ ] Test protected routes

**Create Users Table in Database:**
```sql
-- In Supabase SQL Editor or Prisma schema
CREATE TABLE partner_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID REFERENCES partners(id),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Testing Checklist:**
- [ ] Can create new account
- [ ] Can log in with correct credentials
- [ ] Cannot log in with wrong credentials
- [ ] Session persists across page refreshes
- [ ] Can log out successfully
- [ ] Protected routes redirect to login when not authenticated

---

## Week 2: Email & API Routes

### 0.3 Email Service Integration (Days 1-3)

**Choose Email Service:**
- [ ] **Resend** (Recommended)
  - [ ] Sign up at [resend.com](https://resend.com)
  - [ ] Verify domain (for production)
  - [ ] Get API key
  - [ ] Free tier: 3,000 emails/month

**Install Dependencies:**
```bash
npm install resend @react-email/components react-email
```

**Configure Environment:**
```bash
# Add to .env.local
RESEND_API_KEY=re_your_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Create Email Client:**
- [ ] Create file: `lib/email/resend-client.ts`
- [ ] Implement `sendEmail()` function
- [ ] Add error handling

**Create Email Templates:**
- [ ] Create folder: `lib/email/templates/`
- [ ] Create `invitation-email.tsx` (React Email component)
- [ ] Create `welcome-email.tsx`
- [ ] Create `password-reset-email.tsx`
- [ ] Preview emails: `npm run email:dev` (add to package.json)

**Create Email Sending API Route:**
- [ ] Create file: `app/api/send-invitation/route.ts`
- [ ] Validate request (check auth)
- [ ] Call `sendEmail()` function
- [ ] Return success/error response

**Test Email Delivery:**
- [ ] Send test email to your own address
- [ ] Check spam folder if not received
- [ ] Verify link in email works
- [ ] Test with multiple email providers (Gmail, Outlook, etc.)

---

### 0.4 API Routes & Server Actions (Days 4-7)

**Create API Routes Structure:**
```
app/api/
├── auth/
│   ├── login/route.ts
│   ├── signup/route.ts
│   └── logout/route.ts
├── programs/
│   ├── create/route.ts
│   ├── [id]/route.ts
│   └── list/route.ts
├── invitations/
│   ├── create/route.ts
│   └── accept/[token]/route.ts
└── send-invitation/route.ts
```

**Implement Core API Routes:**
- [ ] `POST /api/programs/create` - Create new program
- [ ] `GET /api/programs/list` - List user's programs
- [ ] `GET /api/programs/[id]` - Get program details
- [ ] `PUT /api/programs/[id]` - Update program
- [ ] `DELETE /api/programs/[id]` - Delete program
- [ ] `POST /api/invitations/create` - Create invitation
- [ ] `POST /api/invitations/accept/[token]` - Accept invitation

**Add Request Validation:**
- [ ] Create Zod schemas in `lib/schemas/`
- [ ] Validate all incoming requests
- [ ] Return validation errors with 400 status

**Add Error Handling:**
- [ ] Create error handler utility
- [ ] Log errors to console (or monitoring service)
- [ ] Return user-friendly error messages
- [ ] Don't expose sensitive information in errors

**Add Rate Limiting (Optional but recommended):**
```bash
npm install @upstash/ratelimit @upstash/redis
```
- [ ] Set up Upstash Redis (free tier)
- [ ] Add rate limiting middleware
- [ ] Configure limits per route

**Testing Checklist:**
- [ ] Test each API route with Postman/Insomnia
- [ ] Test authentication (try accessing without auth)
- [ ] Test validation (send invalid data)
- [ ] Test error handling (trigger errors intentionally)

---

## Week 3: Migration & Testing

### 0.5 Convert Mock APIs to Real Database (Days 1-5)

**Review Existing Mock APIs:**
- [ ] Read `lib/api/schools.ts` (currently uses sessionStorage)
- [ ] Read `lib/api/organizations.ts` (currently uses sessionStorage)
- [ ] List all database operations they perform

**Create Database Tables:**

For each table the mock APIs reference, create in Supabase:

```sql
-- Example: schools table
CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  school_type TEXT,
  contact_email TEXT,
  address JSONB,
  grade_range JSONB,
  languages TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add similar tables for:
-- - organizations
-- - teachers
-- - collaborations
-- - invitations
-- (See mock APIs for full structure)
```

**Update Mock APIs:**
- [ ] `lib/api/schools.ts` - verify queries work with real DB
- [ ] `lib/api/organizations.ts` - verify queries work with real DB
- [ ] Test each method (create, read, update, delete)

**Remove Mock Infrastructure:**
- [ ] Delete `lib/session-storage.ts` (no longer needed)
- [ ] Search for `localStorage` usage, replace with DB calls
- [ ] Search for `sessionStorage` usage, replace with DB calls
- [ ] Update imports throughout codebase

**Update School Invitation Flow:**
- [ ] Open `app/partner/schools/invite/page.tsx`
- [ ] Find line ~110: `localStorage.setItem('sentInvitations'...)`
- [ ] Replace with API call to create invitation in database
- [ ] Call email sending API route
- [ ] Update success message

**Migration Testing Checklist:**
- [ ] Create a school via API - verify it persists
- [ ] Refresh page - data still there ✅
- [ ] Close browser - data still there ✅
- [ ] Log in from different browser - data accessible ✅
- [ ] Send invitation - email actually received ✅
- [ ] Accept invitation - user properly linked ✅

---

### Final Phase 0 Validation (Days 6-7)

**End-to-End Testing:**
- [ ] **User Registration Flow**
  - [ ] Partner can sign up
  - [ ] Receives welcome email
  - [ ] Can log in
  - [ ] Session persists

- [ ] **Program Creation Flow**
  - [ ] Partner can create program
  - [ ] Program saved to database
  - [ ] Program visible after refresh
  - [ ] Program visible after logout/login

- [ ] **Invitation Flow**
  - [ ] Partner can send school invitation
  - [ ] Email delivered to recipient
  - [ ] Recipient can click link
  - [ ] Recipient can complete signup
  - [ ] Invitation marked as accepted
  - [ ] School linked to partner

**Performance Testing:**
- [ ] Database queries under 500ms
- [ ] Page load times acceptable
- [ ] No console errors
- [ ] No React warnings

**Security Audit:**
- [ ] API routes require authentication
- [ ] Database has Row Level Security (RLS) policies
- [ ] Sensitive data not exposed in client
- [ ] CORS configured correctly
- [ ] Rate limiting in place

**Documentation:**
- [ ] Update README with setup instructions
- [ ] Document environment variables
- [ ] Document database schema
- [ ] Document API routes

---

## Phase 0 Completion Criteria ✅

You can proceed to Phase 1 ONLY when ALL of the following are TRUE:

- [ ] ✅ Real database connected (Supabase or alternative)
- [ ] ✅ Users can sign up and log in (authentication works)
- [ ] ✅ Protected routes redirect to login
- [ ] ✅ Data persists across browser sessions
- [ ] ✅ Invitations send real emails
- [ ] ✅ API routes secured with authentication
- [ ] ✅ Mock APIs replaced with real database operations
- [ ] ✅ No `localStorage` or `sessionStorage` for critical data
- [ ] ✅ End-to-end test passes (signup → create program → send invitation)
- [ ] ✅ No console errors or React warnings

**When complete, update:**
`.claude/tasks/partner-program-implementation-plan.md` - Mark Phase 0 as ✅ COMPLETE

---

## Quick Commands Reference

```bash
# Install all dependencies at once
npm install @supabase/supabase-js resend @react-email/components react-email

# Environment variables template (.env.local)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Run development server
npm run dev

# Test database connection (create this script)
npm run test:db

# Preview email templates
npm run email:dev

# Run all tests
npm test
```

---

## Need Help?

- **Supabase Docs:** https://supabase.com/docs
- **Resend Docs:** https://resend.com/docs
- **React Email Docs:** https://react.email
- **Next.js Auth:** https://nextjs.org/docs/authentication

---

**Last Updated:** October 7, 2025
**Next Checkpoint:** Week 1 Review (Day 7)
