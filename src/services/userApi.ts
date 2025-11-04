import { api } from "./api";

export type Passenger = {
  fullName: string;
  id_no: string;
  dob: string;
  phone: string;
};

export type ChangePasswordReq = {
  oldPass: string;
  newPass: string;
};

const pickArray = (d: any) =>
  Array.isArray(d?.items)
    ? d.items
    : Array.isArray(d?.rows)
    ? d.rows
    : Array.isArray(d)
    ? d
    : [];

export const getPassengerProfiles = async () => {
  const { data } = await api.get("/passenger-profile/");
  // console.log("passengers: ", data.passengers);
  return pickArray(data.passengers);
};

export const getOnePassenger = async (id: number) => {
  const { data } = await api.get(`/passenger-profile/${id}`);
  // console.log("passenger: ", data.passenger);
  return data.passenger;
};

export const createPassengerProfile = async (payload: Passenger) => {
  const { data } = await api.post("/passenger-profile/create", payload);
  // console.log("passenger profile created: ", data);
  return data;
};

export const updatePassengerProfile = async (
  payload: Passenger,
  id: number
) => {
  const { data } = await api.post(`/passenger-profile/update/${id}`, payload);
  // console.log("updated passenger: ", data);
  return data;
};

export const changePassword = async (payload: ChangePasswordReq) => {
  const { data } = await api.patch("/profile/me/password", payload);
  // console.log("password changed!");
  return data;
};
