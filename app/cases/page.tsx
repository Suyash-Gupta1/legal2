'use client';

import React, { useState, useEffect } from 'react';
import { DataService } from '@/services/data';
import { Case } from '@/types';
import { Card } from '@/components/Card';
import { Search, Plus, Filter, Calendar, Briefcase, Clock, AlertCircle, DollarSign } from 'lucide-react';
import AppLayout from '@/components/Layout';
import { useRouter } from 'next/navigation';

export default function Cases() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  
  const [newCase, setNewCase] = useState<Partial<Case>>({
    title: '',
    clientName: '',
    status: 'Open',
    type: 'Civil',
    priority: 'Medium',
    startDate: new Date().toISOString().split('T')[0],
    value: 0
  });

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const data = await DataService.getCases();
      setCases(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCase.title || !newCase.clientName) return;
    
    try {
      await DataService.addCase(newCase as Omit<Case, 'id' | 'caseNumber'>);
      setIsModalOpen(false);
      setNewCase({
          title: '',
          clientName: '',
          status: 'Open',
          type: 'Civil',
          priority: 'Medium',
          startDate: new Date().toISOString().split('T')[0],
          value: 0
      });
      fetchCases();
    } catch (error) {
      console.error(error);
    }
  };

  const filteredCases = cases.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-50 border-red-100';
      case 'Medium': return 'text-orange-600 bg-orange-50 border-orange-100';
      case 'Low': return 'text-green-600 bg-green-50 border-green-100';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-purple-100 text-purple-800';
      case 'Closed': return 'bg-slate-100 text-slate-800';
      case 'On Hold': return 'bg-orange-100 text-orange-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <AppLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Cases</h1>
            <p className="text-slate-500 mt-1">Track and manage legal cases</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>New Case</span>
          </button>
        </div>

        <Card className="overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search cases, clients, or IDs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-500" />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="All">All Statuses</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="On Hold">On Hold</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="p-12 flex justify-center">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Case Details</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Value</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Dates</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCases.map((c) => (
                    <tr 
                        key={c.id} 
                        className="hover:bg-slate-50 transition-colors group cursor-pointer"
                        onClick={() => router.push(`/cases/${c.id}`)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-start space-x-3">
                           <div className="p-2 bg-blue-50 rounded-lg text-blue-600 mt-1">
                              <Briefcase className="w-4 h-4" />
                           </div>
                           <div>
                              <div className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{c.title}</div>
                              <div className="text-xs text-slate-500 font-mono mt-1">{c.caseNumber} • {c.type}</div>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900 font-medium">{c.clientName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(c.status)}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded border ${getPriorityColor(c.priority)}`}>
                          {c.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        ${(c.value || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col space-y-1 text-sm text-slate-500">
                              <div className="flex items-center space-x-2">
                                  <Calendar className="w-3 h-3" />
                                  <span>Opened: {new Date(c.startDate).toLocaleDateString()}</span>
                              </div>
                              {c.nextHearing && (
                                  <div className="flex items-center space-x-2 text-orange-600 font-medium">
                                      <Clock className="w-3 h-3" />
                                      <span>Hearing: {new Date(c.nextHearing).toLocaleDateString()}</span>
                                  </div>
                              )}
                          </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredCases.length === 0 && (
                  <div className="p-12 text-center text-slate-500">
                      <AlertCircle className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                      <p>No cases found matching criteria.</p>
                  </div>
              )}
            </div>
          )}
        </Card>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900">Create New Case</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  &times;
                </button>
              </div>
              <form onSubmit={handleAddCase} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Case Title</label>
                      <input
                        required
                        type="text"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. Smith Estate Planning"
                        value={newCase.title}
                        onChange={e => setNewCase({...newCase, title: e.target.value})}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Client Name</label>
                      <input
                        required
                        type="text"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter client name"
                        value={newCase.clientName}
                        onChange={e => setNewCase({...newCase, clientName: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Case Type</label>
                      <select
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={newCase.type}
                        onChange={e => setNewCase({...newCase, type: e.target.value as any})}
                      >
                          <option value="Civil">Civil</option>
                          <option value="Criminal">Criminal</option>
                          <option value="Corporate">Corporate</option>
                          <option value="Family">Family</option>
                          <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                      <select
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={newCase.priority}
                        onChange={e => setNewCase({...newCase, priority: e.target.value as any})}
                      >
                          <option value="High">High</option>
                          <option value="Medium">Medium</option>
                          <option value="Low">Low</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={newCase.startDate}
                        onChange={e => setNewCase({...newCase, startDate: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Next Hearing (Opt)</label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={newCase.nextHearing || ''}
                        onChange={e => setNewCase({...newCase, nextHearing: e.target.value})}
                      />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Estimated Value / Fees</label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                type="number"
                                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0.00"
                                value={newCase.value}
                                onChange={e => setNewCase({...newCase, value: Number(e.target.value)})}
                            />
                        </div>
                    </div>
                </div>
                
                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium shadow-md hover:shadow-lg"
                  >
                    Create Case
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}