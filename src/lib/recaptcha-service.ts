
const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';

interface RecaptchaResponse {
  success: boolean;
  challenge_ts: string;
  hostname: string;
  'error-codes'?: string[];
  score?: number;
  action?: string;
}

interface RecaptchaValidation {
  isValid: boolean;
  score?: number;
  error?: string;
}

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

    return {
      isValid: true,
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
