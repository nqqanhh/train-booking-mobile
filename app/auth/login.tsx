import ParallaxScrollView from "@/src/components/ParallaxScrollView";
import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";

export default function Login() {
  const router = useRouter();
  const { t } = useTranslation();
  const signInWithGoogle = async () => {
    // Implement Google Sign-In logic here
  };
  const signInWithApple = async () => {
    // Implement Apple Sign-In logic here
  };
  const signInWithFacebook = async () => {
    // Implement Facebook Sign-In logic here
  };
  const signInWithPhone = async () => {
    router.push("/auth/phone-login");
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
      headerImage={
        <Image
          source={require("@/assets/images/train_imgage.jpg")}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        />
      }
    >
      <Text style={styles.titleLogin}>{t("login")}</Text>
      <Text style={styles.titleUnder}>{t("chooseLoginMethod")}</Text>
      <TouchableOpacity
        style={[styles.loginMethodButton, { backgroundColor: "#3ac21fff" }]}
        onPress={() => signInWithPhone()}
      >
        <Text style={{ color: "#fff" }}>{t("continueWithPhone")}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.loginMethodButton}
        onPress={() => signInWithGoogle()}
      >
        <Text>{t("signInWithGoogle")}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.loginMethodButton}
        onPress={() => signInWithApple()}
      >
        <Text>{t("signInWithApple")}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.loginMethodButton}
        onPress={() => signInWithFacebook()}
      >
        <Text>{t("signInWithFacebook")}</Text>
      </TouchableOpacity>
      <Text style={styles.orLogin}>{t("orLoginWith")}</Text>
      <TouchableOpacity
        style={[styles.loginMethodButton, { backgroundColor: "#def8d8ff" }]}
        onPress={() => router.push("/auth/register")}
      >
        <Text style={{ color: "#3ac21fff" }}>{t("createAccount")}</Text>
      </TouchableOpacity>
    </ParallaxScrollView>
  );
}
const styles = StyleSheet.create({
  // headerContainer: {
  //   height: 200,
  //   justifyContent: "center",
  //   alignItems: "center",
  // },
  // headerImage: {
  //   width: "100%",
  //   height: "100%",
  // },
  titleLogin: {
    fontSize: 44,
    fontWeight: "bold",
    color: "#e5e5e5ff",
  },
  titleUnder: {
    fontSize: 18,
    color: "#b5b5b5ff",
    marginBottom: 10,
  },
  loginMethodButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    height: 50,
    backgroundColor: "#f0f0f0",
    borderRadius: 30,
    marginBottom: 7,
  },
  orLogin: {
    textAlign: "center",
    color: "#8e8e8eff",
  },
});
