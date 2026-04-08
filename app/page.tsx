'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import StatCard from '@/components/StatCard';
import DataTable from '@/components/DataTable';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Users, UserCheck, GraduationCap, AlertCircle, Plus, Check, DollarSign } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    totalTeachers: 0,
    pendingFees: 0,
  });
  const [recentStudents, setRecentStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [
        { count: totalStudents },
        { count: activeStudents },
        { count: totalTeachers },
        { count: pendingFees },
        { data: studentsData },
      ] = await Promise.all([
        supabase.from('students').select('*', { count: 'exact', head: true }),
        supabase.from('students').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('teachers').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('fee_payments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('students').select('id, full_name, admission_no, status, classes(name, section)')
          .order('created_at', { ascending: false }).limit(5),
      ]);

      setStats({
        totalStudents: totalStudents || 0,
        activeStudents: activeStudents || 0,
        totalTeachers: totalTeachers || 0,
        pendingFees: pendingFees || 0,
      });
      setRecentStudents(studentsData || []);
    } catch (e) {
      console.error('Failed to load dashboard data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="py-20"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-display font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Welcome back. Here's an overview of your school.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard 
          title="Total Enrolled Students" 
          value={stats.totalStudents} 
          icon={Users} 
          color="blue"
        />
        <StatCard 
          title="Active Students" 
          value={stats.activeStudents} 
          icon={UserCheck} 
          color="green"
        />
        <StatCard 
          title="Active Teachers" 
          value={stats.totalTeachers} 
          icon={GraduationCap} 
          color="amber"
        />
        <StatCard 
          title="Pending Fees" 
          value={stats.pendingFees} 
          icon={AlertCircle} 
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-display text-slate-900">Recent Admissions</h2>
            <Link href="/students" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
              View All
            </Link>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <DataTable 
              data={recentStudents}
              isLoading={isLoading}
              columns={[
                { header: 'Admission No', accessor: 'admission_no' },
                { header: 'Student Name', accessor: 'full_name' },
                { 
                  header: 'Class', 
                  accessor: (row: any) => row.classes ? `${row.classes.name} - ${row.classes.section}` : 'N/A' 
                },
                { 
                  header: 'Status', 
                  accessor: (row: any) => (
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${row.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      {row.status.toUpperCase()}
                    </span>
                  ) 
                },
              ]}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold font-display text-slate-900">Quick Actions</h2>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col gap-2">
            <Link href="/admission" className="flex items-center px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
              <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mr-4">
                <Plus className="w-5 h-5"/>
              </span>
              <span className="font-bold text-slate-700">New Admission</span>
              <span className="ml-auto text-slate-400">→</span>
            </Link>
            <Link href="/attendance" className="flex items-center px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
              <span className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mr-4">
                <Check className="w-5 h-5"/>
              </span>
              <span className="font-bold text-slate-700">Mark Attendance</span>
              <span className="ml-auto text-slate-400">→</span>
            </Link>
            <Link href="/fees" className="flex items-center px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
              <span className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mr-4">
                <DollarSign className="w-5 h-5"/>
              </span>
              <span className="font-bold text-slate-700">Collect Fee</span>
              <span className="ml-auto text-slate-400">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
