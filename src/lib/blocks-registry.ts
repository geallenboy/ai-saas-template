import { HelpCircle, Layout, Users, Zap } from 'lucide-react'

import type { CategoryInfo, ComponentInfo } from '@/types/blocks'

// Component classification definition
export const categories: CategoryInfo[] = [
  {
    id: 'hero',
    name: 'Hero Sections',
    description: 'Main display area components for the homepage',
    icon: Layout,
    count: 1,
  },
  {
    id: 'features',
    name: 'Feature Sections',
    description: 'Product feature display component',
    icon: Zap,
    count: 1,
  },
  {
    id: 'tech-stack',
    name: 'Tech Stack',
    description: 'Technology stack display component',
    icon: Zap,
    count: 1,
  },

  {
    id: 'faq',
    name: 'FAQ Sections',
    description: 'Frequently Asked Questions component',
    icon: HelpCircle,
    count: 1,
  },
  {
    id: 'footer',
    name: 'Footer Sections',
    description: 'Footer component',
    icon: Users,
    count: 1,
  },
]

// Component registry (without actual component references)
export const components: Omit<ComponentInfo, 'component'>[] = [
  {
    id: 'modern-hero',
    name: 'Modern Hero',
    description:
      'Modern hero section with title, description, button, and user reviews',
    category: 'hero',
    code: `import { Star } from 'lucide-react';
import React from 'react';

import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface Hero7Props {
  heading?: string;
  description?: string;
  button?: {
    text: string;
    url: string;
  };
  reviews?: {
    count: number;
    avatars: {
      src: string;
      alt: string;
    }[];
  };
}

const Hero7 = ({
  heading = 'The Ultimate Scalable Next.js SaaS Boilerplate',
  description = 'Start your SaaS journey...',
  button = {
    text: 'Get Started',
    url: '/docs',
  },
  reviews = {
    count: 200,
    avatars: [
      // ... avatars data
    ],
  },
}: Hero7Props) => {
  return (
    <section className="pt-24">
      <div className="container text-center">
        <div className="mx-auto flex max-w-screen-lg flex-col gap-6">
          <h1 className="font-extrabold text-3xl lg:text-6xl">{heading}</h1>
          <p className="text-balance text-muted-foreground lg:text-lg">{description}</p>
        </div>
        <Button asChild size="lg" className="mt-10">
          <a href={button.url}>{button.text}</a>
        </Button>
        {/* ... rest of component */}
      </div>
    </section>
  );
};

export { Hero7 };`,
  },
  {
    id: 'features',
    name: 'Feature Sections',
    description: 'Product feature display component',
    category: 'features',
    code: '// Feature component code here',
  },
  {
    id: 'tech-stack',
    name: 'Tech Stack',
    description:
      'Technology stack display component, showing the technology used in the project',
    category: 'tech-stack',
    code: '// Tech Stack component code here',
  },

  {
    id: 'faq3',
    name: 'FAQ Accordion',
    description: 'Accordion FAQ widget',
    category: 'faq',
    code: '// FAQ component code here',
  },
  {
    id: 'footer-7',
    name: 'Footer with Links',
    description: 'Footer component with links',
    category: 'footer',
    code: '// Footer component code here',
  },
]

// Helper functions
export function getComponentsByCategory(
  categoryId: string
): Omit<ComponentInfo, 'component'>[] {
  return components.filter(component => component.category === categoryId)
}

export function getComponentById(
  id: string
): Omit<ComponentInfo, 'component'> | undefined {
  return components.find(component => component.id === id)
}

export function getCategoryById(id: string): CategoryInfo | undefined {
  return categories.find(category => category.id === id)
}
