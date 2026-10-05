/**
 * Extrae el mensaje de error de una respuesta fallida de `fetch`.
 *
 * No toda respuesta de error es JSON: un límite de la plataforma (413), un
 * proxy o un timeout (502/504) responden con texto plano o HTML, y hacer
 * `response.json()` a ciegas oculta la causa real tras un fallo de parseo.
 */
export async function readErrorMessage(
  response: Response,
  fallback = 'Error inesperado'
): Promise<string> {
  const body = await response.text()

  try {
    const data = JSON.parse(body) as { error?: string }
    if (data.error) return data.error
  } catch {
    // Respuesta no-JSON: se usa el mensaje por estado
  }

  if (response.status === 401) return 'Tu sesión ha caducado, vuelve a iniciar sesión'
  if (response.status === 403) return 'No tienes permisos para hacer esto'
  if (response.status === 413) return 'El archivo es demasiado grande'
  if (response.status === 429) return 'Demasiadas peticiones, espera un momento'
  if (response.status === 502 || response.status === 504) {
    return 'El servidor tardó demasiado en responder. Inténtalo de nuevo.'
  }
  return `${fallback} (error ${response.status})`
}
