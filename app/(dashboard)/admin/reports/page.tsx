'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import LoadingSpinner from '@/components/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, BookOpen, Wallet, Activity } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function ReportsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [admissionData, setAdmissionData] = useState<any[]>([]);
  const [genderData, setGenderData] = useState<any[]>([]);
  const [feeData, setFeeData] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    totalStudents: 0,
    activeTeachers: 0,
    totalClasses: 0,
    collectedFees: 0
  });

  const COLORS = ['#0ea5e9', '#ec4899', '#f59e0b', '#10b981'];

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      const [studentsRes, teachersRes, classesRes, feesRes] = await Promise.all([
        supabase.from('students').select('id, gender, admission_date, status'),
        supabase.from('teachers').select('id').eq('status', 'active'),
        supabase.from('classes').select('id'),
        supabase.from('fee_payments').select('paid_amount, status')
      ]);

      const students = studentsRes.data || [];
      const fees = feesRes.data || [];

      // 1. Compute Summary
      const totalStudents = students.length;
      const activeTeachers = teachersRes.data?.length || 0;
      const totalClasses = classesRes.data?.length || 0;
      let collectedFees = 0;
      fees.forEach(f => {
        if (f.status === 'paid' || f.status === 'partial') {
          collectedFees += Number(f.paid_amount);
        }
      });
      setSummary({ totalStudents, activeTeachers, totalClasses, collectedFees });

      // 2. Compute Gender Distribution for Pie Chart
      let male = 0, female = 0, other = 0;
      students.forEach(s => {
        if (s.gender?.toLowerCase() === 'male') male++;
        else if (s.gender?.toLowerCase() === 'female') female++;
        else other++;
      });
      setGenderData([
        { name: 'Male', value: male },
        { name: 'Female', value: female }
      ]);
      if (other > 0) setGenderData(prev => [...prev, { name: 'Other', value: other }]);

      // 3. Compute Monthly Admission Trend for Bar Chart
      const monthlyCounts: Record<string, number> = {};
      const sortedStudents = [...students].sort((a,b) => new Date(a.admission_date).getTime() - new Date(b.admission_date).getTime());
      
      sortedStudents.forEach(s => {
        if (!s.admission_date) return;
        const monthYear = format(parseISO(s.admission_date), 'MMM yyyy');
        monthlyCounts[monthYear] = (monthlyCounts[monthYear] || 0) + 1;
      });

      // Take last 6 months recorded
      const trendData = Object.keys(monthlyCounts).map(key => ({
        month: key,
        admissions: monthlyCounts[key]
      }));
      setAdmissionData(trendData.slice(-6));

      // 4. Fee Overview
      let pending = 0, paid = 0, overdue = 0;
      fees.forEach(f => {
        if (f.status === 'paid') paid++;
        else if (f.status === 'pending' || f.status === 'partial') pending++;
        else if (f.status === 'overdue') overdue++;
      });
      setFeeData([
        { name: 'Paid', value: paid, fill: '#10b981' },
        { name: 'Pending', value: pending, fill: '#f59e0b' },
        { name: 'Overdue', value: overdue, fill: '#ef4444' }
      ]);


    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="py-20"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 font-display">Analytics & Reports</h1>
        <p className="text-slate-500 mt-1">School-wide data insights and performance metrics.</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Enrollments</p>
            <h3 className="text-2xl font-bold text-slate-900 font-display">{summary.totalStudents}</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users className="w-6 h-6" /></div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Active Staff</p>
            <h3 className="text-2xl font-bold text-slate-900 font-display">{summary.activeTeachers}</h3>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Activity className="w-6 h-6" /></div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Classes</p>
            <h3 className="text-2xl font-bold text-slate-900 font-display">{summary.totalClasses}</h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><BookOpen className="w-6 h-6" /></div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Revenue</p>
            <h3 className="text-2xl font-bold text-slate-900 font-display">৳ {summary.collectedFees.toLocaleString()}</h3>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Wallet className="w-6 h-6" /></div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Admissions Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6 font-display">Monthly Admission Trends</h3>
          <div className="h-72 w-full">
            {admissionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={admissionData} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}/>
                  <Bar dataKey="admissions" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">Not enough data to display chart</div>
            )}
          </div>
        </div>

        {/* Demographics Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6 font-display">Student Gender Distribution</h3>
          <div className="h-72 w-full">
            {genderData.length > 0 && summary.totalStudents > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}/>
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '13px', paddingTop: '20px' }}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">Not enough data to display chart</div>
            )}
          </div>
        </div>

        {/* Fee Collection Status */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6 font-display">Fee Invoice Statuses</h3>
          <div className="h-72 w-full">
            {feeData.some(f => f.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={feeData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 13, fontWeight: 600 }} width={80} />
                  <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}/>
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={40}>
                    {feeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">No fee records found</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
