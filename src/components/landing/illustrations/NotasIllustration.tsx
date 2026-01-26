export function NotasIllustration() {
  return (
    <svg
      viewBox="0 0 140 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto max-w-[140px] mx-auto"
    >
      {/* Background circles */}
      <circle cx="70" cy="60" r="45" className="fill-vt-yellow-dark" opacity="0.08" />
      <circle cx="85" cy="55" r="35" className="fill-vt-yellow-dark" opacity="0.1" />
      
      {/* Chart bars */}
      <rect
        x="30"
        y="70"
        width="15"
        height="35"
        rx="6"
        className="fill-vt-yellow-dark"
        opacity="0.35"
      />
      <rect
        x="52"
        y="55"
        width="15"
        height="50"
        rx="6"
        className="fill-vt-yellow-dark"
        opacity="0.55"
      />
      <rect
        x="74"
        y="35"
        width="15"
        height="70"
        rx="6"
        className="fill-vt-yellow-dark"
        opacity="0.75"
      />
      <rect
        x="96"
        y="45"
        width="15"
        height="60"
        rx="6"
        className="fill-vt-yellow-dark"
        opacity="0.85"
      />
      
      {/* Trend line */}
      <path
        d="M 37 87 Q 59 70, 81 42 T 103 52"
        className="stroke-vt-green"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.65"
      />
      
      {/* Endpoint circle */}
      <circle cx="103" cy="52" r="5" className="fill-vt-green" opacity="0.85" />
    </svg>
  )
}
