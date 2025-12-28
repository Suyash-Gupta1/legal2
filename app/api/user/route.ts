import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import connectDB from '@/lib/db';
import { User } from '@/models/Schemas';
import { authOptions } from '@/lib/auth';

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const { name } = await req.json();
    
    await connectDB();
    await User.findByIdAndUpdate(session.user.id, { name });

    return NextResponse.json({ message: 'Profile updated' });
  } catch (error) {
    return NextResponse.json({ message: 'Error updating profile' }, { status: 500 });
  }
}