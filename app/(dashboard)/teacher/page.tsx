'use client';

import React, { useEffect, useState } from 'react';
import StatCard from '@/components/StatCard';
import { Users, CheckSquare, FileText, Bell } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function TeacherDashboard() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);
  
  // We mock the assigned classes count for now.
  const assignedClassesCount = 4;
  const recentNotices = [
    { title: 'Mid-term Exams Schedule Released', date: '2024-10-15' },
    { title: 'Faculty Meeting on Friday', date: '2024-10-16' },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-display font-bold text-slate-900">Teacher Portal</h1>
        <p className="text-sm text-slate-500 mt-1">Welcome back, Educator. Manage your classes and students.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard 
          title="My Classes" 
          value={assignedClassesCount} 
          icon={Users} 
          color="blue"
        />
        <StatCard 
          title="Attendance Pending" 
          value={1} 
          icon={CheckSquare} 
          color="amber"
        />
        <StatCard 
          title="Pending Gradings" 
          value={24} 
          icon={FileText} 
          color="indigo"
        />
        <StatCard 
          title="Unread Notices" 
          value={recentNotices.length} 
          icon={Bell} 
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
          <h2 className="text-lg font-bold font-display text-slate-900">Recent School Notices</h2>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-6">
            <ul className="space-y-4">
              {recentNotices.map((notice, idx) => (
                <li key={idx} className="flex justify-between items-center pb-4 border-b border-slate-100 last:pb-0 last:border-0">
                  <div className="font-medium text-slate-800">{notice.title}</div>
                  <div className="text-sm text-slate-500">{notice.date}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold font-display text-slate-900">My Tools</h2>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col gap-2">
            <button className="flex items-center px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 text-left">
              <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mr-4">
                <CheckSquare className="w-5 h-5"/>
              </span>
              <span className="font-bold text-slate-700">Mark Attendance</span>
              <span className="ml-auto text-slate-400">→</span>
            </button>
            <button className="flex items-center px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 text-left">
              <span className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mr-4">
                <FileText className="w-5 h-5"/>
              </span>
              <span className="font-bold text-slate-700">Enter Student Marks</span>
              <span className="ml-auto text-slate-400">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
