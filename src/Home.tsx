import React, { useState, useRef, useEffect } from 'react';
import { WTEntry, WTSettings, WTDeficit } from './types';
import { WaterBottle } from './components/WaterBottle';
import { getTodayFormatted, parseInputAmount } from './utils';
import { Droplet, Coffee, CupSoda, GlassWater, Trash2, Plus, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';

const SWIPE_THRESHOLD = -80;

function LogEntryItem({ 
  entry, 
  getIconForType, 
  getLabelForType, 
  onDelete 
}: { 
  entry: WTEntry; 
  getIconForType: (t: string) => React.ReactNode; 
  getLabelForType: (t: string) => string; 
  onDelete: (id: string) => void;
}) {
  const x = useMotionValue(0);
  const opacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
  const scale = useTransform(x, [0, SWIPE_THRESHOLD], [0.8, 1.1]);

  const handleDragEnd = (_event: any, info: any) => {
    if (info.offset.x < SWIPE_THRESHOLD) {
      onDelete(entry.id);
    } else {
      animate(x, 0, { type: "spring", stiffness: 400, damping: 30 });
    }
  };

  return (
    <div className="relative rounded-2xl mb-3 overflow-hidden bg-rose-500/20">
      <div className="absolute inset-y-0 right-0 flex items-center justify-end px-5 w-full pointer-events-none">
         <motion.div style={{ opacity, scale }}>
           <Trash2 className="text-rose-500" size={20} />
         </motion.div>
      </div>
      <motion.div 
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: -100, right: 0 }}
        dragSnapToOrigin={false}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className="flex items-center justify-between bg-[#111827] p-4 rounded-2xl relative z-10 touch-pan-y"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#1a2235] flex items-center justify-center">
            {getIconForType(entry.type)}
          </div>
          <div>
            <p className="text-white font-medium">{entry.amount_ml} ml</p>
            <p className="text-[#94a3b8] text-xs">{getLabelForType(entry.type)}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[#94a3b8] text-sm">
             {new Date(entry.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </motion.div>
    </div>
  );
}

interface HomeProps {
  entries: WTEntry[];
  settings: WTSettings;
  deficit: WTDeficit | null;
  onAddEntry: (amount: number, type: WTEntry['type']) => void;
  onDeleteEntry: (id: string) => void;
  onToggleDayType: (type: 'normal' | 'sport') => void;
  onDismissDeficit: () => void;
  todayStr: string;
}

export function Home({
  entries,
  settings,
  deficit,
  onAddEntry,
  onDeleteEntry,
  onToggleDayType,
  onDismissDeficit,
  todayStr
}: HomeProps) {
  const [inputValue, setInputValue] = useState('');
  const [selectedType, setSelectedType] = useState<WTEntry['type']>('water');

  const todayEntries = entries.filter(e => e.date === todayStr);
  const totalAmount = todayEntries.reduce((sum, e) => sum + e.amount_ml, 0);
  const currentGoal = settings.day_type === 'normal' ? settings.goal_normal_ml : settings.goal_sport_ml;
  const percent = currentGoal > 0 ? (totalAmount / currentGoal) * 100 : 0;

  const quickAmounts = [250, 330, 500, 1000];

  const previousAmountRef = useRef<number>(totalAmount);

  useEffect(() => {
    // Only fire confetti if we explicitly cross the boundary inside a session, 
    // or if we load immediately into a won state? Better to only fire when user action crosses it.
    if (previousAmountRef.current < currentGoal && totalAmount >= currentGoal) {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#60a5fa', '#93c5fd', '#ffffff'],
        disableForReducedMotion: true,
        zIndex: 100
      });
    }
    previousAmountRef.current = totalAmount;
  }, [totalAmount, currentGoal]);

  const handleCustomAdd = () => {
    const amount = parseInputAmount(inputValue);
    if (amount > 0) {
      onAddEntry(amount, selectedType);
      setInputValue('');
    }
  };

  const getIconForType = (type: string, size = 20) => {
    switch (type) {
      case 'water': return <Droplet size={size} className="text-blue-400" />;
      case 'coffee': return <Coffee size={size} className="text-amber-600" />;
      case 'juice': return <CupSoda size={size} className="text-orange-400" />;
      default: return <GlassWater size={size} className="text-emerald-400" />;
    }
  };

  const getLabelForType = (type: string) => {
    switch (type) {
      case 'water': return 'Su';
      case 'coffee': return 'Kahve';
      case 'juice': return 'Meyve Suyu';
      default: return 'Diğer';
    }
  };

  return (
    <div className="flex flex-col w-full pb-32">
      {/* Header */}
      <div className="flex flex-col items-center pt-6 pb-4">
        <h1 className="text-[#f8fafc] text-lg font-medium">{getTodayFormatted()}</h1>
        <div className="flex relative bg-[#111827] rounded-full p-1 mt-4 shadow-sm w-max">
          <button
            onClick={() => onToggleDayType('normal')}
            className={`relative z-10 px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${settings.day_type === 'normal' ? 'text-white' : 'text-[#94a3b8]'}`}
          >
            Normal Gün ({(settings.goal_normal_ml / 1000).toFixed(1)}L)
          </button>
          <button
            onClick={() => onToggleDayType('sport')}
            className={`relative z-10 px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${settings.day_type === 'sport' ? 'text-white' : 'text-[#94a3b8]'}`}
          >
            Spor Günü ({(settings.goal_sport_ml / 1000).toFixed(1)}L)
          </button>
          {/* Active indicator pill */}
          <div
            className="absolute top-1 bottom-1 w-1/2 bg-[#3b82f6] rounded-full transition-transform duration-300 ease-out"
            style={{ transform: settings.day_type === 'sport' ? 'translateX(100%)' : 'translateX(0)' }}
          />
        </div>
      </div>

      {/* Deficit Banner */}
      {deficit && deficit.deficit_ml > 0 && (
        <div className="mx-4 mb-6 relative bg-amber-900/30 border border-amber-700/50 rounded-2xl p-4 flex items-start shadow-sm">
          <div className="flex-1 pr-4">
            <p className="text-amber-200 text-sm font-medium">
              Dün {deficit.deficit_ml}ml eksik aldın — bugün telafi etmeyi dene 💧
            </p>
          </div>
          <button onClick={onDismissDeficit} className="text-amber-400 hover:text-amber-300 p-1 rounded-full bg-amber-900/40">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Hero Bottle */}
      <div className="py-6">
        <WaterBottle 
          percent={percent} 
          currentAmount={totalAmount} 
          goalAmount={currentGoal} 
          isOverLimit={totalAmount >= currentGoal} 
        />
      </div>

      {/* Quick Add */}
      <div className="px-4 mt-2">
        <div className="flex justify-between items-center overflow-x-auto gap-2 scrollbar-none pb-2">
          {quickAmounts.map(amt => (
            <button
              key={amt}
              onClick={() => onAddEntry(amt, 'water')}
              className="whitespace-nowrap px-4 py-2 rounded-xl border border-[#3b82f6]/30 bg-[#111827] text-[#f8fafc] text-sm font-medium tracking-tight active:scale-95 transition-transform shrink-0 flex-1"
            >
              {amt >= 1000 ? `${amt / 1000} Litre` : `${amt}ml`}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Add */}
      <div className="px-4 mt-6 bg-[#111827] mx-4 p-4 rounded-3xl">
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCustomAdd()}
            placeholder="Miktar gir... (ml veya L)"
            className="flex-1 bg-[#1a2235] text-white text-base rounded-2xl px-4 py-3 outline-none placeholder:text-[#94a3b8]"
          />
          <button 
            onClick={handleCustomAdd}
            className="bg-[#3b82f6] text-white px-5 rounded-2xl font-medium active:scale-95 transition-transform flex items-center justify-center"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {(['water', 'coffee', 'juice', 'other'] as const).map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-colors ${selectedType === type ? 'bg-[#3b82f6]/20 border border-[#3b82f6]/50' : 'bg-[#1a2235] border border-transparent'}`}
            >
              {getIconForType(type, 24)}
              <span className="text-[10px] mt-2 font-medium text-[#94a3b8]">{getLabelForType(type)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Today's Log */}
      <div className="px-4 mt-8">
        <h2 className="text-[#94a3b8] font-medium text-sm mb-4">GÜNLÜK GEÇMİŞ</h2>
        {todayEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-[#94a3b8]">
            <Droplet size={48} className="opacity-20 mb-3" />
            <p className="text-sm">Henüz bir şey eklemedi</p>
          </div>
        ) : (
          <div className="space-y-3">
            {[...todayEntries].reverse().map((entry) => (
              <motion.div key={entry.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <LogEntryItem 
                  entry={entry} 
                  getIconForType={getIconForType} 
                  getLabelForType={getLabelForType} 
                  onDelete={onDeleteEntry} 
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
