// User Roles
export type UserRole = 'USER' | 'ADMIN' | 'OWNER' | 'PARTNER';

// User Status
export type UserStatus = 'ACTIVE' | 'BLOCKED';

// Partner Integration Types
export type PartnerIntegrationType = 'API' | 'CABINET' | 'CSV';

// Partner / Device Statuses
export type DeviceStatus = 'ACTIVE' | 'PAID' | 'BLOCKED';

// Verification User Facing Result Codes
export type VerificationResultCode =
  | 'ACTIVE_INSTALLMENT'
  | 'CLEAR'
  | 'PROVIDER_UNAVAILABLE'
  | 'INVALID_IMEI';

// Internal Normalized Status
export type InternalVerificationStatus =
  | 'PROCESSING'
  | 'CLEAR'
  | 'ACTIVE_INSTALLMENT'
  | 'INVALID_IMEI'
  | 'PROVIDER_UNAVAILABLE'
  | 'PROVIDER_ERROR'
  | 'UNKNOWN';

// Package Status
export type PackageStatus = 'ACTIVE' | 'INACTIVE';

// Payment Status
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'REFUNDED';

// Payment Provider
export type PaymentProvider = 'PAYME' | 'CLICK' | 'UZUM' | 'MOCK';

// Credit Transaction Types
export type CreditTransactionType =
  | 'PACKAGE_PURCHASE'
  | 'VERIFICATION_DEDUCTION'
  | 'ADMIN_ADJUSTMENT'
  | 'REFUND';

// Audit Log Actions
export type AuditAction =
  | 'ADMIN_LOGIN'
  | 'USER_STATUS_CHANGED'
  | 'PARTNER_STATUS_CHANGED'
  | 'PACKAGE_CHANGED'
  | 'PAYMENT_STATUS_CHANGED'
  | 'CREDIT_ADJUSTMENT'
  | 'PARTNER_DEVICE_STATUS_CHANGED'
  | 'CSV_IMPORT';

// Public User Response for Verification
export interface PublicVerificationResponse {
  requestId: string;
  result: VerificationResultCode;
  title: string;
  message: string;
  partnerName?: string; // only if FOUND + ACTIVE and business policy allows
  maskedImei: string;
  verifiedAt: string;
  creditsRemaining: number;
}

// Internal Normalized Result from Partner Adapter
export interface NormalizedPartnerResult {
  partnerId: string;
  partnerName: string;
  sourceType: PartnerIntegrationType;
  found: boolean;
  status?: DeviceStatus;
  latencyMs: number;
  rawError?: string;
  isAuthoritative: boolean;
}

// User Verification History Item
export interface VerificationHistoryItem {
  id: string;
  maskedImei: string;
  result: VerificationResultCode;
  partnerName?: string;
  createdAt: string;
}

// Credit Package
export interface PackageDto {
  id: string;
  name: string;
  credits: number;
  price: number;
  status: PackageStatus;
  sortOrder: number;
  description?: string;
}
