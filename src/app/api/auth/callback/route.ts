import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get("next") ?? "/dashboard";

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

    // Token válido - verificar si necesita onboarding

    // Check if user needs onboarding
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // Usamos admin client para bypassar RLS
      // porque la sesión puede no estar completamente disponible en este request
      const adminClient = createAdminClient();
      const { data: profile } = await adminClient
        .from("users")
        .select("onboarding_completed")
        .eq("id", user.id)
        .single();

      // Si NO existe el perfil o onboarding_completed es false → onboarding
      // Si existe Y onboarding_completed es true → dashboard
      const profileData = profile as { onboarding_completed: boolean } | null;
      const onboardingCompleted = profileData?.onboarding_completed === true;

      if (!onboardingCompleted) {
        return NextResponse.redirect(`${origin}/onboarding`);
      }
    }

    const forwardedHost = request.headers.get("x-forwarded-host"); // original origin before load balancer
    const isLocalEnv = process.env.NODE_ENV === "development";

    if (isLocalEnv) {
      // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
      return NextResponse.redirect(`${origin}${next}`);
    } else if (forwardedHost) {
      return NextResponse.redirect(`https://${forwardedHost}${next}`);
    } else {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
