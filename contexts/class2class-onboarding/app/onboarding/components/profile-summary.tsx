"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useProfileForm } from "../context/profile-form-context"
import { Edit2, Check, X, Sparkles } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ProfileSummaryProps {
  onNext: () => void
  onPrevious: () => void
  onGoToStep: (step: number) => void
}

export function ProfileSummary({ onNext, onPrevious }: ProfileSummaryProps) {
  const { formData, updateFormData } = useProfileForm()
  const [isEditingAboutMe, setIsEditingAboutMe] = useState(false)
  const [aboutMeText, setAboutMeText] = useState(formData.aboutMe || "")
  const [wordCount, setWordCount] = useState(0)
  const [isEnhancing, setIsEnhancing] = useState(false)

  // Helper function to count words
  const countWords = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  // Update word count when aboutMeText changes
  useEffect(() => {
    setWordCount(countWords(aboutMeText))
  }, [aboutMeText])

  // Helper function to get role label
  const getRoleLabel = () => {
    switch (formData.role) {
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
  const getGradeLabels = () => {
    const gradeMap: Record<string, string> = {
      early_childhood: "Early Childhood",
      elementary: "Elementary",
      middle_school: "Middle School",
      high_school: "High School",
      higher_education: "Higher Education",
    }

    return formData.grades.map((grade) => gradeMap[grade] || grade).join(", ")
  }

  // Helper function to get subject labels
  const getSubjectLabels = () => {
    const subjectMap: Record<string, string> = {
      science: "Science",
      math: "Mathematics",
      arts: "Arts",
      language_arts: "English/Language Arts",
      social_studies: "Social Studies/History",
      physical_education: "Physical Education",
      technology: "Technology/Computer Science",
      foreign_languages: "Foreign Languages",
      other: formData.otherSubject || "Other",
    }

    return formData.subjects.map((subject) => subjectMap[subject] || subject).join(", ")
  }

  // Helper function to get interest labels
  const getInterestLabels = () => {
    const interestMap: Record<string, string> = {
      explore_cultures: "Explore cultures",
      explore_global_challenges: "Explore global challenges",
      create_solutions: "Create solutions",
      professional_development: "Professional development",
      other: formData.otherInterest || "Other",
    }

    return formData.interests.map((interest) => interestMap[interest] || interest).join(", ")
  }

  // Generate "About Me" text
  const generateAboutMe = () => {
    if (formData.aboutMe) {
      return formData.aboutMe
    }

    return `I am a ${getRoleLabel().toLowerCase()} at ${formData.schoolName} in ${formData.location.city}, ${formData.location.region}, ${formData.location.country}. I work with ${getGradeLabels().toLowerCase()} students, teaching ${getSubjectLabels()}. I'm interested in ${getInterestLabels().toLowerCase()} through global education collaboration.`
  }

  const handleEditAboutMe = () => {
    setAboutMeText(formData.aboutMe || generateAboutMe())
    setIsEditingAboutMe(true)
  }

  const handleSaveAboutMe = () => {
    updateFormData({ aboutMe: aboutMeText })
    setIsEditingAboutMe(false)
  }

  const handleCancelEditAboutMe = () => {
    setIsEditingAboutMe(false)
  }

  const handleEnhanceWithAI = async () => {
    setIsEnhancing(true)
    try {
      // TODO: Implement AI enhancement logic here
      // For now, we'll just add a placeholder enhancement
      const enhancedText = await new Promise<string>((resolve) => {
        setTimeout(() => {
          resolve(aboutMeText + " (Enhanced with AI)")
        }, 1000)
      })
      setAboutMeText(enhancedText)
    } catch (error) {
      console.error("Error enhancing text:", error)
    } finally {
      setIsEnhancing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold">About Me</h2>
        <p className="text-sm text-muted-foreground">Tell us about yourself</p>
      </div>

      <Card className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">About Me</h3>
          {isEditingAboutMe ? (
            <div className="flex space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handleEnhanceWithAI}
                disabled={isEnhancing}
                className="bg-[#f4edff] border-none hover:bg-[#f4edff]/80 text-[#8157d9] transition-colors duration-200 rounded-[8px]"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {isEnhancing ? "Enhancing..." : "Enhance with AI"}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSaveAboutMe} className="h-8 w-8 p-0">
                <Check className="h-4 w-4 text-green-500" />
                <span className="sr-only">Save about me</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleCancelEditAboutMe} className="h-8 w-8 p-0">
                <X className="h-4 w-4 text-red-500" />
                <span className="sr-only">Cancel editing</span>
              </Button>
            </div>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleEditAboutMe} 
                    className="h-8 w-8 p-0 bg-[#f4edff] border-none hover:bg-[#f4edff]/80 text-[#8157d9] transition-colors duration-200 rounded-[8px]"
                  >
                    <Edit2 className="h-4 w-4" />
                    <span className="sr-only">Edit about me</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-white border-[#8157D9] text-[#8157D9]">
                  <p>Click to edit your profile summary</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {isEditingAboutMe ? (
          <div className="space-y-2">
            <Textarea
              value={aboutMeText}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAboutMeText(e.target.value)}
              className="min-h-[200px] resize-y"
              placeholder="Write a brief description about yourself..."
            />
            <div className="text-sm text-muted-foreground text-right">
              {wordCount} words
            </div>
          </div>
        ) : (
          <div className="text-sm">{generateAboutMe()}</div>
        )}
      </Card>

      <div className="flex space-x-4">
        <Button variant="outline" onClick={onPrevious} className="flex-1">
          Back
        </Button>
        <Button onClick={onNext} className="flex-1 bg-[#8157D9] hover:bg-[#8157D9]/90 text-white">
          Continue
        </Button>
      </div>
    </div>
  )
}

