import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth";
import { ResendConfirmation } from "@/components/auth/ResendConfirmation";
import { HashParamHandler } from "@/components/auth/HashParamHandler";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Inicia sesión en tu cuenta de MiFP",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    message?: string;
    error_code?: string;
  }>;
}) {
  // Redirect to dashboard if already logged in
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  // Await searchParams (Next.js 15+ requirement)
  const params = await searchParams;
  const error = params?.error;
  const errorMessage = params?.message;
  const errorCode = params?.error_code;

  // Detectar token expirado - PRIORIZAR error_code
  // 1. error_code=otp_expired (Supabase directo)
  // 2. error=token_expired (nuestro callback)
  const isTokenExpired =
    errorCode === "otp_expired" || error === "token_expired";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-soft p-4">
      {/* Client component to extract error params from hash fragment */}
      <HashParamHandler />

      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center mb-8">
          <span className="text-3xl font-bold gradient-text">MiFP</span>
        </Link>

        {/* Mostrar otros errores de autenticación (SOLO si NO es token expirado) */}
        {error && !isTokenExpired && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm font-medium text-destructive">
              {errorMessage ||
                "Error en el proceso de autenticación. Por favor, intenta de nuevo."}
            </p>
          </div>
        )}

        {isTokenExpired ? (
          /* ============================================
             ESTADO: Token Expirado - Card de Resend
             ============================================ */
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-vt-blue/10 dark:bg-vt-blue/20 flex items-center justify-center mb-3">
                <Mail className="h-6 w-6 text-vt-blue" />
              </div>
              <CardTitle className="text-2xl">Confirma tu email</CardTitle>
              <CardDescription>
                Tu enlace de confirmación ha expirado. Ingresa tu email para
                recibir uno nuevo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ResendConfirmation />

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    o
                  </span>
                </div>
              </div>

              {/* Link para volver a login si ya confirmó */}
              <p className="text-center text-xs text-muted-foreground">
                ¿Ya confirmaste tu email?{" "}
                <Link
                  href="/login"
                  className="text-vt-blue hover:underline font-medium"
                >
                  Intenta iniciar sesión
                </Link>
              </p>
            </CardContent>
          </Card>
        ) : (
          /* ============================================
             ESTADO: Normal - Card de Login
             ============================================ */
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Bienvenido de nuevo</CardTitle>
              <CardDescription>
                Inicia sesión para acceder a tu dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LoginForm />
            </CardContent>
          </Card>
        )}

        <p className="text-center text-xs text-muted-foreground mt-6">
          Al iniciar sesión, aceptas nuestros{" "}
          <Link href="/terminos" className="underline hover:text-primary">
            Términos de Servicio
          </Link>{" "}
          y{" "}
          <Link href="/privacidad" className="underline hover:text-primary">
            Política de Privacidad
          </Link>
        </p>
      </div>
    </div>
  );
}
