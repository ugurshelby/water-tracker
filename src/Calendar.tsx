import React, { useState } from 'react';
import { WTEntry, WTSettings } from './types';
import { CircularProgress } from './components/CircularProgress';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getTodayDateString } from './utils';

interface CalendarProps {
  entries: WTEntry[];
  settings: WTSettings;
  todayStr: string;
}

export function Calendar({ entries, settings, todayStr }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // Navigation
  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  // Determine days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayObj = new Date(year, month, 1);
  let firstDayOfWeek = firstDayObj.getDay(); 
  // Adjust so Monday is 0, Sunday is 6
  firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  // Build grid data
  // We need to group days into rows. Each row is a week starting Monday.
  const weeks: { days: (number | null)[]; weekData: string[] }[] = [];
  let currentWeek: (number | null)[] = new Array(firstDayOfWeek).fill(null);
  let currentWeekDates: string[] = new Array(firstDayOfWeek).fill("");

  for (let d = 1; d <= daysInMonth; d++) {
    currentWeek.push(d);
    
    // YYYY-MM-DD
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    currentWeekDates.push(dateStr);

    if (currentWeek.length === 7) {
      weeks.push({ days: currentWeek, weekData: currentWeekDates });
      currentWeek = [];
      currentWeekDates = [];
    }
  }

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
      currentWeekDates.push("");
    }
    weeks.push({ days: currentWeek, weekData: currentWeekDates });
  }

  // Pre-calculate daily totals
  const dailyTotals: Record<string, number> = {};
  entries.forEach(e => {
    if (!dailyTotals[e.date]) dailyTotals[e.date] = 0;
    dailyTotals[e.date] += e.amount_ml;
  });

  const getWeekStats = (weekDates: string[]) => {
    let weekTotal = 0;
    let daysWithGoal = 0;
    // Just use normal goal for the calendar overview simplification, 
    // or we could store historical daily goals.
    const goal = settings.goal_normal_ml; 
    
    weekDates.forEach(dateStr => {
      if (dateStr && dailyTotals[dateStr]) {
        weekTotal += dailyTotals[dateStr];
      }
      if (dateStr) daysWithGoal += goal;
    });

    const percent = daysWithGoal > 0 ? (weekTotal / daysWithGoal) * 100 : 0;
    return percent;
  };

  const monthName = currentMonth.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

  // Calculate weekly stats
  let totalWeek = 0;
  let activeDaysWeek = 0;
  let bestStreak = 0;
  let tempStreak = 0;

  // Streak logic (basic)
  const sortedDates = Object.keys(dailyTotals).sort();
  sortedDates.forEach(date => {
     if (dailyTotals[date] >= settings.goal_normal_ml) { // simplified goal check
       tempStreak++;
       bestStreak = Math.max(bestStreak, tempStreak);
     } else {
       tempStreak = 0;
     }
  });

  // Weekly calculations based on current week (Mon-Sun containing today)
  const todayParts = todayStr.split('-');
  const tObj = new Date(Number(todayParts[0]), Number(todayParts[1]) - 1, Number(todayParts[2]));
  const tDay = tObj.getDay();
  const tDiff = tObj.getDate() - tDay + (tDay === 0 ? -6 : 1);
  const startOfWeek = new Date(tObj.setDate(tDiff));

  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek.getTime());
    d.setDate(d.getDate() + i);
    const yStr = d.getFullYear();
    const mStr = String(d.getMonth() + 1).padStart(2, '0');
    const dStr = String(d.getDate()).padStart(2, '0');
    const dKey = `${yStr}-${mStr}-${dStr}`;
    
    if (dailyTotals[dKey]) {
      totalWeek += dailyTotals[dKey];
      activeDaysWeek++;
    }
  }

  const avgWeek = activeDaysWeek > 0 ? Math.round(totalWeek / activeDaysWeek) : 0;

  const handleDayClick = (dateStr: string) => {
    if (!dateStr) return;
    const total = dailyTotals[dateStr] || 0;
    // We could show a simple native alert for mobile or build a modal,
    // Native alert is requested to avoid if possible, let's just rely on the color
    // but maybe we can show an empty state log if they click. For now keep simple.
  };

  return (
    <div className="flex flex-col w-full pb-32 px-4 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={prevMonth} className="p-2 text-[#94a3b8] hover:text-white bg-[#111827] rounded-xl"><ChevronLeft size={20} /></button>
        <h2 className="text-white font-medium capitalize">{monthName}</h2>
        <button onClick={nextMonth} className="p-2 text-[#94a3b8] hover:text-white bg-[#111827] rounded-xl"><ChevronRight size={20} /></button>
      </div>

      {/* Grid Headers */}
      <div className="grid grid-cols-8 gap-1 mb-4 text-center">
        <div className="text-xs font-semibold text-[#94a3b8]">Hrt</div>
        {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(d => (
          <div key={d} className="text-xs font-semibold text-[#94a3b8]">{d}</div>
        ))}
      </div>

      {/* Grid Rows */}
      <div className="space-y-4">
        {weeks.map((week, wIndex) => {
          const weekPercent = getWeekStats(week.weekData);
          return (
            <div key={wIndex} className="grid grid-cols-8 gap-x-1 gap-y-2 items-center">
              {/* Weekly Circle */}
              <div className="flex justify-center">
                <CircularProgress percent={weekPercent} size={36} strokeWidth={3} />
              </div>

              {/* Days */}
              {week.days.map((day, dIndex) => {
                const dateStr = week.weekData[dIndex];
                const total = dateStr ? (dailyTotals[dateStr] || 0) : 0;
                const percent = dateStr ? (total / settings.goal_normal_ml) * 100 : 0;
                
                let dotColorClass = "bg-transparent";
                if (dateStr) {
                  if (dateStr > todayStr) {
                    dotColorClass = "bg-[#1a2235]"; // future
                  } else if (total === 0) {
                    dotColorClass = "bg-[#ef4444]"; // red (hiç giriş yapılmamış)
                  } else {
                    const tolerance = settings.goal_normal_ml * 0.10;
                    if (total >= settings.goal_normal_ml - tolerance && total <= settings.goal_normal_ml + tolerance) {
                      dotColorClass = "bg-[#22c55e]"; // green (tam ±%10)
                    } else {
                      dotColorClass = "bg-[#3b82f6]"; // blue (eksik veya fazla)
                    }
                  }
                }

                const isToday = dateStr === todayStr;

                return (
                  <div 
                    key={dIndex} 
                    className={`flex flex-col items-center justify-center p-1 relative rounded-xl ${isToday ? 'bg-[#3b82f6]/20 ring-1 ring-[#3b82f6]/50' : ''}`}
                    onClick={() => handleDayClick(dateStr)}
                  >
                    <span className={`text-sm ${day ? 'text-white' : 'text-transparent'}`}>{day || '0'}</span>
                    <div className={`w-1.5 h-1.5 rounded-full mt-1 ${dotColorClass}`} />
                  </div>
                );
              })}
            </div>
          )
        })}
      </div>

      {/* Stats */}
      <div className="mt-8 bg-[#111827] rounded-3xl p-5 space-y-4">
        <h3 className="text-[#94a3b8] font-medium text-sm mb-2 uppercase">Haftalık İstatistikler</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-[#94a3b8]">Ortalama</p>
            <p className="text-lg font-bold text-white mt-1">{avgWeek} <span className="text-[10px] font-normal text-[#94a3b8] uppercase">ml/gün</span></p>
          </div>
          <div>
            <p className="text-xs text-[#94a3b8]">En İyi Seri</p>
            <p className="text-lg font-bold text-white mt-1">{bestStreak} <span className="text-[10px] font-normal text-[#94a3b8] uppercase">gün</span></p>
          </div>
          <div>
            <p className="text-xs text-[#94a3b8]">Toplam</p>
            <p className="text-lg font-bold text-white mt-1">{(totalWeek / 1000).toFixed(1)} <span className="text-[10px] font-normal text-[#94a3b8] uppercase">L</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
