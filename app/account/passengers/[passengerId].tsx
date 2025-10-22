import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  getOnePassenger,
  Passenger,
  updatePassengerProfile,
} from "@/src/services/userApi";

export default function PassengerDetails() {
  const { passengerId } = useLocalSearchParams<{ passengerId: string }>();
  const [fullName, setFullName] = useState<any>("");
  const [id_no, setIdNo] = useState<any>("");
  const [dob, setDob] = useState<any>("");
  const [phone, setPhone] = useState<any>("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const id = Number(passengerId);

  const fetchData = async () => {
    const res = await getOnePassenger(id);
    setFullName(res.full_name);
    setIdNo(res.id_no);
    setDob(res.dob);
    setPhone(res.phone);
  };
  useEffect(() => {
    fetchData();
  }, []);

  const handleGoBack = () => {
    router.back();
  };

  const onSubmit = async () => {
    try {
      setSaving(true);
      const payload: Passenger = {
        fullName,
        id_no,
        dob,
        phone,
      };
      await updatePassengerProfile(payload, id);
      router.replace("/account/passengers");
    } catch (e: any) {
      console.log("update passenger error:", e);
    } finally {
      setSaving(false);
    }
  };
  if (loading) {
    return (
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator />
      </View>
    );
  }
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
          <Text style={{ fontSize: 25, fontWeight: "600" }}>Personal Info</Text>
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
        <View style={{ gap: 3 }}>
          <Text style={{ fontSize: 26, fontWeight: 600 }}>{fullName}</Text>
        </View>
        <View style={{ width: "100%", gap: 26 }}>
          <View>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              value={fullName}
              onChangeText={setFullName}
              placeholderTextColor={"#999"}
            />
          </View>
          <View>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your id number"
              value={id_no}
              onChangeText={setIdNo}
              autoCapitalize="none"
              placeholderTextColor={"#999"}
            />
          </View>
          <View>
            <Text style={styles.inputLabel}>Phone numbers</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your phone number"
              value={phone}
              onChangeText={setPhone}
              autoCapitalize="none"
              placeholderTextColor={"#999"}
            />
          </View>
          <View>
            <Text style={styles.inputLabel}>Date of Birth</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your DOB"
              value={dob}
              onChangeText={setDob}
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
              {saving ? "Saving..." : "Save changes"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
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
