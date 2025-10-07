import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import dayjs from "dayjs";
import { getTripsByDate } from "../../src/services/bookingApi";

export default function TripsListScreen() {
  const { routeId } = useLocalSearchParams<{ routeId: string }>();
  const [trips, setTrips] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const hhmm = (s: string) => String(s || "").slice(11, 16);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const dateISO = selectedDate.format("YYYY-MM-DD");
        const list = await getTripsByDate(Number(routeId), dateISO);
        console.log("[/trips result]", {
          route_id: String(routeId),
          dateISO,
          count: list.length,
        });
        setTrips(list);
      } catch (e) {
        console.log("Error loading trips:", e);
        setTrips([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [routeId, selectedDate]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
        <Text>Đang tải chuyến đi...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          gap: 8,
          marginBottom: 16,
        }}
      >
        {[-1, 0, 1].map((offset) => {
          const date = dayjs().add(offset, "day");
          const isSelected = date.isSame(selectedDate, "day");
          return (
            <TouchableOpacity
              key={offset}
              onPress={() => setSelectedDate(date)}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 16,
                backgroundColor: isSelected ? "#1976D2" : "#eee",
                borderRadius: 8,
              }}
            >
              <Text style={{ color: isSelected ? "#fff" : "#000" }}>
                {date.format("DD/MM")}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={trips}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            Không có chuyến nào trong ngày đã chọn
          </Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{
              backgroundColor: "#fff",
              borderRadius: 10,
              padding: 16,
              marginBottom: 12,
              shadowColor: "#000",
              shadowOpacity: 0.05,
              shadowRadius: 3,
              elevation: 2,
            }}
            onPress={() =>
              router.push({
                pathname: "/booking/trip/[tripId]",
                params: { tripId: String(item.id) },
              })
            }
          >
            <Text style={{ fontSize: 16, fontWeight: "700" }}>
              {hhmm(item.departure_time)} → {hhmm(item.arrival_time)}
            </Text>
            <Text style={{ color: "#666" }}>
              Tuyến #{item.route_id} • Mã chuyến: {item.vehicle_no} • Trạng
              thái: {item.status}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
