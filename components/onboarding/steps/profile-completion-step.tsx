'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Eye, 
  Video, 
  MessageSquare, 
  Award, 
  Users, 
  Target, 
  BookOpen,
  ArrowRight 
} from 'lucide-react';

interface ProfileCompletionStepProps {
  onEnhanceProfile: () => void;
  organizationName: string;
  organizationType: string;
}

export function ProfileCompletionStep({ 
  onEnhanceProfile,
  organizationName,
  organizationType
}: ProfileCompletionStepProps) {
  const getTypeLabel = () => {
    switch (organizationType) {
      case 'ngo':
        return 'NGO';
      case 'government':
        return 'Government Agency';
      case 'school_network':
        return 'School Network';
      case 'commercial':
        return 'Commercial Partner';
      default:
        return 'Organization';
    }
  };

  const enhancementOptions = [
    {
      icon: Video,
      title: 'Add Introduction Video',
      description: 'Share a personal video message to help schools connect with your mission',
      action: 'Add Video'
    },
    {
      icon: MessageSquare,
      title: 'Create FAQ Section',
      description: 'Answer common questions schools might have about collaborating with you',
      action: 'Add FAQ'
    },
    {
      icon: Award,
      title: 'Add Testimonials',
      description: 'Share success stories and testimonials from previous partnerships',
      action: 'Add Testimonials'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Congratulations Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        <h1 className="heading-primary text-xl mb-2 c2c-dark-gray">
          Congratulations! 🎉
        </h1>
        <h2 className="heading-secondary text-base mb-2 text-gray-700">
          You have now created your partner profile
        </h2>
        <div className="bg-gray-50 rounded-lg p-3 max-w-md mx-auto">
          <p className="font-medium text-sm">{organizationName}</p>
          <Badge variant="secondary" className="mt-1 text-xs">{getTypeLabel()}</Badge>
        </div>
      </div>

      {/* Profile Actions */}
      <div className="mb-6">
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader className="text-center pb-3">
            <CardTitle className="text-green-800 text-base">Your profile is ready!</CardTitle>
            <CardDescription className="text-green-700 text-sm">
              You are now ready to collaborate with schools around the world.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-3 justify-center pt-0">
            <a 
              href="/partner/profile/preview"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.5rem 1rem',
                backgroundColor: 'white',
                border: '2px solid #bbf7d0',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                color: '#15803d',
                fontSize: '0.875rem',
                fontWeight: '500',
                gap: '0.5rem'
              }}
            >
              <Eye className="w-4 h-4" />
              Preview Profile
            </a>
            <a 
              href="/partner/dashboard"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.5rem 1rem',
                backgroundColor: '#8b5cf6',
                color: 'white',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: '500',
                gap: '0.5rem'
              }}
            >
              Start Collaborating
              <ArrowRight className="w-4 h-4" />
            </a>
          </CardContent>
        </Card>
      </div>

      {/* Enhancement Options */}
      <div className="mb-6">
        <h3 className="heading-secondary text-base text-center mb-4 c2c-dark-gray">
          Want to make your profile even better?
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          {enhancementOptions.map((option, index) => (
            <Card key={index} className="hover:border-purple-200 transition-colors">
              <CardHeader className="text-center pb-2">
                <div className="w-8 h-8 c2c-purple-bg rounded-lg flex items-center justify-center mx-auto mb-2">
                  <option.icon className="w-4 h-4 text-white" />
                </div>
                <CardTitle className="text-sm">{option.title}</CardTitle>
                <CardDescription className="text-xs">{option.description}</CardDescription>
              </CardHeader>
              <CardContent className="text-center pt-0">
                <Button
                  variant="outline"
                  onClick={onEnhanceProfile}
                  className="w-full text-xs py-1"
                  size="sm"
                >
                  {option.action}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Next Steps Preview */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h4 className="heading-secondary text-sm mb-3 text-purple-900">
          What you can do next:
        </h4>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon: Users, title: 'Invite Schools', desc: 'Invite schools you already know' },
            { icon: Target, title: 'Promote Mission', desc: 'Use our marketing tools to attract schools' },
            { icon: BookOpen, title: 'Create Content', desc: 'Develop educational materials' },
            { icon: Award, title: 'Launch Projects', desc: 'Start collaborative initiatives' }
          ].map((item, index) => (
            <div key={index} className="text-center p-2">
              <item.icon className="w-6 h-6 c2c-purple mx-auto mb-1" />
              <div className="font-medium text-purple-900 text-xs">{item.title}</div>
              <div className="text-xs text-purple-700">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}