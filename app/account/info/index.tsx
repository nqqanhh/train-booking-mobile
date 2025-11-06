import {
  View,
  Text,
  Image,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useAuth } from "@/src/hooks/useAuth";
import { getMe } from "@/src/services/authApi";
import { useTranslation } from "react-i18next";
const GREEN = "#3ac21fff";
const GREEN_DARK = "#5CA33A";
const BG = "#F6FAF6";
const CARD = "#FFFFFF";
const TEXT = "#0F172A";
const SUB = "#919296ff";
const PROFILE_CARD = "#bbbbbbff";
const LINE = "#E8EEE8";
const PersonalInfo = () => {
  const { user, updateProfile } = useAuth();
  const { t } = useTranslation();

  const [fullName, setFullName] = useState<any>(user?.full_name || "");
  const [email, setEmail] = useState<any>(user?.email || "");
  const [phone, setPhone] = useState<any>(user?.phone || "");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const handleGoBack = async () => {
    await router.push("/(tabs)/profile");
    console.log("router back");
  };

  const onSubmit = async () => {
    try {
      setSaving(true);
      await updateProfile(fullName.trim(), email.trim(), phone.trim());
      Alert.alert(t("success"), t("profileUpdated"));
      router.replace("/(tabs)/profile");
    } catch (error: any) {
      console.log(error?.response?.data?.messsage || error?.message);
      Alert.alert(
        t("updateFailed"),
        error?.response?.data?.messsage || error?.message || "Error"
      );
    } finally {
      setSaving(false);
    }
  };
  return (
    <View
      style={{
        paddingVertical: "15%",
        paddingHorizontal: "5%",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Ionicons
          name="chevron-back"
          size={20}
          onPress={() => handleGoBack()}
        />
        <View style={{ width: "70%" }}>
          <Text style={{ fontSize: 25, fontWeight: "600" }}>
            {t("personalInfo")}
          </Text>
        </View>
      </View>
      {/*  */}
      <View
        style={{
          flexDirection: "column",
          gap: 35,
          alignItems: "center",
          marginTop: 50,
        }}
      >
        <Image
          source={require("../../../assets/images/dummy_avt.png")}
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
          }}
        />
        <View style={{ gap: 3 }}>
          <Text style={{ fontSize: 26, fontWeight: 600 }}>{fullName}</Text>
          <Text style={{ color: GREEN, textAlign: "center" }}>
            {t("uploadProfilePicture")}
          </Text>
        </View>
        <View style={{ width: "100%", gap: 26 }}>
          <View>
            <Text style={styles.inputLabel}>{t("fullName")}</Text>
            <TextInput
              style={styles.input}
              placeholder={t("enterFullName")}
              value={fullName}
              onChangeText={setFullName}
              placeholderTextColor={"#999"}
            />
          </View>
          <View>
            <Text style={styles.inputLabel}>{t("email")}</Text>
            <TextInput
              style={styles.input}
              placeholder={t("enterEmail")}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              placeholderTextColor={"#999"}
            />
          </View>
          <View>
            <Text style={styles.inputLabel}>{t("phoneNumbers")}</Text>
            <TextInput
              style={styles.input}
              placeholder={t("enterPhoneNumber")}
              value={phone}
              onChangeText={setPhone}
              autoCapitalize="none"
              placeholderTextColor={"#999"}
            />
          </View>
        </View>
        <View style={{ width: "100%" }}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#3ac21fff" }]}
            onPress={() => onSubmit()}
          >
            <Text style={styles.buttonText}>
              {saving ? t("saving") : t("saveChanges")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
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
    borderRadius: 8,
    marginBottom: 7,
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
  },
});

export default PersonalInfo;
