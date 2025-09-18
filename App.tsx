
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import type { Page, CompanySettings, Client, Quote, Invoice, Item, Package, User, Role, PaymentInstructions } from './types';
import { ItemType, QuoteStatus, InvoiceStatus } from './types';
import { INITIAL_COMPANY_SETTINGS, MOCK_CLIENTS, MOCK_QUOTES, MOCK_INVOICES, MOCK_PACKAGES, MOCK_USERS } from './constants';

// --- UTILITY FUNCTIONS ---
const formatDate = (dateStr: string | Date) => new Date(dateStr).toLocaleDateString('en-CA');
const formatCurrency = (amount: number, currency = 'ZAR') => new Intl.NumberFormat('en-ZA', { style: 'currency', currency }).format(amount);

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const getTodayDateString = () => new Date().toISOString().split('T')[0];

const generateDocumentNumber = (format: string, sequence: number): string => {
  const year = new Date().getFullYear();
  return format
    .replace('{YYYY}', year.toString())
    .replace('{seq:04d}', sequence.toString().padStart(4, '0'));
};


// --- ICONS ---
const Icon: React.FC<{ path: string; className?: string }> = ({ path, className = 'w-6 h-6' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d={path} clipRule="evenodd" />
  </svg>
);

const Icons = {
  Dashboard: <Icon path="M10.5 4.5a.75.75 0 00-1.5 0v15a.75.75 0 001.5 0v-15zM3.75 6a.75.75 0 00-1.5 0v12a.75.75 0 001.5 0v-12zM17.25 4.5a.75.75 0 00-1.5 0v15a.75.75 0 001.5 0v-15zM21 9a.75.75 0 00-1.5 0v9a.75.75 0 001.5 0v-9z" />,
  Quotes: <Icon path="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a.375.375 0 01-.375-.375V6.75A3.75 3.75 0 009 3H5.625zM12.75 6.136a.75.75 0 011.06 0l3.374 3.375a.75.75 0 01-1.06 1.06L13.5 7.939V15a.75.75 0 01-1.5 0V7.939l-2.624 2.625a.75.75 0 01-1.06-1.06l3.374-3.375z" />,
  Invoices: <Icon path="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9c0-.621-.504-1.125-1.125-1.125h-4.5A2.625 2.625 0 0010.125 2.25zM10.125 4.5c0-.414.336-.75.75-.75h3.75a.75.75 0 01.75.75v3.75c0 .414-.336.75-.75.75h-3.75a.75.75 0 01-.75-.75V4.5z" />,
  Clients: <Icon path="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-1.063c.254-.116.398-.396.398-.684A2.625 2.625 0 0019.375 15H15v4.128zM10.5 15a2.625 2.625 0 00-2.625-2.625H4.625A2.625 2.625 0 002 15c0 .288.144.568.398.684A9.337 9.337 0 006.525 16.75a9.38 9.38 0 002.625.372V15zM12 12.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" />,
  Settings: <Icon path="M9.594 3.94c.09-.542.56-1.008 1.11-1.212l.942-.314a1.875 1.875 0 011.97 0l.942.314c.55.204 1.02.67 1.11 1.212l.194.982a1.875 1.875 0 001.97 1.97l.982.194c.542.09.95.49 1.11 1.02l.314.942a1.875 1.875 0 010 1.97l-.314.942c-.16.53-.57.93-1.11 1.02l-.982.194a1.875 1.875 0 00-1.97 1.97l-.194.982c-.09.542-.56 1.008-1.11 1.212l-.942.314a1.875 1.875 0 01-1.97 0l-.942-.314c-.55-.204-1.02-.67-1.11-1.212l-.194-.982a1.875 1.875 0 00-1.97-1.97l-.982-.194c-.542-.09-.95-.49-1.11-1.02l-.314-.942a1.875 1.875 0 010-1.97l.314.942c.16-.53.57.93 1.11-1.02l.982-.194a1.875 1.875 0 001.97-1.97l.194-.982zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" />,
  Plus: <Icon path="M12 4.5v15m7.5-7.5h-15" className="w-5 h-5" />,
  Trash: <Icon path="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" className="w-5 h-5" />,
  PDF: <Icon path="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" className="w-5 h-5" />,
  Save: <Icon path="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" className="w-5 h-5" />,
  ChevronDoubleLeft: <Icon path="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" className="w-5 h-5" />,
  ChevronDoubleRight: <Icon path="M5.25 4.5l7.5 7.5-7.5 7.5m6-15l7.5 7.5-7.5 7.5" className="w-5 h-5" />,
  Menu: <Icon path="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />,
  X: <Icon path="M6.28 5.22a.75.75 0 00-1.06 1.06L10.94 12l-5.72 5.72a.75.75 0 101.06 1.06L12 13.06l5.72 5.72a.75.75 0 101.06-1.06L13.06 12l5.72-5.72a.75.75 0 00-1.06-1.06L12 10.94 6.28 5.22z" />,
};


// --- PDF PREVIEW COMPONENT ---
interface PdfPreviewProps {
  doc: Quote | Invoice;
  settings: CompanySettings;
  client: Client;
  type: 'Quote' | 'Invoice';
  onRendered?: () => void;
}

const QuoteInvoicePDF: React.FC<PdfPreviewProps> = ({ doc, settings, client, type, onRendered }) => {
  const isInvoice = type === 'Invoice';
  const invoice = isInvoice ? (doc as Invoice) : null;
  const quote = !isInvoice ? (doc as Quote) : null;
  const depositDue = isInvoice && invoice?.depositRequired ? invoice.depositAmount : quote?.depositAmount;
  const logoRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const renderedCallback = () => {
      if (onRendered) {
        onRendered();
      }
    };
    
    if (settings.logoUrl && logoRef.current) {
      if (logoRef.current.complete) {
        renderedCallback();
      } else {
        logoRef.current.onload = renderedCallback;
        logoRef.current.onerror = renderedCallback; 
      }
    } else {
      requestAnimationFrame(renderedCallback);
    }
  }, [onRendered, settings.logoUrl]);


  return (
    <div className="bg-white p-12 w-[210mm] min-h-[297mm] text-[#0F0F0F] font-sans flex flex-col" id="pdf-content">
      <header className="flex justify-between items-start pb-4 border-b-4 border-[#D1C5DC]">
        <div>
          {settings.logoUrl ? (
            <img ref={logoRef} src={settings.logoUrl} alt={`${settings.companyName} Logo`} className="h-12" />
          ) : (
            <h1 className="text-2xl font-bold text-[#0F0F0F]">{settings.companyName}</h1>
          )}
        </div>
        <div className="text-right text-xs text-[#6B6B6B]">
          <p>{settings.address}</p>
          <p>{settings.email}</p>
          <p>{settings.phone}</p>
        </div>
      </header>

      <main className="mt-12 flex-grow">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-sm font-semibold text-[#6B6B6B] mb-2">BILL TO</h2>
            <p className="font-bold">{client.name}</p>
            <p>{client.company}</p>
            <p>{client.billingAddress}</p>
            {client.vatNumber && <p>VAT No: {client.vatNumber}</p>}
          </div>
          <div className="text-right">
            <h1 className="text-4xl font-bold text-[#0F0F0F] mb-4">{type.toUpperCase()}</h1>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <span className="font-semibold text-[#6B6B6B]">{type} #</span>
              <span className="text-[#0F0F0F]">{isInvoice ? invoice?.invoiceNumber : quote?.quoteNumber}</span>
              <span className="font-semibold text-[#6B6B6B]">Date Issued</span>
              <span className="text-[#0F0F0F]">{formatDate(doc.dateIssued)}</span>
              <span className="font-semibold text-[#6B6B6B]">{isInvoice ? "Due Date" : "Valid Until"}</span>
              <span className="text-[#0F0F0F]">{isInvoice ? formatDate(invoice!.dueDate) : formatDate(quote!.validUntil)}</span>
              <span className="font-semibold text-[#6B6B6B]">Status</span>
              <span className="text-[#0F0F0F] capitalize">{doc.status.replace(/_/g, ' ')}</span>
            </div>
          </div>
        </div>
        
        <table className="w-full mt-12 border-collapse">
          <thead>
            <tr className="border-b-2 border-[#D1C5DC]">
              <th className="text-left font-semibold p-2 text-sm text-[#6B6B6B]">DESCRIPTION</th>
              <th className="text-right font-semibold p-2 text-sm text-[#6B6B6B]">UNIT</th>
              <th className="text-right font-semibold p-2 text-sm text-[#6B6B6B]">QTY</th>
              <th className="text-right font-semibold p-2 text-sm text-[#6B6B6B]">UNIT PRICE ({settings.currency})</th>
              <th className="text-right font-semibold p-2 text-sm text-[#6B6B6B]">AMOUNT ({settings.currency})</th>
            </tr>
          </thead>
          <tbody>
            {doc.items.map((item, index) => (
              <tr key={index} className="border-b border-gray-200">
                <td className="p-2 text-[#0F0F0F]">{item.description}</td>
                <td className="p-2 text-right text-[#6B6B6B]">{item.unit}</td>
                <td className="p-2 text-right text-[#6B6B6B]">{item.qty}</td>
                <td className="p-2 text-right text-[#6B6B6B]">{item.unitPrice.toFixed(2)}</td>
                <td className="p-2 text-right text-[#0F0F0F] font-medium">{(item.qty * item.unitPrice).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mt-8">
          <div className="w-1/2">
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <span className="text-[#6B6B6B]">Subtotal</span>
              <span className="text-right text-[#0F0F0F]">{formatCurrency(doc.subtotalExclVat, settings.currency)}</span>
              <span className="text-[#6B6B6B]">VAT @ {settings.vatPercentage}%</span>
              <span className="text-right text-[#0F0F0F]">{formatCurrency(doc.vatAmount, settings.currency)}</span>
              <span className="font-bold text-lg text-[#0F0F0F]">Total</span>
              <span className="text-right font-bold text-lg text-[#0F0F0F]">{formatCurrency(doc.totalInclVat, settings.currency)}</span>
            </div>
            {depositDue && depositDue > 0 && (
              <div className="mt-6 p-4 bg-[#7A4CA6] text-white rounded-lg text-center">
                <p className="text-sm">DEPOSIT DUE</p>
                <p className="text-2xl font-bold">{formatCurrency(depositDue, settings.currency)}</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="w-full mt-8 pt-4 border-t">
        {isInvoice && (
          <div className="mb-4">
            <h3 className="font-semibold text-sm mb-2">Payment Instructions</h3>
            <div className="text-xs text-[#6B6B6B] grid grid-cols-2 gap-x-4">
                <span>Bank:</span> <span>{settings.paymentInstructions.bank}</span>
                <span>Account Name:</span> <span>{settings.paymentInstructions.accountName}</span>
                <span>Account Number:</span> <span>{settings.paymentInstructions.accountNumber}</span>
                <span>Branch Code:</span> <span>{settings.paymentInstructions.branchCode}</span>
            </div>
          </div>
        )}
        <p className="text-xs text-[#6B6B6B]">
          {settings.termsText}
        </p>
        <p className="text-xs text-[#6B6B6B] mt-2">Full Service Agreement available on request.</p>
      </footer>
    </div>
  );
};


// --- PDF GENERATOR ---
const generatePdf = (doc: Quote | Invoice, settings: CompanySettings, client: Client, type: 'Quote' | 'Invoice') => {
  const { jsPDF } = (window as any).jspdf;
  const pdfContainer = document.getElementById('pdf-container');
  if (!pdfContainer) return;
  
  const root = ReactDOM.createRoot(pdfContainer);
  
  const onRendered = async () => {
    const content = document.getElementById('pdf-content');
    if (content) {
      try {
        const canvas = await (window as any).html2canvas(content, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        
        const fileName = `${type}-${isInvoice(doc) ? doc.invoiceNumber : doc.quoteNumber}.pdf`;
        pdf.save(fileName);
      } catch (error) {
        console.error("Error generating PDF:", error);
      } finally {
        root.unmount();
      }
    } else {
      root.unmount();
    }
  };

  root.render(<QuoteInvoicePDF doc={doc} settings={settings} client={client} type={type} onRendered={onRendered} />);
};

function isInvoice(doc: Quote | Invoice): doc is Invoice {
    return 'invoiceNumber' in doc;
}


// --- REUSABLE UI COMPONENTS ---

const StatusBadge: React.FC<{ status: QuoteStatus | InvoiceStatus }> = ({ status }) => {
  // Fix: Removed duplicate keys for 'draft' and 'sent' statuses.
  // QuoteStatus and InvoiceStatus enums share string values for 'draft' and 'sent',
  // which caused duplicate keys in the object literal.
  const colorClasses: Record<string, string> = {
    [QuoteStatus.Draft]: 'bg-gray-200 text-gray-800',
    [QuoteStatus.Sent]: 'bg-blue-100 text-blue-800',
    [QuoteStatus.Accepted]: 'bg-green-100 text-green-800',
    [QuoteStatus.Declined]: 'bg-red-100 text-red-800',
    [QuoteStatus.Expired]: 'bg-yellow-100 text-yellow-800',
    [InvoiceStatus.PartiallyPaid]: 'bg-purple-100 text-purple-800',
    [InvoiceStatus.Paid]: 'bg-green-100 text-green-800',
    [InvoiceStatus.Overdue]: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${colorClasses[status]}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
};

const InputField: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; type?: string; rows?: number }> = 
({ label, value, onChange, type = 'text', rows }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        {type === 'textarea' ? (
             <textarea value={value} onChange={onChange} rows={rows} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
        ) : (
            <input type={type} value={value} onChange={onChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
        )}
    </div>
);


// --- PAGE COMPONENTS ---

const DashboardPage: React.FC<{
  quotes: Quote[];
  invoices: Invoice[];
  onNewQuote: () => void;
}> = ({ quotes, invoices, onNewQuote }) => {
    const openQuotes = quotes.filter(q => q.status === QuoteStatus.Sent).length;
    const outstandingDeposits = invoices.filter(i => i.status === InvoiceStatus.Sent && i.depositRequired).length;
    const overdueInvoices = invoices.filter(i => i.status === InvoiceStatus.Overdue).length;

    const kpis = [
        { title: 'Total Quotes', value: quotes.length, color: 'text-blue-500' },
        { title: 'Open Quotes', value: openQuotes, color: 'text-purple-500' },
        { title: 'Outstanding Deposits', value: outstandingDeposits, color: 'text-yellow-500' },
        { title: 'Overdue Invoices', value: overdueInvoices, color: 'text-red-500' },
    ];
    
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mt-6">
                {kpis.map(kpi => (
                    <div key={kpi.title} className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-sm font-medium text-gray-500">{kpi.title}</h2>
                        <p className={`text-4xl font-bold mt-2 ${kpi.color}`}>{kpi.value}</p>
                    </div>
                ))}
            </div>
             <div className="mt-8">
                <button
                    onClick={onNewQuote}
                    className="flex items-center gap-2 px-4 py-2 bg-[#7A4CA6] text-white rounded-lg shadow-sm hover:bg-[#693d91] transition-colors"
                >
                    {Icons.Plus} New Quote
                </button>
            </div>
        </div>
    );
};


const QuoteEditor: React.FC<{
    quote: Quote;
    clients: Client[];
    settings: CompanySettings;
    packages: Package[];
    onSave: (quote: Quote) => void;
    onCancel: () => void;
}> = ({ quote: initialQuote, clients, settings, packages, onSave, onCancel }) => {
    const [quote, setQuote] = useState(initialQuote);
    const [showPdfPreview, setShowPdfPreview] = useState(false);

    const updateItem = (index: number, field: keyof Item, value: any) => {
        const newItems = [...quote.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setQuote(prev => ({ ...prev, items: newItems }));
    };

    const addItem = () => {
        const newItem: Item = {
            id: `item-${Date.now()}`,
            description: '',
            unitPrice: 0,
            qty: 1,
            taxable: true,
            itemType: ItemType.Fixed,
            unit: 'unit',
        };
        setQuote(prev => ({ ...prev, items: [...prev.items, newItem] }));
    };

    const removeItem = (index: number) => {
        const newItems = quote.items.filter((_, i) => i !== index);
        setQuote(prev => ({ ...prev, items: newItems }));
    };
    
    const handleFieldChange = (field: keyof Quote, value: any) => {
        setQuote(prev => ({ ...prev, [field]: value }));
    };

    const handlePackageChange = (packageId: string) => {
        const selectedPackage = packages.find(p => p.id === packageId);
        if (selectedPackage) {
            const packageItems: Item[] = selectedPackage.items.map((item, index) => ({
                ...item,
                id: `pkg-item-${Date.now()}-${index}`
            }));
            setQuote(prev => ({...prev, items: [...prev.items, ...packageItems]}));
        }
    };
    
    useEffect(() => {
        const subtotalExclVat = quote.items.reduce((acc, item) => acc + item.unitPrice * item.qty, 0);
        const taxableAmount = quote.items.filter(i => i.taxable).reduce((acc, item) => acc + item.unitPrice * item.qty, 0);
        const vatAmount = taxableAmount * (settings.vatPercentage / 100);
        const totalInclVat = subtotalExclVat + vatAmount;
        const depositAmount = totalInclVat * (quote.depositPercentage / 100);
        const balanceRemaining = totalInclVat - depositAmount;

        setQuote(prev => ({
            ...prev,
            subtotalExclVat,
            vatAmount,
            totalInclVat,
            depositAmount,
            balanceRemaining,
        }));
    }, [quote.items, quote.depositPercentage, settings.vatPercentage]);

    const selectedClient = clients.find(c => c.id === quote.clientId);

    if (showPdfPreview && selectedClient) {
        return (
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Preview Quote: {quote.quoteNumber}</h1>
                    <div className="flex items-center gap-2">
                         <button onClick={() => setShowPdfPreview(false)} className="px-4 py-2 bg-gray-500 text-white rounded-lg shadow-sm hover:bg-gray-600 transition-colors">
                            Back to Editor
                        </button>
                        <button onClick={() => generatePdf(quote, settings, selectedClient, 'Quote')} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg shadow-sm hover:bg-red-600 transition-colors">
                            {Icons.PDF} Download PDF
                        </button>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm overflow-auto">
                    <QuoteInvoicePDF doc={quote} settings={settings} client={selectedClient} type="Quote" />
                </div>
            </div>
        );
    }
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
                <h1 className="text-2xl font-bold text-gray-800">{initialQuote.id.startsWith('quote-') ? 'New Quote' : 'Edit Quote'}</h1>
                <div className="flex items-center gap-2">
                    <button onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg shadow-sm hover:bg-gray-300 transition-colors">
                        Cancel
                    </button>
                    <button onClick={() => setShowPdfPreview(true)} disabled={!selectedClient} className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-sm hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        Preview PDF
                    </button>
                    <button onClick={() => onSave(quote)} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg shadow-sm hover:bg-green-600 transition-colors">
                       {Icons.Save} Save Quote
                    </button>
                </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Client</label>
                        <select
                            value={quote.clientId}
                            onChange={(e) => handleFieldChange('clientId', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                            <option value="">Select a client</option>
                            {clients.map(client => (
                                <option key={client.id} value={client.id}>{client.company}</option>
                            ))}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Quote Number</label>
                        <input type="text" value={quote.quoteNumber} readOnly className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm sm:text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                         <select
                            value={quote.status}
                            onChange={(e) => handleFieldChange('status', e.target.value as QuoteStatus)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                            {Object.values(QuoteStatus).map(status => (
                                <option key={status} value={status} className="capitalize">{status}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Date Issued</label>
                        <input type="date" value={formatDate(quote.dateIssued)} onChange={e => handleFieldChange('dateIssued', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Valid Until</label>
                        <input type="date" value={formatDate(quote.validUntil)} onChange={e => handleFieldChange('validUntil', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm" />
                    </div>
                </div>

                <div className="mt-6">
                     <h2 className="text-lg font-medium text-gray-900 mb-2">Items</h2>
                     <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Add from Package</label>
                        <select
                            onChange={(e) => handlePackageChange(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                            <option value="">Select a package to add items</option>
                            {packages.map(pkg => (
                                <option key={pkg.id} value={pkg.id}>{pkg.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left">Description</th>
                                    <th className="px-4 py-2 text-right">Unit Price</th>
                                    <th className="px-4 py-2 text-right">Qty</th>
                                    <th className="px-4 py-2 text-right">Total</th>
                                    <th className="px-4 py-2 text-center">Taxable</th>
                                    <th className="px-4 py-2"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {quote.items.map((item, index) => (
                                    <tr key={item.id} className="border-b">
                                        <td className="p-2"><input type="text" value={item.description} onChange={e => updateItem(index, 'description', e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm sm:text-sm"/></td>
                                        <td className="p-2"><input type="number" value={item.unitPrice} onChange={e => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)} className="w-28 text-right rounded-md border-gray-300 shadow-sm sm:text-sm"/></td>
                                        <td className="p-2"><input type="number" value={item.qty} onChange={e => updateItem(index, 'qty', parseInt(e.target.value) || 0)} className="w-20 text-right rounded-md border-gray-300 shadow-sm sm:text-sm"/></td>
                                        <td className="p-2 text-right">{formatCurrency(item.unitPrice * item.qty, settings.currency)}</td>
                                        <td className="p-2 text-center"><input type="checkbox" checked={item.taxable} onChange={e => updateItem(index, 'taxable', e.target.checked)} className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"/></td>
                                        <td className="p-2"><button onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700">{Icons.Trash}</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <button onClick={addItem} className="mt-4 flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#7A4CA6] hover:bg-[#693d91]">
                        {Icons.Plus} Add Item
                    </button>
                </div>

                <div className="flex justify-end mt-6">
                    <div className="w-full md:w-1/3 space-y-2">
                        <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(quote.subtotalExclVat, settings.currency)}</span></div>
                        <div className="flex justify-between"><span>VAT ({settings.vatPercentage}%)</span><span>{formatCurrency(quote.vatAmount, settings.currency)}</span></div>
                        <div className="flex justify-between font-bold text-lg"><span>Total</span><span>{formatCurrency(quote.totalInclVat, settings.currency)}</span></div>
                        <hr className="my-2"/>
                        <div className="flex justify-between items-center">
                            <span>Deposit ({quote.depositPercentage}%)</span>
                            <input type="number" value={quote.depositPercentage} onChange={e => handleFieldChange('depositPercentage', parseInt(e.target.value) || 0)} className="w-20 text-right rounded-md border-gray-300 shadow-sm sm:text-sm"/>
                        </div>
                        <div className="flex justify-between"><span>Deposit Amount</span><span>{formatCurrency(quote.depositAmount, settings.currency)}</span></div>
                        <div className="flex justify-between font-medium"><span>Balance Remaining</span><span>{formatCurrency(quote.balanceRemaining, settings.currency)}</span></div>
                    </div>
                </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                         <label className="block text-sm font-medium text-gray-700">Notes</label>
                         <textarea value={quote.notes} onChange={e => handleFieldChange('notes', e.target.value)} rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"></textarea>
                    </div>
                     <div>
                         <label className="block text-sm font-medium text-gray-700">Terms</label>
                         <textarea value={quote.termsText} onChange={e => handleFieldChange('termsText', e.target.value)} rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"></textarea>
                    </div>
                </div>

            </div>
        </div>
    );
};


const QuotesPage: React.FC<{
    quotes: Quote[];
    clients: Client[];
    settings: CompanySettings;
    packages: Package[];
    onSave: (quote: Quote) => void;
    onConvertToInvoice: (quoteId: string) => void;
}> = ({ quotes, clients, settings, packages, onSave, onConvertToInvoice }) => {
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);

  const handleNewQuote = () => {
    const newQuoteNumber = generateDocumentNumber(settings.numberingFormatQuote, settings.nextQuoteNumber);
    const newQuote: Quote = {
      id: `quote-${Date.now()}`,
      quoteNumber: newQuoteNumber,
      createdByUserId: 'user2', // Hardcoded for now
      dateIssued: getTodayDateString(),
      validUntil: formatDate(addDays(new Date(), 30)),
      clientId: '',
      items: [],
      subtotalExclVat: 0,
      vatAmount: 0,
      totalInclVat: 0,
      depositPercentage: 40,
      depositAmount: 0,
      balanceRemaining: 0,
      status: QuoteStatus.Draft,
      termsText: settings.termsText,
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEditingQuote(newQuote);
  };

  const handleSave = (quote: Quote) => {
    onSave(quote);
    setEditingQuote(null);
  };

  if (editingQuote) {
    return <QuoteEditor 
      quote={editingQuote} 
      clients={clients} 
      settings={settings} 
      packages={packages}
      onSave={handleSave} 
      onCancel={() => setEditingQuote(null)} 
    />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Quotes</h1>
        <button onClick={handleNewQuote} className="flex items-center gap-2 px-4 py-2 bg-[#7A4CA6] text-white rounded-lg shadow-sm hover:bg-[#693d91] transition-colors">
          {Icons.Plus} New Quote
        </button>
      </div>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left text-gray-500 mobile-card-view">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">Quote #</th>
              <th scope="col" className="px-6 py-3">Client</th>
              <th scope="col" className="px-6 py-3">Date</th>
              <th scope="col" className="px-6 py-3">Valid Until</th>
              <th scope="col" className="px-6 py-3">Total</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map(quote => {
              const client = clients.find(c => c.id === quote.clientId);
              return (
                <tr key={quote.id} className="bg-white border-b hover:bg-gray-50 md:border-b-0">
                  <td data-label="Quote #" className="px-6 py-4 font-medium text-gray-900">{quote.quoteNumber}</td>
                  <td data-label="Client" className="px-6 py-4">{client?.company || 'N/A'}</td>
                  <td data-label="Date" className="px-6 py-4">{formatDate(quote.dateIssued)}</td>
                  <td data-label="Valid Until" className="px-6 py-4">{formatDate(quote.validUntil)}</td>
                  <td data-label="Total" className="px-6 py-4">{formatCurrency(quote.totalInclVat, settings.currency)}</td>
                  <td data-label="Status" className="px-6 py-4"><StatusBadge status={quote.status} /></td>
                  <td data-label="Actions" className="px-6 py-4">
                    <div className="flex items-center gap-4 justify-end md:justify-start">
                        <button onClick={() => setEditingQuote(quote)} className="font-medium text-[#7A4CA6] hover:underline">Edit</button>
                        {quote.status === QuoteStatus.Accepted && (
                            <button onClick={() => onConvertToInvoice(quote.id)} className="font-medium text-green-600 hover:underline">Convert to Invoice</button>
                        )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const InvoiceEditor: React.FC<{
    invoice: Invoice;
    clients: Client[];
    settings: CompanySettings;
    onSave: (invoice: Invoice) => void;
    onCancel: () => void;
}> = ({ invoice: initialInvoice, clients, settings, onSave, onCancel }) => {
    const [invoice, setInvoice] = useState(initialInvoice);
    const [showPdfPreview, setShowPdfPreview] = useState(false);

    const handleFieldChange = (field: keyof Invoice, value: any) => {
        setInvoice(prev => ({ ...prev, [field]: value }));
    };

    const selectedClient = clients.find(c => c.id === invoice.clientId);

    if (showPdfPreview && selectedClient) {
        return (
            <div>
                 <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Preview Invoice: {invoice.invoiceNumber}</h1>
                    <div className="flex items-center gap-2">
                         <button onClick={() => setShowPdfPreview(false)} className="px-4 py-2 bg-gray-500 text-white rounded-lg shadow-sm hover:bg-gray-600 transition-colors">
                            Back to Editor
                        </button>
                        <button onClick={() => generatePdf(invoice, settings, selectedClient, 'Invoice')} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg shadow-sm hover:bg-red-600 transition-colors">
                            {Icons.PDF} Download PDF
                        </button>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm overflow-auto">
                    <QuoteInvoicePDF doc={invoice} settings={settings} client={selectedClient} type="Invoice" />
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
                <h1 className="text-2xl font-bold text-gray-800">Edit Invoice</h1>
                 <div className="flex items-center gap-2">
                    <button onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg shadow-sm hover:bg-gray-300 transition-colors">
                        Cancel
                    </button>
                     <button onClick={() => setShowPdfPreview(true)} disabled={!selectedClient} className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-sm hover:bg-blue-600 transition-colors disabled:opacity-50">
                        Preview PDF
                    </button>
                    <button onClick={() => onSave(invoice)} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg shadow-sm hover:bg-green-600 transition-colors">
                        {Icons.Save} Save Invoice
                    </button>
                </div>
            </div>
             <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Client</label>
                        <input type="text" value={clients.find(c => c.id === invoice.clientId)?.company || ''} readOnly className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm sm:text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Invoice Number</label>
                        <input type="text" value={invoice.invoiceNumber} readOnly className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm sm:text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                         <select
                            value={invoice.status}
                            onChange={(e) => handleFieldChange('status', e.target.value as InvoiceStatus)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                            {Object.values(InvoiceStatus).map(status => (
                                <option key={status} value={status} className="capitalize">{status.replace(/_/g, ' ')}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Date Issued</label>
                        <input type="date" value={formatDate(invoice.dateIssued)} onChange={e => handleFieldChange('dateIssued', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Due Date</label>
                        <input type="date" value={formatDate(invoice.dueDate)} onChange={e => handleFieldChange('dueDate', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm" />
                    </div>
                </div>
                
                <div className="mt-6">
                     <h2 className="text-lg font-medium text-gray-900 mb-2">Items</h2>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left">Description</th>
                                    <th className="px-4 py-2 text-right">Unit Price</th>
                                    <th className="px-4 py-2 text-right">Qty</th>
                                    <th className="px-4 py-2 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoice.items.map((item) => (
                                    <tr key={item.id} className="border-b">
                                        <td className="p-2">{item.description}</td>
                                        <td className="p-2 text-right">{formatCurrency(item.unitPrice, settings.currency)}</td>
                                        <td className="p-2 text-right">{item.qty}</td>
                                        <td className="p-2 text-right">{formatCurrency(item.unitPrice * item.qty, settings.currency)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="flex justify-end mt-6">
                    <div className="w-full md:w-1/3 space-y-2">
                        <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(invoice.subtotalExclVat, settings.currency)}</span></div>
                        <div className="flex justify-between"><span>VAT ({settings.vatPercentage}%)</span><span>{formatCurrency(invoice.vatAmount, settings.currency)}</span></div>
                        <div className="flex justify-between font-bold text-lg"><span>Total</span><span>{formatCurrency(invoice.totalInclVat, settings.currency)}</span></div>
                        <hr className="my-2"/>
                         <div className="flex justify-between"><span>Deposit Amount</span><span>{formatCurrency(invoice.depositAmount, settings.currency)}</span></div>
                        <div className="flex justify-between font-medium"><span>Balance Remaining</span><span>{formatCurrency(invoice.balanceRemaining, settings.currency)}</span></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const InvoicesPage: React.FC<{
    invoices: Invoice[];
    clients: Client[];
    settings: CompanySettings;
    onSave: (invoice: Invoice) => void;
}> = ({ invoices, clients, settings, onSave }) => {
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  const handleSave = (invoice: Invoice) => {
    onSave(invoice);
    setEditingInvoice(null);
  };
  
  if (editingInvoice) {
    return <InvoiceEditor 
      invoice={editingInvoice}
      clients={clients}
      settings={settings}
      onSave={handleSave}
      onCancel={() => setEditingInvoice(null)}
    />;
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Invoices</h1>
      </div>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left text-gray-500 mobile-card-view">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">Invoice #</th>
              <th scope="col" className="px-6 py-3">Client</th>
              <th scope="col" className="px-6 py-3">Date</th>
              <th scope="col" className="px-6 py-3">Due Date</th>
              <th scope="col" className="px-6 py-3">Total</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(invoice => {
              const client = clients.find(c => c.id === invoice.clientId);
              return (
                <tr key={invoice.id} className="bg-white border-b hover:bg-gray-50 md:border-b-0">
                  <td data-label="Invoice #" className="px-6 py-4 font-medium text-gray-900">{invoice.invoiceNumber}</td>
                  <td data-label="Client" className="px-6 py-4">{client?.company || 'N/A'}</td>
                  <td data-label="Date" className="px-6 py-4">{formatDate(invoice.dateIssued)}</td>
                  <td data-label="Due Date" className="px-6 py-4">{formatDate(invoice.dueDate)}</td>
                  <td data-label="Total" className="px-6 py-4">{formatCurrency(invoice.totalInclVat, settings.currency)}</td>
                  <td data-label="Status" className="px-6 py-4"><StatusBadge status={invoice.status} /></td>
                  <td data-label="Actions" className="px-6 py-4">
                     <div className="flex items-center gap-4 justify-end md:justify-start">
                        <button onClick={() => setEditingInvoice(invoice)} className="font-medium text-[#7A4CA6] hover:underline">Edit</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ClientEditor: React.FC<{
    client: Client;
    onSave: (client: Client) => void;
    onCancel: () => void;
}> = ({ client: initialClient, onSave, onCancel }) => {
    const [client, setClient] = useState(initialClient);

    const handleChange = (field: keyof Client, value: string) => {
        setClient(prev => ({ ...prev, [field]: value }));
    };

    return (
         <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">{initialClient.id.startsWith('client-') ? 'New Client' : 'Edit Client'}</h1>
            <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Contact Name" value={client.name} onChange={e => handleChange('name', e.target.value)} />
                    <InputField label="Company Name" value={client.company} onChange={e => handleChange('company', e.target.value)} />
                    <InputField label="Email" type="email" value={client.email} onChange={e => handleChange('email', e.target.value)} />
                    <InputField label="Phone" value={client.phone} onChange={e => handleChange('phone', e.target.value)} />
                    <InputField label="Billing Address" value={client.billingAddress} onChange={e => handleChange('billingAddress', e.target.value)} />
                    <InputField label="Delivery Address" value={client.deliveryAddress} onChange={e => handleChange('deliveryAddress', e.target.value)} />
                    <InputField label="VAT Number" value={client.vatNumber || ''} onChange={e => handleChange('vatNumber', e.target.value)} />
                </div>
                 <div className="flex justify-end gap-2 pt-4">
                    <button onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg shadow-sm hover:bg-gray-300 transition-colors">Cancel</button>
                    <button onClick={() => onSave(client)} className="px-4 py-2 bg-green-500 text-white rounded-lg shadow-sm hover:bg-green-600 transition-colors">Save Client</button>
                </div>
            </div>
        </div>
    );
};

const ClientsPage: React.FC<{
    clients: Client[];
    onSave: (client: Client) => void;
    onDelete: (clientId: string) => void;
}> = ({ clients, onSave, onDelete }) => {
    const [editingClient, setEditingClient] = useState<Client | null>(null);

    const handleNewClient = () => {
        setEditingClient({
            id: `client-${Date.now()}`,
            name: '',
            company: '',
            email: '',
            billingAddress: '',
            deliveryAddress: '',
            phone: '',
            vatNumber: ''
        });
    };

    const handleSave = (client: Client) => {
        onSave(client);
        setEditingClient(null);
    }
    
    if (editingClient) {
        return <ClientEditor client={editingClient} onSave={handleSave} onCancel={() => setEditingClient(null)} />
    }

    return (
         <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Clients</h1>
                <button onClick={handleNewClient} className="flex items-center gap-2 px-4 py-2 bg-[#7A4CA6] text-white rounded-lg shadow-sm hover:bg-[#693d91] transition-colors">
                    {Icons.Plus} New Client
                </button>
            </div>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                 <table className="w-full text-sm text-left text-gray-500 mobile-card-view">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Company</th>
                            <th scope="col" className="px-6 py-3">Contact Name</th>
                            <th scope="col" className="px-6 py-3">Email</th>
                            <th scope="col" className="px-6 py-3">Phone</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clients.map(client => (
                            <tr key={client.id} className="bg-white border-b hover:bg-gray-50 md:border-b-0">
                                <td data-label="Company" className="px-6 py-4 font-medium text-gray-900">{client.company}</td>
                                <td data-label="Contact Name" className="px-6 py-4">{client.name}</td>
                                <td data-label="Email" className="px-6 py-4">{client.email}</td>
                                <td data-label="Phone" className="px-6 py-4">{client.phone}</td>
                                <td data-label="Actions" className="px-6 py-4">
                                     <div className="flex items-center gap-4 justify-end md:justify-start">
                                        <button onClick={() => setEditingClient(client)} className="font-medium text-[#7A4CA6] hover:underline">Edit</button>
                                        <button onClick={() => onDelete(client.id)} className="font-medium text-red-600 hover:underline">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                 </table>
            </div>
        </div>
    )
};

const SettingsPage: React.FC<{
    settings: CompanySettings,
    onSave: (settings: CompanySettings) => void;
}> = ({ settings: initialSettings, onSave }) => {
    const [settings, setSettings] = useState(initialSettings);
    
    const handleChange = (field: keyof CompanySettings, value: any) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    const handlePaymentChange = (field: keyof PaymentInstructions, value: string) => {
        setSettings(prev => ({...prev, paymentInstructions: {...prev.paymentInstructions, [field]: value}}))
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Please select a valid image file.');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                handleChange('logoUrl', reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveLogo = () => {
        handleChange('logoUrl', null);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Settings</h1>
            <div className="bg-white p-6 rounded-lg shadow-sm space-y-8">
                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Company Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="Company Name" value={settings.companyName} onChange={e => handleChange('companyName', e.target.value)} />
                        <InputField label="Email" type="email" value={settings.email} onChange={e => handleChange('email', e.target.value)} />
                        <InputField label="Phone" value={settings.phone} onChange={e => handleChange('phone', e.target.value)} />
                        <InputField label="Address" value={settings.address} onChange={e => handleChange('address', e.target.value)} />
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Company Logo</label>
                            <div className="mt-1 flex items-center space-x-4">
                                {settings.logoUrl ? (
                                    <img src={settings.logoUrl} alt="Logo Preview" className="h-12 w-auto rounded-md bg-gray-100 object-contain p-1" />
                                ) : (
                                    <div className="flex h-12 w-24 items-center justify-center rounded-md bg-gray-100 text-sm text-gray-400">
                                        No Logo
                                    </div>
                                )}
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="file"
                                        id="logo-upload"
                                        accept="image/*"
                                        onChange={handleLogoUpload}
                                        className="hidden"
                                    />
                                    <label
                                        htmlFor="logo-upload"
                                        className="cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                                    >
                                        Upload
                                    </label>
                                    {settings.logoUrl && (
                                        <button
                                            type="button"
                                            onClick={handleRemoveLogo}
                                            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-red-600 shadow-sm hover:bg-gray-50"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Financial Details</h2>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <InputField label="Currency" value={settings.currency} onChange={e => handleChange('currency', e.target.value)} />
                        <div>
                            <label className="block text-sm font-medium text-gray-700">VAT Percentage</label>
                            <input type="number" value={settings.vatPercentage} onChange={e => handleChange('vatPercentage', parseFloat(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm" />
                        </div>
                    </div>
                </section>
                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Instructions</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="Bank Name" value={settings.paymentInstructions.bank} onChange={e => handlePaymentChange('bank', e.target.value)} />
                        <InputField label="Account Name" value={settings.paymentInstructions.accountName} onChange={e => handlePaymentChange('accountName', e.target.value)} />
                        <InputField label="Account Number" value={settings.paymentInstructions.accountNumber} onChange={e => handlePaymentChange('accountNumber', e.target.value)} />
                        <InputField label="Branch Code" value={settings.paymentInstructions.branchCode} onChange={e => handlePaymentChange('branchCode', e.target.value)} />
                    </div>
                </section>
                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Document Settings</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="Quote Number Format" value={settings.numberingFormatQuote} onChange={e => handleChange('numberingFormatQuote', e.target.value)} />
                        <InputField label="Invoice Number Format" value={settings.numberingFormatInvoice} onChange={e => handleChange('numberingFormatInvoice', e.target.value)} />
                    </div>
                    <div className="mt-6">
                        <InputField label="Terms & Conditions" type="textarea" rows={6} value={settings.termsText} onChange={e => handleChange('termsText', e.target.value)} />
                    </div>
                </section>
                <div className="flex justify-end pt-4">
                    <button onClick={() => onSave(settings)} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg shadow-sm hover:bg-green-600 transition-colors">
                        {Icons.Save} Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- LAYOUT COMPONENTS ---
const SideNav: React.FC<{
    currentPage: Page;
    onNavigate: (page: Page) => void;
    isCollapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
    isMobileOpen: boolean;
}> = ({ currentPage, onNavigate, isCollapsed, setCollapsed, isMobileOpen }) => {
    const navItems: { page: Page; label: string; icon: JSX.Element }[] = [
        { page: 'dashboard', label: 'Dashboard', icon: Icons.Dashboard },
        { page: 'quotes', label: 'Quotes', icon: Icons.Quotes },
        { page: 'invoices', label: 'Invoices', icon: Icons.Invoices },
        { page: 'clients', label: 'Clients', icon: Icons.Clients },
        { page: 'settings', label: 'Settings', icon: Icons.Settings },
    ];

    const navClasses = `
        fixed top-0 left-0 h-full bg-purple-100 text-purple-900 z-40 transition-transform duration-300 ease-in-out
        md:relative md:transform-none md:transition-all
        ${isCollapsed ? 'md:w-20' : 'md:w-64'}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
    `;

    return (
        <nav className={navClasses}>
            <div className="flex items-center h-16 px-4 border-b border-purple-200">
                {!isCollapsed && <span className="text-xl font-bold text-purple-900">II Generator</span>}
            </div>
            <ul className="flex flex-col py-4 space-y-1">
                <li className="hidden md:block px-2">
                     <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); setCollapsed(!isCollapsed); }}
                        className={`flex items-center p-4 text-sm font-medium text-purple-700 hover:bg-purple-200 hover:text-purple-900 rounded-md transition-colors ${isCollapsed ? 'justify-center' : ''}`}
                    >
                        {isCollapsed ? Icons.ChevronDoubleRight : Icons.ChevronDoubleLeft}
                        {!isCollapsed && <span className="ml-3">Collapse</span>}
                    </a>
                </li>
                {navItems.map(({ page, label, icon }) => {
                    const isActive = currentPage === page;
                    return (
                        <li key={page} className="px-2">
                            <a
                                href="#"
                                onClick={(e) => { e.preventDefault(); onNavigate(page); }}
                                className={`flex items-center p-4 text-sm font-medium rounded-md transition-colors ${
                                    isActive 
                                    ? 'bg-[#7A4CA6] text-white shadow-md' 
                                    : 'hover:bg-purple-200'
                                } ${isCollapsed ? 'justify-center' : ''}`}
                            >
                                {icon}
                                {!isCollapsed && <span className="ml-3">{label}</span>}
                            </a>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
};

// --- MAIN APP COMPONENT ---
const App: React.FC = () => {
    const [page, setPage] = useState<Page>('dashboard');
    const [settings, setSettings] = useState<CompanySettings>(INITIAL_COMPANY_SETTINGS);
    const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
    const [quotes, setQuotes] = useState<Quote[]>(MOCK_QUOTES);
    const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isMobileNavOpen, setMobileNavOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setSidebarCollapsed(true);
            }
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleSaveQuote = (quoteToSave: Quote) => {
        const index = quotes.findIndex(q => q.id === quoteToSave.id);
        if (index > -1) {
            setQuotes(prev => {
                const newQuotes = [...prev];
                newQuotes[index] = { ...quoteToSave, updatedAt: new Date().toISOString() };
                return newQuotes;
            });
        } else {
            setQuotes(prev => [...prev, quoteToSave]);
            setSettings(prev => ({ ...prev, nextQuoteNumber: prev.nextQuoteNumber + 1 }));
        }
    };

    const handleSaveInvoice = (invoiceToSave: Invoice) => {
        const index = invoices.findIndex(i => i.id === invoiceToSave.id);
        if (index > -1) {
             setInvoices(prev => {
                const newInvoices = [...prev];
                newInvoices[index] = { ...invoiceToSave, updatedAt: new Date().toISOString() };
                return newInvoices;
            });
        }
    };

    const handleSaveClient = (clientToSave: Client) => {
        const index = clients.findIndex(c => c.id === clientToSave.id);
        if (index > -1) {
            setClients(prev => {
                const newClients = [...prev];
                newClients[index] = clientToSave;
                return newClients;
            });
        } else {
            setClients(prev => [...prev, clientToSave]);
        }
    };

    const handleDeleteClient = (clientId: string) => {
        if(window.confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
            setClients(prev => prev.filter(c => c.id !== clientId));
        }
    };
    
    const handleConvertToInvoice = (quoteId: string) => {
        const quote = quotes.find(q => q.id === quoteId);
        if (!quote) return;

        const newInvoiceNumber = generateDocumentNumber(settings.numberingFormatInvoice, settings.nextInvoiceNumber);
        const newInvoice: Invoice = {
            id: `inv-${Date.now()}`,
            invoiceNumber: newInvoiceNumber,
            createdByUserId: quote.createdByUserId,
            dateIssued: getTodayDateString(),
            dueDate: formatDate(addDays(new Date(), 5)),
            clientId: quote.clientId,
            items: quote.items,
            subtotalExclVat: quote.subtotalExclVat,
            vatAmount: quote.vatAmount,
            totalInclVat: quote.totalInclVat,
            depositRequired: quote.depositAmount > 0,
            depositAmount: quote.depositAmount,
            balanceRemaining: quote.balanceRemaining,
            status: InvoiceStatus.Sent,
            paymentInstructions: settings.paymentInstructions,
            createdFromQuoteId: quote.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        
        setInvoices(prev => [...prev, newInvoice]);
        setSettings(prev => ({ ...prev, nextInvoiceNumber: prev.nextInvoiceNumber + 1 }));
        setPage('invoices');
    };


    const renderPage = () => {
        switch (page) {
            case 'dashboard':
                return <DashboardPage quotes={quotes} invoices={invoices} onNewQuote={() => setPage('quotes')}/>;
            case 'quotes':
                return <QuotesPage quotes={quotes} clients={clients} settings={settings} packages={MOCK_PACKAGES} onSave={handleSaveQuote} onConvertToInvoice={handleConvertToInvoice} />;
            case 'invoices':
                return <InvoicesPage invoices={invoices} clients={clients} settings={settings} onSave={handleSaveInvoice} />;
            case 'clients':
                return <ClientsPage clients={clients} onSave={handleSaveClient} onDelete={handleDeleteClient} />;
            case 'settings':
                return <SettingsPage settings={settings} onSave={setSettings} />;
            default:
                return <DashboardPage quotes={quotes} invoices={invoices} onNewQuote={() => setPage('quotes')}/>;
        }
    };
    
    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            {isMobileNavOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
                    onClick={() => setMobileNavOpen(false)}
                    aria-hidden="true"
                ></div>
            )}
            <SideNav 
                currentPage={page} 
                onNavigate={(p) => { setPage(p); setMobileNavOpen(false); }} 
                isCollapsed={isSidebarCollapsed}
                setCollapsed={setSidebarCollapsed}
                isMobileOpen={isMobileNavOpen}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-[#3a1e5b] shadow-sm p-4 flex justify-between items-center md:hidden">
                    <button onClick={() => setMobileNavOpen(!isMobileNavOpen)} aria-label="Toggle Menu" className="text-white p-2 -m-2">
                        {React.cloneElement(isMobileNavOpen ? Icons.X : Icons.Menu, { className: 'w-6 h-6 text-white' })}
                    </button>
                    <span className="text-xl font-bold text-white">II G</span>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6 md:p-8">
                    {renderPage()}
                </main>
            </div>
        </div>
    );
};

export default App;
