'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Check, ChevronRight, ChevronLeft, Save } from 'lucide-react';

const steps = [
  'Personal Information',
  'Academic Details',
  'Parent Information',
  'Contact Details',
  'Review & Submit'
];

export default function AdmissionForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Personal
    full_name: '',
    date_of_birth: '',
    gender: 'Male',
    blood_group: '',
    religion: '',
    nationality: 'Bangladeshi',
    medical_conditions: '',
    
    // Step 2: Academic
    class_id: '',
    roll_no: '',
    admission_date: new Date().toISOString().split('T')[0],
    academic_year: '2024-25',
    previous_school: '',
    special_notes: '',
    
    // Step 3: Parents
    father_name: '',
    father_phone: '',
    father_occupation: '',
    mother_name: '',
    mother_phone: '',
    mother_occupation: '',
    guardian_name: '',
    guardian_phone: '',
    guardian_relation: '',
    
    // Step 4: Contact
    email: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relation: ''
  });

  useEffect(() => {
    async function fetchClasses() {
      const { data } = await supabase.from('classes').select('id, name, section').order('name');
      if (data) setClasses(data);
      if (data && data.length > 0 && !formData.class_id) {
        handleInputChange('class_id', data[0].id);
      }
    }
    fetchClasses();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number) => {
    if (step === 0) {
      if (!formData.full_name || !formData.date_of_birth) {
        toast.error('Name and Date of Birth are required');
        return false;
      }
    }
    if (step === 1) {
      if (!formData.class_id || !formData.admission_date) {
        toast.error('Class and Admission Date are required');
        return false;
      }
    }
    if (step === 3) {
      if (!formData.address) {
        toast.error('Full Address is required');
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase.from('students').insert([{
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
      }]).select('admission_no, full_name').single();

      if (error) throw error;

      toast.success(`Student admitted successfully! Admission No: ${data.admission_no}`, { duration: 5000 });
      router.push('/students');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 font-display">New Admission</h1>
        <p className="text-slate-500 mt-1">Enroll a new student into the school system.</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 rounded-full -z-10"></div>
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 rounded-full -z-10 transition-all duration-300"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          ></div>
          
          {steps.map((step, idx) => (
            <div key={step} className="flex flex-col items-center gap-2">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm border-2 transition-colors ${
                  idx < currentStep ? 'bg-blue-600 border-blue-600 text-white' : 
                  idx === currentStep ? 'bg-white border-blue-600 text-blue-600' : 
                  'bg-white border-slate-200 text-slate-400'
                }`}
              >
                {idx < currentStep ? <Check className="w-5 h-5" /> : (idx + 1)}
              </div>
              <span className={`text-xs font-semibold ${idx === currentStep ? 'text-blue-600' : 'text-slate-400'} hidden sm:block`}>
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 sm:p-10">
          
          {/* STEP 1: Personal */}
          {currentStep === 0 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in">
              <h2 className="text-xl font-bold text-slate-800 font-display mb-4">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                  <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-shadow" placeholder="John Doe" value={formData.full_name} onChange={e => handleInputChange('full_name', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Date of Birth <span className="text-red-500">*</span></label>
                  <input type="date" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-shadow" value={formData.date_of_birth} onChange={e => handleInputChange('date_of_birth', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Gender <span className="text-red-500">*</span></label>
                  <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-shadow" value={formData.gender} onChange={e => handleInputChange('gender', e.target.value)}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Blood Group</label>
                  <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-shadow" value={formData.blood_group} onChange={e => handleInputChange('blood_group', e.target.value)}>
                    <option value="">Select...</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Religion</label>
                  <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-shadow" placeholder="Islam, Hinduism etc" value={formData.religion} onChange={e => handleInputChange('religion', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Nationality</label>
                  <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-shadow" value={formData.nationality} onChange={e => handleInputChange('nationality', e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Medical Conditions (If any)</label>
                  <textarea className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-shadow min-h-[100px]" placeholder="Allergies, asthma, etc." value={formData.medical_conditions} onChange={e => handleInputChange('medical_conditions', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Academic */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in">
              <h2 className="text-xl font-bold text-slate-800 font-display mb-4">Academic Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Enrolling Class <span className="text-red-500">*</span></label>
                  <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-shadow" value={formData.class_id} onChange={e => handleInputChange('class_id', e.target.value)}>
                    <option value="">Select a class...</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name} - Sec {c.section}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Admission Date <span className="text-red-500">*</span></label>
                  <input type="date" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-shadow" value={formData.admission_date} onChange={e => handleInputChange('admission_date', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Academic Year <span className="text-red-500">*</span></label>
                  <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-shadow" value={formData.academic_year} onChange={e => handleInputChange('academic_year', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Roll No (Optional)</label>
                  <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-shadow" placeholder="To be assigned" value={formData.roll_no} onChange={e => handleInputChange('roll_no', e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Previous School (If any)</label>
                  <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-shadow" placeholder="Name of previous institution" value={formData.previous_school} onChange={e => handleInputChange('previous_school', e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Special Notes</label>
                  <textarea className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-shadow min-h-[100px]" placeholder="Any additional information..." value={formData.special_notes} onChange={e => handleInputChange('special_notes', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Parents */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in">
              <h2 className="text-xl font-bold text-slate-800 font-display mb-4">Parent Information</h2>
              
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                <h3 className="font-semibold text-slate-700 border-b border-slate-200 pb-2">Father's Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Name</label>
                    <input type="text" className="w-full px-4 py-2 rounded-lg border border-slate-200" value={formData.father_name} onChange={e => handleInputChange('father_name', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Phone</label>
                    <input type="text" className="w-full px-4 py-2 rounded-lg border border-slate-200" value={formData.father_phone} onChange={e => handleInputChange('father_phone', e.target.value)} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Occupation</label>
                    <input type="text" className="w-full px-4 py-2 rounded-lg border border-slate-200" value={formData.father_occupation} onChange={e => handleInputChange('father_occupation', e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                <h3 className="font-semibold text-slate-700 border-b border-slate-200 pb-2">Mother's Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Name</label>
                    <input type="text" className="w-full px-4 py-2 rounded-lg border border-slate-200" value={formData.mother_name} onChange={e => handleInputChange('mother_name', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Phone</label>
                    <input type="text" className="w-full px-4 py-2 rounded-lg border border-slate-200" value={formData.mother_phone} onChange={e => handleInputChange('mother_phone', e.target.value)} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Occupation</label>
                    <input type="text" className="w-full px-4 py-2 rounded-lg border border-slate-200" value={formData.mother_occupation} onChange={e => handleInputChange('mother_occupation', e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                <h3 className="font-semibold text-slate-700 border-b border-slate-200 pb-2">Local Guardian (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Name</label>
                    <input type="text" className="w-full px-4 py-2 rounded-lg border border-slate-200" value={formData.guardian_name} onChange={e => handleInputChange('guardian_name', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Phone</label>
                    <input type="text" className="w-full px-4 py-2 rounded-lg border border-slate-200" value={formData.guardian_phone} onChange={e => handleInputChange('guardian_phone', e.target.value)} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Relation to Student</label>
                    <input type="text" className="w-full px-4 py-2 rounded-lg border border-slate-200" placeholder="Uncle, Aunt, etc." value={formData.guardian_relation} onChange={e => handleInputChange('guardian_relation', e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Contact */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in">
              <h2 className="text-xl font-bold text-slate-800 font-display mb-4">Contact Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Full Residential Address <span className="text-red-500">*</span></label>
                  <textarea className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400 focus:outline-none min-h-[100px]" value={formData.address} onChange={e => handleInputChange('address', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">City</label>
                  <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400" value={formData.city} onChange={e => handleInputChange('city', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">District</label>
                  <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400" value={formData.district} onChange={e => handleInputChange('district', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
                  <input type="email" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400" placeholder="student or parent email" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Phone</label>
                  <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400" value={formData.phone} onChange={e => handleInputChange('phone', e.target.value)} />
                </div>

                <div className="md:col-span-2 mt-4">
                  <h3 className="font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-4">Emergency Contact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Name</label>
                      <input type="text" className="w-full px-4 py-2 rounded-lg border border-slate-200" value={formData.emergency_contact_name} onChange={e => handleInputChange('emergency_contact_name', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Phone</label>
                      <input type="text" className="w-full px-4 py-2 rounded-lg border border-slate-200" value={formData.emergency_contact_phone} onChange={e => handleInputChange('emergency_contact_phone', e.target.value)} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Relation</label>
                      <input type="text" className="w-full px-4 py-2 rounded-lg border border-slate-200" value={formData.emergency_contact_relation} onChange={e => handleInputChange('emergency_contact_relation', e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Review */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in">
              <h2 className="text-xl font-bold text-slate-800 font-display mb-4">Review & Submit</h2>
              
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                  <div>
                    <h4 className="font-bold text-slate-800 mb-2 border-b border-slate-200 pb-1">Personal</h4>
                    <p><span className="text-slate-500">Name:</span> {formData.full_name}</p>
                    <p><span className="text-slate-500">DOB:</span> {formData.date_of_birth}</p>
                    <p><span className="text-slate-500">Gender:</span> {formData.gender}</p>
                    <p><span className="text-slate-500">Blood Gp:</span> {formData.blood_group || '-'}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 mb-2 border-b border-slate-200 pb-1">Academic</h4>
                    <p><span className="text-slate-500">Class:</span> {classes.find(c => c.id === formData.class_id)?.name || '-'}</p>
                    <p><span className="text-slate-500">Adm Date:</span> {formData.admission_date}</p>
                    <p><span className="text-slate-500">Session:</span> {formData.academic_year}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 mb-2 border-b border-slate-200 pb-1">Address</h4>
                    <p className="text-slate-700">{formData.address}</p>
                    <p className="text-slate-700">{formData.city}, {formData.district}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 mb-2 border-b border-slate-200 pb-1">Parents</h4>
                    <p><span className="text-slate-500">Father:</span> {formData.father_name || '-'}</p>
                    <p><span className="text-slate-500">Mother:</span> {formData.mother_name || '-'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 text-blue-800 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                <div className="mt-0.5">ℹ️</div>
                <p className="text-sm">Please verify all details before submitting. Upon submission, the student will be assigned an automated Admission Number.</p>
              </div>
            </div>
          )}

        </div>
        
        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 sm:px-10 py-5 border-t border-slate-200 flex items-center justify-between">
          <button 
            type="button"
            onClick={prevStep}
            disabled={currentStep === 0 || isSubmitting}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-colors ${currentStep === 0 ? 'opacity-0 cursor-default' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'}`}
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          {currentStep < steps.length - 1 ? (
            <button 
              type="button"
              onClick={nextStep}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-sm transition-all active:scale-95"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button 
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-7 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 shadow-md transition-all active:scale-95 disabled:opacity-70"
            >
              {isSubmitting ? (
                <>Wait...</>
              ) : (
                <><Save className="w-4 h-4" /> Confirm Admission</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
