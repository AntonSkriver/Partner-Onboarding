# Partner → Program → Project Relationship Diagram

**Quick Reference:** Understanding the multi-program, multi-project architecture

---

## Visual Hierarchy

```
╔════════════════════════════════════════════════════════════════════╗
║                    PARTNER ORGANIZATION                            ║
║                   (e.g., Save the Children)                        ║
╚════════════════════════════════════════════════════════════════════╝
                              │
                              │ can create multiple
                              ▼
        ┌─────────────────────┴─────────────────────┐
        │                                            │
╔═══════════════════════╗                 ╔═══════════════════════╗
║   PROGRAM 1           ║                 ║   PROGRAM 2           ║
║ "Climate Changemakers"║                 ║ "Global Citizenship"  ║
╚═══════════════════════╝                 ╚═══════════════════════╝
        │                                            │
        │ can invite multiple                       │
        ▼                                            ▼
┌───────────────────┐                      ┌───────────────────┐
│  CO-PARTNER 1     │                      │  CO-PARTNER 3     │
│  LEGO (co-host)   │                      │  Microsoft        │
└───────────────────┘                      │  (advisor)        │
┌───────────────────┐                      └───────────────────┘
│  CO-PARTNER 2     │
│  UNICEF (sponsor) │
└───────────────────┘
        │                                            │
        │ can have many                             │
        ▼                                            ▼
┌─────────────────────────────────┐    ┌─────────────────────────────────┐
│  PROJECT 1                      │    │  PROJECT 4                      │
│  "Water Conservation"           │    │  "Cultural Exchange DK-Kenya"   │
│  Associated with: LEGO          │    │  Associated with: Microsoft     │
└─────────────────────────────────┘    └─────────────────────────────────┘
┌─────────────────────────────────┐    ┌─────────────────────────────────┐
│  PROJECT 2                      │    │  PROJECT 5                      │
│  "Renewable Energy"             │    │  "Rights Workshop"              │
│  Associated with: None          │    │  Associated with: None          │
└─────────────────────────────────┘    └─────────────────────────────────┘
┌─────────────────────────────────┐    ┌─────────────────────────────────┐
│  PROJECT 3                      │    │  PROJECT 6                      │
│  "Plastic Reduction"            │    │  "Digital Citizenship Course"   │
│  Associated with: UNICEF        │    │  Associated with: None          │
└─────────────────────────────────┘    └─────────────────────────────────┘
```

---

## Key Relationships

### 1️⃣ Partner → Programs (1:N)
```
Save the Children
  ├─ Climate Changemakers 2025
  ├─ Global Citizenship Education
  └─ STEM Innovation Challenge
```
**Rule:** One partner can have MANY programs ✅

---

### 2️⃣ Program → Co-Partners (M:N)
```
Climate Changemakers 2025
  ├─ LEGO Foundation (co-host)
  ├─ UNICEF (sponsor)
  └─ Microsoft (advisor)

Global Citizenship Education
  └─ Microsoft (co-host)
```
**Rule:**
- One program can have MANY co-partners ✅
- One co-partner can be in MANY programs ✅
- Same co-partner can have different roles in different programs ✅

---

### 3️⃣ Program → Projects (1:N)
```
Climate Changemakers 2025
  ├─ Water Conservation Challenge
  ├─ Renewable Energy Exploration
  ├─ Plastic Reduction Campaign
  ├─ Climate Policy Debate
  └─ ... (15 total projects)
```
**Rule:** One program can have MANY projects ✅

---

### 4️⃣ Project → Co-Partner Association (N:1 optional)
```
Water Conservation Challenge
  └─ Associated with: LEGO ✅

Renewable Energy Exploration
  └─ Associated with: None ✅

Plastic Reduction Campaign
  └─ Associated with: UNICEF ✅
```
**Rule:**
- A project can be associated with ONE co-partner OR none ✅
- A project CANNOT be associated with multiple co-partners ❌
- A project CANNOT belong to multiple programs ❌

---

## Real-World Scenario

### Scenario: Save the Children's Multi-Program Strategy

**Context:**
- Save the Children (StC) runs TWO programs simultaneously
- Program 1 partners with LEGO and UNICEF
- Program 2 partners with Microsoft
- Each program has multiple projects
- Some projects specifically tied to co-partners

---

### Program 1: Climate Changemakers 2025

**Host Partner:** Save the Children
**Co-Partners:**
- LEGO Foundation (Co-Host) - Full program management access
- UNICEF (Sponsor) - Financial support, view-only access

**Projects (15 total):**

1. **Water Conservation Challenge** 🔵
   - Associated with: LEGO
   - Created by: Coordinator (Kenya)
   - LEGO provides funding and STEM resources
   - Dashboard: Shows up in LEGO's "My Projects"

2. **Renewable Energy Exploration** ⚪
   - Associated with: None (general program project)
   - Created by: Teacher (Denmark)
   - Uses general program budget
   - Dashboard: Shows up in "All Program Projects"

3. **Plastic Reduction Campaign** 🟡
   - Associated with: UNICEF
   - Created by: Coordinator (India)
   - UNICEF provides policy guidance
   - Dashboard: Shows up in UNICEF's "Sponsored Projects"

4. **Build Your Own Wind Turbine** 🔵
   - Associated with: LEGO
   - Created by: Teacher (Netherlands)
   - Uses LEGO education kits
   - Dashboard: Shows up in LEGO's "My Projects"

5. **Climate Policy Youth Debate** ⚪
   - Associated with: None
   - Created by: Teacher (USA)
   - General program project

... (10 more projects)

---

### Program 2: Global Citizenship Education

**Host Partner:** Save the Children
**Co-Partners:**
- Microsoft (Co-Host) - Technology partner, full access

**Projects (8 total):**

1. **Cultural Exchange Denmark-Kenya** 🟢
   - Associated with: Microsoft
   - Created by: Coordinator (Denmark)
   - Microsoft provides Teams licenses for virtual exchange
   - Dashboard: Shows up in Microsoft's "Partnerships"

2. **Rights & Responsibilities Workshop** ⚪
   - Associated with: None
   - Created by: Teacher (Kenya)
   - General program project

3. **Digital Citizenship Online Course** 🟢
   - Associated with: Microsoft
   - Created by: Partner (StC staff)
   - Microsoft provides course platform

... (5 more projects)

---

## Dashboard Views

### View 1: Save the Children (Host Partner)

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                 SAVE THE CHILDREN - PARTNER DASHBOARD           ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

MY PROGRAMS (2)

┌────────────────────────────────────────────────────────────────┐
│ 🌍 Climate Changemakers 2025                      [View Details]│
│                                                                  │
│ Co-Partners: LEGO Foundation (co-host), UNICEF (sponsor)        │
│ Status: Active                                                   │
│ Timeline: Jan 2025 - Dec 2025                                   │
│                                                                  │
│ Projects: 15 total                                               │
│   ├─ 3 projects with LEGO                                       │
│   ├─ 2 projects with UNICEF                                     │
│   └─ 10 general projects                                        │
│                                                                  │
│ Reach: 50 schools · 200 teachers · 5,000 students              │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ 🌐 Global Citizenship Education                   [View Details]│
│                                                                  │
│ Co-Partners: Microsoft (co-host)                                │
│ Status: Active                                                   │
│ Timeline: Sep 2025 - Jun 2026                                   │
│                                                                  │
│ Projects: 8 total                                                │
│   ├─ 5 projects with Microsoft                                  │
│   └─ 3 general projects                                         │
│                                                                  │
│ Reach: 30 schools · 120 teachers · 2,400 students              │
└────────────────────────────────────────────────────────────────┘
```

---

### View 2: LEGO Foundation (Co-Partner)

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                  LEGO FOUNDATION - CO-PARTNER DASHBOARD         ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

MY PROGRAM PARTNERSHIPS (2)

┌────────────────────────────────────────────────────────────────┐
│ 🌍 Climate Changemakers 2025                      [View Details]│
│ with Save the Children                                          │
│                                                                  │
│ My Role: Co-Host                                                │
│ Permissions: Full program access, can invite, can edit          │
│                                                                  │
│ My Associated Projects: 3                                        │
│   ├─ Water Conservation Challenge                               │
│   ├─ Build Your Own Wind Turbine                                │
│   └─ LEGO Renewable Energy Kit Challenge                        │
│                                                                  │
│ All Program Projects: 15 (can view all)                         │
│ My Contribution: STEM resources, education kits, funding        │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ 🔬 STEM Innovation Challenge                      [View Details]│
│ with World Vision                                               │
│                                                                  │
│ My Role: Sponsor                                                │
│ Permissions: View-only, can comment                             │
│                                                                  │
│ My Associated Projects: 2                                        │
│   ├─ Robotics Bootcamp                                          │
│   └─ Coding for Kids                                            │
│                                                                  │
│ All Program Projects: 20 (view-only)                            │
│ My Contribution: Financial sponsorship, product donations       │
└────────────────────────────────────────────────────────────────┘
```

---

## Database Queries Cheat Sheet

### Get all programs for a partner
```sql
-- As host partner
SELECT * FROM programs
WHERE partner_id = 'save-the-children-id';

-- As co-partner
SELECT prog.*, pp.role
FROM programs prog
JOIN program_partners pp ON pp.program_id = prog.id
WHERE pp.partner_id = 'lego-foundation-id'
  AND pp.status = 'joined';
```

### Get all co-partners for a program
```sql
SELECT p.*, pp.role, pp.status
FROM program_partners pp
JOIN partners p ON p.id = pp.partner_id
WHERE pp.program_id = 'climate-changemakers-id';
```

### Get all projects in a program
```sql
SELECT proj.*, pp.associated_co_partner_id
FROM program_projects pp
JOIN projects proj ON proj.id = pp.project_id
WHERE pp.program_id = 'climate-changemakers-id';
```

### Get projects associated with specific co-partner
```sql
SELECT proj.*
FROM program_projects pp
JOIN projects proj ON proj.id = pp.project_id
JOIN program_partners co ON co.id = pp.associated_co_partner_id
WHERE pp.program_id = 'climate-changemakers-id'
  AND co.partner_id = 'lego-foundation-id';
```

### Check if partner can access a program
```sql
-- Returns true if partner is host OR co-partner
SELECT EXISTS (
  SELECT 1 FROM programs WHERE id = ? AND partner_id = ?
  UNION
  SELECT 1 FROM program_partners
  WHERE program_id = ? AND partner_id = ? AND status = 'joined'
);
```

---

## Business Rules Summary

| Rule | Allowed | Example |
|------|---------|---------|
| Partner creates multiple programs | ✅ Yes | StC has "Climate" + "Citizenship" programs |
| Program has multiple co-partners | ✅ Yes | "Climate" has LEGO + UNICEF |
| Co-partner in multiple programs | ✅ Yes | LEGO in "Climate" + "STEM" programs |
| Project belongs to multiple programs | ❌ No | Must pick ONE program |
| Project associated with multiple co-partners | ❌ No | Can be associated with ONE or none |
| Same org as co-partner twice in same program | ❌ No | LEGO can't be invited twice to "Climate" |
| Co-partner has different roles in different programs | ✅ Yes | LEGO is co-host in one, sponsor in another |

---

## UI Components Needed

### Partner Dashboard
- [ ] Program list (my programs + co-partnerships)
- [ ] Program selector dropdown
- [ ] Co-partner invitation modal
- [ ] Project filter by co-partner

### Program Page
- [ ] Co-partners section (list with roles)
- [ ] "Invite Co-Partner" button
- [ ] Projects tab with co-partner association badges

### Project Creation
- [ ] "Link to Program" dropdown (if user in any program)
- [ ] "Associate with Co-Partner" dropdown (conditional, shows program's co-partners)

### Co-Partner Dashboard
- [ ] "My Partnerships" view
- [ ] Filter: "My Associated Projects" vs "All Program Projects"
- [ ] Role badge display

---

**Last Updated:** October 7, 2025
**Related Docs:**
- `partner-program-implementation-plan.md` (Section 1.1.1)
- Database schema (Section 1.1)
