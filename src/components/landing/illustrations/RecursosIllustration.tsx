export function RecursosIllustration() {
  return (
    <svg
      viewBox="0 0 200 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto max-w-[160px] mx-auto"
    >
      {/* Background circles */}
      <circle cx="100" cy="60" r="45" className="fill-vt-purple" opacity="0.08" />
      <circle cx="115" cy="55" r="35" className="fill-vt-purple" opacity="0.1" />
      
      {/* Resource cards stack */}
      <g>
        {/* Card 3 (back) */}
        <rect
          x="58"
          y="46"
          width="84"
          height="48"
          rx="7"
          className="fill-vt-purple"
          opacity="0.15"
        />
        
        {/* Card 2 (middle) */}
        <rect
          x="60"
          y="44"
          width="84"
          height="48"
          rx="7"
          className="fill-vt-purple"
          opacity="0.25"
        />
        
        {/* Card 1 (front) */}
        <rect
          x="62"
          y="42"
          width="84"
          height="48"
          rx="7"
          className="fill-white dark:fill-slate-800 stroke-vt-purple"
          strokeWidth="2"
        />
        
        {/* Icon representation (book) */}
        <rect
          x="72"
          y="52"
          width="22"
          height="28"
          rx="3"
          className="fill-vt-purple"
          opacity="0.25"
        />
        <line x1="83" y1="52" x2="83" y2="80" className="stroke-vt-purple" strokeWidth="1.2" opacity="0.4" />
        
        {/* Text lines */}
        <line x1="100" y1="56" x2="132" y2="56" className="stroke-vt-purple" strokeWidth="2" strokeLinecap="round" opacity="0.35" />
        <line x1="100" y1="64" x2="125" y2="64" className="stroke-vt-purple" strokeWidth="2" strokeLinecap="round" opacity="0.25" />
        <line x1="100" y1="72" x2="130" y2="72" className="stroke-vt-purple" strokeWidth="2" strokeLinecap="round" opacity="0.25" />
      </g>
    </svg>
  )
}
