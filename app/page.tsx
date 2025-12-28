'use client';

import React, { useEffect, useState } from 'react';
import { DataService } from '@/services/data';
import { CaseStats } from '@/types';
import { MetricCard, Card } from '@/components/Card';
import { Briefcase, Users, AlertCircle, DollarSign } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import AppLayout from '@/components/Layout';

export default function Dashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<CaseStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await DataService.getStats();
        setStats(data);
      } catch (e) {
        console.error("Failed to fetch stats");
      } finally {
        setLoading(false);
      }
    };
    if (session) fetchStats();
  }, [session]);

  const defaultData = [
      { name: 'Jan', value: 0 },
      { name: 'Feb', value: 0 },
      { name: 'Mar', value: 0 },
      { name: 'Apr', value: 0 },
      { name: 'May', value: 0 },
      { name: 'Jun', value: 0 },
  ];

  return (
    <AppLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-500 mt-1">Welcome back, {session?.user?.name}</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>

        {loading ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
              {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>)}
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Active Cases"
              value={stats?.activeCases || 0}
              icon={Briefcase}
              trend="Current active workload"
              trendUp={true}
            />
            <MetricCard
              title="Total Clients"
              value={stats?.totalClients || 0}
              icon={Users}
              trend="Total client database"
              trendUp={true}
            />
            <MetricCard
              title="Pending Actions"
              value={stats?.pendingActions || 0}
              icon={AlertCircle}
              trend="High priority cases"
              trendUp={false}
            />
            <MetricCard
              title="Est. Revenue YTD"
              value={`$${(stats?.revenueYTD || 0).toLocaleString()}`}
              icon={DollarSign}
              trend="Based on active cases"
              trendUp={true}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card title="New Cases Overview" description="Number of new cases opened per month">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.monthlyData || defaultData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    cursor={{ fill: '#F1F5F9' }}
                  />
                  <Bar dataKey="value" name="Cases" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Revenue Growth Est." description="Estimated monthly revenue performance">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats?.revenueData || defaultData} margin={{ top: 20, right: 30, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748B' }} 
                    tickFormatter={(value) => `$${value/1000}k`} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E2E8F0' }}
                    formatter={(value: any) => [`$${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Line type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={3} dot={{ r: 4, fill: '#2563EB', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}