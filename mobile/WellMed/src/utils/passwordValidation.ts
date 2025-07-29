export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
  requirements: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  };
}

export const validatePassword = (password: string): PasswordValidation => {
  const requirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  const errors: string[] = [];

  if (!requirements.minLength) {
    errors.push('At least 8 characters');
  }
  if (!requirements.hasUppercase) {
    errors.push('At least one uppercase letter (A-Z)');
  }
  if (!requirements.hasLowercase) {
    errors.push('At least one lowercase letter (a-z)');
  }
  if (!requirements.hasNumber) {
    errors.push('At least one number (0-9)');
  }
  if (!requirements.hasSpecialChar) {
    errors.push('At least one special character (!@#$%^&*)');
  }

  return {
    isValid: Object.values(requirements).every(req => req),
    errors,
    requirements,
  };
};

export const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
  const validation = validatePassword(password);
  const metRequirements = Object.values(validation.requirements).filter(req => req).length;

  if (metRequirements <= 2) return 'weak';
  if (metRequirements <= 4) return 'medium';
  return 'strong';
};

export const getPasswordStrengthColor = (strength: 'weak' | 'medium' | 'strong'): string => {
  switch (strength) {
    case 'weak': return '#D0021B';
    case 'medium': return '#F5A623';
    case 'strong': return '#7ED321';
    default: return '#9B9B9B';
  }
};