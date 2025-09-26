import { mockCards, mockPayments, mockRewards } from '@/mocks/data';
import { CreditCard, Payment, Reward } from '@/types/card';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

export const [CardsProvider, useCards] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);

  // Load cards from storage
  const cardsQuery = useQuery({
    queryKey: ['cards'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem('cards');
      return stored ? JSON.parse(stored) : mockCards;
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

  // --- Existing functions ---
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

  // --- NEW CLEAR FUNCTIONS --- // remove after testing ==> Testing purpose only
  const clearCards = async () => {
    setCards([]);
    await AsyncStorage.removeItem('cards');
    queryClient.invalidateQueries({ queryKey: ['cards'] });
  };

  const clearPayments = async () => {
    setPayments([]);
    await AsyncStorage.removeItem('payments');
    queryClient.invalidateQueries({ queryKey: ['payments'] });
  };

  const clearRewards = async () => {
    setRewards([]);
    await AsyncStorage.removeItem('rewards');
    queryClient.invalidateQueries({ queryKey: ['rewards'] });
  };

  const clearAll = async () => {
    setCards([]);
    setPayments([]);
    setRewards([]);
    await AsyncStorage.multiRemove(['cards', 'payments', 'rewards']);
    queryClient.invalidateQueries();
  }; // remove after testing ==> Testing purpose only
  // --- END NEW CLEAR FUNCTIONS ---

  // --- Stats ---
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
    addCard,
    removeCard,
    makePayment,
    claimReward,
    clearCards,
    clearPayments,
    clearRewards,
    clearAll,
    totalOutstanding,
    totalCashback,
    isLoading: cardsQuery.isLoading || paymentsQuery.isLoading || rewardsQuery.isLoading,
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