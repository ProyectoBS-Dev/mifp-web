export function PacsIllustration() {
  return (
    <svg
      viewBox="0 0 200 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto max-w-[180px] mx-auto"
    >
      <style>{`
        .checkmark-line {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
        }
        .group:hover .checkmark-line {
          animation: draw-checkmark 0.6s ease-out forwards;
        }
        @keyframes draw-checkmark {
          to { stroke-dashoffset: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .checkmark-line {
            stroke-dashoffset: 0;
            animation: none;
          }
        }
      `}</style>
      
      {/* Background circles */}
      <circle cx="100" cy="70" r="50" className="fill-vt-green" opacity="0.1" />
      <circle cx="120" cy="60" r="35" className="fill-vt-green" opacity="0.12" />
      
      {/* Document stack */}
      <rect
        x="55"
        y="45"
        width="90"
        height="65"
        rx="8"
        className="fill-vt-green"
        opacity="0.15"
      />
      <rect
        x="52"
        y="42"
        width="90"
        height="65"
        rx="8"
        className="fill-vt-green"
        opacity="0.25"
      />
      <rect
        x="50"
        y="40"
        width="90"
        height="65"
        rx="8"
        className="fill-white dark:fill-slate-800 stroke-vt-green"
        strokeWidth="2"
      />
      
      {/* Document lines */}
      <line x1="65" y1="55" x2="120" y2="55" className="stroke-vt-green" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
      <line x1="65" y1="67" x2="105" y2="67" className="stroke-vt-green" strokeWidth="2.5" strokeLinecap="round" opacity="0.35" />
      <line x1="65" y1="79" x2="115" y2="79" className="stroke-vt-green" strokeWidth="2.5" strokeLinecap="round" opacity="0.35" />
      
      {/* Checkmark circle */}
      <circle cx="115" cy="87" r="15" className="fill-vt-green" opacity="0.9" />
      <polyline
        points="108,87 113,92 122,82"
        className="stroke-white checkmark-line"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}
