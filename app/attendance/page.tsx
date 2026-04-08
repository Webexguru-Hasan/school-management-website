'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';
import { Users, CheckCircle, XCircle, Clock, Save } from 'lucide-react';

type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export default function AttendancePage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, { status: AttendanceStatus, remarks: string }>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchClasses() {
      const { data } = await supabase.from('classes').select('*').order('name');
      if (data) setClasses(data);
    }
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClassId && selectedDate) {
      fetchStudentsAndAttendance();
    } else {
      setStudents([]);
      setAttendance({});
    }
  }, [selectedClassId, selectedDate]);

  const fetchStudentsAndAttendance = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Students in that class
      const { data: studentsData, error: studentError } = await supabase
        .from('students')
        .select('id, full_name, roll_no, admission_no')
        .eq('class_id', selectedClassId)
        .eq('status', 'active')
        .order('full_name');
        
      if (studentError) throw studentError;
      
      const loadedStudents = studentsData || [];
      setStudents(loadedStudents);

      // 2. Fetch existing attendance for that date & class
      const { data: attendanceData, error: attError } = await supabase
        .from('attendance')
        .select('student_id, status, remarks')
        .eq('class_id', selectedClassId)
        .eq('date', selectedDate);

      if (attError) throw attError;

      // 3. Map it out
      const attMap: Record<string, { status: AttendanceStatus, remarks: string }> = {};
      
      // initialize all as present first, or copy existing
      loadedStudents.forEach(s => {
        const existing = attendanceData?.find(a => a.student_id === s.id);
        attMap[s.id] = {
          status: existing ? (existing.status as AttendanceStatus) : 'present',
          remarks: existing?.remarks || '',
        };
      });
      
      setAttendance(attMap);

    } catch (e: any) {
      toast.error('Failed to load data: ' + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    const newAtt = { ...attendance };
    Object.keys(newAtt).forEach(id => {
      newAtt[id].status = status;
    });
    setAttendance(newAtt);
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], status }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const records = students.map(student => ({
        student_id: student.id,
        class_id: selectedClassId,
        date: selectedDate,
        status: attendance[student.id].status,
        remarks: attendance[student.id].remarks || null,
      }));

      if (records.length === 0) {
        toast.error('No students to mark');
        return;
      }

      const { error } = await supabase.from('attendance').upsert(records, {
        onConflict: 'student_id,date'
      });

      if (error) throw error;
      toast.success('Attendance saved successfully');
    } catch (e: any) {
      toast.error('Failed to save attendance: ' + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Stats
  const totalStudents = students.length;
  const presentCount = Object.values(attendance).filter(a => a.status === 'present').length;
  const absentCount = Object.values(attendance).filter(a => a.status === 'absent').length;
  const lateCount = Object.values(attendance).filter(a => a.status === 'late').length;
  const excusedCount = Object.values(attendance).filter(a => a.status === 'excused').length;
  const attendancePercentage = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 font-display">Daily Attendance</h1>
        <p className="text-slate-500 mt-1">Mark and track daily student attendance.</p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/2">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Select Class <span className="text-red-500">*</span></label>
          <select 
            value={selectedClassId}
            onChange={e => setSelectedClassId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Select a class...</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name} - Sec {c.section}</option>
            ))}
          </select>
        </div>
        <div className="w-full md:w-1/2">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Date</label>
          <input 
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      {!selectedClassId && (
        <div className="text-center py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500">
          <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="font-semibold">Select a class to mark attendance</p>
        </div>
      )}

      {selectedClassId && isLoading && (
        <div className="py-20"><LoadingSpinner size="lg" /></div>
      )}

      {selectedClassId && !isLoading && students.length === 0 && (
        <div className="text-center py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500">
          <p className="font-semibold">No active students found in this class.</p>
        </div>
      )}

      {selectedClassId && !isLoading && students.length > 0 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          
          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total</p>
              <p className="text-2xl font-bold text-slate-800">{totalStudents}</p>
            </div>
            <div className="bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-100 shadow-sm flex flex-col justify-center">
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Present</p>
              <p className="text-2xl font-bold text-emerald-700">{presentCount}</p>
            </div>
            <div className="bg-rose-50 px-4 py-3 rounded-xl border border-rose-100 shadow-sm flex flex-col justify-center">
              <p className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-1">Absent</p>
              <p className="text-2xl font-bold text-rose-700">{absentCount}</p>
            </div>
            <div className="bg-amber-50 px-4 py-3 rounded-xl border border-amber-100 shadow-sm flex flex-col justify-center">
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Late/Exc</p>
              <p className="text-2xl font-bold text-amber-700">{lateCount + excusedCount}</p>
            </div>
            <div className="bg-blue-600 px-4 py-3 rounded-xl shadow-sm flex flex-col justify-center text-white">
              <p className="text-xs font-bold text-blue-200 uppercase tracking-wider mb-1">Rate</p>
              <p className="text-2xl font-bold">{attendancePercentage}%</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            
            {/* Toolbar */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-600 mr-2">Mark All:</span>
                <button onClick={() => handleMarkAll('present')} className="px-3 py-1.5 bg-emerald-100 text-emerald-700 font-semibold text-xs rounded-lg hover:bg-emerald-200 transition-colors">Present</button>
                <button onClick={() => handleMarkAll('absent')} className="px-3 py-1.5 bg-rose-100 text-rose-700 font-semibold text-xs rounded-lg hover:bg-rose-200 transition-colors">Absent</button>
              </div>

              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-sm active:scale-95 disabled:opacity-70"
              >
                {isSaving ? 'Saving...' : <><Save className="w-4 h-4" /> Save Attendance</>}
              </button>
            </div>

            {/* List */}
            <div className="divide-y divide-slate-100">
              {students.map((student, idx) => {
                const currentStatus = attendance[student.id]?.status || 'present';
                return (
                  <div key={student.id} className="p-4 sm:px-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center flex-shrink-0">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{student.full_name}</p>
                        <p className="text-xs font-medium text-slate-500">Roll: {student.roll_no || '-'} | Adm: {student.admission_no}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                      <button 
                        onClick={() => handleStatusChange(student.id, 'present')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${currentStatus === 'present' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> P
                      </button>
                      <button 
                        onClick={() => handleStatusChange(student.id, 'absent')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${currentStatus === 'absent' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}
                      >
                        <XCircle className="w-3.5 h-3.5" /> A
                      </button>
                      <button 
                        onClick={() => handleStatusChange(student.id, 'late')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${currentStatus === 'late' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}
                      >
                        <Clock className="w-3.5 h-3.5" /> L
                      </button>
                      <button 
                        onClick={() => handleStatusChange(student.id, 'excused')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${currentStatus === 'excused' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}
                      >
                        E
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
