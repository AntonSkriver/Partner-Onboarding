"use client"

import { useProfileForm, type ProfileFormData } from "../context/profile-form-context"
import Image from "next/image"
import { Users, School } from "lucide-react"

// Helper function to get full language name
const getLanguageName = (code: string) => {
  const languages: Record<string, string> = {
    en: "English",
    es: "Spanish",
    fr: "French",
    de: "German",
    pt: "Portuguese",
    it: "Italian",
    zh: "Chinese",
    ja: "Japanese",
    ar: "Arabic",
    hi: "Hindi",
    ru: "Russian",
    ko: "Korean",
    nl: "Dutch",
    tr: "Turkish",
    pl: "Polish",
    sv: "Swedish",
    da: "Danish",
    fi: "Finnish",
    no: "Norwegian",
    el: "Greek",
    cs: "Czech",
    hu: "Hungarian",
    ro: "Romanian",
    th: "Thai",
    id: "Indonesian",
    ms: "Malay",
    vi: "Vietnamese",
    uk: "Ukrainian",
    he: "Hebrew",
    bn: "Bengali",
  }
  return languages[code] || code
}

// Helper function to get full grade name
const getGradeName = (code: string) => {
  const grades: Record<string, string> = {
    early_childhood: "Early Childhood (Ages 3-5)",
    elementary: "Elementary (Grades 1-5)",
    middle_school: "Middle School (Grades 6-8)",
    high_school: "High School (Grades 9-12)",
    higher_education: "Higher Education",
  }
  return grades[code] || code
}

// Helper function to get role label
const getRoleLabel = (role: string | null) => {
  switch (role) {
    case "teacher":
      return "Teacher"
    case "coordinator":
      return "Coordinator"
    case "headmaster":
      return "Headmaster"
    default:
      return ""
  }
}

// Helper function to get grade labels
const getGradeLabels = (grades: string[]) => {
  const gradeMap: Record<string, string> = {
    early_childhood: "Early Childhood",
    elementary: "Elementary",
    middle_school: "Middle School",
    high_school: "High School",
    higher_education: "Higher Education",
  }

  return grades.map((grade) => gradeMap[grade] || grade).join(", ")
}

// Helper function to get subject labels
const getSubjectLabels = (subjects: string[]) => {
  const subjectMap: Record<string, string> = {
    science: "Science",
    math: "Mathematics",
    arts: "Arts",
    language_arts: "English/Language Arts",
    social_studies: "Social Studies/History",
    physical_education: "Physical Education",
    technology: "Technology/Computer Science",
    foreign_languages: "Foreign Languages",
    other: "Other",
  }

  return subjects.map((subject) => subjectMap[subject] || subject).join(", ")
}

// Helper function to get interest labels
const getInterestLabels = (interests: string[]) => {
  const interestMap: Record<string, string> = {
    explore_cultures: "Explore cultures",
    explore_global_challenges: "Explore global challenges",
    create_solutions: "Create solutions",
    professional_development: "Professional development",
    other: "Other",
  }

  return interests.map((interest) => interestMap[interest] || interest).join(", ")
}

// Generate "About Me" text
const generateAboutMe = (formData: ProfileFormData) => {
  if (formData.aboutMe) {
    return formData.aboutMe
  }

  let aboutMe = ""

  // Add role information if available
  if (formData.role) {
    aboutMe += `I am a ${getRoleLabel(formData.role).toLowerCase()}`
  }

  // Add school information if available
  if (formData.schoolName) {
    if (aboutMe) aboutMe += " at "
    aboutMe += formData.schoolName
    
    // Add location if available
    if (formData.location?.city && formData.location?.region && formData.location?.country) {
      aboutMe += ` in ${formData.location.city}, ${formData.location.region}, ${formData.location.country}`
    }
  }

  // Add grades information if available
  if (formData.grades && formData.grades.length > 0) {
    if (aboutMe) aboutMe += ". I work with "
    else aboutMe += "I work with "
    aboutMe += `${getGradeLabels(formData.grades).toLowerCase()} students`
  }

  // Add subjects information if available
  if (formData.subjects && formData.subjects.length > 0) {
    if (formData.grades && formData.grades.length > 0) {
      aboutMe += `, teaching ${getSubjectLabels(formData.subjects)}`
    } else if (aboutMe) {
      aboutMe += `. I teach ${getSubjectLabels(formData.subjects)}`
    } else {
      aboutMe += `I teach ${getSubjectLabels(formData.subjects)}`
    }
  }

  // Add interests information if available
  if (formData.interests && formData.interests.length > 0) {
    if (aboutMe) aboutMe += ". "
    aboutMe += `I'm interested in ${getInterestLabels(formData.interests).toLowerCase()} through global education collaboration`
  }

  // Add period at the end if there's content
  if (aboutMe) aboutMe += "."

  return aboutMe
}

export function ProfilePreview() {
  const { formData } = useProfileForm()
  const aboutMeText = generateAboutMe(formData);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-xl px-3 py-4 shadow-sm mx-2 w-full max-w-[500px] relative">
        <div className="flex flex-col items-center">
          {/* Profile Photo */}
          <div className="relative w-16 h-16 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-gray-100 mb-3">
            <Image
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&h=256&auto=format&fit=crop"
              alt="Profile photo"
              width={96}
              height={96}
              className="object-cover"
              priority
            />
          </div>

          <div className="flex flex-col items-center space-y-1">
            {/* Name */}
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              Giancarlo Mena
            </h2>

            {/* Role and School Information */}
            <div className="flex flex-col items-center gap-1 text-xs sm:text-sm text-gray-700">
              {formData.role && (
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  <span className="capitalize">{getRoleLabel(formData.role)}</span>
                </div>
              )}
              {formData.schoolName && (
                <div className="flex items-center gap-1">
                  <School className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  <span className="text-center">{formData.schoolName}</span>
                </div>
              )}
            </div>

            {/* Basic Info Tags */}
            <div className="flex flex-wrap gap-1 justify-center">
              {/* Country Tag */}
              <div className="flex items-center gap-1 bg-[#F4EDFF] text-[#8157D9] px-2 py-0.5 rounded-full text-xs">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full overflow-hidden flex items-center justify-center">
                  <Image
                    src="https://flagcdn.com/w20/pe.png"
                    alt="Peru flag"
                    width={16}
                    height={16}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-medium">Peru</span>
              </div>

              {/* Age Range Tag */}
              <div className="flex items-center gap-1 bg-[#F4EDFF] text-[#8157D9] px-2 py-0.5 rounded-full text-xs">
                <Users className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span className="font-medium">13-17 years old</span>
              </div>
            </div>
          </div>

          {/* Show additional sections only after role selection */}
          {formData.role && (
            <div className="w-full space-y-1.5 mt-3">
              {/* About Me Section */}
              {aboutMeText && (
                <div className="p-1.5">
                  <h4 className="font-medium text-xs sm:text-sm text-gray-900 mb-0.5">About me</h4>
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{aboutMeText}</p>
                </div>
              )}

              {/* Languages Section */}
              {formData.primaryLanguage && (
                <div className="p-1.5">
                  <h4 className="font-medium text-xs sm:text-sm text-gray-900 mb-0.5">Language(s) spoken</h4>
                  <div className="flex flex-wrap gap-1">
                    {Array.isArray(formData.primaryLanguage) ? (
                      formData.primaryLanguage.map((lang: string) => (
                        <span key={lang} className="bg-[#F4EDFF] text-[#8157D9] px-2 py-0.5 rounded-full text-xs">
                          {getLanguageName(lang)}
                        </span>
                      ))
                    ) : (
                      <span className="bg-[#F4EDFF] text-[#8157D9] px-2 py-0.5 rounded-full text-xs">
                        {getLanguageName(formData.primaryLanguage)}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Grades */}
              {formData.grades && formData.grades.length > 0 && (
                <div className="p-1.5">
                  <h4 className="font-medium text-xs sm:text-sm text-gray-900 mb-0.5">Grade(s) taught</h4>
                  <div className="flex flex-wrap gap-1">
                    {formData.grades.map((grade: string) => (
                      <span key={grade} className="bg-[#F4EDFF] text-[#8157D9] px-2 py-0.5 rounded-full text-xs">
                        {getGradeName(grade)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Subjects */}
              {formData.subjects && formData.subjects.length > 0 && (
                <div className="p-1.5">
                  <h4 className="font-medium text-xs sm:text-sm text-gray-900 mb-0.5">Subject(s) taught</h4>
                  <div className="flex flex-wrap gap-1">
                    {formData.subjects.map((subject: string) => (
                      <span key={subject} className="bg-[#F4EDFF] text-[#8157D9] px-2 py-0.5 rounded-full text-xs">
                        {getSubjectLabels([subject])}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 