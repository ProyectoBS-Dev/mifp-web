'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// Cloud SVG component for crisp rendering at any size
function Cloud({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 120" className={className} fill="currentColor">
      <ellipse cx="70" cy="80" rx="50" ry="35" />
      <ellipse cx="120" cy="70" rx="45" ry="40" />
      <ellipse cx="160" cy="85" rx="35" ry="30" />
      <ellipse cx="95" cy="55" rx="40" ry="30" />
      <ellipse cx="140" cy="50" rx="30" ry="25" />
    </svg>
  )
}

export function HeroParallax() {
  const containerRef = useRef<HTMLDivElement>(null)
  const elementsRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (!containerRef.current || !elementsRef.current) return
    
    const ctx = gsap.context(() => {
      // Parallax effect on scroll
      gsap.to(elementsRef.current, {
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.5,
        },
        scale: 0.9,
        opacity: 0,
        y: -80,
        ease: 'none',
      })
    }, containerRef)
    
    return () => ctx.revert()
  }, [])
  
  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {/* Background gradient - subtle overlay that adapts to theme */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-vt-blue-light/20 to-vt-blue/30 dark:from-transparent dark:via-vt-blue/10 dark:to-vt-purple/20" />
      
      {/* Aurora glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-vt-blue/30 dark:bg-vt-blue/20 rounded-full blur-[120px]" />
      <div className="absolute top-20 right-1/4 w-[500px] h-[350px] bg-vt-green/12 dark:bg-vt-green/8 rounded-full blur-[100px]" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-vt-green/20 dark:bg-vt-green/20 rounded-full blur-[150px]" />
      
      {/* Animated elements container */}
      <div ref={elementsRef} className="absolute inset-0" style={{ willChange: 'transform, opacity' }}>
        {/* SVG Clouds - adapt to theme with better visibility */}
        <Cloud className="absolute top-[15%] left-[5%] w-32 h-20 text-white/60 dark:text-slate-700/40 drop-shadow-lg" />
        <Cloud className="absolute top-[25%] right-[10%] w-40 h-24 text-white/50 dark:text-slate-700/30 drop-shadow-lg" />
        <Cloud className="absolute top-[45%] left-[15%] w-48 h-28 text-white/70 dark:text-slate-700/50 drop-shadow-xl" />
        <Cloud className="absolute bottom-[20%] right-[5%] w-56 h-32 text-white/65 dark:text-slate-700/40 drop-shadow-xl" />
        <Cloud className="absolute bottom-[30%] left-[60%] w-24 h-16 text-white/40 dark:text-slate-700/30" />
        
        {/* Owl mascot - temporarily disabled due to transparency issue
        <div className="absolute bottom-[10%] right-[10%] w-48 h-48 md:w-64 md:h-64">
          <Image
            src="/images/owl_mascot.png"
            alt=""
            fill
            className="object-contain"
            priority
          />
        </div>
        */}
      </div>
    </div>
  )
}
