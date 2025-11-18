// app/(booking)/trip/components/PreviewOrderModal.tsx
import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Autocomplete from "react-native-autocomplete-input";
import {
  getPassengerProfiles,
  createPassengerProfile,
} from "@/src/services/userApi";
import { useRouter } from "expo-router";

import CreatePassengerModal from "@/app/account/passengers/components/CreatePassengerModal";
import { theme } from "@/assets/colors";

export type OrderPreview = {
  trip_id?: string | number;
  trip_name: string;
  departure_time: string;
  seats?: Array<{
    seat_code: string;
    price: number;
    passenger_id?: number;
    passenger_name?: string;
  }>;
  total?: number;
};

type PassengerOption = { id: number; name: string; phone?: string };

type Props = {
  visible: boolean;
  onCloseModal: () => void;
  onConfirm?: (assignments: Record<string, PassengerOption | null>) => void;
  title?: string;
  order?: OrderPreview | null;
  loading?: boolean;
  closeOnBackdropPress?: boolean;
};

const PreviewOrderModal: React.FC<Props> = ({
  visible,
  onCloseModal,
  onConfirm,
  title = "Order preview",
  order,
  loading,
  closeOnBackdropPress = true,
}) => {
  const [passengers, setPassengers] = useState<PassengerOption[]>([]);
  const [queries, setQueries] = useState<Record<string, string>>({});
  const [assignments, setAssignments] = useState<
    Record<string, PassengerOption | null>
  >({});
  const [openCreatePassengerModal, setOpenCreatePassengerModal] =
    useState(false);
  const [seatForNewPassenger, setSeatForNewPassenger] = useState<string | null>(
    null
  );

  const router = useRouter();
  useEffect(() => {
    (async () => {
      try {
        const res = await getPassengerProfiles();
        const opts: PassengerOption[] = (Array.isArray(res) ? res : [])
          .map((it: any) => ({
            id: Number(it.id ?? it.passenger_id ?? 0),
            name: String(it.full_name ?? it.name ?? ""),
            phone: it.phone,
          }))
          .filter((o) => !!o.id && !!o.name);
        setPassengers(opts);
      } catch (e) {
        console.log("fetch passengers error:", e);
        setPassengers([]);
      }
    })();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const initQ: Record<string, string> = {};
    const initA: Record<string, PassengerOption | null> = {};
    (order?.seats ?? []).forEach((s) => {
      initQ[s.seat_code] = s.passenger_name ?? "";
      initA[s.seat_code] =
        s.passenger_id && s.passenger_name
          ? { id: Number(s.passenger_id), name: s.passenger_name }
          : null;
    });
    setQueries(initQ);
    setAssignments(initA);
  }, [visible, order?.seats]);

  const filtered = (seatCode: string) => {
    const q = (queries[seatCode] ?? "").toLowerCase().trim();
    if (!q) return [];
    return passengers.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.phone ?? "").toLowerCase().includes(q)
    );
  };

  const selectPassenger = (seatCode: string, p: PassengerOption) => {
    setAssignments((prev) => ({ ...prev, [seatCode]: p }));
    setQueries((prev) => ({ ...prev, [seatCode]: p.name }));
  };

  const handleAddPassenger = (seatCode: string) => {
    setSeatForNewPassenger(seatCode);
    setOpenCreatePassengerModal(true);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onCloseModal}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, justifyContent: "flex-end" }} // Adjust as needed
      >
        <View style={styles.container}>
          <Pressable
            style={styles.backdrop}
            onPress={closeOnBackdropPress ? onCloseModal : undefined}
          />
          <View style={styles.sheet}>
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <Pressable onPress={onCloseModal} hitSlop={10}>
                <Ionicons name="close" size={22} color="#0F172A" />
              </Pressable>
            </View>

            <View style={styles.content}>
              {loading ? (
                <Text>Đang tính toán…</Text>
              ) : !order ? (
                <Text>Chưa có dữ liệu.</Text>
              ) : (
                <>
                  <Text style={styles.row}>Chuyến: {order.trip_id ?? "—"}</Text>
                  <Text style={styles.row}>
                    Tuyến: {order.trip_name ?? "—"}
                  </Text>
                  <Text style={styles.row}>
                    Thời gian khởi hành: {order.departure_time ?? "—"}
                  </Text>

                  <View style={{ marginTop: 8 }}>
                    <Text style={[styles.row, styles.bold]}>
                      Ghế & Hành khách
                    </Text>

                    {(order.seats ?? []).map((s) => {
                      const seatCode = s.seat_code;
                      const list = filtered(seatCode);
                      return (
                        <View key={seatCode} style={styles.seatRow}>
                          <Text style={styles.seatLabel}>
                            • {seatCode} — {s.price?.toLocaleString()}đ
                          </Text>
                          <View style={{ position: "relative" }}>
                            <Autocomplete
                              data={list}
                              value={queries[seatCode] ?? ""}
                              onChangeText={(t) =>
                                setQueries((prev) => ({
                                  ...prev,
                                  [seatCode]: t,
                                }))
                              }
                              flatListProps={{
                                ListEmptyComponent: () => (
                                  <Text>
                                    Không tìm thấy hành khách phù hợp.
                                  </Text>
                                ),
                                keyboardShouldPersistTaps: "always",
                                keyExtractor: (item: PassengerOption) =>
                                  String(item.id),
                                renderItem: ({ item }) => (
                                  <Pressable
                                    onPress={() =>
                                      selectPassenger(seatCode, item)
                                    }
                                    style={styles.option}
                                  >
                                    <Text style={styles.optionText}>
                                      {item.name}
                                      {item.phone ? ` — ${item.phone}` : ""}
                                    </Text>
                                  </Pressable>
                                ),
                                ListHeaderComponent: () =>
                                  list.length > 2 ? (
                                    <Text
                                      style={{
                                        fontWeight: "600",
                                        padding: 8,
                                        backgroundColor: "#f0f0f0",
                                      }}
                                    >
                                      Chọn hành khách:
                                    </Text>
                                  ) : null,
                              }}
                              inputContainerStyle={styles.autoInputContainer}
                              listContainerStyle={styles.autoListContainer}
                              style={{
                                backgroundColor: theme.green,
                                paddingHorizontal: 8,
                              }}
                              placeholder="Chọn hành khách"
                              placeholderTextColor={theme.textWhite}
                            />
                            <TouchableOpacity
                              style={{
                                position: "absolute",
                                right: 8,
                                top: 8,
                                zIndex: 9999,
                              }}
                              onPress={() => handleAddPassenger(seatCode)}
                            >
                              <Ionicons
                                name="person-add-outline"
                                size={20}
                                color={theme.textWhite}
                              />
                            </TouchableOpacity>
                          </View>
                          {assignments[seatCode] && (
                            <Text style={styles.selectedText}>
                              Đã chọn: {assignments[seatCode]?.name}
                            </Text>
                          )}
                        </View>
                      );
                    })}
                  </View>
                  <CreatePassengerModal
                    visible={openCreatePassengerModal}
                    onClose={() => {
                      setOpenCreatePassengerModal(false);
                      setSeatForNewPassenger(null);
                    }}
                    onSubmit={async (newPassenger) => {
                      try {
                        // Call API to create passenger
                        const created = await createPassengerProfile(
                          newPassenger
                        );
                        const passengerOption: PassengerOption = {
                          id: Number(created.id ?? created.passenger_id ?? 0),
                          name: created.fullName ?? created.name ?? "",
                          phone: created.phone,
                        };
                        setPassengers((prev) => [passengerOption, ...prev]);
                        if (seatForNewPassenger) {
                          selectPassenger(seatForNewPassenger, passengerOption);
                        }
                        setOpenCreatePassengerModal(false);
                        setSeatForNewPassenger(null);
                      } catch (e) {
                        console.log("Error creating passenger:", e);
                        // Handle error, maybe show alert
                      }
                    }}
                  />
                  <View style={{ marginTop: 12 }}>
                    <Text style={[styles.row, styles.bold]}>
                      Tổng: {order.total?.toLocaleString()}đ
                    </Text>
                  </View>
                </>
              )}
            </View>

            <TouchableOpacity
              style={styles.cta}
              onPress={() => onConfirm?.(assignments)}
            >
              <Text style={styles.ctaText}>Xác nhận đặt vé</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
    // <CreatePassengerModal
    //   visible={openCreatePassengerModal}
    //   onClose={() => setOpenCreatePassengerModal(false)}
    //   />
  );
};

export default PreviewOrderModal;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "flex-end" },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  sheetFocused: {
    height: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 18, fontWeight: "600" as const },
  content: { paddingVertical: 12, gap: 6 },
  row: { color: "#0F172A" },
  bold: { fontWeight: "700" as const },
  seatRow: { paddingVertical: 8 },
  seatLabel: { fontWeight: "600" as const, marginBottom: 6 },
  autoInputContainer: {
    borderWidth: 0,
    paddingHorizontal: 0,
    borderColor: theme.green,
  },
  autoListContainer: { marginTop: 4 },
  autoList: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ddd",
    zIndex: 9999, // iOS
    elevation: 8, // Android
    backgroundColor: theme.green,
  },
  option: { paddingVertical: 8, paddingHorizontal: 8, backgroundColor: "#fff" },
  optionText: { color: "#0F172A" },
  selectedText: { marginTop: 4, color: "#0F172A" },
  cta: {
    marginTop: 8,
    height: 48,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3ac21f",
  },
  ctaText: { color: "#fff", fontWeight: "700" as const },
});
