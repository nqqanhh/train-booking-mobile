import React from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type OrderPreview = {
  trip_id?: string;
  trip_name: string;
  departure_time: string
  seats?: Array<{
    seat_code: string;
    price: number;
    passenger_id?: number;
    passenger_name?: string;
  }>;
//   subtotal?: number;
//   fee?: number;
  total?: number;
};

type Props = {
  visible: boolean;
  onCloseModal: () => void;
  onConfirm: () => void;
  title?: string;
  order?: OrderPreview | null;
  loading?: boolean;
  closeOnBackdropPress?: boolean;
};

const PreviewOrderModal: React.FC<Props> = ({
  visible,
  onCloseModal,
  title = "Order preview",
  order,
  loading,
  closeOnBackdropPress = true,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onCloseModal} // Android back button
    >
      {/* Backdrop */}
      <Pressable
        style={styles.backdrop}
        onPress={closeOnBackdropPress ? onCloseModal : undefined}
      />

      {/* Bottom sheet */}
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
              <Text style={styles.row}>Tuyến: {order.trip_name ?? "—"}</Text>
              <Text style={styles.row}>
                Giờ khởi hành: {order.departure_time ?? "—"}
              </Text>

              <View style={{ marginTop: 8 }}>
                <Text style={[styles.row, { fontWeight: "600" as const }]}>
                  Ghế:
                </Text>
                {order.seats?.map((s, i) => (
                  <View>
                    <Text key={i} style={styles.row}>
                      • {s.seat_code} — {s.price?.toLocaleString()}đ
                    </Text>
                    <Text key={i} style={styles.row}>
                      {" "}
                      Passenger: {s.passenger_name}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={{ marginTop: 12 }}>
                {/* <Text style={styles.row}>
                  Tạm tính: {order.subtotal?.toLocaleString()}đ
                </Text>
                <Text style={styles.row}>
                  Phí: {order.fee?.toLocaleString()}đ
                </Text> */}
                <Text style={[styles.row, { fontWeight: "700" as const }]}>
                  Tổng: {order.total?.toLocaleString()}đ
                </Text>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default PreviewOrderModal;

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: {
    marginTop: "auto",
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 18, fontWeight: "600" as const },
  content: { paddingVertical: 12, gap: 6 },
  row: { color: "#0F172A" },
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
