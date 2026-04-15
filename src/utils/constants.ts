// API Constants
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    CHANGE_PASSWORD: '/api/auth/change-password',
    VALIDATE: '/api/auth/validate',
    REFRESH: '/api/auth/refresh',
    ME: '/api/auth/me',
  },
  SEASONS: {
    BASE: '/api/seasons',
    WITH_MEMBERS: '/api/seasons/with-members',
    ADD_MEMBERS: (seasonId: string) => `/api/seasons/${seasonId}/add-members`,
    MEMBERS: (seasonId: string) => `/api/seasons/${seasonId}/members`,
    SET_TOP_THREE: (seasonId: string) => `/api/seasons/${seasonId}/set-top-three`,
    RECALCULATE_RANKINGS: (seasonId: string) => `/api/seasons/${seasonId}/recalculate-rankings`,
    REMOVE_MEMBER: (seasonId: string, memberId: string) => `/api/seasons/${seasonId}/remove-member/${memberId}`,
    REMOVE_MEMBERS: (seasonId: string) => `/api/seasons/${seasonId}/remove-members`,
    REMOVE_UNPAID_MEMBERS: (seasonId: string) => `/api/seasons/${seasonId}/remove-unpaid-members`,
    END: (seasonId: string) => `/api/seasons/${seasonId}/end`,
  },
  PAYMENTS: {
    BASE: '/api/payments',
    RANKINGS: (seasonId: string) => `/api/payments/season/${seasonId}/rankings`,
    NEXT_MEMBER: (seasonId: string) => `/api/payments/season/${seasonId}/next-member`,
    PROCESS: (seasonId: string) => `/api/payments/season/${seasonId}/process`,
    SCHEDULE: (seasonId: string) => `/api/payments/season/${seasonId}/schedule`,
    STATUS: (seasonId: string) => `/api/payments/season/${seasonId}/status`,
    SET_TOP_THREE: (seasonId: string) => `/api/payments/season/${seasonId}/top-three`,
    RESET_CIRCLE: (seasonId: string) => `/api/payments/season/${seasonId}/reset-circle`,
    HISTORY: (seasonId: string) => `/api/payments/season/${seasonId}/history`,
    PAYOUT: (payoutId: string) => `/api/payments/payout/${payoutId}`,
  },
  MEMBERS: {
    BASE: '/api/members',
    UPLOAD: '/api/members/upload',
    ADD_MEMBER: '/api/members/add-member',
    ASSIGN_CARD: (memberId: string) => `/api/members/${memberId}/assign-card`,
    UNASSIGN_CARD: (memberId: string) => `/api/members/${memberId}/unassign-card`,
    FIND_BY_CARD: (card: string) => `/api/members/find-by-card/${card}`,
    CONTRIBUTIONS: (memberId: string) => `/api/members/${memberId}/contributions`,
    CONTRIBUTIONS_FROM_START_DATE: (memberId: string) => `/api/members/${memberId}/contributions-from-start-date`,
    CONTRIBUTIONS_BY_DATE_RANGE: (memberId: string) => `/api/members/${memberId}/contributions-by-date-range`,
    HISTORY: (memberId: string) => `/api/members/${memberId}/history`,
    RESET_START_DATE: (memberId: string) => `/api/members/${memberId}/reset-start-date`,
    SEARCH: '/api/members/search',
    STATISTICS: (memberId: string) => `/api/members/${memberId}/statistics`,
  },
  CONTRIBUTIONS: {
    BASE: '/api/contributions',
    SUMMARY: '/api/contributions/summary',
    CHECK: '/api/contributions/check',
    DAILY_PATTERNS: (seasonId: string) => `/api/contributions/daily-patterns/${seasonId}`,
    STATISTICS: '/api/contributions/statistics',
    EXPORT: '/api/contributions/export',
    BULK_APPROVE: '/api/contributions/bulk-approve',
    BULK_REJECT: '/api/contributions/bulk-reject',
  },
  ORGANIZATIONS: {
    BASE: '/api/organizations',
    CURRENT: '/api/organizations/current',
    STATISTICS: '/api/organizations/statistics',
    PERFORMANCE: '/api/organizations/performance',
    MEMBER_STATS: '/api/organizations/member-stats',
    SEASONAL_COMPARISON: '/api/organizations/seasonal-comparison',
    EXPORT: '/api/organizations/export',
    SETTINGS: '/api/organizations/settings',
  },
} as const;

// Status Constants
export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  SKIPPED: 'SKIPPED',
  SCHEDULED: 'SCHEDULED',
  CANCELLED: 'CANCELLED',
} as const;

export const SEASON_STATUS = {
  ACTIVE: 'ACTIVE',
  ENDED: 'ENDED',
  SCHEDULED: 'SCHEDULED',
  PENDING: 'PENDING',
} as const;

export const CONTRIBUTION_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
} as const;

export const MEMBER_TYPE = {
  REGULAR: 0,
  PREMIUM: 1,
  VIP: 2,
} as const;

export const PAYMENT_METHOD = {
  MOBILE_MONEY: 'MOBILE_MONEY',
  BANK_TRANSFER: 'BANK_TRANSFER',
  CASH: 'CASH',
  OTHER: 'OTHER',
} as const;

// Currency Constants
export const CURRENCIES = {
  RWF: { code: 'RWF', name: 'Rwandan Franc', symbol: 'RWF' },
  USD: { code: 'USD', name: 'US Dollar', symbol: '$' },
  EUR: { code: 'EUR', name: 'Euro', symbol: 'EUR' },
  GBP: { code: 'GBP', name: 'British Pound', symbol: '£' },
} as const;

// Date Constants
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_WITH_TIME: 'MMM dd, yyyy HH:mm',
  INPUT: 'yyyy-MM-dd',
  INPUT_WITH_TIME: "yyyy-MM-dd'T'HH:mm",
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
} as const;

// Pagination Constants
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZES: [10, 20, 50, 100],
  MAX_PAGE_SIZE: 100,
} as const;

// File Upload Constants
export const FILE_UPLOAD = {
  MAX_SIZE_MB: 10,
  ALLOWED_TYPES: {
    EXCEL: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    CSV: 'text/csv',
  },
  ALLOWED_EXTENSIONS: ['.xlsx', '.csv'],
} as const;

// Toast Notification Types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
  LANGUAGE: 'language',
  LAST_VISITED_PAGE: 'last_visited_page',
} as const;

// Route Paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  MEMBERS: '/members',
  SEASONS: '/seasons',
  PAYMENTS: '/payments',
  CONTRIBUTIONS: '/contributions',
  ORGANIZATION: '/organization',
  SETTINGS: '/settings',
  PROFILE: '/profile',
  NOT_FOUND: '/404',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied. You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  FILE_TOO_LARGE: 'File size exceeds the maximum allowed limit.',
  INVALID_FILE_TYPE: 'Invalid file type. Please upload a valid file.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  GENERIC_ERROR: 'An error occurred. Please try again.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logged out successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  MEMBER_CREATED: 'Member created successfully',
  MEMBER_UPDATED: 'Member updated successfully',
  MEMBER_DELETED: 'Member deleted successfully',
  SEASON_CREATED: 'Season created successfully',
  SEASON_UPDATED: 'Season updated successfully',
  SEASON_DELETED: 'Season deleted successfully',
  PAYMENT_PROCESSED: 'Payment processed successfully',
  CONTRIBUTION_RECORDED: 'Contribution recorded successfully',
  FILE_UPLOADED: 'File uploaded successfully',
  SETTINGS_SAVED: 'Settings saved successfully',
} as const;

// Loading Messages
export const LOADING_MESSAGES = {
  AUTHENTICATING: 'Authenticating...',
  LOADING: 'Loading...',
  SAVING: 'Saving...',
  DELETING: 'Deleting...',
  UPLOADING: 'Uploading...',
  PROCESSING: 'Processing...',
  SEARCHING: 'Searching...',
} as const;

// Validation Messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number',
  INVALID_ID: 'Please enter a valid ID number',
  INVALID_AMOUNT: 'Please enter a valid amount',
  INVALID_DATE: 'Please enter a valid date',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters',
  PASSWORDS_NOT_MATCH: 'Passwords do not match',
  FILE_TOO_LARGE: `File size must be less than ${FILE_UPLOAD.MAX_SIZE_MB}MB`,
  INVALID_FILE_TYPE: 'Please upload a valid file type',
} as const;

// Chart Colors
export const CHART_COLORS = {
  PRIMARY: '#3b82f6',
  SUCCESS: '#22c55e',
  WARNING: '#f59e0b',
  DANGER: '#ef4444',
  INFO: '#06b6d4',
  PURPLE: '#8b5cf6',
  PINK: '#ec4899',
  GRAY: '#6b7280',
} as const;

// Breakpoints for responsive design
export const BREAKPOINTS = {
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  '2XL': '1536px',
} as const;

// Animation durations
export const ANIMATION_DURATIONS = {
  FAST: '150ms',
  NORMAL: '300ms',
  SLOW: '500ms',
} as const;

// Z-index values
export const Z_INDEX = {
  DROPDOWN: 1000,
  MODAL: 1050,
  TOOLTIP: 1070,
  TOAST: 1080,
} as const;
