import React from 'react';

interface MagicFantasyIconProps {
  className?: string;
  size?: number;
}

const MagicFantasyIcon: React.FC<MagicFantasyIconProps> = ({ className = '', size = 32 }) => {
  return (
    <div 
      className={`relative inline-flex items-center justify-center animate-float-magic ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
      >
        <defs>
          {/* Main glowing gradients */}
          <radialGradient id="crystal-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f472b6" stopOpacity="0.9" /> {/* Pink */}
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.7" /> {/* Violet */}
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" /> {/* Blue */}
          </radialGradient>
          
          <linearGradient id="crystal-gradient" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#fbcfe8" /> {/* Light pink */}
            <stop offset="30%" stopColor="#c084fc" /> {/* Purple */}
            <stop offset="70%" stopColor="#6366f1" /> {/* Indigo */}
            <stop offset="100%" stopColor="#1e1b4b" /> {/* Deep dark blue */}
          </linearGradient>

          <linearGradient id="ring-gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
          </linearGradient>

          <linearGradient id="ring-gradient-2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ec4899" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* 1. Ambient Background Magic Glow */}
        <circle cx="50" cy="50" r="38" fill="url(#crystal-glow)" className="opacity-80" />

        {/* 2. Outer Orbiting Ring 1 (Clockwise) */}
        <g className="animate-magic-spin origin-center">
          {/* Runic orbital path */}
          <circle 
            cx="50" 
            cy="50" 
            r="34" 
            stroke="url(#ring-gradient-1)" 
            strokeWidth="1.5" 
            strokeDasharray="12 6 4 6 20 6" 
            className="opacity-70 group-hover:opacity-100 transition-opacity duration-300"
          />
          {/* Runic nodule nodes */}
          <circle cx="50" cy="16" r="2.5" fill="#a78bfa" filter="drop-shadow(0 0 3px #8b5cf6)" />
          <circle cx="50" cy="84" r="2.5" fill="#a78bfa" filter="drop-shadow(0 0 3px #8b5cf6)" />
          <circle cx="16" cy="50" r="1.5" fill="#34d399" />
          <circle cx="84" cy="50" r="1.5" fill="#34d399" />
        </g>

        {/* 3. Inner Orbiting Ring 2 (Counter-Clockwise) */}
        <g className="animate-magic-spin-reverse origin-center">
          <circle 
            cx="50" 
            cy="50" 
            r="26" 
            stroke="url(#ring-gradient-2)" 
            strokeWidth="1" 
            strokeDasharray="6 8 18 6" 
            className="opacity-60 group-hover:opacity-100 transition-opacity duration-300"
          />
          {/* Runic nodule nodes */}
          <circle cx="50" cy="24" r="1.5" fill="#f472b6" />
          <circle cx="50" cy="76" r="1.5" fill="#f59e0b" />
          <polygon points="50,21 52,24 50,27 48,24" fill="#ec4899" />
          <polygon points="50,73 52,76 50,79 48,76" fill="#f59e0b" />
        </g>

        {/* 4. Sparkles / Twinkling Star Elements */}
        <g className="animate-twinkle-magic origin-center">
          {/* Top-Right Star */}
          <path 
            d="M74,30 L75.5,34 L79,35 L75.5,36 L74,40 L72.5,36 L69,35 L72.5,34 Z" 
            fill="#fef08a" 
            filter="drop-shadow(0 0 2px #f59e0b)"
          />
          {/* Bottom-Left Star */}
          <path 
            d="M26,70 L27,72.5 L30,73 L27,73.5 L26,76 L25,73.5 L22,73 L25,72.5 Z" 
            fill="#fbcfe8" 
            filter="drop-shadow(0 0 2px #ec4899)"
            className="delay-75"
          />
          {/* Top-Left Small Star */}
          <path 
            d="M22,25 L23,27 L26,27.5 L23,28 L22,30 L21,28 L18,27.5 L21,27 Z" 
            fill="#e0f2fe" 
            filter="drop-shadow(0 0 2px #3b82f6)"
            className="delay-150"
          />
        </g>

        {/* 5. Central Magic Crystal Core (Facated Gem) */}
        <g className="animate-pulse-cosmic origin-center">
          {/* Base facet drop-shadow */}
          <polygon 
            points="50,15 68,40 50,85 32,40" 
            fill="url(#crystal-gradient)" 
            className="transition-all duration-300"
          />
          {/* Highlight Left Facet */}
          <polygon 
            points="50,15 50,85 32,40" 
            fill="#ffffff" 
            fillOpacity="0.15" 
          />
          {/* Highlight Right Facet */}
          <polygon 
            points="50,15 68,40 50,85" 
            fill="#ffffff" 
            fillOpacity="0.05" 
          />
          {/* Central Cutline Facet */}
          <polygon 
            points="50,22 62,40 50,75 38,40" 
            fill="#ffffff" 
            fillOpacity="0.1" 
          />
          {/* Center Vertical Ray */}
          <line 
            x1="50" 
            y1="15" 
            x2="50" 
            y2="85" 
            stroke="#ffffff" 
            strokeWidth="0.75" 
            strokeOpacity="0.3" 
          />
          {/* Center Horizontal Glimmer Line */}
          <line 
            x1="32" 
            y1="40" 
            x2="68" 
            y2="40" 
            stroke="#ffffff" 
            strokeWidth="0.5" 
            strokeOpacity="0.25" 
          />
          {/* Crystal heart core glow */}
          <circle cx="50" cy="45" r="4" fill="#ffffff" filter="drop-shadow(0 0 6px #f472b6)" className="opacity-90" />
        </g>
      </svg>
    </div>
  );
};

export default MagicFantasyIcon;
