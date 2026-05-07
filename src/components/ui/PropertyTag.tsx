import { cn } from '@/lib/utils';

interface PropertyTagProps {
  label: string;
  type?: string;
}

const typeColors: Record<string, string> = {
  energy: 'bg-amber-100 text-amber-800 border-amber-200',
  liquid: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  life: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  cosmic: 'bg-violet-100 text-violet-800 border-violet-200',
  matter: 'bg-orange-100 text-orange-800 border-orange-200',
  gas: 'bg-sky-100 text-sky-800 border-sky-200',
};

export const PropertyTag = ({ label, type = 'matter' }: PropertyTagProps) => {
  return (
    <span className={cn(
      "px-2 py-0.5 rounded-full text-[10px] font-medium border capitalize",
      typeColors[type] || typeColors.matter
    )}>
      {label}
    </span>
  );
};