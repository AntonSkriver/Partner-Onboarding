'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SignInPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-xl font-bold">C2C</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back!</h1>
            <p className="text-gray-600">Sign in to continue your journey</p>
          </div>
          
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                type="email"
                placeholder="Enter your email"
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <Input
                type="password"
                placeholder="Enter your password"
                className="w-full"
              />
            </div>
            
            <Button 
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700"
              size="lg"
            >
              Sign In
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <a href="/partner/onboarding" className="text-purple-600 hover:text-purple-700 font-medium">
                Sign up
              </a>
            </p>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
            <Button
              onClick={() => router.push('/partner/dashboard')}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Try Demo
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/')}
              className="w-full"
            >
              ← Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}