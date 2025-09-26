import { AuthProvider } from "@/hooks/useAuthStore";
import { CardsProvider } from "@/hooks/useCardsStore";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";


SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ 
      headerBackTitle: "Back",
      headerStyle: {
        backgroundColor: '#000000',
      },
      headerTintColor: '#FFFFFF',
      contentStyle: {
        backgroundColor: '#000000',
      }
    }}>
      <Stack.Screen name="landing" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
      <Stack.Screen name="verify-otp" options={{ headerShown: false }} />
      <Stack.Screen name="ssn-verification" options={{ headerShown: false }} />
      <Stack.Screen name="credit-score" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="add-card" 
        options={{ 
          title: "Add Card",
          presentation: "modal",
        }} 
      />
      <Stack.Screen 
        name="card-details/[id]" 
        options={{ 
          title: "Card Details",
        }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={styles.container}>
          <AuthProvider>
            <CardsProvider>
              <RootLayoutNav />
            </CardsProvider>
          </AuthProvider>
        </GestureHandlerRootView>
    </QueryClientProvider>
  );
}