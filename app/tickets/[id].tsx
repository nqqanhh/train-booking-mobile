import React, { useState, useEffect } from "react";
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
  // Nếu file là app/tickets/[id].tsx -> key là "id"
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { height, width } = useWindowDimensions();
  const [loading, setLoading] = useState(false);
  const [ticketDetail, setTicketDetail] = useState<Detail | null>(null);
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

  useEffect(() => {
    (async () => {
      try {
        if (!id) return;
        setLoading(true);
        const d = await getTicketDetail(id);
        setTicketDetail(d || null);
        console.log(d);
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
        // Thay cho "100vh"
        minHeight: "100%",
      }}
    >
      <View style={{ padding: 30 }}>
        {" "}
        <Text>- Bấm vào vé để tải về -</Text>
      </View>

      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: theme.card,
            width: Math.min(width * 0.92, 420),
            // thay cho "70%": auto theo nội dung
          },
        ]}
      >
        {/* Header của vé */}
        <View style={{ marginBottom: 16 }}>
          <View style={styles.rowBetween}>
            <Image source={images.trainIcon} style={styles.eTrainLogo} />
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.label}>Date:</Text>
              <Text style={styles.textBold}>{issued}</Text>
            </View>
          </View>

          <View style={[styles.rowBetween, { marginTop: 16 }]}>
            <Text style={styles.stationCode}>
              {" "}
              {origin.toUpperCase()}
            </Text>
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

        {/* Passenger (nếu có) */}
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
            Ticket ID: {ticketDetail?.ticket?.id ?? id ?? "—"}{" "}
          </Text>
        </View>
      </TouchableOpacity>
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
  eTrainLogo: { height: 40, width: 40 },
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
