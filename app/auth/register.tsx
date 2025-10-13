import { useAuth } from "@/src/hooks/useAuth";
import Entypo from "@expo/vector-icons/Entypo";
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
export default function RegisterPage() {
  const [full_name, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [hidePassword, setHidePassword] = useState(true);
  const [confirmPassword, setConfirmPassword] = useState("");

  const router = useRouter();
  const { register } = useAuth();

  const handleGoBack = () => {
    router.replace("/auth/login");
  };
  const handleValidatePassword = (password: string, cofirmPassword: string) => {
    return password === cofirmPassword;
  };
  const handleShowPasswordLogin = () => {
    setHidePassword(!hidePassword);
  };
  const onSubmit = async () => {
    try {
      await register(full_name, email, phone, password);
      Alert.alert(
        "Success",
        "Tạo tài khoản thành công! Hãy đăng nhập để tiếp tục.",
        [{ text: "OK", onPress: () => router.replace("/auth/login") }]
      );
      console.log("Tạo tài khoản thành công!");
      router.replace("/auth/phone-login");
    } catch (error: any) {
      console.log(
        "REGISTER ERROR",
        error?.response?.data?.message || error?.message
      );
    }
  };
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.exitIcon} onPress={() => handleGoBack()}>
        <Entypo name="cross" size={40} color="black" onPress={handleGoBack} />{" "}
      </TouchableOpacity>

      <Text style={styles.title}>Join with us</Text>
      <Text style={styles.titleUnder}>
        All fields required unless otherwise noted
      </Text>
      {/*  */}
      <Text style={styles.inputLabel}>Full name</Text>
      <TextInput
        style={styles.input}
        value={full_name}
        onChangeText={setFullName}
        placeholder="Enter your full name"
        placeholderTextColor={"#999"}
      />
      <Text style={styles.inputLabel}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Enter your email"
        placeholderTextColor={"#999"}
      />
      <Text style={styles.inputLabel}>Phone numbers</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        placeholder="Enter your phone number"
        placeholderTextColor={"#999"}
      />

      <Text style={styles.inputLabel}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        secureTextEntry={hidePassword}
        placeholderTextColor={"#999"}
        value={password}
        onChangeText={setPassword}
      />
      <Text style={styles.inputLabel}>Confirm Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Re-enter your password"
        secureTextEntry={hidePassword}
        placeholderTextColor={"#999"}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <Text style={{ fontSize: 14, marginTop: 10 }}>
        By entering and tapping Register, you agree to the
        <Text> Term</Text> & <Text>Privacy Policy</Text>.{" "}
      </Text>
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#3ac21fff" }]}
          onPress={() => onSubmit()}
        >
          <Text style={styles.buttonText}>Register</Text>
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
  bottomContainer: {
    flexDirection: "column",
    justifyContent: "space-between",
    marginTop: 90,
  },
  exitIcon: {
    backgroundColor: "#f0f0f0",
    position: "absolute",
    top: 60,
    right: 40,
  },
});
