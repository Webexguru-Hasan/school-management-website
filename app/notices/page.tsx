'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Modal from '@/components/Modal';
import DataTable from '@/components/DataTable';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';
import { Bell, Edit, Trash2, Plus, Calendar, Megaphone, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function NoticesPage() {
  const [notices, setNotices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'general',
    target_audience: 'all',
    publish_date: new Date().toISOString().split('T')[0],
    expiry_date: '',
    is_published: true
  });

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .order('publish_date', { ascending: false });
        
      if (error) throw error;
      setNotices(data || []);
    } catch (e: any) {
      toast.error('Failed to load notices: ' + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (notice: any = null) => {
    if (notice) {
      setEditingId(notice.id);
      setFormData({
        title: notice.title,
        content: notice.content || '',
        type: notice.type || 'general',
        target_audience: notice.target_audience || 'all',
        publish_date: notice.publish_date || new Date().toISOString().split('T')[0],
        expiry_date: notice.expiry_date || '',
        is_published: notice.is_published
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        content: '',
        type: 'general',
        target_audience: 'all',
        publish_date: new Date().toISOString().split('T')[0],
        expiry_date: '',
        is_published: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { ...formData, expiry_date: formData.expiry_date || null };
      if (editingId) {
        const { error } = await supabase.from('notices').update(payload).eq('id', editingId);
        if (error) throw error;
        toast.success('Notice updated successfully');
      } else {
        const { error } = await supabase.from('notices').insert([payload]);
        if (error) throw error;
        toast.success('Notice published successfully');
      }
      setIsModalOpen(false);
      fetchNotices();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete notice: "${title}"?`)) {
      try {
        const { error } = await supabase.from('notices').delete().eq('id', id);
        if (error) throw error;
        toast.success('Notice deleted');
        fetchNotices();
      } catch (e: any) {
        toast.error(e.message);
      }
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase.from('notices').update({ is_published: !currentStatus }).eq('id', id);
      if (error) throw error;
      toast.success(currentStatus ? 'Notice unpublished' : 'Notice published');
      fetchNotices();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const columns = [
    { 
      header: 'Notice Title', 
      accessor: (row: any) => (
        <div className="flex items-start gap-3 py-1">
          <div className={`p-2 rounded-lg mt-1 shrink-0 ${row.type === 'urgent' ? 'bg-rose-100 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
            {row.type === 'urgent' ? <AlertCircle className="w-5 h-5"/> : <Megaphone className="w-5 h-5" />}
          </div>
          <div>
            <p className="font-bold text-slate-900">{row.title}</p>
            <p className="text-xs text-slate-500 line-clamp-1">{row.content}</p>
          </div>
        </div>
      )
    },
    { 
      header: 'Category / Audience', 
      accessor: (row: any) => (
        <div>
          <span className="block capitalize font-semibold text-slate-700">{row.type}</span>
          <span className="text-xs text-slate-500 capitalize px-2 py-0.5 bg-slate-100 rounded-full inline-block mt-0.5">To: {row.target_audience}</span>
        </div>
      ) 
    },
    { 
      header: 'Dates', 
      accessor: (row: any) => (
        <div className="text-sm">
          <div className="flex items-center gap-1.5 text-slate-700"><Calendar className="w-3.5 h-3.5 text-slate-400" /> {format(new Date(row.publish_date), 'dd MMM yyyy')}</div>
          {row.expiry_date && <div className="text-xs text-slate-500 mt-1 pl-5">Expires: {format(new Date(row.expiry_date), 'dd MMM yyyy')}</div>}
        </div>
      ) 
    },
    { 
      header: 'Status', 
      accessor: (row: any) => (
        <button 
          onClick={() => handleTogglePublish(row.id, row.is_published)}
          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${row.is_published ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          {row.is_published ? 'Live' : 'Draft'}
        </button>
      ) 
    },
    { 
      header: 'Actions', 
      accessor: (row: any) => (
        <div className="flex items-center gap-2">
          <button onClick={() => openModal(row)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
          <button onClick={() => handleDelete(row.id, row.title)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-display">Notice Board</h1>
          <p className="text-slate-500 mt-1">Manage school announcements, events, and alerts.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" /> Create Notice
        </button>
      </div>

      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        <DataTable data={notices} columns={columns} isLoading={isLoading} emptyMessage="No notices found." />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Notice' : 'Create New Notice'} maxWidth="2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Notice Title <span className="text-red-500">*</span></label>
            <input required type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400" placeholder="E.g., Winter Vacation Schedule" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Target Audience</label>
              <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400" value={formData.target_audience} onChange={e => setFormData({...formData, target_audience: e.target.value})}>
                <option value="all">Everyone</option>
                <option value="students">Students Only</option>
                <option value="teachers">Teachers Only</option>
                <option value="parents">Parents Only</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Notice Category</label>
              <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                <option value="general">General</option>
                <option value="exam">Exam</option>
                <option value="holiday">Holiday</option>
                <option value="fee">Fee Collection</option>
                <option value="event">Event</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Publish Date <span className="text-red-500">*</span></label>
              <input required type="date" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400" value={formData.publish_date} onChange={e => setFormData({...formData, publish_date: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Expiry Date (Optional)</label>
              <input type="date" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400" value={formData.expiry_date} onChange={e => setFormData({...formData, expiry_date: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Content Details <span className="text-red-500">*</span></label>
            <textarea required rows={5} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400" placeholder="Type the full notice announcement here..." value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="publishToggle" className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" checked={formData.is_published} onChange={e => setFormData({...formData, is_published: e.target.checked})} />
            <label htmlFor="publishToggle" className="text-sm font-medium text-slate-700">Publish immediately to Notice Board</label>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-sm disabled:opacity-70">
              {isSubmitting ? 'Saving...' : 'Save Notice'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
