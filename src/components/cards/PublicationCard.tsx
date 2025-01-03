import React from 'react';
import { FileText, ExternalLink } from 'lucide-react';

interface PublicationCardProps {
  title: string;
  journal: string;
  year: number;
  citations: number;
  link: string;
  description?: string;
}

export function PublicationCard({ title, journal, year, citations, link, description }: PublicationCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="text-xl font-semibold mb-2">{title}</h4>
          <p className="text-gray-600 dark:text-gray-400 mb-2">{journal} • {year}</p>
          {description && <p className="text-gray-600 dark:text-gray-400 mb-2">{description}</p>}
          <p className="text-sm text-gray-500 dark:text-gray-400">{citations === 0 ? "In Progress" : `Citations: ${citations}`}</p>
        </div>
        <a
          href={link}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          aria-label="View publication"
        >
          <ExternalLink className="h-5 w-5" />
        </a>
      </div>
    </div>
  );
}
