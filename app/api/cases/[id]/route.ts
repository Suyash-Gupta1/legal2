import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import connectDB from '@/lib/db';
import { Case, CaseNote, CaseDocument } from '@/models/Schemas';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const caseData = await Case.findOne({ _id: params.id, userId: session.user.id });
  
  if (!caseData) return NextResponse.json({ message: 'Case not found' }, { status: 404 });

  const notes = await CaseNote.find({ caseId: params.id }).sort({ createdAt: -1 });
  const documents = await CaseDocument.find({ caseId: params.id }).sort({ createdAt: -1 });

  return NextResponse.json({
    id: caseData._id,
    ...caseData.toObject(),
    notes: notes.map((n: any) => ({
      id: n._id,
      content: n.content,
      createdAt: n.createdAt,
      createdBy: n.createdBy
    })),
    documents: documents.map((d: any) => ({
      id: d._id,
      name: d.name,
      type: d.type,
      size: d.size,
      url: d.url, // Include URL for access
      createdAt: d.createdAt,
      createdBy: d.createdBy
    }))
  });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    await connectDB();

    const updatedCase = await Case.findOneAndUpdate(
      { _id: params.id, userId: session.user.id },
      { $set: body },
      { new: true }
    );

    if (!updatedCase) return NextResponse.json({ message: 'Case not found' }, { status: 404 });

    return NextResponse.json({
        id: updatedCase._id,
        ...updatedCase.toObject()
    });
  } catch (error) {
    return NextResponse.json({ message: 'Update failed' }, { status: 500 });
  }
}