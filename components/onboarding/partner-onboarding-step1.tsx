'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const step1Schema = z.object({
  organizationName: z.string().min(2, 'Organization name must be at least 2 characters'),
  organizationType: z.enum(['ngo', 'government', 'school_network', 'commercial', 'other'], {
    required_error: 'Please select an organization type',
  }),
  description: z.string().min(10, 'Please provide a brief description (at least 10 characters)'),
});

type Step1Data = z.infer<typeof step1Schema>;

interface PartnerOnboardingStep1Props {
  onNext: (data: Step1Data) => void;
  initialData?: Partial<Step1Data>;
}

const organizationTypeOptions = [
  { value: 'ngo', label: 'Non-Governmental Organization (NGO)' },
  { value: 'government', label: 'Government Agency/Ministry' },
  { value: 'school_network', label: 'School Network/District' },
  { value: 'commercial', label: 'Commercial/Corporate Partner' },
  { value: 'other', label: 'Other' },
];

export function PartnerOnboardingStep1({ onNext, initialData }: PartnerOnboardingStep1Props) {
  const form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      organizationName: initialData?.organizationName || '',
      organizationType: initialData?.organizationType,
      description: initialData?.description || '',
    },
  });

  const handleSubmit = (data: Step1Data) => {
    onNext(data);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 c2c-purple-bg rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl text-white">🏢</span>
        </div>
        <h3 className="heading-secondary text-lg mb-2">Tell us about your organization</h3>
        <p className="text-gray-600">
          Help us understand who you are and what you do so we can better support your mission.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="organizationName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">Organization Name *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., UNICEF, Ministry of Education, ABC School District"
                    className="text-base"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Enter the full official name of your organization
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="organizationType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">Organization Type *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="text-base">
                      <SelectValue placeholder="Select your organization type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {organizationTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  This helps us tailor the experience to your needs
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">Brief Description *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us about your organization's work and focus areas..."
                    className="text-base min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  A few sentences about what your organization does and its main goals
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <button
            type="submit"
            className="hidden"
            id="step1-submit"
          />
        </form>
      </Form>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-blue-600 text-lg">💡</span>
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Why we ask this</h4>
            <p className="text-sm text-blue-800">
              Understanding your organization helps us connect you with relevant schools and projects 
              that align with your mission and values.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}