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
  onViewProfile: () => void;
  onEnhanceProfile: () => void;
  onStartCollaborating: () => void;
  organizationName: string;
  organizationType: string;
}

export function ProfileCompletionStep({ 
  onViewProfile,
  onEnhanceProfile,
  onStartCollaborating,
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
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        <h1 className="heading-primary text-3xl mb-4 c2c-dark-gray">
          Congratulations! 🎉
        </h1>
        <h2 className="heading-secondary text-xl mb-3 text-gray-700">
          You have now created your partner profile
        </h2>
        <div className="bg-gray-50 rounded-lg p-4 max-w-md mx-auto">
          <p className="font-medium">{organizationName}</p>
          <Badge variant="secondary" className="mt-2">{getTypeLabel()}</Badge>
        </div>
      </div>

      {/* Profile Actions */}
      <div className="mb-10">
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader className="text-center">
            <CardTitle className="text-green-800">Your profile is ready!</CardTitle>
            <CardDescription className="text-green-700">
              You are now ready to collaborate with schools around the world.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={onViewProfile}
              variant="outline"
              size="lg"
              className="border-green-300 text-green-700 hover:bg-green-100"
            >
              <Eye className="w-5 h-5 mr-2" />
              Preview Profile
            </Button>
            <Button
              onClick={onStartCollaborating}
              size="lg"
              className="c2c-purple-bg hover:opacity-90"
            >
              Start Collaborating
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Enhancement Options */}
      <div className="mb-10">
        <h3 className="heading-secondary text-xl text-center mb-6 c2c-dark-gray">
          Want to make your profile even better?
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          {enhancementOptions.map((option, index) => (
            <Card key={index} className="hover:border-purple-200 transition-colors">
              <CardHeader className="text-center">
                <div className="w-12 h-12 c2c-purple-bg rounded-lg flex items-center justify-center mx-auto mb-3">
                  <option.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg">{option.title}</CardTitle>
                <CardDescription>{option.description}</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button
                  variant="outline"
                  onClick={onEnhanceProfile}
                  className="w-full"
                >
                  {option.action}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Next Steps Preview */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
        <h4 className="heading-secondary text-lg mb-4 text-purple-900">
          What you can do next:
        </h4>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Users, title: 'Invite Schools', desc: 'Invite schools you already know' },
            { icon: Target, title: 'Promote Mission', desc: 'Use our marketing tools to attract schools' },
            { icon: BookOpen, title: 'Create Content', desc: 'Develop educational materials' },
            { icon: Award, title: 'Launch Projects', desc: 'Start collaborative initiatives' }
          ].map((item, index) => (
            <div key={index} className="text-center p-4">
              <item.icon className="w-8 h-8 c2c-purple mx-auto mb-2" />
              <div className="font-medium text-purple-900">{item.title}</div>
              <div className="text-sm text-purple-700">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}