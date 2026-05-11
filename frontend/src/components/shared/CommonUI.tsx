import React from 'react';
import { cn } from '../../utils/helpers';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: string;
  trend?: string;
  color?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ label, value, icon, trend, color = "sky" }) => (
  <div className={cn(
    "relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 transition-all hover:bg-white/10",
    `hover:border-${color}-500/30`
  )}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-white/50">{label}</p>
        <p className="mt-1 text-2xl font-bold text-white">{value}</p>
        {trend && <p className="mt-1 text-[10px] text-emerald-400">↑ {trend}</p>}
      </div>
      <div className={cn(
        "flex h-12 w-12 items-center justify-center rounded-2xl text-xl shadow-inner",
        `bg-${color}-500/20 text-${color}-300`
      )}>
        {icon}
      </div>
    </div>
  </div>
);

export const GlassCard: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
  <div className={cn("rounded-3xl border border-white/10 bg-[#0b1025]/70 p-6 shadow-2xl shadow-black/30 backdrop-blur-2xl transition duration-300 hover:border-violet-400/30 hover:bg-[#111735]/80", className)}>
    {children}
  </div>
);

export const SectionHeader: React.FC<{ title: string, subtitle?: string, action?: string }> = ({ title, subtitle, action }) => (
  <div className="mb-5 flex items-center justify-between gap-3">
    <div>
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      {subtitle ? <p className="mt-1 text-sm text-slate-400">{subtitle}</p> : null}
    </div>
    {action ? <button className="text-xs font-medium text-violet-300 transition hover:text-cyan-300">{action}</button> : null}
  </div>
);

export const ProgressRing: React.FC<{ value?: number, label?: string }> = ({ value = 72, label = "LMS" }) => {
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const dash = (Math.min(100, Math.max(0, value)) / 100) * circumference;

  return (
    <div className="relative flex h-[130px] w-[130px] items-center justify-center">
      <svg width="130" height="130" viewBox="0 0 120 120" className="rotate-[-90deg]">
        <circle cx="60" cy="60" r={radius} stroke="rgba(255,255,255,.12)" strokeWidth="12" fill="none" />
        <circle cx="60" cy="60" r={radius} stroke="url(#ringGradient)" strokeWidth="12" strokeLinecap="round" fill="none" strokeDasharray={`${dash} ${circumference - dash}`} />
        <defs>
          <linearGradient id="ringGradient" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="55%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-2xl font-semibold text-white">{value}%</p>
      </div>
    </div>
  );
};

export const MiniLineChart: React.FC = () => {
  const linePoints = "0,75 45,58 90,82 135,50 180,38 225,64 270,26 315,42";

  return (
    <svg viewBox="0 0 315 100" className="h-28 w-full overflow-visible">
      <polyline points={linePoints} fill="none" stroke="rgba(34,211,238,.22)" strokeWidth="10" strokeLinecap="round" />
      <polyline points={linePoints} fill="none" stroke="url(#lineGradient)" strokeWidth="4" strokeLinecap="round" />
      <defs>
        <linearGradient id="lineGradient" x1="0" x2="1">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="55%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
      </defs>
    </svg>
  );
};
