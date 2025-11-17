import { api } from "./api";

export type Trip = {
  id: number;
  route_id: number;
  departure_time: string;
  arrival_time: string;
  vehicle_no: string;
  status: string;
  route?: { id: number; origin: string; destination: string };
  carriages_count?: number;
  min_price?: number | null;
  availability?: { available: number; sold: number };
};

const pickArray = (d: any) =>
  Array.isArray(d?.items)
    ? d.items
    : Array.isArray(d?.rows)
    ? d.rows
    : Array.isArray(d)
    ? d
    : [];

export const getRoutes = async () => {
  const { data } = await api.get("/routes");
  // console.log("[/routes]", data);
  return pickArray(data);
};

export const getRouteByOriginDestination = async (
  origin: string,
  destination: string
) => {
  const { data } = await api.get("/routes/one", {
    params: { origin, destination },
  });
  return data?.route || null;
};
export const getRouteIdByOriginDestination = async (
  origin: string,
  destination: string
) => {
  const { data } = await api.get("/routes/one", {
    params: { origin, destination },
  });

  return data?.route.id || null;
};

export const getRouteById = async (id: number) => {
  const { data } = await api.get("/routes/" + id);
  return data?.route || null;
};

export const getTripsByDate = async (routeId: number, dateISO: string) => {
  const { data } = await api.get("/trips/list", {
    params: {
      route_id: routeId,
      date: dateISO,
      status: "scheduled",
      limit: 50,
      offset: 0,
    },
  });
  // console.log("[/trips raw]", data);

  const list = pickArray(data.rows);

  return list;
};
export const getCarriages = async (tripId: number) => {
  const { data } = await api.get(`carriages/trips/${tripId}/carriages`);
  return data?.carriages ?? data ?? [];
};

export const getSeatMapByCarriage = async (carriageId: number) => {
  const { data } = await api.get(`/carriages/${carriageId}/seatmap`);

  // chấp nhận mọi kiểu backend có thể trả: {layout, seats} hoặc {template:{meta_json}, tripSeats:[]}
  let layout = data?.layout ?? data?.template?.meta_json ?? data?.meta_json;
  const seatsRaw = data?.seats ?? data?.tripSeats ?? data?.items ?? data?.data;

  // Nếu layout là string JSON -> parse
  if (typeof layout === "string") {
    try {
      layout = JSON.parse(layout);
    } catch {}
  }

  // fallback: nếu layout thiếu rows/cols, suy ra từ seats
  let seats: Array<{
    seat_code: string;
    status?: string;
    order_item_id?: number;
    price?: number;
  }> = [];
  if (Array.isArray(seatsRaw)) {
    seats = seatsRaw
      .map((s: any) => ({
        seat_code: s.seat_code || s.code || s.label,
        status: s.status || (s.order_item_id ? "sold" : "available"),
        order_item_id: s.order_item_id ?? null,
        price: s.price ?? s.base_price ?? undefined,
      }))
      .filter((x) => !!x.seat_code);
  }

  // Nếu rows/cols chưa có, suy ra từ seat_code (1A..20F)
  if (!layout || !layout.rows || !layout.cols) {
    let maxRow = 0,
      maxCol = 0;
    for (const s of seats) {
      const m = String(s.seat_code).match(/^(\d+)([A-Z])$/i);
      if (m) {
        maxRow = Math.max(maxRow, Number(m[1]));
        maxCol = Math.max(maxCol, m[2].toUpperCase().charCodeAt(0) - 64);
      }
    }
    layout = {
      rows: maxRow || 0,
      cols: maxCol || 0,
      blocks: [], // không block gì nếu backend không cung cấp
    };
  }

  return { layout, seats };
};

/** Preview order — phải là POST (GET không có body) */
export const previewOrder = async (payload: {
  trip_id: number;
  items: Array<{ seat_code: string; passenger_id?: number }>;
}) => {
  const { data } = await api.post("/orders/preview", payload);
  return data; // { trip_id, items:[{seat_code, price, ...}], total_amount, ... }
};

/** Create order (pending) */
export const createOrder = async (payload: {
  user_id: number;
  items: Array<{ trip_id: number; seat_code: string; passenger_id?: number }>;
}) => {
  const { data } = await api.post("/orders", payload);
  return data; // { order_id, total_amount, items: [...] }
};

/** PayPal: create (lấy approval_url, paypal_order_id) */
export const paypalCreate = async (payload: {
  order_id: number;
  return_url: string;
  cancel_url: string;
}) => {
  const { data } = await api.post("/payments/paypal/create-order", payload);
  return data; // { approval_url, paypal_order_id }
};

/** PayPal: capture (khi user đã approve) */
export const paypalCapture = async (payload: {
  order_id: number;
  paypal_order_id: string;
}) => {
  const { data } = await api.post("/payments/paypal/capture", payload);
  console.log("capture: ", data);
  return data; // { message: 'captured', ... }
};

export async function getTripSeatMapClient(tripId: number) {
  const res = await api.get(`/client/trips/${tripId}/seatmap`);
  // Một số backend bọc { data: {...} } hoặc { success, data }
  const d = res?.data;
  const seatmap = (d?.carriages && d) || (d?.data?.carriages && d.data) || d; // fallback
  return seatmap;
}
