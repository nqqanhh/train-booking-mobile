import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
export default function PhoneLogin() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [hidePassword, setHidePassword] = useState(true);

  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };
  const handleSendOtp = () => {
    // Implement sending OTP logic here
    console.log("Send OTP to:", phoneNumber);
  };

  const handleShowPasswordLogin = () => {
    setHidePassword(!hidePassword);
  };
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => handleGoBack()}>
        <Text
          style={{ color: "#3ac21fff", fontWeight: "400", marginBottom: 20 }}
        >
          &lt; Back
        </Text>
      </TouchableOpacity>
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.titleUnder}>Enter your phone number to sign in</Text>
      <View style={styles.middleContainer}>
        <View>
          <Text style={styles.inputLabel}>Phone numbers</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholderTextColor={"#999"}
          />
        </View>
        <View>
          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            secureTextEntry={hidePassword}
            value={password}
            onChangeText={setPassword}
            placeholderTextColor={"#999"}
          />
        </View>
        <View style={styles.minorContainer}>
          <TouchableOpacity
            style={styles.showPasswordButton}
            onPress={handleShowPasswordLogin}
          >
            <Text style={{ color: "#9d9d9dff", fontWeight: "400" }}>
              Show password
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/auth/forgotpassword")}>
            <Text style={{ color: "#3ac21fff", fontWeight: "400" }}>
              Forgot password?
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.bottomContainer}>
        <Text style={{ textAlign: "center", marginBottom: 20 }}>
          If you don't have an account?{" "}
          <Text style={{ color: "#3ac21fff", fontWeight: "400" }}>Sign up</Text>
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#3ac21fff" }]}
          onPress={handleSendOtp}
        >
          <Text style={styles.buttonText}>Sign In</Text>
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
  minorContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  showPasswordButton: {
    backgroundColor: "#dcfad5ff",
    fontWeight: "400",
    padding: 10,
    borderRadius: 30,
  },
  bottomContainer: {
    flexDirection: "column",
    justifyContent: "space-between",
    marginTop: 90,
  },
  middleContainer: {
    flex: 1,
    gap: 20,
  },
});
