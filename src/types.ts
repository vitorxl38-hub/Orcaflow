/**
 * Types for OrçaFlow SaaS Platform
 */

export enum PlanType {
  FREE = "FREE",
  PRO = "PRO",
  BUSINESS = "BUSINESS"
}

export enum UserRole {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
  VIEWER = "VIEWER"
}

export enum BudgetStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  DECLINED = "DECLINED",
  IN_PROGRESS = "IN_PROGRESS"
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string; // "USER" or "SUPER_ADMIN" (SaaS admin)
}

export interface WorkspaceMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  joinedAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  niche: string;
  phone?: string;
  email?: string;
  address?: string;
  cnpj?: string; // Company CNPJ registration
  logoUrl?: string; // custom logo
  brandColor?: string; // primary visual color picker (e.g. #3b82f6)
  pixKey?: string; // PIX key for QR generator
  ownerId: string;
}

export interface BudgetItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number; // item specific percentage or absolute
}

export interface BudgetHistoryEntry {
  id: string;
  status: BudgetStatus;
  changedBy: string;
  timestamp: string;
  comment?: string;
}

export interface Budget {
  id: string;
  workspaceId: string;
  number: string; // e.g. "ORC-2026-001"
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  clientAddress?: string;
  items: BudgetItem[];
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number; // overall discount
  subtotal: number;
  total: number;
  observations?: string;
  validityDays: number;
  paymentTerms: string;
  status: BudgetStatus;
  createdAt: string;
  updatedAt: string;
  nicheTemplate?: string; // custom styling template flag e.g. "electrician", "general", "designer"
  providerSignature?: string; // name or image representation
  clientSignature?: string; // signature path data SVG / canvas representation
  clientSignatureName?: string;
  clientSignatureDate?: string;
  paymentLink?: string; // generated Mock link
}

export interface MetricSummary {
  mrr: number;
  subscribers: number;
  churnRate: number;
  conversionRate: number;
  budgetCount: number;
  revenueHistory: { month: string; value: number }[];
  planDistribution: { name: string; count: number; color: string }[];
  nicheDistribution: { niche: string; count: number }[];
}

export interface SaaSAdminData {
  metrics: MetricSummary;
  users: {
    id: string;
    name: string;
    email: string;
    plan: PlanType;
    status: "ACTIVE" | "PAST_DUE" | "CANCELED";
    companyName: string;
    createdAt: string;
  }[];
  workspaces: {
    id: string;
    name: string;
    niche: string;
    memberCount: number;
    budgetCount: number;
  }[];
}

export interface TemplateNiche {
  id: string;
  name: string;
  niche: string;
  description: string;
  items: { description: string; quantity: number; unitPrice: number }[];
  observations: string;
}

export interface CatalogService {
  id: string;
  workspaceId: string;
  description: string;
  unitPrice: number;
}

