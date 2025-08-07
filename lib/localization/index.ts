// Localization system for Class2Class Partner Module
// Supporting English (default) and Danish

export type Language = 'en' | 'da'
export type TranslationKey = keyof typeof translations.en

const translations = {
  en: {
    // Common
    'common.loading': 'Loading...',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.continue': 'Continue',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.submit': 'Submit',
    'common.optional': 'optional',
    'common.required': 'required',
    'common.yes': 'Yes',
    'common.no': 'No',
    
    // Navigation
    'nav.partners': 'Partners',
    'nav.dashboard': 'Dashboard',
    'nav.login': 'Log in',
    'nav.signup': 'Sign up',
    
    // Partner Landing Page
    'landing.hero.title': 'Partner with Us to Transform Global Education',
    'landing.hero.subtitle': 'Connect your organization with classrooms worldwide. Share your mission, create collaborative projects, and make a lasting impact on global education.',
    'landing.hero.cta': 'Start Your Partnership',
    'landing.hero.learn_more': 'Learn More',
    
    // Partner Dashboard
    'dashboard.welcome': 'Hi, {name}',
    'dashboard.welcome_message': 'Welcome to your {type} partner dashboard',
    'dashboard.metrics.schools': 'Schools',
    'dashboard.metrics.teachers': 'Teachers',
    'dashboard.metrics.students': 'Students',
    'dashboard.metrics.countries': 'Countries',
    'dashboard.metrics.projects': 'Projects',
    
    // Onboarding
    'onboarding.title': 'Complete your setup',
    'onboarding.step_of': 'Step {current} of {total}',
    'onboarding.org_type.title': 'What kind of organization are you?',
    'onboarding.org_type.ngo': 'NGO',
    'onboarding.org_type.government': 'Government Agency',
    'onboarding.org_type.school_network': 'School Network',
    'onboarding.org_type.commercial': 'Commercial Partner',
    
    'onboarding.org_name.title': 'Tell us about your organization',
    'onboarding.org_name.subtitle': 'Enter your organization name and website to get started. We\'ll help prefill some information for you.',
    'onboarding.org_name.label': 'Organization Name',
    'onboarding.org_website.label': 'Organization Website',
    'onboarding.ai_prefill.button': 'Auto-fill organization details with AI',
    'onboarding.ai_prefill.loading': 'Looking up your organization...',
    'onboarding.ai_prefill.found': 'AI Found Information',
    
    // SDG Selection
    'sdg.title': 'Which UN SDGs do you focus on?',
    'sdg.subtitle': 'Select SDGs that align with your work. This helps schools understand your focus.',
    'sdg.selected': 'Selected: {count} {count, plural, one {goal} other {goals}}',
    'sdg.minimum_required': 'minimum 1 required',
    
    // School Invitations
    'schools.invite.title': 'Invite Schools',
    'schools.invite.subtitle': 'Connect with schools to expand your partnership network',
    'schools.invite.rights_schools': 'Rights Schools Network (Denmark)',
    'schools.invite.rights_schools_desc': 'Quick-add schools from the UNICEF Rights Schools network in Denmark',
    'schools.invite.manual_title': 'Add Schools Manually',
    'schools.invite.school_name': 'School Name',
    'schools.invite.country': 'Country',
    'schools.invite.contact_email': 'Contact Email',
    'schools.invite.contact_name': 'Contact Person',
    'schools.invite.custom_message': 'Custom Invitation Message',
    'schools.invite.send': 'Send Invitations',
    'schools.invite.success': 'Invitations Sent!',
    
    // Content Upload
    'content.upload.title': 'Upload Educational Content',
    'content.upload.subtitle': 'Share your resources with partner schools',
    'content.upload.resource_info': 'Resource Information',
    'content.upload.resource_title': 'Resource Title',
    'content.upload.resource_type': 'Resource Type',
    'content.upload.description': 'Description',
    'content.upload.language': 'Language',
    'content.upload.target_audience': 'Target Audience',
    'content.upload.sdg_alignment': 'SDG Alignment',
    'content.upload.upload_resource': 'Upload Resource',
    'content.upload.success': 'Resource Uploaded!',
    
    // Project Creation
    'projects.create.title': 'Create Collaborative Project',
    'projects.create.subtitle': 'Design a project that connects classrooms worldwide',
    'projects.create.project_type': 'Project Type',
    'projects.create.host_project': 'Host a Project',
    'projects.create.create_template': 'Create Template',
    'projects.create.project_info': 'Project Information',
    'projects.create.project_title': 'Project Title',
    'projects.create.project_description': 'Project Description',
    'projects.create.learning_objectives': 'Learning Objectives',
    'projects.create.target_audience': 'Target Audience',
    'projects.create.duration': 'Project Duration',
    'projects.create.max_schools': 'Maximum Number of Schools',
    'projects.create.project_languages': 'Project Languages',
    'projects.create.launch_project': 'Launch Project',
    'projects.create.publish_template': 'Publish Template',
    'projects.create.success': 'Project Created!',
    
    // Login
    'login.title': 'Partner Login',
    'login.subtitle': 'Access your organization\'s dashboard and manage your partnerships',
    'login.email': 'Email Address',
    'login.password': 'Password',
    'login.signin': 'Sign in to Dashboard',
    'login.forgot_password': 'Forgot your password?',
    'login.no_account': 'Don\'t have a partner account?',
    'login.start_partnership': 'Start Your Partnership',
    'login.main_login': 'Go to Main Login',
  },
  
  da: {
    // Common
    'common.loading': 'Indlæser...',
    'common.cancel': 'Annuller',
    'common.save': 'Gem',
    'common.continue': 'Fortsæt',
    'common.back': 'Tilbage',
    'common.next': 'Næste',
    'common.submit': 'Indsend',
    'common.optional': 'valgfri',
    'common.required': 'påkrævet',
    'common.yes': 'Ja',
    'common.no': 'Nej',
    
    // Navigation
    'nav.partners': 'Partnere',
    'nav.dashboard': 'Dashboard',
    'nav.login': 'Log ind',
    'nav.signup': 'Tilmeld dig',
    
    // Partner Landing Page
    'landing.hero.title': 'Bliv partner med os for at transformere global uddannelse',
    'landing.hero.subtitle': 'Forbind din organisation med klasseværelser verden over. Del din mission, skab samarbejdsprojekter og gør en varig forskel for global uddannelse.',
    'landing.hero.cta': 'Start dit partnerskab',
    'landing.hero.learn_more': 'Lær mere',
    
    // Partner Dashboard
    'dashboard.welcome': 'Hej, {name}',
    'dashboard.welcome_message': 'Velkommen til dit {type} partner dashboard',
    'dashboard.metrics.schools': 'Skoler',
    'dashboard.metrics.teachers': 'Lærere',
    'dashboard.metrics.students': 'Elever',
    'dashboard.metrics.countries': 'Lande',
    'dashboard.metrics.projects': 'Projekter',
    
    // Onboarding
    'onboarding.title': 'Fuldfør din opsætning',
    'onboarding.step_of': 'Trin {current} af {total}',
    'onboarding.org_type.title': 'Hvad slags organisation er I?',
    'onboarding.org_type.ngo': 'NGO',
    'onboarding.org_type.government': 'Statslig organisation',
    'onboarding.org_type.school_network': 'Skolenetværk',
    'onboarding.org_type.commercial': 'Kommerciel partner',
    
    'onboarding.org_name.title': 'Fortæl os om jeres organisation',
    'onboarding.org_name.subtitle': 'Indtast jeres organisationsnavn og hjemmeside for at komme i gang. Vi hjælper med at udfylde nogle oplysninger for jer.',
    'onboarding.org_name.label': 'Organisationsnavn',
    'onboarding.org_website.label': 'Organisations hjemmeside',
    'onboarding.ai_prefill.button': 'Autoudfyld organisationsdetaljer med AI',
    'onboarding.ai_prefill.loading': 'Søger efter jeres organisation...',
    'onboarding.ai_prefill.found': 'AI fandt information',
    
    // SDG Selection
    'sdg.title': 'Hvilke FN verdensmål fokuserer I på?',
    'sdg.subtitle': 'Vælg verdensmål der passer til jeres arbejde. Dette hjælper skoler med at forstå jeres fokus.',
    'sdg.selected': 'Valgt: {count} {count, plural, one {mål} other {mål}}',
    'sdg.minimum_required': 'minimum 1 påkrævet',
    
    // School Invitations
    'schools.invite.title': 'Inviter skoler',
    'schools.invite.subtitle': 'Forbind med skoler for at udvide dit partnernetværk',
    'schools.invite.rights_schools': 'Rettighedsskolenetværk (Danmark)',
    'schools.invite.rights_schools_desc': 'Hurtig tilføjelse af skoler fra UNICEF Rettighedsskolenetværket i Danmark',
    'schools.invite.manual_title': 'Tilføj skoler manuelt',
    'schools.invite.school_name': 'Skolenavn',
    'schools.invite.country': 'Land',
    'schools.invite.contact_email': 'Kontakt email',
    'schools.invite.contact_name': 'Kontaktperson',
    'schools.invite.custom_message': 'Brugerdefineret invitationsbesked',
    'schools.invite.send': 'Send invitationer',
    'schools.invite.success': 'Invitationer sendt!',
    
    // Content Upload
    'content.upload.title': 'Upload uddannelsesindhold',
    'content.upload.subtitle': 'Del jeres ressourcer med partnerskoler',
    'content.upload.resource_info': 'Ressourceinformation',
    'content.upload.resource_title': 'Ressourcetitel',
    'content.upload.resource_type': 'Ressourcetype',
    'content.upload.description': 'Beskrivelse',
    'content.upload.language': 'Sprog',
    'content.upload.target_audience': 'Målgruppe',
    'content.upload.sdg_alignment': 'Verdensmål tilknytning',
    'content.upload.upload_resource': 'Upload ressource',
    'content.upload.success': 'Ressource uploadet!',
    
    // Project Creation
    'projects.create.title': 'Opret samarbejdsprojekt',
    'projects.create.subtitle': 'Design et projekt der forbinder klasseværelser verden over',
    'projects.create.project_type': 'Projekttype',
    'projects.create.host_project': 'Vært for projekt',
    'projects.create.create_template': 'Opret skabelon',
    'projects.create.project_info': 'Projektinformation',
    'projects.create.project_title': 'Projekttitel',
    'projects.create.project_description': 'Projektbeskrivelse',
    'projects.create.learning_objectives': 'Læringsmål',
    'projects.create.target_audience': 'Målgruppe',
    'projects.create.duration': 'Projektvarighed',
    'projects.create.max_schools': 'Maksimalt antal skoler',
    'projects.create.project_languages': 'Projektsprog',
    'projects.create.launch_project': 'Start projekt',
    'projects.create.publish_template': 'Udgiv skabelon',
    'projects.create.success': 'Projekt oprettet!',
    
    // Login
    'login.title': 'Partner login',
    'login.subtitle': 'Få adgang til jeres organisations dashboard og håndter jeres partnerskaber',
    'login.email': 'Email adresse',
    'login.password': 'Adgangskode',
    'login.signin': 'Log ind på dashboard',
    'login.forgot_password': 'Glemt din adgangskode?',
    'login.no_account': 'Har I ikke en partnerkonto?',
    'login.start_partnership': 'Start jeres partnerskab',
    'login.main_login': 'Gå til hovedlogin',
  }
}

// Simple interpolation function for placeholders like {name}, {count}
export function interpolate(text: string, params: Record<string, any> = {}): string {
  return text.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key]?.toString() || match
  })
}

// Simple plural handling for {count, plural, one {...} other {...}}
export function handlePlural(text: string, params: Record<string, any> = {}): string {
  return text.replace(/\{(\w+),\s*plural,\s*one\s*\{([^}]+)\}\s*other\s*\{([^}]+)\}\}/g, 
    (match, key, oneForm, otherForm) => {
      const count = params[key]
      return count === 1 ? oneForm : otherForm
    }
  )
}

// Main translation function
export function t(key: TranslationKey, params: Record<string, any> = {}, language: Language = 'en'): string {
  const translation = translations[language][key] || translations.en[key] || key
  let result = interpolate(translation, params)
  result = handlePlural(result, params)
  return result
}

// Language context and hooks for React components
import { createContext, useContext } from 'react'

export const LanguageContext = createContext<{
  language: Language
  setLanguage: (lang: Language) => void
}>({
  language: 'en',
  setLanguage: () => {}
})

export const useTranslation = () => {
  const { language } = useContext(LanguageContext)
  return {
    t: (key: TranslationKey, params?: Record<string, any>) => t(key, params, language),
    language
  }
}

// Language detection utility
export function detectLanguage(): Language {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('class2class-language')
    if (saved === 'da' || saved === 'en') return saved
    
    const browserLang = navigator.language.split('-')[0]
    if (browserLang === 'da') return 'da'
  }
  return 'en'
}

// Save language preference
export function saveLanguage(language: Language) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('class2class-language', language)
  }
}

export default translations