import { api } from "./api";

export const getMyTickets = async (
  status: "all" | "valid" | "used" | "refunded" = "all"
) => {
  const { data } = await api.get(`/get-my/ticket`, { params: { status } });
  return Array.isArray(data?.items) ? data.items : [];
};

export const getTicketDetail = async (id: string) => {
  const { data } = await api.get(`/tickets/${id}`);
  return data?.detail;
};
