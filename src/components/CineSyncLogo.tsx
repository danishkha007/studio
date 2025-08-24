import { Film } from 'lucide-react';
import { cn } from '@/lib/utils';

type CineSyncLogoProps = {
  className?: string;
};

export function CineSyncLogo({ className }: CineSyncLogoProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Film className="h-8 w-8" />
      <span className="font-headline text-3xl font-bold">CineSync</span>
    </div>
  );
}
