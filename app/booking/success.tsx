import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Button, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useDispatch } from "react-redux";
import { addTicket } from "../../redux/ticketSlice";

export default function SuccessScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { name, phone, seats, trip } = useLocalSearchParams() as {
    name?: string;
    phone?: string;
    seats?: string;
    trip?: string;
  };

  const ticket = {
    id: Date.now().toString(),
    passenger: name as string,
    phone: phone as string,
    seats: seats as string,
    trip: trip as string,
    createdAt: new Date().toISOString(),
  };

  useEffect(() => {
    dispatch(addTicket(ticket));
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 10 }}>
        🎉 Đặt vé thành công!
      </Text>
      <Text>Hành khách: {ticket.passenger}</Text>
      <Text>Ghế: {ticket.seats}</Text>
      <Text>Tuyến: {ticket.trip}</Text>

      <View style={{ marginVertical: 20 }}>
        <QRCode value={JSON.stringify(ticket)} size={180} />
      </View>

      <Button title="Về trang chủ" onPress={() => router.push("/")} />
    </View>
  );
}
