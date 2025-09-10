import { useRouter } from "expo-router";
import React from "react";
import { Button, Text, View } from "react-native";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 26, fontWeight: "bold", marginBottom: 20 }}>
        🚆 Ứng dụng đặt vé tàu
      </Text>

      <Button
        title="🔍 Tìm chuyến tàu"
        onPress={() => router.push("/(tabs)/explore")}
      />

      <View style={{ height: 10 }} />

      <Button title="🎟 Vé của tôi" onPress={() => router.push("/tickets")} />
    </View>
  );
}
