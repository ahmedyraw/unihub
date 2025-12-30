/**
 * Password validation utility matching backend requirements
 */

export const validatePassword = (password) => {
  const errors = [];
  
  if (!password || password.length < 8) {
    errors.push('At least 8 characters');
  }
  
  if (password && !/[A-Z]/.test(password)) {
    errors.push('At least one uppercase letter');
  }
  
  if (password && !/[a-z]/.test(password)) {
    errors.push('At least one lowercase letter');
  }
  
  if (password && !/[0-9]/.test(password)) {
    errors.push('At least one number');
  }
  
  if (password && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('At least one special character (!@#$%^&*...)');
  }
  
  return errors;
};

export const isPasswordValid = (password) => {
  return validatePassword(password).length === 0;
};

export const getPasswordStrength = (password) => {
  if (!password) return { strength: 'none', percentage: 0, color: 'secondary' };
  
  const errors = validatePassword(password);
  const score = 5 - errors.length;
  
  if (score === 5) return { strength: 'Strong', percentage: 100, color: 'success' };
  if (score === 4) return { strength: 'Good', percentage: 80, color: 'info' };
  if (score === 3) return { strength: 'Fair', percentage: 60, color: 'warning' };
  if (score === 2) return { strength: 'Weak', percentage: 40, color: 'warning' };
  return { strength: 'Very Weak', percentage: 20, color: 'danger' };
};

export default {
  validatePassword,
  isPasswordValid,
  getPasswordStrength
};
