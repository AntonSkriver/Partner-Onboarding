'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';

const nameSchema = z.object({
  organizationName: z.string().min(2, 'Organization name must be at least 2 characters'),
  website: z.string().url('Please enter a valid website URL').optional().or(z.literal('')),
});

type NameData = z.infer<typeof nameSchema>;

interface OrganizationNameStepProps {
  onNext: (data: { organizationName: string; website?: string; aiPrefillData?: any }) => void;
  onBack: () => void;
  initialValue?: string;
  organizationType?: string;
}

export function OrganizationNameStep({ 
  onNext, 
  onBack, 
  initialValue = '', 
  organizationType 
}: OrganizationNameStepProps) {
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiPrefillData, setAiPrefillData] = useState<any>(null);
  const [showAIPrefill, setShowAIPrefill] = useState(false);

  const form = useForm<NameData>({
    resolver: zodResolver(nameSchema),
    defaultValues: {
      organizationName: initialValue,
      website: '',
    },
  });

  // AI prefill function (simulated for demo)
  const fetchOrganizationData = async (orgName: string, website?: string) => {
    setIsLoadingAI(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock AI response with common organization data
      const mockData = {
        'UNICEF Denmark': {
          description: 'UNICEF Denmark works to promote and protect the rights of children in Denmark and around the world.',
          mission: 'To advocate for the protection of children\'s rights, to help meet their basic needs and to expand their opportunities to reach their full potential.',
          country: 'Denmark',
          languages: ['English', 'Danish'],
          sdgFocus: ['4', '10', '16'], // Quality Education, Reduced Inequalities, Peace & Justice
        },
        'Save the Children': {
          description: 'Save the Children is an international non-governmental organization that promotes children\'s rights and provides relief and support.',
          mission: 'To inspire breakthroughs in the way the world treats children and to achieve immediate and lasting change in their lives.',
          country: 'United Kingdom',
          languages: ['English'],
          sdgFocus: ['1', '2', '3', '4'], // No Poverty, Zero Hunger, Good Health, Quality Education
        },
        'UNICEF': {
          description: 'The United Nations Children\'s Fund is a United Nations agency responsible for providing humanitarian and developmental aid to children worldwide.',
          mission: 'To advocate for the protection of children\'s rights, to help meet their basic needs and to expand their opportunities to reach their full potential.',
          country: 'United States',
          languages: ['English'],
          sdgFocus: ['1', '3', '4', '6', '10'], // Multiple SDGs related to children's welfare
        }
      };

      const foundData = mockData[orgName as keyof typeof mockData];
      if (foundData) {
        setAiPrefillData(foundData);
        setShowAIPrefill(true);
      }
    } catch (error) {
      console.error('Failed to fetch organization data:', error);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleSubmit = (data: NameData) => {
    onNext({
      organizationName: data.organizationName,
      website: data.website,
      aiPrefillData: aiPrefillData
    });
  };

  const triggerAIFetch = () => {
    const orgName = form.getValues('organizationName');
    const website = form.getValues('website');
    if (orgName.length >= 3) {
      fetchOrganizationData(orgName, website);
    }
  };

  const getPlaceholder = () => {
    switch (organizationType) {
      case 'ngo':
        return 'e.g., UNICEF Denmark, Oxfam, Save the Children';
      case 'government':
        return 'e.g., Ministry of Education, Department of Education';
      case 'school_network':
        return 'e.g., ABC School District, Regional Education Network';
      case 'commercial':
        return 'e.g., Microsoft Education, Google for Education';
      default:
        return 'Enter your organization name';
    }
  };

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

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-4">
        <div className="w-12 h-12 c2c-purple-bg rounded-full flex items-center justify-center mx-auto mb-2">
          <span className="text-lg text-white">✏️</span>
        </div>
        <h2 className="heading-primary text-lg mb-2 c2c-dark-gray">
          Tell us about your organization
        </h2>
        <p className="text-gray-600 text-sm">
          Enter your organization name and website to get started. We&apos;ll help prefill some information for you.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="organizationName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">
                  Organization Name
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={getPlaceholder()}
                    className="text-base py-4"
                    autoFocus
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">
                  Organization Website <span className="text-gray-500">(optional)</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://www.yourorganization.org"
                    className="text-base py-4"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* AI Prefill Button */}
          {!showAIPrefill && !isLoadingAI && (
            <Button
              type="button"
              variant="outline"
              onClick={triggerAIFetch}
              className="w-full border-purple-200 text-purple-600 hover:bg-purple-50"
              disabled={!form.watch('organizationName') || form.watch('organizationName').length < 3}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Auto-fill organization details with AI
            </Button>
          )}

          {/* Loading state */}
          {isLoadingAI && (
            <div className="flex items-center justify-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <Loader2 className="h-5 w-5 animate-spin text-purple-600 mr-2" />
              <span className="text-purple-700">Looking up your organization...</span>
            </div>
          )}

          {/* AI Prefill Preview */}
          {showAIPrefill && aiPrefillData && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-green-600" />
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    AI Found Information
                  </Badge>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <strong className="text-green-900">Description:</strong>
                  <p className="text-green-800 mt-1">{aiPrefillData.description}</p>
                </div>
                <div>
                  <strong className="text-green-900">Mission:</strong>
                  <p className="text-green-800 mt-1">{aiPrefillData.mission}</p>
                </div>
                <div>
                  <strong className="text-green-900">Country:</strong>
                  <span className="text-green-800 ml-2">{aiPrefillData.country}</span>
                </div>
                <div>
                  <strong className="text-green-900">Languages:</strong>
                  <span className="text-green-800 ml-2">{aiPrefillData.languages.join(', ')}</span>
                </div>
                <p className="text-green-700 text-xs mt-3">
                  ✅ This information will be pre-filled in the next steps. You can review and edit it before continuing.
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              size="lg"
              className="flex-1"
            >
              ← Go back
            </Button>
            <Button
              type="submit"
              size="lg"
              className="flex-1 c2c-purple-bg hover:opacity-90"
              disabled={!form.watch('organizationName') || form.watch('organizationName').length < 2}
            >
              Next →
            </Button>
          </div>
        </form>
      </Form>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-blue-600 text-lg">💡</span>
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Use your official name</h4>
            <p className="text-sm text-blue-800">
              This name will be visible to schools and other partners, so please use your 
              organization&apos;s official or commonly recognized name.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}