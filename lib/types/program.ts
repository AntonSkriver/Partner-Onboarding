// Program System Type Definitions for Class2Class
// These match the database schema documented in partner-program-implementation-plan.md
// For prototype: stored in localStorage, Production: PostgreSQL/Supabase

export interface Program {
  id: string;
  partnerId: string; // The partner who created this program
  displayTitle: string; // Marketing-friendly name (e.g. "Save the Children x LEGO: Build the Change")
  name: string;
  marketingTagline?: string;
  description: string;
  supportingPartnerId?: string; // Optional highlighted co-host or sponsor
  supportingPartnerRole?: 'co_host' | 'sponsor';

  // Program Configuration
  projectTypes: ProjectType[];
  pedagogicalFramework: PedagogicalFramework[];
  learningGoals: string;
  targetAgeRanges: AgeRange[];
  languages?: string[]; // ISO language codes (e.g., en, da)
  countriesInScope: string[]; // ISO country codes
  sdgFocus: number[]; // UN SDG numbers (1-17)
  crcFocus?: string[]; // UN CRC articles

  // Timeline
  startDate: string; // ISO date string
  endDate: string; // ISO date string

  // Program Details
  programUrl?: string;
  brandColor?: string; // Hex color for program branding
  logo?: string; // URL or base64
  heroImageUrl?: string; // Cover image for program cards

  // Status
  status: 'draft' | 'active' | 'completed' | 'archived';
  isPublic: boolean;

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string; // Partner user ID
}

export type ProjectType =
  | 'pen_pal_exchange'
  | 'collaborative_project'
  | 'virtual_classroom'
  | 'cultural_exchange'
  | 'explore_global_challenges'
  | 'create_solutions'
  | 'art_project'
  | 'language_learning'
  | 'environmental_action'
  | 'social_impact'
  | 'other';

export type PedagogicalFramework =
  | 'coil' // Collaborative Online International Learning
  | 'pbl' // Project-Based Learning
  | 'esd' // Education for Sustainable Development
  | 'design_thinking'
  | 'inquiry_based'
  | 'service_learning'
  | 'steam' // Science, Technology, Engineering, Arts, Mathematics
  | 'global_citizenship'
  | 'other';

export type AgeRange =
  | '3-5'   // Pre-school
  | '6-8'   // Early primary
  | '9-11'  // Upper primary
  | '12-14' // Lower secondary
  | '15-18' // Upper secondary
  | '18+';  // Higher education

// Co-Partner Relationship (many-to-many)
export interface ProgramPartner {
  id: string;
  programId: string;
  partnerId: string; // The co-partner organization ID

  // Role & Permissions
  role: CoPartnerRole;
  permissions: CoPartnerPermissions;

  // Invitation tracking
  invitedBy: string; // Partner user ID who sent invitation
  invitedAt: string;
  status: 'invited' | 'accepted' | 'declined' | 'removed';
  acceptedAt?: string;

  // Metadata
  createdAt: string;
  updatedAt: string;
}

export type CoPartnerRole =
  | 'host'      // Primary program owner (original creator)
  | 'co_host'   // Co-managing partner with full permissions
  | 'sponsor'   // Financial/resource sponsor
  | 'advisor'   // Advisory role
  | 'supporter'; // Supporting organization

export interface CoPartnerPermissions {
  canEditProgram: boolean;
  canInviteCoordinators: boolean;
  canViewAllData: boolean;
  canManageProjects: boolean;
  canRemoveParticipants: boolean;
}

// Country Coordinator
export interface CountryCoordinator {
  id: string;
  programId: string;
  userId: string; // Coordinator user ID
  country: string; // ISO country code
  region?: string; // Optional region/state

  // Contact Information
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;

  // Status
  status: 'invited' | 'active' | 'inactive';
  invitedBy: string; // Partner/co-partner user ID
  invitedAt: string;
  acceptedAt?: string;

  // Metadata
  createdAt: string;
  updatedAt: string;
}

// Educational Institution
export interface EducationalInstitution {
  id: string;
  programId: string;
  coordinatorId: string; // Who invited this institution

  // Institution Details
  name: string;
  type: InstitutionType;
  country: string;
  region?: string;
  city?: string;
  address?: string;

  // Contact Information
  contactEmail: string;
  contactPhone?: string;
  principalName?: string;
  principalEmail?: string;

  // Institution Profile
  studentCount: number;
  activeStudentCount?: number; // Students currently engaged in active projects
  studentAgeRange?: string; // e.g., "12-18" or "6-14"
  teacherCount?: number;
  educationLevels: EducationLevel[];
  languages: string[]; // ISO language codes

  // Status
  status: 'invited' | 'active' | 'inactive' | 'withdrawn';
  invitedAt: string;
  joinedAt?: string;

  // Metadata
  createdAt: string;
  updatedAt: string;
}

export type InstitutionType =
  | 'public_school'
  | 'private_school'
  | 'international_school'
  | 'primary_school'
  | 'secondary_school'
  | 'learning_center'
  | 'community_center'
  | 'library'
  | 'ngo_center'
  | 'other';

export type EducationLevel =
  | 'preschool'
  | 'primary'
  | 'secondary'
  | 'high_school'
  | 'vocational'
  | 'higher_education';

// Institution Teacher
export interface InstitutionTeacher {
  id: string;
  institutionId: string;
  programId: string;

  // Teacher Details
  email: string;
  firstName: string;
  lastName: string;
  subject?: string;
  gradeLevel?: string;
  yearsExperience?: number;

  // Status
  status: 'invited' | 'active' | 'inactive';
  invitedAt: string;
  acceptedAt?: string;

  // Metadata
  createdAt: string;
  updatedAt: string;
}

// Program Project (links projects to programs)
export interface ProgramProject {
  id: string;
  programId: string;
  projectId: string; // Reference to existing Project type
  title?: string;

  // Creator tracking
  createdByType: 'partner' | 'coordinator' | 'teacher';
  createdById: string;

  // Participants (teachers who joined but didn't create the project)
  participantIds?: string[];

  // Co-partner association (optional)
  associatedCoPartnerId?: string; // Links project to specific co-partner

  // Status
  status: 'draft' | 'active' | 'completed' | 'archived';
  coverImageUrl?: string;
  templateId?: string; // Template the classroom project originated from

  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface ProgramProjectTemplate {
  id: string;
  programId: string;
  title: string;
  summary: string;
  heroImageUrl?: string;
  estimatedDurationWeeks?: number;
  recommendedStartMonth?: string;
  subjectFocus: string[];
  sdgAlignment: number[];
  requiredMaterials?: string[];
  languageSupport: string[];
  projectType?: ProjectType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Invitation System (unified for all invitation types)
export interface ProgramInvitation {
  id: string;
  programId: string;

  // Invitation Details
  invitationType: 'co_partner' | 'coordinator' | 'institution' | 'teacher';
  recipientEmail: string;
  recipientName?: string;

  // Invitation Sender
  sentBy: string; // User ID of sender
  sentByType: 'partner' | 'coordinator';

  // Message
  customMessage?: string;
  metadata?: Record<string, unknown>;

  // Token & Security
  token: string; // Unique invitation token
  expiresAt: string;

  // Status Tracking
  status: 'pending' | 'viewed' | 'accepted' | 'declined' | 'expired' | 'cancelled';
  sentAt: string;
  viewedAt?: string;
  respondedAt?: string;

  // Co-partner specific fields
  proposedRole?: CoPartnerRole; // For co-partner invitations
  proposedPermissions?: CoPartnerPermissions;

  // Coordinator specific fields
  assignedCountry?: string; // For coordinator invitations
  assignedRegion?: string;

  // Metadata
  createdAt: string;
  updatedAt: string;
}

// Dashboard & Analytics Types
export interface ProgramDashboardData {
  program: Program;
  coPartners: {
    partner: Partner;
    programPartner: ProgramPartner;
  }[];
  stats: {
    totalCoordinators: number;
    totalInstitutions: number;
    totalTeachers: number;
    totalProjects: number;
    totalStudentsReached: number;
    activeCountries: string[];
  };
  recentActivity: ProgramActivity[];
}

export interface ProgramActivity {
  id: string;
  programId: string;
  type: 'co_partner_joined' | 'coordinator_joined' | 'institution_joined' | 'teacher_joined' | 'project_created';
  actorName: string;
  actorType: 'partner' | 'coordinator' | 'teacher';
  description: string;
  timestamp: string;
}

// Import Partner type for reference
import type { Partner } from './partner';
