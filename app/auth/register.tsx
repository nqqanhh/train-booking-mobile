import { theme } from "@/assets/colors";
import { useAuth } from "@/src/hooks/useAuth";
import Entypo from "@expo/vector-icons/Entypo";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Link } from "expo-router";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
export default function RegisterPage() {
  const [full_name, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [hidePassword, setHidePassword] = useState(true);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { register } = useAuth();

  const { t } = useTranslation();
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
    setLoading(true);
    try {
      await register(full_name, email, phone, password);
      Alert.alert(
        "Success",
        "Tạo tài khoản thành công! Hãy đăng nhập để tiếp tục.",
        [{ text: "OK", onPress: () => router.replace("/auth/login") }]
      );
      console.log("Tạo tài khoản thành công!");
      // router.replace("/auth/phone-login");
    } catch (error: any) {
      console.log(
        "REGISTER ERROR",
        error?.response?.data?.message || error?.message
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      {/* <TouchableOpacity style={styles.exitIcon} onPress={() => handleGoBack()}>
        <Entypo name="cross" size={40} color="black" onPress={handleGoBack} />
      </TouchableOpacity> */}

      <Text style={styles.title}>{t("joinWithUs")}</Text>
      <Text style={styles.titleUnder}>{t("allFieldsRequired")}</Text>
      <Text style={styles.inputLabel}>{t("fullName")}</Text>
      <TextInput
        style={styles.input}
        value={full_name}
        onChangeText={setFullName}
        placeholder={t("enterYourFullName")}
        placeholderTextColor={"#999"}
      />
      <Text style={styles.inputLabel}>{t("email")}</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder={t("enterYourEmail")}
        placeholderTextColor={"#999"}
      />
      <Text style={styles.inputLabel}>{t("phoneNumbers")}</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        placeholder={t("enterYourPhoneNumber")}
        placeholderTextColor={"#999"}
      />

      <Text style={styles.inputLabel}>{t("password")}</Text>
      <TextInput
        style={styles.input}
        placeholder={t("enterYourPassword")}
        secureTextEntry={hidePassword}
        placeholderTextColor={"#999"}
        value={password}
        onChangeText={setPassword}
      />
      <Text style={styles.inputLabel}>{t("confirmPassword")}</Text>
      <TextInput
        style={styles.input}
        placeholder={t("reEnterYourPassword")}
        secureTextEntry={hidePassword}
        placeholderTextColor={"#999"}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <Text style={{ fontSize: 14, marginTop: 10 }}>
        {t("termsAndPrivacyPre")}
        <Link
          href="https://dsvn.vn/#/pages/chinhsachbaomat"
          style={{ fontSize: 14, marginTop: 10, color: theme.green }}
        >
          {t("termsAndPrivacy")}
        </Link>
      </Text>
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#3ac21fff" }]}
          onPress={() => onSubmit()}
          disabled={
            loading || !handleValidatePassword(password, confirmPassword)
          }
        >
          <Text style={styles.buttonText}>
            {loading ? (
              <ActivityIndicator color={theme.textWhite} />
            ) : (
              t("register")
            )}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    paddingHorizontal: 20,
    paddingBottom: 0,
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
    marginBottom: 0,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
  },
  bottomContainer: {
    flexDirection: "column",
    justifyContent: "space-between",
    paddingVertical: 20,
  },
  exitIcon: {
    backgroundColor: "#f0f0f0",
    position: "absolute",
    top: 60,
    right: 40,
  },
});
