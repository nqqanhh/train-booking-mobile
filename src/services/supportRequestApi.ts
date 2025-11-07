import { api } from "./api";

export type SupportRequest = {
  id: number;
  user_id: number;
  subject: string;
  message: string;
  status: string;
  closed_at: string;
};

const pickArray = (d: any) =>
  Array.isArray(d?.items)
    ? d.items
    : Array.isArray(d?.rows)
    ? d.rows
    : Array.isArray(d)
    ? d
    : [];

export const getMyRequests = async () => {
  const { data } = await api.get("/get-my/support-requests");
  return pickArray(data.myReq);
};

export const sendSupportRequest = async (payload: {
  subject: string;
  message: string;
}) => {
  const { data } = await api.post("/support-requests", payload);
  return data;
};
