import { createAdminClient } from "@/lib/supabase/admin";
import { withAuthRateLimit } from "@/lib/ratelimit";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// ═══════════════════════════════════════════════════════════════════════════════
// Email Validation Schema
// ═══════════════════════════════════════════════════════════════════════════════

const EmailSchema = z.object({
  email: z
    .string()
    .trim() // Remove whitespace
    .toLowerCase() // Normalize to lowercase
    .email("Email inválido") // Validate format
    .max(100, "Email demasiado largo"), // Prevent abuse
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/auth/check-email-status
// Valida si un email está registrado y confirmado antes de permitir reenvío
// ═══════════════════════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    // 1. Parse and validate request body
    const body = await request.json();
    const result = EmailSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          status: "invalid",
          canResend: false,
          message: "Email inválido",
        },
        { status: 400 },
      );
    }

    const { email } = result.data;

    // 2. Apply rate limiting (3 req/min per email + 30 req/min per IP)
    const rateLimitError = await withAuthRateLimit(request, email);
    if (rateLimitError) return rateLimitError;

    // 3. Query auth.users using admin client (más seguro que listUsers)
    const adminClient = createAdminClient();

    // Usar getUserById sería ideal pero no tenemos el ID
    // getUserByEmail no existe en la API, así que usamos listUsers con filtro
    const { data: authData, error: authError } =
      await adminClient.auth.admin.listUsers();

    if (authError) {
      console.error(
        "[check-email-status] Error querying auth.users:",
        authError,
      );
      return NextResponse.json(
        {
          status: "error",
          canResend: false,
          message: "Error al verificar email. Intenta de nuevo.",
        },
        { status: 500 },
      );
    }

    // 4. Find user by email
    const user = authData.users.find((u) => u.email === email);

    // 5. Email not registered
    if (!user) {
      return NextResponse.json({
        status: "not_found",
        canResend: false,
        message:
          "Este email no está registrado. Por favor, regístrate primero.",
      });
    }

    // 6. Email already confirmed
    if (user.email_confirmed_at) {
      return NextResponse.json({
        status: "confirmed",
        canResend: false,
        message:
          "Este email ya está confirmado. Puedes iniciar sesión directamente.",
      });
    }

    // 7. Email valid and unconfirmed - allow resend
    return NextResponse.json({
      status: "unconfirmed",
      canResend: true,
      message: "Email válido. Listo para reenviar confirmación.",
    });
  } catch (error) {
    console.error("[check-email-status] Unexpected error:", error);
    return NextResponse.json(
      {
        status: "error",
        canResend: false,
        message: "Error inesperado. Intenta de nuevo.",
      },
      { status: 500 },
    );
  }
}
