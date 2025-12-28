'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/Card';
import { User, Bell, Shield, Key, Mail, Save, Calendar, AlertCircle } from 'lucide-react';
import AppLayout from '@/components/Layout';
import { DataService } from '@/services/data';
import { Case } from '@/types';
import Link from 'next/link';

export default function Settings() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security'>('profile');
  const [todayHearings, setTodayHearings] = useState<Case[]>([]);
  const [upcomingHearings, setUpcomingHearings] = useState<Case[]>([]);
  
  // Forms State
  const [profileName, setProfileName] = useState(session?.user?.name || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [isSavingPass, setIsSavingPass] = useState(false);

  useEffect(() => {
    if (session?.user?.name) {
        setProfileName(session.user.name);
    }
  }, [session]);

  useEffect(() => {
    if (activeTab === 'notifications') {
        fetchNotifications();
    }
  }, [activeTab]);

  const fetchNotifications = async () => {
    try {
        const cases = await DataService.getCases();
        const today = new Date();
        const todayStr = today.toDateString();
        
        const todays = cases.filter(c => c.nextHearing && new Date(c.nextHearing).toDateString() === todayStr);
        const upcoming = cases.filter(c => {
             if (!c.nextHearing) return false;
             const d = new Date(c.nextHearing);
             return d > today && d < new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000); // Next 7 days
        });

        setTodayHearings(todays);
        setUpcomingHearings(upcoming);
    } catch (e) {
        console.error(e);
    }
  };

  const handleUpdateProfile = async () => {
      setIsSavingProfile(true);
      try {
          await DataService.updateUserProfile({ name: profileName });
          alert('Profile updated successfully! Please re-login to see changes.');
      } catch (e) {
          alert('Failed to update profile.');
      } finally {
          setIsSavingProfile(false);
      }
  };

  const handleUpdatePassword = async () => {
      if (!passwords.current || !passwords.new || !passwords.confirm) {
          alert('Please fill all password fields');
          return;
      }
      if (passwords.new !== passwords.confirm) {
          alert('New passwords do not match');
          return;
      }
      
      setIsSavingPass(true);
      try {
          await DataService.updateUserPassword({ current: passwords.current, new: passwords.new });
          alert('Password updated successfully!');
          setPasswords({ current: '', new: '', confirm: '' });
      } catch (e: any) {
          alert(e.message || 'Failed to update password');
      } finally {
          setIsSavingPass(false);
      }
  };

  return (
    <AppLayout>
      <div className="p-8 max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-500 mt-1">Manage your profile and preferences</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
              <button 
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'profile' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                  <User className="w-5 h-5" />
                  <span>Profile</span>
              </button>
              <button 
                onClick={() => setActiveTab('notifications')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'notifications' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                  <Bell className="w-5 h-5" />
                  <span>Notifications</span>
              </button>
              <button 
                 onClick={() => setActiveTab('security')}
                 className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'security' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                  <Shield className="w-5 h-5" />
                  <span>Security</span>
              </button>
          </div>

          <div className="md:col-span-2 space-y-6">
            
            {activeTab === 'profile' && (
              <Card title="Profile Information" description="Update your personal details">
                  <div className="space-y-4">
                      <div className="flex items-center space-x-4 mb-6">
                          <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-xl font-bold text-slate-600">
                              {session?.user?.name?.charAt(0) || 'U'}
                          </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                              <input 
                                  type="text" 
                                  value={profileName}
                                  onChange={(e) => setProfileName(e.target.value)}
                                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                              />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                              <input 
                                  type="text" 
                                  disabled
                                  defaultValue={session?.user?.role || 'user'}
                                  className="w-full px-3 py-2 border border-slate-200 bg-slate-50 text-slate-500 rounded-lg cursor-not-allowed capitalize"
                              />
                          </div>
                          <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                              <div className="relative">
                                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                                  <input 
                                      type="email" 
                                      disabled
                                      defaultValue={session?.user?.email || ''}
                                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
                                  />
                              </div>
                          </div>
                      </div>
                      
                      <div className="pt-2 flex justify-end">
                          <button 
                            onClick={handleUpdateProfile}
                            disabled={isSavingProfile}
                            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                          >
                              <Save className="w-4 h-4" />
                              <span>{isSavingProfile ? 'Saving...' : 'Save Changes'}</span>
                          </button>
                      </div>
                  </div>
              </Card>
            )}

            {activeTab === 'notifications' && (
                <div className="space-y-6">
                    <Card title="Today's Updates" description="Important alerts for today">
                        {todayHearings.length > 0 ? (
                            <div className="space-y-3">
                                {todayHearings.map(c => (
                                    <div key={c.id} className="p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                                        <div>
                                            <h4 className="font-semibold text-red-900">Hearing Today: {c.title}</h4>
                                            <p className="text-sm text-red-700">{c.caseNumber} - {c.clientName}</p>
                                            <Link href={`/cases/${c.id}`} className="text-xs font-medium text-red-600 hover:text-red-800 mt-1 inline-block">View Case &rarr;</Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 text-slate-500 bg-slate-50 rounded-lg border border-slate-100">
                                <p>No hearings scheduled for today.</p>
                            </div>
                        )}
                    </Card>

                    <Card title="Upcoming Hearings" description="Schedule for the next 7 days">
                         {upcomingHearings.length > 0 ? (
                            <div className="space-y-3">
                                {upcomingHearings.map(c => (
                                    <div key={c.id} className="p-4 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-blue-50 p-2 rounded text-blue-600">
                                                <Calendar className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-slate-900">{c.title}</h4>
                                                <p className="text-sm text-slate-500">{new Date(c.nextHearing!).toLocaleDateString()} • {c.clientName}</p>
                                            </div>
                                        </div>
                                        <Link href={`/cases/${c.id}`} className="px-3 py-1 text-sm bg-slate-100 text-slate-700 rounded hover:bg-slate-200">View</Link>
                                    </div>
                                ))}
                            </div>
                         ) : (
                            <div className="text-center py-6 text-slate-500">
                                <p>No upcoming hearings in the next 7 days.</p>
                            </div>
                         )}
                    </Card>
                </div>
            )}

            {activeTab === 'security' && (
              <Card title="Change Password" description="Ensure your account is using a long, random password">
                  <div className="space-y-4">
                       <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                          <div className="relative">
                              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                              <input 
                                type="password" 
                                value={passwords.current}
                                onChange={e => setPasswords({...passwords, current: e.target.value})}
                                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                              />
                          </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                              <input 
                                type="password" 
                                value={passwords.new}
                                onChange={e => setPasswords({...passwords, new: e.target.value})}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                              />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                              <input 
                                type="password" 
                                value={passwords.confirm}
                                onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                              />
                          </div>
                      </div>
                      <div className="pt-2 flex justify-end">
                          <button 
                            onClick={handleUpdatePassword}
                            disabled={isSavingPass}
                            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:bg-slate-50 disabled:text-slate-400"
                          >
                              {isSavingPass ? 'Updating...' : 'Update Password'}
                          </button>
                      </div>
                  </div>
              </Card>
            )}

          </div>
        </div>
      </div>
    </AppLayout>
  );
}