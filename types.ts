
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'lawyer' | 'staff' | string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'Active' | 'Inactive' | 'Lead';
  lastContact: string;
  caseCount: number;
}

export interface CaseNote {
  id: string;
  content: string;
  createdAt: string;
  createdBy: string;
}

export interface CaseDocument {
  id: string;
  name: string;
  type: 'UPLOAD' | 'INVOICE';
  size: string;
  url?: string;
  publicId?: string;
  createdBy: string;
  createdAt: string;
}

export interface Case {
  id: string;
  caseNumber: string;
  title: string;
  clientName: string;
  status: 'Open' | 'Closed' | 'In Progress' | 'On Hold';
  type: 'Civil' | 'Criminal' | 'Corporate' | 'Family' | 'Other';
  startDate: string;
  priority: 'High' | 'Medium' | 'Low';
  nextHearing?: string;
  value: number;
  notes?: CaseNote[];
  documents?: CaseDocument[];
}

export interface ChartData {
  name: string;
  value: number;
}

export interface CaseStats {
  activeCases: number;
  totalClients: number;
  pendingActions: number;
  revenueYTD: number;
  monthlyData: ChartData[];
  revenueData: ChartData[];
}