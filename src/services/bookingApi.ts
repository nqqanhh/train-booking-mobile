import { api } from "./api";

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
  console.log("[/routes]", data);
  return pickArray(data);
};

export const getTripsByDate = async (route_id: number, dateISO: string) => {
  const { data } = await api.get("/trips", { params: { route_id } });
  console.log("[/trips raw]", data); // <-- xem shape thực tế

  const list = pickArray(data.trips);

  // Lọc theo route + ngày bằng cách cắt 10 ký tự đầu (YYYY-MM-DD)
  const filtered = list.filter(
    (t: any) =>
      Number(t?.route_id) === Number(route_id) &&
      String(t?.departure_time || "").slice(0, 10) === dateISO
  );

  console.log("[/trips filtered]", {
    route_id,
    dateISO,
    total: list.length,
    kept: filtered.length,
    sample: filtered[0],
  });

  return filtered;
};
export const getCarriages = async (tripId: number) => {
  const { data } = await api.get(`carriages/trips/${tripId}/carriages`);
  return data?.items ?? data ?? [];
};

export const getSeatMapByCarriage = async (carriageId: number) => {
  const { data } = await api.get(`/carriages/${carriageId}/seats`);
  return data?.items ?? data ?? [];
};

//

export const createOrder = async (payload: {
  user_id: number;
  items: Array<{
    trip_idd: number;
    seat_code: string;
    price: number;
    passenger_id?: number;
  }>;
}) => {
  const { data } = await api.post("/orders", payload);
  return data;
};

export const paypalCreate = async (payload: {
  order_id: number;
  return_url: string;
  cancel_url: string;
}) => {
  const { data } = await api.post("/payments/paypal/create", payload);
  return data;
};

export const paypalCapture = async (payload: {
  order_id: number;
  paypal_order_id: string;
}) => {
  const { data } = await api.post("payyments/paypal/capture", payload);
  return data;
};
