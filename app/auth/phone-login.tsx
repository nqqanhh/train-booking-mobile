import { useAuth } from "@/src/hooks/useAuth";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
export default function PhoneLogin() {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  // const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [hidePassword, setHidePassword] = useState(true);
  // const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const router = useRouter();
  const { login } = useAuth();
  const { t } = useTranslation();
  const handleGoBack = () => {
    router.back();
  };

  //email validation
  const isEmail = (input: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(input);
  };

  //phone validation
  const isPhoneNumber = (input: string) => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(input);
  };
  //

  const handleShowPasswordLogin = () => {
    setHidePassword(!hidePassword);
  };

  const onSubmit = async () => {
    setLoading(true);
    setErr(null);
    try {
      let email = "";
      let phone = "";
      if (isEmail(emailOrPhone)) {
        email = emailOrPhone;
        console.log("email: ", email);
      } else if (isPhoneNumber(emailOrPhone)) {
        phone = emailOrPhone;
        console.log("phone: ", phone);
      } else {
        throw new Error(
          "Vui lòng nhập đúng định dạng Email hoặc Số điện thoại."
        );
      }

      await login(email.trim(), phone, password);
      router.replace("/(tabs)");
    } catch (error: any) {
      console.log(
        "LOGIN ERROR",
        error?.response?.data?.message || error?.message
      );
      alert(error?.message);
      setErr(error?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
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
      <Text style={styles.titleUnder}>{t("enterPhoneOrEmail")}</Text>
      <View style={styles.middleContainer}>
        <View>
          <Text style={styles.inputLabel}>{t("phoneOrEmail")}</Text>
          <TextInput
            style={styles.input}
            placeholder={t("enterPhoneOrEmailPlaceholder")}
            value={emailOrPhone}
            onChangeText={setEmailOrPhone}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={"#999"}
          />
        </View>
        <View style={{ position: "relative" }}>
          <Text style={styles.inputLabel}>{t("password")}</Text>
          <TextInput
            style={styles.input}
            placeholder={t("enterYourPassword")}
            secureTextEntry={hidePassword}
            value={password}
            onChangeText={setPassword}
            placeholderTextColor={"#999"}
          />
          <Ionicons
            name={hidePassword ? "eye-off-outline" : "eye-outline"}
            size={24}
            color="#9d9d9dff"
            style={styles.showPasswordIcon}
            onPress={handleShowPasswordLogin}
          />
        </View>
        <View style={styles.minorContainer}>
          <TouchableOpacity onPress={() => router.push("/auth/forgotpassword")}>
            <Text style={{ color: "#3ac21fff", fontWeight: "400" }}>
              {t("forgotPassword")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.bottomContainer}>
        <Text style={{ textAlign: "center", marginBottom: 20 }}>
          {t("noAcc")}

          <Link
            href={"/auth/register"}
            style={{ color: "#3ac21fff", fontWeight: "400" }}
          >
            {t("signUp")}
          </Link>
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#3ac21fff" }]}
          onPress={onSubmit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {!loading ? t("signIn") : <ActivityIndicator />}
          </Text>
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
  showPasswordIcon: { position: "absolute", right: 10, top: 38 },
});
