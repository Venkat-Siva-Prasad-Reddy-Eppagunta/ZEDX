import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';
import { create, LinkExit, LinkSuccess, open } from 'react-native-plaid-link-sdk';
import { useAuth } from '../hooks/useAuthStore';
import { useCards } from '../hooks/useCardsStore';

export default function AddCard() {
  const { user } = useAuth();
  const { setUserCards } = useCards();

  const [loading, setLoading] = useState(false);

  // STEP 1: Request Link Token from Backend
  const createLinkToken = async () => {
    if (loading) return; // Prevent multiple calls if already loading

    setLoading(true);

    try {
      const response = await fetch("http://Venkatas-MacBook-Air.local:5001/api/plaid/create-link-token", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user?.token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!data.link_token) {
        throw new Error("Failed to get Plaid link token");
      }

      console.log("Received link token:", data.link_token);

      return data.link_token;
    } catch (error) {
      console.error("Error creating link token:", error);
      Alert.alert("Error", "Unable to initialize Plaid.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Launch Plaid Link
  const handlePlaid = async () => {
    if (loading) return; // Prevent multiple calls if already loading

    const linkToken = await createLinkToken();
    if (!linkToken) return;

    // Setup Link configuration
    create({ token: linkToken });

    // Open Plaid screen
    open({
      onSuccess: async (success: LinkSuccess) => {
        const publicToken = success.publicToken;

        // STEP 3: Send public_token to backend
        await exchangePublicToken(publicToken);

        Alert.alert("Success", "Card linked successfully.");

        // NAVIGATE to Home screen here
        router.replace("/(tabs)/cards");
      },

      onExit: (exit: LinkExit) => {
        console.log("Plaid Exit:", exit);
        Alert.alert("Cancelled", "You exited Plaid without linking a card.");
      },
    });
  };

  // STEP 3: Exchange public_token with backend
  const exchangePublicToken = async (publicToken: string) => {
    try {
      const res = await fetch("http://Venkatas-MacBook-Air.local:5001/api/plaid/exchange-public-token", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user?.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ public_token: publicToken }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error("Token exchange failed");
      }

      // Save cards into global store
      setUserCards(data.cards);
    } catch (error) {
      console.error("Error exchanging token:", error);
      Alert.alert("Error", "Unable to link your card.");
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
      <TouchableOpacity
        onPress={() => router.back()} // Close button functionality
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          //backgroundColor: '#f5f5f5',
          borderRadius: 10,
          padding: 10,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>X</Text>
      </TouchableOpacity>

      <Text style={{ fontSize: 24, fontWeight: '600', marginBottom: 20 }}>
        Add Your First Credit Card
      </Text>

      <TouchableOpacity
        onPress={handlePlaid}
        style={{
          backgroundColor: "#0dbd8b",
          padding: 15,
          borderRadius: 10,
          alignItems: "center",
        }}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: "#fff", fontSize: 17 }}>Connect with Plaid</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}