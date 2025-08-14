# Partner Onboarding Meeting Summary

## Meeting Context
This meeting summary documents the requirements and decisions made for implementing partner onboarding functionality in the Class2Class platform.

## Key Decisions

### 1. Partner Onboarding Experience
- **Transfer teacher onboarding quality**: Apply the same sophisticated, Hinge-style onboarding experience that works well for teachers to partner and school registration
- **One question per step approach**: Follow the progressive disclosure pattern established in the teacher onboarding
- **Professional visual design**: Maintain the high-quality UI/UX standards from the existing teacher flow

### 2. Partner Types & Categories
Partners should be categorized into distinct organizational types:
- **NGOs**: Non-governmental organizations (UNICEF, Save the Children, Oxfam)
- **Government Agencies**: Ministries of Education, Health Departments
- **School Networks/Districts**: Groups of schools or educational districts
- **Corporate Partners**: Companies with educational CSR initiatives (LEGO Education, Microsoft Education)
- **Other Organizations**: Foundations, Research Institutes

### 3. UN Sustainable Development Goals (SDG) Integration
- **Critical requirement**: SDG selection is essential for partner projects
- **All 17 SDGs**: Partners must be able to select from the complete set of UN SDGs
- **Visual representation**: Use official SDG colors and numbering
- **Filtering capability**: Schools should be able to filter partners by SDG focus areas

### 4. Required Information Collection

#### Step 1: Organization Type Selection
- Clear categorization with examples
- Visual icons and descriptions
- Radio button selection interface

#### Step 2: Organization Details
- Organization name (required)
- Official website URL
- Form validation with real-time feedback

#### Step 3: Mission Statement & SDG Focus
- Multi-line mission statement (minimum 50 characters)
- SDG selection interface with visual SDG badges
- Ability to select multiple SDGs
- Character count and validation

#### Step 4: Contact Information
- Primary contact name (required)
- Professional email address (required)
- Contact role/position selection
- Optional phone number
- Privacy notice about information sharing

### 5. Technical Implementation Requirements

#### User Experience
- **Progressive disclosure**: One focused question per step
- **Clear navigation**: Progress indicator with step names
- **Form persistence**: Maintain data across steps using React Context
- **Validation feedback**: Real-time error messages and guidance
- **Mobile responsive**: Work across all device sizes

#### Integration Points
- **Dashboard integration**: Link completion to partner dashboard
- **Connect system**: Direct integration with school connection interface
- **Profile creation**: Generate partner profile from onboarding data

### 6. Post-Onboarding Flow
- **Completion screen**: Welcome message with next steps
- **Call-to-action buttons**: 
  - Primary: "Go to Partner Dashboard"
  - Secondary: "Start Connecting with Schools"
- **Feature preview**: Brief overview of platform capabilities
- **Support information**: Contact details for assistance

## Reference Implementation
The sophisticated teacher onboarding found in the `class2class-onboarding` folder serves as the reference implementation for quality and user experience standards.

## Success Metrics
- Reduced onboarding abandonment rates
- Increased partner profile completion
- Higher quality partner-school connections
- Improved SDG-based project matching

## File Access & Development Notes
- Implementation files: `/components/onboarding/`
- Context management: `/contexts/partner-form-context.tsx`
- Main flow: `/app/partner/onboarding/page.tsx`
- Integration points: Connect page, Partner dashboard

---
*This document serves as the authoritative source for partner onboarding requirements and should be updated as features evolve.*