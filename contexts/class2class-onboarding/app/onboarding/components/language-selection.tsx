"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useProfileForm } from "../context/profile-form-context"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Check, ChevronsUpDown, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface LanguageSelectionProps {
  onNext: () => void
  onPrevious: () => void
  onGoToStep: (step: number) => void
}

// Extended list of languages with ISO codes
const allLanguages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "pt", name: "Portuguese" },
  { code: "it", name: "Italian" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
  { code: "ru", name: "Russian" },
  { code: "ko", name: "Korean" },
  { code: "nl", name: "Dutch" },
  { code: "tr", name: "Turkish" },
  { code: "pl", name: "Polish" },
  { code: "sv", name: "Swedish" },
  { code: "da", name: "Danish" },
  { code: "fi", name: "Finnish" },
  { code: "no", name: "Norwegian" },
  { code: "el", name: "Greek" },
  { code: "cs", name: "Czech" },
  { code: "hu", name: "Hungarian" },
  { code: "ro", name: "Romanian" },
  { code: "th", name: "Thai" },
  { code: "id", name: "Indonesian" },
  { code: "ms", name: "Malay" },
  { code: "vi", name: "Vietnamese" },
  { code: "uk", name: "Ukrainian" },
  { code: "he", name: "Hebrew" },
  { code: "bn", name: "Bengali" },
]

export function LanguageSelection({ onNext, onPrevious }: LanguageSelectionProps) {
  const { formData, updateFormData } = useProfileForm()
  const [open, setOpen] = useState(false)

  // Common languages to display as checkboxes
  const commonLanguages = [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "zh", name: "Chinese" },
    { code: "ar", name: "Arabic" },
    { code: "hi", name: "Hindi" },
    { code: "pt", name: "Portuguese" },
  ]

  // Convert single language to array if needed
  const selectedLanguages = Array.isArray(formData.primaryLanguage)
    ? formData.primaryLanguage
    : formData.primaryLanguage
      ? [formData.primaryLanguage]
      : []

  const toggleLanguage = (code: string) => {
    const isSelected = selectedLanguages.includes(code)
    let updatedLanguages

    if (isSelected) {
      updatedLanguages = selectedLanguages.filter((lang) => lang !== code)
    } else {
      updatedLanguages = [...selectedLanguages, code]
    }

    updateFormData({ primaryLanguage: updatedLanguages.length > 0 ? updatedLanguages : null })
  }

  // Get selected languages that aren't in the common languages list
  const otherSelectedLanguages = selectedLanguages
    .filter((code) => !commonLanguages.some((lang) => lang.code === code))
    .map((code) => {
      const language = allLanguages.find((lang) => lang.code === code)
      return language || { code, name: code }
    })

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Select the language(s) you speak</h2>
        <p className="text-sm text-muted-foreground mt-1">You can select multiple languages</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {commonLanguages.map((language) => (
          <div
            key={language.code}
            className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
              selectedLanguages.includes(language.code)
                ? "border-primary bg-primary/5"
                : "border-muted hover:border-primary/50"
            }`}
            onClick={() => toggleLanguage(language.code)}
          >
            <Checkbox
              id={language.code}
              checked={selectedLanguages.includes(language.code)}
              onCheckedChange={() => toggleLanguage(language.code)}
              className="pointer-events-none"
            />
            <Label htmlFor={language.code} className="cursor-pointer">
              {language.name}
            </Label>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between bg-[#FBFCFD]"
            >
              Add more languages
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command className="bg-[#FBFCFD]">
              <CommandInput placeholder="Search languages..." />
              <CommandList>
                <CommandEmpty>No language found.</CommandEmpty>
                <CommandGroup>
                  {allLanguages
                    .filter((lang) => !commonLanguages.some((common) => common.code === lang.code))
                    .map((language) => (
                      <CommandItem
                        key={language.code}
                        value={language.name}
                        onSelect={() => {
                          toggleLanguage(language.code)
                          setOpen(false)
                        }}
                        className="bg-[#FBFCFD] hover:bg-[#F0F2F5]"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedLanguages.includes(language.code) ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {language.name}
                      </CommandItem>
                    ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {otherSelectedLanguages.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {otherSelectedLanguages.map((language) => (
              <div
                key={language.code}
                className="flex items-center gap-1 bg-primary/10 text-primary text-sm px-3 py-1 rounded-full"
              >
                {language.name}
                <button onClick={() => toggleLanguage(language.code)} className="text-primary hover:text-primary/80">
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
      </div>

      <div className="flex space-x-4">
        <Button variant="outline" onClick={onPrevious} className="flex-1">
          Back
        </Button>
        <Button
          onClick={onNext}
          className="flex-1 bg-[#8157D9] hover:bg-[#8157D9]/90 text-white"
          disabled={!formData.primaryLanguage || (Array.isArray(formData.primaryLanguage) && formData.primaryLanguage.length === 0)}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}

