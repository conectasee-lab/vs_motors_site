export function mapAuthError(message: string | undefined): string {
  if (!message) return "Não foi possível entrar. Tente novamente.";

  const normalized = message.toLowerCase();

  if (normalized.includes("rate limit")) {
    return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
  }

  if (normalized.includes("invalid login credentials")) {
    return "E-mail ou senha incorretos.";
  }

  return "Não foi possível entrar. Tente novamente.";
}
