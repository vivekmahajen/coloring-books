const TRIAL_DAYS = 7;

export function trialEndsAt(): Date {
  const d = new Date();
  d.setDate(d.getDate() + TRIAL_DAYS);
  return d;
}

export function isAdminEmail(email: string): boolean {
  const adminEmail = process.env.ADMIN_EMAIL;
  return !!adminEmail && email.toLowerCase() === adminEmail.toLowerCase();
}

export function canGenerateFree(user: {
  isAdmin: boolean;
  trialEndsAt: Date | null;
}): boolean {
  if (user.isAdmin) return true;
  if (user.trialEndsAt && user.trialEndsAt > new Date()) return true;
  return false;
}

export function trialDaysLeft(trialEndsAt: Date | null): number {
  if (!trialEndsAt) return 0;
  const ms = trialEndsAt.getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export function isTrialActive(trialEndsAt: Date | null): boolean {
  return !!trialEndsAt && trialEndsAt > new Date();
}
