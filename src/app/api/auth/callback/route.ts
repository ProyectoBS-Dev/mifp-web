import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  // Extraer error_code de Supabase si existe
  const errorCodeFromUrl = searchParams.get("error_code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("[Auth Callback] exchangeCodeForSession failed:", {
        message: error.message,
        status: error.status,
        code: error.code,
      });

      // Detectar token expirado por:
      // 1. Mensaje de error, O
      // 2. error_code=otp_expired de Supabase
      if (
        error.message.toLowerCase().includes("expired") ||
        error.message.toLowerCase().includes("invalid") ||
        errorCodeFromUrl === "otp_expired"
      ) {
        return NextResponse.redirect(
          `${origin}/login?error=token_expired&error_code=otp_expired&message=${encodeURIComponent("El enlace de confirmación ha expirado")}`,
        );
      }

      // Otros errores de autenticación
      return NextResponse.redirect(
        `${origin}/login?error=auth_callback_error&message=${encodeURIComponent(error.message)}`,
      );
    }

    // ✅ Token válido - sesión creada exitosamente
    // Redirigir a root (/) y dejar que proxy.ts determine el destino final
    // basado en el estado de onboarding del usuario
    // Esto previene bypass del proxy y asegura consistencia en el flujo

    const forwardedHost = request.headers.get("x-forwarded-host"); // original origin before load balancer
    const isLocalEnv = process.env.NODE_ENV === "development";

    if (isLocalEnv) {
      // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
      return NextResponse.redirect(`${origin}/`);
    } else if (forwardedHost) {
      return NextResponse.redirect(`https://${forwardedHost}/`);
    } else {
      return NextResponse.redirect(`${origin}/`);
    }
  }

  // Si NO hay code, probablemente es un callback con hash fragments
  // Dejar que el cliente (HashParamHandler) maneje los params del hash
  // No redirigir con error genérico
  return NextResponse.redirect(`${origin}/login`);
}
