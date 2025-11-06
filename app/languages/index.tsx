import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { changeLanguage } from "../../src/services/i18next";
import { theme } from "@/assets/colors";

export default function index() {
  const { t, i18n } = useTranslation();

  const handleLanguageChange = async (lang: string) => {
    await changeLanguage(lang);
    Alert.alert(t("languageChanged"));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("selectLanguage")}</Text>
      <TouchableOpacity
        style={[styles.button, i18n.language === "en" && styles.selected]}
        onPress={() => handleLanguageChange("en")}
      >
        <Text style={styles.buttonText}>{t("english")}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, i18n.language === "vi" && styles.selected]}
        onPress={() => handleLanguageChange("vi")}
      >
        <Text style={styles.buttonText}>{t("vietnamese")}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
  },
  button: {
    width: "80%",
    padding: 15,
    marginVertical: 10,
    backgroundColor: "#ddd",
    borderRadius: 10,
    alignItems: "center",
  },
  selected: {
    backgroundColor: theme.green,
  },
  buttonText: {
    fontSize: 18,
    color: "#fff",
  },
});
