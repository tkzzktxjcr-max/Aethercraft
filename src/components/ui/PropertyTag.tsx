import { cn } from '@/lib/utils';

interface PropertyTagProps {
  label: string;
  type: string;
}

const typeColors: Record<string, string> = {
  energy: 'bg-orange-100 text-orange-700 border-orange-200',
  liquid: 'bg-sky-100 text-sky-700 border-sky-200',
  life: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  cosmic: 'bg-violet-100 text-violet-700 border-violet-200',
  matter: 'bg-amber-100 text-amber-700 border-amber-200',
  gas: 'bg-cyan-100 text-cyan-700 border-cyan-200',
};

export const PropertyTag = ({ label, type }: PropertyTagProps) => {
  return (
    <span
      className={cn(
        'px-2 py-0.5 rounded-md text-[10px] font-semibold border capitalize',
        typeColors[type] || 'bg-gray-100 text-gray-700 border-gray-200'
      )}
    >
      {label}
    </span>
  );
};