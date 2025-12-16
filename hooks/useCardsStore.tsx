import { mockPayments, mockPaymentSources, mockRewards } from '@/mocks/data';
import { CreditCard, Payment, PaymentSource, Reward } from '@/types/card';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
//import { useAuth } from './useAuthStore';

export const [CardsProvider, useCards] = createContextHook(() => {
  const queryClient = useQueryClient();
  //const { user } = useAuth();
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [paymentSources, setPaymentSources] = useState<PaymentSource[]>([]);

  // Load cards from storage
  const cardsQuery = useQuery({
    queryKey: ['cards'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem('cards');
      return stored ? JSON.parse(stored) : [];
    }
  });

  // Load payments from storage
  const paymentsQuery = useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem('payments');
      return stored ? JSON.parse(stored) : mockPayments;
    }
  });

  // Load rewards from storage
  const rewardsQuery = useQuery({
    queryKey: ['rewards'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem('rewards');
      return stored ? JSON.parse(stored) : mockRewards;
    }
  });

  // Load payment sources from storage
  const paymentSourcesQuery = useQuery({
    queryKey: ['paymentSources'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem('paymentSources');
      return stored ? JSON.parse(stored) : mockPaymentSources;
    }
  });

  // Sync cards mutation
  const syncCardsMutation = useMutation({
    mutationFn: async (cards: CreditCard[]) => {
      await AsyncStorage.setItem('cards', JSON.stringify(cards));
      return cards;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
    }
  });

  // Sync payments mutation
  const syncPaymentsMutation = useMutation({
    mutationFn: async (payments: Payment[]) => {
      await AsyncStorage.setItem('payments', JSON.stringify(payments));
      return payments;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    }
  });

  // Sync rewards mutation
  const syncRewardsMutation = useMutation({
    mutationFn: async (rewards: Reward[]) => {
      await AsyncStorage.setItem('rewards', JSON.stringify(rewards));
      return rewards;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
    }
  });

  // Sync payment sources mutation
  const syncPaymentSourcesMutation = useMutation({
    mutationFn: async (sources: PaymentSource[]) => {
      await AsyncStorage.setItem('paymentSources', JSON.stringify(sources));
      return sources;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentSources'] });
    }
  });

  useEffect(() => {
    if (cardsQuery.data) {
      setCards(cardsQuery.data);
    }
  }, [cardsQuery.data]);

  useEffect(() => {
    if (paymentsQuery.data) {
      setPayments(paymentsQuery.data);
    }
  }, [paymentsQuery.data]);

  useEffect(() => {
    if (rewardsQuery.data) {
      setRewards(rewardsQuery.data);
    }
  }, [rewardsQuery.data]);

  useEffect(() => {
    if (paymentSourcesQuery.data) {
      setPaymentSources(paymentSourcesQuery.data);
    }
  }, [paymentSourcesQuery.data]);

  const addCard = (card: CreditCard) => {
    const updated = [...cards, card];
    setCards(updated);
    syncCardsMutation.mutate(updated);
  };

  const removeCard = (cardId: string) => {
    const updated = cards.filter(c => c.id !== cardId);
    setCards(updated);
    syncCardsMutation.mutate(updated);
  };

  const makePayment = (payment: Omit<Payment, 'id' | 'date' | 'status' | 'cashback'>) => {
    const newPayment: Payment = {
      ...payment,
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      cashback: payment.amount * 0.01, // 1% cashback
    };

    // Update card outstanding amount
    const updatedCards = cards.map(card => {
      if (card.id === payment.cardId) {
        return {
          ...card,
          outstandingAmount: Math.max(0, card.outstandingAmount - payment.amount),
          availableCredit: card.availableCredit + payment.amount,
        };
      }
      return card;
    });

    // Add reward for payment
    const newReward: Reward = {
      id: Date.now().toString(),
      title: 'Payment Cashback',
      description: `${newPayment.cashback.toFixed(2)} cashback earned`,
      points: Math.floor(newPayment.cashback),
      icon: '💵',
      claimed: false,
      expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };

    const updatedPayments = [newPayment, ...payments];
    const updatedRewards = [newReward, ...rewards];

    setCards(updatedCards);
    setPayments(updatedPayments);
    setRewards(updatedRewards);

    syncCardsMutation.mutate(updatedCards);
    syncPaymentsMutation.mutate(updatedPayments);
    syncRewardsMutation.mutate(updatedRewards);

    return newPayment;
  };

  const claimReward = (rewardId: string) => {
    const updated = rewards.map(r => 
      r.id === rewardId ? { ...r, claimed: true } : r
    );
    setRewards(updated);
    syncRewardsMutation.mutate(updated);
  };

  const addPaymentSource = (source: PaymentSource) => {
    const updated = [...paymentSources, source];
    setPaymentSources(updated);
    syncPaymentSourcesMutation.mutate(updated);
  };

  const removePaymentSource = (sourceId: string) => {
    const updated = paymentSources.filter(s => s.id !== sourceId);
    setPaymentSources(updated);
    syncPaymentSourcesMutation.mutate(updated);
  };

  const setUserCards = useCallback((userCards: any[], userName: string) => {
      const formattedCards: CreditCard[] = userCards.map(card => ({
        id: card.id.toString(),
        bankName: card.name,
        cardNumber: card.mask,
        outstandingAmount: parseFloat(card.current_balance) || 0,
        availableCredit: parseFloat(card.available_balance) || 0,
        creditLimit: parseFloat(card.credit_limit) || 0,
        minimumDue: parseFloat(card.min_due) || 0,
        dueDate: card.next_due_date || null,
        cardHolder: userName,
        color: 'default', // Default color
        cardType: 'Unknown', // Default card type
      }));

      setCards(formattedCards);
      syncCardsMutation.mutate(formattedCards);
  }, [syncCardsMutation]);

  const clearCards = useCallback(() => {
    setCards([]);
    syncCardsMutation.mutate([]); // Clear cards in AsyncStorage
  }, [syncCardsMutation]);

  const totalOutstanding = useMemo(() => 
    cards.reduce((sum, card) => sum + card.outstandingAmount, 0),
    [cards]
  );

  const totalCashback = useMemo(() => 
    rewards.reduce((sum, reward) => sum + (reward.claimed ? 0 : reward.points), 0),
    [rewards]
  );

  return {
    cards,
    payments,
    rewards,
    paymentSources,
    addCard,
    removeCard,
    makePayment,
    claimReward,
    addPaymentSource,
    removePaymentSource,
    setUserCards,
    clearCards, // Expose clearCards method
    totalOutstanding,
    totalCashback,
    isLoading: cardsQuery.isLoading || paymentsQuery.isLoading || rewardsQuery.isLoading || paymentSourcesQuery.isLoading,
  };
});

export function useCardById(cardId: string) {
  const { cards } = useCards();
  return cards.find(card => card.id === cardId);
}

export function usePaymentsByCard(cardId: string) {
  const { payments } = useCards();
  return payments.filter(payment => payment.cardId === cardId);
}