import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import connectDB from '@/lib/db';
import { CaseNote, Case } from '@/models/Schemas';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const { content } = await req.json();
    await connectDB();
    
    // Verify case ownership
    const exists = await Case.findOne({ _id: params.id, userId: session.user.id });
    if (!exists) return NextResponse.json({ message: 'Case not found' }, { status: 404 });

    const note = await CaseNote.create({
      caseId: params.id,
      content,
      createdBy: session.user.name || 'User'
    });

    return NextResponse.json({
      id: note._id,
      content: note.content,
      createdAt: note.createdAt,
      createdBy: note.createdBy
    });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to add note' }, { status: 500 });
  }
}