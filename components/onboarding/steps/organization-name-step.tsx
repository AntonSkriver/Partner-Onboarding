'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const nameSchema = z.object({
  organizationName: z.string().min(2, 'Organization name must be at least 2 characters'),
});

type NameData = z.infer<typeof nameSchema>;

interface OrganizationNameStepProps {
  onNext: (organizationName: string) => void;
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
  const form = useForm<NameData>({
    resolver: zodResolver(nameSchema),
    defaultValues: {
      organizationName: initialValue,
    },
  });

  const handleSubmit = (data: NameData) => {
    onNext(data.organizationName);
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
          What is your organization&apos;s name?
        </h2>
        <p className="text-gray-600 text-sm">
          Enter the official name of your {getTypeLabel().toLowerCase()}.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="organizationName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium sr-only">
                  Organization Name
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={getPlaceholder()}
                    className="text-base py-4 text-center"
                    autoFocus
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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