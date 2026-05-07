import { cn } from '@/lib/utils';

interface AIBadgeProps {
  size?: 'sm' | 'md';
  className?: string;
}

export const AIBadge = ({ size = 'sm', className }: AIBadgeProps) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full bg-violet-100 text-violet-700 font-bold',
        size === 'sm' ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-1 text-xs',
        className
      )}
    >
      ✨ IA
    </span>
  );
};