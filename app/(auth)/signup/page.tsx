'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { BookOpen, UserPlus, GraduationCap, Users } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<'student' | 'teacher' | null>(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      toast.error("Please select a role first!");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: role,
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        toast.success(`Account created successfully as ${role}!`);
        
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="sm:mx-auto sm:w-full sm:max-w-md">
      <div className="flex justify-center mb-6">
        <Link href="/" className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
          <BookOpen className="w-7 h-7 text-white" />
        </Link>
      </div>
      
      <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 font-display">
        Create your account
      </h2>
      <p className="mt-2 text-center text-sm text-slate-600 mb-8">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
          Sign in here
        </Link>
      </p>

      {/* Role Selection */}
      {!role ? (
        <div className="space-y-4">
          <button
            onClick={() => setRole('student')}
            className="w-full bg-white p-6 rounded-3xl border-2 border-slate-200 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 transition-all text-left flex flex-col items-center justify-center gap-4 group"
          >
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Users className="w-8 h-8" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900">I am a Student</h3>
              <p className="text-sm text-slate-500 mt-1">Access your grades, attendance, and notices.</p>
            </div>
          </button>

          <button
            onClick={() => setRole('teacher')}
            className="w-full bg-white p-6 rounded-3xl border-2 border-slate-200 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/10 transition-all text-left flex flex-col items-center justify-center gap-4 group"
          >
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900">I am a Teacher</h3>
              <p className="text-sm text-slate-500 mt-1">Manage classes, mark attendance, and grade students.</p>
            </div>
          </button>
        </div>
      ) : (
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-3xl sm:px-10 border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Registering as {role}
            </span>
            <button 
              onClick={() => setRole(null)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Change Role
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleSignup}>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  required
                  className="appearance-none block w-full px-3 py-3 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  className="appearance-none block w-full px-3 py-3 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  minLength={6}
                  className="appearance-none block w-full px-3 py-3 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" color="white" />
                ) : (
                  <>
                    <UserPlus className="w-5 h-5 mr-2" />
                    Create Account
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
