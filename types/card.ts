export interface CreditCard {
  id: string;
  bankName: string;
  cardNumber: string;
  cardHolder: string;
  dueDate: string;
  outstandingAmount: number;
  minimumDue: number;
  creditLimit: number;
  availableCredit: number;
  color: string;
  bankLogo?: string;
  cardType: string;
}

export interface Payment {
  id: string;
  cardId: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  cashback: number;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: string;
  claimed: boolean;
  expiryDate: string;
}

export type PaymentSourceType = 'debit_card' | 'bank_account' | 'credit_card';
/* 🔥 NEW — matches dwolla_funding_sources table */
export interface DwollaFundingSource {
  id: number; // DB primary key
  funding_source_id: string;
  name: string; // display name
  type: string; // 'checking' | 'savings'
  status: string;
  last4: string;
}