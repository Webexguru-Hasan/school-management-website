'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import LoadingSpinner from '@/components/LoadingSpinner';
import Modal from '@/components/Modal';
import toast from 'react-hot-toast';
import { FileText, Save, Plus } from 'lucide-react';

export default function ResultsPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  
  const [students, setStudents] = useState<any[]>([]);
  const [marks, setMarks] = useState<Record<string, { marks_obtained: string, grade: string, remarks: string }>>({});
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Exam Modal State
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [newExam, setNewExam] = useState({
    name: 'Mid-Term Exam',
    exam_type: 'mid_term',
    class_id: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    academic_year: '2024-25'
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    const [cls, exm, sub] = await Promise.all([
      supabase.from('classes').select('*').order('name'),
      supabase.from('exams').select('*').order('start_date', { ascending: false }),
      supabase.from('subjects').select('*').order('name')
    ]);
    if (cls.data) setClasses(cls.data);
    if (exm.data) setExams(exm.data);
    if (sub.data) setSubjects(sub.data);
  };

  useEffect(() => {
    if (selectedClass && selectedExam && selectedSubject) {
      fetchStudentsAndMarks();
    } else {
      setStudents([]);
      setMarks({});
    }
  }, [selectedClass, selectedExam, selectedSubject]);

  const fetchStudentsAndMarks = async () => {
    setIsLoading(true);
    try {
      const { data: studentsData, error: sErr } = await supabase
        .from('students')
        .select('id, full_name, roll_no, admission_no')
        .eq('class_id', selectedClass)
        .eq('status', 'active')
        .order('roll_no');
      
      if (sErr) throw sErr;
      const loadedStudents = studentsData || [];
      setStudents(loadedStudents);

      const { data: resultsData, error: rErr } = await supabase
        .from('results')
        .select('*')
        .eq('exam_id', selectedExam)
        .eq('subject_id', selectedSubject);
      
      if (rErr) throw rErr;

      const marksMap: Record<string, any> = {};
      loadedStudents.forEach((stu: any) => {
        const existing = resultsData?.find(r => r.student_id === stu.id);
        marksMap[stu.id] = {
          marks_obtained: existing ? existing.marks_obtained.toString() : '',
          grade: existing ? (existing.grade || '') : '',
          remarks: existing ? (existing.remarks || '') : ''
        };
      });
      setMarks(marksMap);

    } catch (e: any) {
      toast.error('Error fetching data');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAutoGrade = (marksValue: number) => {
    // 100 max assuming standard. We can auto-calc grade strictly based on requirements
    if (marksValue >= 80) return 'A+';
    if (marksValue >= 70) return 'A';
    if (marksValue >= 60) return 'A-';
    if (marksValue >= 50) return 'B';
    if (marksValue >= 40) return 'C';
    if (marksValue >= 33) return 'D';
    return 'F';
  };

  const handleMarkChange = (studentId: string, field: string, value: string) => {
    setMarks(prev => {
      const updated = { ...prev, [studentId]: { ...prev[studentId], [field]: value } };
      // Auto logic if entering marks
      if (field === 'marks_obtained' && value !== '') {
        const numVal = parseFloat(value);
        if (!isNaN(numVal)) {
          updated[studentId].grade = calculateAutoGrade(numVal);
        }
      }
      return updated;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const recordsToUpsert = students.map(s => {
        const sm = marks[s.id];
        let gp = 0;
        if (sm.grade === 'A+') gp = 5.0;
        else if (sm.grade === 'A') gp = 4.0;
        else if (sm.grade === 'A-') gp = 3.5;
        else if (sm.grade === 'B') gp = 3.0;
        else if (sm.grade === 'C') gp = 2.0;
        else if (sm.grade === 'D') gp = 1.0;
        else gp = 0.0;

        return {
          student_id: s.id,
          exam_id: selectedExam,
          subject_id: selectedSubject,
          marks_obtained: sm.marks_obtained ? parseFloat(sm.marks_obtained) : 0,
          full_marks: 100,
          pass_marks: 33,
          grade: sm.grade || 'F',
          grade_points: gp,
          remarks: sm.remarks || null
        };
      });

      if (recordsToUpsert.length === 0) return toast.error('No students to save');

      // Clear existing records first to avoid dupes if DB constraints aren't exact
      await supabase.from('results')
        .delete()
        .eq('exam_id', selectedExam)
        .eq('subject_id', selectedSubject)
        .in('student_id', students.map(s => s.id));

      const { error } = await supabase.from('results').insert(recordsToUpsert);
      if (error) throw error;

      toast.success('Results published successfully');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('exams').insert([newExam]);
      if (error) throw error;
      toast.success('Exam created successfully');
      setIsExamModalOpen(false);
      loadInitialData(); // Refresh the exams list
    } catch(err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-display">Academic Results</h1>
          <p className="text-slate-500 mt-1">Record and publish student examination marks.</p>
        </div>
        <button 
          onClick={() => setIsExamModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Create Exam
        </button>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Class</label>
          <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400">
            <option value="">Select a class...</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name} - Sec {c.section}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Exam</label>
          <select value={selectedExam} onChange={e => setSelectedExam(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400">
            <option value="">Select an exam...</option>
            {exams.map(e => <option key={e.id} value={e.id}>{e.name} ({e.academic_year})</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Subject</label>
          <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400">
            <option value="">Select subject...</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
          </select>
        </div>
      </div>

      {!selectedClass || !selectedExam || !selectedSubject ? (
        <div className="text-center py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500">
          <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="font-semibold">Select Class, Exam, and Subject to enter marks</p>
        </div>
      ) : isLoading ? (
        <div className="py-20"><LoadingSpinner size="lg" /></div>
      ) : students.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500">
          <p className="font-semibold">No active students found in this class.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Student List ({students.length})</h3>
            <button 
              onClick={handleSave} 
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-sm active:scale-95 disabled:opacity-70"
            >
              {isSaving ? 'Saving...' : <><Save className="w-4 h-4" /> Save Results</>}
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-semibold tracking-wider text-slate-500 uppercase">Student</th>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wider text-slate-500 uppercase w-32">Marks ( out of 100 )</th>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wider text-slate-500 uppercase w-32">Grade</th>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wider text-slate-500 uppercase">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student) => {
                  const sm = marks[student.id] || {};
                  const isFail = parseFloat(sm.marks_obtained) < 33 && sm.marks_obtained !== '';
                  return (
                    <tr key={student.id} className={`hover:bg-slate-50 transition-colors group ${isFail ? 'bg-rose-50' : ''}`}>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">{student.full_name}</p>
                        <p className="text-xs text-slate-500 font-medium">Roll No: {student.roll_no || 'N/A'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <input 
                          type="number" 
                          min="0" 
                          max="100" 
                          className={`w-full px-3 py-2 rounded-lg border ${isFail ? 'border-rose-300 text-rose-700' : 'border-slate-200 text-slate-700'} focus:ring-2 focus:ring-blue-400 font-bold bg-transparent`} 
                          placeholder="0.0"
                          value={sm.marks_obtained || ''}
                          onChange={(e) => handleMarkChange(student.id, 'marks_obtained', e.target.value)}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input 
                          type="text" 
                          className={`w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-400 font-bold uppercase ${isFail ? 'text-rose-700 bg-rose-50/50' : 'text-slate-700 bg-slate-50'}`} 
                          placeholder="F"
                          maxLength={2}
                          value={sm.grade || ''}
                          onChange={(e) => handleMarkChange(student.id, 'grade', e.target.value)}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-400 bg-transparent" 
                          placeholder="Optional remarks"
                          value={sm.remarks || ''}
                          onChange={(e) => handleMarkChange(student.id, 'remarks', e.target.value)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Exam Modal */}
      <Modal isOpen={isExamModalOpen} onClose={() => setIsExamModalOpen(false)} title="Create New Exam" maxWidth="sm">
        <form onSubmit={handleCreateExam} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Exam Name <span className="text-red-500">*</span></label>
            <input required type="text" placeholder="e.g. Mid-Term 2024" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-400" value={newExam.name} onChange={e => setNewExam({...newExam, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Term / Type <span className="text-red-500">*</span></label>
            <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-400" value={newExam.exam_type} onChange={e => setNewExam({...newExam, exam_type: e.target.value})}>
              <option value="mid_term">Mid Term</option>
              <option value="final">Final Exam</option>
              <option value="unit_test">Unit Test</option>
              <option value="monthly">Monthly Test</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Target Class (Optional)</label>
            <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-400" value={newExam.class_id} onChange={e => setNewExam({...newExam, class_id: e.target.value})}>
              <option value="">All Classes</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name} - {c.section}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Start Date</label>
              <input type="date" className="w-full px-4 py-2.5 rounded-xl border border-slate-200" value={newExam.start_date} onChange={e => setNewExam({...newExam, start_date: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">End Date</label>
              <input type="date" className="w-full px-4 py-2.5 rounded-xl border border-slate-200" value={newExam.end_date} onChange={e => setNewExam({...newExam, end_date: e.target.value})} />
            </div>
          </div>
          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <button type="button" onClick={() => setIsExamModalOpen(false)} className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>
            <button type="submit" className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 shadow-sm">
              Create Exam
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
