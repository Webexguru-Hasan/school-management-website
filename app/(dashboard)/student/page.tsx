'use client';

import React, { useEffect, useState } from 'react';
import StatCard from '@/components/StatCard';
import { BookOpen, CheckSquare, FileText, Bell } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function StudentDashboard() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  // Mocked for MVP demonstration
  const recentNotices = [
    { title: 'Mid-term Exams Schedule Released', date: '2024-10-15' },
    { title: 'Science Fair Registration Open', date: '2024-10-18' },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-display font-bold text-slate-900">Student Portal</h1>
        <p className="text-sm text-slate-500 mt-1">Check your grades, attendance, and latest school announcements.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard 
          title="Attendance Rate" 
          value="95%" 
          icon={CheckSquare} 
          color="emerald"
        />
        <StatCard 
          title="Current Grade" 
          value="A-" 
          icon={BookOpen} 
          color="blue"
        />
        <StatCard 
          title="Missing Assignments" 
          value={0} 
          icon={FileText} 
          color="amber"
        />
        <StatCard 
          title="School Notices" 
          value={recentNotices.length} 
          icon={Bell} 
          color="indigo"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-4">
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
          <h2 className="text-lg font-bold font-display text-slate-900">Recent Grades</h2>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div>
                <div className="font-bold text-slate-800">Mathematics</div>
                <div className="text-sm text-slate-500">Mid-Term Assessment</div>
              </div>
              <div className="text-xl font-bold font-display text-blue-600">92/100</div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <div className="font-bold text-slate-800">English Literature</div>
                <div className="text-sm text-slate-500">Essay Assignment</div>
              </div>
              <div className="text-xl font-bold font-display text-emerald-600">88/100</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
