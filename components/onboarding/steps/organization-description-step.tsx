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
}

export function OrganizationDescriptionStep({ 
  onNext, 
  onBack, 
  initialValue = '' 
}: OrganizationDescriptionStepProps) {
  const form = useForm<DescriptionData>({
    resolver: zodResolver(descriptionSchema),
    defaultValues: {
      description: initialValue,
    },
  });

  const handleSubmit = (data: DescriptionData) => {
    onNext(data.description);
  };

  const watchDescription = form.watch('description');
  const isValid = watchDescription && watchDescription.length >= 10;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 c2c-purple-bg rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl text-white">📝</span>
        </div>
        <h2 className="heading-primary text-2xl mb-3 c2c-dark-gray">
          Tell us about your organization
        </h2>
        <p className="text-gray-600 text-lg">
          Provide a brief description of what your organization does and its main focus areas.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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
                    className="text-base min-h-[150px] resize-none"
                    autoFocus
                    {...field}
                  />
                </FormControl>
                <div className="flex justify-between text-sm text-gray-500">
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

          <div className="flex gap-4 pt-4">
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
              disabled={!isValid}
            >
              Next →
            </Button>
          </div>
        </form>
      </Form>

      <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-green-600 text-lg">🌟</span>
          <div>
            <h4 className="font-medium text-green-900 mb-1">Make it engaging</h4>
            <p className="text-sm text-green-800">
              This description helps schools understand your work and decide if they want to 
              collaborate with you. Focus on your impact and values.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}