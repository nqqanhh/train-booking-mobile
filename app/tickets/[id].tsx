import { RootState } from "@/src/redux/store/store";
import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useSelector } from "react-redux";

export default function TicketDetailsScreen() {
  const { id } = useLocalSearchParams() as { id?: string };
  const ticket = useSelector((s: RootState) =>
    s.tickets.list.find((t) => t.id === id)
  );
  if (!ticket) {
    return (
      <View>
        <Text>Không tìm thấy vé</Text>
      </View>
    );
  }
  return (
    <View>
      <Text>Vé</Text>
      <Text>Hành khách: {ticket.passenger}</Text>
      <Text>SĐT: {ticket.phone}</Text>
      <Text>Ghế: {ticket.seats}</Text>
      <Text>Tuyến :{ticket.trip}</Text>
      <View>
        <QRCode value={JSON.stringify(ticket)} size={200} />
      </View>
    </View>
  );
}
