import React, { useId } from 'react';

/**
 * Custom-designed vector logo icon for JAGAH.
 * Vector-based J + Orbit Ring + Star + Calendar icon that scales losslessly.
 * Adapts to dark and light mode dynamically using Tailwind colors.
 */
export function LogoIcon({ className = "w-5 h-5" }) {
  const gradId = useId();

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
      </defs>

      {/* Orbit Ring - Purple-to-Indigo Gradient tilted loop */}
      <path
        d="M 15,65 C 5,50 15,35 38,28 C 68,20 88,32 80,48 C 74,60 52,66 32,62"
        stroke={`url(#${gradId})`}
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />

      {/* Stylized Serif J with a nice gradient fill */}
      <path
        d="M 28,30 L 60,30 C 60,34 57,36 55,36 L 49,36 L 49,60 C 49,70 41,76 30,76 C 20,76 16,68 16,62 C 16,56 21,54 23,54 C 26,54 28,56 28,59 C 28,64 22,64 22,67 C 22,71 29,72 34,70 C 38,68 40,63 40,57 L 40,36 L 28,36 Z"
        fill={`url(#${gradId})`}
      />

      {/* Sparkle Star on the top-left of the J's horizontal bar */}
      <path
        d="M 22,14 L 24,19 L 29,21 L 24,23 L 22,28 L 20,23 L 15,21 L 20,19 Z"
        fill={`url(#${gradId})`}
      />
      
      {/* Calendar Grid Box overlapping the J loop */}
      <g transform="translate(48, 48)">
        {/* Outer calendar box with theme-aware borders and fills */}
        <rect
          x="0"
          y="0"
          width="28"
          height="28"
          rx="5"
          className="fill-white dark:fill-gray-900 stroke-indigo-600 dark:stroke-indigo-400"
          strokeWidth="2"
        />
        
        {/* Calendar Header Bar */}
        <path
          d="M 0,0 L 28,0 L 28,7 L 0,7 Z"
          className="fill-indigo-600 dark:fill-indigo-400"
        />
        
        {/* Date dots grid */}
        <circle cx="6" cy="13" r="1.5" className="fill-indigo-600 dark:fill-indigo-400" />
        <circle cx="14" cy="13" r="1.5" className="fill-indigo-600 dark:fill-indigo-400" />
        <circle cx="22" cy="13" r="1.5" className="fill-indigo-600 dark:fill-indigo-400" />
        <circle cx="6" cy="20" r="1.5" className="fill-indigo-600 dark:fill-indigo-400" />
        <circle cx="14" cy="20" r="1.5" className="fill-indigo-600 dark:fill-indigo-400" />
        
        {/* Green checklist badge at the bottom-right corner */}
        <circle cx="22" cy="22" r="5" fill="#10b981" />
        <path
          d="M 20,22 L 21.5,23.5 L 24,20.5"
          stroke="white"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>
    </svg>
  );
}

/**
 * Full brand presentation combining the vector logo icon
 * and the premium serif/slab-serif brand text "JAGAH" (Image 1 style)
 * styled to fit in headers dynamically (Image 2 Runway style).
 */
export function LogoBrand({ 
  iconSize = "w-8 h-8", 
  boxSize = "w-9 h-9", 
  textSize = "text-lg sm:text-xl", 
  subtextSize = "text-[8px] sm:text-[9px]",
  isDarkTheme,
  className = ""
}) {
  // Respect forced isDarkTheme if provided, otherwise default to adaptive colors
  const textColorClass = isDarkTheme === true 
    ? 'text-white' 
    : isDarkTheme === false 
      ? 'text-gray-900' 
      : 'text-gray-900 dark:text-white';
      
  const subtextColorClass = isDarkTheme === true 
    ? 'text-indigo-400' 
    : isDarkTheme === false 
      ? 'text-indigo-600' 
      : 'text-indigo-600 dark:text-indigo-400';

  const iconColorClass = isDarkTheme === true 
    ? 'text-white' 
    : isDarkTheme === false 
      ? 'text-indigo-600' 
      : 'text-indigo-600 dark:text-white';

  return (
    <div className={`flex items-center gap-2 sm:gap-2.5 ${className}`}>
      {/* Vector Icon Wrapper */}
      <div className={`${boxSize} flex items-center justify-center shrink-0`}>
        <LogoIcon className={`${iconSize} ${iconColorClass}`} />
      </div>
      
      {/* Brand Text Stack (High-contrast Serif Display typeface matching Image 1) */}
      <div className="flex flex-col text-left justify-center">
        <span 
          className={`font-bold tracking-widest uppercase leading-none font-serif ${textSize} ${textColorClass}`}
          style={{ fontFamily: "'Cinzel', Georgia, serif" }}
        >
          JAGAH
        </span>
        <span className={`font-semibold tracking-[0.18em] uppercase leading-none mt-1.5 ${subtextColorClass} ${subtextSize}`}>
          — AI Event Planner —
        </span>
      </div>
    </div>
  );
}
