import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Ticket {
  id: string;
  passenger: string;
  phone: string;
  seats: string;
  trip: string;
  createdAt: string;
}

interface TicketState {
  list: Ticket[];
}

const initialState: TicketState = {
  list: [],
};

const ticketSlice = createSlice({
  name: "tickets",
  initialState,
  reducers: {
    addTicket: (state, action: PayloadAction<Ticket>) => {
      state.list.push(action.payload);
    },
    removeTicket: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter((t) => t.id !== action.payload);
    },
    clearTickets: (state) => {
      state.list = [];
    },
  },
});

export const { addTicket, removeTicket, clearTickets } = ticketSlice.actions;
export default ticketSlice.reducer;
