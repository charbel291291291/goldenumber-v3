/**
 * Normalizes user nicknames for duplicate checking:
 * Trims whitespace and converts to lower case.
 */
export function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

/**
 * Validates a name (must not be empty, must be at least 2 characters)
 */
export function validateName(name: string): { isValid: boolean; error?: string } {
  const trimmed = name.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Name is required.' };
  }
  if (trimmed.length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters.' };
  }
  return { isValid: true };
}

/**
 * Validates Lebanese & general phone numbers.
 * Allows digits, spaces, dashes, parentheses, and an optional leading plus (+).
 */
export function validatePhone(phone: string): { isValid: boolean; error?: string } {
  const trimmed = phone.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Phone is required.' };
  }
  
  // Custom regex allowing standard phone formats (like Lebanese: +961 XXXXXX, 03 XXXXXX, 70 XXXXXX, 71 XXXXXX, etc.)
  const phoneRegex = /^\+?[0-9\s\-()]{6,20}$/;
  if (!phoneRegex.test(trimmed)) {
    return { isValid: false, error: 'Invalid phone format (numeric, min 6 digits).' };
  }
  
  return { isValid: true };
}
