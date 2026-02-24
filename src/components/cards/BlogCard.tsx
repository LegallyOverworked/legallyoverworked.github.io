import React from 'react';
import { Calendar, Clock, Tag } from 'lucide-react';

interface BlogCardProps {
  title: string;
  date: string;
  readTime: string;
  tags: string[];
  image: string;
  slug: string;
}

export function BlogCard({ title, date, readTime, tags, image, slug }: BlogCardProps) {
  return (
    <article className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden opacity-60 pointer-events-none cursor-default select-none">
      <div className="md:flex">
        <div className="md:w-1/3">
          <img
            src={image}
            alt={title}
            className="h-48 w-full object-cover md:h-full grayscale"
          />
        </div>
        <div className="p-6 md:w-2/3">
          <h3 className="text-xl font-semibold mb-2">
            {title}
          </h3>
          
          <div className="flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400 gap-4">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {new Date(date).toLocaleDateString()}
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {readTime}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-700"
              >
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}