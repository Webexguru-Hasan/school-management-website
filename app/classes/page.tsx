'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';
import { BookOpen, Edit, Trash2, Plus } from 'lucide-react';

export default function ClassesPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    section: '',
    capacity: 40,
    academic_year: '2024-25',
    room_number: ''
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('classes')
        .select(`
          *,
          students:students(count)
        `)
        .order('name');
        
      if (error) throw error;
      setClasses(data || []);
    } catch (e: any) {
      toast.error('Failed to load classes: ' + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (cls: any = null) => {
    if (cls) {
      setEditingId(cls.id);
      setFormData({
        name: cls.name,
        section: cls.section || '',
        capacity: cls.capacity || 40,
        academic_year: cls.academic_year || '2024-25',
        room_number: cls.room_number || ''
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', section: '', capacity: 40, academic_year: '2024-25', room_number: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Create payload matching schema (no room_number)
      const payload = {
        name: formData.name,
        section: formData.section,
        capacity: formData.capacity,
        academic_year: formData.academic_year
      };

      if (editingId) {
        const { error } = await supabase.from('classes').update(payload).eq('id', editingId);
        if (error) throw error;
        toast.success('Class updated successfully');
      } else {
        const { error } = await supabase.from('classes').insert([payload]);
        if (error) throw error;
        toast.success('New class created successfully');
      }
      setIsModalOpen(false);
      fetchClasses();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string, studentCount: number) => {
    if (studentCount > 0) {
      toast.error(`Cannot delete class. It has ${studentCount} enrolled students.`);
      return;
    }
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        const { error } = await supabase.from('classes').delete().eq('id', id);
        if (error) throw error;
        toast.success('Class deleted successfully');
        fetchClasses();
      } catch (e: any) {
        toast.error(e.message);
      }
    }
  };

  const columns = [
    { 
      header: 'Class Details', 
      accessor: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-slate-900 text-lg">{row.name}</div>
            <div className="text-xs text-slate-500">Session: {row.academic_year}</div>
          </div>
        </div>
      )
    },
    { header: 'Section', accessor: (row: any) => row.section || '-' },
    { 
      header: 'Enrolled / Cap', 
      accessor: (row: any) => {
        const enrolled = row.students[0]?.count || 0;
        const color = enrolled >= row.capacity ? 'text-rose-600' : 'text-emerald-600';
        return (
          <div>
            <span className={`font-bold ${color}`}>{enrolled}</span>
            <span className="text-slate-400 font-medium"> / {row.capacity}</span>
          </div>
        );
      }
    },
    { 
      header: 'Actions', 
      accessor: (row: any) => (
        <div className="flex items-center gap-2">
          <button onClick={() => openModal(row)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <Edit className="w-4 h-4" />
          </button>
          <button onClick={() => handleDelete(row.id, `${row.name} - ${row.section}`, row.students[0]?.count || 0)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-display">Classes Section</h1>
          <p className="text-slate-500 mt-1">Manage academic classes, sections and capacity.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add New Class
        </button>
      </div>

      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        <DataTable data={classes} columns={columns} isLoading={isLoading} emptyMessage="No classes found." />
      </div>

      {/* Class Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Class' : 'Create New Class'} maxWidth="md">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Class Name <span className="text-red-500">*</span></label>
              <input required type="text" placeholder="e.g. Class 1, Grade A" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Section</label>
                <input type="text" placeholder="e.g. A, B, Science" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400" value={formData.section} onChange={e => setFormData({...formData, section: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Max Capacity</label>
                <input type="number" min="1" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400" value={formData.capacity} onChange={e => setFormData({...formData, capacity: Number(e.target.value)})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Academic Year</label>
                <input required type="text" placeholder="2024-25" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400" value={formData.academic_year} onChange={e => setFormData({...formData, academic_year: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Room No (Optional)</label>
                <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400" value={formData.room_number || ''} onChange={e => setFormData({...formData, room_number: e.target.value})} />
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-sm disabled:opacity-70">
              {isSubmitting ? 'Saving...' : 'Save Class'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
