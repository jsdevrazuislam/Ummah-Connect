import redis from '@/config/redis';
import bcrypt from 'bcryptjs';


/**
 * Formats a given Date object into a human-readable "time ago" string.
 * It calculates the difference between the current time and the provided date
 * and returns a string like "X seconds ago", "Y minutes ago", "Z hours ago", etc.
 *
 * @param {Date} date - The Date object to format.
 * @param {Boolean} isShort - The Boolean to format.
 * @returns {string} A string representing how long ago the date occurred.
 *
 * @example
 * const pastDate = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
 * console.log(formatTimeAgo(pastDate)); // Output: "5 minutes ago"
 *
 * const anotherPastDate = new Date(2023, 0, 1); // January 1, 2023
 * console.log(formatTimeAgo(anotherPastDate)); // Output: "1 year ago" (or similar, depending on current date)
 */
export function formatTimeAgo(date: Date, isShort = false): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds} ${isShort ? 's' : 'seconds ago'}`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} ${isShort ? 'm' : 'minutes ago'}`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} ${isShort ? 'h' : 'hours ago'}`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} ${isShort ? 'd' : 'days ago'}`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)} ${isShort ? 'w' : 'weeks ago'}`;
  if (seconds < 31536000) return `${Math.floor(seconds / 2592000)} ${isShort ? 'mon' : 'months ago'}`;
  return `${Math.floor(seconds / 31536000)} ${isShort ? 'y' : 'years ago'}`;
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

/**
 * Asynchronously retrieves data from cache or computes it if not found, then caches the result.
 * This function acts as a "cache-aside" pattern, checking Redis first before executing a callback
 * to fetch or compute the data.
 *
 * @template T - The type of the value being cached.
 * @param {string} key - The unique key used to store and retrieve the data from the cache.
 * @param {function(): Promise<T>} cb - An asynchronous callback function that will be executed
 * to fetch or compute the data if it's not found in the cache. This function must return a Promise
 * that resolves to the data of type `T`.
 * @param {number} [ttl=60] - The time-to-live (TTL) for the cached data in seconds.
 * After this duration, the cached item will expire and be re-computed on the next request.
 * Defaults to 60 seconds.
 * @returns {Promise<T>} A Promise that resolves to the cached or newly computed data of type `T`.
 */
export const getOrSetCache = async <T>(
  key: string,
  cb: () => Promise<T>,
  ttl: number = 60 
): Promise<T> => {
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached) as T;
  }

  const result = await cb();
  await redis.set(key, JSON.stringify(result), 'EX', ttl);
  return result;
};