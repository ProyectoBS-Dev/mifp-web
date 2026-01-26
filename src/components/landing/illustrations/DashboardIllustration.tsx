export function DashboardIllustration() {
  return (
    <svg
      viewBox="0 0 180 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto max-w-[180px] mx-auto"
    >
      <style>{`
        .progress-arc {
          transform-origin: 120px 89px;
        }
        .group:hover .progress-arc {
          animation: rotate-arc 2s linear infinite;
        }
        @keyframes rotate-arc {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .progress-arc {
            animation: none !important;
          }
        }
      `}</style>
      {/* Background gradient circles */}
      <circle cx="90" cy="60" r="48" className="fill-vt-blue" opacity="0.06" />
      <circle cx="105" cy="55" r="36" className="fill-vt-green" opacity="0.06" />
      
      {/* Dashboard grid - 2x2 widgets */}
      <g>
        {/* Widget 1 - Top Left */}
        <rect
          x="40"
          y="20"
          width="55"
          height="42"
          rx="6"
          className="fill-white dark:fill-slate-800 stroke-vt-green"
          strokeWidth="1.5"
          opacity="0.9"
        />
        <circle cx="49" cy="29" r="3" className="fill-vt-green" opacity="0.5" />
        <line x1="55" y1="29" x2="82" y2="29" className="stroke-vt-green" strokeWidth="1.5" strokeLinecap="round" opacity="0.35" />
        <line x1="49" y1="40" x2="75" y2="40" className="stroke-vt-green" strokeWidth="1.5" strokeLinecap="round" opacity="0.25" />
        <line x1="49" y1="48" x2="82" y2="48" className="stroke-vt-green" strokeWidth="1.5" strokeLinecap="round" opacity="0.25" />
        
        {/* Widget 2 - Top Right */}
        <rect
          x="100"
          y="20"
          width="55"
          height="42"
          rx="6"
          className="fill-white dark:fill-slate-800 stroke-vt-blue"
          strokeWidth="1.5"
          opacity="0.9"
        />
        {/* Mini chart */}
        <rect x="109" y="47" width="8" height="11" rx="2.5" className="fill-vt-blue" opacity="0.45" />
        <rect x="120" y="40" width="8" height="18" rx="2.5" className="fill-vt-blue" opacity="0.65" />
        <rect x="131" y="36" width="8" height="22" rx="2.5" className="fill-vt-blue" opacity="0.85" />
        
        {/* Widget 3 - Bottom Left */}
        <rect
          x="40"
          y="68"
          width="55"
          height="42"
          rx="6"
          className="fill-white dark:fill-slate-800 stroke-vt-yellow-dark"
          strokeWidth="1.5"
          opacity="0.9"
        />
        {/* Calendar mini */}
        <circle cx="53" cy="84" r="2.5" className="fill-vt-yellow-dark" opacity="0.35" />
        <circle cx="64" cy="84" r="2.5" className="fill-vt-yellow-dark" opacity="0.35" />
        <circle cx="75" cy="84" r="2.5" className="fill-vt-yellow-dark" opacity="0.35" />
        <circle cx="53" cy="95" r="2.5" className="fill-vt-yellow-dark" opacity="0.35" />
        <circle cx="64" cy="95" r="4" className="fill-vt-yellow-dark" opacity="0.85" />
        <circle cx="75" cy="95" r="2.5" className="fill-vt-yellow-dark" opacity="0.35" />
        
        {/* Widget 4 - Bottom Right */}
        <rect
          x="100"
          y="68"
          width="55"
          height="42"
          rx="6"
          className="fill-white dark:fill-slate-800 stroke-vt-purple"
          strokeWidth="1.5"
          opacity="0.9"
        />
        {/* Progress circles */}
        <circle cx="120" cy="89" r="11" className="stroke-vt-purple" strokeWidth="2.5" opacity="0.25" fill="none" />
        <circle
          cx="120"
          cy="89"
          r="11"
          className="stroke-vt-purple progress-arc"
          strokeWidth="2.5"
          opacity="0.85"
          strokeDasharray="48 22"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="140" cy="89" r="5.5" className="fill-vt-purple" opacity="0.65" />
      </g>
    </svg>
  )
}
