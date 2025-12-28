import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import connectDB from '@/lib/db';
import { User } from '@/models/Schemas';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const { current, new: newPass } = await req.json();
    
    await connectDB();
    const user = await User.findById(session.user.id);

    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

    const isValid = await bcrypt.compare(current, user.password);
    if (!isValid) {
        return NextResponse.json({ message: 'Incorrect current password' }, { status: 400 });
    }

    const hashed = await bcrypt.hash(newPass, 10);
    user.password = hashed;
    await user.save();

    return NextResponse.json({ message: 'Password updated' });
  } catch (error) {
    return NextResponse.json({ message: 'Error updating password' }, { status: 500 });
  }
}