import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import dayjs from "dayjs";
import { getMyTickets } from "@/src/services/ticketsApi";
import { useAuth } from "@/src/hooks/useAuth";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
const theme = {
  bg: "#F6FAF6",
  card: "#fff",
  line: "#E8EEE8",
  text: "#0F172A",
  sub: "#667085",
  green: "#7AC943",
};

export default function MyTicketsScreen() {
  const { user } = useAuth();
  const [status, setStatus] = useState<"all" | "valid" | "used" | "refunded">(
    "all"
  );
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<any[]>([]);

  const router = useRouter();
  const { t } = useTranslation();
  const load = async () => {
    try {
      setLoading(true);
      const items = await getMyTickets(status);
      setTickets(items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) load();
  }, [user, status]);

  if (!user) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>{t("pleaseLogin")}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg, padding: 12 }}>
      {/* Tabs filter */}
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
        {(["all", "valid", "used", "refunded"] as const).map((s) => {
          const active = s === status;
          return (
            <Pressable
              key={s}
              onPress={() => setStatus(s)}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 12,
                backgroundColor: active ? theme.green : "#EAF3EA",
              }}
            >
              <Text
                style={{
                  color: active ? "#fff" : theme.text,
                  fontWeight: "700",
                }}
              >
                {t(s).toUpperCase()}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {loading ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator size="large" color={theme.green} />
          <Text style={{ color: theme.sub, marginTop: 8 }}>
            {t("loadingTickets")}
          </Text>
        </View>
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={(it) => it.ticket_id}
          ListEmptyComponent={
            <Text
              style={{ textAlign: "center", color: theme.sub, marginTop: 16 }}
            >
              {t("noTickets")}
            </Text>
          }
          renderItem={({ item }) => {
            const dep = item.trip?.departure_time
              ? dayjs(item.trip.departure_time).format("DD/MM HH:mm")
              : "";
            const arr = item.trip?.arrival_time
              ? dayjs(item.trip.arrival_time).format("DD/MM HH:mm")
              : "";
            const route = item.trip?.route
              ? `${item.trip.route.origin} → ${item.trip.route.destination}`
              : `Route #${item.trip?.route_id}`;
            const used = item.status === "used";
            return (
              <TouchableOpacity
                style={{
                  backgroundColor: theme.card,
                  borderRadius: 12,
                  padding: 12,
                  marginBottom: 10,
                  borderWidth: 1,
                  borderColor: theme.line,
                }}
                onPress={() =>
                  router.push({
                    pathname: "/tickets/[id]",
                    params: { id: Number(item.ticket_id) },
                  })
                }
              >
                <Text style={{ fontWeight: "800", marginBottom: 4 }}>
                  {route}
                </Text>
                <Text style={{ color: theme.sub, marginBottom: 6 }}>
                  {item.trip?.vehicle_no} • {dep} → {arr}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontWeight: "700" }}>
                    Seat: {item.seat_code}
                  </Text>
                  <Text
                    style={{
                      color: used ? "#B42318" : theme.green,
                      fontWeight: "700",
                    }}
                  >
                    {used ? "USED" : t("active")}
                  </Text>
                </View>
                {/* nếu cần xem QR, bạn có thể thêm nút mở modal QR từ qr_payload */}
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}
