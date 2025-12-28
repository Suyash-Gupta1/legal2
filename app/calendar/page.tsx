'use client';

import React, { useState, useEffect } from 'react';
import { DataService } from '@/services/data';
import { Case } from '@/types';
import AppLayout from '@/components/Layout';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import Link from 'next/link';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const data = await DataService.getCases();
      // Filter for cases with nextHearing
      setEvents(data.filter(c => c.nextHearing));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);
    
    const calendarDays = [];
    
    // Empty cells for previous month
    for (let i = 0; i < startDay; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="bg-slate-50 min-h-[100px] border-b border-r border-slate-200"></div>);
    }

    // Days of current month
    for (let d = 1; d <= days; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        
        // Find events for this day (handling timezone simplified by checking YYYY-MM-DD match)
        const dayEvents = events.filter(e => {
            if (!e.nextHearing) return false;
            const hDate = new Date(e.nextHearing);
            return hDate.getDate() === d && hDate.getMonth() === month && hDate.getFullYear() === year;
        });

        const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();

        calendarDays.push(
            <div key={d} className={`min-h-[120px] bg-white border-b border-r border-slate-200 p-2 transition-colors hover:bg-slate-50 ${isToday ? 'bg-blue-50/30' : ''}`}>
                <div className={`text-sm font-semibold mb-2 ${isToday ? 'text-blue-600' : 'text-slate-700'}`}>
                    {isToday ? <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center">{d}</span> : d}
                </div>
                <div className="space-y-1">
                    {dayEvents.map(ev => (
                        <Link 
                            key={ev.id} 
                            href={`/cases/${ev.id}`}
                            className="block text-xs p-1.5 rounded bg-blue-100 text-blue-800 hover:bg-blue-200 truncate border-l-2 border-blue-500"
                        >
                            <div className="font-semibold truncate">{ev.title}</div>
                            <div className="text-[10px] opacity-75">{ev.caseNumber}</div>
                        </Link>
                    ))}
                </div>
            </div>
        );
    }

    return calendarDays;
  };

  return (
    <AppLayout>
      <div className="p-8 max-w-7xl mx-auto h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Calendar</h1>
                <p className="text-slate-500 mt-1">Schedule and Hearing Dates</p>
            </div>
            <div className="flex items-center space-x-4 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-md text-slate-600">
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="font-semibold text-lg w-40 text-center text-slate-800">
                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
                <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-md text-slate-600">
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>

        <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden flex-1 flex flex-col">
            <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 flex-1 auto-rows-fr">
                {loading ? (
                    <div className="col-span-7 flex justify-center items-center h-64">
                         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : renderCalendar()}
            </div>
        </div>
      </div>
    </AppLayout>
  );
}