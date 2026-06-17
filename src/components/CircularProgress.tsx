import React from 'react';

interface CircularProgressProps {
  percent: number;
  size?: number;
  strokeWidth?: number;
}

export function CircularProgress({ percent, size = 44, strokeWidth = 4 }: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const safePercent = Math.min(Math.max(percent, 0), 100);
  const offset = circumference - (safePercent / 100) * circumference;

  let strokeColor = "#3b82f6"; // Blue
  if (percent < 50) {
    strokeColor = "#ef4444"; // Red
  } else if (percent < 85) {
    strokeColor = "#f97316"; // Orange
  }

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#1a2235"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-in-out"
        />
      </svg>
      <div className="absolute flex items-center justify-center text-[10px] font-bold text-[#f8fafc]">
        {Math.round(percent)}%
      </div>
    </div>
  );
}
