import React from 'react';
import Link from 'next/link';
import { Sprout, Cloud } from 'lucide-react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  href?: string;
}

export function Logo({ className = '', size = 'md', showTagline = false, href = '/' }: LogoProps) {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const content = (
    <div className={`flex items-center gap-2.5 group cursor-pointer ${className}`}>
      {/* Brand Icon with Leaf + Cloud Concept */}
      <div className="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 p-2 shadow-md shadow-emerald-900/20 group-hover:shadow-emerald-700/30 transition-all duration-300">
        <Cloud className={`${iconSizes[size]} text-emerald-100 opacity-90`} />
        <Sprout className="w-4 h-4 text-lime-300 absolute -bottom-0.5 -right-0.5 drop-shadow stroke-[2.5]" />
      </div>

      <div className="flex flex-col leading-none">
        <div className="flex items-center">
          <span className={`font-bold tracking-tight text-emerald-950 dark:text-emerald-100 ${textSizes[size]}`}>
            AgroCloud
          </span>
          <span className={`font-black text-emerald-600 dark:text-emerald-400 ml-1 ${textSizes[size]}`}>
            AI
          </span>
        </div>
        {showTagline && (
          <span className="text-[10px] uppercase font-semibold tracking-wider text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">
            Smart Farming Ecosystem
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}

