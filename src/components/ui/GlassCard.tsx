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
        "rounded-2xl bg-white/70 backdrop-blur-md border border-white/50 shadow-lg",
        onClick && "cursor-pointer hover:bg-white/90 transition-colors",
        className
      )}
    >
      {children}
    </div>
  );
};