'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function EditStudent({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [classes, setClasses] = useState<any[]>([]);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const [classRes, studentRes] = await Promise.all([
        supabase.from('classes').select('id, name, section').order('name'),
        supabase.from('students').select('*').eq('id', params.id).single()
      ]);

      if (classRes.data) setClasses(classRes.data);
      if (studentRes.data) {
        setFormData(studentRes.data);
      } else {
        toast.error("Student not found");
        router.push('/students');
      }
      setIsLoading(false);
    }
    fetchData();
  }, [params.id, router]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.from('students').update({
        full_name: formData.full_name,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        blood_group: formData.blood_group || null,
        religion: formData.religion || null,
        nationality: formData.nationality,
        medical_conditions: formData.medical_conditions || null,
        class_id: formData.class_id,
        roll_no: formData.roll_no || null,
        admission_date: formData.admission_date,
        academic_year: formData.academic_year,
        previous_school: formData.previous_school || null,
        special_notes: formData.special_notes || null,
        status: formData.status,
        father_name: formData.father_name || null,
        father_phone: formData.father_phone || null,
        father_occupation: formData.father_occupation || null,
        mother_name: formData.mother_name || null,
        mother_phone: formData.mother_phone || null,
        mother_occupation: formData.mother_occupation || null,
        guardian_name: formData.guardian_name || null,
        guardian_phone: formData.guardian_phone || null,
        guardian_relation: formData.guardian_relation || null,
        email: formData.email || null,
        phone: formData.phone || null,
        address: formData.address,
        city: formData.city || null,
        district: formData.district || null,
        emergency_contact_name: formData.emergency_contact_name || null,
        emergency_contact_phone: formData.emergency_contact_phone || null,
        emergency_contact_relation: formData.emergency_contact_relation || null,
      }).eq('id', params.id);

      if (error) throw error;

      toast.success(`Student updated successfully!`);
      router.push('/students');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update student');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="py-20"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-display">Edit Student</h1>
          <p className="text-slate-500 mt-1">Admission No: {formData.admission_no}</p>
        </div>
        <button 
          onClick={() => router.back()} 
          className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-6 sm:p-10 space-y-10">
        
        {/* Personal & Academic Status */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800 font-display border-b border-slate-100 pb-2">Status & Core Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
              <input required type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400" value={formData.full_name || ''} onChange={e => handleInputChange('full_name', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Current Status</label>
              <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400 font-semibold" value={formData.status || 'active'} onChange={e => handleInputChange('status', e.target.value)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="graduated">Graduated</option>
                <option value="transferred">Transferred</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Enrolling Class</label>
              <select required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400" value={formData.class_id || ''} onChange={e => handleInputChange('class_id', e.target.value)}>
                <option value="">Select a class...</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name} - Sec {c.section}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Date of Birth</label>
              <input required type="date" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400" value={formData.date_of_birth || ''} onChange={e => handleInputChange('date_of_birth', e.target.value)} />
            </div>
          </div>
        </div>

        {/* The rest of the form fields can be dynamically filled if they need to change them */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800 font-display border-b border-slate-100 pb-2">Parent/Contact Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Father's Name</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400" value={formData.father_name || ''} onChange={e => handleInputChange('father_name', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Father's Phone</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400" value={formData.father_phone || ''} onChange={e => handleInputChange('father_phone', e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Full Address</label>
              <textarea required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400 min-h-[80px]" value={formData.address || ''} onChange={e => handleInputChange('address', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 flex justify-end">
          <button 
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-md transition-all active:scale-95 disabled:opacity-70"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
