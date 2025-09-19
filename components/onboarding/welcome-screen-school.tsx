'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { School, Users, Globe, Heart, ArrowRight } from 'lucide-react'

interface WelcomeScreenSchoolProps {
  onNext: () => void
  onPrevious?: () => void
  onGoToStep?: (step: number) => void
}


export function WelcomeScreenSchool({ onNext }: WelcomeScreenSchoolProps) {
  return (
    <div className="w-full max-w-3xl mx-auto space-y-10 px-4 sm:px-6 lg:px-8">
      {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <School className="h-10 w-10 text-green-600" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome to Class2Class
            </h1>
            <p className="text-xl text-gray-600">
              Join our global network of schools creating meaningful connections
            </p>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Global Classroom Connections</h3>
                  <p className="text-gray-600 text-sm">
                    Connect your students with classrooms around the world for collaborative learning experiences
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <Globe className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Cultural Exchange</h3>
                  <p className="text-gray-600 text-sm">
                    Foster cultural understanding and global awareness through authentic international partnerships
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <Heart className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">SDG-Aligned Projects</h3>
                  <p className="text-gray-600 text-sm">
                    Participate in meaningful projects that address the UN Sustainable Development Goals
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <School className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Educational Resources</h3>
                  <p className="text-gray-600 text-sm">
                    Access a rich library of educational content and collaboration tools from partner organizations
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center space-y-4">
          <p className="text-gray-600">
            It only takes a few minutes to create your school profile and start connecting with the world
          </p>
          <Button 
            onClick={onNext} 
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-medium"
          >
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="text-center text-sm text-gray-500 space-y-2">
          <p>Trusted by schools in over 50 countries</p>
          <div className="flex justify-center items-center space-x-4">
            <span className="bg-gray-100 px-3 py-1 rounded-full text-xs">Secure</span>
            <span className="bg-gray-100 px-3 py-1 rounded-full text-xs">Educational</span>
            <span className="bg-gray-100 px-3 py-1 rounded-full text-xs">Global Impact</span>
          </div>
        </div>
    </div>
  )
}
