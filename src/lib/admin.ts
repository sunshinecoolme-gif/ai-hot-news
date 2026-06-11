export function isAllowedAdmin(email: string, adminEmail: string): boolean {
  return email.trim().toLowerCase() === adminEmail.trim().toLowerCase();
}
