import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export interface User {
  id?: number;
  first_name: string;
  last_name: string;
  email: string;
  password?: string;
  creditScore?: number;
  cards?: any[];
  isVerified: boolean;
  agreedToTerms: boolean;
  token?: string;
}

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tempUserData, setTempUserData] = useState<Partial<User>>({});

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const stored = await AsyncStorage.getItem('user');
      if (stored) setUser(JSON.parse(stored));
    } catch (err) {
      console.error('Error loading user', err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUser = async (userData: User) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setTempUserData({});
    } catch (err) {
      console.error('Error saving user', err);
    }
  };

  const updateTempUserData = (data: Partial<User>) => {
    setTempUserData(prev => ({ ...prev, ...data }));
  };

  const clearTempUserData = () => setTempUserData({});

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
      setTempUserData({});
    } catch (err) {
      console.error('Error logging out', err);
    }
  };

  return {
    user,
    isLoading,
    tempUserData,
    saveUser,
    updateTempUserData,
    clearTempUserData,
    logout,
  };
});