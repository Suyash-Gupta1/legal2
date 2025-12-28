import { Client, CaseStats, Case, CaseNote, CaseDocument } from '../types';

export const DataService = {
  getClients: async (): Promise<Client[]> => {
    const response = await fetch('/api/clients');
    if (!response.ok) throw new Error('Failed to fetch clients');
    return response.json();
  },

  addClient: async (client: Omit<Client, 'id' | 'caseCount'>): Promise<Client> => {
    const response = await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(client)
    });
    
    if (!response.ok) {
      let errorMessage = 'Failed to add client';
      try {
        const errorData = await response.json();
        if (errorData.message) errorMessage = errorData.message;
      } catch (e) { }
      throw new Error(errorMessage);
    }
    return response.json();
  },

  updateClient: async (id: string, client: Partial<Client>): Promise<Client> => {
    const response = await fetch('/api/clients', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...client })
    });

    if (!response.ok) throw new Error('Failed to update client');
    return response.json();
  },

  deleteClient: async (id: string): Promise<void> => {
    const response = await fetch(`/api/clients?id=${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete client');
  },

  getCases: async (): Promise<Case[]> => {
    const response = await fetch('/api/cases');
    if (!response.ok) throw new Error('Failed to fetch cases');
    return response.json();
  },

  getCase: async (id: string): Promise<Case> => {
    const response = await fetch(`/api/cases/${id}`);
    if (!response.ok) throw new Error('Failed to fetch case');
    return response.json();
  },

  addCase: async (newCase: Omit<Case, 'id' | 'caseNumber'>): Promise<Case> => {
    const response = await fetch('/api/cases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCase)
    });
    if (!response.ok) throw new Error('Failed to add case');
    return response.json();
  },

  updateCase: async (id: string, updates: Partial<Case>): Promise<Case> => {
    const response = await fetch(`/api/cases/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error('Failed to update case');
    return response.json();
  },

  addCaseNote: async (caseId: string, content: string): Promise<CaseNote> => {
    const response = await fetch(`/api/cases/${caseId}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    });
    if (!response.ok) throw new Error('Failed to add note');
    return response.json();
  },

  // For JSON metadata (Invoices)
  addCaseDocument: async (caseId: string, data: { name: string; type: 'UPLOAD' | 'INVOICE'; size: string }): Promise<CaseDocument> => {
    const response = await fetch(`/api/cases/${caseId}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to add document');
    return response.json();
  },

  // For File Uploads (Cloudinary)
  uploadCaseDocument: async (caseId: string, formData: FormData): Promise<CaseDocument> => {
    const response = await fetch(`/api/cases/${caseId}/documents`, {
        method: 'POST',
        body: formData, // No Content-Type header; browser sets multipart boundary
    });
    if (!response.ok) throw new Error('Failed to upload document');
    return response.json();
  },

  deleteCaseDocument: async (docId: string): Promise<void> => {
    const response = await fetch(`/api/documents/${docId}`, {
        method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete document');
  },

  getStats: async (): Promise<CaseStats> => {
    const response = await fetch('/api/stats');
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  },

  updateUserProfile: async (data: { name: string }) => {
    const response = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update profile');
    return response.json();
  },

  updateUserPassword: async (data: { current: string, new: string }) => {
    const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to update password');
    }
    return response.json();
  }
};