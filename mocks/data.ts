import { Payment, PaymentSource, Reward } from '@/types/card';


export const mockPayments: Payment[] = [
  {
    id: '1',
    cardId: '1',
    amount: 2500,
    date: '2024-12-15',
    status: 'completed',
    cashback: 25,
  },
  {
    id: '2',
    cardId: '2',
    amount: 1200,
    date: '2024-12-10',
    status: 'completed',
    cashback: 24,
  },
  {
    id: '3',
    cardId: '3',
    amount: 3200,
    date: '2024-12-05',
    status: 'completed',
    cashback: 64,
  },
];

export const mockRewards: Reward[] = [
  {
    id: '1',
    title: 'Cashback Earned',
    description: 'Total cashback from bill payments',
    points: 113,
    icon: '💰',
    claimed: false,
    expiryDate: '2025-03-31',
  },
  {
    id: '2',
    title: 'Streak Bonus',
    description: '5 consecutive on-time payments',
    points: 50,
    icon: '🔥',
    claimed: false,
    expiryDate: '2025-02-28',
  },
  {
    id: '3',
    title: 'Early Payment',
    description: 'Paid 10 days before due date',
    points: 25,
    icon: '⚡',
    claimed: true,
    expiryDate: '2025-01-31',
  },
];

export const mockPaymentSources: PaymentSource[] = [
  {
    id: '1',
    type: 'debit_card',
    name: 'Personal Debit',
    last4: '1234',
    bankName: 'Bank of America',
  },
  {
    id: '2',
    type: 'bank_account',
    name: 'Checking Account',
    last4: '5678',
    bankName: 'Wells Fargo',
    accountType: 'Checking',
  },
];