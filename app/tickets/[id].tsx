import React, { useState, useEffect, useRef } from "react";
import ViewShot from "react-native-view-shot";
import * as MediaLibrary from "expo-media-library";
import { useLocalSearchParams } from "expo-router";
import {
  ScrollView,
  View,
  Text,
  Image,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import images from "@/assets/images/index";
import dayjs from "dayjs";
import { getTicketDetail } from "@/src/services/ticketsApi";

type Detail = {
  ticket: {
    id: number;
    status: string;
    issued_at?: string;
    used_at?: string;
    qr_payload?: string;
  };
  seat: { seat_code: string; price?: number | null };
  passenger?: { id: number; full_name?: string; phone?: string | null } | null;
  trip: {
    id: number;
    vehicle_no?: string;
    route_id?: number;
    status?: string;
    departure_time?: string;
    arrival_time?: string;
    route?: {
      id: number;
      origin: string;
      destination: string;
      distance_km?: number | null;
      eta_minutes?: number | null;
    } | null;
  };
};

export default function TicketDetailsScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { width } = useWindowDimensions();
  const [loading, setLoading] = useState(false);
  const [ticketDetail, setTicketDetail] = useState<Detail | null>(null);
  const [saving, setSaving] = useState(false);
  const viewShotRef = useRef<ViewShot>(null);

  const theme = {
    bg: "#F6FAF6",
    card: "#FFFFFF",
    line: "#E6ECE6",
    text: "#0F172A",
    sub: "#687588",
    green: "#7AC943",
    greenDark: "#62B331",
    greenPale: "#E8F6E8",
    shadow: "#00000010",
  };

  // Xin quyền thư viện ảnh khi mở màn
  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "App cần quyền thư viện ảnh để lưu vé."
        );
      }
    })();
  }, []);

  // Fetch chi tiết vé
  useEffect(() => {
    (async () => {
      try {
        if (!id) return;
        setLoading(true);
        const d = await getTicketDetail(id);
        setTicketDetail(d || null);
      } catch (e: any) {
        Alert.alert(
          "Error",
          e?.response?.data?.message || "Load ticket failed"
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const issued = ticketDetail?.ticket?.issued_at
    ? dayjs(ticketDetail.ticket.issued_at).format("DD/MM/YYYY HH:mm")
    : "—";
  const dep = ticketDetail?.trip?.departure_time
    ? dayjs(ticketDetail.trip.departure_time).format("DD/MM/YYYY HH:mm")
    : "—";
  const arr = ticketDetail?.trip?.arrival_time
    ? dayjs(ticketDetail.trip.arrival_time).format("DD/MM/YYYY HH:mm")
    : "—";
  const origin = ticketDetail?.trip?.route?.origin || "—";
  const destination = ticketDetail?.trip?.route?.destination || "—";
  const vehicle = ticketDetail?.trip?.vehicle_no || "—";
  const seatCode = ticketDetail?.seat?.seat_code || "—";
  const qrValue =
    (ticketDetail?.ticket?.qr_payload &&
      String(ticketDetail.ticket.qr_payload)) ||
    (id ?? "NO_TICKET");

  const captureAndSave = async () => {
    try {
      if (!viewShotRef.current) return;
      setSaving(true);

      // Chụp view -> file tạm (PNG nét hơn; có thể tăng pixelRatio nếu muốn)
      const uri = await viewShotRef.current.capture({
        result: "tmpfile",
        format: "png",
        quality: 1,
        pixelRatio: 2,
      });

      if (Platform.OS === "web") {
        // Trên web: bạn có thể dùng base64 để download, nhưng MediaLibrary không hỗ trợ web
        Alert.alert(
          "Not supported on Web",
          "Lưu ảnh vé chỉ hỗ trợ Android/iOS."
        );
        setSaving(false);
        return;
      }

      // Lưu vào thư viện + album "TrainTickets"
      const asset = await MediaLibrary.createAssetAsync(uri);
      const albums = await MediaLibrary.getAlbumsAsync();
      const found = albums.find((a) => a.title === "TrainTickets");
      if (found) {
        await MediaLibrary.addAssetsToAlbumAsync([asset], found.id, false);
      } else {
        await MediaLibrary.createAlbumAsync("TrainTickets", asset, false);
      }

      Alert.alert(
        "Đã lưu",
        "Ảnh vé đã được lưu vào thư viện (album TrainTickets)!"
      );
    } catch (error) {
      console.error("capture/save error:", error);
      Alert.alert("Lỗi", "Không thể lưu ảnh vé.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.bg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color={theme.green} />
        <Text style={{ color: theme.sub, marginTop: 8 }}>Đang tải vé…</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.greenPale }}
      contentContainerStyle={{
        paddingVertical: 24,
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100%",
      }}
    >
      <View style={{ padding: 30 }}>
        <Text>- Bấm vào vé để lưu vào máy -</Text>
      </View>

      {/* CHÚ Ý: collapsable={false} để Android không tối ưu bỏ View khi capture */}
      <ViewShot ref={viewShotRef} options={{ format: "png", quality: 0.9 }}>
        <TouchableOpacity
          onPress={captureAndSave}
          activeOpacity={0.9}
          style={[
            styles.card,
            { backgroundColor: theme.card, width: Math.min(width * 0.92, 420) },
          ]}
          collapsable={false}
        >
          {/* Header vé */}
          <View style={{ marginBottom: 16 }}>
            <View style={styles.rowBetween}>
              <Image source={images.trainIcon} style={styles.eTrainLogo} />
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.label}>Date:</Text>
                <Text style={styles.textBold}>{issued}</Text>
              </View>
            </View>

            <View style={[styles.rowBetween, { marginTop: 16 }]}>
              <Text style={styles.stationCode}>{origin.toUpperCase()}</Text>
              <Ionicons name="arrow-forward" size={40} />
              <Text style={styles.stationCode}>
                {destination.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Thông tin chi tiết */}
          <View style={[styles.row, { marginBottom: 16 }]}>
            <View style={styles.col}>
              <Text style={styles.label}>Departure</Text>
              <Text style={styles.textBold}>{dep}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Arrival</Text>
              <Text style={styles.textBold}>{arr}</Text>
            </View>
          </View>

          <View style={[styles.row, { marginBottom: 16 }]}>
            <View style={styles.col}>
              <Text style={styles.label}>Train</Text>
              <Text style={styles.textBold}>{vehicle}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Seat</Text>
              <Text style={styles.textBold}>{seatCode}</Text>
            </View>
          </View>

          {/* Passenger */}
          {!!ticketDetail?.passenger && (
            <View style={[styles.row, { marginBottom: 16 }]}>
              <View style={styles.col}>
                <Text style={styles.label}>Passenger</Text>
                <Text style={styles.textBold}>
                  {ticketDetail.passenger.full_name || "—"}
                </Text>
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>Phone</Text>
                <Text style={styles.textBold}>
                  {ticketDetail.passenger.phone || "—"}
                </Text>
              </View>
            </View>
          )}

          {/* QR */}
          <View style={{ alignItems: "center", marginTop: 8 }}>
            <QRCode value={qrValue} size={180} />
            <Text style={{ marginTop: 8, color: "#687588" }}>
              Ticket ID: {ticketDetail?.ticket?.id ?? id ?? "—"}
            </Text>
          </View>

          {/* overlay đang lưu */}
          {saving && (
            <View
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#00000033",
                borderRadius: 16,
              }}
            >
              <ActivityIndicator color="#fff" />
              <Text style={{ color: "#fff", marginTop: 8 }}>Đang lưu…</Text>
            </View>
          )}
        </TouchableOpacity>
      </ViewShot>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  eTrainLogo: { height: "100%", width: "15%" },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  col: { width: "48%" },
  label: { color: "#687588", marginBottom: 2 },
  textBold: { fontWeight: "600" },
  stationCode: { fontSize: 20, fontWeight: "700" },
});
