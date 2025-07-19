// Partner System Type Definitions for Class2Class

export interface Partner {
  id: string;
  organizationName: string;
  organizationType: 'ngo' | 'government' | 'school_network' | 'commercial' | 'other';
  logo?: string;
  description: string;
  mission: string;
  website?: string;
  contactEmail: string;
  contactPhone?: string;
  country: string;
  languages: string[];
  sdgFocus: string[]; // UN Sustainable Development Goals focus areas
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  verificationStatus: 'pending' | 'verified' | 'rejected';
}

export interface PartnerUser {
  id: string;
  partnerId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'coordinator' | 'collaborator';
  hasAcceptedTerms: boolean;
  twoFactorEnabled: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
  isActive: boolean;
}

export interface Project {
  id: string;
  partnerId: string;
  title: string;
  description: string;
  language: string;
  country?: string;
  targetAudience: 'primary' | 'secondary' | 'both';
  sdgAlignment: string[];
  images: string[];
  videos: string[];
  documents: string[];
  faqs: FAQ[];
  isPublic: boolean;
  maxParticipatingSchools?: number;
  startDate?: Date;
  endDate?: Date;
  status: 'draft' | 'active' | 'completed' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

export interface FAQ {
  question: string;
  answer: string;
  order: number;
}

export interface School {
  id: string;
  name: string;
  country: string;
  region?: string;
  studentCount: number;
  educationLevels: ('primary' | 'secondary')[];
  languages: string[];
  contactEmail: string;
  principalName?: string;
  coordinatorName?: string;
  focusAreas: string[];
  createdAt: Date;
  isActive: boolean;
}

export interface SchoolPartnership {
  id: string;
  schoolId: string;
  partnerId: string;
  projectId?: string;
  status: 'invited' | 'joined' | 'active' | 'completed' | 'withdrawn';
  invitedAt: Date;
  joinedAt?: Date;
  completedAt?: Date;
}

export interface Teacher {
  id: string;
  schoolId: string;
  email: string;
  firstName: string;
  lastName: string;
  subject?: string;
  yearsExperience: number;
  role: 'teacher' | 'coordinator' | 'power_user';
  participatingProjects: string[];
  createdAt: Date;
  isActive: boolean;
}

export interface ProjectMetrics {
  projectId: string;
  participatingSchools: number;
  participatingTeachers: number;
  participatingStudents: number;
  completionRate: number;
  averageEngagementScore: number;
  npsScore?: number;
  feedbackCount: number;
  lastUpdated: Date;
}

export interface Feedback {
  id: string;
  projectId: string;
  schoolId: string;
  teacherId?: string;
  type: 'teacher' | 'student' | 'school_admin';
  rating: number; // 1-5 scale
  npsScore?: number; // 0-10 scale
  comments?: string;
  whatWorkedWell?: string;
  whatCouldImprove?: string;
  wouldRecommend: boolean;
  createdAt: Date;
}

export interface Invitation {
  id: string;
  partnerId: string;
  projectId?: string;
  recipientEmail: string;
  recipientType: 'school' | 'teacher';
  message?: string;
  status: 'sent' | 'viewed' | 'accepted' | 'declined' | 'expired';
  sentAt: Date;
  viewedAt?: Date;
  respondedAt?: Date;
  expiresAt: Date;
}

// Dashboard Analytics Types
export interface PartnerDashboardData {
  partner: Partner;
  totalProjects: number;
  activeProjects: number;
  totalSchools: number;
  totalTeachers: number;
  totalStudents: number;
  recentFeedback: Feedback[];
  projectMetrics: ProjectMetrics[];
  recentInvitations: Invitation[];
}

export interface ProjectAnalytics {
  project: Project;
  metrics: ProjectMetrics;
  participatingSchools: School[];
  feedback: Feedback[];
  engagementTrends: {
    date: Date;
    activeTeachers: number;
    activeStudents: number;
    completedActivities: number;
  }[];
}

// Onboarding Flow Types
export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: string;
  isRequired: boolean;
  order: number;
  isCompleted: boolean;
}

export interface PartnerOnboardingData {
  organizationName?: string;
  organizationType?: Partner['organizationType'];
  description?: string;
  mission?: string;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  country?: string;
  languages?: string[];
  sdgFocus?: string[];
  logo?: File;
  firstProject?: Partial<Project>;
  currentStep: number;
  completedSteps: string[];
}

// Content Generation Types
export interface ContentTemplate {
  id: string;
  partnerId: string;
  type: 'lesson_plan' | 'project_description' | 'discussion_activity' | 'assessment';
  title: string;
  description: string;
  content: string;
  language: string;
  sdgAlignment: string[];
  targetAudience: string[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MarketingContent {
  id: string;
  partnerId: string;
  projectId?: string;
  type: 'email' | 'blog_post' | 'social_media' | 'newsletter';
  title: string;
  content: string;
  targetAudience: 'parents' | 'teachers' | 'schools' | 'community';
  generatedAt: Date;
  isUsed: boolean;
}