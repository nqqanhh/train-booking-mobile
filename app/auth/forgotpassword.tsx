import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const router = useRouter();
  const handleGoBack = () => {
    router.replace("/auth/login");
  };

  const handleSendEmail = () => {
    if (validateEmail(email) === false) {
      Alert.alert("Invalid email", "Please enter a valid email address.");
      return;
    } else {
      router.replace(`/auth/otp?email=${email}`);
      console.log("Send verification code to email");
    }
  };

  const validateEmail = (email: string) => {
    if (!email.trim()) {
      return false;
    }
  };
  return (
    <View style={[styles.container]}>
      <TouchableOpacity style={styles.exitIcon} onPress={() => handleGoBack()}>
        <Ionicons name="chevron-back" size={40} color="black" />
      </TouchableOpacity>
      <View style={{ marginTop: 90 }}>
        <Text style={styles.title}>Forgot password</Text>
        <Text style={styles.titleUnder}>
          Please enter your email address to get verification code.
        </Text>
        <Text style={styles.inputLabel}>Email address</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email adress"
        />
      </View>
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#3ac21fff" }]}
          onPress={() => handleSendEmail()}
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
  bottomContainer: {
    flexDirection: "column",
    justifyContent: "space-between",
    marginTop: 90,
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
  exitIcon: {
    position: "absolute",
    top: 60,
    left: 40,
  },
});
