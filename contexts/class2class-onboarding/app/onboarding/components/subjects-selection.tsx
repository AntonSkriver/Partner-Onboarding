"use client"

import { useState } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useProfileForm, type Subject } from "../context/profile-form-context"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import {
  FlaskRoundIcon as Flask,
  Calculator,
  Palette,
  BookText,
  Globe,
  Dumbbell,
  Laptop,
  Languages,
  Plus,
  Check,
  ChevronsUpDown,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SubjectsSelectionProps {
  onNext: () => void
  onPrevious: () => void
  onGoToStep: (step: number) => void
}

export function SubjectsSelection({ onNext, onPrevious }: SubjectsSelectionProps) {
  const { formData, updateFormData } = useProfileForm()
  const [open, setOpen] = useState(false)

  // Main subjects to display as checkboxes
  const mainSubjects: { id: Subject; label: string; icon: React.ReactNode }[] = [
    { id: "science", label: "Science", icon: <Flask className="h-5 w-5" /> },
    { id: "math", label: "Mathematics", icon: <Calculator className="h-5 w-5" /> },
    { id: "language_arts", label: "English/Language Arts", icon: <BookText className="h-5 w-5" /> },
    { id: "social_studies", label: "Social Studies/History", icon: <Globe className="h-5 w-5" /> },
  ]

  // All subjects for the dropdown
  const allSubjects: { id: Subject; label: string; icon: React.ReactNode }[] = [
    ...mainSubjects,
    { id: "arts", label: "Arts", icon: <Palette className="h-5 w-5" /> },
    { id: "physical_education", label: "Physical Education", icon: <Dumbbell className="h-5 w-5" /> },
    { id: "technology", label: "Technology/Computer Science", icon: <Laptop className="h-5 w-5" /> },
    { id: "foreign_languages", label: "Foreign Languages", icon: <Languages className="h-5 w-5" /> },
    { id: "other", label: "Other", icon: <Plus className="h-5 w-5" /> },
  ]

  const toggleSubject = (subject: Subject) => {
    const updatedSubjects = formData.subjects.includes(subject)
      ? formData.subjects.filter((s) => s !== subject)
      : [...formData.subjects, subject]

    updateFormData({ subjects: updatedSubjects })
  }

  // Get selected subjects that aren't in the main subjects list
  const otherSelectedSubjects = formData.subjects
    .filter((id) => !mainSubjects.some((subject) => subject.id === id))
    .map((id) => {
      const subject = allSubjects.find((s) => s.id === id)
      return subject || { id, label: id, icon: <Plus className="h-5 w-5" /> }
    })

  return (
    <div className="space-y-6 pt-16 sm:pt-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Select the subject(s) you teach or specialize in</h2>
        <p className="text-sm text-muted-foreground mt-1">You can select multiple subjects. This helps us connect you with educators teaching similar subjects for potential collaborations.</p>
      </div>

      <div className="space-y-3">
        {mainSubjects.map((subject) => (
          <div
            key={subject.id}
            className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
              formData.subjects.includes(subject.id)
                ? "border-primary bg-primary/5"
                : "border-muted hover:border-primary/50"
            }`}
            onClick={() => toggleSubject(subject.id)}
          >
            <Checkbox
              id={subject.id}
              checked={formData.subjects.includes(subject.id)}
              onCheckedChange={() => toggleSubject(subject.id)}
              className="pointer-events-none"
            />
            <div className="flex items-center space-x-3">
              <div className={`text-${formData.subjects.includes(subject.id) ? "primary" : "muted-foreground"}`}>
                {subject.icon}
              </div>
              <Label htmlFor={subject.id} className="cursor-pointer">
                {subject.label}
              </Label>
            </div>
          </div>
        ))}

        {/* Other subjects section */}
        <div className="col-span-2 mt-4">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-medium">Other subjects</Label>
          </div>

          {/* Display selected other subjects */}
          {otherSelectedSubjects.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {otherSelectedSubjects.map((subject) => (
                <div
                  key={subject.id}
                  className="flex items-center gap-1 bg-primary/10 text-primary text-sm px-3 py-1 rounded-full"
                >
                  {subject.label}
                  <button onClick={() => toggleSubject(subject.id)} className="text-primary hover:text-primary/80">
                    <span className="sr-only">Remove</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Subject selector */}
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add another subject
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
              <Command>
                <CommandInput placeholder="Search subjects..." />
                <CommandEmpty>No subject found.</CommandEmpty>
                <CommandList>
                  <CommandGroup>
                    {allSubjects
                      .filter((subject) => 
                        !formData.subjects.includes(subject.id) && 
                        !mainSubjects.some(mainSubject => mainSubject.id === subject.id)
                      )
                      .map((subject) => (
                        <CommandItem
                          key={subject.id}
                          value={subject.label}
                          onSelect={() => {
                            toggleSubject(subject.id)
                            setOpen(false)
                          }}
                        >
                          <div className="flex items-center">
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.subjects.includes(subject.id) ? "opacity-100" : "opacity-0",
                              )}
                            />
                            <span className="mr-2">{subject.icon}</span>
                            {subject.label}
                          </div>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>


      <div className="flex space-x-4">
        <Button variant="outline" onClick={onPrevious} className="flex-1">
          Back
        </Button>
        <Button
          onClick={onNext}
          className="flex-1 bg-[#8157D9] hover:bg-[#8157D9]/90 text-white"
          disabled={formData.subjects.length === 0}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}

