'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GraduationCap, Users, Building, ArrowLeft, Mail, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginData = z.infer<typeof loginSchema>;

// Mock user accounts for demo
const mockAccounts = {
  // Partner accounts
  'partner@unicef.dk': { password: 'partner123', role: 'partner', name: 'UNICEF Denmark', redirectTo: '/partner/dashboard' },
  'demo@partner.org': { password: 'demo123', role: 'partner', name: 'Demo Partner Org', redirectTo: '/partner/dashboard' },
  
  // School accounts  
  'school@orestad.dk': { password: 'school123', role: 'school', name: 'Ørestad Gymnasium', redirectTo: '/school/dashboard' },
  'teacher@school.dk': { password: 'teacher123', role: 'school', name: 'Demo School', redirectTo: '/school/dashboard' },
  
  // Independent school partners (schools acting as partners)
  'partner@helsinkischool.fi': { 
    password: 'school123', 
    role: 'school', 
    name: 'Helsinki International School', 
    redirectTo: '/school/dashboard',
    accountType: 'independent_school',
    partnerCapabilities: true
  },
  'coordinator@tokyoschool.jp': { 
    password: 'school123', 
    role: 'school', 
    name: 'Tokyo Global Academy', 
    redirectTo: '/school/dashboard',
    accountType: 'independent_school',
    partnerCapabilities: true
  },
  
  // Other user types (future expansion)
  'student@example.com': { password: 'student123', role: 'student', name: 'Demo Student', redirectTo: '/student/dashboard' },
};

export default function SignInPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string>('');
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);

  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleSubmit = async (data: LoginData) => {
    setIsLoading(true);
    setLoginError('');
    
    try {
      // Simulate authentication delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user exists in mock accounts
      const account = mockAccounts[data.email as keyof typeof mockAccounts];
      
      if (!account) {
        throw new Error('Account not found. Please check your email or create a new account.');
      }
      
      if (account.password !== data.password) {
        throw new Error('Invalid password. Please try again.');
      }
      
      // Simulate session creation (in real app, this would be handled by auth service)
      const userData = {
        email: data.email,
        name: account.name,
        role: account.role,
        ...(account.accountType && { accountType: account.accountType }),
        ...(account.partnerCapabilities && { partnerCapabilities: account.partnerCapabilities }),
      }
      
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Redirect based on user role
      router.push(account.redirectTo);
      
    } catch (error) {
      console.error('Login error:', error);
      setLoginError(error instanceof Error ? error.message : 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (email: string) => {
    const account = mockAccounts[email as keyof typeof mockAccounts];
    if (account) {
      setIsLoading(true);
      
      // Simulate login delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const userData = {
        email,
        name: account.name,
        role: account.role,
        ...(account.accountType && { accountType: account.accountType }),
        ...(account.partnerCapabilities && { partnerCapabilities: account.partnerCapabilities }),
      }
      
      localStorage.setItem('user', JSON.stringify(userData));
      
      router.push(account.redirectTo);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-xl font-bold">C2C</span>
              </div>
            </Link>
            <CardTitle className="text-2xl font-bold text-gray-800">Welcome Back!</CardTitle>
            <CardDescription>Sign in to your Class2Class account</CardDescription>
          </CardHeader>
          
          <CardContent>
            {loginError && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  {loginError}
                </AlertDescription>
              </Alert>
            )}
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 mb-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            </Form>
            
            <Separator className="mb-6" />
            
            {/* Demo Accounts */}
            <div className="mb-6">
              <Button 
                variant="outline" 
                onClick={() => setShowDemoAccounts(!showDemoAccounts)}
                className="w-full mb-4"
              >
                {showDemoAccounts ? 'Hide' : 'Show'} Demo Accounts
              </Button>
              
              {showDemoAccounts && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 mb-3">Try these demo accounts:</p>
                  
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      onClick={() => handleDemoLogin('partner@unicef.dk')}
                      disabled={isLoading}
                      className="w-full justify-start"
                    >
                      <Building className="h-4 w-4 mr-2 text-purple-600" />
                      Partner: partner@unicef.dk
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => handleDemoLogin('school@orestad.dk')}
                      disabled={isLoading}
                      className="w-full justify-start"
                    >
                      <GraduationCap className="h-4 w-4 mr-2 text-blue-600" />
                      School: school@orestad.dk
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => handleDemoLogin('partner@helsinkischool.fi')}
                      disabled={isLoading}
                      className="w-full justify-start"
                    >
                      <Users className="h-4 w-4 mr-2 text-green-600" />
                      Independent School: partner@helsinkischool.fi
                    </Button>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-2">
                    All demo accounts use password: demo123 (or see specific passwords above)
                  </p>
                </div>
              )}
            </div>
            
            <div className="text-center mb-6">
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{' '}
              </p>
              <div className="flex gap-2 mt-2">
                <Link href="/partner/onboarding" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    Partner Sign Up
                  </Button>
                </Link>
                <Link href="/school/onboarding" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    School Sign Up
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="pt-6 border-t border-gray-200">
              <Button
                variant="ghost"
                onClick={() => router.push('/')}
                className="w-full"
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