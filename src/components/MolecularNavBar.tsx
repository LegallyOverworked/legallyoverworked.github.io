import { useState, useEffect, useRef, ComponentType } from "react";
import { Dna, Component, FlaskConical, BrainCircuit } from 'lucide-react';

interface NavItem {
  label: string;
  icon: ComponentType<{ className?: string }>;
}

const ITEMS: NavItem[] = [
  { label: "DNA", icon: Dna },
  { label: "Proteins", icon: Component },
  { label: "Enzymes", icon: FlaskConical },
  { label: "AI", icon: BrainCircuit },
];

const NORMAL_INTERVAL = 5000;
const USER_INTERACTION_INTERVAL = 20000;

interface MolecularNavBarProps {
  active: number;
  onActiveChange: (index: number) => void;
}

export function MolecularNavBar({ active, onActiveChange }: MolecularNavBarProps) {

  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const [pillStyle, setPillStyle] = useState({});

  const startTimer = (duration: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);

        timerRef.current = setTimeout(() => {
      const nextActive = (active + 1) % ITEMS.length;
      onActiveChange(nextActive);
      // After this tick, the next one will be the normal interval
      startTimer(NORMAL_INTERVAL);
    }, duration);

  };

  // Start the timer on mount
  useEffect(() => {
    startTimer(NORMAL_INTERVAL);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Update pill style on active change or resize
  useEffect(() => {
    const updatePill = () => {
      const activeItem = itemRefs.current[active];
      if (activeItem) {
        setPillStyle({
          width: activeItem.offsetWidth,
          left: activeItem.offsetLeft,
        });
      }
    };
    // Delay pill update slightly to allow for render
    setTimeout(updatePill, 50);

    window.addEventListener('resize', updatePill);
    return () => window.removeEventListener('resize', updatePill);
  }, [active]);

    const handleItemClick = (index: number) => {
    onActiveChange(index);
    // When user clicks, set a longer timeout for the next automatic switch
    startTimer(USER_INTERACTION_INTERVAL);
  };

  return (
    <div className="relative w-full max-w-md mx-auto my-4 rounded-full p-1.5 backdrop-blur-xl bg-gray-500/20 dark:bg-black/40 border border-white/10 shadow-lg">
      <div className="relative flex justify-around items-center">
        {/* Moving glass pill */}
        <div
          className="absolute top-0 left-0 h-full rounded-full bg-white/20 dark:bg-white/10 shadow-md transition-all duration-700 ease-in-out"
          style={pillStyle}
        />

        {ITEMS.map((item, i) => (
          <div
            key={item.label}
            ref={el => { itemRefs.current[i] = el; }}
            className={`relative z-10 flex items-center justify-center gap-2 px-3 py-1.5 rounded-full cursor-pointer`}
            onClick={() => handleItemClick(i)}
          >
            <item.icon className={`w-4 h-4 transition-colors duration-300 ${i === active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-white/70'}`} />
            <span className={`text-sm font-semibold transition-colors duration-300 ${i === active ? 'bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-500 bg-clip-text text-transparent' : 'text-gray-700 dark:text-white/70'}`}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
