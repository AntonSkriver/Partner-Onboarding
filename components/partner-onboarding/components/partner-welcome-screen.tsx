"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import { ArrowRight, Sparkles, Globe2, Users, Zap } from "lucide-react"

interface PartnerWelcomeScreenProps {
  onNext: () => void
  onPrevious: () => void
  onGoToStep: (step: number) => void
}

export function PartnerWelcomeScreen({ onNext }: PartnerWelcomeScreenProps) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0f0a1f]">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute w-[800px] h-[800px] rounded-full opacity-30 blur-[120px] animate-pulse"
          style={{
            background: 'radial-gradient(circle, #8157D9 0%, transparent 70%)',
            top: '-20%',
            right: '-10%',
            animationDuration: '4s',
          }}
        />
        <div
          className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-[100px] animate-pulse"
          style={{
            background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)',
            bottom: '-10%',
            left: '-5%',
            animationDuration: '5s',
            animationDelay: '1s',
          }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full opacity-25 blur-[80px] animate-pulse"
          style={{
            background: 'radial-gradient(circle, #a78bfa 0%, transparent 70%)',
            top: '40%',
            left: '30%',
            animationDuration: '6s',
            animationDelay: '2s',
          }}
        />
      </div>

      {/* Orbital connection lines */}
      <svg
        className="absolute inset-0 w-full h-full opacity-20"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="orbitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8157D9" stopOpacity="0" />
            <stop offset="50%" stopColor="#8157D9" stopOpacity="1" />
            <stop offset="100%" stopColor="#8157D9" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Orbital paths */}
        <ellipse cx="500" cy="500" rx="400" ry="200" fill="none" stroke="url(#orbitGradient)" strokeWidth="1" className="animate-[spin_60s_linear_infinite]" style={{ transformOrigin: '500px 500px' }} />
        <ellipse cx="500" cy="500" rx="350" ry="350" fill="none" stroke="url(#orbitGradient)" strokeWidth="0.5" className="animate-[spin_90s_linear_infinite_reverse]" style={{ transformOrigin: '500px 500px' }} />
        <ellipse cx="500" cy="500" rx="250" ry="150" fill="none" stroke="url(#orbitGradient)" strokeWidth="1" className="animate-[spin_45s_linear_infinite]" style={{ transformOrigin: '500px 500px', transform: 'rotate(60deg)' }} />
      </svg>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-purple-400 rounded-full animate-float opacity-40"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${4 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(129, 87, 217, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(129, 87, 217, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12">
        {/* Logo */}
        <div
          className="mb-8 animate-fade-in"
          style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}
        >
          <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
            <Image
              src="/isotipo.png"
              alt="Class2Class"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <span className="text-white/90 font-medium tracking-wide">Class2Class</span>
          </div>
        </div>

        {/* Headline section */}
        <div
          className="text-center max-w-4xl mx-auto mb-12 animate-fade-in"
          style={{ animationDelay: '0.4s', animationFillMode: 'backwards' }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#8157D9]/20 border border-[#8157D9]/30 mb-6">
            <Sparkles className="w-4 h-4 text-[#8157D9]" />
            <span className="text-[#8157D9] text-sm font-medium">Partner Registration</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
            Join the movement
            <br />
            <span className="bg-gradient-to-r from-[#8157D9] via-[#a78bfa] to-[#8157D9] bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
              connecting classrooms
            </span>
            <br />
            worldwide
          </h1>

          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
            Partner with 4,500+ educators across 134 countries to create
            meaningful, SDG-aligned learning experiences that shape the next generation.
          </p>
        </div>

        {/* CTA section */}
        <div
          className="flex flex-col items-center gap-4 mb-16 animate-fade-in"
          style={{ animationDelay: '0.6s', animationFillMode: 'backwards' }}
        >
          <Button
            onClick={onNext}
            size="lg"
            className="group relative px-8 py-6 text-lg font-semibold rounded-full bg-[#8157D9] hover:bg-[#7048C6] text-white shadow-[0_0_40px_rgba(129,87,217,0.4)] hover:shadow-[0_0_60px_rgba(129,87,217,0.6)] transition-all duration-300 hover:scale-105"
          >
            <span className="flex items-center gap-2">
              Begin Your Journey
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Button>

          <p className="text-white/40 text-sm flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Takes only 5 minutes to complete
          </p>
        </div>

        {/* Feature cards */}
        <div
          className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto w-full animate-fade-in"
          style={{ animationDelay: '0.8s', animationFillMode: 'backwards' }}
        >
          <div className="group relative p-6 rounded-2xl bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] hover:border-[#8157D9]/30 hover:bg-white/[0.05] transition-all duration-500">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#8157D9]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-[#8157D9]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Globe2 className="w-6 h-6 text-[#8157D9]" />
              </div>
              <h3 className="font-semibold text-white mb-2">Global Network</h3>
              <p className="text-sm text-white/50 leading-relaxed">
                Connect with schools across 134+ countries. Your initiatives reach classrooms where they matter most.
              </p>
            </div>
          </div>

          <div className="group relative p-6 rounded-2xl bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] hover:border-[#8157D9]/30 hover:bg-white/[0.05] transition-all duration-500 md:translate-y-4">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#8157D9]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-[#8157D9]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-6 h-6 text-[#8157D9]" />
              </div>
              <h3 className="font-semibold text-white mb-2">Real Impact</h3>
              <p className="text-sm text-white/50 leading-relaxed">
                47,500+ students engaged. Track your contribution to global education goals in real-time.
              </p>
            </div>
          </div>

          <div className="group relative p-6 rounded-2xl bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] hover:border-[#8157D9]/30 hover:bg-white/[0.05] transition-all duration-500">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#8157D9]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-[#8157D9]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-6 h-6 text-[#8157D9]" />
              </div>
              <h3 className="font-semibold text-white mb-2">SDG Aligned</h3>
              <p className="text-sm text-white/50 leading-relaxed">
                Every project connects to UN Sustainable Development Goals. Purpose-driven collaboration.
              </p>
            </div>
          </div>
        </div>

        {/* Trust bar */}
        <div
          className="mt-16 pt-8 border-t border-white/[0.06] animate-fade-in"
          style={{ animationDelay: '1s', animationFillMode: 'backwards' }}
        >
          <p className="text-white/30 text-xs uppercase tracking-widest mb-4 text-center">
            Trusted by leading organizations
          </p>
          <div className="flex items-center justify-center gap-10 opacity-40">
            <div className="text-white/60 font-semibold text-sm tracking-wide">UNICEF</div>
            <div className="w-1 h-1 rounded-full bg-white/20" />
            <div className="text-white/60 font-semibold text-sm tracking-wide">UNESCO</div>
            <div className="w-1 h-1 rounded-full bg-white/20" />
            <div className="text-white/60 font-semibold text-sm tracking-wide">LEGO Education</div>
            <div className="w-1 h-1 rounded-full bg-white/20" />
            <div className="text-white/60 font-semibold text-sm tracking-wide">Microsoft</div>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0.2;
          }
          50% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.6;
          }
        }

        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-float {
          animation: float 4s ease-in-out infinite;
        }

        .animate-gradient {
          animation: gradient 6s ease infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
