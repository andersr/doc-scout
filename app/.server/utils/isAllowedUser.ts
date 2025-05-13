/**
 * Checks if an email address exists in the ALLOWED_USERS environment variable.
 * Supports email aliases (e.g., "foo@bar.com" and "foo+alias@bar.com" will both match).
 *
 * @param email - The email address to check
 * @returns true if the email is allowed, false otherwise
 */
export function isAllowedUser(email: string, allowedEmails: string): boolean {
  if (!email || !allowedEmails) {
    return false;
  }

  // Normalize the input email by removing any alias part
  const normalizedEmail = normalizeEmail(email);

  // Split the ALLOWED_USERS string into an array of emails
  const allowedUsers = allowedEmails.split(",").map((e) => e.trim());

  // Check if any of the allowed emails match the normalized input email
  return allowedUsers.some((allowedEmail) => {
    const normalizedAllowedEmail = normalizeEmail(allowedEmail);
    return normalizedEmail === normalizedAllowedEmail;
  });
}

/**
 * Normalizes an email address by removing the alias part (if any).
 * For example, "foo+alias@bar.com" becomes "foo@bar.com".
 *
 * @param email - The email address to normalize
 * @returns The normalized email address
 */
function normalizeEmail(email: string): string {
  const [localPart, domain] = email.split("@");

  if (!domain) {
    return email; // Not a valid email, return as is
  }

  // Remove everything after the '+' in the local part
  const normalizedLocalPart = localPart.split("+")[0];

  return `${normalizedLocalPart}@${domain}`;
}
