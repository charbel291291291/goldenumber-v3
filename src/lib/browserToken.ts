/**
 * Generates or retrieves a unique token for identifying this browser session.
 * Used to let users cancel their own pending reservations.
 */
export function getBrowserToken(): string {
  const key = 'golden_number_browser_token';
  let token = localStorage.getItem(key);
  if (!token) {
    token = 'token_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now();
    localStorage.setItem(key, token);
  }
  return token;
}
