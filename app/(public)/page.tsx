import React from 'react';
import Link from 'next/link';
import { BookOpen, MapPin, Phone, Mail, ChevronRight, Users, Star } from 'lucide-react';

export default function PublicLandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 font-display hidden sm:block">
              {process.env.NEXT_PUBLIC_SCHOOL_NAME || 'Bright Future School'}
            </span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 font-medium text-slate-600">
            <Link href="#about" className="hover:text-blue-600 transition-colors">About</Link>
            <Link href="#academics" className="hover:text-blue-600 transition-colors">Academics</Link>
            <Link href="#contact" className="hover:text-blue-600 transition-colors">Contact</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/login" className="px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
              Log in
            </Link>
            <Link href="/signup" className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm shadow-blue-600/20">
              Apply Now
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-5"></div>
        <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-blue-50 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-block px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 font-semibold text-sm mb-6">
              Admissions Open for 2024-2025
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold font-display text-slate-900 leading-tight mb-8">
              Empowering the next generation of <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">leaders.</span>
            </h1>
            <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl">
              {process.env.NEXT_PUBLIC_SCHOOL_TAGLINE || 'A comprehensive learning environment designed to foster creativity, critical thinking, and excellence.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/signup" className="px-8 py-4 text-base font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-2xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 group">
                Begin Application 
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform"/>
              </Link>
              <Link href="/login" className="px-8 py-4 text-base font-bold text-slate-700 bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-2xl transition-all flex items-center justify-center">
                Student & Parent Portal
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 bg-slate-50 border-y border-slate-200" id="academics">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-display text-slate-900 mb-4">Why Choose Us?</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">We provide a holistic educational experience combining modern curriculum with state-of-the-art facilities.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Modern Curriculum</h3>
              <p className="text-slate-600 leading-relaxed">Integrated STEM programs, advanced language arts, and comprehensive digital literacy courses.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm shadow-blue-900/5 relative -top-4">
              <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-md shadow-blue-600/20">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Expert Faculty</h3>
              <p className="text-slate-600 leading-relaxed">Learn from award-winning educators dedicated to personalized student success and mentorship.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                <Star className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Holistic Development</h3>
              <p className="text-slate-600 leading-relaxed">Extensive extracurricular programs spanning athletics, arts, debate, and community service.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16" id="contact">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            <div className="sm:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-blue-400" />
                </div>
                <span className="text-xl font-bold text-white font-display">
                  {process.env.NEXT_PUBLIC_SCHOOL_NAME || 'Bright Future School'}
                </span>
              </div>
              <p className="max-w-sm leading-relaxed mb-6">
                {process.env.NEXT_PUBLIC_SCHOOL_TAGLINE || 'A comprehensive school management solution'}
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-6">Quick Links</h4>
              <ul className="space-y-3">
                <li><Link href="#about" className="hover:text-blue-400 transition-colors">About Us</Link></li>
                <li><Link href="#academics" className="hover:text-blue-400 transition-colors">Academics Curriculum</Link></li>
                <li><Link href="/login" className="hover:text-blue-400 transition-colors">Portals Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-6">Contact Us</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-slate-500 shrink-0" />
                  <span>123 Education Lane<br/>Knowledge City, 10001</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-slate-500" />
                  <span>+1 (555) 123-4567</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-slate-500" />
                  <span>admissions@school.edu</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 text-sm text-slate-500 text-center flex flex-col sm:flex-row justify-between items-center gap-4">
            <p>© {new Date().getFullYear()} {process.env.NEXT_PUBLIC_SCHOOL_NAME || 'School'}. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
