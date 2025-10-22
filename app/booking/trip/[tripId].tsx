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
import { api } from "../../../src/services/api";
import { previewOrder } from "@/src/services/bookingApi";
import PreviewOrderModal, {
  OrderPreview,
} from "./components/PreviewOrderModal";
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

// ---------------- helpers (port từ admin) ----------------
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

// ---------------- screen ----------------
export default function SelectSeatScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [trip, setTrip] = useState<any>("");
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [carriages, setCarriages] = useState<CarriageVM[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [preview, setPreview] = useState<OrderPreview | null>(null);

  const current = carriages[activeIdx];

  // 1) fetch trip + route for header
  const loadTripHeader = useCallback(async () => {
    const { data } = await api.get(`/trips/${Number(tripId)}`);
    const t: Trip = data?.trip || data; // tuỳ backend
    setTrip(t);

    try {
      if (t?.route_id) {
        const { data: r } = await api.get(`/routes/${t.route_id}`);
        setRouteInfo(r?.route || r);
      }
    } catch {
      // route optional
    }
  }, [tripId]);

  // 2) fetch carriages by trip
  const loadCarriages = useCallback(async () => {
    const { data } = await api.get(
      `/carriages/trips/${Number(tripId)}/carriages`
    );
    const list = Array.isArray(data?.carriages) ? data.carriages : data || [];
    // tạm set layout rỗng, sẽ fill sau khi merge
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

  // 3) load per-carriage (trip seats + template seats), then merge
  const loadCarriageDetail = useCallback(async (car: CarriageVM) => {
    const [tripSeatsRes, tplSeatsRes] = await Promise.all([
      api.get(`/carriages/${car.id}/seatmap`), // { seats: TripSeat[] }
      api.get(`/seat-templates/${car.seat_template_id}/seats`), // { template, seats: TemplateSeat[] }
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

    // map trip seats theo seat_code
    const tMap = new Map(tripSeats.map((s) => [String(s.seat_code), s]));
    const mergedRaw = templateSeats.map((ts) => {
      const tsNorm = {
        seat_code: String(ts.seat_code),
        pos_row: Number(ts.pos_row || 0),
        pos_col: Number(ts.pos_col || 0),
        seat_class: (ts.seat_class || "standard").toLowerCase(),
        base_price: Number(ts.base_price || 0),
      };
      const t = tMap.get(tsNorm.seat_code) || {};
      return {
        seat_code: tsNorm.seat_code,
        pos_row: tsNorm.pos_row,
        pos_col: tsNorm.pos_col,
        seat_class: tsNorm.seat_class,
        base_price: tsNorm.base_price,
        sold: t.sold,
        status: t.status ?? (t as any).state ?? (t as any).seat_status,
        status_id: (t as any)?.status_id,
        order_item_id: t.order_item_id,
        sold_at: t.sold_at,
        class: (t as any)?.class,
        price: (t as any)?.price,
      };
    });

    const mergedNorm = mergedRaw.map(normalizeSeat);

    setCarriages((prev) =>
      prev.map((x) =>
        x.id === car.id
          ? { ...x, layout: { rows, cols }, seats: mergedNorm }
          : x
      )
    );
  }, []);

  // boot
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
  // }, [loadCarriages]);

  // lazy-load chi tiết toa khi đổi tab/toa
  useEffect(() => {
    const car = carriages[activeIdx];
    if (!car) return;
    if (car.seats.length && car.layout.rows && car.layout.cols) return; // đã có
    (async () => {
      try {
        await loadCarriageDetail(car);
      } catch (e: any) {
        Alert.alert(
          "Error",
          e?.response?.data?.message || "Load seatmap failed"
        );
      }
    })();
  }, [activeIdx, carriages, loadCarriageDetail]);

  const openPreview = async () => {
    setOpenModal(true);
    setLoadingPreview(true);
    try {
      const items = picked.map((code) => ({
        seat_code: code,
        passenger_id: 2,
      }));
      const data = await previewOrder({ trip_id: Number(tripId), items });
      // Chuẩn hóa về OrderPreview
      const normalized: OrderPreview = {
        trip_id: `#${data?.trip_id}`,
        trip_name: `${routeInfo?.origin}->${routeInfo?.destination}` || "N/A",
        departure_time: data?.departure_time || "N/A",
        seats: (data?.items ?? []).map((it: any) => ({
          seat_code: it.seat_code,
          price: it.price,
          passenger_name: it?.passenger_name || "Nguyen Quoc Anh",
        })),
        // subtotal: data?.subtotal ?? data?.total_without_fee,
        // fee: data?.fee ?? 0,
        total: data?.total_amount,
      };
      setPreview(normalized);
    } catch (e) {
      console.log("preview error", e);
      setPreview(null);
    } finally {
      setLoadingPreview(false);
    }
  };

  // const confirmOrder = async () => {
  //   // Gọi API create order… rồi đóng modal
  //   setOpen(false);
  // };

  const onConfirm = async () => {
    try {
      const items = picked.map((code) => ({
        seat_code: code,
        //passenger_id: <coming soon>
      }));
      const res = await previewOrder({
        trip_id: Number(tripId),
        items,
      });

      Alert.alert(
        "Preview order",
        `Trip #${res.trip_id}\nSeats: ${items
          .map((i) => i.seat_code)
          .join(", ")}\nTotal: $${Number(res.total_amount).toFixed(2)}`
      );
      console.log(
        "Preview order",
        `Trip #${res.trip_id}\nSeats: ${items
          .map((i) => i.seat_code)
          .join(", ")}\nTotal: $${Number(res.total_amount).toFixed(2)}`
      );
    } catch (e: any) {
      console.log(
        "error previewing order:",
        e?.response?.data?.detail || e?.response?.data?.message || e?.message
      );
      Alert.alert(
        "Preview failed",
        e?.response?.data?.detail ||
          e?.response?.data?.message ||
          "Cannot preview order"
      );
    }
  };
  // chọn ghế
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
            {trip.status}
          </Text>
        </View>
      )}

      {/* Tabs toa */}
      <View
        // showsHorizontalScrollIndicator={false}
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
                width: "20%",
                height: "50%",
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
          onPress={() => {
            openPreview();
            // setModalVisible(true);
            Alert.alert(
              "Confirm",
              `Pay $${total.toFixed(2)} for ${picked.length} seats`
            );
          }}
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
        <PreviewOrderModal
          visible={openModal}
          onCloseModal={() => setOpenModal(false)}
          onConfirm={() => console.log("confirm")}
          order={preview}
          loading={loadingPreview}
          title="Preview order"
        />
      </View>
    </SafeAreaView>
  );
}

// ---------- Pieces ----------
function CabinBoxFixed({ children }: { children: React.ReactNode }) {
  const { width } = useWindowDimensions();
  const cabinWidth = Math.min(width * 0.7, 360); // 70% màn, tối đa 360
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
      <Text style={{ color: theme.sub, textAlign: "center" }}>
        Template layout (rows/cols) not set
      </Text>
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

  return (
    <View style={{ alignItems: "center" }}>
      <Text style={{ color: "#98A2B3", fontSize: 12, marginBottom: 6 }}>
        seats={seats.length} • layout={rows}x{cols}
      </Text>
      {grid}
    </View>
  );
}
