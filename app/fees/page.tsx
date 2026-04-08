'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Modal from '@/components/Modal';
import DataTable from '@/components/DataTable';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';
import { Search, Filter, Plus, DollarSign, Wallet, AlertCircle, Clock } from 'lucide-react';

export default function FeesPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [stats, setStats] = useState({ billed: 0, collected: 0, pendingCount: 0, overdueCount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal states
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  
  // Data lists
  const [categories, setCategories] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // new Payment state
  const [newPayment, setNewPayment] = useState({
    student_id: '',
    fee_category_id: '',
    amount: 0,
    discount: 0,
    fine: 0,
    paid_amount: 0,
    due_date: new Date().toISOString().split('T')[0],
    paid_date: new Date().toISOString().split('T')[0],
    month_year: 'Jan-2025',
    payment_method: 'cash',
    status: 'paid',
    remarks: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Parallel loading
      const [paymentsRes, categoriesRes, studentsRes] = await Promise.all([
        supabase.from('fee_payments')
          .select('id, receipt_no, amount, paid_amount, status, due_date, month_year, payment_method, students(full_name, admission_no), fee_categories(name)')
          .order('created_at', { ascending: false }),
        supabase.from('fee_categories').select('*').order('name'),
        supabase.from('students').select('id, full_name, admission_no').eq('status', 'active').order('full_name')
      ]);

      if (paymentsRes.data) {
        setPayments(paymentsRes.data);
        
        // Calculate Stats
        let billed = 0, collected = 0, pending = 0, overdue = 0;
        const today = new Date().toISOString().split('T')[0];

        paymentsRes.data.forEach(p => {
          billed += Number(p.amount);
          collected += Number(p.paid_amount);
          if (p.status === 'pending') pending++;
          if (p.status === 'overdue' || (p.status === 'pending' && p.due_date < today)) overdue++;
        });

        setStats({ billed, collected, pendingCount: pending, overdueCount: overdue });
      }

      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (studentsRes.data) setStudents(studentsRes.data);

    } catch (e: any) {
      toast.error('Failed to load fee records');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategorySelect = (catId: string) => {
    const cat = categories.find(c => c.id === catId);
    if (cat) {
      setNewPayment(prev => ({ 
        ...prev, 
        fee_category_id: catId, 
        amount: cat.amount, 
        paid_amount: cat.amount 
      }));
    }
  };

  const submitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (!newPayment.student_id || !newPayment.fee_category_id) {
        throw new Error('Please select student and fee category');
      }

      const { error } = await supabase.from('fee_payments').insert([newPayment]);
      if (error) throw error;

      toast.success('Payment recorded successfully');
      setIsRecordModalOpen(false);
      fetchDashboardData();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    { header: 'Receipt No.', accessor: 'receipt_no', className: 'font-semibold text-slate-900' },
    { 
      header: 'Student', 
      accessor: (row: any) => (
        <div>
          <p className="font-semibold text-slate-800">{row.students?.full_name}</p>
          <p className="text-xs text-slate-500">{row.students?.admission_no}</p>
        </div>
      ) 
    },
    { header: 'Fee Type', accessor: (row: any) => row.fee_categories?.name || 'Unknown' },
    { header: 'Month', accessor: 'month_year' },
    { 
      header: 'Amount', 
      accessor: (row: any) => (
        <div className="text-right pr-4">
          <p className="font-bold text-slate-800">৳ {row.amount}</p>
          <p className="text-xs text-slate-500">Paid: ৳ {row.paid_amount}</p>
        </div>
      ) 
    },
    { 
      header: 'Status', 
      accessor: (row: any) => {
        const bg = row.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                   row.status === 'overdue' ? 'bg-rose-100 text-rose-700' :
                   row.status === 'partial' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700';
        return <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${bg}`}>{row.status}</span>
      } 
    }
  ];

  const filteredPayments = payments.filter(p => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return p.receipt_no?.toLowerCase().includes(term) || 
           p.students?.full_name?.toLowerCase().includes(term) ||
           p.students?.admission_no?.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-display">Fee Management</h1>
          <p className="text-slate-500 mt-1">Track fee collections and student dues.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors shadow-sm"
          >
            Categories
          </button>
          <button 
            onClick={() => setIsRecordModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Record Payment
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total Billed</p>
              <h3 className="text-2xl font-bold text-slate-900 font-display">৳ {stats.billed.toLocaleString()}</h3>
            </div>
            <div className={`p-3 rounded-xl bg-blue-50 text-blue-600`}>
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total Collected</p>
              <h3 className="text-2xl font-bold text-slate-900 font-display">৳ {stats.collected.toLocaleString()}</h3>
            </div>
            <div className={`p-3 rounded-xl bg-emerald-50 text-emerald-600`}>
              <Wallet className="w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Pending Fees</p>
              <h3 className="text-2xl font-bold text-slate-900 font-display">{stats.pendingCount}</h3>
            </div>
            <div className={`p-3 rounded-xl bg-amber-50 text-amber-600`}>
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Overdue Accounts</p>
              <h3 className="text-2xl font-bold text-slate-900 font-display">{stats.overdueCount}</h3>
            </div>
            <div className={`p-3 rounded-xl bg-rose-50 text-rose-600`}>
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full md:w-96 mb-4">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search receipt, student name or ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
        </div>
        <DataTable data={filteredPayments} columns={columns} isLoading={isLoading} emptyMessage="No payment records found." />
      </div>

      {/* Record Payment Modal */}
      <Modal isOpen={isRecordModalOpen} onClose={() => setIsRecordModalOpen(false)} title="Record Fee Payment" maxWidth="2xl">
        <form onSubmit={submitPayment} className="space-y-6 mt-2">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Student <span className="text-red-500">*</span></label>
              <select required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400" value={newPayment.student_id} onChange={e => setNewPayment({...newPayment, student_id: e.target.value})}>
                <option value="">Search and select student...</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.full_name} ({s.admission_no})</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Fee Category <span className="text-red-500">*</span></label>
              <select required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400" value={newPayment.fee_category_id} onChange={e => handleCategorySelect(e.target.value)}>
                <option value="">Select fee type...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Fee Month/Year</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400" placeholder="e.g. Jan-2025" value={newPayment.month_year} onChange={e => setNewPayment({...newPayment, month_year: e.target.value})} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Billed Amount <span className="text-slate-400">(৳)</span></label>
              <input required type="number" min="0" step="0.01" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400 bg-slate-50" value={newPayment.amount} onChange={e => setNewPayment({...newPayment, amount: Number(e.target.value)})} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Amount Paid <span className="text-slate-400">(৳)</span></label>
              <input required type="number" min="0" step="0.01" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400 font-bold text-emerald-700" value={newPayment.paid_amount} onChange={e => setNewPayment({...newPayment, paid_amount: Number(e.target.value)})} />
            </div>

            <div className="grid grid-cols-2 gap-4 md:col-span-2">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Discount <span className="text-slate-400">(৳)</span></label>
                <input type="number" min="0" step="0.01" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400" value={newPayment.discount} onChange={e => setNewPayment({...newPayment, discount: Number(e.target.value)})} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Fine/Late Fee <span className="text-slate-400">(৳)</span></label>
                <input type="number" min="0" step="0.01" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400" value={newPayment.fine} onChange={e => setNewPayment({...newPayment, fine: Number(e.target.value)})} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Payment Method</label>
              <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400" value={newPayment.payment_method} onChange={e => setNewPayment({...newPayment, payment_method: e.target.value})}>
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="mobile_banking">Mobile Banking (bKash/Nagad)</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
              <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400" value={newPayment.status} onChange={e => setNewPayment({...newPayment, status: e.target.value})}>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="partial">Partial Payment</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Remarks</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400" placeholder="Any internal notes" value={newPayment.remarks} onChange={e => setNewPayment({...newPayment, remarks: e.target.value})} />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <button type="button" onClick={() => setIsRecordModalOpen(false)} className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-sm disabled:opacity-70">
              {isSubmitting ? 'Saving...' : 'Save Record'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Categories Modal (Read-only for now) */}
      <Modal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} title="Fee Categories" maxWidth="lg">
        <div className="space-y-4">
          {categories.length === 0 ? (
            <p className="text-center text-slate-500 py-4">No categories defined yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {categories.map(c => (
                <div key={c.id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-800">{c.name}</p>
                    <p className="text-xs text-slate-500 capitalize">{c.frequency} {c.is_mandatory ? '• Compulsory' : '• Optional'}</p>
                  </div>
                  <div className="font-bold text-slate-900 border border-slate-200 px-3 py-1 rounded-lg bg-slate-50">
                    ৳ {c.amount}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

    </div>
  );
}
