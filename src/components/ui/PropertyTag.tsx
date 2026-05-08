import { cn } from '@/lib/utils';

interface PropertyTagProps {
  label: string;
  type?: string;
}

const typeColors: Record<string, string> = {
  energy: 'bg-amber-50 text-amber-700 border-amber-200',
  liquid: 'bg-blue-50 text-blue-700 border-blue-200',
  life: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cosmic: 'bg-violet-50 text-violet-700 border-violet-200',
  matter: 'bg-stone-50 text-stone-700 border-stone-200',
  gas: 'bg-cyan-50 text-cyan-700 border-cyan-200',
};

export const PropertyTag = ({ label, type }: PropertyTagProps) => {
  return (
    <span
      className={cn(
        'px-2 py-0.5 rounded-full text-[10px] font-medium border',
        type ? typeColors[type] || 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
      )}
    >
      {label}
    </span>
  );
};