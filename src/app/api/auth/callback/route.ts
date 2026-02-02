import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("[Auth Callback] exchangeCodeForSession failed:", {
        message: error.message,
        status: error.status,
        code: error.code,
      });

      // Detectar token expirado o inválido
      if (
        error.message.toLowerCase().includes("expired") ||
        error.message.toLowerCase().includes("invalid")
      ) {
        return NextResponse.redirect(
          `${origin}/login?error=token_expired&message=${encodeURIComponent("El enlace de confirmación ha expirado")}`,
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

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
