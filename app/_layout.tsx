// app/_layout.tsx
import { Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useContext } from "react";
import { AuthProvider, AuthContext } from "@/src/context/AuthContext";
import i18next from "../src/services/i18next";
import { useTranslation } from "react-i18next";
function Nav() {
  const { t } = useTranslation();
  const { user, hydrate } = useContext(AuthContext);
  console.log("hydrate:", hydrate);
  if (!hydrate) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {user ? <Stack.Screen name="(tabs)" /> : <Stack.Screen name="auth" />}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <Nav />
    </AuthProvider>
  );
}
