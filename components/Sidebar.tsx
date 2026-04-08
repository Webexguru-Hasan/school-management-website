'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  CheckSquare, 
  BookOpen, 
  GraduationCap, 
  CreditCard, 
  FileText, 
  Bell, 
  BarChart, 
  Menu,
  X 
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  {
    name: 'Academic',
    items: [
      { name: 'Students', href: '/students', icon: Users },
      { name: 'Admission', href: '/admission', icon: UserPlus },
      { name: 'Attendance', href: '/attendance', icon: CheckSquare },
      { name: 'Classes', href: '/classes', icon: BookOpen },
    ],
  },
  {
    name: 'Staff',
    items: [
      { name: 'Teachers', href: '/teachers', icon: GraduationCap },
    ],
  },
  {
    name: 'Finance',
    items: [
      { name: 'Fee Management', href: '/fees', icon: CreditCard },
    ],
  },
  {
    name: 'Academics',
    items: [
      { name: 'Results', href: '/results', icon: FileText },
    ],
  },
  {
    name: 'Communication',
    items: [
      { name: 'Notices', href: '/notices', icon: Bell },
    ],
  },
  {
    name: 'Analytics',
    items: [
      { name: 'Reports', href: '/reports', icon: BarChart },
    ],
  },
];

export default function Sidebar({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
      {/* Mobile sidebar backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-slate-900/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900 font-display">
              {process.env.NEXT_PUBLIC_SCHOOL_NAME || 'School MS'}
            </span>
          </Link>
          <button onClick={() => setIsOpen(false)} className="lg:hidden p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="h-[calc(100vh-4rem)] overflow-y-auto p-4 no-scrollbar">
          <nav className="space-y-6">
            <div className="space-y-1">
              {navItems.filter(item => !item.items).map((item) => {
                const Icon = item.icon!;
                const isActive = pathname === item.href;
                return (
                  <Link 
                    key={item.href} 
                    href={item.href!}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {navItems.filter(item => item.items).map((group) => (
              <div key={group.name} className="space-y-1">
                <div className="px-3 mb-2 text-xs font-semibold tracking-wider text-slate-400 uppercase">
                  {group.name}
                </div>
                {group.items?.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link 
                      key={item.href} 
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between h-16 px-4 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOpen(true)}
              className="p-2 -ml-2 rounded-md text-slate-500 hover:bg-slate-100"
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="font-bold font-display text-slate-900 text-lg">
              {process.env.NEXT_PUBLIC_SCHOOL_NAME || 'School MS'}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 lg:pt-8 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
