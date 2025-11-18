// app/(booking)/trips.tsx
import dayjs from "dayjs";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import images from "../../assets/images/index";
import {
  getRouteById,
  getTripAvailableSeats,
  getTripsByDate,
} from "../../src/services/bookingApi";
import { theme } from "@/assets/colors";
import { Ionicons } from "@expo/vector-icons";

type Trip = {
  id: number;
  route_id: number;
  departure_time: string; // "YYYY-MM-DD HH:mm:ss"
  arrival_time: string;
  route?: { origin: string; destination: string };
  vehicle_no: string;
  status: string;
  min_price?: number | null;
};
type Route = {
  origin: string;
  destination: string;
};
const GREEN = "#3ac21fff";
const GREEN_DARK = "#5CA33A";
const BG = "#F6FAF6";
const CARD = "#FFFFFF";
const TEXT = "#0F172A";
const SUB = "#6B7280";
const LINE = "#E8EEE8";

export default function TripsListScreen() {
  const params = useLocalSearchParams();
  // nhận cả routeId và route_id cho chắc
  const routeIdParam = (params.routeId ?? params.route_id) as
    | string
    | string[]
    | undefined;
  const routeId = Array.isArray(routeIdParam)
    ? Number(routeIdParam[0])
    : Number(routeIdParam);

  const dateParam = params.date as string | string[] | undefined;
  const passengersParam = params.passengers as string | string[] | undefined;
  const passengers = Array.isArray(passengersParam)
    ? passengersParam[0]
    : passengersParam || "1";

  const [selectedDate, setSelectedDate] = useState(
    dayjs(
      Array.isArray(dateParam)
        ? dateParam[0]
        : dateParam || dayjs().format("YYYY-MM-DD")
    )
  );

  const router = useRouter();
  const { t } = useTranslation();

  const [availableSeatsMap, setAvailableSeatsMap] = useState<
    Map<number, number>
  >(new Map());
  const [trips, setTrips] = useState<Trip[]>([]);
  const [route, setRoute] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // lấy data
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const d = selectedDate.format("YYYY-MM-DD");
        const list = await getTripsByDate(routeId, d);
        setTrips((list as Trip[]).filter((t) => t && t.id));
      } catch (e) {
        console.log("load trips error:", e);
        setTrips([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [routeId, selectedDate]);

  useEffect(() => {
    if (trips.length > 0) {
      const fetchAvailableSeats = async () => {
        const seatsMap = new Map<number, number>();
        await Promise.all(
          trips.map(async (trip) => {
            try {
              const count = await getTripAvailableSeats(trip.id);
              seatsMap.set(trip.id, count);
            } catch (error) {
              console.log(`Error fetching seats for trip ${trip.id}:`, error);
              seatsMap.set(trip.id, 0); // fallback to 0
            }
          })
        );
        setAvailableSeatsMap(seatsMap);
      };
      fetchAvailableSeats();
    }
  }, [trips]);

  // chuẩn bị highlight “Cheapest” & “Fastest”
  const cheapestId = useMemo(() => {
    let min = Number.POSITIVE_INFINITY;
    let id: number | null = null;
    for (const t of trips) {
      const price = Number(t.min_price ?? Number.POSITIVE_INFINITY);
      if (!Number.isFinite(price)) continue;
      if (price < min) {
        min = price;
        id = t.id;
      }
    }
    return id;
  }, [trips]);

  const fastestId = useMemo(() => {
    let min = Number.POSITIVE_INFINITY;
    let id: number | null = null;
    for (const t of trips) {
      const dur = tripDurationMin(t);
      if (dur < min) {
        min = dur;
        id = t.id;
      }
    }
    return id;
  }, [trips]);

  const getRouteInfo = async () => {
    try {
      const route = await getRouteById(routeId);
      return route;
    } catch (e) {
      console.log("getRouteInfo error:", e);
      return null;
    }
  };

  useEffect(() => {
    (async () => {
      const route = await getRouteInfo();
      if (route) {
        // console.log("Route info:", route);
        setRoute(route);
        // nếu muốn hiển thị thêm thông tin tuyến, có thể lưu vào state và render ở UI
      } else {
        console.log("No route info");
      }
    })();
  }, [routeId]);

  if (!Number.isFinite(routeId)) {
    return (
      <Center>
        <Text style={{ color: "tomato", textAlign: "center" }}>
          {t("invalidRouteId")}
        </Text>
      </Center>
    );
  }

  if (loading) {
    return (
      <Center>
        <ActivityIndicator size="large" color={theme.green} />
        <Text>{t("loadingResults")}</Text>
      </Center>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      {/* Header xanh giống mockup */}
      <View
        style={{
          backgroundColor: GREEN,
          paddingTop: 8,
          paddingBottom: 12,
          paddingHorizontal: 16,
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
        }}
      >
        <Text
          style={{
            color: "#fff",
            fontWeight: "800",
            fontSize: 16,
            marginBottom: 8,
          }}
        >
          Search results
        </Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <CityPill
            code={route ? codeFrom(route.origin) : "---"}
            label={route ? route.origin : t("origin")}
            align="left"
          />
          <CityPill
            code={route ? codeFrom(route.destination) : "---"}
            label={route ? route.destination : t("destination")}
            align="right"
          />
        </View>

        {/* date strip */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 12 }}
          contentContainerStyle={{ gap: 8 }}
        >
          {[-1, 0, 1, 2, 3, 4, 5].map((off) => {
            const d = dayjs(selectedDate).add(off, "day");
            const isSelected = d.isSame(selectedDate, "day");
            return (
              <TouchableOpacity
                key={off}
                onPress={() => setSelectedDate(d)}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 14,
                  borderRadius: 999,
                  backgroundColor: isSelected ? CARD : "rgba(255,255,255,0.25)",
                }}
              >
                <Text
                  style={{
                    fontWeight: "700",
                    color: isSelected ? GREEN_DARK : "#fff",
                  }}
                >
                  {d.format("ddd DD")}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* List results */}
      <FlatList
        data={trips}
        keyExtractor={(item) => String(item.id)}
        style={{ paddingHorizontal: 12, paddingTop: 12 }}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 24, color: SUB }}>
            {t("noTrips")}
            {selectedDate.format("DD/MM/YYYY")}
          </Text>
        }
        renderItem={({ item }) => (
          <TripCard
            trip={item}
            route={route}
            cheapest={item.id === cheapestId}
            availableSeats={availableSeatsMap.get(item.id) ?? 0}
            fastest={item.id === fastestId}
            onPress={() =>
              router.push({
                pathname: "/booking/trip/[tripId]",
                params: { tripId: String(item.id), passengers: passengers },
              })
            }
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
}

/* ---------- components ---------- */

function CityPill({
  code,
  label,
  align,
}: {
  code: string;
  label: string;
  align: "left" | "right";
}) {
  return (
    <View style={{ alignItems: align === "left" ? "flex-start" : "flex-end" }}>
      <Text style={{ color: "#DBF2D5", fontSize: 12 }}>{label}</Text>
      <View
        style={{
          marginTop: 4,
          backgroundColor: "#6FBE49",
          paddingVertical: 6,
          paddingHorizontal: 10,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "800" }}>{code}</Text>
      </View>
    </View>
  );
}

function TripCard({
  trip,
  route,
  cheapest,
  fastest,
  availableSeats,
  onPress,
}: {
  trip: Trip;
  route: Route;
  cheapest?: boolean;
  fastest?: boolean;
  availableSeats?: number;
  onPress: () => void;
}) {
  const dep = timeHHMM(trip.departure_time);
  const arr = timeHHMM(trip.arrival_time);
  const duration = formatDuration(tripDurationMin(trip));
  const price =
    trip.min_price != null ? `$${Number(trip.min_price).toFixed(2)}` : "--";

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        backgroundColor: CARD,
        borderRadius: 12,
        padding: 12,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 1,
        borderWidth: 1,
        borderColor: "#F1F5F1",
      }}
    >
      {/* top row: logo + badge */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#98ad98ff",
          }}
        >
          <Image
            source={images.trainIcon}
            style={{ width: 40, height: 40, resizeMode: "cover" }}
          />
        </View>
        <View>
          <Text>
            Từ{" "}
            <Text style={{ color: theme.green, fontSize: 18 }}>300.000đ</Text>
          </Text>
          <Text style={{ fontWeight: 300, fontSize: 19 }}>
            Còn {availableSeats} chỗ
          </Text>
        </View>
      </View>

      <View>
        {/* times */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 0,
          }}
        >
          <Text style={{ fontWeight: "500", fontSize: 18, color: TEXT }}>
            {dep}
          </Text>
          <View style={{ flex: 1, alignItems: "center", marginTop: 10 }}>
            <DurationBar label={duration} />
          </View>
          <Text style={{ fontWeight: "500", fontSize: 18, color: TEXT }}>
            {arr}
          </Text>
        </View>
        {/* Stations */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <Text style={{ fontWeight: "200", fontSize: 18, color: TEXT }}>
            {"Ga " + route?.origin || "Ga đi"}
          </Text>

          <Text style={{ fontWeight: "200", fontSize: 18, color: TEXT }}>
            {"Ga " + route?.destination || "Ga đến"}
          </Text>
        </View>
      </View>
      {/* stations + price */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <View>
          <Text style={{ color: theme.sub, fontSize: 18 }}>
            <Ionicons name="train" size={20} color={theme.green} />
            {` Tàu ${trip.vehicle_no} `}
          </Text>
        </View>
        <Text style={{ color: TEXT, fontWeight: "800", fontSize: 16 }}>
          {/* {price}ddd */}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function Badge({
  text,
  color,
  bg,
}: {
  text: string;
  color: string;
  bg: string;
}) {
  return (
    <View
      style={{
        backgroundColor: bg,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
      }}
    >
      <Text style={{ color, fontWeight: "800", fontSize: 11 }}>{text}</Text>
    </View>
  );
}

function DurationBar({ label }: { label: string }) {
  return (
    <View style={{ alignItems: "center" }}>
      <Text style={{ color: SUB, fontSize: 19 }}>{label}</Text>
      <View
        style={{
          width: 140,
          height: 6,
          backgroundColor: LINE,
          borderRadius: 999,
          position: "relative",
          overflow: "hidden",
          marginBottom: 4,
        }}
      >
        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: "#E4EAE4",
          }}
        />
      </View>
    </View>
  );
}

/* ---------- utils ---------- */
function Center({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: BG,
      }}
    >
      {children}
    </View>
  );
}

function timeHHMM(dt: string) {
  return String(dt || "").slice(11, 16);
}
function tripDurationMin(t: Pick<Trip, "departure_time" | "arrival_time">) {
  const a = dayjs(t.arrival_time);
  const d = dayjs(t.departure_time);
  const m = Math.max(0, a.diff(d, "minute"));
  return m;
}
function formatDuration(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h <= 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
function codeFrom(name: string) {
  if (!name) return "---";
  const parts = String(name).split(/\s+/);
  const letters = parts.map((p) => p[0]?.toUpperCase()).join("");
  return letters.slice(0, 3);
}
