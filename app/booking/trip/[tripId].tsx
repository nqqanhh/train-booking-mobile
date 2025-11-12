// app/(booking)/trip/[tripId].tsx
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import WebView from "react-native-webview";
import { api } from "@/src/services/api";
import {
  createOrder,
  paypalCapture,
  paypalCreate,
  previewOrder,
} from "@/src/services/bookingApi";
import PreviewOrderModal, {
  OrderPreview,
} from "./components/PreviewOrderModal";
import { AuthProvider } from "@/src/context/AuthContext";
import { useAuth } from "@/src/hooks/useAuth";

type Trip = {
  id: number;
  route_id: number;
  departure_time: string;
  arrival_time: string;
  vehicle_no: string;
  status: string;
};
type RouteInfo = { id: number; origin: string; destination: string };

type TripSeat = {
  seat_code: string;
  status?: string | number;
  order_item_id?: number | null;
  sold?: boolean;
  sold_at?: string | null;
  class?: string;
  price?: number;
};

type TemplateSeat = {
  seat_code: string;
  pos_row?: number;
  pos_col?: number;
  seat_class?: string;
  base_price?: number;
};

type SeatMerged = {
  seat_code: string;
  row: number;
  col: number;
  class: string;
  price: number;
  sold: boolean;
  status: string;
  _raw?: any;
};

type Layout = { rows: number; cols: number };
type CarriageVM = {
  id: number;
  name?: string;
  carriage_no?: string | number;
  seat_template_id: number;
  layout: Layout;
  seats: SeatMerged[];
};
type PassengerOption = { id: number; name: string; phone?: string };

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

function normalizeSeat(raw: any): SeatMerged {
  const row = Number(raw.row ?? raw.pos_row ?? 0);
  const col = Number(raw.col ?? raw.pos_col ?? 0);
  const cls = String(raw.class ?? raw.seat_class ?? "standard").toLowerCase();
  const price = Number(raw.price ?? raw.base_price ?? 0);

  const statusRaw = raw.status ?? raw.state ?? raw.seat_status ?? null;
  const statusStr =
    typeof statusRaw === "string" ? statusRaw.toLowerCase() : null;
  const statusNum =
    typeof statusRaw === "number"
      ? statusRaw
      : typeof raw.status_id === "number"
      ? raw.status_id
      : null;

  const soldHeuristics =
    Boolean(raw.sold) ||
    raw.order_item_id != null ||
    raw.sold_at != null ||
    (statusStr
      ? ["sold", "held", "reserved", "occupied", "unavailable"].includes(
          statusStr
        )
      : false) ||
    (statusNum != null ? Number(statusNum) >= 2 : false);

  const status = statusStr || (soldHeuristics ? "sold" : "available");

  return {
    seat_code: String(raw.seat_code),
    row,
    col,
    class: cls,
    price,
    sold: soldHeuristics,
    status,
    _raw: raw,
  };
}

const hhmm = (s?: string) => String(s || "").slice(11, 16);

export default function SelectSeatScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [carriages, setCarriages] = useState<CarriageVM[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);

  // preview + chọn passenger
  const [openPreviewModal, setOpenPreviewModal] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [preview, setPreview] = useState<OrderPreview | null>(null);
  const [seatAssignments, setSeatAssignments] = useState<
    Record<string, PassengerOption | null>
  >({});

  // PayPal webview
  const [webVisible, setWebVisible] = useState(false);
  const [approvalUrl, setApprovalUrl] = useState<string | null>(null);
  const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);

  const current = carriages[activeIdx];

  const loadTripHeader = useCallback(async () => {
    const { data } = await api.get(`/trips/${Number(tripId)}`);
    const t: Trip = data?.trip || data;
    setTrip(t);

    if (t?.route_id) {
      try {
        const r = await api.get(`/routes/${t.route_id}`);
        setRouteInfo(r.data?.route || r.data);
      } catch {}
    }
  }, [tripId]);

  const loadCarriages = useCallback(async () => {
    const { data } = await api.get(
      `/carriages/trips/${Number(tripId)}/carriages`
    );
    const list = Array.isArray(data?.carriages) ? data.carriages : data || [];
    const mapped: CarriageVM[] = list.map((c: any) => ({
      id: Number(c.id),
      name: c.name || `Coach ${c.carriage_no ?? ""}`,
      carriage_no: c.carriage_no,
      seat_template_id: Number(c.seat_template_id),
      layout: { rows: 0, cols: 0 },
      seats: [],
    }));
    setCarriages(mapped);
    setActiveIdx(0);
  }, [tripId]);

  const loadCarriageDetail = useCallback(async (car: CarriageVM) => {
    const [tripSeatsRes, tplSeatsRes] = await Promise.all([
      api.get(`/carriages/${car.id}/seatmap`),
      api.get(`/seat-templates/${car.seat_template_id}/seats`),
    ]);
    const tripSeats: TripSeat[] = Array.isArray(tripSeatsRes.data?.seats)
      ? tripSeatsRes.data.seats
      : [];
    const tpl = tplSeatsRes.data?.template;
    const templateSeats: TemplateSeat[] = Array.isArray(tplSeatsRes.data?.seats)
      ? tplSeatsRes.data.seats
      : [];
    const rows = Number(tpl?.meta_json?.rows || 0);
    const cols = Number(tpl?.meta_json?.cols || 0);
    const tMap = new Map(tripSeats.map((s) => [String(s.seat_code), s]));
    const mergedNorm = templateSeats
      .map((ts) => ({
        seat_code: String(ts.seat_code),
        pos_row: Number(ts.pos_row || 0),
        pos_col: Number(ts.pos_col || 0),
        seat_class: (ts.seat_class || "standard").toLowerCase(),
        base_price: Number(ts.base_price || 0),
        ...(tMap.get(String(ts.seat_code)) || {}),
      }))
      .map(normalizeSeat);

    setCarriages((prev) =>
      prev.map((x) =>
        x.id === car.id
          ? { ...x, layout: { rows, cols }, seats: mergedNorm }
          : x
      )
    );
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await loadTripHeader();
        await loadCarriages();
      } catch (e: any) {
        Alert.alert("Error", e?.response?.data?.message || "Load trip failed");
      } finally {
        setLoading(false);
      }
    })();
  }, [loadTripHeader, loadCarriages]);

  useEffect(() => {
    const car = carriages[activeIdx];
    if (!car) return;
    if (car.seats.length && car.layout.rows && car.layout.cols) return;
    (async () => {
      try {
        await loadCarriageDetail(car);
      } catch (e: any) {
        // Alert.alert(
        //   "Error",
        //   e?.response?.data?.message || "Load seatmap failed"
        // );
      }
    })();
  }, [activeIdx, carriages, loadCarriageDetail]);

  const seatByCode = useMemo(() => {
    const m = new Map<string, SeatMerged>();
    (current?.seats || []).forEach((s) => m.set(s.seat_code, s));
    return m;
  }, [current]);

  const toggleSeat = (code: string) => {
    const s = seatByCode.get(code);
    if (!s || s.sold) return;
    setPicked((prev) =>
      prev.includes(code) ? prev.filter((x) => x !== code) : [...prev, code]
    );
  };

  // ==== PREVIEW ====
  const openPreview = async () => {
    if (!picked.length) return;
    setOpenPreviewModal(true);
    setLoadingPreview(true);
    try {
      const items = picked.map((code) => ({
        seat_code: code,
        passenger_id: seatAssignments[code]?.id,
      }));
      const data = await previewOrder({ trip_id: Number(tripId), items });
      const normalized: OrderPreview = {
        trip_id: `#${data?.trip_id ?? trip?.id ?? ""}`,
        trip_name: routeInfo
          ? `${routeInfo.origin} → ${routeInfo.destination}`
          : trip
          ? `Route #${trip.route_id}`
          : "N/A",
        departure_time: trip?.departure_time ?? "N/A",
        seats: (data?.items ?? []).map((it: any) => ({
          seat_code: it.seat_code,
          price: it.price,
          passenger_id: it.passenger_id,
          passenger_name: it.passenger_name,
        })),
        total: data?.total_amount,
      };
      setPreview(normalized);
    } catch (e: any) {
      setPreview(null);
      Alert.alert(
        "Preview failed",
        e?.response?.data?.detail ||
          e?.response?.data?.message ||
          "Cannot preview order"
      );
    } finally {
      setLoadingPreview(false);
    }
  };

  // ==== PAYMENT ====
  const startPayment = async (
    itemsWithPassenger: Array<{
      trip_id: number;
      seat_code: string;
      passenger_id: number;
    }>
  ) => {
    console.log("Start payment 1");
    try {
      // 1) Tạo order pending
      const created = await createOrder({
        user_id: Number(user?.id), // TODO: lấy từ auth context
        items: itemsWithPassenger,
      });
      console.log("order id", created.order_id);
      setOrderId(created.order_id);

      // 2) PayPal create
      const { approval_url, paypal_order_id } = await paypalCreate({
        order_id: created.order_id,
        return_url: "https://example.com/return",
        cancel_url: "https://example.com/cancel",
      });
      setPaypalOrderId(paypal_order_id);
      console.log("paypalCreate");
      setApprovalUrl(approval_url);
      setWebVisible(true);
    } catch (e: any) {
      console.log("error", e);
      Alert.alert(
        "Payment error",
        e?.response?.data?.message || e?.message || "Create payment failed"
      );
    }
  };

  const onNavChange = async (navState: any) => {
    const url: string = navState.url || "";
    if (!paypalOrderId || !orderId) return;

    // Tùy back-end config return_url/cancel_url mà bắt pattern tương ứng
    if (url.includes("example.com/return")) {
      try {
        console.log({ order_id: orderId, paypal_order_id: paypalOrderId });
        await paypalCapture({
          order_id: orderId,
          paypal_order_id: paypalOrderId,
        });
        setWebVisible(false);
        router.replace("/booking/paymentsuccess");

        // TODO: điều hướng sang My Tickets hoặc đâu đó
      } catch (e: any) {
        const msg =
          e?.response?.data?.detail || e?.response?.data?.message || e?.message;
        Alert.alert("Lỗi hậu thanh toán", msg);
        console.log("error:", e);
      }
    } else if (url.includes("example.com/cancel")) {
      setWebVisible(false);
      Alert.alert("Cancelled", "Bạn đã huỷ thanh toán PayPal");
    }
  };

  const total = picked.reduce(
    (sum, code) => sum + Number(seatByCode.get(code)?.price ?? 10),
    0
  );

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
        <Text style={{ marginTop: 8, color: theme.sub }}>Loading…</Text>
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
          onPress={() => router.replace("/")}
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
            {trip.vehicle_no} •{" "}
            {routeInfo
              ? `${routeInfo.origin} → ${routeInfo.destination}`
              : `Route #${trip.route_id}`}
          </Text>
          <Text style={{ color: theme.sub }}>
            {hhmm(trip.departure_time)} — {hhmm(trip.arrival_time)} •{" "}
            {/* {trip.status} */}
          </Text>
        </View>
      )}

      {/* Tabs toa */}
      <View
        style={{
          paddingHorizontal: 6,
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
          height: "10%",
        }}
      >
        {(carriages || []).map((c, i) => {
          const active = i === activeIdx;
          return (
            <Pressable
              key={c.id}
              onPress={() => {
                setActiveIdx(i);
                setPicked([]);
              }}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 14,
                borderRadius: 12,
                backgroundColor: active ? theme.green : theme.rail,
                width: "30%",
                height: "70%",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: active ? theme.white : theme.text,
                  fontWeight: "700",
                  fontSize: 12,
                  textAlign: "center",
                }}
              >
                {c.name || `Coach ${c.carriage_no ?? i + 1}`}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Cabin + seats */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingVertical: 12, alignItems: "center" }}
      >
        <CabinBoxFixed>
          <CabinHead />
          <View
            style={{ paddingHorizontal: 14, paddingBottom: 16, paddingTop: 8 }}
          >
            {current ? (
              <SeatGridFixed
                rows={current.layout.rows}
                cols={current.layout.cols}
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

      {/* Bottom bar */}
      {!user ? (
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
          <Text style={{ textAlign: "center" }}>
            Please login to booking your ticket
          </Text>
        </View>
      ) : (
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

          <View style={{ gap: 10 }}>
            <Pressable
              disabled={!picked.length}
              onPress={openPreview}
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
                {picked.length
                  ? `Preview • ${total.toFixed(0)} VND`
                  : "Preview"}
              </Text>
            </Pressable>
          </View>

          <PreviewOrderModal
            visible={openPreviewModal}
            onCloseModal={() => setOpenPreviewModal(false)}
            loading={loadingPreview}
            order={preview}
            title="Preview order"
            onConfirm={(assigns) => {
              setSeatAssignments(assigns);
              const missing = picked.filter((code) => !assigns[code]?.id);
              if (missing.length) {
                Alert.alert(
                  "Thiếu hành khách",
                  `Vui lòng chọn hành khách cho ghế: ${missing.join(", ")}`
                );
                return;
              }
              const items = picked.map((code) => ({
                trip_id: Number(tripId),
                seat_code: code,
                passenger_id: assigns[code]!.id,
              }));
              setOpenPreviewModal(false);
              startPayment(items);
            }}
          />
        </View>
      )}

      {/* WebView PayPal */}
      {webVisible && approvalUrl ? (
        <View
          style={{ position: "absolute", inset: 0, backgroundColor: "#fff" }}
        >
          <WebView
            source={{ uri: approvalUrl }}
            onNavigationStateChange={onNavChange}
            startInLoadingState
            renderLoading={() => (
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#fff",
                }}
              >
                <ActivityIndicator size="large" color={theme.green} />
                <Text style={{ marginTop: 8, color: theme.sub }}>
                  Đang mở PayPal…
                </Text>
              </View>
            )}
          />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

// ---------- Pieces ----------
function CabinBoxFixed({ children }: { children: React.ReactNode }) {
  const { width } = useWindowDimensions();
  const cabinWidth = Math.min(width * 0.7, 360);
  return (
    <View
      style={{
        width: cabinWidth,
        backgroundColor: theme.white,
        borderRadius: 32,
        borderWidth: 1,
        borderColor: theme.line,
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

function CabinHead() {
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
      <View
        style={{
          flexDirection: "row",
          gap: 16,
          marginTop: 12,
          justifyContent: "center",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <View style={{ height: 12, width: 12, backgroundColor: "#fde68a" }} />
          <Text>VIP</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <View style={{ height: 12, width: 12, backgroundColor: "#bbf7d0" }} />
          <Text>Thường</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <View
            style={{
              height: 12,
              width: 12,
              backgroundColor: theme.seatSoldBorder,
            }}
          />
          <Text>Đã bán</Text>
        </View>
      </View>
    </View>
  );
}

function SeatGridFixed({
  rows,
  cols,
  seats,
  selected,
  onToggle,
}: {
  rows: number;
  cols: number;
  seats: SeatMerged[];
  selected: string[];
  onToggle: (code: string) => void;
}) {
  const { width } = useWindowDimensions();
  const cabinWidth = Math.min(width * 0.7, 360);
  const gap = 8;
  const seatSize =
    cols > 0 ? Math.floor((cabinWidth - gap * (cols + 1)) / cols) : 40;

  const byKey = useMemo(() => {
    const m = new Map<string, SeatMerged>();
    for (const s of seats)
      if (s.row >= 1 && s.col >= 1) m.set(`${s.row}-${s.col}`, s);
    return m;
  }, [seats]);

  if (!rows || !cols) {
    return (
      <View>
        <ActivityIndicator size="large" color={theme.green} />
        <Text style={{ marginTop: 8, color: theme.sub, textAlign: "center" }}>
          Loading…
        </Text>
      </View>
    );
  }

  const grid: JSX.Element[] = [];
  for (let r = 1; r <= rows; r++) {
    const line: JSX.Element[] = [];
    for (let c = 1; c <= cols; c++) {
      const seat = byKey.get(`${r}-${c}`);
      if (!seat) {
        line.push(
          <View
            key={`${r}-${c}`}
            style={{
              width: seatSize,
              height: seatSize,
              marginHorizontal: gap / 2,
              marginVertical: gap / 2,
              borderRadius: 6,
              borderWidth: 1,
              borderStyle: "dashed",
              borderColor: "#d4d4d8",
            }}
          />
        );
        continue;
      }
      const isSel = selected.includes(seat.seat_code);
      const sold = seat.sold;
      line.push(
        <Pressable
          key={`${r}-${c}`}
          onPress={() => !sold && onToggle(seat.seat_code)}
          disabled={sold}
          style={{
            width: seatSize,
            height: seatSize,
            marginHorizontal: gap / 2,
            marginVertical: gap / 2,
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: sold
              ? theme.seatSoldBg
              : isSel
              ? theme.green
              : seat.class === "vip"
              ? "#fde68a"
              : "#bbf7d0",
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
            {seat.seat_code}
          </Text>
        </Pressable>
      );
    }
    grid.push(
      <View key={r} style={{ flexDirection: "row", justifyContent: "center" }}>
        {line}
      </View>
    );
  }

  return <View style={{ alignItems: "center" }}>{grid}</View>;
}
