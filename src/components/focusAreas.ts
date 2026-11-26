import type { LucideIcon } from 'lucide-react';
import type { BackgroundKind } from './backgrounds';
import {
  Atom,
  BarChart3,
  Binary,
  Biohazard,
  Bot,
  Brain,
  BrainCircuit,
  Code2,
  Component,
  Cpu,
  Database,
  Dna,
  FlaskConical,
  FlaskRound,
  LineChart,
  Microscope,
  PieChart,
  ScatterChart,
  Server,
  Sigma,
  Sparkles,
  Terminal,
  TestTube,
} from 'lucide-react';

export interface FocusArea {
  label: string;
  icon: LucideIcon;
  background: BackgroundKind;
  backgroundIcons: LucideIcon[];
}

export const FOCUS_AREAS: FocusArea[] = [
  {
    label: 'Proteins & Enzymes',
    icon: FlaskConical,
    background: 'protein',
    backgroundIcons: [FlaskConical, Component, FlaskRound, Biohazard, Atom, TestTube, Microscope],
  },
  { label: 'AI', icon: BrainCircuit, background: 'neural', backgroundIcons: [BrainCircuit, Bot, Cpu, Brain, Sparkles] },
  {
    label: 'Data Science',
    icon: ScatterChart,
    background: 'data',
    backgroundIcons: [ScatterChart, BarChart3, LineChart, PieChart, Sigma],
  },
  {
    label: 'Engineering',
    icon: Code2,
    background: 'system',
    backgroundIcons: [Code2, Server, Database, Terminal, Cpu],
  },
  {
    label: 'Bioinformatics',
    icon: Dna,
    background: 'helix',
    backgroundIcons: [Dna, Binary, Database, Microscope, TestTube],
  },
];
