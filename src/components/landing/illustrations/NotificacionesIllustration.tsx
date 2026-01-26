export function NotificacionesIllustration() {
  return (
    <svg
      viewBox="0 0 140 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto max-w-[140px] mx-auto"
    >
      <style>{`
        .bell-shake {
          transform-origin: 70px 31px;
        }
        .group:hover .bell-shake {
          animation: shake-bell 0.5s ease-in-out;
        }
        @keyframes shake-bell {
          0%, 100% { transform: rotate(0deg); }
          10%, 30%, 50%, 70%, 90% { transform: rotate(-8deg); }
          20%, 40%, 60%, 80% { transform: rotate(8deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .bell-shake {
            animation: none;
          }
        }
      `}</style>
      {/* Background circles with pulse */}
      <circle cx="70" cy="55" r="38" className="fill-vt-red" opacity="0.06">
        <animate
          attributeName="r"
          values="38;45;38"
          dur="2s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.06;0.03;0.06"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="70" cy="55" r="30" className="fill-vt-red" opacity="0.1" />
      
      {/* Bell group with shake animation */}
      <g className="bell-shake">
        {/* Bell body */}
        <path
          d="M 52 50 Q 52 34, 70 34 Q 88 34, 88 50 L 88 56 Q 88 62, 85 65 L 55 65 Q 52 62, 52 56 Z"
          className="fill-white dark:fill-slate-800 stroke-vt-red"
          strokeWidth="2"
        />
        
        {/* Bell top */}
        <rect
          x="66.5"
          y="31"
          width="7"
          height="5"
          rx="2"
          className="fill-vt-red"
          opacity="0.75"
        />
        
        {/* Bell clapper */}
        <circle cx="70" cy="65" r="2.5" className="fill-vt-red" opacity="0.5" />
      </g>
      
      {/* Notification badge */}
      <circle cx="82" cy="42" r="9" className="fill-vt-red" opacity="0.92" />
      <text
        x="82"
        y="46"
        textAnchor="middle"
        className="fill-white"
        fontSize="10"
        fontWeight="bold"
      >
        3
      </text>
      
      {/* Sound waves */}
      <path
        d="M 93 47 Q 99 44, 103 47"
        className="stroke-vt-red"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.45"
      />
      <path
        d="M 97 41 Q 105 35, 111 41"
        className="stroke-vt-red"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.25"
      />
      <path
        d="M 47 47 Q 41 44, 37 47"
        className="stroke-vt-red"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.45"
      />
      <path
        d="M 43 41 Q 35 35, 29 41"
        className="stroke-vt-red"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.25"
      />
    </svg>
  )
}
