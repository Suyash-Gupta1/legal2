'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataService } from '@/services/data';
import { Case, CaseDocument } from '@/types';
import { Card } from '@/components/Card';
import { Calendar, Clock, ArrowLeft, MessageSquare, Send, Upload, FileText, Mail, CheckCircle, Download, File, ExternalLink } from 'lucide-react';
import AppLayout from '@/components/Layout';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function CaseDetails() {
  const params = useParams();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [noteContent, setNoteContent] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (params.id) {
        fetchCaseDetails();
    }
  }, [params.id]);

  const fetchCaseDetails = async () => {
    try {
      const data = await DataService.getCase(params.id as string);
      setCaseData(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (e?: React.FormEvent, content?: string) => {
    if (e) e.preventDefault();
    const textToAdd = content || noteContent;
    
    if (!textToAdd.trim() || !caseData) return;

    setSubmittingNote(true);
    try {
      const newNote = await DataService.addCaseNote(caseData.id, textToAdd);
      setCaseData(prev => prev ? ({
        ...prev,
        notes: [newNote, ...(prev.notes || [])]
      }) : null);
      if (!content) setNoteContent('');
    } catch (error) {
      console.error("Failed to add note");
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0] && caseData) {
          const file = e.target.files[0];
          setFileUploading(true);
          
          try {
              const formData = new FormData();
              formData.append('file', file);
              
              // Upload actual file to Cloudinary via API
              const newDoc = await DataService.uploadCaseDocument(caseData.id, formData);

              setCaseData(prev => prev ? ({
                  ...prev,
                  documents: [newDoc, ...(prev.documents || [])]
              }) : null);
              
              await handleAddNote(undefined, `📁 Document Uploaded: ${file.name} (${newDoc.size})`);
              
              alert("Document uploaded successfully!");
          } catch (error) {
              console.error(error);
              alert("Failed to upload document.");
          } finally {
              setFileUploading(false);
              if (fileInputRef.current) fileInputRef.current.value = '';
          }
      }
  };

  const handleGenerateInvoice = async () => {
      if (!caseData) return;
      const confirm = window.confirm(`Generate invoice for current value $${caseData.value}?`);
      if (confirm) {
          const invoiceNum = `INV-${Math.floor(Math.random() * 10000)}`;
          
          try {
              const newDoc = await DataService.addCaseDocument(caseData.id, {
                  name: `Invoice #${invoiceNum}`,
                  type: 'INVOICE',
                  size: 'HTML'
              });

               setCaseData(prev => prev ? ({
                  ...prev,
                  documents: [newDoc, ...(prev.documents || [])]
              }) : null);

              await handleAddNote(undefined, `💰 Invoice Generated: #${invoiceNum} for $${caseData.value.toLocaleString()}`);
              
              // Auto download
              handleDownload(newDoc);
              
          } catch (e) {
              alert("Failed to generate invoice.");
          }
      }
  };

  const handleDownload = (doc: CaseDocument) => {
    if (!caseData) return;

    if (doc.type === 'INVOICE') {
        const content = `
<!DOCTYPE html>
<html>
<head>
    <title>${doc.name}</title>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; border: 1px solid #eee; }
        .header { border-bottom: 2px solid #2563EB; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
        .logo { font-size: 24px; font-weight: bold; color: #2563EB; }
        .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; }
        .label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
        .value { font-size: 16px; font-weight: 500; }
        .amount-box { background: #F3F4F6; padding: 20px; border-radius: 8px; text-align: right; }
        .amount-label { font-size: 14px; color: #666; }
        .amount-value { font-size: 36px; font-weight: bold; color: #111; }
        .status { display: inline-block; padding: 6px 12px; background: #DCFCE7; color: #166534; border-radius: 20px; font-size: 14px; font-weight: 600; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">LegalFlow</div>
        <div>Official Receipt</div>
    </div>
    <div class="meta-grid">
        <div>
            <div class="label">Billed To</div>
            <div class="value">${caseData.clientName}</div>
            <div style="font-size: 14px; color: #666; margin-top: 4px;">${caseData.caseNumber}</div>
        </div>
        <div style="text-align: right;">
            <div class="label">Invoice Details</div>
            <div class="value">${doc.name}</div>
            <div style="font-size: 14px; color: #666; margin-top: 4px;">Date: ${new Date(doc.createdAt).toLocaleDateString()}</div>
        </div>
    </div>
    <div class="amount-box">
        <div class="amount-label">Total Amount Paid</div>
        <div class="amount-value">$${caseData.value.toLocaleString()}</div>
        <div class="status">PAID IN FULL</div>
    </div>
</body>
</html>`;
        
        const blob = new Blob([content], { type: 'text/html' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${doc.name.replace(/\s/g, '_')}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } else if (doc.url) {
        // Open Cloudinary URL
        window.open(doc.url, '_blank');
    } else {
        alert("Document URL not found.");
    }
  };

  const handleSendEmail = async () => {
      if (!caseData) return;
      window.location.href = `mailto:?subject=Update regarding Case: ${caseData.caseNumber}&body=Dear ${caseData.clientName},%0D%0A%0D%0AHere is an update regarding your case.`;
      await handleAddNote(undefined, `📧 Email draft opened for client: ${caseData.clientName}`);
  };

  const handleCloseCase = async () => {
      if (!caseData) return;
      if (window.confirm("Are you sure you want to close this case? This will update the status to 'Closed'.")) {
          try {
              const updated = await DataService.updateCase(caseData.id, { status: 'Closed' });
              setCaseData({ ...caseData, status: updated.status });
              await handleAddNote(undefined, `🛑 Case marked as CLOSED by user.`);
              alert("Case closed successfully.");
          } catch (e) {
              alert("Failed to close case.");
          }
      }
  };

  if (loading) {
      return (
          <AppLayout>
              <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
          </AppLayout>
      );
  }

  if (!caseData) {
      return (
          <AppLayout>
              <div className="p-8"><div className="text-center">Case not found</div></div>
          </AppLayout>
      );
  }

  return (
    <AppLayout>
      <div className="p-8 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center space-x-4 mb-6">
            <Link href="/cases" className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600">
                <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
                <h1 className="text-2xl font-bold text-slate-900">{caseData.title}</h1>
                <p className="text-slate-500">{caseData.caseNumber}</p>
            </div>
            <div className={`ml-auto px-3 py-1 rounded-full text-sm font-semibold ${
                caseData.status === 'Open' ? 'bg-blue-100 text-blue-800' :
                caseData.status === 'Closed' ? 'bg-slate-100 text-slate-800' :
                'bg-orange-100 text-orange-800'
            }`}>
                {caseData.status}
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
                <Card title="Case Information">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Client</p>
                            <p className="text-slate-900 font-medium">{caseData.clientName}</p>
                        </div>
                         <div>
                            <p className="text-sm font-medium text-slate-500">Type</p>
                            <p className="text-slate-900">{caseData.type}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Priority</p>
                            <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium border ${
                                caseData.priority === 'High' ? 'bg-red-50 text-red-600 border-red-100' : 
                                caseData.priority === 'Medium' ? 'bg-orange-50 text-orange-600 border-orange-100' : 
                                'bg-green-50 text-green-600 border-green-100'
                            }`}>
                                {caseData.priority}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Estimated Value</p>
                            <p className="text-slate-900 font-medium">${(caseData.value || 0).toLocaleString()}</p>
                        </div>
                        <div>
                             <p className="text-sm font-medium text-slate-500 flex items-center gap-1">
                                 <Calendar className="w-3 h-3" /> Start Date
                             </p>
                             <p className="text-slate-900">{new Date(caseData.startDate).toLocaleDateString()}</p>
                        </div>
                         <div>
                             <p className="text-sm font-medium text-slate-500 flex items-center gap-1">
                                 <Clock className="w-3 h-3" /> Next Hearing
                             </p>
                             <p className="text-slate-900 font-medium">
                                 {caseData.nextHearing ? new Date(caseData.nextHearing).toLocaleDateString() : 'Not scheduled'}
                             </p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                        <h3 className="text-lg font-semibold text-slate-900">Recent Documents</h3>
                        <Link href={`/cases/${caseData.id}/documents`} className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                            View All <ExternalLink className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {caseData.documents && caseData.documents.length > 0 ? (
                            caseData.documents.slice(0, 3).map((doc) => (
                                <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg hover:bg-slate-100 transition-colors">
                                    <div className="flex items-center space-x-3 overflow-hidden">
                                        <div className={`flex-shrink-0 p-2 rounded-lg ${doc.type === 'INVOICE' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                            {doc.type === 'INVOICE' ? <FileText className="w-5 h-5" /> : <File className="w-5 h-5" />}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-slate-900 truncate">{doc.name}</p>
                                            <p className="text-xs text-slate-500 truncate">{doc.size} • {new Date(doc.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleDownload(doc)}
                                        className="p-2 text-slate-400 hover:text-blue-600 transition-colors flex-shrink-0"
                                        title={doc.type === 'INVOICE' ? 'Download Invoice' : 'View Document'}
                                    >
                                        {doc.type === 'INVOICE' ? <Download className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-6 text-slate-500 border-2 border-dashed border-slate-100 rounded-lg">
                                <p>No documents uploaded yet.</p>
                            </div>
                        )}
                    </div>
                </Card>

                <Card title="Follow-up Notes & Timeline">
                    <form onSubmit={e => handleAddNote(e)} className="mb-6 relative">
                        <textarea 
                            className="w-full border border-slate-300 rounded-lg p-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[100px] resize-none"
                            placeholder="Record a follow-up, meeting note, or update..."
                            value={noteContent}
                            onChange={(e) => setNoteContent(e.target.value)}
                        />
                        <button 
                            type="submit"
                            disabled={submittingNote || !noteContent.trim()}
                            className="absolute bottom-3 right-3 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-slate-300 transition-colors"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>

                    <div className="space-y-6">
                        {caseData.notes && caseData.notes.length > 0 ? (
                            caseData.notes.map((note) => (
                                <div key={note.id} className="flex gap-4">
                                    <div className="flex-shrink-0 mt-1">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                            <MessageSquare className="w-4 h-4 text-slate-500" />
                                        </div>
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-slate-900">{note.createdBy}</span>
                                            <span className="text-xs text-slate-500">{new Date(note.createdAt).toLocaleString()}</span>
                                        </div>
                                        <div className="mt-1 text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 whitespace-pre-wrap">
                                            {note.content}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-slate-500 py-4">No notes recorded yet.</div>
                        )}
                    </div>
                </Card>
            </div>

            <div className="space-y-6">
                <div className="bg-blue-600 rounded-xl p-6 text-white shadow-lg">
                    <h3 className="font-bold text-lg mb-2">Next Steps</h3>
                    <p className="text-blue-100 text-sm mb-4">Ensure all documents are collected before the hearing date.</p>
                    
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                    />
                    
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={fileUploading}
                        className="w-full bg-white text-blue-600 py-2 rounded-lg font-semibold text-sm hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                    >
                        {fileUploading ? (
                            <span>Uploading...</span>
                        ) : (
                            <>
                                <Upload className="w-4 h-4" /> Upload Document
                            </>
                        )}
                    </button>
                </div>

                <Card title="Quick Actions">
                    <div className="space-y-2">
                        <button 
                            onClick={handleGenerateInvoice}
                            className="w-full text-left px-4 py-3 hover:bg-slate-50 rounded-lg text-slate-700 text-sm transition-colors flex items-center gap-3 border border-transparent hover:border-slate-100"
                        >
                            <FileText className="w-4 h-4 text-slate-400" />
                            Generate Invoice
                        </button>
                        <button 
                            onClick={handleSendEmail}
                            className="w-full text-left px-4 py-3 hover:bg-slate-50 rounded-lg text-slate-700 text-sm transition-colors flex items-center gap-3 border border-transparent hover:border-slate-100"
                        >
                            <Mail className="w-4 h-4 text-slate-400" />
                            Send Email to Client
                        </button>
                        {caseData.status !== 'Closed' ? (
                             <button 
                                onClick={handleCloseCase}
                                className="w-full text-left px-4 py-3 hover:bg-red-50 rounded-lg text-red-600 text-sm transition-colors flex items-center gap-3 border border-transparent hover:border-red-100"
                            >
                                <CheckCircle className="w-4 h-4" />
                                Close Case
                            </button>
                        ) : (
                            <div className="w-full text-center px-4 py-3 bg-slate-100 rounded-lg text-slate-500 text-sm">
                                Case is Closed
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
      </div>
    </AppLayout>
  );
}