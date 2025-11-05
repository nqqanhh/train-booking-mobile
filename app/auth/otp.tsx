import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { OtpInput } from "react-native-otp-entry";
import { useAuth } from "@/src/hooks/useAuth";

export default function EnterOTPScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [emailState, setEmailState] = useState(email || "");

  const { verifyOtp } = useAuth();

  const handleGoBack = () => {
    router.replace("/auth/phone-login");
  };

  const onSubmit = async () => {
    try {
      await verifyOtp(emailState, otp);
      router.replace(`/auth/resetpassword?email=${emailState}`);
    } catch (error) {}
  };
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.push("/auth/forgotpassword")}>
        <Ionicons name="chevron-back" size={40} color="black" />
      </TouchableOpacity>
      <View style={{ paddingVertical: 20, marginTop: 90 }}>
        <Text style={styles.title}>Enter the OTP code</Text>
        <Text style={styles.titleUnder}>
          To confirm the account, enter the 6-digit code we sent to {emailState}{" "}
        </Text>
        <OtpInput numberOfDigits={6} onTextChange={setOtp} />
      </View>
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#3ac21fff" }]}
          onPress={() => onSubmit()}
        >
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",

    paddingHorizontal: 20,
    paddingVertical: 70,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    // textAlign: "center",
  },
  titleUnder: {
    fontSize: 16,
    color: "#666",
    marginBottom: 40,
    // textAlign: "center",
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 5,
    color: "#333",
    fontWeight: "600",
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  button: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    height: 50,
    backgroundColor: "#f0f0f0",
    borderRadius: 30,
    marginBottom: 7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
  },
  exitIcon: {
    position: "absolute",
    top: 60,
    left: 40,
  },
  bottomContainer: {
    flexDirection: "column",
    justifyContent: "space-between",
    marginTop: 90,
  },
});
