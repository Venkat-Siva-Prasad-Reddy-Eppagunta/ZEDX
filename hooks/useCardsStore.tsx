import { mockPayments, mockRewards } from '@/mocks/data';
import {
  CreditCard,
  DwollaFundingSource,
  Payment,
  Reward,
} from '@/types/card';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useState } from 'react';

export const [CardsProvider, useCards] = createContextHook(() => {
  /* -------------------- State -------------------- */

  const [cards, setCards] = useState<CreditCard[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [fundingSources, setFundingSources] = useState<DwollaFundingSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /* -------------------- AsyncStorage Helpers -------------------- */

  const loadCards = async (): Promise<CreditCard[]> => {
    try {
      const stored = await AsyncStorage.getItem('cards');
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      console.error('Error loading cards', err);
      return [];
    }
  };

  const saveCards = async (updatedCards: CreditCard[]) => {
    try {
      await AsyncStorage.setItem('cards', JSON.stringify(updatedCards));
      setCards(updatedCards);
    } catch (err) {
      console.error('Error saving cards', err);
    }
  };

  const loadFundingSources = async (): Promise<DwollaFundingSource[]> => {
    try {
      const stored = await AsyncStorage.getItem('fundingSources');
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      console.error('Error loading funding sources', err);
      return [];
    }
  };

  const saveFundingSources = async (sources: DwollaFundingSource[]) => {
    try {
      await AsyncStorage.setItem('fundingSources', JSON.stringify(sources));
      setFundingSources(sources);
    } catch (err) {
      console.error('Error saving funding sources', err);
    }
  };

  const loadPayments = async (): Promise<Payment[]> => {
    try {
      const stored = await AsyncStorage.getItem('payments');
      return stored ? JSON.parse(stored) : mockPayments;
    } catch (err) {
      console.error('Error loading payments', err);
      return mockPayments;
    }
  };

  const savePayments = async (updatedPayments: Payment[]) => {
    try {
      await AsyncStorage.setItem('payments', JSON.stringify(updatedPayments));
      setPayments(updatedPayments);
    } catch (err) {
      console.error('Error saving payments', err);
    }
  };

  const loadRewards = async (): Promise<Reward[]> => {
    try {
      const stored = await AsyncStorage.getItem('rewards');
      return stored ? JSON.parse(stored) : mockRewards;
    } catch (err) {
      console.error('Error loading rewards', err);
      return mockRewards;
    }
  };

  /* -------------------- Initial Load (like loadUser) -------------------- */

  useEffect(() => {
    (async () => {
      try {
        const [
          storedCards,
          storedPayments,
          storedRewards,
          storedFundingSources,
        ] = await Promise.all([
          loadCards(),
          loadPayments(),
          loadRewards(),
          loadFundingSources(),
        ]);

        setCards(storedCards);
        setPayments(storedPayments);
        setRewards(storedRewards);
        setFundingSources(storedFundingSources);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  /* -------------------- Actions -------------------- */

  const addCard = async (card: CreditCard) => {
    const updated = [...cards, card];
    await saveCards(updated);
  };

  /**
   * Backend → UI adapter
   * Used by /me API
   */
  const setUserCards = useCallback(
    async (userCards: any[], userName: string) => {
      const formatted: CreditCard[] = userCards.map(card => ({
        id: card.id.toString(),
        bankName: card.name,
        cardNumber: card.mask,
        outstandingAmount: Number(card.current_balance) || 0,
        availableCredit: Number(card.available_balance) || 0,
        creditLimit: Number(card.credit_limit) || 0,
        minimumDue: Number(card.min_due) || 0,
        dueDate: card.next_due_date,
        cardHolder: userName,
        color: 'default',
        cardType: 'Credit',
      }));

      await saveCards(formatted);
    },
    []
  );

  const addPaymentSource = useCallback(
    async (source: DwollaFundingSource) => {
      const exists = fundingSources.some(
        s => s.funding_source_id === source.funding_source_id
      );

      if (exists) return;

      const updated = [source, ...fundingSources];
      await saveFundingSources(updated);
    },
    [fundingSources]
  );

  const setPaymentSources = useCallback(
    async (sources: DwollaFundingSource[]) => {
      await saveFundingSources(sources);
    },
    []
  );

  const makePayment = async (
    payment: Omit<Payment, 'id' | 'date' | 'status' | 'cashback'>
  ) => {
    const newPayment: Payment = {
      ...payment,
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      cashback: payment.amount * 0.01,
    };

    const updated = [newPayment, ...payments];
    await savePayments(updated);

    return newPayment;
  };

  /* -------------------- Derived -------------------- */

  const totalOutstanding = useMemo(
    () => cards.reduce((sum, c) => sum + c.outstandingAmount, 0),
    [cards]
  );

  const totalCashback = useMemo(
    () => rewards.reduce((sum, r) => sum + (r.claimed ? 0 : r.points), 0),
    [rewards]
  );

  /* -------------------- Debug -------------------- */

  useEffect(() => {
    console.log('[STORE] fundingSources updated:', fundingSources);
  }, [fundingSources]);

  /* -------------------- Exposed API -------------------- */

  return {
    cards,
    payments,
    rewards,
    fundingSources,

    addCard,
    setUserCards,
    makePayment,
    addPaymentSource,
    setPaymentSources,

    totalOutstanding,
    totalCashback,

    isLoading,
  };
});