/**
 * Google reCAPTCHA v3 Service
 * 
 * This service handles Google reCAPTCHA v3 validation
 * Documentation: https://developers.google.com/recaptcha/docs/v3
 */

const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';

interface RecaptchaResponse {
  success: boolean;
  score: number;
  action: string;
  challenge_ts: string;
  hostname: string;
  'error-codes'?: string[];
}

interface RecaptchaValidation {
  isValid: boolean;
  score?: number;
  error?: string;
}

/**
 * Validate Google reCAPTCHA v3 token
 * 
 * @param token - The reCAPTCHA token from frontend
 * @param action - The action name (should match frontend)
 * @param minScore - Minimum score required (0.0 - 1.0)
 * @returns Promise<RecaptchaValidation>
 */
export async function validateRecaptcha(
  token: string,
  action: string = 'login',
  minScore: number = 0.5
): Promise<RecaptchaValidation> {
  try {
    // Get secret key from environment
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    
    if (!secretKey) {
      console.error('RECAPTCHA_SECRET_KEY not configured');
      return {
        isValid: false,
        error: 'reCAPTCHA not configured'
      };
    }

    // Validate token format
    if (!token || token.length < 10) {
      return {
        isValid: false,
        error: 'Invalid reCAPTCHA token format'
      };
    }

    // Verify with Google
    const params = new URLSearchParams({
      secret: secretKey,
      response: token,
    });

    const response = await fetch(RECAPTCHA_VERIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      console.error('reCAPTCHA verification failed:', response.status);
      return {
        isValid: false,
        error: 'reCAPTCHA verification failed'
      };
    }

    const data: RecaptchaResponse = await response.json();

    if (!data.success) {
      console.error('reCAPTCHA validation failed:', data['error-codes']);
      return {
        isValid: false,
        error: data['error-codes']?.join(', ') || 'reCAPTCHA validation failed'
      };
    }

    // Check action matches (optional for testing)
    if (data.action !== action && !process.env.RECAPTCHA_SKIP_ACTION_CHECK) {
      console.warn('reCAPTCHA action mismatch:', data.action, '!==', action);
      // For development, we'll allow this but log it
      if (process.env.NODE_ENV === 'production') {
        return {
          isValid: false,
          error: 'reCAPTCHA action mismatch'
        };
      }
    }

    // Check score
    if (data.score < minScore) {
      console.error('reCAPTCHA score too low:', data.score, '<', minScore);
      return {
        isValid: false,
        score: data.score,
        error: `reCAPTCHA score too low: ${data.score}`
      };
    }

    return {
      isValid: true,
      score: data.score,
    };

  } catch (error) {
    console.error('reCAPTCHA validation error:', error);
    return {
      isValid: false,
      error: 'reCAPTCHA validation error'
    };
  }
}

/**
 * Get reCAPTCHA site key for frontend
 */
export function getRecaptchaSiteKey(): string | null {
  return process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || null;
}

/**
 * Check if reCAPTCHA is enabled
 */
export function isRecaptchaEnabled(): boolean {
  return !!process.env.RECAPTCHA_SECRET_KEY && !!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
}
