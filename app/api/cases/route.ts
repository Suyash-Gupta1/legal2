import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import connectDB from '@/lib/db';
import { Case, Client } from '@/models/Schemas';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const cases = await Case.find({ userId: session.user.id }).sort({ startDate: -1 });
  
  return NextResponse.json(cases.map((c: any) => ({
    id: c._id,
    caseNumber: c.caseNumber,
    title: c.title,
    clientName: c.clientName,
    status: c.status,
    type: c.type,
    startDate: c.startDate,
    priority: c.priority,
    nextHearing: c.nextHearing,
    value: c.value
  })));
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  await connectDB();
  
  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const newCase = await Case.create({
    ...body,
    userId: session.user.id,
    caseNumber: `CS-${new Date().getFullYear()}-${randomNum}`
  }) as any;

  // Increment client case count
  await Client.findOneAndUpdate(
    { name: newCase.clientName, userId: session.user.id },
    { $inc: { caseCount: 1 }, $set: { status: 'Active' } }
  );

  return NextResponse.json({ id: newCase._id, ...newCase.toObject() });
}