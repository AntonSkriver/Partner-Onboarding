'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const missionSchema = z.object({
  mission: z.string().min(20, 'Please provide a more detailed mission statement (at least 20 characters)'),
});

type MissionData = z.infer<typeof missionSchema>;

interface MissionStatementStepProps {
  onNext: (mission: string) => void;
  onBack: () => void;
  initialValue?: string;
  organizationName?: string;
  aiPrefillData?: any;
}

export function MissionStatementStep({ 
  onNext, 
  onBack, 
  initialValue = '',
  organizationName,
  aiPrefillData
}: MissionStatementStepProps) {
  // Use AI prefill data if available, otherwise use fallback logic
  const getDefaultMission = () => {
    if (initialValue) return initialValue;
    
    // Use AI prefill data if available
    if (aiPrefillData?.mission) {
      return aiPrefillData.mission;
    }
    
    // Fallback: Pre-populate with UNICEF Denmark mission if organization name contains "unicef"
    if (organizationName?.toLowerCase().includes('unicef')) {
      return "Som FN's børneorganisation har UNICEF Danmark ansvar for at våge over børns rettigheder overalt i verden – også i Danmark. Vi holder øje med, om Børnekonventionen bliver overholdt og taler børnenes sag i forhold, der vedrører dem. Det er vores opgave at sikre, at børn også bliver hørt i Danmark og arbejder for børns rettigheder alle de steder, hvor børnene er.";
    }
    return '';
  };

  const form = useForm<MissionData>({
    resolver: zodResolver(missionSchema),
    defaultValues: {
      mission: getDefaultMission(),
    },
  });

  const handleSubmit = (data: MissionData) => {
    onNext(data.mission);
  };

  const watchMission = form.watch('mission');
  const isValid = watchMission && watchMission.length >= 20;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-3">
        <div className="w-10 h-10 c2c-purple-bg rounded-full flex items-center justify-center mx-auto mb-2">
          <span className="text-sm text-white">🎯</span>
        </div>
        <h2 className="heading-primary text-base mb-1 c2c-dark-gray">
          What is your mission?
        </h2>
        <p className="text-gray-600 text-xs">
          Share your organization&apos;s mission statement and what drives your work in education and global collaboration.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
          <FormField
            control={form.control}
            name="mission"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium sr-only">
                  Mission Statement
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your organization's mission, values, and what you hope to achieve through educational partnerships..."
                    className="text-sm min-h-[120px] resize-none"
                    autoFocus
                    {...field}
                  />
                </FormControl>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>
                    {watchMission?.length || 0} characters (minimum 20)
                  </span>
                  <span>
                    {watchMission?.length >= 20 ? '✓' : ''}
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

      <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <span className="text-purple-600 text-sm">💡</span>
          <div>
            <h4 className="font-medium text-purple-900 mb-1 text-sm">Clear and inspiring</h4>
            <p className="text-xs text-purple-800">
              Your mission statement helps schools understand your values and goals. 
              This will be prominently displayed on your partner profile.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}