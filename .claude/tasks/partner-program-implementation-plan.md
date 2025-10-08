# Class2Class Partner Platform Implementation Plan
## Comprehensive Technical Roadmap for Partner & Program Management

**Document Version:** 1.0
**Created:** October 7, 2025
**Status:** Ready for Review
**Estimated Timeline:** 12-16 weeks (3 phases)

> **Prototype Team Reminder:** This document is a production-system reference. Keep using the localStorage-based architecture for the prototype; only mirror the data structures needed for UX flows and leave backend implementation to the future engineering team.

---

## Executive Summary

This implementation plan details the technical approach to build a multi-layered partner management platform for Class2Class, enabling NGOs, governments, and educational organizations to create programs, invite stakeholders (coordinators, institutions, teachers), and track impact across a hierarchical collaboration network.

**Key Capabilities to Deliver:**
- Partner organization accounts with multi-user support
- Program creation with pedagogical frameworks (COIL, PBL, ESD, Design Thinking)
- Country coordinator management and permissions
- Educational institution onboarding
- Multi-level dashboards (program → country → institution → project)
- Role-based access control (RBAC) system
- Invitation workflows with email integration

---

## Current Architecture Analysis

### Existing Infrastructure

**Tech Stack:**
- **Frontend:** Next.js 15.3 (App Router), React 18.3, TypeScript 5
- **UI Framework:** Tailwind CSS 4, Shadcn/ui components, Radix UI
- **Form Management:** React Hook Form with Zod validation
- **Data Layer:** Supabase (inferred from `lib/api/schools.ts`)
- **State Management:** React Context API (`contexts/partner-form-context.tsx`)

**Current Features:**
1. ✅ Partner onboarding flow (`/partner/onboarding-improved`)
2. ✅ School invitation system (`/partner/schools/invite`)
3. ✅ Basic school onboarding (`/school/onboarding`)
4. ✅ Partner type definitions (`lib/types/partner.ts`)
5. ✅ School API layer with Supabase integration (`lib/api/schools.ts`)

**Architecture Strengths:**
- Clean component architecture with separated concerns
- Type-safe data models already defined
- Reusable UI component library
- Established design system (Purple theme #8157D9)
- Multi-step form patterns already implemented

**Gaps to Address:**
- ❌ No program entity/data model
- ❌ No coordinator role implementation
- ❌ No multi-level dashboard system
- ❌ Limited RBAC implementation
- ❌ No invitation token system
- ❌ No program-project linking
- ❌ Missing co-partner collaboration workflows

---

## Phase 1: Foundation & Core Entities (Weeks 1-5)

**Goal:** Establish data models, authentication, and basic program creation

### 1.1 Database Schema Design

**New Tables Required:**

```typescript
// programs table
interface Program {
  id: string                          // UUID
  partner_id: string                  // FK to partners
  display_title: string               // Marketing-ready title e.g. "Save the Children x LEGO: Build the Change"
  name: string
  marketing_tagline?: string          // Optional hero copy for Discover cards
  description: text
  logo_url?: string
  supporting_partner_id?: string      // Optional single co-host or sponsor partner FK
  supporting_partner_role?: string    // 'co_host' | 'sponsor' (prototype keeps it simple with at most one)

  // Learning Framework
  project_types: string[]             // ['explore_cultures', 'explore_challenges', 'create_solutions']
  pedagogical_framework: string       // 'coil' | 'pbl' | 'design_thinking' | '5e' | 'esd'
  learning_goals: text
  target_age_ranges: string[]         // ['5-7', '8-10', '11-13', '14-16', '17-18']

  // Scope & Impact
  countries_in_scope: string[]        // ['DK', 'US', 'KE', ...]
  sdg_focus: number[]                 // [4, 10, 13] (SDG numbers)
  children_rights_focus?: string[]
  languages_supported: string[]       // ['en', 'da', 'es']

  // Timeline
  start_date: date
  end_date: date
  status: string                      // 'planning' | 'active' | 'completed' | 'archived'

  // Success Metrics
  success_metrics: jsonb              // {type: 'pre_post_surveys', target: '80% completion', ...}
  evaluation_methods: string[]        // ['surveys', 'rubrics', 'case_studies']
  evaluation_cadence: string          // 'monthly' | 'quarterly' | 'midpoint_endpoint' | 'endpoint_only'

  // Safety & Participation
  student_participation_mode: jsonb   // {under_13: 'on_platform', over_13: 'on_platform'}

  // Metadata
  created_at: timestamp
  updated_at: timestamp
  created_by: string                  // FK to partner_users
  is_active: boolean
}

// program_partners (co-partner relationships)
interface ProgramPartner {
  id: string
  program_id: string                  // FK to programs
  partner_id: string                  // FK to partners
  role: string                        // 'host' | 'co_host' | 'sponsor' | 'advisor'
  invited_by: string                  // FK to partner_users
  invited_at: timestamp
  joined_at?: timestamp
  status: string                      // 'invited' | 'joined' | 'declined' | 'removed'
  permissions: jsonb                  // {can_edit: true, can_invite_coordinators: true, ...}
  created_at: timestamp
}

// country_coordinators
interface CountryCoordinator {
  id: string
  program_id: string                  // FK to programs
  user_id: string                     // FK to users (teacher account type)
  country_code: string                // ISO 3166-1 alpha-2 (e.g., 'DK', 'KE')

  // Coordinator Profile
  full_name: string
  email: string
  phone?: string
  organization_affiliation?: string
  profile_photo_url?: string

  // Status & Permissions
  status: string                      // 'invited' | 'active' | 'inactive'
  invited_by: string                  // FK to partner_users or program_partners
  invited_at: timestamp
  accepted_at?: timestamp
  last_active_at?: timestamp

  // Permissions (inline or FK to permission groups)
  can_invite_institutions: boolean    // default: true
  can_invite_teachers: boolean        // default: true
  can_create_projects: boolean        // default: true
  can_create_project_ideas: boolean   // default: true
  can_view_analytics: boolean         // default: true
  can_export_data: boolean            // default: true

  created_at: timestamp
  updated_at: timestamp
  is_active: boolean
}

// educational_institutions (enhances existing schools table)
interface EducationalInstitution {
  id: string
  program_id: string                  // FK to programs
  school_id?: string                  // FK to schools (if already exists)
  coordinator_id: string              // FK to country_coordinators (who invited)

  // Institution Profile
  name: string
  institution_type: string            // 'primary' | 'secondary' | 'k12' | 'university' | 'community_center' | 'library' | 'other'
  country_code: string
  city_region: string
  address?: text
  website?: string
  logo_url?: string
  description?: text

  // Contact Person (Point of Contact)
  contact_name: string
  contact_email: string
  contact_role: string                // 'headmaster' | 'principal' | 'director' | 'coordinator'
  contact_phone?: string

  // Educational Profile
  grades_ages_served: string[]        // ['pre_k', 'k_5', '6_8', '9_12', 'higher_ed']
  primary_language: string
  additional_languages: string[]
  student_count_estimate?: number

  // Status & Invitation
  status: string                      // 'invited' | 'joined' | 'active' | 'completed' | 'withdrawn'
  invited_at: timestamp
  joined_at?: timestamp
  onboarding_completed_at?: timestamp

  // Legal & Compliance
  has_accepted_terms: boolean
  has_accepted_dpa: boolean           // Data Processing Agreement

  created_at: timestamp
  updated_at: timestamp
  is_active: boolean
}

// institution_teachers (links teachers to institutions within programs)
interface InstitutionTeacher {
  id: string
  institution_id: string              // FK to educational_institutions
  teacher_id: string                  // FK to teachers (existing users table)
  program_id: string                  // FK to programs

  invited_by: string                  // FK to educational_institutions.contact_email or coordinator
  invited_at: timestamp
  joined_at?: timestamp
  status: string                      // 'invited' | 'active' | 'inactive'

  role: string                        // 'teacher' | 'coordinator' (within institution)

  created_at: timestamp
  is_active: boolean
}

// invitations (unified invitation system)
interface Invitation {
  id: string
  token: string                       // unique, URL-safe token

  // Invitation Details
  program_id?: string                 // FK to programs (if program-specific)
  inviter_id: string                  // FK to users (who sent the invitation)
  inviter_type: string                // 'partner' | 'coordinator' | 'institution'

  recipient_email: string
  recipient_type: string              // 'partner' | 'coordinator' | 'institution' | 'teacher'
  recipient_name?: string

  // Target Assignment
  target_role: string                 // 'co_partner' | 'country_coordinator' | 'institution_admin' | 'teacher'
  target_scope: string                // 'program' | 'country' | 'institution'
  target_scope_id: string             // ID of program, country_code, or institution

  // Message & Metadata
  custom_message?: text
  metadata: jsonb                     // {country: 'DK', institution_type: 'primary', ...}

  // Status & Tracking
  status: string                      // 'sent' | 'viewed' | 'accepted' | 'declined' | 'expired' | 'revoked'
  sent_at: timestamp
  viewed_at?: timestamp
  responded_at?: timestamp
  expires_at: timestamp               // default: 7 days from sent_at

  created_at: timestamp
  updated_at: timestamp
}

// program_projects (links existing projects to programs)
interface ProgramProject {
  id: string
  program_id: string                  // FK to programs
  project_id: string                  // FK to projects (existing table)
  template_id: string                 // FK to program_project_templates (ties teacher projects back to the template)

  created_by: string                  // 'partner' | 'coordinator' | 'teacher'
  created_by_id: string               // FK to respective user type

  status: string                      // 'draft' | 'active' | 'completed'

  created_at: timestamp
}

// program_project_templates (templates offered by a program)
interface ProgramProjectTemplate {
  id: string
  program_id: string                  // FK to programs
  title: string                       // e.g. "Cities of Change"
  summary: text
  hero_image_url?: string
  estimated_duration_weeks: number
  recommended_start_month?: string
  subject_focus: string[]             // ['civics', 'stem']
  sdg_alignment: number[]             // Mirrors program SDGs but can narrow
  required_materials?: string[]
  language_support: string[]          // Languages available in template assets
  created_at: timestamp
  updated_at: timestamp
  is_active: boolean
}

// partner_users (enhances existing structure)
interface PartnerUser {
  id: string
  partner_id: string                  // FK to partners
  email: string                       // unique
  password_hash: string

  // Profile
  first_name: string
  last_name: string
  role_title: string                  // "Program Manager", "Director", etc.
  phone?: string
  profile_photo_url?: string

  // Role & Permissions
  role: string                        // 'admin' | 'coordinator' | 'collaborator'
  permissions: jsonb                  // role-based permissions object

  // Security
  two_factor_enabled: boolean         // required for partner accounts
  two_factor_secret?: string
  email_verified: boolean
  email_verification_token?: string
  password_reset_token?: string
  password_reset_expires?: timestamp

  // Status
  has_accepted_terms: boolean
  terms_accepted_at?: timestamp
  last_login_at?: timestamp
  is_active: boolean

  created_at: timestamp
  updated_at: timestamp
}
```

#### Program → Template → Teacher Project Alignment

- **Single source of truth:** Partners craft a `Program` with one highlighted supporting partner (co-host or sponsor). The UI composes the hero label (e.g., “Save the Children x LEGO: Build the Change”) from the `display_title`, ensuring branding matches across partner dashboards and Discover.
- **Template library:** Each program maintains a curated set of `ProgramProjectTemplate` records. Templates carry the instructional scaffold and marketing copy teachers see when browsing Discover.
- **Teacher projects:** When a teacher launches the experience, the resulting classroom project keeps pointers to both the owning program and the originating template via `program_projects.template_id`. Metrics (active classrooms, participating schools) roll back up to the program automatically.
- **Shared selectors:** Both the partner Programs tab and the Discover > Programs view should query the same aggregated selector so edits partners make (renaming a template, swapping imagery) propagate instantly to teacher-facing surfaces—no duplicate data shaping.

**Database Migration Strategy:**
1. Create new tables in Supabase (use migrations for version control)
2. Add Row Level Security (RLS) policies for each table
3. Create database functions for common operations (e.g., `get_program_hierarchy`)
4. Set up foreign key constraints and indexes
5. Create views for dashboard aggregations

**Deliverables:**
- [ ] Database schema SQL files
- [ ] Supabase migration scripts
- [ ] RLS policy definitions
- [ ] Database function implementations
- [ ] TypeScript type definitions (update `lib/types/`)

---

### 1.2 Authentication & Authorization System

**Enhanced Auth Requirements:**

**User Role Types:**
1. **Partner Users** (existing structure, enhanced)
   - Admins, Coordinators, Collaborators
   - 2FA mandatory
   - Partner-scoped permissions

2. **Country Coordinators** (new)
   - Program + Country scoped
   - Can be dual-role (teacher + coordinator)
   - Coordinator-specific permissions

3. **Institution Admins** (new)
   - Headmasters/Principals
   - Institution-scoped permissions
   - Can manage teachers within institution

4. **Teachers** (existing, enhanced)
   - Can be linked to multiple institutions
   - Program-specific participation

**RBAC Implementation:**

```typescript
// lib/auth/roles.ts
export const Permissions = {
  // Program Management
  PROGRAM_CREATE: 'program:create',
  PROGRAM_EDIT: 'program:edit',
  PROGRAM_DELETE: 'program:delete',
  PROGRAM_VIEW: 'program:view',

  // Partner Management
  PARTNER_INVITE: 'partner:invite',
  PARTNER_MANAGE: 'partner:manage',

  // Coordinator Management
  COORDINATOR_INVITE: 'coordinator:invite',
  COORDINATOR_MANAGE: 'coordinator:manage',

  // Institution Management
  INSTITUTION_INVITE: 'institution:invite',
  INSTITUTION_VIEW: 'institution:view',
  INSTITUTION_MANAGE: 'institution:manage',

  // Teacher Management
  TEACHER_INVITE: 'teacher:invite',
  TEACHER_MANAGE: 'teacher:manage',

  // Project Management
  PROJECT_CREATE: 'project:create',
  PROJECT_EDIT: 'project:edit',
  PROJECT_DELETE: 'project:delete',
  PROJECT_VIEW: 'project:view',
  PROJECT_IDEA_CREATE: 'project_idea:create',

  // Dashboard & Analytics
  DASHBOARD_VIEW_PROGRAM: 'dashboard:view:program',
  DASHBOARD_VIEW_COUNTRY: 'dashboard:view:country',
  DASHBOARD_VIEW_INSTITUTION: 'dashboard:view:institution',
  DASHBOARD_EXPORT: 'dashboard:export',

  // Data Management
  DATA_EXPORT: 'data:export',
  DATA_DELETE: 'data:delete',
} as const

export type Permission = typeof Permissions[keyof typeof Permissions]

export const RolePermissions: Record<string, Permission[]> = {
  // Partner Roles
  'partner:admin': [
    Permissions.PROGRAM_CREATE,
    Permissions.PROGRAM_EDIT,
    Permissions.PROGRAM_DELETE,
    Permissions.PROGRAM_VIEW,
    Permissions.PARTNER_INVITE,
    Permissions.PARTNER_MANAGE,
    Permissions.COORDINATOR_INVITE,
    Permissions.COORDINATOR_MANAGE,
    Permissions.INSTITUTION_INVITE,
    Permissions.INSTITUTION_VIEW,
    Permissions.PROJECT_CREATE,
    Permissions.PROJECT_EDIT,
    Permissions.PROJECT_VIEW,
    Permissions.PROJECT_IDEA_CREATE,
    Permissions.DASHBOARD_VIEW_PROGRAM,
    Permissions.DASHBOARD_EXPORT,
    Permissions.DATA_EXPORT,
  ],

  'partner:coordinator': [
    Permissions.PROGRAM_VIEW,
    Permissions.COORDINATOR_INVITE,
    Permissions.INSTITUTION_INVITE,
    Permissions.INSTITUTION_VIEW,
    Permissions.PROJECT_CREATE,
    Permissions.PROJECT_EDIT,
    Permissions.PROJECT_VIEW,
    Permissions.DASHBOARD_VIEW_PROGRAM,
  ],

  'partner:collaborator': [
    Permissions.PROGRAM_VIEW,
    Permissions.PROJECT_VIEW,
    Permissions.DASHBOARD_VIEW_PROGRAM,
  ],

  // Co-Partner Roles
  'co_partner:co_host': [
    // Same as partner:admin but scoped to program
    Permissions.PROGRAM_EDIT,
    Permissions.PROGRAM_VIEW,
    Permissions.COORDINATOR_INVITE,
    Permissions.COORDINATOR_MANAGE,
    Permissions.INSTITUTION_INVITE,
    Permissions.PROJECT_CREATE,
    Permissions.PROJECT_EDIT,
    Permissions.PROJECT_VIEW,
    Permissions.DASHBOARD_VIEW_PROGRAM,
    Permissions.DASHBOARD_EXPORT,
  ],

  'co_partner:sponsor': [
    Permissions.PROGRAM_VIEW,
    Permissions.DASHBOARD_VIEW_PROGRAM,
    Permissions.DASHBOARD_EXPORT,
  ],

  'co_partner:advisor': [
    Permissions.PROGRAM_VIEW,
    Permissions.DASHBOARD_VIEW_PROGRAM,
  ],

  // Country Coordinator
  'country_coordinator': [
    Permissions.PROGRAM_VIEW,
    Permissions.INSTITUTION_INVITE,
    Permissions.INSTITUTION_VIEW,
    Permissions.INSTITUTION_MANAGE, // limited to their country
    Permissions.TEACHER_INVITE,
    Permissions.PROJECT_CREATE,
    Permissions.PROJECT_EDIT,
    Permissions.PROJECT_VIEW,
    Permissions.PROJECT_IDEA_CREATE,
    Permissions.DASHBOARD_VIEW_COUNTRY,
    Permissions.DASHBOARD_EXPORT, // country-scoped
    Permissions.DATA_EXPORT, // country-scoped
  ],

  // Institution Admin
  'institution:admin': [
    Permissions.INSTITUTION_VIEW, // their own institution
    Permissions.TEACHER_INVITE,
    Permissions.TEACHER_MANAGE, // their institution only
    Permissions.PROJECT_VIEW,
    Permissions.DASHBOARD_VIEW_INSTITUTION,
  ],

  // Teacher (existing, enhanced)
  'teacher': [
    Permissions.PROJECT_CREATE,
    Permissions.PROJECT_EDIT, // own projects only
    Permissions.PROJECT_VIEW,
    Permissions.PROJECT_IDEA_CREATE,
  ],
}

// Permission checking utilities
export function hasPermission(
  userRole: string,
  permission: Permission,
  context?: { programId?: string, countryCode?: string, institutionId?: string }
): boolean {
  const rolePermissions = RolePermissions[userRole]
  if (!rolePermissions) return false

  const hasBasePermission = rolePermissions.includes(permission)

  // Add context-based scoping checks here
  // e.g., coordinators can only manage institutions in their assigned country

  return hasBasePermission
}

export function requirePermission(permission: Permission) {
  return async (req: Request, context: any) => {
    const user = await getCurrentUser(req)
    if (!user || !hasPermission(user.role, permission, context)) {
      throw new UnauthorizedError('Insufficient permissions')
    }
  }
}
```

**Middleware Implementation:**

```typescript
// lib/auth/middleware.ts
export async function authMiddleware(request: NextRequest) {
  const session = await getSession(request)

  if (!session) {
    return NextResponse.redirect(new URL('/partner/login', request.url))
  }

  // Check if 2FA is required and enabled
  if (session.user.role.startsWith('partner:') && !session.user.twoFactorVerified) {
    return NextResponse.redirect(new URL('/auth/2fa', request.url))
  }

  return NextResponse.next()
}

export function withPermission(permission: Permission) {
  return async (request: NextRequest, context: any) => {
    const user = await getCurrentUser(request)

    if (!hasPermission(user.role, permission, context)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    return NextResponse.next()
  }
}
```

**Deliverables:**
- [ ] RBAC permission system (`lib/auth/roles.ts`)
- [ ] Auth middleware (`lib/auth/middleware.ts`)
- [ ] Session management enhancements
- [ ] 2FA implementation for partner accounts
- [ ] Route protection utilities
- [ ] Permission checking hooks (`usePermission`, `useRequirePermission`)

---

### 1.3 Program Creation Flow (Feature 2 Implementation)

**UI Components:**

```
app/partner/programs/
├── create/
│   └── page.tsx                    # Program creation wizard
├── [programId]/
│   ├── page.tsx                    # Program overview page
│   ├── edit/
│   │   └── page.tsx                # Edit program settings
│   ├── team/
│   │   └── page.tsx                # Manage co-partners & coordinators
│   └── settings/
│       └── page.tsx                # Advanced settings

components/programs/
├── create/
│   ├── program-creation-wizard.tsx      # Multi-step wizard container
│   ├── step1-program-basics.tsx         # Name, description, logo
│   ├── step2-learning-framework.tsx     # Project types, pedagogy, goals
│   ├── step3-impact-evaluation.tsx      # Metrics, SDGs, evaluation
│   ├── step4-logistics-safety.tsx       # Dates, countries, participation mode
│   └── step5-review-confirm.tsx         # Review & create
├── program-card.tsx                     # Program summary card
├── program-header.tsx                   # Program page header
└── program-sidebar-nav.tsx              # Program page navigation

lib/api/
└── programs.ts                          # Program CRUD operations
```

**Key Features:**

1. **4-Step Wizard Implementation:**
```typescript
// components/programs/create/program-creation-wizard.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { programCreationSchema } from '@/lib/schemas/program'

export function ProgramCreationWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const router = useRouter()

  const form = useForm({
    resolver: zodResolver(programCreationSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      description: '',
      projectTypes: [],
      pedagogicalFramework: '',
      learningGoals: '',
      targetAgeRanges: [],
      sdgFocus: [],
      countriesInScope: [],
      successMetrics: '',
      evaluationMethods: [],
      evaluationCadence: 'quarterly',
      startDate: null,
      endDate: null,
      studentParticipationMode: {
        under13: 'on_platform',
        over13: 'on_platform',
      },
      primaryLanguage: 'en',
      additionalLanguages: [],
    }
  })

  const steps = [
    { id: 1, component: Step1ProgramBasics, title: 'Program Identity' },
    { id: 2, component: Step2LearningFramework, title: 'Learning Framework' },
    { id: 3, component: Step3ImpactEvaluation, title: 'Impact & Evaluation' },
    { id: 4, component: Step4LogisticsSafety, title: 'Logistics & Safety' },
    { id: 5, component: Step5ReviewConfirm, title: 'Review & Confirm' },
  ]

  const handleNext = async () => {
    const isValid = await form.trigger()
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length))
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async (data: any) => {
    try {
      const program = await createProgram(data)
      router.push(`/partner/programs/${program.id}`)
    } catch (error) {
      console.error('Failed to create program:', error)
    }
  }

  const CurrentStepComponent = steps[currentStep - 1].component

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Progress Indicator */}
      <ProgramCreationProgress currentStep={currentStep} totalSteps={steps.length} />

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CurrentStepComponent form={form} />

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            {currentStep > 1 && (
              <Button type="button" variant="outline" onClick={handleBack}>
                Back
              </Button>
            )}
            {currentStep < steps.length ? (
              <Button type="button" onClick={handleNext}>
                Continue
              </Button>
            ) : (
              <Button type="submit">
                Create Program
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}
```

2. **Pedagogical Framework Selector:**
```typescript
// components/programs/create/step2-learning-framework.tsx
export function Step2LearningFramework({ form }: { form: any }) {
  const frameworks = [
    {
      id: 'coil',
      name: 'COIL (Collaborative Online International Learning)',
      description: 'Structured international collaboration between classrooms',
      icon: GlobeIcon,
    },
    {
      id: 'pbl',
      name: 'Project-Based Learning',
      description: 'Student-centered, inquiry-driven learning through projects',
      icon: RocketIcon,
    },
    {
      id: 'design_thinking',
      name: 'Design Thinking',
      description: 'Human-centered problem-solving and innovation',
      icon: LightbulbIcon,
    },
    {
      id: '5e',
      name: '5E Model',
      description: 'Engage, Explore, Explain, Elaborate, Evaluate',
      icon: LayersIcon,
    },
    {
      id: 'esd',
      name: 'Education for Sustainable Development',
      description: 'Learning for environmental and social sustainability',
      icon: LeafIcon,
    },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Learning Framework & Goals</h2>

      {/* Project Types */}
      <FormField
        control={form.control}
        name="projectTypes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Which C2C Project Types will this program support?*</FormLabel>
            <div className="grid grid-cols-1 gap-3">
              {projectTypes.map(type => (
                <FormControl key={type.id}>
                  <Checkbox
                    checked={field.value?.includes(type.id)}
                    onCheckedChange={(checked) => {
                      const newValue = checked
                        ? [...(field.value || []), type.id]
                        : field.value?.filter((v: string) => v !== type.id)
                      field.onChange(newValue)
                    }}
                  >
                    <div>
                      <div className="font-medium">{type.name}</div>
                      <div className="text-sm text-gray-600">{type.description}</div>
                    </div>
                  </Checkbox>
                </FormControl>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Pedagogical Framework */}
      <FormField
        control={form.control}
        name="pedagogicalFramework"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Primary Pedagogical Framework*</FormLabel>
            <RadioGroup value={field.value} onValueChange={field.onChange}>
              {frameworks.map(framework => (
                <div key={framework.id} className="border rounded-lg p-4 hover:border-purple-400 cursor-pointer">
                  <RadioGroupItem value={framework.id} id={framework.id}>
                    <div className="flex items-start gap-3">
                      <framework.icon className="h-6 w-6 text-purple-600" />
                      <div>
                        <div className="font-medium">{framework.name}</div>
                        <div className="text-sm text-gray-600">{framework.description}</div>
                      </div>
                    </div>
                  </RadioGroupItem>
                </div>
              ))}
            </RadioGroup>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Learning Goals */}
      <FormField
        control={form.control}
        name="learningGoals"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Learning Goals/Objectives*</FormLabel>
            <FormDescription>
              What will students and teachers achieve by participating in this program?
            </FormDescription>
            <FormControl>
              <Textarea
                {...field}
                placeholder="Examples: collaboration across borders, critical thinking about sustainability, presentation skills..."
                rows={5}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Target Age Ranges */}
      <FormField
        control={form.control}
        name="targetAgeRanges"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Target Age/Grade Range*</FormLabel>
            <MultiSelect
              options={ageRanges}
              value={field.value}
              onChange={field.onChange}
            />
            <FormMessage />
          </FormItem>
        )}
      />

      {/* SDG Focus */}
      <FormField
        control={form.control}
        name="sdgFocus"
        render={({ field }) => (
          <FormItem>
            <FormLabel>SDGs or Children's Rights Focus</FormLabel>
            <FormDescription>Select up to 5 priority themes</FormDescription>
            <SDGSelector
              value={field.value}
              onChange={field.onChange}
              maxSelection={5}
            />
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
```

3. **Program API Layer:**
```typescript
// lib/api/programs.ts
export class ProgramAPI {
  static async create(data: ProgramInsert): Promise<Program> {
    const { data: program, error } = await supabase
      .from('programs')
      .insert({
        ...data,
        created_by: getCurrentUser().id,
        status: 'planning',
      })
      .select()
      .single()

    if (error) throw error

    // Log activity
    await logActivity('create', 'program', program.id, {
      programName: program.name,
      framework: program.pedagogical_framework,
    })

    return program
  }

  static async getById(id: string): Promise<Program | null> {
    const { data, error } = await supabase
      .from('programs')
      .select(`
        *,
        partner:partners(*),
        co_partners:program_partners(
          *,
          partner:partners(*)
        ),
        coordinators:country_coordinators(*)
      `)
      .eq('id', id)
      .single()

    if (error) return null
    return data
  }

  static async update(id: string, updates: Partial<Program>): Promise<Program> {
    const { data, error } = await supabase
      .from('programs')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async getByPartner(partnerId: string): Promise<Program[]> {
    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .or(`partner_id.eq.${partnerId},program_partners.partner_id.eq.${partnerId}`)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async getMetrics(programId: string): Promise<ProgramMetrics> {
    // Aggregate metrics from related tables
    const [
      { count: countriesCount },
      { count: institutionsCount },
      { count: teachersCount },
      { count: studentsCount },
      { count: projectsCount },
    ] = await Promise.all([
      supabase.from('country_coordinators').select('country_code', { count: 'exact', head: true }).eq('program_id', programId),
      supabase.from('educational_institutions').select('*', { count: 'exact', head: true }).eq('program_id', programId),
      supabase.from('institution_teachers').select('*', { count: 'exact', head: true }).eq('program_id', programId),
      // Student count aggregation query
      supabase.from('program_projects').select('*', { count: 'exact', head: true }).eq('program_id', programId),
    ])

    return {
      programId,
      countriesActive: countriesCount || 0,
      institutionsActive: institutionsCount || 0,
      teachersActive: teachersCount || 0,
      studentsActive: studentsCount || 0,
      projectsTotal: projectsCount || 0,
      projectsCompleted: 0, // TODO: calculate
      projectsInProgress: 0, // TODO: calculate
      updatedAt: new Date(),
    }
  }
}
```

**Deliverables:**
- [ ] Program creation wizard (4-step flow)
- [ ] Program data model & API layer
- [ ] Program list/overview page for partners
- [ ] Program settings page
- [ ] Validation schemas with Zod
- [ ] Success/confirmation flows
- [ ] Unit tests for program creation

---

## Phase 2: Stakeholder Management (Weeks 6-10)

**Goal:** Implement invitation workflows for co-partners, coordinators, and institutions

### 2.1 Unified Invitation System

**Invitation Token Generation:**

```typescript
// lib/invitation/token.ts
import { randomBytes } from 'crypto'
import { sign, verify } from 'jsonwebtoken'

export function generateInvitationToken(): string {
  return randomBytes(32).toString('urlsafe-base64')
}

export function createInvitationLink(
  invitationId: string,
  token: string,
  baseUrl: string
): string {
  return `${baseUrl}/invite/${invitationId}?token=${token}`
}

export interface InvitationPayload {
  invitationId: string
  recipientEmail: string
  recipientType: 'partner' | 'coordinator' | 'institution' | 'teacher'
  targetRole: string
  programId?: string
  expiresAt: number
}

export function signInvitationToken(payload: InvitationPayload): string {
  return sign(payload, process.env.INVITATION_SECRET!, {
    expiresIn: '7d',
  })
}

export function verifyInvitationToken(token: string): InvitationPayload {
  return verify(token, process.env.INVITATION_SECRET!) as InvitationPayload
}
```

**Email Service Integration:**

```typescript
// lib/email/templates/invitation.tsx
import { Html, Head, Body, Container, Section, Text, Button, Img } from '@react-email/components'

interface InvitationEmailProps {
  recipientName: string
  inviterName: string
  inviterOrganization: string
  programName: string
  role: string
  invitationLink: string
  customMessage?: string
}

export function InvitationEmail({
  recipientName,
  inviterName,
  inviterOrganization,
  programName,
  role,
  invitationLink,
  customMessage,
}: InvitationEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#f5f5f5' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: 'white', padding: '40px' }}>
          <Img
            src="https://class2class.com/logo.png"
            alt="Class2Class"
            width="120"
            height="40"
          />

          <Section style={{ marginTop: '32px' }}>
            <Text style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
              You're invited to join {programName}
            </Text>

            <Text style={{ fontSize: '16px', color: '#6B7280', lineHeight: '24px' }}>
              Hello {recipientName},
            </Text>

            <Text style={{ fontSize: '16px', color: '#6B7280', lineHeight: '24px' }}>
              {inviterName} from <strong>{inviterOrganization}</strong> has invited you to join the
              <strong> {programName}</strong> program on Class2Class as a <strong>{role}</strong>.
            </Text>

            {customMessage && (
              <Section style={{ backgroundColor: '#F3F4F6', padding: '16px', borderRadius: '8px', marginTop: '24px' }}>
                <Text style={{ fontSize: '14px', color: '#374151', fontStyle: 'italic' }}>
                  "{customMessage}"
                </Text>
              </Section>
            )}

            <Section style={{ marginTop: '32px', textAlign: 'center' }}>
              <Button
                href={invitationLink}
                style={{
                  backgroundColor: '#7F56D9',
                  color: 'white',
                  padding: '12px 32px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: '16px',
                  fontWeight: '600',
                }}
              >
                Accept Invitation
              </Button>
            </Section>

            <Text style={{ fontSize: '14px', color: '#9CA3AF', marginTop: '32px', textAlign: 'center' }}>
              This invitation will expire in 7 days.
            </Text>

            <Text style={{ fontSize: '12px', color: '#D1D5DB', marginTop: '24px', textAlign: 'center' }}>
              If you didn't expect this invitation, you can safely ignore this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// lib/email/send-invitation.ts
export async function sendInvitationEmail(invitation: Invitation) {
  const program = await ProgramAPI.getById(invitation.program_id!)
  const inviter = await getUserById(invitation.inviter_id)

  const invitationLink = createInvitationLink(
    invitation.id,
    invitation.token,
    process.env.NEXT_PUBLIC_APP_URL!
  )

  const emailHtml = render(
    <InvitationEmail
      recipientName={invitation.recipient_name || 'there'}
      inviterName={inviter.full_name}
      inviterOrganization={inviter.organization_name}
      programName={program.name}
      role={invitation.target_role}
      invitationLink={invitationLink}
      customMessage={invitation.custom_message}
    />
  )

  await sendEmail({
    to: invitation.recipient_email,
    subject: `You're invited to join ${program.name} on Class2Class`,
    html: emailHtml,
  })

  // Update invitation status
  await supabase
    .from('invitations')
    .update({ status: 'sent', sent_at: new Date().toISOString() })
    .eq('id', invitation.id)
}
```

**Invitation Acceptance Flow:**

```typescript
// app/invite/[invitationId]/page.tsx
export default async function InvitationPage({
  params,
  searchParams,
}: {
  params: { invitationId: string }
  searchParams: { token: string }
}) {
  const invitation = await getInvitationById(params.invitationId)

  // Verify token
  try {
    const payload = verifyInvitationToken(searchParams.token)
    if (payload.invitationId !== params.invitationId) {
      throw new Error('Invalid token')
    }
  } catch (error) {
    return <InvalidInvitationPage error="expired" />
  }

  // Check invitation status
  if (invitation.status === 'accepted') {
    return <AlreadyAcceptedPage />
  }

  if (invitation.status === 'expired' || new Date(invitation.expires_at) < new Date()) {
    return <InvalidInvitationPage error="expired" />
  }

  // Mark as viewed
  await supabase
    .from('invitations')
    .update({ status: 'viewed', viewed_at: new Date().toISOString() })
    .eq('id', invitation.id)

  // Route to appropriate onboarding flow
  switch (invitation.recipient_type) {
    case 'partner':
      return <CoPartnerInvitationFlow invitation={invitation} />
    case 'coordinator':
      return <CoordinatorInvitationFlow invitation={invitation} />
    case 'institution':
      return <InstitutionInvitationFlow invitation={invitation} />
    case 'teacher':
      return <TeacherInvitationFlow invitation={invitation} />
  }
}
```

**Deliverables:**
- [ ] Invitation data model & API
- [ ] Token generation & verification
- [ ] Email template components
- [ ] Email sending service integration
- [ ] Invitation acceptance routes
- [ ] Invitation tracking dashboard

---

### 2.2 Co-Partner Invitation & Management (Feature 3)

**UI Implementation:**

```typescript
// components/programs/team/invite-co-partner-modal.tsx
export function InviteCoPartnerModal({
  programId,
  onClose
}: {
  programId: string
  onClose: () => void
}) {
  const form = useForm({
    resolver: zodResolver(coPartnerInvitationSchema),
    defaultValues: {
      organizationName: '',
      contactName: '',
      contactEmail: '',
      role: 'co_host',
      message: `We'd like to invite you to co-host our program on Class2Class...`,
    },
  })

  const coPartnerRoles = [
    {
      value: 'co_host',
      label: 'Co-Host',
      description: 'Full program management access',
      permissions: ['Program edit', 'Invite coordinators', 'Manage institutions'],
    },
    {
      value: 'sponsor',
      label: 'Program Sponsor',
      description: 'Financial/resource support, limited operational access',
      permissions: ['View dashboards', 'Download reports', 'Limited edit'],
    },
    {
      value: 'advisor',
      label: 'Strategic Advisor',
      description: 'View-only + advisory input',
      permissions: ['View program', 'Comment', 'Provide feedback'],
    },
  ]

  async function handleSubmit(data: any) {
    const invitation = await createCoPartnerInvitation(programId, data)
    await sendInvitationEmail(invitation)
    toast.success('Invitation sent successfully')
    onClose()
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Invite an Organization to Co-Host This Program</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="organizationName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Co-Partner Organization Name*</FormLabel>
                  <FormControl>
                    <Input placeholder="LEGO Foundation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Contact Name*</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Contact Email*</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Co-Partner Role*</FormLabel>
                  <RadioGroup value={field.value} onValueChange={field.onChange}>
                    {coPartnerRoles.map(role => (
                      <div key={role.value} className="border rounded-lg p-4">
                        <RadioGroupItem value={role.value} id={role.value}>
                          <div>
                            <div className="font-medium">{role.label}</div>
                            <div className="text-sm text-gray-600">{role.description}</div>
                            <div className="text-xs text-gray-500 mt-2">
                              Permissions: {role.permissions.join(', ')}
                            </div>
                          </div>
                        </RadioGroupItem>
                      </div>
                    ))}
                  </RadioGroup>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Personal Message (optional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                Send Invitation
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
```

**Co-Partner Onboarding:**

```typescript
// app/invite/[invitationId]/co-partner/page.tsx
export default function CoPartnerOnboardingPage({ invitation }: { invitation: Invitation }) {
  const program = await ProgramAPI.getById(invitation.program_id!)
  const [step, setStep] = useState<'overview' | 'account' | 'confirmation'>('overview')

  if (step === 'overview') {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <h1 className="text-3xl font-bold">Welcome! You've been invited to join {program.name}</h1>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Program Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div>
                <dt className="font-semibold">Program Description</dt>
                <dd className="text-gray-600">{program.description}</dd>
              </div>
              <div>
                <dt className="font-semibold">Your Role</dt>
                <dd className="text-gray-600">{invitation.target_role}</dd>
              </div>
              <div>
                <dt className="font-semibold">Host Partner</dt>
                <dd className="text-gray-600">{program.partner.organizationName}</dd>
              </div>
              <div>
                <dt className="font-semibold">Your Permissions</dt>
                <dd>
                  <ul className="list-disc list-inside text-gray-600">
                    {getPermissionsForRole(invitation.target_role).map(p => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <div className="mt-6 flex gap-4">
          <Button variant="outline" onClick={() => handleDecline()}>
            Decline
          </Button>
          <Button onClick={() => setStep('account')}>
            Continue to Sign Up
          </Button>
        </div>
      </div>
    )
  }

  if (step === 'account') {
    // Check if organization already has C2C account
    const existingPartner = await checkExistingPartner(invitation.recipient_email)

    if (existingPartner) {
      return <LinkExistingAccountFlow partner={existingPartner} invitation={invitation} />
    } else {
      return <CreatePartnerAccountFlow invitation={invitation} />
    }
  }

  // Confirmation step handled by separate component
}
```

**Deliverables:**
- [ ] Co-partner invitation modal
- [ ] Co-partner onboarding flow
- [ ] Role-based permission assignment
- [ ] Co-partner management UI (list, remove, edit permissions)
- [ ] Notification system for co-partner actions

---

### 2.3 Country Coordinator Invitation & Management (Feature 4)

**Coordinator Invitation UI:**

```typescript
// components/programs/team/invite-coordinator-modal.tsx
export function InviteCoordinatorModal({
  programId
}: {
  programId: string
}) {
  const program = await ProgramAPI.getById(programId)
  const availableCountries = program.countries_in_scope.filter(
    country => !hasCoordinatorForCountry(programId, country)
  )

  const form = useForm({
    defaultValues: {
      coordinatorName: '',
      coordinatorEmail: '',
      country: '',
      organizationAffiliation: '',
      phone: '',
      message: '',
    },
  })

  return (
    <Dialog>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a Country Coordinator</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleInvite)}>
            <FormField
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country*</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCountries.map(country => (
                        <SelectItem key={country} value={country}>
                          <Flag countryCode={country} /> {getCountryName(country)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Rest of form fields: name, email, phone, affiliation, message */}

            <DialogFooter>
              <Button type="submit">Send Invitation</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
```

**Coordinator Onboarding Flow:**

```typescript
// app/invite/[invitationId]/coordinator/page.tsx
export default function CoordinatorOnboardingPage({ invitation }: { invitation: Invitation }) {
  const [step, setStep] = useState(1)

  const steps = [
    { component: CoordinatorProfileStep, title: 'Create Your Coordinator Profile' },
    { component: ProgramOrientationStep, title: 'Program Orientation' },
    { component: ResourcesTrainingStep, title: 'Resources & Training' },
    { component: CompletionStep, title: 'Complete Onboarding' },
  ]

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">Welcome, Coordinator!</h1>
      <p className="text-gray-600 mb-8">
        Let's set up your coordinator profile for {program.name}
      </p>

      <ProgressBar currentStep={step} totalSteps={steps.length} />

      <CurrentStepComponent {...steps[step - 1]} />
    </div>
  )
}

// Step 1: Coordinator Profile Creation
function CoordinatorProfileStep({ onNext }: { onNext: () => void }) {
  const form = useForm({
    defaultValues: {
      fullName: invitation.recipient_name || '',
      email: invitation.recipient_email,
      password: '',
      confirmPassword: '',
      profilePhoto: null,
      phone: invitation.metadata.phone || '',
      organizationAffiliation: invitation.metadata.affiliation || '',
      roleSelection: 'coordinator', // or 'coordinator_and_teacher'
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleCreateAccount)}>
        {/* Form fields */}

        <FormField
          name="roleSelection"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role Selection*</FormLabel>
              <RadioGroup value={field.value} onValueChange={field.onChange}>
                <RadioGroupItem value="coordinator">
                  <div>
                    <div className="font-medium">Country Coordinator</div>
                    <div className="text-sm text-gray-600">Manage program at country level</div>
                  </div>
                </RadioGroupItem>
                <RadioGroupItem value="coordinator_and_teacher">
                  <div>
                    <div className="font-medium">Coordinator & Teacher</div>
                    <div className="text-sm text-gray-600">
                      Coordinate and also participate as a teacher
                    </div>
                  </div>
                </RadioGroupItem>
              </RadioGroup>
            </FormItem>
          )}
        />

        <Button type="submit">Create Account</Button>
      </form>
    </Form>
  )
}

// Step 2: Program Orientation
function ProgramOrientationStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>About {program.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-4">
            <div>
              <dt className="font-semibold">Program Goals</dt>
              <dd className="text-gray-600">{program.learning_goals}</dd>
            </div>
            <div>
              <dt className="font-semibold">Learning Framework</dt>
              <dd className="text-gray-600">
                {getPedagogicalFrameworkName(program.pedagogical_framework)}
              </dd>
            </div>
            <div>
              <dt className="font-semibold">Your Country</dt>
              <dd className="text-gray-600">
                <Flag countryCode={invitation.metadata.country} />
                {getCountryName(invitation.metadata.country)}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Responsibilities as Coordinator</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <div className="font-medium">Invite educational institutions</div>
                <div className="text-sm text-gray-600">
                  Build your network of participating schools
                </div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <div className="font-medium">Support teacher onboarding</div>
                <div className="text-sm text-gray-600">
                  Help teachers get started with the program
                </div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <div className="font-medium">Create and manage projects</div>
                <div className="text-sm text-gray-600">
                  Launch projects and provide templates for teachers
                </div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <div className="font-medium">Monitor local implementation</div>
                <div className="text-sm text-gray-600">
                  Track progress and identify support needs
                </div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <div className="font-medium">Report on country-level progress</div>
                <div className="text-sm text-gray-600">
                  Share insights and impact data with program partners
                </div>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Button onClick={onNext} className="w-full">
        I Understand My Role
      </Button>
    </div>
  )
}

// Step 3: Resources & Training
function ResourcesTrainingStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Your Coordinator Toolkit</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ResourceCard
          icon={BookOpen}
          title="Coordinator Playbook"
          description="Complete guide to managing your country program"
          action="Download PDF"
          href="/resources/coordinator-playbook.pdf"
        />

        <ResourceCard
          icon={Video}
          title="How to Invite Institutions"
          description="Step-by-step video tutorial"
          action="Watch Video"
          href="/resources/videos/invite-institutions"
        />

        <ResourceCard
          icon={Video}
          title="Supporting Teacher Onboarding"
          description="Best practices for teacher support"
          action="Watch Video"
          href="/resources/videos/teacher-support"
        />

        <ResourceCard
          icon={BarChart}
          title="Using Your Dashboard"
          description="Navigate analytics and reporting tools"
          action="Watch Video"
          href="/resources/videos/dashboard-tour"
        />

        <ResourceCard
          icon={MessageCircle}
          title="Join Coordinator Community"
          description="Connect with other coordinators"
          action="Join WhatsApp/Slack"
          href="/community/coordinators"
        />
      </div>

      <Button onClick={onNext} className="w-full">
        Complete Onboarding
      </Button>
    </div>
  )
}
```

**Coordinator Dashboard:**

```typescript
// app/coordinator/dashboard/page.tsx
export default async function CoordinatorDashboard() {
  const coordinator = await getCurrentCoordinator()
  const program = await ProgramAPI.getById(coordinator.program_id)
  const metrics = await getCoordinatorMetrics(coordinator.id)

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">{program.name}</h1>
        <p className="text-gray-600">
          <Flag countryCode={coordinator.country_code} />
          {getCountryName(coordinator.country_code)} Coordinator Dashboard
        </p>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Institutions"
          value={metrics.institutionsCount}
          icon={School}
          trend="+3 this week"
        />
        <MetricCard
          title="Teachers"
          value={metrics.teachersCount}
          icon={Users}
          trend="+8 this week"
        />
        <MetricCard
          title="Students"
          value={metrics.studentsCount}
          icon={GraduationCap}
          trend="+120 this week"
        />
        <MetricCard
          title="Projects"
          value={metrics.projectsCount}
          icon={FolderOpen}
          trend="+2 this week"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <ActionCard
          icon={Plus}
          title="Invite Educational Institutions"
          description="Add schools to your network"
          href="/coordinator/institutions/invite"
        />
        <ActionCard
          icon={Plus}
          title="Create Project"
          description="Launch a new project for teachers"
          href="/coordinator/projects/create"
        />
        <ActionCard
          icon={Lightbulb}
          title="Create Project Idea"
          description="Share a template for teachers"
          href="/coordinator/project-ideas/create"
        />
      </div>

      {/* Institutions List */}
      <Card>
        <CardHeader>
          <CardTitle>Educational Institutions</CardTitle>
          <CardDescription>
            {metrics.institutionsCount} institutions in your network
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InstitutionsList coordinatorId={coordinator.id} />
        </CardContent>
      </Card>
    </div>
  )
}
```

**Deliverables:**
- [ ] Coordinator invitation modal & flow
- [ ] Coordinator onboarding wizard (3 steps)
- [ ] Coordinator profile creation
- [ ] Coordinator dashboard
- [ ] Coordinator permissions implementation
- [ ] Coordinator resource library

---

### 2.4 Educational Institution Invitation & Onboarding (Feature 5)

**Institution Invitation UI (Coordinator Side):**

```typescript
// components/coordinator/institutions/invite-institution-modal.tsx
export function InviteInstitutionModal({
  coordinatorId,
  programId
}: {
  coordinatorId: string
  programId: string
}) {
  const coordinator = await getCoordinatorById(coordinatorId)

  const form = useForm({
    defaultValues: {
      institutionName: '',
      institutionType: '',
      country: coordinator.country_code, // pre-filled, read-only
      cityRegion: '',
      contactName: '',
      contactEmail: '',
      contactRole: 'headmaster',
      contactPhone: '',
      message: '',
    },
  })

  const institutionTypes = [
    { value: 'primary', label: 'Primary School' },
    { value: 'secondary', label: 'Secondary School' },
    { value: 'k12', label: 'K-12 School' },
    { value: 'university', label: 'University' },
    { value: 'community_center', label: 'Community Center' },
    { value: 'library', label: 'Library' },
    { value: 'ngo_learning_center', label: 'NGO Learning Center' },
    { value: 'other', label: 'Other' },
  ]

  return (
    <Dialog>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Invite a School or Educational Institution</DialogTitle>
          <DialogDescription>
            Invite institutions to join {program.name} in {getCountryName(coordinator.country_code)}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleInvite)}>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                name="institutionName"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Institution Name*</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="institutionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Institution Type*</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {institutionTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="cityRegion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City/Region*</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="country"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Country*</FormLabel>
                    <FormControl>
                      <Input {...field} disabled />
                    </FormControl>
                    <FormDescription>
                      Pre-filled with your coordinator country
                    </FormDescription>
                  </FormItem>
                )}
              />

              <Separator className="col-span-2" />

              <h3 className="col-span-2 font-semibold">Primary Contact Information</h3>

              <FormField
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="contactRole"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Role*</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="headmaster">Headmaster</SelectItem>
                        <SelectItem value="principal">Principal</SelectItem>
                        <SelectItem value="director">Director</SelectItem>
                        <SelectItem value="coordinator">Coordinator</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email*</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Phone</FormLabel>
                    <FormControl>
                      <Input type="tel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="message"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Personal Message (optional)</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                Send Invitation
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
```

**Institution Onboarding Flow:**

```typescript
// app/invite/[invitationId]/institution/page.tsx
export default function InstitutionOnboardingPage({ invitation }: { invitation: Invitation }) {
  const [step, setStep] = useState(1)
  const program = await ProgramAPI.getById(invitation.program_id!)
  const coordinator = await getCoordinatorById(invitation.inviter_id)

  const steps = [
    { component: InstitutionInformationStep },
    { component: ContactInformationStep },
    { component: ProgramOrientationStep },
    { component: LegalAgreementsStep },
    { component: CompletionStep },
  ]

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">Create Your School's Profile</h1>
      <p className="text-gray-600 mb-8">
        Join {program.name} on Class2Class
      </p>

      <ProgressBar currentStep={step} totalSteps={steps.length} />

      <CurrentStepComponent {...steps[step - 1]} />
    </div>
  )
}

// Step 1: Institution Information
function InstitutionInformationStep({ onNext }: { onNext: () => void }) {
  const form = useForm({
    defaultValues: {
      institutionName: invitation.metadata.institutionName || '',
      institutionType: invitation.metadata.institutionType || '',
      country: invitation.metadata.country || '',
      cityRegion: invitation.metadata.cityRegion || '',
      address: '',
      website: '',
      logo: null,
      gradesAgesServed: [],
      primaryLanguage: '',
      additionalLanguages: [],
      description: '',
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSaveAndNext)}>
        {/* Form fields */}

        <FormField
          name="gradesAgesServed"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Grades/Ages Served*</FormLabel>
              <FormDescription>Select all that apply</FormDescription>
              <div className="grid grid-cols-2 gap-2">
                {gradesAgesOptions.map(option => (
                  <FormControl key={option.value}>
                    <Checkbox
                      checked={field.value?.includes(option.value)}
                      onCheckedChange={(checked) => {
                        const newValue = checked
                          ? [...(field.value || []), option.value]
                          : field.value?.filter(v => v !== option.value)
                        field.onChange(newValue)
                      }}
                    >
                      {option.label}
                    </Checkbox>
                  </FormControl>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Continue</Button>
      </form>
    </Form>
  )
}

// Step 2: Primary Contact Information
function ContactInformationStep({ onNext }: { onNext: () => void }) {
  const form = useForm({
    defaultValues: {
      contactName: invitation.metadata.contactName || '',
      contactRole: invitation.metadata.contactRole || '',
      contactEmail: invitation.recipient_email,
      contactPhone: invitation.metadata.contactPhone || '',
      password: '',
      confirmPassword: '',
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>You are registering as the main point of contact for your institution</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleCreateAccount)}>
            {/* Form fields */}

            <Alert className="mb-4">
              <InfoIcon className="h-4 w-4" />
              <AlertDescription>
                If you change roles, you can transfer this account to your successor.
              </AlertDescription>
            </Alert>

            <Button type="submit">Continue</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

// Step 3: Program Orientation
function ProgramOrientationStep({ onNext }: { onNext: () => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>About {program.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-4">
          <div>
            <dt className="font-semibold">Program Goals & Framework</dt>
            <dd className="text-gray-600">{program.learning_goals}</dd>
          </div>
        </dl>

        <div className="mt-6">
          <h3 className="font-semibold mb-3">Your role as an institution:</h3>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <span>Invite and support teachers</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <span>Ensure safety protocols</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <span>Facilitate consent processes</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <span>Monitor teacher/student participation</span>
            </li>
          </ul>
        </div>

        <div className="mt-4 text-gray-600">
          <strong>Your coordinator:</strong> {coordinator.full_name} ({getCountryName(coordinator.country_code)})
        </div>

        <Button onClick={onNext} className="mt-6 w-full">
          Continue
        </Button>
      </CardContent>
    </Card>
  )
}

// Step 4: Legal Agreements
function LegalAgreementsStep({ onNext }: { onNext: () => void }) {
  const form = useForm({
    defaultValues: {
      acceptTerms: false,
      acceptDPA: false,
      confirmAuthorized: false,
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Legal Agreements</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleAcceptAndComplete)}>
            <div className="space-y-4">
              <FormField
                name="acceptTerms"
                render={({ field }) => (
                  <FormItem className="flex items-start gap-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div>
                      <FormLabel>
                        I have read and agree to the <a href="/terms" target="_blank" className="text-purple-600 underline">Terms of Service</a>*
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                name="acceptDPA"
                render={({ field }) => (
                  <FormItem className="flex items-start gap-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div>
                      <FormLabel>
                        I have read and agree to the <a href="/dpa" target="_blank" className="text-purple-600 underline">Data Processing Agreement</a>*
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                name="confirmAuthorized"
                render={({ field }) => (
                  <FormItem className="flex items-start gap-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div>
                      <FormLabel>
                        I confirm I am authorized to represent this institution*
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="mt-6 w-full" disabled={!form.watch('acceptTerms') || !form.watch('acceptDPA') || !form.watch('confirmAuthorized')}>
              Complete Registration
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

// Step 5: Completion
function CompletionStep() {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Welcome to Class2Class!</h2>
        <p className="text-gray-600 mb-6">
          Your institution '{institution.name}' is now registered.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Next Steps:</h3>
          <ul className="space-y-1 text-blue-800 text-sm">
            <li>→ Invite Teachers from your school</li>
            <li>→ Review the Program Guidelines</li>
            <li>→ Access your Institution Dashboard</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <Button onClick={() => router.push('/institution/teachers/invite')} className="flex-1">
            Invite Teachers Now
          </Button>
          <Button onClick={() => router.push('/institution/dashboard')} variant="outline" className="flex-1">
            Go to Dashboard
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

**Institution Invites Teachers:**

```typescript
// app/institution/teachers/invite/page.tsx
export default function InviteTeachersPage() {
  const institution = await getCurrentInstitution()
  const program = await ProgramAPI.getById(institution.program_id)

  const form = useForm({
    defaultValues: {
      teachers: [{ name: '', email: '', subject: '', grades: [] }],
      customMessage: '',
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'teachers',
  })

  async function handleSubmit(data: any) {
    const invitations = await Promise.all(
      data.teachers.map(teacher =>
        createTeacherInvitation({
          programId: program.id,
          institutionId: institution.id,
          teacherEmail: teacher.email,
          teacherName: teacher.name,
          metadata: {
            subject: teacher.subject,
            grades: teacher.grades,
          },
          customMessage: data.customMessage,
        })
      )
    )

    // Send emails
    await Promise.all(invitations.map(sendInvitationEmail))

    toast.success(`${invitations.length} invitation(s) sent!`)
    router.push('/institution/dashboard')
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Invite Teachers to Join {program.name}</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          {fields.map((field, index) => (
            <Card key={field.id} className="mb-4">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Teacher {index + 1}</h3>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    name={`teachers.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teacher Name*</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name={`teachers.${index}.email`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teacher Email*</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name={`teachers.${index}.subject`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject(s) Taught</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Math, Science, etc." />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    name={`teachers.${index}.grades`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Grade(s) Taught</FormLabel>
                        <MultiSelect
                          options={gradeOptions}
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={() => append({ name: '', email: '', subject: '', grades: [] })}
            className="w-full mb-6"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Teacher
          </Button>

          <FormField
            name="customMessage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Personal Message (optional)</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Hello! Our school has joined the Class2Class program..."
                    rows={4}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full mt-6">
            Send Invitations
          </Button>
        </form>
      </Form>
    </div>
  )
}
```

**Teacher Onboarding (Auto-Association with Institution & Program):**

```typescript
// app/invite/[invitationId]/teacher/page.tsx
export default function TeacherOnboardingPage({ invitation }: { invitation: Invitation }) {
  const institution = await getInstitutionById(invitation.metadata.institutionId)
  const program = await ProgramAPI.getById(invitation.program_id!)

  // Use existing C2C teacher onboarding flow, but auto-associate with:
  // - Institution: institution.id
  // - Program: program.id
  // - Country Coordinator: institution.coordinator_id

  return (
    <ExistingTeacherOnboardingFlow
      prefilledData={{
        email: invitation.recipient_email,
        name: invitation.recipient_name,
        school: institution.name,
        country: institution.country_code,
      }}
      onComplete={async (teacherData) => {
        // Create teacher account
        const teacher = await createTeacher(teacherData)

        // Link to institution & program
        await createInstitutionTeacher({
          institution_id: institution.id,
          teacher_id: teacher.id,
          program_id: program.id,
          invited_by: invitation.inviter_id,
          status: 'active',
        })

        // Mark invitation as accepted
        await acceptInvitation(invitation.id)

        // Redirect to teacher dashboard with program context
        router.push(`/teacher/dashboard?program=${program.id}`)
      }}
    />
  )
}
```

**Deliverables:**
- [ ] Institution invitation modal (coordinator side)
- [ ] Institution onboarding flow (4 steps)
- [ ] Institution dashboard
- [ ] Institution → Teacher invitation flow
- [ ] Teacher auto-association with institution & program
- [ ] Institution management UI (for coordinators & partners)

---

## Phase 3: Dashboards & Analytics (Weeks 11-16)

**Goal:** Multi-level dashboards with drill-down capabilities, reporting, and export

### 3.1 Dashboard Architecture

**Dashboard Levels:**

1. **Program-Level Dashboard** (Partners & Co-Partners)
   - View: All countries, all institutions, all projects
   - Metrics: Total reach, completion rates, engagement trends, SDG impact
   - Drilldown: Country → Institution → Project

2. **Country-Level Dashboard** (Coordinators)
   - View: Their assigned country only
   - Metrics: Country-specific reach, institution engagement, project quality
   - Drilldown: Institution → Project

3. **Institution-Level Dashboard** (Institution Admins)
   - View: Their school only
   - Metrics: Teacher participation, student engagement, project completion
   - Drilldown: Project

**Data Aggregation Strategy:**

```typescript
// lib/analytics/aggregation.ts
export async function aggregateProgramMetrics(programId: string): Promise<ProgramDashboardData> {
  // Use Supabase views or materialized views for performance
  const [
    countriesData,
    institutionsData,
    teachersData,
    studentsData,
    projectsData,
    engagementData,
    competencyData,
    safetyData,
  ] = await Promise.all([
    supabase.rpc('get_program_countries_metrics', { p_program_id: programId }),
    supabase.rpc('get_program_institutions_metrics', { p_program_id: programId }),
    supabase.rpc('get_program_teachers_metrics', { p_program_id: programId }),
    supabase.rpc('get_program_students_metrics', { p_program_id: programId }),
    supabase.rpc('get_program_projects_metrics', { p_program_id: programId }),
    supabase.rpc('get_program_engagement_trends', { p_program_id: programId }),
    supabase.rpc('get_program_competency_development', { p_program_id: programId }),
    supabase.rpc('get_program_safety_metrics', { p_program_id: programId }),
  ])

  return {
    overview: {
      countriesActive: countriesData.count,
      institutionsActive: institutionsData.count,
      teachersActive: teachersData.count,
      studentsReached: studentsData.count,
      projectsTotal: projectsData.total,
      projectsCompleted: projectsData.completed,
      projectsInProgress: projectsData.in_progress,
    },
    geographic: {
      countryBreakdown: countriesData.breakdown,
      map: generateMapData(countriesData.breakdown),
    },
    engagement: {
      trends: engagementData.trends,
      completionRate: projectsData.completion_rate,
      avgProjectDuration: projectsData.avg_duration,
    },
    learning: {
      competencyDevelopment: competencyData.by_skill,
      prePostAssessments: competencyData.assessments,
      teacherSatisfaction: engagementData.teacher_satisfaction,
      studentSatisfaction: engagementData.student_satisfaction,
    },
    impact: {
      sdgAlignment: projectsData.sdg_distribution,
      solutionsCreated: projectsData.solutions_count,
      collaborativeExchanges: engagementData.exchange_count,
    },
    safety: {
      consentCompletionRate: safetyData.consent_rate,
      incidentReports: safetyData.incident_count,
      complianceStatus: safetyData.compliance,
    },
  }
}
```

**Database Functions for Performance:**

```sql
-- Database function for program metrics aggregation
CREATE OR REPLACE FUNCTION get_program_countries_metrics(p_program_id UUID)
RETURNS TABLE (
  country_code TEXT,
  country_name TEXT,
  institutions_count BIGINT,
  teachers_count BIGINT,
  students_count BIGINT,
  projects_count BIGINT,
  engagement_score NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cc.country_code,
    get_country_name(cc.country_code) as country_name,
    COUNT(DISTINCT ei.id) as institutions_count,
    COUNT(DISTINCT it.teacher_id) as teachers_count,
    SUM(ei.student_count_estimate) as students_count,
    COUNT(DISTINCT pp.project_id) as projects_count,
    AVG(calculate_engagement_score(ei.id)) as engagement_score
  FROM country_coordinators cc
  LEFT JOIN educational_institutions ei ON ei.coordinator_id = cc.id
  LEFT JOIN institution_teachers it ON it.institution_id = ei.id
  LEFT JOIN program_projects pp ON pp.program_id = p_program_id
  WHERE cc.program_id = p_program_id
    AND cc.is_active = TRUE
  GROUP BY cc.country_code;
END;
$$ LANGUAGE plpgsql;

-- Materialized view for faster dashboard loads
CREATE MATERIALIZED VIEW program_metrics_cache AS
SELECT
  p.id as program_id,
  p.name as program_name,
  COUNT(DISTINCT cc.id) as coordinators_count,
  COUNT(DISTINCT ei.id) as institutions_count,
  COUNT(DISTINCT it.teacher_id) as teachers_count,
  SUM(ei.student_count_estimate) as students_estimate,
  COUNT(DISTINCT pp.project_id) as projects_count,
  NOW() as last_updated
FROM programs p
LEFT JOIN country_coordinators cc ON cc.program_id = p.id
LEFT JOIN educational_institutions ei ON ei.program_id = p.id
LEFT JOIN institution_teachers it ON it.program_id = p.id
LEFT JOIN program_projects pp ON pp.program_id = p.id
GROUP BY p.id, p.name;

-- Refresh schedule (every hour)
CREATE OR REPLACE FUNCTION refresh_program_metrics_cache()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY program_metrics_cache;
END;
$$ LANGUAGE plpgsql;
```

**Dashboard Components:**

```typescript
// components/dashboards/program-dashboard.tsx
export function ProgramDashboard({ programId }: { programId: string }) {
  const { data, isLoading } = useProgramDashboardData(programId)
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const [selectedInstitution, setSelectedInstitution] = useState<string | null>(null)

  if (isLoading) return <DashboardSkeleton />

  return (
    <div className="space-y-8">
      {/* Header with Program Info */}
      <ProgramDashboardHeader program={data.program} />

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          title="Countries"
          value={data.overview.countriesActive}
          icon={Globe}
          onClick={() => scrollToSection('geographic')}
        />
        <MetricCard
          title="Institutions"
          value={data.overview.institutionsActive}
          icon={School}
          onClick={() => scrollToSection('institutions')}
        />
        <MetricCard
          title="Teachers"
          value={data.overview.teachersActive}
          icon={Users}
        />
        <MetricCard
          title="Students"
          value={data.overview.studentsReached}
          icon={GraduationCap}
        />
      </div>

      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          title="Projects"
          value={data.overview.projectsTotal}
          icon={FolderOpen}
        />
        <MetricCard
          title="Completed"
          value={data.overview.projectsCompleted}
          icon={CheckCircle}
          trend={`${data.engagement.completionRate}% completion rate`}
        />
        <MetricCard
          title="In Progress"
          value={data.overview.projectsInProgress}
          icon={Clock}
        />
        <MetricCard
          title="Avg Duration"
          value={`${data.engagement.avgProjectDuration} days`}
          icon={Calendar}
        />
      </div>

      {/* Geographic Overview with Interactive Map */}
      <Card id="geographic">
        <CardHeader>
          <CardTitle>Geographic Overview</CardTitle>
          <CardDescription>
            Program activity across {data.overview.countriesActive} countries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <InteractiveMap
              data={data.geographic.map}
              onCountryClick={(countryCode) => setSelectedCountry(countryCode)}
            />

            <CountryBreakdownTable
              data={data.geographic.countryBreakdown}
              selectedCountry={selectedCountry}
              onCountrySelect={setSelectedCountry}
            />
          </div>
        </CardContent>
      </Card>

      {/* Drill-down: Country Details */}
      {selectedCountry && (
        <Card>
          <CardHeader>
            <CardTitle>
              <Flag countryCode={selectedCountry} />
              {getCountryName(selectedCountry)} Details
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedCountry(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <CountryDashboard
              programId={programId}
              countryCode={selectedCountry}
              onInstitutionClick={(institutionId) => setSelectedInstitution(institutionId)}
            />
          </CardContent>
        </Card>
      )}

      {/* Engagement Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <EngagementChart data={data.engagement.trends} />
        </CardContent>
      </Card>

      {/* Learning Outcomes */}
      <Card>
        <CardHeader>
          <CardTitle>Learning Outcomes</CardTitle>
          <CardDescription>
            Competency development across C2C's 7-skill framework
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CompetencyRadarChart data={data.learning.competencyDevelopment} />

          <div className="grid grid-cols-2 gap-4 mt-6">
            <MetricCard
              title="Teacher Satisfaction"
              value={`${data.learning.teacherSatisfaction}/5`}
              icon={Star}
            />
            <MetricCard
              title="Student Satisfaction"
              value={`${data.learning.studentSatisfaction}/5`}
              icon={Star}
            />
          </div>
        </CardContent>
      </Card>

      {/* Impact Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Impact Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <MetricCard
              title="Students Reached"
              value={data.overview.studentsReached}
              icon={Users}
            />
            <MetricCard
              title="Collaborative Exchanges"
              value={data.impact.collaborativeExchanges}
              icon={MessageSquare}
            />
            <MetricCard
              title="Solutions Created"
              value={data.impact.solutionsCreated}
              icon={Lightbulb}
            />
          </div>

          <SDGDistributionChart data={data.impact.sdgAlignment} />
        </CardContent>
      </Card>

      {/* Safety & Compliance */}
      <Card>
        <CardHeader>
          <CardTitle>Safety & Compliance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <MetricCard
              title="Consent Completion Rate"
              value={`${data.safety.consentCompletionRate}%`}
              icon={Shield}
              variant={data.safety.consentCompletionRate >= 90 ? 'success' : 'warning'}
            />
            <MetricCard
              title="Safety Incident Reports"
              value={data.safety.incidentReports}
              icon={AlertTriangle}
              variant={data.safety.incidentReports === 0 ? 'success' : 'warning'}
            />
            <MetricCard
              title="GDPR Compliance"
              value={data.safety.complianceStatus.gdpr ? 'Compliant' : 'Review Required'}
              icon={FileCheck}
              variant={data.safety.complianceStatus.gdpr ? 'success' : 'error'}
            />
          </div>
        </CardContent>
      </Card>

      {/* Export & Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Reports & Export</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button onClick={() => handleExportPDF(programId)}>
              <Download className="h-4 w-4 mr-2" />
              Export PDF Report
            </Button>
            <Button variant="outline" onClick={() => handleExportCSV(programId)}>
              <Download className="h-4 w-4 mr-2" />
              Export Data (CSV)
            </Button>
            <Button variant="outline" onClick={() => handleScheduleReport(programId)}>
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

**Deliverables:**
- [ ] Program-level dashboard (partners)
- [ ] Country-level dashboard (coordinators)
- [ ] Institution-level dashboard (institution admins)
- [ ] Interactive data visualizations (charts, maps)
- [ ] Drill-down functionality
- [ ] Real-time metrics updates (WebSocket or polling)
- [ ] Export functionality (PDF, CSV)
- [ ] Scheduled reporting system

---

### 3.2 Program Page with Tabs (Feature 7)

```typescript
// app/partner/programs/[programId]/page.tsx
export default async function ProgramPage({ params }: { params: { programId: string } }) {
  const program = await ProgramAPI.getById(params.programId)
  const metrics = await ProgramAPI.getMetrics(params.programId)

  return (
    <div>
      <ProgramHeader program={program} metrics={metrics} />

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="participants">Participants</TabsTrigger>
          <TabsTrigger value="dashboards">Dashboards</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <ProgramOverviewTab program={program} metrics={metrics} />
        </TabsContent>

        <TabsContent value="projects">
          <ProgramProjectsTab programId={program.id} />
        </TabsContent>

        <TabsContent value="participants">
          <ProgramParticipantsTab programId={program.id} />
        </TabsContent>

        <TabsContent value="dashboards">
          <ProgramDashboard programId={program.id} />
        </TabsContent>

        <TabsContent value="resources">
          <ProgramResourcesTab programId={program.id} />
        </TabsContent>

        <TabsContent value="settings">
          <ProgramSettingsTab program={program} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

**Tab Implementations:**

1. **Overview Tab:**
   - Program summary
   - Key metrics snapshot
   - Recent activity feed
   - Program team (partners, coordinators)

2. **Projects Tab:**
   - Filterable project grid
   - Status breakdown
   - Create new project button (with program auto-link)

3. **Participants Tab:**
   - Sub-tabs: Countries, Institutions, Coordinators, Teachers, Students
   - Searchable/filterable lists
   - Invitation management

4. **Dashboards Tab:**
   - Full dashboard (as described in 3.1)

5. **Resources Tab:**
   - Program handbook
   - Training materials
   - Templates
   - Shared documents

6. **Settings Tab:**
   - Edit program details
   - Team management (invite/remove co-partners, coordinators)
   - Evaluation settings
   - Notification preferences

**Deliverables:**
- [ ] Program page with tab navigation
- [ ] 6 tab implementations
- [ ] Activity feed component
- [ ] Resource library integration

---

## Phase 4: Integration & Polish (Weeks 17-20)

### 4.1 Integration with Existing C2C Workflows (Feature 8)

**Teacher Integration:**

```typescript
// Enhance existing teacher dashboard to show program affiliations
// app/teacher/dashboard/page.tsx (modifications)
export default async function TeacherDashboard() {
  const teacher = await getCurrentTeacher()
  const programs = await getTeacherPrograms(teacher.id)

  return (
    <div>
      {/* Program Affiliations Section */}
      {programs.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Your Programs</CardTitle>
          </CardHeader>
          <CardContent>
            {programs.map(program => (
              <ProgramBadge key={program.id} program={program} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Existing dashboard content */}
    </div>
  )
}

// Enhance project discovery to filter by program
// app/discover/page.tsx (modifications)
export default async function DiscoverPage() {
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null)
  const programs = await getAvailablePrograms()

  return (
    <div>
      <div className="filters">
        {/* Existing filters */}

        {/* New Program Filter */}
        <Select value={selectedProgram} onValueChange={setSelectedProgram}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by program" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Programs</SelectItem>
            {programs.map(program => (
              <SelectItem key={program.id} value={program.id}>
                {program.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ProjectGrid programFilter={selectedProgram} />
    </div>
  )
}

// Auto-link projects to programs when created by program participants
// app/projects/create/page.tsx (modifications)
export default async function CreateProjectPage() {
  const user = await getCurrentUser()
  const userPrograms = await getUserPrograms(user.id)

  const form = useForm({
    defaultValues: {
      // ... existing fields
      linkedProgram: userPrograms.length === 1 ? userPrograms[0].id : null,
    },
  })

  async function handleSubmit(data: any) {
    const project = await createProject(data)

    // Link to program if selected
    if (data.linkedProgram) {
      await linkProjectToProgram(project.id, data.linkedProgram)
    }

    router.push(`/projects/${project.id}`)
  }

  return (
    <Form {...form}>
      {/* ... existing form fields */}

      {userPrograms.length > 0 && (
        <FormField
          name="linkedProgram"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link to Program (optional)</FormLabel>
              <FormDescription>
                This project will be associated with the selected program
              </FormDescription>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a program" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>None</SelectItem>
                  {userPrograms.map(program => (
                    <SelectItem key={program.id} value={program.id}>
                      {program.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
      )}
    </Form>
  )
}
```

**Student Integration:**

```typescript
// Show program context on project pages for students
// app/projects/[projectId]/page.tsx (modifications)
export default async function ProjectPage({ params }: { params: { projectId: string } }) {
  const project = await getProjectById(params.projectId)
  const programLink = await getProgramLinkForProject(project.id)

  return (
    <div>
      {programLink && (
        <Alert className="mb-6">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Part of {programLink.program.name}</AlertTitle>
          <AlertDescription>
            This project is part of the {programLink.program.name} program,
            focused on {getPedagogicalFrameworkName(programLink.program.pedagogical_framework)}.
          </AlertDescription>
        </Alert>
      )}

      {/* Existing project content */}
    </div>
  )
}

// Program-branded certificates for students
export async function generateProgramCertificate(
  studentId: string,
  projectId: string
): Promise<Buffer> {
  const project = await getProjectById(projectId)
  const programLink = await getProgramLinkForProject(projectId)
  const student = await getStudentById(studentId)

  const certificateData = {
    studentName: student.name,
    projectTitle: project.title,
    completionDate: new Date(),
    programName: programLink?.program.name,
    programLogo: programLink?.program.logo_url,
    partnerName: programLink?.partner.organizationName,
  }

  return await renderCertificatePDF(certificateData)
}
```

**Deliverables:**
- [ ] Teacher dashboard program affiliations
- [ ] Project discovery program filters
- [ ] Auto-program linking for project creation
- [ ] Student program context display
- [ ] Program-branded certificates
- [ ] Notification system enhancements

---

### 4.2 Testing Strategy

**Unit Tests:**
```typescript
// tests/lib/api/programs.test.ts
describe('ProgramAPI', () => {
  describe('create', () => {
    it('should create a program with valid data', async () => {
      const programData = {
        partner_id: 'partner-123',
        name: 'Test Program',
        // ... other required fields
      }

      const program = await ProgramAPI.create(programData)

      expect(program).toBeDefined()
      expect(program.name).toBe('Test Program')
      expect(program.status).toBe('planning')
    })

    it('should throw error with invalid data', async () => {
      const invalidData = { name: '' }

      await expect(ProgramAPI.create(invalidData)).rejects.toThrow()
    })
  })

  describe('getMetrics', () => {
    it('should return aggregated metrics for a program', async () => {
      const metrics = await ProgramAPI.getMetrics('program-123')

      expect(metrics).toHaveProperty('countriesActive')
      expect(metrics).toHaveProperty('institutionsActive')
      expect(metrics).toHaveProperty('teachersActive')
    })
  })
})
```

**Integration Tests:**
```typescript
// tests/integration/invitation-flow.test.ts
describe('Invitation Flow', () => {
  it('should complete coordinator invitation end-to-end', async () => {
    // 1. Partner creates program
    const program = await createTestProgram()

    // 2. Partner invites coordinator
    const invitation = await inviteCoordinator({
      programId: program.id,
      email: 'coordinator@test.com',
      country: 'DK',
    })

    expect(invitation.status).toBe('sent')

    // 3. Coordinator accepts invitation
    const coordinator = await acceptCoordinatorInvitation(invitation.id, {
      fullName: 'Test Coordinator',
      password: 'secure123',
    })

    expect(coordinator.status).toBe('active')
    expect(coordinator.program_id).toBe(program.id)

    // 4. Verify coordinator has correct permissions
    const hasPermission = await checkPermission(
      coordinator.user_id,
      Permissions.INSTITUTION_INVITE
    )

    expect(hasPermission).toBe(true)
  })
})
```

**E2E Tests (Playwright):**
```typescript
// tests/e2e/program-creation.spec.ts
test('partner can create a program', async ({ page }) => {
  // Login as partner
  await page.goto('/partner/login')
  await page.fill('[name="email"]', 'partner@test.com')
  await page.fill('[name="password"]', 'password123')
  await page.click('button[type="submit"]')

  // Navigate to program creation
  await page.goto('/partner/programs/create')

  // Step 1: Program Basics
  await page.fill('[name="name"]', 'Test Program')
  await page.fill('[name="description"]', 'A test program for e2e testing')
  await page.click('text=Continue')

  // Step 2: Learning Framework
  await page.check('[name="projectTypes"][value="explore_cultures"]')
  await page.click('[name="pedagogicalFramework"][value="coil"]')
  await page.fill('[name="learningGoals"]', 'Test learning goals')
  await page.click('text=Continue')

  // Step 3: Impact & Evaluation
  await page.fill('[name="successMetrics"]', 'Test metrics')
  await page.click('text=Continue')

  // Step 4: Logistics & Safety
  await page.fill('[name="startDate"]', '2025-01-01')
  await page.fill('[name="endDate"]', '2025-12-31')
  await page.click('text=Create Program')

  // Verify program created
  await expect(page).toHaveURL(/\/partner\/programs\/[a-z0-9-]+/)
  await expect(page.locator('h1')).toContainText('Test Program')
})
```

**Deliverables:**
- [ ] Unit test suite (>80% coverage)
- [ ] Integration test suite
- [ ] E2E test suite (critical user flows)
- [ ] Test documentation

---

### 4.3 Documentation

**Developer Documentation:**
- API reference (auto-generated from TypeScript)
- Database schema documentation
- Architecture decision records (ADRs)
- Component library documentation (Storybook)

**User Documentation:**
- Partner onboarding guide
- Coordinator playbook
- Institution admin guide
- Teacher quick start guide

**Operations Documentation:**
- Deployment guide
- Monitoring & alerting setup
- Backup & disaster recovery
- Performance optimization guide

**Deliverables:**
- [ ] API reference docs
- [ ] User guides (4 roles)
- [ ] Operations runbook
- [ ] Video tutorials

---

## Implementation Checklist & Timeline

### Week 1-2: Database & Auth Foundation
- [ ] Design & implement database schema
- [ ] Create Supabase migrations
- [ ] Set up RLS policies
- [ ] Implement RBAC permission system
- [ ] Create auth middleware
- [ ] Add 2FA for partner accounts

### Week 3-5: Program Creation
- [ ] Build program creation wizard (4 steps)
- [ ] Implement program API layer
- [ ] Create program management UI
- [ ] Add program validation & error handling
- [ ] Write unit tests

### Week 6-7: Co-Partner Management
- [ ] Build co-partner invitation flow
- [ ] Implement co-partner onboarding
- [ ] Create co-partner management UI
- [ ] Add role-based permission assignment

### Week 8-9: Coordinator Management
- [ ] Build coordinator invitation flow
- [ ] Implement coordinator onboarding (3 steps)
- [ ] Create coordinator dashboard
- [ ] Add coordinator resource library

### Week 10-11: Institution Management
- [ ] Build institution invitation flow
- [ ] Implement institution onboarding (4 steps)
- [ ] Create institution dashboard
- [ ] Build institution → teacher invitation

### Week 12-14: Dashboards
- [ ] Implement data aggregation functions
- [ ] Build program-level dashboard
- [ ] Build country-level dashboard
- [ ] Build institution-level dashboard
- [ ] Add interactive visualizations
- [ ] Implement drill-down functionality

### Week 15: Program Page & Tabs
- [ ] Build program page structure
- [ ] Implement 6 tabs
- [ ] Add activity feed
- [ ] Create resource library

### Week 16-17: Integration
- [ ] Integrate with teacher workflows
- [ ] Add program filters to project discovery
- [ ] Implement auto-program linking
- [ ] Add program context for students

### Week 18-19: Testing
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Write E2E tests
- [ ] Conduct user acceptance testing (UAT)

### Week 20: Polish & Documentation
- [ ] Fix bugs from UAT
- [ ] Write user documentation
- [ ] Create video tutorials
- [ ] Prepare for launch

---

## Technical Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Database performance with complex aggregations | High | Medium | Use materialized views, caching, database functions |
| Email delivery reliability | Medium | Medium | Use established email service (SendGrid/Postmark), implement retry logic |
| Complex RBAC implementation | High | High | Start with simple roles, iterate based on usage patterns |
| Multi-level dashboard performance | High | Medium | Implement pagination, lazy loading, background data aggregation |
| Invitation token security | High | Low | Use signed JWTs with expiration, store hashed tokens in DB |
| Data migration complexity | Medium | Medium | Thoroughly test migrations in staging, have rollback plan |

---

## Open Questions for Product Team

1. **Program Duration & Academic Years:**
   - How should we handle programs that span multiple academic years?
   - Should there be a concept of "program cohorts" or "program iterations"?

2. **Multi-Program Participation:**
   - Can a school participate in multiple programs simultaneously?
   - If yes, how do we handle potential conflicts in pedagogical approaches?

3. **Coordinator Limits:**
   - Should there be a limit of one coordinator per country per program?
   - Or can multiple coordinators manage different regions within a country?

4. **Project Approval:**
   - Should project ideas created by coordinators require partner approval before being visible to teachers?
   - What's the moderation process for coordinator-created content?

5. **Language Localization:**
   - Which languages should the platform support initially?
   - Should all program-related content be translatable?

6. **Data Retention:**
   - What's the data retention policy when a program ends?
   - Should program data be archived or deleted?

7. **Duplicate Institution Prevention:**
   - How do we prevent duplicate registrations of the same school across different programs?
   - Should there be a global school registry?

8. **Coordinator Role Transfer:**
   - What's the process for transferring coordinator responsibilities mid-program?
   - Should there be a handover period with dual coordinators?

---

## Success Metrics

**Technical Metrics:**
- Database query performance < 500ms for dashboard loads
- 99.9% uptime for core platform
- < 100ms API response time (p95)
- Zero security incidents

**Product Metrics:**
- 90% partner onboarding completion rate
- 80% coordinator onboarding completion rate
- 70% institution onboarding completion rate
- Average time to create program < 15 minutes
- Dashboard engagement > 3x per week per partner

**Business Metrics:**
- 50+ programs created in first 6 months
- 500+ institutions onboarded
- 2,000+ teachers participating
- 50,000+ students impacted
- 80% partner renewal rate

---

## Next Steps

1. **Review this implementation plan** with product, design, and engineering teams
2. **Prioritize features** - confirm MVP scope vs. nice-to-haves
3. **Answer open questions** - clarify ambiguous requirements
4. **Resource allocation** - assign engineers to specific phases
5. **Set up project tracking** - create Jira/Linear tickets from this plan
6. **Design review** - work with design team on UI mockups
7. **Technical spike** - prototype most complex features (dashboard aggregation, RBAC)
8. **Kickoff meeting** - align entire team on timeline and deliverables

---

**Document Status:** ✅ Ready for Review
**Next Review Date:** To be scheduled
**Reviewers:** Product Manager, Tech Lead, Design Lead, Partnership Team
