// app/(booking)/trip/[tripId].tsx
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import {
  createOrder,
  getRouteById,
  getTripSeatMapClient,
  paypalCapture,
  paypalCreate,
} from "../../../src/services/bookingApi";

type Seat = {
  seat_code: string;
  status?: "available" | "sold" | "blocked";
  order_item_id?: number;
  price?: number;
};
type Layout = { rows: number; cols: number; blocks?: any[] };
type CarriageVM = {
  id: number;
  name?: string;
  carriage_no?: string | number;
  layout: Layout;
  seats: Seat[];
};

const theme = {
  green: "#7AC943",
  greenDark: "#62B331",
  rail: "#E9F5E3",
  bg: "#F7F9F6",
  text: "#1F2937",
  sub: "#667085",
  line: "#E5E7EB",
  seatBg: "#F5F7FA",
  seatBorder: "#E2E8F0",
  seatSoldBg: "#FFE8E8",
  seatSoldBorder: "#F5B5B5",
  white: "#fff",
};

// ------- helpers -------
function normalizeLayout(l: any): Layout {
  if (!l) return { rows: 0, cols: 0, blocks: [] };
  if (typeof l === "string") {
    try {
      const j = JSON.parse(l);
      return {
        rows: Number(j.rows || 0),
        cols: Number(j.cols || 0),
        blocks: j.blocks || [],
      };
    } catch {
      return { rows: 0, cols: 0, blocks: [] };
    }
  }
  return {
    rows: Number(l.rows || 0),
    cols: Number(l.cols || 0),
    blocks: l.blocks || [],
  };
}
function inferLayoutFromSeats(seats: Seat[]): Layout {
  let maxRow = 0,
    maxCol = 0,
    matched = 0;
  for (const s of seats) {
    const m = String(s.seat_code || "").match(/^(\d+)([A-Z])$/i);
    if (!m) continue;
    matched++;
    const r = +m[1];
    const c = m[2].toUpperCase().charCodeAt(0) - 64;
    maxRow = Math.max(maxRow, r);
    maxCol = Math.max(maxCol, c);
  }
  return matched
    ? { rows: maxRow, cols: maxCol, blocks: [] }
    : { rows: 0, cols: 0, blocks: [] };
}
const codeFromRC = (r: number, c: number) =>
  `${r}${String.fromCharCode(64 + c)}`;
const sliceTime = (s?: string) => String(s || "").slice(11, 16);

// ------- UI -------
export default function SelectSeatScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [route, setRoute] = useState<any>(null);
  const [trip, setTrip] = useState<any>(null);
  const [carriages, setCarriages] = useState<CarriageVM[]>([]);
  const [tab, setTab] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const current = carriages[tab];

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getTripSeatMapClient(Number(tripId));
        const mapped: CarriageVM[] = (data?.carriages || []).map((c: any) => {
          const seats: Seat[] = Array.isArray(c.seats) ? c.seats : [];
          let layout = normalizeLayout(c.layout);
          if ((!layout.rows || !layout.cols) && seats.length)
            layout = inferLayoutFromSeats(seats);
          return {
            id: +c.id,
            name: c.name || `Coach ${c.carriage_no ?? ""}`,
            carriage_no: c.carriage_no,
            layout,
            seats,
          };
        });
        setTrip(data?.trip);
        setCarriages(mapped);
        setTab(0);
        setPicked([]);
      } catch (e: any) {
        Alert.alert(
          "Error",
          e?.response?.data?.message || "Cannot load seat map"
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [tripId]);

  const getRouteInfo = async () => {
    if (!trip?.route_id) return null;
    try {
      const route = await getRouteById(trip.route_id);
      return route;
    } catch (e) {
      return null;
    }
  };
  useEffect(() => {
    (async () => {
      const route = await getRouteInfo();
      if (route) {
        console.log("Route info:", route.origin + "→" + route.destination);
        // nếu muốn hiển thị thêm thông tin tuyến, có thể lưu vào state và render ở UI
        setRoute(route);
      } else {
        console.log("No route info");
      }
    })();
  }, [trip]);
  const seatMap = useMemo(() => {
    const m = new Map<string, Seat>();
    (current?.seats || []).forEach((s) => m.set(String(s.seat_code), s));
    return m;
  }, [current]);

  const toggleSeat = (code: string) => {
    const s = seatMap.get(code);
    const sold = s?.status === "sold" || !!s?.order_item_id;
    if (sold) return;
    setPicked((prev) =>
      prev.includes(code) ? prev.filter((x) => x !== code) : [...prev, code]
    );
  };

  const total = picked.reduce(
    (sum, code) => sum + Number(seatMap.get(code)?.price ?? 10),
    0
  );

  const onConfirm = async () => {
    if (!picked.length) return;
    try {
      // demo: tạo order + paypal
      const items = picked.map((code) => ({
        trip_id: Number(tripId),
        seat_code: code,
        price: Number(seatMap.get(code)?.price ?? 10),
      }));
      const order = await createOrder({ user_id: 1, items }); // TODO: lấy user_id từ auth
      const { paypal_order_id, approval_url } = await paypalCreate({
        order_id: order.order_id,
        return_url: "https://example.com/return",
        cancel_url: "https://example.com/cancel",
      });
      Alert.alert(
        "PayPal",
        "Mở link trên trình duyệt để thanh toán.\nSau đó bấm OK để capture.",
        [
          {
            text: "OK",
            onPress: async () => {
              await paypalCapture({
                order_id: order.order_id,
                paypal_order_id,
              });
              Alert.alert("Done", "Thanh toán thành công!");
            },
          },
        ]
      );
      // Nếu muốn nhúng WebView, thay Alert bằng WebView như bản trước.
    } catch (e: any) {
      Alert.alert(
        "Checkout error",
        e?.response?.data?.message || e?.message || "Cannot checkout"
      );
    }
  };

  // function CabinBoxFixed({})
  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.bg,
        }}
      >
        <ActivityIndicator size="large" color={theme.green} />
        <Text style={{ marginTop: 8, color: theme.sub }}>
          Loading seat map…
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 4,
          paddingBottom: 8,
          backgroundColor: theme.white,
          borderBottomWidth: 1,
          borderBottomColor: theme.line,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{ padding: 8, marginRight: 8 }}
        >
          <Ionicons name="chevron-back" size={22} color={theme.text} />
        </Pressable>
        <Text style={{ fontSize: 18, fontWeight: "700", color: theme.text }}>
          Select seat
        </Text>
      </View>
      {/* Trip info */}
      {trip && (
        <View style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
          <Text style={{ fontWeight: "700", color: theme.text }}>
            {trip.vehicle_no} • {route?.origin ?? `Route #${trip.route_id}`} →{" "}
            {route?.destination ?? ""}
          </Text>
          <Text style={{ color: theme.sub }}>
            {sliceTime(trip.departure_time)} — {sliceTime(trip.arrival_time)} •{" "}
            {trip.status}
          </Text>
        </View>
      )}

      <View
        style={{ flex: 1, flexDirection: "column", backgroundColor: theme.bg }}
      >
        {/* Left vertical tabs (carriage rail) */}
        <ScrollView
          contentContainerStyle={{ paddingVertical: 1 }}
          style={{ flex: 1 }}
        >
          <View
            style={{
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "space-around",
              marginBottom: 1,
            }}
          >
            {(carriages || []).map((c, i) => (
              <Pressable
                key={c.id}
                onPress={() => {
                  setTab(i);
                  setPicked([]);
                }}
                style={{
                  width: "31%",
                  paddingVertical: 16,
                  marginVertical: 20,
                  borderRadius: 14,
                  backgroundColor: i === tab ? theme.green : theme.rail,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: i === tab ? theme.white : theme.text,
                    fontWeight: "700",
                    fontSize: 12,
                  }}
                  numberOfLines={1}
                >
                  {c.name || `Coach ${c.carriage_no ?? i + 1}`}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {/* Cabin + seats */}
        <ScrollView
          style={{ flex: 7 }}
          contentContainerStyle={{ paddingVertical: 12, alignItems: "center" }}
        >
          <CabinBoxFixed>
            <CabinHead />
            <View
              style={{
                paddingHorizontal: 14,
                paddingBottom: 16,
                paddingTop: 8,
              }}
            >
              {current ? (
                <SeatGridCompact
                  layout={current.layout}
                  seats={current.seats}
                  selected={picked}
                  onToggle={toggleSeat}
                />
              ) : (
                <Text
                  style={{ textAlign: "center", color: theme.sub, padding: 12 }}
                >
                  No data
                </Text>
              )}
            </View>
          </CabinBoxFixed>
        </ScrollView>
      </View>

      {/* Bottom confirm bar */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 10,
          paddingBottom: 18,
          backgroundColor: theme.white,
          borderTopWidth: 1,
          borderTopColor: theme.line,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <Text style={{ color: theme.sub }}>Seat selected:</Text>
          <Text style={{ fontWeight: "700", color: theme.text }}>
            {picked.length ? picked.join(", ") : "—"}
          </Text>
        </View>
        <Pressable
          disabled={!picked.length}
          onPress={onConfirm}
          style={{
            backgroundColor: picked.length ? theme.green : "#B0B8A8",
            paddingVertical: 14,
            borderRadius: 14,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOpacity: 0.08,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <Text style={{ color: theme.white, fontWeight: "700" }}>
            {picked.length ? `Confirm • $${total.toFixed(2)}` : "Confirm"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

// ---------- Pieces ----------
function CabinBoxFixed({ children }: { children: React.ReactNode }) {
  const { width } = useWindowDimensions();
  const cabinWidth = Math.min(width * 0.7); // 70% màn
  return (
    <View
      style={{
        width: cabinWidth,
        backgroundColor: theme.white,
        borderRadius: 32,
        borderWidth: 1,
        borderColor: theme.line,
        // overflow: "hidden",
        alignSelf: "center",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
      }}
    >
      {children}
    </View>
  );
}

function SeatGridCompact({
  layout,
  seats,
  selected,
  onToggle,
}: {
  layout: Layout;
  seats: Seat[];
  selected: string[];
  onToggle: (code: string) => void;
}) {
  const map = React.useMemo(() => {
    const m = new Map<string, Seat>();
    (seats || []).forEach((s) => m.set(String(s.seat_code), s));
    return m;
  }, [seats]);

  const { width } = useWindowDimensions();
  const cabinWidth = Math.min(width * 0.7, 340);
  const R = layout.rows || 0;
  const C = layout.cols || 0;
  const gap = 8;
  const seatSize = Math.floor((cabinWidth - gap * (C + 1)) / C);

  const rows: JSX.Element[] = [];
  for (let r = 1; r <= R; r++) {
    const cols: JSX.Element[] = [];
    for (let c = 1; c <= C; c++) {
      const code = `${r}${String.fromCharCode(64 + c)}`;
      const seat = map.get(code);
      const exists = !!seat;
      const sold = exists && (seat!.status === "sold" || !!seat!.order_item_id);
      const isSel = selected.includes(code);

      cols.push(
        <Pressable
          key={c}
          onPress={() => exists && !sold && onToggle(code)}
          disabled={!exists || sold}
          style={{
            width: seatSize,
            height: seatSize,
            marginHorizontal: gap / 2,
            marginVertical: gap / 2,
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: !exists
              ? "#F2F4F7"
              : sold
              ? theme.seatSoldBg
              : isSel
              ? theme.green
              : theme.seatBg,
            borderWidth: 1,
            borderColor: !exists
              ? "#E4E7EC"
              : sold
              ? theme.seatSoldBorder
              : isSel
              ? theme.greenDark
              : theme.seatBorder,
          }}
        >
          <Text
            style={{
              fontWeight: "700",
              fontSize: 12,
              color: !exists
                ? "#98A2B3"
                : sold
                ? "#B42318"
                : isSel
                ? theme.white
                : theme.text,
            }}
          >
            {code}
          </Text>
        </Pressable>
      );
    }
    rows.push(
      <View key={r} style={{ flexDirection: "row", justifyContent: "center" }}>
        {cols}
      </View>
    );
  }

  return (
    <View style={{ alignItems: "center" }}>
      <Text style={{ color: "#98A2B3", fontSize: 12, marginBottom: 4 }}>
        DEBUG • seats={seats?.length ?? 0} • layout={R}x{C}
      </Text>
      {rows}
    </View>
  );
}
function CabinHead() {
  // “vòm” đầu khoang
  return (
    <View style={{ alignItems: "center", paddingTop: 12 }}>
      <View
        style={{
          width: "76%",
          height: 72,
          backgroundColor: theme.bg,
          borderTopLeftRadius: 90,
          borderTopRightRadius: 90,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          borderWidth: 1,
          borderColor: theme.line,
        }}
      />
    </View>
  );
}

function SeatGrid({
  layout,
  seats,
  selected,
  onToggle,
}: {
  layout: Layout;
  seats: Seat[];
  selected: string[];
  onToggle: (code: string) => void;
}) {
  const map = useMemo(() => {
    const m = new Map<string, Seat>();
    (seats || []).forEach((s) => m.set(String(s.seat_code), s));
    return m;
  }, [seats]);

  const rows: JSX.Element[] = [];
  const R = layout.rows || 0;
  const C = layout.cols || 0;

  if (R > 0 && C > 0) {
    for (let r = 1; r <= R; r++) {
      const cols: JSX.Element[] = [];
      for (let c = 1; c <= C; c++) {
        const code = codeFromRC(r, c);
        const seat = map.get(code);
        if (!seat) {
          cols.push(
            <View key={c} style={{ width: 44, height: 44, margin: 6 }} />
          );
          continue;
        }
        const sold = seat.status === "sold" || !!seat.order_item_id;
        const isSel = selected.includes(code);
        cols.push(
          <Pressable
            key={c}
            onPress={() => onToggle(code)}
            disabled={sold}
            style={{
              width: 44,
              height: 44,
              margin: 6,
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: sold
                ? theme.seatSoldBg
                : isSel
                ? theme.green
                : theme.seatBg,
              borderWidth: 1,
              borderColor: sold
                ? theme.seatSoldBorder
                : isSel
                ? theme.greenDark
                : theme.seatBorder,
            }}
          >
            <Text
              style={{
                fontWeight: "700",
                fontSize: 12,
                color: sold ? "#B42318" : isSel ? theme.white : theme.text,
              }}
            >
              {code}
            </Text>
          </Pressable>
        );
      }
      rows.push(
        <View
          key={r}
          style={{ flexDirection: "row", justifyContent: "space-between" }}
        >
          {cols}
        </View>
      );
    }
    return <View style={{ paddingTop: 8, gap: 6 }}>{rows}</View>;
  }

  // fallback – wrap danh sách ghế nếu thiếu layout
  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        paddingTop: 8,
      }}
    >
      {(seats || []).map((s) => {
        const sold = s.status === "sold" || !!s.order_item_id;
        const isSel = selected.includes(s.seat_code);
        return (
          <Pressable
            key={s.seat_code}
            onPress={() => onToggle(s.seat_code)}
            disabled={sold}
            style={{
              width: 44,
              height: 44,
              margin: 6,
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: sold
                ? theme.seatSoldBg
                : isSel
                ? theme.green
                : theme.seatBg,
              borderWidth: 1,
              borderColor: sold
                ? theme.seatSoldBorder
                : isSel
                ? theme.greenDark
                : theme.seatBorder,
            }}
          >
            <Text
              style={{
                fontWeight: "700",
                fontSize: 12,
                color: sold ? "#B42318" : isSel ? theme.white : theme.text,
              }}
            >
              {s.seat_code}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
