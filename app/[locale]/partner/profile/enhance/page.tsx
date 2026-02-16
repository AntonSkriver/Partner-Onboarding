'use client';

import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';

export default function ProfileEnhancePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Enhance Profile</h1>
            <p className="text-gray-600">This is a placeholder for the profile enhancement page.</p>
          </div>
          
          <div className="flex gap-4 justify-center">
            <Button
              variant="outline"
              onClick={() => router.back()}
              size="lg"
            >
              ← Go Back
            </Button>
            <Button
              onClick={() => router.push('/partner/dashboard')}
              size="lg"
              className="bg-purple-600 hover:bg-purple-700"
            >
              Continue to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}