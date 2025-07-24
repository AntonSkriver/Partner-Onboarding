'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const descriptionSchema = z.object({
  description: z.string().min(10, 'Please provide a brief description (at least 10 characters)'),
});

type DescriptionData = z.infer<typeof descriptionSchema>;

interface OrganizationDescriptionStepProps {
  onNext: (description: string) => void;
  onBack: () => void;
  initialValue?: string;
  organizationName?: string;
}

export function OrganizationDescriptionStep({ 
  onNext, 
  onBack, 
  initialValue = '',
  organizationName
}: OrganizationDescriptionStepProps) {
  // Pre-populate with UNICEF example if organization name contains "unicef"
  const getDefaultDescription = () => {
    if (initialValue) return initialValue;
    if (organizationName?.toLowerCase().includes('unicef')) {
      return "UNICEF is a global humanitarian and development agency working for every child's rights and well-being. We operate in over 190 countries and territories, focusing on the most disadvantaged children and families. Our work spans education, health, nutrition, water and sanitation, protection, and emergency response. We believe every child deserves a fair chance in life, regardless of their background or circumstances.";
    }
    return '';
  };
  const form = useForm<DescriptionData>({
    resolver: zodResolver(descriptionSchema),
    defaultValues: {
      description: getDefaultDescription(),
    },
  });

  const handleSubmit = (data: DescriptionData) => {
    onNext(data.description);
  };

  const watchDescription = form.watch('description');
  const isValid = watchDescription && watchDescription.length >= 10;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-3">
        <div className="w-10 h-10 c2c-purple-bg rounded-full flex items-center justify-center mx-auto mb-2">
          <span className="text-sm text-white">📝</span>
        </div>
        <h2 className="heading-primary text-base mb-1 c2c-dark-gray">
          Tell us about your organization
        </h2>
        <p className="text-gray-600 text-xs">
          Provide a brief description of your organization&apos;s work and focus areas.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium sr-only">
                  Organization Description
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us about your organization's work, focus areas, and what drives your mission..."
                    className="text-sm min-h-[100px] resize-none"
                    autoFocus
                    {...field}
                  />
                </FormControl>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>
                    {watchDescription?.length || 0} characters (minimum 10)
                  </span>
                  <span>
                    {watchDescription?.length >= 10 ? '✓' : ''}
                  </span>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              size="default"
              className="flex-1"
            >
              ← Go back
            </Button>
            <Button
              type="submit"
              size="default"
              className="flex-1 c2c-purple-bg hover:opacity-90"
              disabled={!isValid}
            >
              Next →
            </Button>
          </div>
        </form>
      </Form>

      <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <span className="text-green-600 text-sm">🌟</span>
          <div>
            <h4 className="font-medium text-green-900 mb-1 text-sm">Make it engaging</h4>
            <p className="text-xs text-green-800">
              This description helps schools understand your work and decide if they want to 
              collaborate with you. Focus on your impact and values.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}