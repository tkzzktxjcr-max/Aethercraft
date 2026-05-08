import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export const GlassCard = ({ children, className, onClick }: GlassCardProps) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl shadow-sm',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
};