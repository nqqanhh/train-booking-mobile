import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/assets/colors";

export default function PaymentSuccessScreen() {
  const router = useRouter();

  return (
    <SafeAreaView
      style={{
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        gap: 60,
        paddingHorizontal: 13,
      }}
    >
      <View
        style={{
          borderRadius: "10%",
          backgroundColor: theme.greenDark,
          width: "50%",
          height: "20%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Ionicons
          name="thumbs-up-outline"
          size={80}
          style={{ color: theme.textWhite }}
        />
      </View>
      <View style={{ alignItems: "center", gap: 10 }}>
        <Text style={{ fontSize: 18, fontWeight: 600, textAlign: "center" }}>
          Enjoy your trip!
        </Text>
        <Text style={{ fontSize: 14, fontWeight: 400, textAlign: "center" }}>
          Thank you for booking train tickets with E-Train. Please check your
          tickets again.
        </Text>
      </View>
      <TouchableOpacity
        style={{
          marginTop: 30,
          backgroundColor: theme.green,
          width: "100%",
          height: "10%",
          justifyContent: "center",
          borderRadius: 8,
        }}
        onPress={() => router.replace("/(tabs)/tickets")}
      >
        <Text style={{ textAlign: "center", fontWeight: 600, color: "#fff" }}>
          See your tickets
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
