export function CalendarIllustration() {
  return (
    <svg
      viewBox="0 0 140 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto max-w-[140px] mx-auto"
    >
      {/* Background circles */}
      <circle cx="70" cy="60" r="45" className="fill-vt-blue" opacity="0.08" />
      <circle cx="85" cy="50" r="32" className="fill-vt-blue" opacity="0.1" />
      
      {/* Calendar container */}
      <rect
        x="35"
        y="25"
        width="70"
        height="75"
        rx="7"
        className="fill-white dark:fill-slate-800 stroke-vt-blue"
        strokeWidth="2"
      />
      
      {/* Calendar header */}
      <rect
        x="35"
        y="25"
        width="70"
        height="18"
        rx="7"
        className="fill-vt-blue"
        opacity="0.75"
      />
      
      {/* Binding rings */}
      <circle cx="48" cy="25" r="3.5" className="fill-vt-blue" />
      <circle cx="70" cy="25" r="3.5" className="fill-vt-blue" />
      <circle cx="92" cy="25" r="3.5" className="fill-vt-blue" />
      
      {/* Calendar grid dots */}
      {[0, 1, 2].map((row) =>
        [0, 1, 2, 3].map((col) => (
          <circle
            key={`${row}-${col}`}
            cx={48 + col * 13}
            cy={55 + row * 13}
            r="2.5"
            className="fill-vt-blue"
            opacity="0.25"
          />
        ))
      )}
      
      {/* Highlighted day */}
      <circle cx="74" cy="68" r="5.5" className="fill-vt-blue" opacity="0.85" />
    </svg>
  )
}
