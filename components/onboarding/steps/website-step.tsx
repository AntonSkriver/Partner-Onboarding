'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const websiteSchema = z.object({
  website: z.string().url('Please enter a valid website URL').optional().or(z.literal('')),
});

type WebsiteData = z.infer<typeof websiteSchema>;

interface WebsiteStepProps {
  onNext: (website: string) => void;
  onBack: () => void;
  onSkip: () => void;
  initialValue?: string;
}

export function WebsiteStep({ 
  onNext, 
  onBack, 
  onSkip,
  initialValue = '' 
}: WebsiteStepProps) {
  const form = useForm<WebsiteData>({
    resolver: zodResolver(websiteSchema),
    defaultValues: {
      website: initialValue,
    },
  });

  const handleSubmit = (data: WebsiteData) => {
    onNext(data.website || '');
  };

  const handleSkip = () => {
    onSkip();
  };

  const watchWebsite = form.watch('website');
  const isValidUrl = watchWebsite && websiteSchema.safeParse({ website: watchWebsite }).success;

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 c2c-purple-bg rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl text-white">🌐</span>
        </div>
        <h2 className="heading-primary text-2xl mb-3 c2c-dark-gray">
          What&apos;s your website?
        </h2>
        <p className="text-gray-600 text-lg">
          Share your organization&apos;s website so schools can learn more about your work.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          This step is optional - you can skip it if you don&apos;t have a website.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium sr-only">
                  Website URL
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://www.yourorganization.org"
                    className="text-lg py-6 text-center"
                    autoFocus
                    {...field}
                  />
                </FormControl>
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
              type="button"
              variant="outline"
              onClick={handleSkip}
              size="lg"
              className="flex-1"
            >
              Skip
            </Button>
            <Button
              type="submit"
              size="lg"
              className="flex-1 c2c-purple-bg hover:opacity-90"
              disabled={watchWebsite && !isValidUrl}
            >
              Next →
            </Button>
          </div>
        </form>
      </Form>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-blue-600 text-lg">🔗</span>
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Build trust</h4>
            <p className="text-sm text-blue-800">
              Including your website helps schools learn more about your organization 
              and builds trust for potential collaborations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}