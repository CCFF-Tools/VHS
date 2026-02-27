import { env } from "@/lib/env";

export function isInternalAuthorized(passwordHeader: string | null) {
  if (!env.internalPassword) return true;
  return passwordHeader === env.internalPassword;
}
