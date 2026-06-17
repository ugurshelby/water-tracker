import React, { useState, useEffect } from 'react';
import { WTEntry, WTSettings, WTDeficit } from './types';
import { Home } from './Home';
import { Calendar } from './Calendar';
import { getTodayDateString } from './utils';
import { Droplet, Calendar as CalendarIcon } from 'lucide-react';

const DEFAULT_SETTINGS: WTSettings = {
  day_type: 'normal',
  goal_normal_ml: 3250,
  goal_sport_ml: 4500,
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'calendar'>('home');
  const [isReady, setIsReady] = useState(false);

  // States
  const [entries, setEntries] = useState<WTEntry[]>([]);
  const [settings, setSettings] = useState<WTSettings>(DEFAULT_SETTINGS);
  const [deficit, setDeficit] = useState<WTDeficit | null>(null);

  const todayStr = getTodayDateString();

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedEntries = localStorage.getItem('wt_entries');
      const storedSettings = localStorage.getItem('wt_settings');
      const storedDeficit = localStorage.getItem('wt_yesterday_deficit');

      if (storedEntries) setEntries(JSON.parse(storedEntries));
      if (storedSettings) setSettings(JSON.parse(storedSettings));
      if (storedDeficit) setDeficit(JSON.parse(storedDeficit));
    } catch (e) {
      console.error('Error loading data', e);
    }
    setIsReady(true);
  }, []);

  // Check deficit when entries/settings load
  useEffect(() => {
    if (!isReady) return;

    // We only check once per day, if we haven't checked for yesterday yet
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const yesterdayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    if (deficit && deficit.date === yesterdayStr) {
      // Already calculated deficit for yesterday
      return; 
    }

    if (deficit && deficit.date !== yesterdayStr && deficit.date !== todayStr) {
      // Old deficit, clear it if not relevant
      handleDismissDeficit();
    }

    // Calculate yesterday's deficit
    const yesterdayEntries = entries.filter(e => e.date === yesterdayStr);
    const totalYesterday = yesterdayEntries.reduce((sum, e) => sum + e.amount_ml, 0);
    
    // We don't know yesterday's exact goal type (normal vs sport) securely unless we stored a daily log, 
    // but fallback to normal_ml for the check to be safe
    const goal = settings.goal_normal_ml; 

    // Only set if we actually have *some* history so we don't annoy brand new users
    const hasAnyHistory = entries.some(e => e.date <= yesterdayStr);

    if (hasAnyHistory && totalYesterday < goal && totalYesterday > 0) {
      const newDeficit = {
        date: yesterdayStr,
        deficit_ml: goal - totalYesterday
      };
      setDeficit(newDeficit);
      localStorage.setItem('wt_yesterday_deficit', JSON.stringify(newDeficit));
    }
  }, [isReady, entries]);

  // Saves
  useEffect(() => {
    if (isReady) localStorage.setItem('wt_entries', JSON.stringify(entries));
  }, [entries, isReady]);

  useEffect(() => {
    if (isReady) localStorage.setItem('wt_settings', JSON.stringify(settings));
  }, [settings, isReady]);

  // Handlers
  const handleAddEntry = (amount: number, type: WTEntry['type']) => {
    const newEntry: WTEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      amount_ml: amount,
      type,
      date: todayStr
    };
    setEntries(prev => [...prev, newEntry]);
  };

  const handleDeleteEntry = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const handleToggleDayType = (type: 'normal' | 'sport') => {
    setSettings(prev => ({ ...prev, day_type: type }));
  };

  const handleDismissDeficit = () => {
    setDeficit(null);
    localStorage.removeItem('wt_yesterday_deficit');
  };

  if (!isReady) return <div className="min-h-screen bg-[#0a0f1e]"></div>;

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white font-sans max-w-[480px] mx-auto relative overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-none">
        {/* Simple Tab Transition wrapper */}
        <div 
           className="w-full transition-all duration-300 ease-in-out"
           style={{ opacity: activeTab === 'home' ? 1 : 0, transform: activeTab === 'home' ? 'translateX(0)' : 'translateX(-20px)', position: activeTab === 'home' ? 'relative' : 'absolute', pointerEvents: activeTab === 'home' ? 'auto' : 'none' }}
        >
          <Home 
            entries={entries}
            settings={settings}
            deficit={deficit}
            onAddEntry={handleAddEntry}
            onDeleteEntry={handleDeleteEntry}
            onToggleDayType={handleToggleDayType}
            onDismissDeficit={handleDismissDeficit}
            todayStr={todayStr}
          />
        </div>
        
        <div 
           className="w-full transition-all duration-300 ease-in-out"
           style={{ opacity: activeTab === 'calendar' ? 1 : 0, transform: activeTab === 'calendar' ? 'translateX(0)' : 'translateX(20px)', position: activeTab === 'calendar' ? 'relative' : 'absolute', pointerEvents: activeTab === 'calendar' ? 'auto' : 'none' }}
        >
          <Calendar 
            entries={entries}
            settings={settings}
            todayStr={todayStr}
          />
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-[#0a0f1eda] backdrop-blur-md border-t border-[#1a2235] pb-safe z-50">
        <div className="flex justify-around items-center h-16">
          <button 
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center w-full h-full relative transition-colors ${activeTab === 'home' ? 'text-[#3b82f6]' : 'text-[#94a3b8]'}`}
          >
            <Droplet size={24} className={activeTab === 'home' ? 'fill-blue-500/20' : ''} />
            {activeTab === 'home' && (
              <div className="absolute top-1 w-1 h-1 bg-[#3b82f6] rounded-full" />
            )}
          </button>
          
          <button 
            onClick={() => setActiveTab('calendar')}
            className={`flex flex-col items-center justify-center w-full h-full relative transition-colors ${activeTab === 'calendar' ? 'text-[#3b82f6]' : 'text-[#94a3b8]'}`}
          >
            <CalendarIcon size={24} className={activeTab === 'calendar' ? 'fill-blue-500/20' : ''} />
            {activeTab === 'calendar' && (
              <div className="absolute top-1 w-1 h-1 bg-[#3b82f6] rounded-full" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

