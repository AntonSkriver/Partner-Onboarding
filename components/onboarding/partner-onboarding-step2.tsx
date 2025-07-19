'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useState } from 'react';

const step2Schema = z.object({
  mission: z.string().min(20, 'Please provide a more detailed mission statement (at least 20 characters)'),
  website: z.string().url('Please enter a valid website URL').optional().or(z.literal('')),
  sdgFocus: z.array(z.string()).min(1, 'Please select at least one Sustainable Development Goal'),
});

type Step2Data = z.infer<typeof step2Schema>;

interface PartnerOnboardingStep2Props {
  onNext: (data: Step2Data) => void;
  onBack?: () => void;
  initialData?: Partial<Step2Data>;
}

const sdgOptions = [
  { id: '1', title: 'No Poverty', color: 'bg-red-500' },
  { id: '2', title: 'Zero Hunger', color: 'bg-yellow-500' },
  { id: '3', title: 'Good Health and Well-being', color: 'bg-green-500' },
  { id: '4', title: 'Quality Education', color: 'bg-red-600' },
  { id: '5', title: 'Gender Equality', color: 'bg-orange-500' },
  { id: '6', title: 'Clean Water and Sanitation', color: 'bg-blue-400' },
  { id: '7', title: 'Affordable and Clean Energy', color: 'bg-yellow-600' },
  { id: '8', title: 'Decent Work and Economic Growth', color: 'bg-red-700' },
  { id: '9', title: 'Industry, Innovation and Infrastructure', color: 'bg-orange-600' },
  { id: '10', title: 'Reduced Inequalities', color: 'bg-pink-500' },
  { id: '11', title: 'Sustainable Cities and Communities', color: 'bg-yellow-700' },
  { id: '12', title: 'Responsible Consumption and Production', color: 'bg-green-600' },
  { id: '13', title: 'Climate Action', color: 'bg-green-700' },
  { id: '14', title: 'Life Below Water', color: 'bg-blue-500' },
  { id: '15', title: 'Life on Land', color: 'bg-green-800' },
  { id: '16', title: 'Peace, Justice and Strong Institutions', color: 'bg-blue-600' },
  { id: '17', title: 'Partnerships for the Goals', color: 'bg-blue-800' },
];

export function PartnerOnboardingStep2({ onNext, initialData }: PartnerOnboardingStep2Props) {
  const [selectedSDGs, setSelectedSDGs] = useState<string[]>(initialData?.sdgFocus || []);

  const form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      mission: initialData?.mission || '',
      website: initialData?.website || '',
      sdgFocus: initialData?.sdgFocus || [],
    },
  });

  const handleSDGToggle = (sdgId: string) => {
    const newSelected = selectedSDGs.includes(sdgId)
      ? selectedSDGs.filter(id => id !== sdgId)
      : [...selectedSDGs, sdgId];
    
    setSelectedSDGs(newSelected);
    form.setValue('sdgFocus', newSelected);
  };

  const handleSubmit = (data: Step2Data) => {
    onNext({ ...data, sdgFocus: selectedSDGs });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 c2c-purple-bg rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl text-white">🎯</span>
        </div>
        <h3 className="heading-secondary text-lg mb-2">Your Mission & Goals</h3>
        <p className="text-gray-600">
          Share your organization&apos;s mission and the UN Sustainable Development Goals you focus on.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="mission"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">Mission Statement *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your organization's mission and what drives your work in education and global collaboration..."
                    className="text-base min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  This will help schools understand your values and goals
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">Website (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://www.yourorganization.org"
                    className="text-base"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Schools can learn more about your work through your website
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sdgFocus"
            render={() => (
              <FormItem>
                <FormLabel className="text-base font-medium">
                  Sustainable Development Goals Focus *
                </FormLabel>
                <FormDescription className="mb-4">
                  Select the UN SDGs that align with your organization&apos;s work and projects
                </FormDescription>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {sdgOptions.map((sdg) => (
                    <Button
                      key={sdg.id}
                      type="button"
                      variant={selectedSDGs.includes(sdg.id) ? "default" : "outline"}
                      className={`justify-start text-left h-auto p-3 ${
                        selectedSDGs.includes(sdg.id) ? 'bg-purple-600 hover:bg-purple-700' : ''
                      }`}
                      onClick={() => handleSDGToggle(sdg.id)}
                    >
                      <div className={`w-3 h-3 rounded mr-3 ${sdg.color}`}></div>
                      <div className="flex-1">
                        <div className="font-medium">SDG {sdg.id}</div>
                        <div className="text-sm opacity-80">{sdg.title}</div>
                      </div>
                    </Button>
                  ))}
                </div>

                {selectedSDGs.length > 0 && (
                  <div className="mt-4">
                    <div className="text-sm font-medium mb-2">Selected SDGs:</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedSDGs.map((sdgId) => {
                        const sdg = sdgOptions.find(s => s.id === sdgId);
                        return sdg ? (
                          <Badge key={sdgId} variant="secondary" className="gap-1">
                            SDG {sdg.id}: {sdg.title}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 ml-1"
                              onClick={() => handleSDGToggle(sdgId)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
                
                <FormMessage />
              </FormItem>
            )}
          />

          <button type="submit" className="hidden" id="step2-submit" />
        </form>
      </Form>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-green-600 text-lg">🌍</span>
          <div>
            <h4 className="font-medium text-green-900 mb-1">Global Impact</h4>
            <p className="text-sm text-green-800">
              Aligning with the UN SDGs helps schools understand how participating in your projects 
              contributes to global positive change and sustainable development.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}