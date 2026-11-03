export interface InvoicePayment {
  id: string;
  amount: number | string;
  payment_method: string;
  status: string;
  transaction_reference: string | null;
  payment_date: string | null;
  notes: string | null;
  created_at: string;
  confirmed_at: string | null;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  item_type: string;
  description: string;
  quantity: number;
  unit_price: number | string;
  line_total: number | string;
  created_at: string;
}

export interface InvoiceShop {
  id: string;
  shop_code: string;
  name: string;
  contact_email: string | null;
  contact_phone: string | null;
}

export interface InvoiceDetails {
  id: string;
  invoice_number: string;
  invoice_type: string;
  status: string;
  subtotal: number | string;
  discount: number | string;
  total: number | string;
  due_at: string;
  issued_at: string;
  paid_at: string | null;
  currency: string;
  shop_id: string;
  subscription_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  shop: InvoiceShop | null;
  items: InvoiceItem[];
  payments: InvoicePayment[];
  confirmedAmount: number;
  outstandingBalance: number;
}