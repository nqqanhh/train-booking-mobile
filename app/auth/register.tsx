import Entypo from "@expo/vector-icons/Entypo";
import { useRouter } from "expo-router";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
export default function RegisterPage() {
  const router = useRouter();
  const handleGoBack = () => {
    router.replace("/auth/login");
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
      <Text style={styles.inputLabel}>Phone numbers</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your phone number"
        placeholderTextColor={"#999"}
      />
      <Text style={styles.inputLabel}>Address</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your address"
        placeholderTextColor={"#999"}
      />
      <Text style={styles.inputLabel}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        secureTextEntry={true}
        placeholderTextColor={"#999"}
      />
      <Text style={styles.inputLabel}>Confirm Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Re-enter your password"
        secureTextEntry={true}
        placeholderTextColor={"#999"}
      />
      <Text style={{ fontSize: 14, marginTop: 10 }}>
        By entering and tapping Register, you agree to the
        <Text> Term</Text> & <Text>Privacy Policy</Text>.{" "}
      </Text>
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#3ac21fff" }]}
          onPress={() => console.log("pressed register")}
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
