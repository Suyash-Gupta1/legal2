import mongoose, { Schema, model, models, Model } from 'mongoose';

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'lawyer', 'staff'], default: 'lawyer' },
  createdAt: { type: Date, default: Date.now }
});

export const User = (models.User || model('User', UserSchema)) as Model<any>;

const ClientSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  status: { type: String, enum: ['Active', 'Inactive', 'Lead'], default: 'Active' },
  lastContact: { type: Date, default: Date.now },
  caseCount: { type: Number, default: 0 }
});

export const Client = (models.Client || model('Client', ClientSchema)) as Model<any>;

const CaseNoteSchema = new Schema({
  caseId: { type: Schema.Types.ObjectId, ref: 'Case', required: true },
  content: { type: String, required: true },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const CaseNote = (models.CaseNote || model('CaseNote', CaseNoteSchema)) as Model<any>;

const CaseDocumentSchema = new Schema({
  caseId: { type: Schema.Types.ObjectId, ref: 'Case', required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['UPLOAD', 'INVOICE'], default: 'UPLOAD' },
  size: { type: String, required: true },
  url: { type: String },
  publicId: { type: String },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const CaseDocument = (models.CaseDocument || model('CaseDocument', CaseDocumentSchema)) as Model<any>;

const CaseSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  clientId: { type: Schema.Types.ObjectId, ref: 'Client' },
  caseNumber: { type: String, required: true },
  title: { type: String, required: true },
  clientName: { type: String, required: true },
  status: { type: String, enum: ['Open', 'Closed', 'In Progress', 'On Hold'], default: 'Open' },
  type: { type: String, enum: ['Civil', 'Criminal', 'Corporate', 'Family', 'Other'], default: 'Civil' },
  startDate: { type: Date, default: Date.now },
  priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  nextHearing: { type: Date },
  value: { type: Number, default: 0 }
});

export const Case = (models.Case || model('Case', CaseSchema)) as Model<any>;