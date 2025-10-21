import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
const GREEN = "#3ac21fff";
const GREEN_DARK = "#5CA33A";
const BG = "#F6FAF6";
const CARD = "#FFFFFF";
const TEXT = "#0F172A";
const SUB = "#919296ff";
const PROFILE_CARD = "#bbbbbbff";
const LINE = "#E8EEE8";
const ResetPasswordSuccess = () => {
  const router = useRouter();
  const handleRedirectLogin = () => {
    router.push("/auth/login");
  };
  return (
    <View
      style={{
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        gap: 60,
        paddingHorizontal: 13,
      }}
    >
      <View
        style={{
          borderRadius: "50%",
          backgroundColor: "#7cebaeff",
          width: "50%",
          height: "20%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Ionicons name="thumbs-up-outline" size={80} style={{ color: GREEN }} />
      </View>
      <View style={{ alignItems: "center", gap: 10 }}>
        <Text style={{ fontSize: 18, fontWeight: 600, textAlign: "center" }}>
          Your password has been changed successfully
        </Text>
        <Text style={{ fontSize: 14, fontWeight: 400 }}>
          You can login with new password
        </Text>
      </View>
      <TouchableOpacity
        style={{
          marginTop: 30,
          backgroundColor: GREEN,
          width: "100%",
          height: "5vh",
          justifyContent: "center",
          borderRadius: 8,
        }}
        onPress={() => handleRedirectLogin()}
      >
        <Text style={{ textAlign: "center", fontWeight: 600, color: "#fff" }}>
          Go back to Login
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ResetPasswordSuccess;
