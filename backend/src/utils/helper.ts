import bcrypt from 'bcryptjs';


/**
 * Formats a given Date object into a human-readable "time ago" string.
 * It calculates the difference between the current time and the provided date
 * and returns a string like "X seconds ago", "Y minutes ago", "Z hours ago", etc.
 *
 * @param {Date} date - The Date object to format.
 * @returns {string} A string representing how long ago the date occurred.
 *
 * @example
 * const pastDate = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
 * console.log(formatTimeAgo(pastDate)); // Output: "5 minutes ago"
 *
 * const anotherPastDate = new Date(2023, 0, 1); // January 1, 2023
 * console.log(formatTimeAgo(anotherPastDate)); // Output: "1 year ago" (or similar, depending on current date)
 */
export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds} seconds ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)} weeks ago`;
  if (seconds < 31536000) return `${Math.floor(seconds / 2592000)} months ago`;
  return `${Math.floor(seconds / 31536000)} years ago`;
}

/**
 * Generates a random 6-digit numeric code.
 * @returns A string representing a 6-digit code (e.g., "123456").
 */
export function generateSixDigitCode(): string {
  const code = Math.floor(100000 + Math.random() * 900000);
  return code.toString();
}

const RECOVERY_CODE_LENGTH = 16;
const NUMBER_OF_RECOVERY_CODES = 10;
const HASH_SALT_ROUNDS = 10;

/**
 * Generates a random alphanumeric string for a recovery code.
 */
function generateRandomCode(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

/**
 * Generates a set of unique recovery codes and their hashes.
 * @returns An object containing `plainCodes` (array of plain text codes) and `hashedCodes` (array of hashed codes).
 */
export async function generateRecoveryCodes(): Promise<{ plainCodes: string[]; hashedCodes: string[] }> {
  const plainCodes: string[] = [];
  const hashedCodes: string[] = [];

  for (let i = 0; i < NUMBER_OF_RECOVERY_CODES; i++) {
    let code = generateRandomCode(RECOVERY_CODE_LENGTH);
    while (plainCodes.includes(code)) {
      code = generateRandomCode(RECOVERY_CODE_LENGTH);
    }
    const hashedCode = await bcrypt.hash(code, HASH_SALT_ROUNDS);
    plainCodes.push(code);
    hashedCodes.push(hashedCode);
  }
  return { plainCodes, hashedCodes };
}

/**
 * Compares a plain recovery code with a hashed code.
 */
export async function compareRecoveryCode(plainCode: string, hashedCode: string): Promise<boolean> {
  return bcrypt.compare(plainCode, hashedCode);
}