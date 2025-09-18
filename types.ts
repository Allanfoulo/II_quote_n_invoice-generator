
export enum Role {
  Admin = 'admin',
  Sales = 'sales',
  Viewer = 'viewer',
}

export enum ItemType {
  Fixed = 'fixed',
  Hourly = 'hourly',
  Expense = 'expense',
}

export enum QuoteStatus {
  Draft = 'draft',
  Sent = 'sent',
  Accepted = 'accepted',
  Declined = 'declined',
  Expired = 'expired',
}

export enum InvoiceStatus {
  Draft = 'draft',
  Sent = 'sent',
  PartiallyPaid = 'partially_paid',
  Paid = 'paid',
  Overdue = 'overdue',
}

export type Page = 'dashboard' | 'quotes' | 'invoices' | 'clients' | 'settings';

export interface CompanySettings {
  id: string;
  companyName: string;
  address: string;
  email: string;
  phone: string;
  logoUrl: string | null;
  currency: string;
  vatPercentage: number;
  numberingFormatInvoice: string;
  numberingFormatQuote: string;
  nextInvoiceNumber: number;
  nextQuoteNumber: number;
  termsText: string;
  paymentInstructions: PaymentInstructions;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  billingAddress: string;
  deliveryAddress: string;
  vatNumber?: string;
  phone: string;
}

export interface Item {
  id: string;
  description: string;
  unitPrice: number;
  qty: number;
  taxable: boolean;
  itemType: ItemType;
  unit: string;
}

export interface Package {
  id: string;
  name: string;
  description: string;
  items: Omit<Item, 'id'>[];
  priceExclVat: number;
  priceInclVat: number;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  createdByUserId: string;
  dateIssued: string;
  validUntil: string;
  clientId: string;
  items: Item[];
  subtotalExclVat: number;
  vatAmount: number;
  totalInclVat: number;
  depositPercentage: number;
  depositAmount: number;
  balanceRemaining: number;
  status: QuoteStatus;
  termsText: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentInstructions {
  bank: string;
  accountName: string;
  accountNumber: string;
  branchCode: string;
  swift: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  createdByUserId: string;
  dateIssued: string;
  dueDate: string;
  clientId: string;
  items: Item[];
  subtotalExclVat: number;
  vatAmount: number;
  totalInclVat: number;
  depositRequired: boolean;
  depositAmount: number;
  balanceRemaining: number;
  status: InvoiceStatus;
  paymentInstructions: PaymentInstructions;
  createdFromQuoteId: string | null;
  createdAt: string;
  updatedAt: string;
}
