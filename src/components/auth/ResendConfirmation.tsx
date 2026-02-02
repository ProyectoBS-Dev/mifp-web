"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, Mail } from "lucide-react";

export function ResendConfirmation({
  initialEmail,
}: {
  initialEmail?: string;
}) {
  const [email, setEmail] = useState(initialEmail || "");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleResend = async () => {
    if (!email) {
      setMessage({
        type: "error",
        text: "Por favor, ingresa tu email",
      });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      // 1. Validate email status before allowing resend
      const statusRes = await fetch("/api/auth/check-email-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      // 2. Handle rate limit error
      if (statusRes.status === 429) {
        const data = await statusRes.json();
        setMessage({
          type: "error",
          text:
            data.error ||
            "Demasiados intentos. Espera un minuto e intenta de nuevo.",
        });
        setIsLoading(false);
        return;
      }

      // 3. Parse response
      const { canResend, message: statusMsg } = await statusRes.json();

      // 4. Handle validation errors (not registered, already confirmed, etc.)
      if (!canResend) {
        setMessage({
          type: "error",
          text: statusMsg,
        });
        setIsLoading(false);
        return;
      }

      // 5. Email is valid and unconfirmed - proceed with resend
      const supabase = createClient();
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });

      if (error) {
        setMessage({
          type: "error",
          text: error.message || "Error al enviar el email. Intenta de nuevo.",
        });
      } else {
        setMessage({
          type: "success",
          text: "📧 Email de confirmación enviado. Revisa tu bandeja de entrada.",
        });
      }
    } catch (error) {
      console.error("[ResendConfirmation] Error:", error);
      setMessage({
        type: "error",
        text: "Error al verificar el email. Intenta de nuevo.",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="resend-email">Email</Label>
        <Input
          id="resend-email"
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <Button
        onClick={handleResend}
        disabled={isLoading || !email}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Mail className="mr-2 h-4 w-4 animate-pulse" />
            Enviando...
          </>
        ) : (
          <>
            <Mail className="mr-2 h-4 w-4" />
            Reenviar email de confirmación
          </>
        )}
      </Button>

      {message && (
        <div
          className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800"
              : "bg-destructive/10 text-destructive border border-destructive/20"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          )}
          <p>{message.text}</p>
        </div>
      )}
    </div>
  );
}
