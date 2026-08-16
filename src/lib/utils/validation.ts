import type { PasswordEvaluation, PhoneValidationResult } from "@/types/auth";

// Common / compromised / easily guessed password blocklist
export const COMMON_PASSWORDS = new Set([
  'password', 'password123', 'password1', '12345678', '123456789', '1234567890',
  'qwertyuiop', 'asdfghjkl', 'zxcvbnm1', 'admin123', 'admin1234', 'administrator',
  'quizstep', 'quizstep123', 'welcome123', 'welcome1', 'iloveyou', 'iloveyou123',
  'testing123', 'passphrase', 'changeme', 'sunshine', 'princess', 'football',
  'monkey123', 'trustno1', 'dragon123', 'master123', 'superman', 'charlie123',
  'donald123', 'computer1', 'secret123', 'myspace1', 'starwars', 'letmein123',
  '11111111', '00000000', '88888888', 'abcdefgh', 'pass1234'
]);

/**
 * Validate phone number (must be 10 digits if provided)
 */
export function validatePhoneNumber(phoneInput?: string): PhoneValidationResult {
  if (!phoneInput) return { isValid: true, cleanDigits: '', formatted: '' };

  const raw = String(phoneInput).trim();
  if (!raw) return { isValid: true, cleanDigits: '', formatted: '' };

  // Extract digits only
  const digitsOnly = raw.replace(/\D/g, '');

  // Normalize: allow 10 digits, or 11 with leading 0, or 12 with leading 91
  let tenDigits = '';
  if (digitsOnly.length === 10) {
    tenDigits = digitsOnly;
  } else if (digitsOnly.length === 11 && digitsOnly.startsWith('0')) {
    tenDigits = digitsOnly.slice(1);
  } else if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
    tenDigits = digitsOnly.slice(2);
  } else {
    return {
      isValid: false,
      cleanDigits: '',
      formatted: '',
      message: 'Please enter a valid 10-digit mobile number (e.g. 9876543210).'
    };
  }

  if (!/^[5-9]\d{9}$/.test(tenDigits) && !/^\d{10}$/.test(tenDigits)) {
    return {
      isValid: false,
      cleanDigits: '',
      formatted: '',
      message: 'Please enter a valid 10-digit mobile number.'
    };
  }

  return {
    isValid: true,
    cleanDigits: tenDigits,
    formatted: '+91' + tenDigits
  };
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

/**
 * Check if a password is in the common/compromised blocklist
 */
export function isCommonPassword(password: string): boolean {
  if (!password) return true;
  const lower = password.toLowerCase().trim();
  if (COMMON_PASSWORDS.has(lower)) return true;
  // Check for identical repeated character sequences (e.g. 'aaaaaaaa', '11111111')
  if (/^(.)\1{7,}$/.test(lower)) return true;
  return false;
}

/**
 * Evaluate password strength
 */
export function evaluatePasswordStrength(password: string): PasswordEvaluation {
  if (!password || password.length === 0) {
    return { score: 0, label: '', className: '', hint: '', isAcceptable: false };
  }

  if (isCommonPassword(password)) {
    return {
      score: 1,
      label: 'Too Common',
      className: 'strength-weak',
      hint: 'Easily guessed. Avoid common words.',
      isAcceptable: false
    };
  }

  const len = password.length;

  if (len < 8) {
    return {
      score: 1,
      label: 'Too Short',
      className: 'strength-weak',
      hint: `Need at least 8 characters (${8 - len} more)`,
      isAcceptable: false
    };
  }

  const hasSpaces = /\s/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigits = /[0-9]/.test(password);
  const hasSymbols = /[^A-Za-z0-9\s]/.test(password);

  let varietyCount = 0;
  if (hasUpper) varietyCount++;
  if (hasLower) varietyCount++;
  if (hasDigits) varietyCount++;
  if (hasSymbols) varietyCount++;

  let score = 2; // Base for >= 8 chars

  if (len >= 16 || (len >= 12 && hasSpaces)) {
    score = 4; // Strong passphrase
  } else if (len >= 12 && varietyCount >= 3) {
    score = 4; // Strong
  } else if (len >= 10 && varietyCount >= 2) {
    score = 3; // Good
  } else if (len >= 8 && varietyCount >= 3) {
    score = 3; // Good
  } else if (varietyCount <= 1) {
    score = 1; // Weak (e.g. all lowercase or all numbers)
  }

  if (score >= 4) {
    return {
      score: 4,
      label: 'Strong',
      className: 'strength-strong',
      hint: 'Excellent password!',
      isAcceptable: true
    };
  } else if (score === 3) {
    return {
      score: 3,
      label: 'Good',
      className: 'strength-good',
      hint: 'Solid password.',
      isAcceptable: true
    };
  } else if (score === 2) {
    return {
      score: 2,
      label: 'Fair',
      className: 'strength-fair',
      hint: 'Acceptable, but consider adding words/numbers.',
      isAcceptable: true
    };
  } else {
    return {
      score: 1,
      label: 'Weak',
      className: 'strength-weak',
      hint: 'Add variety (uppercase, numbers, or spaces).',
      isAcceptable: false
    };
  }
}
