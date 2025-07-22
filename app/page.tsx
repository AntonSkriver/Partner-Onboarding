import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Users, Target, BookOpen, Award, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-c2c-light-gray to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 c2c-purple-bg rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <span className="heading-primary text-xl c2c-dark-gray">Class2Class</span>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" asChild>
              <Link href="/dashboard">Sign In</Link>
            </Button>
            <Button className="c2c-purple-bg hover:opacity-90" asChild>
              <Link href="/partner/onboarding">Become a Partner</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="heading-primary text-5xl mb-6 c2c-dark-gray">
            Empowering Global Educational Partnerships
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Join Class2Class as a partner organization and connect with schools worldwide 
            to create meaningful collaborative learning experiences that advance the UN 
            Sustainable Development Goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="c2c-purple-bg hover:opacity-90 text-lg px-8" asChild>
              <Link href="/partner/onboarding">
                Start Your Partnership
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8" asChild>
              <Link href="/school/onboarding">Join as a School</Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="border-2 hover:border-purple-200 transition-colors">
            <CardHeader className="text-center">
              <div className="w-12 h-12 c2c-purple-bg rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="heading-secondary">Global Network</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Connect with schools, teachers, and students across the globe to create 
                impactful collaborative projects that transcend geographical boundaries.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-purple-200 transition-colors">
            <CardHeader className="text-center">
              <div className="w-12 h-12 c2c-purple-bg rounded-lg flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="heading-secondary">SDG Alignment</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Align your projects with the UN Sustainable Development Goals and 
                track your organization&apos;s impact on global education and development.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-purple-200 transition-colors">
            <CardHeader className="text-center">
              <div className="w-12 h-12 c2c-purple-bg rounded-lg flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="heading-secondary">Project Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Create and manage multiple educational projects with built-in tools 
                for collaboration, progress tracking, and impact measurement.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Partner Types */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-16">
          <h2 className="heading-secondary text-3xl text-center mb-8 c2c-dark-gray">
            Who Can Become a Partner?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "NGOs",
                description: "Organizations like UNICEF working on global citizenship and rights",
                icon: "🏛️"
              },
              {
                title: "Government",
                description: "Ministries of Education launching inclusion or development campaigns",
                icon: "🏛️"
              },
              {
                title: "School Networks",
                description: "School districts or educational networks coordinating programs",
                icon: "🏫"
              },
              {
                title: "Corporate",
                description: "Companies with educational CSR initiatives and sustainability goals",
                icon: "🏢"
              }
            ].map((type, index) => (
              <div key={index} className="text-center p-4">
                <div className="text-4xl mb-3">{type.icon}</div>
                <h3 className="heading-secondary text-lg mb-2">{type.title}</h3>
                <p className="text-gray-600 text-sm">{type.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-12 text-white">
          <Award className="w-16 h-16 mx-auto mb-6 opacity-90" />
          <h2 className="heading-primary text-3xl mb-4">Ready to Make a Global Impact?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join our community of partners who are transforming education through 
            international collaboration and sustainable development.
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8" asChild>
            <Link href="/partner/onboarding">
              Begin Partner Registration
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-gray-200 mt-16">
        <div className="text-center text-gray-600">
          <p className="mb-2">© 2024 Class2Class.org - Connecting classrooms globally</p>
          <p className="text-sm">
            Need help? Contact us at{' '}
            <a href="mailto:support@class2class.org" className="c2c-purple hover:underline">
              support@class2class.org
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
