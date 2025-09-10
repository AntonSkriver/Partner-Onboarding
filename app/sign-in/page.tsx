'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Building, ArrowLeft, Users2, Globe } from 'lucide-react';
import Link from 'next/link';
import { createSession } from '@/lib/auth/session';

export default function SignInPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleRoleLogin = async (role: 'partner' | 'school', accountData: any) => {
    setIsLoading(role);
    
    // Simulate login delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Create session using the existing session management
    createSession({
      email: accountData.email,
      name: accountData.name,
      role: role,
      organization: accountData.organization
    });
    
    // Redirect based on role
    router.push(accountData.redirectTo);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-xl font-bold">C2C</span>
              </div>
            </Link>
            <CardTitle className="text-2xl font-bold text-gray-800">Choose Your Account Type</CardTitle>
            <CardDescription>Select how you want to access Class2Class</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Partner Account Option */}
            <div 
              className="border-2 border-gray-200 hover:border-purple-400 hover:shadow-lg transition-all duration-200 cursor-pointer group rounded-lg overflow-hidden bg-white"
              onClick={() => !isLoading && handleRoleLogin('partner', {
                email: 'demo@partner.org',
                name: 'Global Education Alliance',
                organization: 'Global Education Alliance',
                redirectTo: '/partner/profile'
              })}
            >
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="p-4 bg-purple-100 rounded-xl group-hover:bg-purple-200 group-hover:scale-105 transition-all duration-200 shrink-0">
                    <Building className="w-10 h-10 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-700 transition-colors">
                      Partner Organization
                    </h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      For NGOs, government agencies, educational networks, and corporate partners who create and manage programs connecting schools worldwide.
                    </p>
                    <div className="flex items-center text-purple-600 font-semibold">
                      {isLoading === 'partner' ? (
                        <>
                          <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mr-3" />
                          <span>Signing in...</span>
                        </>
                      ) : (
                        <>
                          <Globe className="w-5 h-5 mr-3" />
                          <span>Continue as Partner →</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* School Account Option */}
            <div 
              className="border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all duration-200 cursor-pointer group rounded-lg overflow-hidden bg-white"
              onClick={() => !isLoading && handleRoleLogin('school', {
                email: 'demo@school.edu',
                name: 'Ørestad Gymnasium',
                organization: 'Ørestad Gymnasium',
                redirectTo: '/school/dashboard'
              })}
            >
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="p-4 bg-blue-100 rounded-xl group-hover:bg-blue-200 group-hover:scale-105 transition-all duration-200 shrink-0">
                    <GraduationCap className="w-10 h-10 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors">
                      School
                    </h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      For schools, teachers, and administrators who participate in global education programs and connect with classrooms worldwide.
                    </p>
                    <div className="flex items-center text-blue-600 font-semibold">
                      {isLoading === 'school' ? (
                        <>
                          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3" />
                          <span>Signing in...</span>
                        </>
                      ) : (
                        <>
                          <Users2 className="w-5 h-5 mr-3" />
                          <span>Continue as School →</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Section */}
            <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100">
              <div className="text-center">
                <p className="text-sm text-gray-700 font-medium mb-3">
                  🚀 <strong>Demo Mode</strong> - Explore the platform with sample data
                </p>
                <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-600">
                  <span className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    No passwords required
                  </span>
                  <span className="flex items-center">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                    Full feature access
                  </span>
                  <span className="flex items-center">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                    Sample organizations
                  </span>
                </div>
              </div>
            </div>
            
            <div className="pt-6 border-t border-gray-200">
              <Button
                variant="ghost"
                onClick={() => router.push('/')}
                className="w-full"
                disabled={!!isLoading}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}