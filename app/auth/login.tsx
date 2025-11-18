import { useState } from "react";
import ParallaxScrollView from "@/src/components/ParallaxScrollView";
import { useRouter } from "expo-router";
import {
  ImageBackground,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/assets/colors";

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
        <ImageBackground
          source={require("@/assets/images/train_imgage.jpg")}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        >
          <TouchableOpacity
            style={{
              position: "absolute",
              left: 16,
              top: 40,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 999,
              backgroundColor: "rgba(0,0,0,0.6)",
            }}
            onPress={() => router.push("/(tabs)/profile")}
          >
            <Ionicons
              name="chevron-back-circle-sharp"
              size={20}
              color={theme.green}
            />
          </TouchableOpacity>
        </ImageBackground>
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
        style={[{ backgroundColor: "#EA4335" }, styles.loginMethodButton]}
        onPress={() => signInWithGoogle()}
      >
        <Ionicons name="logo-google" size={24} color={theme.textWhite} />
        <Text style={{ color: theme.textWhite }}>{t("signInWithGoogle")}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[{ backgroundColor: "#666666" }, styles.loginMethodButton]}
        onPress={() => signInWithApple()}
      >
        <Ionicons name="logo-apple" color={theme.textWhite} size={24} />
        <Text style={{ color: theme.textWhite }}>{t("signInWithApple")}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[{ backgroundColor: "#3b5998" }, styles.loginMethodButton]}
        onPress={() => signInWithFacebook()}
      >
        <Ionicons name="logo-facebook" size={24} color={theme.textWhite} />
        <Text style={{ color: theme.textWhite }}>
          {t("signInWithFacebook")}
        </Text>
      </TouchableOpacity>
      <Text style={styles.orLogin}>{t("noAcc")}</Text>
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
    // backgroundColor: "#f0f0f0",
    borderRadius: 30,
    marginBottom: 7,
    gap: 10,
  },
  orLogin: {
    textAlign: "center",
    color: "#8e8e8eff",
  },
});
