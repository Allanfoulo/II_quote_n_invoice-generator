
import { CompanySettings, Client, Package, Quote, Invoice, Role, ItemType, QuoteStatus, InvoiceStatus } from './types';

export const INITIAL_COMPANY_SETTINGS: CompanySettings = {
  id: 'cs1',
  companyName: 'Innovation Imperial',
  address: '123 Tech Avenue, Silicon Valley, 94043',
  email: 'contact@innovationimperial.com',
  phone: '+1 (555) 123-4567',
  logoUrl: 'https://picsum.photos/seed/logo/200/50',
  currency: 'ZAR',
  vatPercentage: 15,
  numberingFormatInvoice: 'INV-{YYYY}-{seq:04d}',
  numberingFormatQuote: 'QT-{YYYY}-{seq:04d}',
  nextQuoteNumber: 2,
  nextInvoiceNumber: 2,
  termsText: "Work performed will be strictly in accordance with the approved Spec Sheet provided by the client. A 40% deposit is due within 3 business days of invoice receipt and work will only commence upon confirmation of deposit. Final balance is due within 3 business days of project completion notification. Change requests outside the approved Spec Sheet will be quoted and billed separately. Three months of post-delivery support is included; thereafter support will incur charges based on query complexity.",
  paymentInstructions: {
    bank: 'FNB',
    accountName: 'Sage Capital Labs',
    accountNumber: '63053388782',
    branchCode: '250655',
    swift: 'FIRNZAJJXXX',
  }
};

export const MOCK_USERS = [
  { id: 'user1', name: 'Alex Admin', email: 'alex@innovationimperial.com', role: Role.Admin },
  { id: 'user2', name: 'Sam Sales', email: 'sam@innovationimperial.com', role: Role.Sales },
];

export const MOCK_CLIENTS: Client[] = [
  { id: 'client1', name: 'Contas', company: 'Contas Inc.', email: 'billing@contas.com', billingAddress: 'Waterfall Ridge, Vorna Valley, Midrand', deliveryAddress: 'Waterfall Ridge, Vorna Valley, Midrand', phone: '+27 11 555 1234', vatNumber: '4123456789' },
  { id: 'client2', name: 'John Doe', company: 'JD Enterprises', email: 'john.doe@jdenterprises.com', billingAddress: '456 Business Blvd, Sandton, Johannesburg', deliveryAddress: '456 Business Blvd, Sandton, Johannesburg', phone: '+27 11 555 5678' },
];

export const MOCK_PACKAGES: Package[] = [
    {
        id: 'pkg1',
        name: 'Starter Website Package',
        description: '1 x Landing page, Basic CMS setup, 1 month basic support, Development server.',
        priceInclVat: 10000.00,
        priceExclVat: 8695.65,
        items: [
            { description: 'Landing Page Design & Development', unitPrice: 6521.74, qty: 1, taxable: true, itemType: ItemType.Fixed, unit: 'unit' },
            { description: 'Basic CMS Setup', unitPrice: 1304.35, qty: 1, taxable: true, itemType: ItemType.Fixed, unit: 'unit' },
            { description: '1 Month Basic Support', unitPrice: 869.56, qty: 1, taxable: true, itemType: ItemType.Fixed, unit: 'unit' },
        ]
    },
    {
        id: 'pkg2',
        name: 'Growth Website + PM',
        description: 'Up to 5 pages, CMS, Product/Service listing, Project Management module, Dev + Production server, 3 months support.',
        priceInclVat: 25000.00,
        priceExclVat: 21739.13,
        items: [
            { description: 'Website Design & Development (up to 5 pages)', unitPrice: 15217.39, qty: 1, taxable: true, itemType: ItemType.Fixed, unit: 'unit' },
            { description: 'Product/Service Listing Module', unitPrice: 3478.26, qty: 1, taxable: true, itemType: ItemType.Fixed, unit: 'unit' },
            { description: 'Project Management Module', unitPrice: 2173.91, qty: 1, taxable: true, itemType: ItemType.Fixed, unit: 'unit' },
            { description: '3 Months Growth Support', unitPrice: 869.57, qty: 1, taxable: true, itemType: ItemType.Fixed, unit: 'unit' },
        ]
    },
     {
        id: 'pkg3',
        name: 'Full Platform + Integration',
        description: 'Custom storefront or web app, advanced integration, deployment, 3 months support + 6 months option, SLA add-on.',
        priceInclVat: 50000.00,
        priceExclVat: 43478.26,
        items: [
            { description: 'Custom Web Application Development', unitPrice: 30434.78, qty: 1, taxable: true, itemType: ItemType.Fixed, unit: 'unit' },
            { description: 'Advanced API Integration', unitPrice: 8695.65, qty: 1, taxable: true, itemType: ItemType.Fixed, unit: 'unit' },
            { description: 'Deployment & Configuration', unitPrice: 2173.91, qty: 1, taxable: true, itemType: ItemType.Fixed, unit: 'unit' },
            { description: '3 Months Enterprise Support', unitPrice: 2173.92, qty: 1, taxable: true, itemType: ItemType.Fixed, unit: 'unit' },
        ]
    }
];

export const MOCK_QUOTES: Quote[] = [
  {
    id: 'quote1',
    quoteNumber: 'QT-2024-0001',
    createdByUserId: 'user2',
    dateIssued: '2024-11-20',
    validUntil: '2024-12-20',
    clientId: 'client1',
    items: [
      { id: 'item1', description: 'Development server', unitPrice: 1500.00, qty: 1, taxable: true, itemType: ItemType.Fixed, unit: 'unit' },
      { id: 'item2', description: 'Project Management Module', unitPrice: 15000.00, qty: 1, taxable: true, itemType: ItemType.Fixed, unit: 'unit' }
    ],
    subtotalExclVat: 16500.00,
    vatAmount: 2475.00,
    totalInclVat: 18975.00,
    depositPercentage: 40,
    depositAmount: 7590.00,
    balanceRemaining: 11385.00,
    status: QuoteStatus.Accepted,
    termsText: INITIAL_COMPANY_SETTINGS.termsText,
    notes: 'Initial quote for project kickoff.',
    createdAt: '2024-11-20T10:00:00Z',
    updatedAt: '2024-11-22T14:30:00Z',
  }
];


export const MOCK_INVOICES: Invoice[] = [
  {
    id: 'inv1',
    invoiceNumber: 'INV-2024-0001',
    createdByUserId: 'user2',
    dateIssued: '2024-11-22',
    dueDate: '2024-11-27',
    clientId: 'client1',
    items: [
      { id: 'item1', description: 'Development server', unitPrice: 1500.00, qty: 1, taxable: true, itemType: ItemType.Fixed, unit: 'unit' },
      { id: 'item2', description: 'Project Management Module', unitPrice: 15000.00, qty: 1, taxable: true, itemType: ItemType.Fixed, unit: 'unit' }
    ],
    subtotalExclVat: 16500.00,
    vatAmount: 2475.00,
    totalInclVat: 18975.00,
    depositRequired: true,
    depositAmount: 7590.00,
    balanceRemaining: 11385.00,
    status: InvoiceStatus.Sent,
    paymentInstructions: INITIAL_COMPANY_SETTINGS.paymentInstructions,
    createdFromQuoteId: 'quote1',
    createdAt: '2024-11-22T14:30:00Z',
    updatedAt: '2024-11-22T14:30:00Z',
  }
];
