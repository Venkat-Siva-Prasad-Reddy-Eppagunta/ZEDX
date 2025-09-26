import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export interface User {
  firstName: string;
  lastName: string;
  email: string;
  ssn: string;
  creditScore: number;
  isVerified: boolean;
  agreedToTerms: boolean;
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
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUser = async (userData: User) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const updateTempUserData = (data: Partial<User>) => {
    setTempUserData(prev => ({ ...prev, ...data }));
  };

  const clearTempUserData = () => {
    setTempUserData({});
  }; // remove after testing ==> Testing purpose only

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
      setTempUserData({});
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return {
    user,
    isLoading,
    tempUserData,
    saveUser,
    updateTempUserData,
    clearTempUserData, // remove after testing ==> Testing purpose only
    logout,
  };
});