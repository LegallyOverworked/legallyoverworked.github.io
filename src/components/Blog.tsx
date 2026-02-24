import React from 'react';
import { Calendar, Clock, Tag } from 'lucide-react';
import { BlogCard } from './cards/BlogCard';

export default function Blog() {
  const posts = [
    {
      title: "Advances in Large Language Models",
      date: "2024-03-15",
      readTime: "8 min read",
      tags: ["LLM", "NLP", "Machine Learning"],
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=800",
      slug: "advances-in-llm"
    },
    {
      title: "Efficient LLM Fine-Tuning Techniques",
      date: "2024-03-10",
      readTime: "6 min read",
      tags: ["Computer Vision", "PyTorch", "Deep Learning"],
      image: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&q=80&w=800",
      slug: "deep-learning-computer-vision"
    },
    {
      title: "A guide to Machine Learning normalization",
      date: "2024-03-05",
      readTime: "10 min read",
      tags: ["R", "Machine Learning", "Data Science"],
      image: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&q=80&w=800",
      slug: "machine-learning-r"
    },
    {
      title: "The Psychology of Likability",
      date: "2024-03-01",
      readTime: "5 min read",
      tags: ["Psychology", "Behavioral Science"],
      image: "https://images.unsplash.com/photo-1587560699334-cc4ff634909a?auto=format&fit=crop&q=80&w=800",
      slug: "psychology-of-likyability"
    }
  ];

  return (
    <div className="min-h-screen p-4 pt-24">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Blogs & Writings
        </h2>

        <div className="space-y-8">
          {posts.map((post) => (
            <BlogCard key={post.slug} {...post} />
          ))}
        </div>
      </div>
    </div>
  );
}
