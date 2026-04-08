'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';
import { Search, GraduationCap, Edit, Trash2, Plus } from 'lucide-react';

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    subject: '',
    qualification: '',
    join_date: new Date().toISOString().split('T')[0],
    status: 'active',
    address: ''
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .order('full_name');
        
      if (error) throw error;
      setTeachers(data || []);
    } catch (e: any) {
      toast.error('Failed to load teachers: ' + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (t: any = null) => {
    if (t) {
      setEditingId(t.id);
      setFormData({
        full_name: t.full_name,
        email: t.email || '',
        phone: t.phone || '',
        subject: t.subject || '',
        qualification: t.qualification || '',
        join_date: t.join_date || new Date().toISOString().split('T')[0],
        status: t.status || 'active',
        address: t.address || ''
      });
    } else {
      setEditingId(null);
      setFormData({ 
        full_name: '', email: '', phone: '', subject: '', 
        qualification: '', join_date: new Date().toISOString().split('T')[0], 
        status: 'active', address: '' 
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        const { error } = await supabase.from('teachers').update(formData).eq('id', editingId);
        if (error) throw error;
        toast.success('Teacher updated successfully');
      } else {
        const { error } = await supabase.from('teachers').insert([formData]);
        if (error) throw error;
        toast.success('New teacher registered successfully');
      }
      setIsModalOpen(false);
      fetchTeachers();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        const { error } = await supabase.from('teachers').delete().eq('id', id);
        if (error) throw error;
        toast.success('Teacher deleted successfully');
        fetchTeachers();
      } catch (e: any) {
        toast.error(e.message);
      }
    }
  };

  const columns = [
    { 
      header: 'Teacher Name', 
      accessor: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0 font-bold">
            {row.full_name.charAt(0)}
          </div>
          <div>
            <div className="font-bold text-slate-900">{row.full_name}</div>
            <div className="text-xs text-slate-500">{row.qualification || 'No qualification listed'}</div>
          </div>
        </div>
      )
    },
    { 
      header: 'Department / Subject', 
      accessor: (row: any) => row.subject || <span className="text-slate-400 italic">Not Assigned</span>
    },
    { header: 'Contact', accessor: (row: any) => row.phone || '-' },
    { 
      header: 'Status', 
      accessor: (row: any) => {
        const bg = row.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600';
        return <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${bg}`}>{row.status}</span>;
      } 
    },
    { 
      header: 'Actions', 
      accessor: (row: any) => (
        <div className="flex items-center gap-2">
          <button onClick={() => openModal(row)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <Edit className="w-4 h-4" />
          </button>
          <button onClick={() => handleDelete(row.id, row.full_name)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const filtered = teachers.filter(t => t.full_name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-display">Teachers Directory</h1>
          <p className="text-slate-500 mt-1">Manage teaching staff and academic personnel.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add New Teacher
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Teachers</p>
            <h3 className="text-2xl font-bold text-slate-900 font-display">{teachers.length}</h3>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><GraduationCap className="w-6 h-6" /></div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full md:w-96 mb-4">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search teacher by name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
        </div>
        <DataTable data={filtered} columns={columns} isLoading={isLoading} emptyMessage="No teachers match the search criteria." />
      </div>

      {/* Form Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Teacher' : 'Register New Teacher'} maxWidth="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name <span className="text-red-500">*</span></label>
              <input required type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
              <input type="email" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Phone</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Subject / Department</label>
              <input type="text" placeholder="e.g. Mathematics" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Qualification</label>
              <input type="text" placeholder="e.g. MSc in Physics" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400" value={formData.qualification} onChange={e => setFormData({...formData, qualification: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Join Date</label>
              <input type="date" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400" value={formData.join_date} onChange={e => setFormData({...formData, join_date: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
              <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on_leave">On Leave</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Address</label>
              <textarea className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400 min-h-[80px]" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
            </div>
          </div>
          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-sm disabled:opacity-70">
              {isSubmitting ? 'Saving...' : 'Save Teacher Profile'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
