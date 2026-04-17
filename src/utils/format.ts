import { format, parseISO, isValid } from 'date-fns';

// Date formatting utilities
export const formatDate = (date: string | Date, formatStr = 'MMM dd, yyyy'): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) {
      return 'Invalid date';
    }
    return format(dateObj, formatStr);
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid date';
  }
};

export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, 'MMM dd, yyyy HH:mm');
};

export const formatTime = (date: string | Date): string => {
  return formatDate(date, 'HH:mm');
};

export const formatRelativeTime = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) {
      return 'Invalid date';
    }
    
    const now = new Date();
    const diffInMs = now.getTime() - dateObj.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    } else {
      const years = Math.floor(diffInDays / 365);
      return `${years} year${years > 1 ? 's' : ''} ago`;
    }
  } catch (error) {
    console.error('Relative time formatting error:', error);
    return 'Invalid date';
  }
};

// Currency formatting utilities
export const formatCurrency = (
  amount: number | string,
  currency = 'RWF',
  locale = 'en-RW'
): string => {
  try {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) {
      return 'Invalid amount';
    }
    // Ensure currency is a valid ISO 4217 3-letter code; fall back to default if not
    const safeCurrency = (typeof currency === 'string' && currency && currency.length === 3)
      ? currency.toUpperCase()
      : 'RWF';

    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: safeCurrency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(numAmount);
    } catch (err) {
      // Fallback: format as plain number with thousands separators
      console.warn('Intl.NumberFormat failed for currency, falling back to number format:', err);
      return numAmount.toLocaleString(locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }
  } catch (error) {
    console.error('Currency formatting error:', error);
    return 'Invalid amount';
  }
};

export const formatAmount = (amount: number | string): string => {
  try {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) {
      return 'Invalid amount';
    }
    
    return new Intl.NumberFormat('en-RW', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount);
  } catch (error) {
    console.error('Amount formatting error:', error);
    return 'Invalid amount';
  }
};

// Phone number formatting
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format for Rwandan numbers (+250)
  if (cleaned.startsWith('250') && cleaned.length === 12) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
  }
  
  // Format for local numbers (07...)
  if (cleaned.startsWith('07') && cleaned.length === 9) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7)}`;
  }
  
  // Return original if no specific format matches
  return phone;
};

// ID number formatting
export const formatIdNumber = (idNumber: string): string => {
  if (!idNumber) return '';
  
  // Format for 16-digit ID numbers (common in Rwanda)
  if (idNumber.length === 16) {
    return `${idNumber.slice(0, 4)} ${idNumber.slice(4, 8)} ${idNumber.slice(8, 12)} ${idNumber.slice(12)}`;
  }
  
  return idNumber;
};

// Percentage formatting
export const formatPercentage = (value: number | string, decimals = 1): string => {
  try {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) {
      return 'Invalid percentage';
    }
    
    return `${numValue.toFixed(decimals)}%`;
  } catch (error) {
    console.error('Percentage formatting error:', error);
    return 'Invalid percentage';
  }
};

// File size formatting
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Duration formatting
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  
  return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
};

// Reference number formatting
export const formatReferenceNumber = (reference: string): string => {
  if (!reference) return '';
  
  // Add hyphens for better readability if it's a long string
  if (reference.length > 10) {
    return `${reference.slice(0, 4)}-${reference.slice(4, 8)}-${reference.slice(8)}`;
  }
  
  return reference;
};

// Status formatting
export const formatStatus = (status: string): string => {
  if (!status) return '';
  
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Payment method formatting
export const formatPaymentMethod = (method: string): string => {
  if (!method) return '';
  
  const methodMap: Record<string, string> = {
    'MOBILE_MONEY': 'Mobile Money',
    'BANK_TRANSFER': 'Bank Transfer',
    'CASH': 'Cash',
    'OTHER': 'Other',
  };
  
  return methodMap[method] || formatStatus(method);
};

// Member type formatting
export const formatMemberType = (type: number): string => {
  const typeMap: Record<number, string> = {
    0: 'Vision 1',
    1: 'Vision 2',
    2: 'Vision 3',
    3: 'Vision 4',
  };
  
  return typeMap[type] || 'Unknown';
};

// Season status formatting
export const formatSeasonStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'ACTIVE': 'Active',
    'ENDED': 'Ended',
    'SCHEDULED': 'Scheduled',
    'PENDING': 'Pending',
  };
  
  return statusMap[status] || formatStatus(status);
};

// Payment status formatting with colors
export const getPaymentStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    'PAID': 'text-green-600 bg-green-100',
    'PENDING': 'text-yellow-600 bg-yellow-100',
    'SKIPPED': 'text-red-600 bg-red-100',
    'SCHEDULED': 'text-blue-600 bg-blue-100',
    'CANCELLED': 'text-gray-600 bg-gray-100',
  };
  
  return colorMap[status] || 'text-gray-600 bg-gray-100';
};

// Season status formatting with colors
export const getSeasonStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    'ACTIVE': 'text-green-600 bg-green-100',
    'ENDED': 'text-gray-600 bg-gray-100',
    'SCHEDULED': 'text-blue-600 bg-blue-100',
    'PENDING': 'text-yellow-600 bg-yellow-100',
  };
  
  return colorMap[status] || 'text-gray-600 bg-gray-100';
};
