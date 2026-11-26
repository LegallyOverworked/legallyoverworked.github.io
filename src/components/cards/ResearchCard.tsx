import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ResearchCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export function ResearchCard({ title, description, icon: Icon }: ResearchCardProps) {
  return (
    <div className="glow-panel glow-panel-hover bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
      <Icon className="h-8 w-8 text-brand-700 dark:text-brand-400 mb-4" />
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}