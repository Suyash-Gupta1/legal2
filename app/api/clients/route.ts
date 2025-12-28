import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import connectDB from '@/lib/db';
import { Client } from '@/models/Schemas';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const clients = await Client.find({ userId: session.user.id }).sort({ lastContact: -1 });
  
  return NextResponse.json(clients.map((c: any) => ({
    id: c._id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    status: c.status,
    lastContact: c.lastContact,
    caseCount: c.caseCount
  })));
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    await connectDB();
    
    const newClient = await Client.create({
      ...body,
      userId: session.user.id
    }) as any;

    return NextResponse.json({ id: newClient._id, ...newClient.toObject() });
  } catch (error: any) {
    if (error.code === 11000) {
      const field = error.keyPattern ? Object.keys(error.keyPattern)[0] : 'field';
      return NextResponse.json(
        { message: `A client with this ${field} already exists.` }, 
        { status: 400 }
      );
    }
    return NextResponse.json({ message: 'Failed to create client' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { id, ...updateData } = body;
    
    if (!id) return NextResponse.json({ message: 'ID required' }, { status: 400 });

    await connectDB();
    const updatedClient = await Client.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { $set: updateData },
      { new: true }
    );

    if (!updatedClient) return NextResponse.json({ message: 'Client not found' }, { status: 404 });

    return NextResponse.json({ id: updatedClient._id, ...updatedClient.toObject() });
  } catch (error) {
    return NextResponse.json({ message: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  
  if (!id) return NextResponse.json({ message: 'ID required' }, { status: 400 });

  await connectDB();
  await Client.findOneAndDelete({ _id: id, userId: session.user.id });
  
  return NextResponse.json({ message: 'Deleted successfully' });
}