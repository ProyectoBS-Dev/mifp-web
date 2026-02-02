import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth";
import { ResendConfirmation } from "@/components/auth/ResendConfirmation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

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

  // Detectar token expirado de dos formas:
  // 1. Nuestro callback: error=token_expired
  // 2. Supabase directo: error_code=otp_expired
  const isTokenExpired =
    error === "token_expired" || errorCode === "otp_expired";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-soft p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center mb-8">
          <span className="text-3xl font-bold gradient-text">MiFP</span>
        </Link>

        {/* Mostrar alerta de error si el token expiró */}
        {isTokenExpired && (
          <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg space-y-4">
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                ⏰ El enlace de confirmación ha expirado
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                {errorMessage ||
                  "Los enlaces de confirmación son válidos durante 1 hora. Puedes solicitar un nuevo enlace a continuación:"}
              </p>
            </div>
            <ResendConfirmation />
          </div>
        )}

        {/* Mostrar otros errores de autenticación (pero no si ya mostramos token expirado) */}
        {error === "auth_callback_error" && !isTokenExpired && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm font-medium text-destructive">
              {errorMessage ||
                "Error en el proceso de autenticación. Por favor, intenta de nuevo."}
            </p>
          </div>
        )}

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
