'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import DataTable from '@/components/DataTable';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';
import { Search, Filter, Edit, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StudentsList() {
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  
  // Pagination
  const PAGE_SIZE = 15;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Debounce Search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [debouncedSearch, statusFilter, classFilter, currentPage]);

  const fetchClasses = async () => {
    const { data } = await supabase.from('classes').select('*').order('name');
    if (data) setClasses(data);
  };

  const fetchStudents = async () => {
    setIsLoading(true);
    let query = supabase.from('students').select('*, classes(name, section)', { count: 'exact' });

    if (debouncedSearch) {
      query = query.or(`full_name.ilike.%${debouncedSearch}%,admission_no.ilike.%${debouncedSearch}%`);
    }
    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }
    if (classFilter !== 'all') {
      query = query.eq('class_id', classFilter);
    }

    const from = (currentPage - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    
    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data, count, error } = await query;
    if (error) {
      toast.error('Failed to fetch students');
    } else {
      setStudents(data || []);
      setTotalCount(count || 0);
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      const { error } = await supabase.from('students').delete().eq('id', id);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success(`${name} deleted successfully`);
        fetchStudents();
      }
    }
  };

  const columns = [
    { header: 'Admn. No', accessor: 'admission_no', className: 'font-semibold text-slate-900' },
    { 
      header: 'Student Info', 
      accessor: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
            {row.full_name.charAt(0)}
          </div>
          <div>
            <div className="font-semibold text-slate-900">{row.full_name}</div>
            <div className="text-xs text-slate-500">{row.gender}</div>
          </div>
        </div>
      )
    },
    { 
      header: 'Class', 
      accessor: (row: any) => row.classes ? (
        <span className="bg-slate-100 px-2.5 py-1 rounded-md text-xs font-semibold text-slate-700">
          {row.classes.name} - Sec {row.classes.section}
        </span>
      ) : '-' 
    },
    { header: 'Contact', accessor: (row: any) => row.phone || row.father_phone || '-' },
    { 
      header: 'Status', 
      accessor: (row: any) => {
        const colors: Record<string, string> = {
          active: 'bg-emerald-100 text-emerald-700',
          inactive: 'bg-slate-100 text-slate-600',
          graduated: 'bg-blue-100 text-blue-700',
          transferred: 'bg-amber-100 text-amber-700'
        };
        const color = colors[row.status] || colors.inactive;
        return (
          <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${color}`}>
            {row.status}
          </span>
        );
      }
    },
    { 
      header: 'Actions', 
      accessor: (row: any) => (
        <div className="flex items-center gap-2">
          {/* We will add View Student Modal later if needed */}
          <Link href={`/students/${row.id}/edit`} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <Edit className="w-4 h-4" />
          </Link>
          <button onClick={() => handleDelete(row.id, row.full_name)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-display">Students Directory</h1>
          <p className="text-slate-500 mt-1">Manage and view all students in the school system.</p>
        </div>
        <Link 
          href="/admission" 
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-sm"
        >
          + New Admission
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name or admit no..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select 
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="w-full md:w-auto px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400 bg-slate-50 font-medium text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="graduated">Graduated</option>
              <option value="transferred">Transferred</option>
            </select>
          </div>
          
          <select 
            value={classFilter}
            onChange={(e) => { setClassFilter(e.target.value); setCurrentPage(1); }}
            className="w-full md:w-48 px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400 bg-slate-50 font-medium text-sm"
          >
            <option value="all">All Classes</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name} - {c.section}</option>
            ))}
          </select>
        </div>
      </div>

      <DataTable 
        data={students}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No students match the selected filters."
      />

      {/* Pagination Controls */}
      {!isLoading && totalCount > 0 && (
        <div className="flex items-center justify-between bg-white px-6 py-4 border border-slate-200 rounded-2xl shadow-sm">
          <span className="text-sm text-slate-600 font-medium">
            Showing <span className="font-bold text-slate-900">{(currentPage - 1) * PAGE_SIZE + 1}</span> to <span className="font-bold text-slate-900">{Math.min(currentPage * PAGE_SIZE, totalCount)}</span> of <span className="font-bold text-slate-900">{totalCount}</span>
          </span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              Previous
            </button>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
