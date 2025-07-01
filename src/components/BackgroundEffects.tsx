import { useMemo } from 'react';
import { Dna, FlaskConical, BrainCircuit, Atom, TestTube, DnaIcon, Bot, Cpu, Brain, FlaskRound, Microscope, Code, Biohazard } from 'lucide-react';

const colors = [
    'rgba(75, 0, 130, 0.15)', 
    'rgba(138, 43, 226, 0.15)',
    'rgba(106, 90, 205, 0.15)', 
    'rgba(65, 105, 225, 0.15)', 
  ];

const icons = {
  DNA: [Dna, DnaIcon, Atom, TestTube, Microscope],
      Proteins: [Biohazard, Atom, TestTube, FlaskConical, Microscope],
  Enzymes: [FlaskConical, FlaskRound, TestTube, Atom, Microscope],
  AI: [BrainCircuit, Bot, Cpu, Brain, Code],
};

type IconCategory = 'DNA' | 'Proteins' | 'Enzymes' | 'AI';

interface BackgroundEffectsProps {
  activeTab: IconCategory;
}

const BackgroundEffects = ({ activeTab }: BackgroundEffectsProps) => {
  const selectedIcons = useMemo(() => {
    const iconSet = icons[activeTab] || [];
        return Array.from({ length: 50 }, (_, i) => {
      const Icon = iconSet[i % iconSet.length];
      const style = {
        left: `${Math.random() * 100}vw`,
        top: `${Math.random() * 100}vh`,
        width: `${Math.random() * 2 + 1}rem`,
        height: `${Math.random() * 2 + 1}rem`,
        animationDuration: `${Math.random() * 15 + 10}s`,
        animationDelay: `${Math.random() * 5}s`,
        color: colors[Math.floor(Math.random() * colors.length)],
      };
      return <Icon key={i} className="bouncing-icon" style={style} />;
    });
  }, [activeTab]);

  return <div className="background-effects">{selectedIcons}</div>;
};

export default BackgroundEffects;
