export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import connectDB from '@/lib/db';
import { Case, Client } from '@/models/Schemas';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const userId = session.user.id;
    
    // Fetch summary counts
    const activeCases = await Case.countDocuments({ userId, status: { $in: ['Open', 'In Progress'] } });
    const totalClients = await Client.countDocuments({ userId });
    const pendingActions = await Case.countDocuments({ userId, priority: 'High', status: { $ne: 'Closed' } });
    
    // Revenue Calculation: Sum of 'value' for all non-cancelled cases (simplified)
    const allCases = await Case.find({ userId }).select('startDate status value');
    
    const revenueYTD = allCases.reduce((acc: number, curr: any) => acc + (curr.value || 0), 0);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    // Generate last 6 months labels
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(currentMonth - i);
        last6Months.push({
            index: d.getMonth(),
            name: months[d.getMonth()],
            year: d.getFullYear()
        });
    }

    // Process Case Data for Charts
    const monthlyData = last6Months.map(m => {
        const count = allCases.filter((c: any) => {
            const d = new Date(c.startDate);
            return d.getMonth() === m.index && d.getFullYear() === m.year;
        }).length;
        
        return { name: m.name, value: count };
    });

    // Process Revenue Data (Actual sum of values per month)
    const revenueData = last6Months.map(m => {
        const monthlySum = allCases
            .filter((c: any) => {
                const d = new Date(c.startDate);
                return d.getMonth() === m.index && d.getFullYear() === m.year;
            })
            .reduce((sum: number, c: any) => sum + (c.value || 0), 0);

        return { name: m.name, value: monthlySum }; 
    });

    return NextResponse.json({
      activeCases,
      totalClients,
      pendingActions,
      revenueYTD,
      monthlyData,
      revenueData
    });

  } catch (error) {
    console.error("Stats Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}