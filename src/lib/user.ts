/**
 * Obtiene iniciales de un nombre para avatares
 * @example getInitials("Juan García") → "JG"
 * @example getInitials(null, "juan@email.com") → "J"
 */
export function getInitials(
    fullName: string | null | undefined,
    email?: string
): string {
    if (fullName) {
        return fullName
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }
    return email?.[0]?.toUpperCase() || 'U'
}
