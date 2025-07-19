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
}

export function MissionStatementStep({ 
  onNext, 
  onBack, 
  initialValue = '' 
}: MissionStatementStepProps) {
  const form = useForm<MissionData>({
    resolver: zodResolver(missionSchema),
    defaultValues: {
      mission: initialValue,
    },
  });

  const handleSubmit = (data: MissionData) => {
    onNext(data.mission);
  };

  const watchMission = form.watch('mission');
  const isValid = watchMission && watchMission.length >= 20;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 c2c-purple-bg rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl text-white">🎯</span>
        </div>
        <h2 className="heading-primary text-2xl mb-3 c2c-dark-gray">
          What is your mission?
        </h2>
        <p className="text-gray-600 text-lg">
          Share your organization&apos;s mission statement and what drives your work in education and global collaboration.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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
                    className="text-base min-h-[160px] resize-none"
                    autoFocus
                    {...field}
                  />
                </FormControl>
                <div className="flex justify-between text-sm text-gray-500">
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

      <div className="mt-8 bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-purple-600 text-lg">💡</span>
          <div>
            <h4 className="font-medium text-purple-900 mb-1">Clear and inspiring</h4>
            <p className="text-sm text-purple-800">
              Your mission statement helps schools understand your values and goals. 
              This will be prominently displayed on your partner profile.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}