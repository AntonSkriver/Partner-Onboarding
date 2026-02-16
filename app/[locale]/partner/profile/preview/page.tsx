'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';

export default function ProfilePreviewPage() {
  const router = useRouter();

  useEffect(() => {
    // Automatically redirect to dashboard
    router.push('/partner/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 flex items-center justify-center">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p>Redirecting to dashboard...</p>
      </div>
    </div>
  );
}