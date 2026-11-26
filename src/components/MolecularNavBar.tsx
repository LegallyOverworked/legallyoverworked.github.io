import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { FOCUS_AREAS } from './focusAreas';

const ROTATE_INTERVAL = 30000;

interface MolecularNavBarProps {
  active: number;
  onActiveChange: (index: number) => void;
}

export function MolecularNavBar({ active, onActiveChange }: MolecularNavBarProps) {
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [pillStyle, setPillStyle] = useState({});
  const [clicks, setClicks] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => onActiveChange((active + 1) % FOCUS_AREAS.length), ROTATE_INTERVAL);
    return () => clearTimeout(timer);
  }, [active, clicks, onActiveChange]);

  useLayoutEffect(() => {
    const updatePill = () => {
      const activeItem = itemRefs.current[active];
      if (activeItem) {
        setPillStyle({ width: activeItem.offsetWidth, left: activeItem.offsetLeft });
      }
    };
    updatePill();
    window.addEventListener('resize', updatePill);
    return () => window.removeEventListener('resize', updatePill);
  }, [active]);

  const handleItemClick = (index: number) => {
    setClicks((count) => count + 1);
    onActiveChange(index);
  };

  return (
    <div className="relative w-fit max-w-full mx-auto my-4 rounded-full p-1.5 backdrop-blur-xl bg-gray-500/20 dark:bg-black/40 border border-white/10 shadow-lg shadow-brand-900/10 dark:shadow-brand-400/10">
      <div className="relative flex items-center gap-0.5 md:gap-1">
        <div
          className="absolute top-0 left-0 h-full rounded-full bg-white/30 dark:bg-white/10 ring-1 ring-brand-600/20 dark:ring-brand-300/20 shadow-md transition-all duration-700 ease-in-out"
          style={pillStyle}
        />

        {FOCUS_AREAS.map((item, i) => {
          const isActive = i === active;
          return (
            <div
              key={item.label}
              ref={el => { itemRefs.current[i] = el; }}
              className="relative z-10 flex items-center justify-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1.5 rounded-full cursor-pointer"
              onClick={() => handleItemClick(i)}
              role="button"
              aria-pressed={isActive}
              aria-label={item.label}
              title={item.label}
            >
              <item.icon className={`w-4 h-4 shrink-0 transition-colors duration-300 ${isActive ? 'text-brand-700 dark:text-brand-400' : 'text-gray-700 dark:text-white/70'}`} />
              <span className={`whitespace-nowrap text-xs md:text-sm font-semibold transition-colors duration-300 ${isActive ? 'inline bg-gradient-to-r from-brand-800 to-accent-600 dark:from-brand-400 dark:to-accent-300 bg-clip-text text-transparent' : 'hidden md:inline text-gray-700 dark:text-white/70'}`}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
