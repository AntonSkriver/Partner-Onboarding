'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function SchoolOnboardingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl p-8 shadow-2xl text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-white text-2xl">🏫</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">School Onboarding</h1>
          <p className="text-gray-600 mb-8">
            This feature is coming soon! Schools will be able to register and connect with partner organizations here.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Button
              variant="outline"
              onClick={() => router.push('/')}
              size="lg"
            >
              ← Back to Home
            </Button>
            <Button
              onClick={() => router.push('/partner/onboarding')}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              Partner Registration Instead
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}