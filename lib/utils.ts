/**
 * Utility functions for handling HTTP status codes.
 * @param {number} status - The HTTP status code to check.
 * @returns {boolean} - True if the status code indicates success, false otherwise.
 */
export function isSuccessStatus(status: number): boolean {
  return status >= 200 && status < 300;
}

/**
 * Utility function to check if the status code indicates a failure.
 * @param {number} status - The HTTP status code to check.
 * @returns {boolean} - True if the status code indicates a failure, false otherwise.
 */
export function isFailureStatus(status: number): boolean {
  return !isSuccessStatus(status);
}
