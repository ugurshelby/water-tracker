import React from 'react';

interface WaterBottleProps {
  percent: number;
  currentAmount: number;
  goalAmount: number;
  isOverLimit: boolean;
}

export function WaterBottle({ percent, currentAmount, goalAmount, isOverLimit }: WaterBottleProps) {
  const displayPercent = Math.round(percent > 100 ? (isOverLimit ? percent : 100) : percent);
  // Ensure visual fill doesn't exceed 100%, except slightly when over limit maybe.
  // Actually, let's max it at 100% for the visual fill, or maybe 110% to show full.
  const visualPercent = Math.min(percent, 105);

  const fillGradient = isOverLimit
    ? "linear-gradient(180deg, #f87171 0%, #dc2626 100%)"
    : "linear-gradient(180deg, #60a5fa 0%, #2563eb 100%)";

  return (
    <div className="relative w-full max-w-[220px] mx-auto flex flex-col items-center">
      <div className="relative w-[180px] h-[260px] flex justify-center items-end" style={{ filter: "drop-shadow(0 0 20px rgba(59,130,246,0.15))" }}>
        {/* Bottle Shape */}
        <div className="absolute inset-0 bg-[#111827] rounded-[40px] rounded-t-[60px] border-4 border-[#1a2235] overflow-hidden flex flex-col">
          {/* Bottle neck line details */}
          <div className="w-full h-8 border-b-2 border-[#1a2235]/50 shrink-0"></div>
          
          <div className="relative flex-1 w-full flex items-end justify-center rounded-b-[36px] overflow-hidden isolate">
            <div 
              className="absolute bottom-0 left-0 right-0 w-full transition-all duration-[600ms] cubic-bezier(0.34, 1.56, 0.64, 1) flex justify-center"
              style={{
                height: `${visualPercent}%`,
                background: fillGradient
              }}
            >
              {/* Waves */}
              {visualPercent > 0 && visualPercent < 100 && (
                <>
                  {/* We use an SVG wave for better styling or just two overlapping divs. A simple SVG is cleaner */}
                  <div className="absolute top-[-10px] w-[200%] h-[20px] left-0 animate-wave opacity-50"
                       style={{ background: 'radial-gradient(ellipse at center, transparent 50%, rgba(255,255,255,0.2) 100%)', clipPath: 'polygon(0% 50%, 10% 45%, 20% 50%, 30% 60%, 40% 50%, 50% 45%, 60% 50%, 70% 60%, 80% 50%, 90% 45%, 100% 50%, 100% 100%, 0% 100%)', backgroundColor: isOverLimit ? '#f87171' : '#60a5fa' }} />
                  <div className="absolute top-[-8px] w-[200%] h-[16px] left-0 animate-wave-slow opacity-80"
                       style={{ clipPath: 'polygon(0% 60%, 10% 50%, 20% 45%, 30% 50%, 40% 60%, 50% 50%, 60% 45%, 70% 50%, 80% 60%, 90% 50%, 100% 45%, 100% 100%, 0% 100%)', backgroundColor: isOverLimit ? '#dc2626' : '#2563eb' }} />
                </>
              )}
            </div>

            {/* Inner text overlaid on bottle */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-white drop-shadow-md">
              <span className="text-4xl font-bold tracking-tight">{displayPercent}%</span>
              {(isOverLimit && percent > 100) && (
                <span className="text-xs font-semibold mt-1 px-2 py-0.5 bg-white/20 rounded-full backdrop-blur-sm">
                  🎉 Hedef aşıldı!
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 text-[#94a3b8] font-medium tracking-wide">
        {currentAmount.toLocaleString('tr-TR')} ml / {goalAmount.toLocaleString('tr-TR')} ml
      </div>
    </div>
  );
}
