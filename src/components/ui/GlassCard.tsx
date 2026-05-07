import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

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
        'bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm rounded-2xl',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
};