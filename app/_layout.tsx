import { AuthProvider } from "@/src/context/AuthContext";
import { SplashScreen, Stack } from "expo-router";
SplashScreen.preventAutoHideAsync().catch(() => {});
export default function Root() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}
