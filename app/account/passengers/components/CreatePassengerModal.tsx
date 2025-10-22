import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type Passenger = {
  fullName: string;
  id_no: string;
  dob: string;
  phone: string;
};
type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: Passenger) => void;
  title?: string;
  passenger?: Passenger | null;
  submitting?: boolean;
  isEditing?: boolean;
  closeOnBackdropPress?: boolean;
};

const CreatePassengerModal: React.FC<Props> = ({
  visible,
  onClose,
  onSubmit,
  title,
  passenger,
  submitting = false,
  isEditing = false,
  closeOnBackdropPress = true,
}) => {
  const [fullName, setFullName] = useState("");
  const [idNo, setIdNo] = useState("");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (!visible) return;
    setFullName(passenger?.fullName ?? "");
    setIdNo(passenger?.id_no ?? "");
    setDob(passenger?.dob ?? "");
    setPhone(passenger?.phone ?? "");
  }, [passenger, visible]);

  const handleSubmit = () => {
    onSubmit({
      fullName: fullName.trim(),
      id_no: idNo.trim(),
      dob: dob.trim(),
      phone: phone.trim(),
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View
        style={{
          paddingVertical: "15%",
          paddingHorizontal: "5%",
          backgroundColor: "#ffffffff",
          height: "100%",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: "100%",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text style={{ fontSize: 25, fontWeight: "600" }}>
              {isEditing ? "Edit" : "Create"} Passenger Profile
            </Text>
            <Pressable onPress={closeOnBackdropPress ? onClose : undefined}>
              <Ionicons name="close" size={20} />
            </Pressable>
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
          <View style={{ width: "100%", gap: 26 }}>
            <View>
              <Text></Text>
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
                value={idNo}
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
              onPress={handleSubmit}
            >
              <Text style={styles.buttonText}>
                {submitting ? "Saving..." : "Save changes"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    marginTop: "auto",
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 24 : 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E6E6E6",
  },
  title: { fontSize: 18, fontWeight: "600" as const, color: "#0F172A" },
  form: { paddingVertical: 12, gap: 12 },
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
  },
  button: {
    height: 50,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  buttonText: { color: "#fff", fontSize: 18, textAlign: "center" },
});
export default CreatePassengerModal;
