export interface CreditCard {
  id: string;
  bankName: string;
  cardNumber: string; // Last 4 digits
  cardHolder: string;
  dueDate: string;
  outstandingAmount: number;
  minimumDue: number;
  creditLimit: number;
  availableCredit: number;
  color: string; // Gradient color for card
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

export interface PaymentSource {
  id: string;
  type: PaymentSourceType;
  name: string;
  last4: string;
  bankName?: string;
  accountType?: string;
}