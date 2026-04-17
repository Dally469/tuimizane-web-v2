// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone number validation (Rwanda + DRC formats)
export const isValidPhoneNumber = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  // Rwanda: +2507xxxxxxxx (12 digits) or 07xxxxxxxx (10 digits)
  // DRC:    +243xxxxxxxxx (12 digits) or 0xxxxxxxxx (10 digits)
  const rwandaRegex = /^(2507\d{8}|07\d{8})$/;
  const drcRegex = /^(243\d{9}|0\d{9})$/;
  return rwandaRegex.test(cleaned) || drcRegex.test(cleaned);
};

// ID number validation (Rwanda 16-digit or general 6-20 digit/alphanumeric)
export const isValidIdNumber = (idNumber: string): boolean => {
  const trimmed = idNumber.trim();
  // Accept Rwanda 16-digit, DRC 9-digit, or any alphanumeric 6-20 chars
  return /^[A-Za-z0-9]{6,20}$/.test(trimmed);
};

// Amount validation
export const isValidAmount = (amount: string | number): boolean => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return !isNaN(numAmount) && numAmount > 0;
};

// Currency validation
export const isValidCurrency = (currency: string): boolean => {
  const validCurrencies = ['RWF', 'USD', 'CDF'];
  return validCurrencies.includes(currency.toUpperCase());
};

// Date validation
export const isValidDate = (date: string): boolean => {
  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime());
};

// Date range validation
export const isValidDateRange = (startDate: string, endDate: string): boolean => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return isValidDate(startDate) && isValidDate(endDate) && start <= end;
};

// Required field validation
export const isRequired = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

// Length validation
export const isValidLength = (
  value: string,
  minLength?: number,
  maxLength?: number
): boolean => {
  if (typeof value !== 'string') return false;
  
  const length = value.trim().length;
  
  if (minLength !== undefined && length < minLength) return false;
  if (maxLength !== undefined && length > maxLength) return false;
  
  return true;
};

// Password validation
export const isValidPassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// UUID validation
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// Payment method validation
export const isValidPaymentMethod = (method: string): boolean => {
  const validMethods = ['MOBILE_MONEY', 'BANK_TRANSFER', 'CASH', 'OTHER'];
  return validMethods.includes(method);
};

// Member type validation
export const isValidMemberType = (type: number): boolean => {
  return [0, 1, 2].includes(type);
};

// Season status validation
export const isValidSeasonStatus = (status: string): boolean => {
  const validStatuses = ['ACTIVE', 'ENDED', 'SCHEDULED', 'PENDING'];
  return validStatuses.includes(status);
};

// Payment status validation
export const isValidPaymentStatus = (status: string): boolean => {
  const validStatuses = ['PENDING', 'PAID', 'SKIPPED', 'SCHEDULED', 'CANCELLED'];
  return validStatuses.includes(status);
};

// Contribution status validation
export const isValidContributionStatus = (status: string): boolean => {
  const validStatuses = ['PENDING', 'ACCEPTED', 'REJECTED'];
  return validStatuses.includes(status);
};

// File validation
export const isValidFile = (
  file: File,
  allowedTypes: string[] = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  maxSizeMB: number = 10
): { isValid: boolean; error?: string } => {
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }
  
  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    };
  }
  
  return { isValid: true };
};

// Form validation helper
export interface ValidationRule {
  field: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
  message?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateForm = (
  data: Record<string, any>,
  rules: ValidationRule[]
): ValidationResult => {
  const errors: Record<string, string> = {};
  
  for (const rule of rules) {
    const value = data[rule.field];
    const fieldErrors: string[] = [];
    
    // Required validation
    if (rule.required && !isRequired(value)) {
      fieldErrors.push(`${rule.field} is required`);
    }
    
    // Skip other validations if field is empty and not required
    if (!isRequired(value) && !rule.required) {
      continue;
    }
    
    // Length validation
    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        fieldErrors.push(`${rule.field} must be at least ${rule.minLength} characters`);
      }
      
      if (rule.maxLength && value.length > rule.maxLength) {
        fieldErrors.push(`${rule.field} must not exceed ${rule.maxLength} characters`);
      }
    }
    
    // Pattern validation
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      fieldErrors.push(rule.message || `${rule.field} format is invalid`);
    }
    
    // Custom validation
    if (rule.custom) {
      const result = rule.custom(value);
      if (typeof result === 'string') {
        fieldErrors.push(result);
      } else if (!result) {
        fieldErrors.push(`${rule.field} is invalid`);
      }
    }
    
    if (fieldErrors.length > 0) {
      errors[rule.field] = fieldErrors[0]; // Take first error
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Common validation rules
export const commonValidationRules = {
  email: {
    field: 'email',
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address',
  },
  phone: {
    field: 'phone',
    required: true,
    custom: (value: string) => isValidPhoneNumber(value) || 'Please enter a valid Rwandan phone number',
  },
  idNumber: {
    field: 'idNumber',
    required: true,
    custom: (value: string) => isValidIdNumber(value) || 'Please enter a valid 16-digit ID number',
  },
  names: {
    field: 'names',
    required: true,
    minLength: 2,
    maxLength: 100,
    message: 'Name must be between 2 and 100 characters',
  },
  amount: {
    field: 'amount',
    required: true,
    custom: (value: string) => isValidAmount(value) || 'Please enter a valid amount greater than 0',
  },
  currency: {
    field: 'currency',
    required: true,
    custom: (value: string) => isValidCurrency(value) || 'Please select a valid currency',
  },
  address: {
    field: 'address',
    required: true,
    minLength: 5,
    maxLength: 200,
    message: 'Address must be between 5 and 200 characters',
  },
  password: {
    field: 'password',
    required: true,
    custom: (value: string) => isValidPassword(value) || 'Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number',
  },
  confirmPassword: (passwordField = 'password') => ({
    field: 'confirmPassword',
    required: true,
    custom: (value: string, data: any) => 
      value === data[passwordField] || 'Passwords do not match',
  }),
};

// Season-specific validation rules
export const seasonValidationRules = {
  startDate: {
    field: 'startDate',
    required: true,
    custom: (value: string) => isValidDate(value) || 'Please enter a valid start date',
  },
  endDate: {
    field: 'endDate',
    required: true,
    custom: (value: string, data: any) => 
      isValidDateRange(data.startDate, value) || 'End date must be after start date',
  },
  status: {
    field: 'status',
    required: true,
    custom: (value: string) => isValidSeasonStatus(value) || 'Please select a valid status',
  },
  memberIds: {
    field: 'memberIds',
    required: true,
    custom: (value: string[]) => 
      Array.isArray(value) && value.length > 0 || 'Please select at least one member',
  },
};
