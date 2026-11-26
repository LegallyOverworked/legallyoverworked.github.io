import { useMemo } from 'react';
import type { LucideIcon } from 'lucide-react';

const colorClasses = [
  'text-brand-800/15 dark:text-brand-400/15',
  'text-brand-600/15 dark:text-brand-300/15',
  'text-accent-600/15 dark:text-accent-300/15',
  'text-accent-800/15 dark:text-accent-400/15',
];

interface BackgroundEffectsProps {
  icons: LucideIcon[];
}

const BackgroundEffects = ({ icons }: BackgroundEffectsProps) => {
  const selectedIcons = useMemo(() => {
    if (icons.length === 0) return [];
    return Array.from({ length: 50 }, (_, i) => {
      const Icon = icons[i % icons.length];
      const style = {
        left: `${Math.random() * 100}vw`,
        top: `${Math.random() * 100}vh`,
        width: `${Math.random() * 2 + 1}rem`,
        height: `${Math.random() * 2 + 1}rem`,
        animationDuration: `${Math.random() * 15 + 10}s`,
        animationDelay: `${Math.random() * 5}s`,
      };
      const colorClass = colorClasses[Math.floor(Math.random() * colorClasses.length)];
      return <Icon key={i} className={`bouncing-icon ${colorClass}`} style={style} />;
    });
  }, [icons]);

  return <div className="background-effects">{selectedIcons}</div>;
};

export default BackgroundEffects;
