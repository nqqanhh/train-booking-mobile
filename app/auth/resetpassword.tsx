import { useAuth } from "@/src/hooks/useAuth";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
export default function ResetPasswordScreen() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const { t } = useTranslation();

  const handleGoBack = () => {
    router.replace("/auth/login");
  };
  const { resetPassword } = useAuth();

  const validatePassword = (password: string, cofirmPassword: string) => {
    return password === cofirmPassword;
  };
  const onSubmit = async () => {
    if (!validatePassword(newPassword, confirmPassword)) {
      console.log("Password and confirm password do not match");
      return;
    }
    try {
      const new_password = newPassword;
      const reset_token = (await localStorage.getItem("resetToken")) || "";
      await resetPassword(String(email), reset_token, new_password);
    } catch (error: any) {
      console.log(error?.response?.data?.messsage || error?.message);
    } finally {
      router.replace("/auth/resetpasswordsuccess");
    }
  };
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.exitIcon} onPress={() => handleGoBack()}>
        <Ionicons name="chevron-back" size={40} color="black" />
      </TouchableOpacity>
      <View style={{ marginTop: 90 }}>
        <Text style={styles.title}>{t("setNewPassword")}</Text>
        <Text style={styles.titleUnder}>{t("passwordRequirements")}</Text>
        <View style={{ marginTop: 20 }}>
          <Text style={styles.inputLabel}>{t("password")}</Text>
          <TextInput
            style={styles.input}
            placeholder={t("enterNewPassword")}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={true}
            placeholderTextColor={"#999"}
          />
          <Text style={styles.inputLabel}>{t("confirmPassword")}</Text>
          <TextInput
            style={styles.input}
            placeholder={t("reEnterNewPassword")}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={true}
            placeholderTextColor={"#999"}
          />
        </View>
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#3ac21fff" }]}
            onPress={() => onSubmit()}
          >
            <Text style={styles.buttonText}>{t("confirm")}</Text>
          </TouchableOpacity>
        </View>
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
    marginTop: 100,
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
  minorContainer: {
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
});
