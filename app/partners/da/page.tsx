'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  School, 
  Target, 
  Users, 
  Globe,
  Heart,
  BookOpen,
  CheckCircle,
  ArrowRight,
  Building,
  Handshake
} from 'lucide-react'
import { LanguageSwitcher } from '@/components/language-switcher'
import Link from 'next/link'
import { SDGIconsGrid } from '@/components/sdg-icons'

// Danish translations for the SDG titles
const danishSDGTitles = {
  4: "Kvalitetsuddannelse",
  10: "Mindre ulighed",
  16: "Fred, retfærdighed og stærke institutioner",
  17: "Partnerskaber for målene"
}

const partnerTypes = [
  {
    type: "NGO&apos;er & nonprofit",
    icon: Heart,
    description: "Forbind jeres mission med klasseværelser verden over",
    examples: ["UNICEF", "Red Barnet", "Oxfam"]
  },
  {
    type: "Uddannelsesnetværk",
    icon: School,
    description: "Udvid jeres rækkevidde til globale uddannelsesfællesskaber",
    examples: ["UNESCO-skoler", "International Baccalaureate", "Rettighedsskoler"]
  },
  {
    type: "Statslige organisationer",
    icon: Building,
    description: "Promover kulturel udveksling og uddannelsesdiplomati",
    examples: ["Undervisningsministeriet", "Kulturinstitutter", "Ambassadeprogrammer"]
  },
  {
    type: "Virksomhedspartnere",
    icon: Handshake,
    description: "Del ekspertise og skab meningsfuld social påvirkning",
    examples: ["Teknologivirksomheder", "Bæredygtighedsledere", "Sociale virksomheder"]
  }
]

const benefits = [
  {
    icon: Users,
    title: "Udvid jeres netværk",
    description: "Forbind med skoler og uddannere på tværs af 50+ lande"
  },
  {
    icon: Target,
    title: "Forstærk jeres mission",
    description: "Del jeres indhold og projekter med tusindvis af elever"
  },
  {
    icon: Globe,
    title: "Følg jeres påvirkning",
    description: "Overvåg engagement og mål succesen af jeres initiativer"
  },
  {
    icon: BookOpen,
    title: "Uddannelsesressourcer",
    description: "Upload og del jeres uddannelsesmaterialer med partnerskoler"
  }
]

const howItWorks = [
  {
    step: 1,
    title: "Bliv medlem af vores partnerprogram",
    description: "Fuldfør vores guidede onboarding for at oprette jeres organisationsprofil"
  },
  {
    step: 2,
    title: "Inviter skoler til samarbejde",
    description: "Forbind med skoler i jeres netværk eller find nye uddannelsespartnere"
  },
  {
    step: 3,
    title: "Start samarbejdsprojekter",
    description: "Skab og vær vært for projekter der stemmer overens med jeres mission og verdensmål"
  },
  {
    step: 4,
    title: "Del ressourcer og følg påvirkning",
    description: "Upload uddannelsesindhold og overvåg engagement på tværs af jeres netværk"
  }
]

export default function PartnersLandingPageDanish() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">C2C</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">Class2Class</span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-600 hover:text-gray-900">Sådan fungerer det</Link>
              <Link href="/" className="text-gray-600 hover:text-gray-900">Platform</Link>
              <Link href="/" className="text-gray-600 hover:text-gray-900">Succeshistorier</Link>
              <Link href="/" className="text-gray-600 hover:text-gray-900">Om os</Link>
              <LanguageSwitcher />
              <div className="flex items-center space-x-3">
                <Link href="/partner/login">
                  <Button variant="ghost">Log ind</Button>
                </Link>
                <Link href="/partner/onboarding">
                  <Button className="bg-purple-600 hover:bg-purple-700">Tilmeld dig</Button>
                </Link>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Bliv partner med os for at transformere 
              <span className="block">global uddannelse</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-purple-100">
              Forbind jeres organisation med klasseværelser verden over. Del jeres mission, 
              skab samarbejdsprojekter og gør en varig forskel for global uddannelse.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/partner/onboarding">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-50 px-8 py-3 text-lg font-semibold">
                  Start jeres partnerskab
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600 px-8 py-3 text-lg font-semibold">
                Lær mere
              </Button>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 pt-8 border-t border-purple-300">
              <div className="text-center">
                <div className="text-2xl font-bold">50+</div>
                <div className="text-purple-200 text-sm">Lande</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">500+</div>
                <div className="text-purple-200 text-sm">Skoler</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">2,000+</div>
                <div className="text-purple-200 text-sm">Lærere</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">25,000+</div>
                <div className="text-purple-200 text-sm">Elever</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who Can Partner */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Hvem kan blive partner?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Vi byder organisationer velkommen, som deler vores vision om at forbinde klasseværelser 
              globalt og skabe meningsfulde uddannelsesoplevelser.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {partnerTypes.map((partner, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow border-purple-200">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <partner.icon className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-lg">{partner.type}</CardTitle>
                  <CardDescription>{partner.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Eksempler:</p>
                    {partner.examples.map((example, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-600">{example}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Hvorfor blive partner med Class2Class?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Bliv medlem af et globalt netværk af uddannere og organisationer, som arbejder sammen 
              om at skabe meningsfulde forbindelser mellem klasseværelser verden over.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <benefit.icon className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Sådan fungerer partnerskab
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Kom i gang på få minutter med vores strømlinede partnerproces designet 
              til hurtigt at få jeres organisation forbundet med klasseværelser.
            </p>
          </div>
          
          <div className="relative">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {howItWorks.map((step, index) => (
                <div key={index} className="relative">
                  <Card className="hover:shadow-lg transition-shadow h-full">
                    <CardHeader className="text-center pb-4">
                      <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                        {step.step}
                      </div>
                      <CardTitle className="text-lg">{step.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-center">{step.description}</p>
                    </CardContent>
                  </Card>
                  {/* Arrow connector for desktop */}
                  {index < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                      <ArrowRight className="h-6 w-6 text-purple-400" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SDG Alignment */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              I overensstemmelse med FN&apos;s verdensmål
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Vores partnerskaber bidrager direkte til at opnå FN&apos;s verdensmål og skaber 
              målbar påvirkning på global uddannelse og udvikling.
            </p>
          </div>
          
          <SDGIconsGrid 
            sdgNumbers={[4, 10, 16, 17]} 
            size="lg"
            showTitles={true}
            customTitles={danishSDGTitles}
          />
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Klar til at transformere global uddannelse?
          </h2>
          <p className="text-xl mb-8 text-purple-100">
            Bliv medlem sammen med førende organisationer verden over i at skabe meningsfulde forbindelser 
            mellem klasseværelser og gøre en varig forskel for global uddannelse.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/partner/onboarding">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-50 px-8 py-3 text-lg font-semibold">
                Start jeres partnerskab
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600 px-8 py-3 text-lg font-semibold">
              Kontakt os
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">C2C</span>
              </div>
              <span className="text-lg font-semibold">Class2Class</span>
            </div>
            <div className="text-sm text-gray-400">
              © 2025 Class2Class. Forbinder klasseværelser for en bedre verden.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}