"use client"
import { Card } from "@/components/ui/card"
import { useProfileForm } from "../context/profile-form-context"
import { Users, Search, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface FinalScreenProps {
  onNext: () => void
  onGoToStep: (step: number) => void
}

export function FinalScreen({}: FinalScreenProps) {
  const { formData } = useProfileForm()

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="space-y-8 max-w-[600px] w-full px-4">
        <div className="flex flex-col items-center space-y-4">
          <Image
            src="https://class2class.org/wp-content/uploads/2023/03/Isotipo.png"
            alt="Class2Class Logo"
            width={48}
            height={48}
            className="w-12 h-12"
          />

          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold">Welcome to Class2Class.org!</h2>
            <p className="text-sm text-muted-foreground">
              Your profile is complete and you're ready to start connecting with educators around the world.
            </p>
            <p className="text-sm font-medium text-primary">Choose where you'd like to start:</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-[500px] mx-auto">
          <Card className="p-6 text-center hover:border-primary hover:shadow-md transition-all duration-200 cursor-pointer active:scale-95 group">
            <div className="flex flex-col items-center">
              <div className="flex justify-center mb-3">
                <Users className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-200" />
              </div>
              <div className="font-semibold text-base mb-2">Connect</div>
              <p className="text-sm text-muted-foreground">Find educators with similar interests</p>
              <Button variant="link" className="mt-3 text-primary">
                Get Started →
              </Button>
            </div>
          </Card>

          <Card className="p-6 text-center hover:border-primary hover:shadow-md transition-all duration-200 cursor-pointer active:scale-95 group">
            <div className="flex flex-col items-center">
              <div className="flex justify-center mb-3">
                <Search className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-200" />
              </div>
              <div className="font-semibold text-base mb-2">Discover</div>
              <p className="text-sm text-muted-foreground">Explore global projects and opportunities</p>
              <Button variant="link" className="mt-3 text-primary">
                Start Exploring →
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

