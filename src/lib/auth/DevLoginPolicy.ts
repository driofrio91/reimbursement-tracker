const DEV_LOGIN_DOMAIN = "@local.test";

export interface DevLoginPolicyOptions {
  nodeEnv?: string;
  allowDevLogin?: string;
}

export function isDevLoginEmail(email: string): boolean {
  return email.trim().toLowerCase().endsWith(DEV_LOGIN_DOMAIN);
}

export function canUseDevLogin(email: string, options: DevLoginPolicyOptions): boolean {
  if (!isDevLoginEmail(email)) {
    return true;
  }

  if (options.nodeEnv === "production") {
    return false;
  }

  const allowDevLogin =
    options.allowDevLogin ?? (options.nodeEnv === "development" ? "true" : "false");

  return allowDevLogin === "true";
}
