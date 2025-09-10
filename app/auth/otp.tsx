import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { OtpInput } from "react-native-otp-entry";
export default function EnterOTPScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams();

  const [emailState, setEmailState] = useState(email || "");
  const handleGoBack = () => {
    router.replace("/auth/phone-login");
  };
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.exitIcon} onPress={() => handleGoBack()}>
        <Ionicons name="chevron-back" size={40} color="black" />
      </TouchableOpacity>
      <TouchableOpacity
        style={{ position: "absolute", top: "70", right: "40" }}
        onPress={() => router.push("/auth/resetpassword")}
      >
        <Ionicons name="chevron-back" size={40} color="black" />
      </TouchableOpacity>
      <View style={{ paddingVertical: 20, marginTop: 90 }}>
        <Text style={styles.title}>Enter the OTP code</Text>
        <Text style={styles.titleUnder}>
          To confirm the account, enter the 6-digit code we sent to {emailState}{" "}
        </Text>
        <OtpInput
          numberOfDigits={6}
          onTextChange={(text) => console.log(text)}
        />
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
});
