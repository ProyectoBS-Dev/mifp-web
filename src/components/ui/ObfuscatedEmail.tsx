'use client'

import { useEffect, useRef, useState } from 'react'

interface ObfuscatedEmailProps {
  user: string
  domain: string
  tld: string
  className?: string
  children?: React.ReactNode
  showIcon?: boolean
}

/**
 * Componente para mostrar emails de forma ofuscada contra scrapers y bots.
 * 
 * El email se reconstruye en el cliente, evitando que aparezca completo en el HTML.
 * 
 * @example
 * <ObfuscatedEmail user="contacto" domain="mifp" tld="dev" />
 * // Muestra: contacto@mifp.dev (clicable)
 * 
 * @example
 * <ObfuscatedEmail user="soporte" domain="example" tld="com" className="text-blue-500">
 *   Contáctanos
 * </ObfuscatedEmail>
 * // Muestra: Contáctanos (clicable, abre mailto)
 */
export function ObfuscatedEmail({ 
  user, 
  domain, 
  tld, 
  className = '',
  children 
}: ObfuscatedEmailProps) {
  const [email, setEmail] = useState<string>('')
  const linkRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    // Reconstruir el email en el cliente para evitar scrapers
    const reconstructedEmail = `${user}@${domain}.${tld}`
    setEmail(reconstructedEmail)
  }, [user, domain, tld])

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!email) {
      e.preventDefault()
      return
    }
    // Construir mailto: en el momento del click
    const mailtoLink = `mailto:${email}`
    window.location.href = mailtoLink
    e.preventDefault()
  }

  // Mostrar versión ofuscada visualmente pero no en el href
  const displayEmail = children || (
    <>
      {user}
      <span style={{ display: 'none' }}>-anti-bot-</span>
      @
      <span style={{ display: 'none' }}>-protection-</span>
      {domain}.{tld}
    </>
  )

  return (
    <a
      ref={linkRef}
      href="#"
      onClick={handleClick}
      className={className}
      data-user={user}
      data-domain={domain}
      data-tld={tld}
      aria-label={email || `Correo electrónico de contacto`}
    >
      {displayEmail}
    </a>
  )
}
