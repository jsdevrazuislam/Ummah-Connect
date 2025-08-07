import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/**
 * Hashes a plain text password using bcrypt.
 * This function is asynchronous and returns a Promise.
 *
 * @param {string} password The plain text password string to be hashed.
 * @returns {Promise<string>} A Promise that resolves with the hashed password string.
 */
export function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

/**
 * Compares a plain text password with a bcrypt hashed password.
 * This function is asynchronous and returns a Promise.
 *
 * @param {string} hashedPassword The bcrypt hashed password string to compare against.
 * @param {string} password The plain text password string to compare.
 * @returns {Promise<boolean>} A Promise that resolves to `true` if the passwords match, `false` otherwise.
 */
export function comparePassword(hashedPassword: string, password: string) {
  // Renamed 'hash_password' parameter to 'hashedPassword' for clarity as it's the already hashed password.
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Generates a JSON Web Token (JWT) access token.
 * The token's secret and expiry are configured via environment variables.
 *
 * @param {object} data The payload data (e.g., user ID, roles) to be included in the token.
 * @returns {string} The generated JWT access token string.
 * @throws {Error} If `process.env.ACCESS_TOKEN_SECRET` is not provided.
 */
export function generateAccessToken(data: object) {
  // Ensure ACCESS_TOKEN_SECRET is defined, otherwise jwt.sign might throw
  if (!process.env.ACCESS_TOKEN_SECRET) {
    throw new Error("ACCESS_TOKEN_SECRET is not defined in environment variables.");
  }
  return jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, { expiresIn: `${Number(process.env.ACCESS_TOKEN_EXPIRY)} days` });
}

/**
 * Generates a JSON Web Token (JWT) refresh token.
 * The token's secret and expiry are configured via environment variables.
 *
 * @param {object} data The payload data (e.g., user ID) to be included in the token.
 * @returns {string} The generated JWT refresh token string.
 * @throws {Error} If `process.env.REFRESH_TOKEN_SECRET` is not provided.
 */
export function generateRefreshToken(data: object) {
  // Ensure REFRESH_TOKEN_SECRET is defined, otherwise jwt.sign might throw
  if (!process.env.REFRESH_TOKEN_SECRET) {
    throw new Error("REFRESH_TOKEN_SECRET is not defined in environment variables.");
  }
  return jwt.sign(data, process.env.REFRESH_TOKEN_SECRET, { expiresIn: `${Number(process.env.REFRESH_TOKEN_EXPIRY)} days` });
}

/**
 * Decodes and verifies a JSON Web Token (JWT) using a given secret key.
 *
 * @param {string} token The JWT string to be decoded and verified.
 * @param {string} key The secret key used to sign the token.
 * @returns {string | jwt.JwtPayload} The decoded payload of the token.
 * @throws {Error} Throws an error if the token is invalid, expired, or the secret key is incorrect.
 */
export function decodeToken(token: string, key: string) {
  return jwt.verify(token, key);
}
