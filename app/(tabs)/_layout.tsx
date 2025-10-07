import { Redirect, Stack } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../../src/hooks/useAuth";

export default function AppLayout() {
  const { user, loading, bootstrap } = useAuth();

  useEffect(() => {
    if (loading) return;
  }, [loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/auth/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="booking/index" />
      <Stack.Screen name="booking/[routeId]" />
      <Stack.Screen name="booking/trip/[tripId]" />
      <Stack.Screen name="booking/checkout" />
      <Stack.Screen name="tickets/index" />
    </Stack>
  );
}
