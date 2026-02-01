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
  searchParams: { error?: string; message?: string };
}) {
  // Redirect to dashboard if already logged in
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  const error = searchParams?.error;
  const errorMessage = searchParams?.message;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-soft p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center mb-8">
          <span className="text-3xl font-bold gradient-text">MiFP</span>
        </Link>

        {/* Mostrar alerta de error si el token expiró */}
        {error === "token_expired" && (
          <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg space-y-4">
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                ⏰ El enlace de confirmación ha expirado
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                {errorMessage ||
                  "El enlace de confirmación solo es válido por 1 hora. Puedes solicitar uno nuevo:"}
              </p>
            </div>
            <ResendConfirmation />
          </div>
        )}

        {/* Mostrar otros errores de autenticación */}
        {error === "auth_callback_error" && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm font-medium text-destructive">
              ❌ Error de autenticación
            </p>
            <p className="text-xs text-destructive/80 mt-1">
              {errorMessage ||
                "Hubo un problema al confirmar tu cuenta. Por favor, inicia sesión."}
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
