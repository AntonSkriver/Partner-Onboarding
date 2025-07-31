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
  organizationName?: string;
}

export function WebsiteStep({ 
  onNext, 
  onBack, 
  onSkip,
  initialValue = '',
  organizationName
}: WebsiteStepProps) {
  // Pre-populate with UNICEF Denmark website if organization name contains "unicef"
  const getDefaultWebsite = () => {
    if (initialValue) return initialValue;
    if (organizationName?.toLowerCase().includes('unicef')) {
      return "https://www.unicef.dk";
    }
    return '';
  };
  const form = useForm<WebsiteData>({
    resolver: zodResolver(websiteSchema),
    defaultValues: {
      website: getDefaultWebsite(),
    },
  });

  const handleSubmit = (data: WebsiteData) => {
    onNext(data.website || '');
  };

  const handleSkip = () => {
    onSkip();
  };

  const watchWebsite = form.watch('website');
  const isValidUrl = watchWebsite ? websiteSchema.safeParse({ website: watchWebsite }).success : false;

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-4">
        <div className="w-10 h-10 c2c-purple-bg rounded-full flex items-center justify-center mx-auto mb-2">
          <span className="text-sm text-white">🌐</span>
        </div>
        <h2 className="heading-primary text-base mb-1 c2c-dark-gray">
          What&apos;s your website?
        </h2>
        <p className="text-gray-600 text-xs">
          Share your organization&apos;s website so schools can learn more about your work.
        </p>
        <p className="text-xs text-gray-500 mt-1">
          This step is optional - you can skip it if you don&apos;t have a website.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
                    className="text-sm py-3 text-center"
                    autoFocus
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-2 pt-2">
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
              type="button"
              variant="outline"
              onClick={handleSkip}
              size="default"
              className="flex-1"
            >
              Skip
            </Button>
            <Button
              type="submit"
              size="default"
              className="flex-1 c2c-purple-bg hover:opacity-90"
              disabled={!!watchWebsite && !isValidUrl}
            >
              Next →
            </Button>
          </div>
        </form>
      </Form>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <span className="text-blue-600 text-sm">🔗</span>
          <div>
            <h4 className="font-medium text-blue-900 mb-1 text-sm">Build trust</h4>
            <p className="text-xs text-blue-800">
              Including your website helps schools learn more about your organization 
              and builds trust for potential collaborations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}