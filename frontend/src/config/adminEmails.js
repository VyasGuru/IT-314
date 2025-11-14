// List of emails that are allowed to register as administrators
// Only these emails can create admin accounts
// IMPORTANT: Replace these with your actual admin email addresses
export const ALLOWED_ADMIN_EMAILS = [
  "sanu10746@gmail.com",
  "snehshah0316@gmail.com",
  // Add your second admin email here
  // Example: "admin2@findmysquare.com",
];

/**
 * Check if an email is allowed to be an administrator
 * @param {string} email - Email address to check
 * @returns {boolean} True if email is allowed to be admin
 */
export const isAllowedAdminEmail = (email) => {
  if (!email) return false;
  const normalizedEmail = email.toLowerCase().trim();
  return ALLOWED_ADMIN_EMAILS.some(
    (allowedEmail) => allowedEmail.toLowerCase().trim() === normalizedEmail
  );
};

