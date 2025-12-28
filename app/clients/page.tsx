'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataService } from '@/services/data';
import { Client } from '@/types';
import { Card } from '@/components/Card';
import { Search, Plus, Phone, Mail, MoreHorizontal, X, Trash2, Edit } from 'lucide-react';
import AppLayout from '@/components/Layout';

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [actionMenuOpenId, setActionMenuOpenId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ 
      name: '', 
      email: '', 
      phone: '', 
      status: 'Active' 
  });

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActionMenuOpenId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const data = await DataService.getClients();
      setClients(data);
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
      setEditingId(null);
      setFormData({ name: '', email: '', phone: '', status: 'Active' });
      setError('');
      setIsModalOpen(true);
  };

  const openEditModal = (client: Client) => {
      setEditingId(client.id);
      setFormData({
          name: client.name,
          email: client.email,
          phone: client.phone,
          status: client.status
      });
      setError('');
      setActionMenuOpenId(null);
      setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (editingId) {
          await DataService.updateClient(editingId, {
              ...formData,
              status: formData.status as any
          });
      } else {
          await DataService.addClient({
              ...formData,
              status: formData.status as any,
              lastContact: new Date().toISOString().split('T')[0]
          });
      }
      
      setIsModalOpen(false);
      setFormData({ name: '', email: '', phone: '', status: 'Active' });
      await fetchClients();
    } catch (error: any) {
      console.error(error);
      setError(error.message || 'Operation failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return;
    
    try {
      await DataService.deleteClient(id);
      setActionMenuOpenId(null);
      fetchClients();
    } catch (error) {
      alert("Failed to delete client");
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Clients</h1>
            <p className="text-slate-500 mt-1">Manage your client directory</p>
          </div>
          <button 
            onClick={openAddModal}
            className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Client</span>
          </button>
        </div>

        <Card className="overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-8 flex justify-center">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto min-h-[300px]">
              {filteredClients.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                    No clients found.
                </div>
              ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cases</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Contact</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-slate-50 transition-colors group relative">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold mr-3">
                              {client.name.charAt(0)}
                          </div>
                          <div>
                              <div className="text-sm font-medium text-slate-900">{client.name}</div>
                              <div className="text-xs text-slate-500">ID: {client.id.toString().slice(-4)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          client.status === 'Active' ? 'bg-green-100 text-green-800' :
                          client.status === 'Lead' ? 'bg-blue-100 text-blue-800' :
                          'bg-slate-100 text-slate-800'
                        }`}>
                          {client.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-600 flex flex-col space-y-1">
                          <div className="flex items-center space-x-2">
                             <Mail className="w-3 h-3" /> <span>{client.email}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                             <Phone className="w-3 h-3" /> <span>{client.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                         <div className="flex items-center space-x-1 text-sm text-slate-600">
                             <span className="font-medium">{client.caseCount}</span>
                             <span>Active</span>
                         </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {new Date(client.lastContact).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setActionMenuOpenId(actionMenuOpenId === client.id ? null : client.id);
                            }}
                            className="text-slate-400 hover:text-blue-600 p-2 rounded-full hover:bg-blue-50 transition-colors"
                        >
                          <MoreHorizontal className="w-5 h-5" />
                        </button>

                        {/* Dropdown Menu */}
                        {actionMenuOpenId === client.id && (
                            <div 
                                ref={dropdownRef}
                                className="absolute right-8 top-8 z-50 w-36 bg-white rounded-lg shadow-lg border border-slate-100 py-1 text-left origin-top-right animate-in fade-in zoom-in-95 duration-100"
                            >
                                <button 
                                    onClick={() => openEditModal(client)}
                                    className="w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                >
                                    <Edit className="w-3 h-3" /> Edit
                                </button>
                                <button 
                                    onClick={() => handleDeleteClient(client.id)}
                                    className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                    <Trash2 className="w-3 h-3" /> Delete
                                </button>
                            </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              )}
            </div>
          )}
        </Card>

        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900">{editingId ? 'Edit Client' : 'Add New Client'}</h3>
                <button 
                    onClick={() => setIsModalOpen(false)} 
                    className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {error && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
                        {error}
                    </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input
                    required
                    type="text"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input
                    required
                    type="email"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <input
                    required
                    type="tel"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                  >
                      <option value="Active">Active</option>
                      <option value="Lead">Lead</option>
                      <option value="Inactive">Inactive</option>
                  </select>
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
                    disabled={isSubmitting}
                    className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors font-medium shadow-md hover:shadow-lg ${
                        isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {isSubmitting ? 'Saving...' : (editingId ? 'Update Client' : 'Create Client')}
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