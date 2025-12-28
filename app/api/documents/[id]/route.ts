import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import connectDB from '@/lib/db';
import { CaseDocument } from '@/models/Schemas';
import { authOptions } from '@/lib/auth';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    await connectDB();
    // In a real app, verify user owns the case associated with this document
    await CaseDocument.findByIdAndDelete(params.id);
    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to delete document' }, { status: 500 });
  }
}